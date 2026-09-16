import type { SupabaseClient } from "@supabase/supabase-js";
import { summarizeDailyCommits } from "@/lib/ai/gemini";
import type { RawCommit } from "@/lib/types";

/** Entries older than this are created as drafts for review; entries within
 * this window auto-publish so a first-time visitor's page isn't empty. */
const AUTO_APPROVE_DAYS = 14;

export interface GenerateResult {
  created: number;
  published: number;
  drafted: number;
  failed: number;
}

/**
 * Groups a repo's not-yet-summarized raw commits by UTC day, asks Gemini
 * Flash-Lite for a write-up per day, and inserts the results as
 * `timeline_entries`. Safe to re-run - days that already have an entry
 * are skipped, so this also works as an incremental "sync" after new
 * commits land (via webhook or manual re-import).
 */
export async function generateDraftEntries(params: {
  supabase: SupabaseClient;
  userId: string;
  repoId: string;
  repoFullName: string;
}): Promise<GenerateResult> {
  const { supabase, userId, repoId, repoFullName } = params;
  const result: GenerateResult = { created: 0, published: 0, drafted: 0, failed: 0 };

  const { data: commits, error: commitsError } = await supabase
    .from("raw_commits")
    .select("*")
    .eq("repo_id", repoId)
    .order("committed_at", { ascending: true });

  if (commitsError) throw commitsError;
  if (!commits || commits.length === 0) return result;

  const { data: existingEntries, error: existingError } = await supabase
    .from("timeline_entries")
    .select("entry_date")
    .eq("repo_id", repoId);

  if (existingError) throw existingError;
  const existingDates = new Set((existingEntries ?? []).map((e) => e.entry_date as string));

  const groups = new Map<string, RawCommit[]>();
  for (const commit of commits as RawCommit[]) {
    const entryDate = commit.committed_at.slice(0, 10); // UTC date, YYYY-MM-DD
    if (existingDates.has(entryDate)) continue;
    if (!groups.has(entryDate)) groups.set(entryDate, []);
    groups.get(entryDate)!.push(commit);
  }

  const autoApproveCutoff = new Date(Date.now() - AUTO_APPROVE_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  for (const [entryDate, dayCommits] of groups) {
    try {
      const summary = await summarizeDailyCommits({
        repoName: repoFullName,
        entryDate,
        commits: dayCommits.map((c) => ({
          sha: c.sha,
          message: c.message,
          filesChanged: c.files_changed,
          additions: c.additions,
          deletions: c.deletions,
        })),
      });

      const status = entryDate >= autoApproveCutoff ? "published" : "draft";

      const { error: insertError } = await supabase.from("timeline_entries").insert({
        user_id: userId,
        repo_id: repoId,
        source: "github",
        entry_date: entryDate,
        title: summary.title,
        summary: summary.whatShipped,
        skills: summary.skills,
        lessons: summary.likelyLessons,
        status,
      });

      if (insertError) throw insertError;

      result.created += 1;
      result[status === "published" ? "published" : "drafted"] += 1;
    } catch (err) {
      console.error(`Failed to generate timeline entry for ${entryDate}:`, err);
      result.failed += 1;
    }
  }

  return result;
}
