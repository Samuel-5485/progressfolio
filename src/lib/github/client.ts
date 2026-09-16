import { Octokit } from "octokit";

export function createGithubClient(accessToken: string) {
  return new Octokit({ auth: accessToken });
}

export interface GithubRepoSummary {
  githubRepoId: number;
  fullName: string;
  owner: string;
  name: string;
  isPrivate: boolean;
  defaultBranch: string;
  pushedAt: string | null;
}

/** Lists repos owned by the authenticated user (not orgs/collaborations), most recently pushed first. */
export async function listOwnerRepos(accessToken: string): Promise<GithubRepoSummary[]> {
  const octokit = createGithubClient(accessToken);
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    affiliation: "owner",
    sort: "pushed",
    per_page: 100,
  });

  return data.map((repo) => ({
    githubRepoId: repo.id,
    fullName: repo.full_name,
    owner: repo.owner.login,
    name: repo.name,
    isPrivate: repo.private,
    defaultBranch: repo.default_branch,
    pushedAt: repo.pushed_at,
  }));
}

export interface GithubCommitSummary {
  sha: string;
  message: string;
  committedAt: string;
}

/** Lists commits authored by `authorLogin` on the default branch since `sinceIso`, newest first, capped at `maxCommits`. */
export async function listCommitsSince(
  accessToken: string,
  owner: string,
  repo: string,
  authorLogin: string,
  sinceIso: string,
  maxCommits = 150
): Promise<GithubCommitSummary[]> {
  const octokit = createGithubClient(accessToken);
  const commits: GithubCommitSummary[] = [];
  let page = 1;

  while (commits.length < maxCommits) {
    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      author: authorLogin,
      since: sinceIso,
      per_page: 100,
      page,
    });

    if (data.length === 0) break;

    for (const commit of data) {
      commits.push({
        sha: commit.sha,
        message: commit.commit.message,
        committedAt: commit.commit.author?.date ?? commit.commit.committer?.date ?? sinceIso,
      });
    }

    if (data.length < 100) break;
    page += 1;
  }

  return commits.slice(0, maxCommits);
}

export interface GithubCommitDetail {
  additions: number;
  deletions: number;
  filesChanged: string[];
}

/** Fetches per-commit stats/files. One extra API call per commit - GitHub's list endpoint doesn't include stats. */
export async function getCommitDetail(
  accessToken: string,
  owner: string,
  repo: string,
  sha: string
): Promise<GithubCommitDetail> {
  const octokit = createGithubClient(accessToken);
  const { data } = await octokit.rest.repos.getCommit({ owner, repo, ref: sha });

  return {
    additions: data.stats?.additions ?? 0,
    deletions: data.stats?.deletions ?? 0,
    filesChanged: (data.files ?? []).map((f) => f.filename),
  };
}
