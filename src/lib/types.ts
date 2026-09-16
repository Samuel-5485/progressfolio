// Mirrors supabase/schema.sql. Keep these in sync when the schema changes.

export type Plan = "free" | "paid";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  github_login: string | null;
  streak_weeks: number;
  plan: Plan;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface GithubAccount {
  id: string;
  user_id: string;
  github_user_id: number;
  github_login: string;
  access_token: string;
  last_synced_at: string | null;
  created_at: string;
}

export interface TrackedRepo {
  id: string;
  user_id: string;
  github_repo_id: number;
  full_name: string;
  is_private: boolean;
  webhook_id: number | null;
  created_at: string;
}

export interface RawCommit {
  id: string;
  user_id: string;
  repo_id: string;
  sha: string;
  message: string;
  committed_at: string;
  additions: number;
  deletions: number;
  files_changed: string[];
  created_at: string;
}

export type EntrySource = "github" | "manual";
export type EntryStatus = "draft" | "published";

export interface TimelineEntry {
  id: string;
  user_id: string;
  repo_id: string | null;
  source: EntrySource;
  entry_date: string;
  title: string;
  summary: string;
  skills: string[];
  lessons: string | null;
  screenshot_urls: string[];
  status: EntryStatus;
  created_at: string;
  updated_at: string;
}

export interface WeeklyPost {
  id: string;
  user_id: string;
  iso_week: string;
  post_text: string;
  created_at: string;
}
