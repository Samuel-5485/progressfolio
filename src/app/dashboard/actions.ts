"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateDraftEntries } from "@/lib/timeline/generate";
import { getOrGenerateWeeklyPost } from "@/lib/timeline/weekly";
import { normalizeSkills } from "@/lib/skills";
import type { Profile, TrackedRepo } from "@/lib/types";
import type { SupabaseClient, User } from "@supabase/supabase-js";

async function requireUser(supabase: SupabaseClient): Promise<User> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

function parseSkills(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  // Normalize here (the source, at publish time) rather than only at
  // display time, so casing is consistent regardless of how the user
  // edited the AI-drafted skills field before hitting Publish.
  return normalizeSkills(raw.split(","));
}

/** Saves the (possibly edited) draft fields and publishes it to the public timeline. */
export async function publishEntryAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const id = formData.get("id");
  if (typeof id !== "string") return;

  await supabase
    .from("timeline_entries")
    .update({
      title: formData.get("title"),
      summary: formData.get("summary"),
      skills: parseSkills(formData.get("skills")),
      lessons: formData.get("lessons"),
      status: "published",
    })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/u", "layout");
}

/** Discards a draft entry the user doesn't want on their timeline. */
export async function discardEntryAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const id = formData.get("id");
  if (typeof id !== "string") return;

  await supabase.from("timeline_entries").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/dashboard");
}

/** Re-runs draft generation for the user's tracked repo (e.g. after a manual re-import). */
export async function regenerateEntriesAction(): Promise<void> {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const { data: repo } = await supabase
    .from("tracked_repos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<TrackedRepo>();

  if (repo) {
    await generateDraftEntries({
      supabase,
      userId: user.id,
      repoId: repo.id,
      repoFullName: repo.full_name,
    });
  }

  revalidatePath("/dashboard");
}

/** Force-regenerates this week's share post (bypassing the cache). */
export async function regenerateWeeklyPostAction(): Promise<void> {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (profile) {
    await getOrGenerateWeeklyPost({
      supabase,
      userId: user.id,
      profile,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      force: true,
    });
  }

  revalidatePath("/dashboard");
}
