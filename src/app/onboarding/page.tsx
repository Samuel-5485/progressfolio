import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listOwnerRepos } from "@/lib/github/client";
import { RepoPicker } from "./repo-picker";
import type { GithubAccount, TrackedRepo } from "@/lib/types";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  const [{ data: githubAccount }, { data: trackedRepo }, { count: rawCommitCount }] =
    await Promise.all([
      supabase
        .from("github_accounts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle<GithubAccount>(),
      supabase
        .from("tracked_repos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<TrackedRepo>(),
      supabase.from("raw_commits").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

  const repos =
    githubAccount && !trackedRepo ? await listOwnerRepos(githubAccount.access_token) : [];

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-xl font-semibold">Let&apos;s set up your timeline</h1>

      <div className="flex flex-col gap-2 rounded-xl border border-foreground/10 p-6">
        <h2 className="text-sm font-medium text-foreground/60">GitHub account</h2>
        {githubAccount ? (
          <p className="text-sm">
            Connected as <span className="font-medium">@{githubAccount.github_login}</span>
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-foreground/60">No GitHub account connected yet.</p>
            <Link
              href="/login?next=/onboarding"
              className="w-fit rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-90"
            >
              Connect GitHub
            </Link>
          </div>
        )}
      </div>

      {githubAccount && (
        <div className="flex flex-col gap-3 rounded-xl border border-foreground/10 p-6">
          <h2 className="text-sm font-medium text-foreground/60">Repo to import</h2>
          {trackedRepo ? (
            <>
              <p className="text-sm">
                Tracking <span className="font-medium">{trackedRepo.full_name}</span> -{" "}
                {rawCommitCount ?? 0} commits imported.
              </p>
              <Link href="/dashboard" className="w-fit text-sm underline underline-offset-4">
                Go to dashboard
              </Link>
            </>
          ) : (
            <RepoPicker repos={repos} />
          )}
        </div>
      )}
    </main>
  );
}
