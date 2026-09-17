import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeStreakWeeks } from "@/lib/streak";
import { normalizeSkills } from "@/lib/skills";
import type { Profile, TimelineEntry } from "@/lib/types";

const FEATURED_COUNT = 3;

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
  const featured = entries.slice(0, FEATURED_COUNT);
  const rest = entries.slice(FEATURED_COUNT);

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
        <>
          {featured.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-medium uppercase tracking-wide text-foreground/50">
                Recent highlights
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {featured.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} compact />
                ))}
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-medium uppercase tracking-wide text-foreground/50">
                Timeline
              </h2>
              <ul className="flex flex-col gap-4">
                {rest.map((entry) => (
                  <li key={entry.id}>
                    <EntryCard entry={entry} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <footer className="border-t border-foreground/10 pt-6 text-center text-xs text-foreground/40">
        Built with ProgressFolio - turn your commits into proof you ship.
      </footer>
    </main>
  );
}

function EntryCard({ entry, compact = false }: { entry: TimelineEntry; compact?: boolean }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-foreground/10 p-4">
      <span className="text-xs uppercase tracking-wide text-foreground/40">
        {entry.entry_date}
        {entry.source === "manual" && " · manual log"}
      </span>
      <h3 className="font-medium">{entry.title}</h3>
      <p className={`text-sm text-foreground/70 ${compact ? "line-clamp-3" : ""}`}>
        {entry.summary}
      </p>
      {entry.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {/* Secondary safety net: normalizeSkills() already runs at write
              time (AI generation, draft publish, manual logs), this just
              covers any older rows that predate that fix. */}
          {normalizeSkills(entry.skills).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs text-foreground/60"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
      {entry.screenshot_urls.length > 0 && (
        <div className={`grid gap-2 pt-1 ${compact ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"}`}>
          {(compact ? entry.screenshot_urls.slice(0, 1) : entry.screenshot_urls).map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt=""
              className="aspect-video w-full rounded-md object-cover"
            />
          ))}
        </div>
      )}
      {!compact && entry.lessons && (
        <p className="pt-1 text-xs text-foreground/50">💡 {entry.lessons}</p>
      )}
    </div>
  );
}
