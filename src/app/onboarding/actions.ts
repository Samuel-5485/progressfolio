"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPushWebhook } from "@/lib/github/client";
import { importRecentCommits } from "@/lib/github/import";
import { generateDraftEntries } from "@/lib/timeline/generate";
import type { GithubAccount, Profile } from "@/lib/types";
import { isPro } from "@/lib/billing/entitlements";

const FREE_PLAN_REPO_LIMIT = 1;

export interface ConnectRepoState {
  error?: string;
}

export async function connectRepoAction(
  _prevState: ConnectRepoState,
  formData: FormData
): Promise<ConnectRepoState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  const fullName = formData.get("repoFullName");
  const githubRepoId = formData.get("repoId");
  const isPrivate = formData.get("isPrivate") === "true";

  if (typeof fullName !== "string" || typeof githubRepoId !== "string" || !fullName.includes("/")) {
    return { error: "Pick a repo from the list." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const { count: existingRepoCount } = await supabase
    .from("tracked_repos")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (!isPro(profile) && (existingRepoCount ?? 0) >= FREE_PLAN_REPO_LIMIT) {
    return { error: "Free plan supports 1 connected repo. Upgrade to add more." };
  }

  const { data: githubAccount } = await supabase
    .from("github_accounts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<GithubAccount>();

  if (!githubAccount) {
    return { error: "Connect GitHub first." };
  }

  const [owner, repoName] = fullName.split("/");

  const { data: trackedRepo, error: insertError } = await supabase
    .from("tracked_repos")
    .insert({
      user_id: user.id,
      github_repo_id: Number(githubRepoId),
      full_name: fullName,
      is_private: isPrivate,
    })
    .select()
    .single();

  if (insertError || !trackedRepo) {
    return { error: insertError?.message ?? "Could not save the selected repo." };
  }

  try {
    await importRecentCommits({
      supabase,
      userId: user.id,
      repoId: trackedRepo.id,
      owner,
      repoName,
      accessToken: githubAccount.access_token,
      githubLogin: githubAccount.github_login,
    });

    await generateDraftEntries({
      supabase,
      userId: user.id,
      repoId: trackedRepo.id,
      repoFullName: fullName,
    });
  } catch (err) {
    console.error("Initial commit import/summary failed:", err);
    // Repo stays tracked - the user can retry from the dashboard later.
  }

  // Best-effort: register a push webhook for near-real-time updates. Only
  // reachable from GitHub once NEXT_PUBLIC_SITE_URL is a public https URL
  // (e.g. in production) - harmless, and skipped, on localhost.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
  if (siteUrl.startsWith("https://") && webhookSecret) {
    const webhookId = await createPushWebhook(
      githubAccount.access_token,
      owner,
      repoName,
      `${siteUrl}/api/webhooks/github`,
      webhookSecret
    );
    if (webhookId) {
      await supabase.from("tracked_repos").update({ webhook_id: webhookId }).eq("id", trackedRepo.id);
    }
  }

  await supabase.from("profiles").update({ onboarding_complete: true }).eq("id", user.id);

  redirect("/dashboard");
}
