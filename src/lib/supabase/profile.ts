import type { SupabaseClient, User } from "@supabase/supabase-js";
import { slugifyUsername, withRandomSuffix } from "@/lib/username";

const UNIQUE_VIOLATION = "23505";

/**
 * Creates a `profiles` row for a newly authenticated user if one doesn't
 * already exist. Safe to call on every login. Retries with a random
 * suffix if the derived username is already taken.
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
  githubLogin?: string | null
): Promise<void> {
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return;

  const base = slugifyUsername(githubLogin || user.email?.split("@")[0] || "builder");

  for (let attempt = 0; attempt < 5; attempt++) {
    const username = attempt === 0 ? base : withRandomSuffix(base);
    // Never fall back to the raw email here - it would end up on the public
    // profile heading. Leaving it null lets the UI fall back to @username.
    const displayName = githubLogin ?? null;

    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      username,
      display_name: displayName,
      github_login: githubLogin ?? null,
    });

    if (!error) return;
    if (error.code !== UNIQUE_VIOLATION) throw error;
    // username taken - loop and try again with a new suffix
  }

  throw new Error("Could not allocate a unique username after several attempts.");
}

/**
 * Stores/updates the GitHub access token captured during OAuth so later
 * background jobs (import, webhooks) can call the GitHub API on the
 * user's behalf. NOTE: for production, encrypt `accessToken` at the
 * application layer before persisting it.
 */
export async function upsertGithubAccount(
  supabase: SupabaseClient,
  userId: string,
  params: { githubUserId: number; githubLogin: string; accessToken: string }
): Promise<void> {
  const { error } = await supabase.from("github_accounts").upsert(
    {
      user_id: userId,
      github_user_id: params.githubUserId,
      github_login: params.githubLogin,
      access_token: params.accessToken,
      last_synced_at: new Date().toISOString(),
    },
    { onConflict: "github_user_id" }
  );
  if (error) throw error;
}
