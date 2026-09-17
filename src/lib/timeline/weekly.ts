import type { SupabaseClient } from "@supabase/supabase-js";
import { generateWeeklyPost } from "@/lib/ai/gemini";
import { computeStreakWeeks } from "@/lib/streak";
import type { Profile } from "@/lib/types";

/** Standard ISO 8601 week label, e.g. "2026-W38". Used as the cache key for weekly_posts. */
export function isoWeekLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  const target = new Date(date.valueOf());
  const dayNr = (date.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.round((firstThursday - target.valueOf()) / (7 * 24 * 60 * 60 * 1000));
  return `${new Date(firstThursday).getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function currentWeekRange(): { startIso: string; endIso: string; label: string } {
  const now = new Date();
  const dayNr = (now.getUTCDay() + 6) % 7; // Monday = 0
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - dayNr);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const startIso = monday.toISOString().slice(0, 10);
  const endIso = sunday.toISOString().slice(0, 10);
  return { startIso, endIso, label: isoWeekLabel(startIso) };
}

export interface WeeklyPostResult {
  postText: string;
  isoWeek: string;
}

/** True when the post cites a "Week N" / ISO-week number that is not the
 * user's shipping streak - the original bug ("Week 38" vs "2-week streak"). */
function citesMismatchedCalendarWeek(text: string, streakWeeks: number): boolean {
  const iso = text.match(/\b20\d{2}-W(\d{2})\b/);
  if (iso && Number(iso[1]) !== streakWeeks) return true;
  const week = text.match(/\bWeek\s+(\d{1,2})\b/i);
  if (week && Number(week[1]) !== streakWeeks) return true;
  return false;
}

function debugLog(payload: {
  hypothesisId: string;
  location: string;
  message: string;
  data: Record<string, unknown>;
}) {
  // #region agent log
  fetch("http://127.0.0.1:7405/ingest/f606287d-102e-4a04-817c-ef891adac058", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "dfb447",
    },
    body: JSON.stringify({
      sessionId: "dfb447",
      runId: "post-fix",
      timestamp: Date.now(),
      ...payload,
    }),
  }).catch(() => {});
  // #endregion
}

/**
 * Returns this week's cached share post if one exists, otherwise
 * generates one via Gemini Flash-Lite from this week's published
 * entries and caches it. Returns null if there's nothing published
 * this week yet. Pass `force: true` to bypass the cache and regenerate.
 *
 * Cached posts that still mention a calendar week-of-year (e.g. "Week 38")
 * are treated as stale and regenerated, so a prompt-only fix cannot leave
 * the old text on the dashboard.
 */
export async function getOrGenerateWeeklyPost(params: {
  supabase: SupabaseClient;
  userId: string;
  profile: Profile;
  siteUrl: string;
  force?: boolean;
}): Promise<WeeklyPostResult | null> {
  const { supabase, userId, profile, siteUrl, force = false } = params;
  const { startIso, endIso, label } = currentWeekRange();

  const { data: allPublishedDates } = await supabase
    .from("timeline_entries")
    .select("entry_date")
    .eq("user_id", userId)
    .eq("status", "published");

  const streakWeeks = computeStreakWeeks(
    (allPublishedDates ?? []).map((e) => e.entry_date as string)
  );

  if (!force) {
    const { data: cached } = await supabase
      .from("weekly_posts")
      .select("post_text")
      .eq("user_id", userId)
      .eq("iso_week", label)
      .maybeSingle();

    if (cached) {
      const postText = cached.post_text as string;
      const stale = citesMismatchedCalendarWeek(postText, streakWeeks);
      debugLog({
        hypothesisId: "H1",
        location: "src/lib/timeline/weekly.ts:cache",
        message: "weekly post cache lookup",
        data: {
          force,
          cacheHit: true,
          stale,
          streakWeeks,
          isoWeekLabel: label,
          preview: postText.slice(0, 120),
        },
      });
      if (!stale) return { postText, isoWeek: label };
    } else {
      debugLog({
        hypothesisId: "H1",
        location: "src/lib/timeline/weekly.ts:cache",
        message: "weekly post cache lookup",
        data: { force, cacheHit: false, streakWeeks, isoWeekLabel: label },
      });
    }
  }

  const { data: entries } = await supabase
    .from("timeline_entries")
    .select("title, summary")
    .eq("user_id", userId)
    .eq("status", "published")
    .gte("entry_date", startIso)
    .lte("entry_date", endIso)
    .order("entry_date", { ascending: true });

  if (!entries || entries.length === 0) return null;

  const postText = await generateWeeklyPost({
    displayName: profile.display_name ?? profile.username,
    streakWeeks,
    entries: (entries as { title: string; summary: string }[]).map((e) => ({
      title: e.title,
      whatShipped: e.summary,
    })),
    profileUrl: `${siteUrl}/u/${profile.username}`,
  });

  debugLog({
    hypothesisId: "H2",
    location: "src/lib/timeline/weekly.ts:generate",
    message: "weekly post generated",
    data: {
      force,
      streakWeeks,
      isoWeekLabel: label,
      stillMismatched: citesMismatchedCalendarWeek(postText, streakWeeks),
      preview: postText.slice(0, 160),
    },
  });

  await supabase
    .from("weekly_posts")
    .upsert({ user_id: userId, iso_week: label, post_text: postText }, { onConflict: "user_id,iso_week" });

  return { postText, isoWeek: label };
}
