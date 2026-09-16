import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { GithubAccount } from "@/lib/types";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  const { data: githubAccount } = await supabase
    .from("github_accounts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<GithubAccount>();

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
            <p className="text-sm text-foreground/60">
              No GitHub account connected yet.
            </p>
            <Link
              href="/login?next=/onboarding"
              className="w-fit rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-90"
            >
              Connect GitHub
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-dashed border-foreground/20 p-6 text-sm text-foreground/60">
        Repo picker and first-import are coming in the next build step.{" "}
        <Link href="/dashboard" className="underline underline-offset-4">
          Skip to dashboard for now
        </Link>
      </div>
    </main>
  );
}
