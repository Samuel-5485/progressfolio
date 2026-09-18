import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { EntryTimeline } from "@/components/entry-timeline";
import { DraftInbox } from "./draft-inbox";
import { regenerateEntriesAction, regenerateWeeklyPostAction } from "./actions";
import { computeStreakWeeks } from "@/lib/streak";
import { getOrGenerateWeeklyPost } from "@/lib/timeline/weekly";
import { CopyButton } from "@/components/copy-button";
import { isPro } from "@/lib/billing/entitlements";
import type { Profile, TimelineEntry } from "@/lib/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string }>;
}) {
  const { upgrade } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const { count: repoCount } = await supabase
    .from("tracked_repos")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: drafts } = await supabase
    .from("timeline_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "draft")
    .order("entry_date", { ascending: false })
    .returns<TimelineEntry[]>();

  const { data: published } = await supabase
    .from("timeline_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "published")
    .order("entry_date", { ascending: false })
    .returns<TimelineEntry[]>();

  const publishedEntries = published ?? [];
  const publishedCount = publishedEntries.length;
  const streakWeeks = computeStreakWeeks(publishedEntries.map((e) => e.entry_date));
  // display_name is only set once the user picks one in /settings - fall
  // back to their GitHub login, then their @username, but never the email.
  const greetingName = profile?.display_name ?? profile?.github_login ?? profile?.username;
  const pro = isPro(profile);

  const weeklyPost =
    profile && publishedCount > 0
      ? await getOrGenerateWeeklyPost({
          supabase,
          userId: user.id,
          profile,
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        })
      : null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            Welcome{greetingName ? `, ${greetingName}` : ""}
            {pro && (
              <span className="rounded-md border border-accent px-2 py-0.5 text-xs font-medium text-accent">
                Pro
              </span>
            )}
          </h1>
          {profile?.username && (
            <p className="text-sm text-foreground/60">
              Public page:{" "}
              <Link href={`/u/${profile.username}`} className="underline underline-offset-4">
                /u/{profile.username}
              </Link>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/new"
            className="rounded-full border border-foreground/20 px-4 py-1.5 text-sm font-medium transition hover:bg-foreground/5"
          >
            + Log manual work
          </Link>
          <Link
            href="/settings"
            className="rounded-full border border-foreground/20 px-4 py-1.5 text-sm font-medium transition hover:bg-foreground/5"
          >
            Settings
          </Link>
          {pro && (
            <a
              href="/portal"
              className="cursor-pointer rounded-full border border-foreground/20 px-4 py-1.5 text-sm font-medium transition hover:bg-foreground/5"
            >
              Manage billing
            </a>
          )}
          <SignOutButton />
        </div>
      </header>

      {upgrade === "success" && (
        <p className="rounded-md border border-accent bg-elevated px-4 py-3 text-sm text-muted">
          {pro
            ? "You're on Pro. Billing is managed in Polar."
            : "Checkout complete. Pro unlocks as soon as Polar confirms the subscription."}
        </p>
      )}

      {!repoCount ? (
        <div className="flex flex-col gap-3 rounded-xl border border-foreground/10 p-6">
          <h2 className="font-medium">Connect a repo to get started</h2>
          <p className="text-sm text-foreground/60">
            Pick one GitHub repo and ProgressFolio will turn your recent
            commits into your first timeline entries.
          </p>
          <Link
            href="/onboarding"
            className="w-fit rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            Finish onboarding
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-xl border border-foreground/10 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-medium">Streak: {streakWeeks} weeks</h2>
            <p className="text-sm text-foreground/60">{publishedCount} published entries.</p>
          </div>
          <form action={regenerateEntriesAction}>
            <button
              type="submit"
              className="rounded-full border border-foreground/20 px-4 py-1.5 text-sm font-medium transition hover:bg-foreground/5"
            >
              Sync now
            </button>
          </form>
        </div>
      )}

      {weeklyPost && (
        <div className="flex flex-col gap-3 rounded-xl border border-foreground/10 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">This week&apos;s share post</h2>
            <form action={regenerateWeeklyPostAction}>
              <button
                type="submit"
                className="text-xs text-foreground/50 underline underline-offset-4"
              >
                Regenerate
              </button>
            </form>
          </div>
          <p className="whitespace-pre-wrap rounded-lg bg-foreground/5 p-4 text-sm">
            {weeklyPost.postText}
          </p>
          <CopyButton text={weeklyPost.postText} />
        </div>
      )}

      {publishedEntries.length > 0 && (
        <EntryTimeline
          entries={publishedEntries}
          location="dashboard/page.tsx:published"
          title="Recent published"
        />
      )}

      <DraftInbox drafts={drafts ?? []} />
    </main>
  );
}
