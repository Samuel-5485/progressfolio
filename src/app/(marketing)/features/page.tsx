import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features - ProgressFolio",
  description:
    "How ProgressFolio turns your GitHub activity into a living, public portfolio - automatically.",
};

const detailSections = [
  {
    title: "Auto-import from GitHub",
    body: "Connect with GitHub OAuth and pick a repo. ProgressFolio pulls your commit history and keeps syncing as you push - via a webhook in production, or a manual \u201cSync now\u201d from your dashboard any time. It only reads commit messages, diffs, and repo metadata, and respects whether a repo is public or private.",
  },
  {
    title: "AI rewrite",
    body: "Raw commit messages and diffs aren't a portfolio. Each meaningful chunk of work gets rewritten into a short entry with three parts: what shipped, skills demonstrated (auto-tagged - things like \u201cJavaScript,\u201d \u201cCSS3,\u201d \u201cWeb Analytics\u201d), and a likely lesson learned, inferred from the shape of the diff. Nothing goes public until you've reviewed it - edit or discard anything before it's on your page.",
  },
  {
    title: "Living public page",
    body: "Your page lives at a clean URL - yourdomain.com/u/username - and updates itself as you keep working. It shows a weekly shipping streak, your most recent highlights, and the full chronological timeline underneath. Built to be readable on a phone, since that's how most people will actually see it.",
  },
  {
    title: "One-click share",
    body: "Once a week, ProgressFolio drafts a short recap of what you shipped, written for X or LinkedIn. Copy it with one click, edit anything that doesn't sound like you, and post it yourself - nothing gets published to your socials without you doing it.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col px-6 py-20">
      <div className="flex flex-col gap-3 pb-16 text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
          Everything ships automatically.
        </h1>
        <p className="mx-auto max-w-lg text-muted">
          Connect once. No daily logging required - your timeline builds
          itself from work you were already doing.
        </p>
      </div>

      {detailSections.map((section) => (
        <section key={section.title} className="grid gap-3 border-t border-hairline py-12 sm:grid-cols-[280px_1fr] sm:gap-10">
          <h2 className="text-xl font-semibold tracking-[-0.02em]">{section.title}</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">{section.body}</p>
        </section>
      ))}

      <section className="border-t border-hairline py-12">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold tracking-[-0.02em]">Free</h3>
            <p className="text-sm text-muted">
              1 connected repo, last 60 days of history, ProgressFolio
              branding on your public page.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold tracking-[-0.02em]">
              Paid <span className="text-faint">- coming soon</span>
            </h3>
            <p className="text-sm text-muted">
              $5-9/mo for unlimited repos, full commit history, no branding,
              and PDF export.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center gap-4 border-t border-hairline py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">
          Ready to see your own timeline?
        </h2>
        <Link
          href="/login"
          className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-background transition hover:bg-accent-hover"
        >
          Connect GitHub &amp; get started
        </Link>
      </section>
    </div>
  );
}
