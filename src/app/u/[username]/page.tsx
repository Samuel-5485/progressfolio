import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntryTimeline } from "@/components/entry-timeline";
import { createClient } from "@/lib/supabase/server";
import { computeStreakWeeks } from "@/lib/streak";
import { isPro } from "@/lib/billing/entitlements";
import type { Profile, TimelineEntry } from "@/lib/types";

async function getPublicProfile(username: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle<Profile>();

  if (!profile) return null;

  const { data: entries } = await supabase
    .from("timeline_entries")
    .select("*")
    .eq("user_id", profile.id)
    .eq("status", "published")
    .order("entry_date", { ascending: false })
    .returns<TimelineEntry[]>();

  return { profile, entries: entries ?? [] };
}

export async function generateMetadata({
  params,
}: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  const data = await getPublicProfile(username);

  if (!data) return { title: "Profile not found - ProgressFolio" };

  const name = data.profile.display_name ?? data.profile.username;
  return {
    title: `${name} - ProgressFolio`,
    description: data.profile.bio ?? `${name}'s living shipping timeline, built with ProgressFolio.`,
  };
}

export default async function PublicProfilePage({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  const data = await getPublicProfile(username);

  if (!data) notFound();

  const { profile, entries } = data;
  const streakWeeks = computeStreakWeeks(entries.map((e) => e.entry_date));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {profile.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.display_name ?? profile.username}
              className="h-14 w-14 rounded-full"
            />
          )}
          <div>
            <h1 className="text-2xl font-semibold">
              {profile.display_name ?? `@${profile.username}`}
            </h1>
            <p className="text-sm text-foreground/60">@{profile.username}</p>
          </div>
        </div>
        {profile.bio && <p className="text-sm text-foreground/70">{profile.bio}</p>}
        <div className="flex items-center gap-4 text-sm text-foreground/60">
          <span>🔥 {streakWeeks}-week shipping streak</span>
          {profile.github_login && (
            <a
              href={`https://github.com/${profile.github_login}`}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              @{profile.github_login} on GitHub
            </a>
          )}
        </div>
      </header>

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-foreground/20 p-6 text-center text-sm text-foreground/60">
          No public updates yet - check back soon.
        </p>
      ) : (
        <EntryTimeline
          entries={entries}
          location="u/[username]/page.tsx:timeline"
          title="Timeline"
        />
      )}

      {!isPro(profile) && (
        <footer className="border-t border-foreground/10 pt-6 text-center text-xs text-foreground/40">
          Built with ProgressFolio - turn your commits into proof you ship.
        </footer>
      )}
    </main>
  );
}
