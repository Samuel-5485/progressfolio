"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface UpdateDisplayNameState {
  error?: string;
}

const MIN_LENGTH = 2;
const MAX_LENGTH = 50;

/**
 * Updates the caller's public display name (shown as the heading on their
 * /u/[username] page). Trims whitespace and enforces a 2-50 character
 * limit. Submitting an empty value clears display_name so the public
 * profile falls back to the @username instead - it never falls back to
 * the account email.
 */
export async function updateDisplayNameAction(
  displayName: string
): Promise<UpdateDisplayNameState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in." };
  }

  const trimmed = displayName.trim();

  if (trimmed.length > 0 && (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH)) {
    return { error: `Display name must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.` };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: trimmed.length > 0 ? trimmed : null })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/u", "layout");

  return {};
}
