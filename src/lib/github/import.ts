import type { SupabaseClient } from "@supabase/supabase-js";
import { getCommitDetail, listCommitsSince } from "./client";

const FREE_HISTORY_DAYS = 60;
const MAX_COMMITS_PER_IMPORT = 150;

export interface ImportResult {
  commitsFetched: number;
  commitsStored: number;
}

/**
 * Pulls recent commits for one tracked repo and stores them as
 * `raw_commits`. Does NOT call the AI or create timeline entries -
 * grouping + summarization happens in a separate step (the draft
 * inbox), so this can be re-run safely (upserts on repo_id+sha).
 */
export async function importRecentCommits(params: {
  supabase: SupabaseClient;
  userId: string;
  repoId: string;
  owner: string;
  repoName: string;
  accessToken: string;
  githubLogin: string;
  sinceDate?: Date;
}): Promise<ImportResult> {
  const { supabase, userId, repoId, owner, repoName, accessToken, githubLogin } = params;

  const since = params.sinceDate ?? new Date(Date.now() - FREE_HISTORY_DAYS * 24 * 60 * 60 * 1000);
  const sinceIso = since.toISOString();

  const commits = await listCommitsSince(
    accessToken,
    owner,
    repoName,
    githubLogin,
    sinceIso,
    MAX_COMMITS_PER_IMPORT
  );

  let stored = 0;
  for (const commit of commits) {
    const detail = await getCommitDetail(accessToken, owner, repoName, commit.sha);

    const { error } = await supabase.from("raw_commits").upsert(
      {
        user_id: userId,
        repo_id: repoId,
        sha: commit.sha,
        message: commit.message,
        committed_at: commit.committedAt,
        additions: detail.additions,
        deletions: detail.deletions,
        files_changed: detail.filesChanged,
      },
      { onConflict: "repo_id,sha" }
    );

    if (!error) stored += 1;
  }

  return { commitsFetched: commits.length, commitsStored: stored };
}
