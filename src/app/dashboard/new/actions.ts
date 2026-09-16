"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface CreateManualEntryInput {
  entryDate: string;
  title: string;
  summary: string;
  skills: string[];
  lessons: string;
  screenshotUrls: string[];
}

export interface CreateManualEntryState {
  error?: string;
}

/**
 * Creates a manual (non-GitHub) timeline entry. Unlike AI-generated
 * GitHub entries, manual logs are authored directly by the user, so
 * they publish immediately - no draft review step.
 */
export async function createManualEntryAction(
  input: CreateManualEntryInput
): Promise<CreateManualEntryState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in." };
  }

  if (!input.title.trim() || !input.summary.trim() || !input.entryDate) {
    return { error: "Title, summary, and date are required." };
  }

  const { error } = await supabase.from("timeline_entries").insert({
    user_id: user.id,
    repo_id: null,
    source: "manual",
    entry_date: input.entryDate,
    title: input.title.trim(),
    summary: input.summary.trim(),
    skills: input.skills,
    lessons: input.lessons.trim() || null,
    screenshot_urls: input.screenshotUrls,
    status: "published",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/u", "layout");
  redirect("/dashboard");
}
