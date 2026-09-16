import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { importRecentCommits } from "@/lib/github/import";
import { generateDraftEntries } from "@/lib/timeline/generate";
import type { GithubAccount, TrackedRepo } from "@/lib/types";

function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;

  const expected = `sha256=${crypto.createHmac("sha256", secret).update(payload).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

interface GithubPushPayload {
  repository: { id: number; full_name: string; name: string; owner: { login: string } };
}

/**
 * Receives GitHub `push` webhook deliveries (registered during
 * onboarding via createPushWebhook) and incrementally syncs new
 * commits + regenerates timeline entries. Uses the service-role client
 * since there's no end-user session on an incoming webhook request.
 */
export async function POST(request: Request) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const payloadText = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifySignature(payloadText, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = request.headers.get("x-github-event");
  if (event !== "push") {
    return NextResponse.json({ ok: true, skipped: event });
  }

  const payload = JSON.parse(payloadText) as GithubPushPayload;
  const supabase = createServiceRoleClient();

  const { data: trackedRepo } = await supabase
    .from("tracked_repos")
    .select("*")
    .eq("github_repo_id", payload.repository.id)
    .maybeSingle<TrackedRepo>();

  if (!trackedRepo) {
    return NextResponse.json({ ok: true, skipped: "repo not tracked" });
  }

  const { data: githubAccount } = await supabase
    .from("github_accounts")
    .select("*")
    .eq("user_id", trackedRepo.user_id)
    .maybeSingle<GithubAccount>();

  if (!githubAccount) {
    return NextResponse.json({ ok: true, skipped: "no github account" });
  }

  try {
    // Regenerate today's entry so later same-day pushes get folded in.
    // Known MVP limitation: if today's entry already auto-published,
    // we leave it alone rather than risk clobbering something the user
    // may have already seen/edited.
    const today = new Date().toISOString().slice(0, 10);
    await supabase
      .from("timeline_entries")
      .delete()
      .eq("repo_id", trackedRepo.id)
      .eq("entry_date", today)
      .eq("status", "draft");

    await importRecentCommits({
      supabase,
      userId: trackedRepo.user_id,
      repoId: trackedRepo.id,
      owner: payload.repository.owner.login,
      repoName: payload.repository.name,
      accessToken: githubAccount.access_token,
      githubLogin: githubAccount.github_login,
      sinceDate: githubAccount.last_synced_at ? new Date(githubAccount.last_synced_at) : undefined,
    });

    await generateDraftEntries({
      supabase,
      userId: trackedRepo.user_id,
      repoId: trackedRepo.id,
      repoFullName: trackedRepo.full_name,
    });

    await supabase
      .from("github_accounts")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("user_id", trackedRepo.user_id);
  } catch (err) {
    console.error("Webhook sync failed:", err);
    return NextResponse.json({ error: "sync failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
