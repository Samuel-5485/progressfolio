import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile, upsertGithubAccount } from "@/lib/supabase/profile";

/**
 * Handles both the GitHub OAuth redirect and the email magic-link
 * redirect. Exchanges the auth code for a session, makes sure a
 * `profiles` row exists, and (for GitHub) stores the provider token so
 * later repo-import jobs can call the GitHub API.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const next = rawNext && rawNext.startsWith("/") ? rawNext : "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const { session } = data;
  const githubIdentity = session.user.identities?.find(
    (identity) => identity.provider === "github"
  );
  const githubLogin = (githubIdentity?.identity_data?.user_name as string | undefined) ?? null;

  try {
    await ensureProfile(supabase, session.user, githubLogin);

    if (githubIdentity && session.provider_token) {
      const githubUserId = Number(githubIdentity.identity_data?.provider_id ?? githubIdentity.id);
      if (Number.isFinite(githubUserId) && githubLogin) {
        await upsertGithubAccount(supabase, session.user.id, {
          githubUserId,
          githubLogin,
          accessToken: session.provider_token,
        });
      }
    }
  } catch (err) {
    console.error("Post-login setup failed:", err);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // Respect a load balancer / reverse proxy in front of the app in prod.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  if (!isLocalEnv && forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`);
  }
  return NextResponse.redirect(`${origin}${next}`);
}
