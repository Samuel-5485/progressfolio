import type { SupabaseClient } from "@supabase/supabase-js";
import { generateWeeklyPost } from "@/lib/ai/gemini";
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

/**
 * Returns this week's cached share post if one exists, otherwise
 * generates one via Gemini Flash-Lite from this week's published
 * entries and caches it. Returns null if there's nothing published
 * this week yet. Pass `force: true` to bypass the cache and regenerate.
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

  if (!force) {
    const { data: cached } = await supabase
      .from("weekly_posts")
      .select("post_text")
      .eq("user_id", userId)
      .eq("iso_week", label)
      .maybeSingle();

    if (cached) return { postText: cached.post_text as string, isoWeek: label };
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
    weekLabel: label,
    entries: (entries as { title: string; summary: string }[]).map((e) => ({
      title: e.title,
      whatShipped: e.summary,
    })),
    profileUrl: `${siteUrl}/u/${profile.username}`,
  });

  await supabase
    .from("weekly_posts")
    .upsert({ user_id: userId, iso_week: label, post_text: postText }, { onConflict: "user_id,iso_week" });

  return { postText, isoWeek: label };
}
