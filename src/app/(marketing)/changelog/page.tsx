import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog - ProgressFolio",
  description: "What's shipped, in order.",
};

/**
 * Newest entry goes first. Each entry needs a date, a title, and 1-3
 * bullet points describing what changed. `tag` is optional - add a
 * version string once you start cutting real releases.
 */
const CHANGELOG_ENTRIES: { date: string; tag?: string; title: string; items: string[] }[] = [
  {
    date: "2026-09-16",
    title: "Manual logs, weekly share posts & GitHub webhooks",
    items: [
      "Off-GitHub work (design, writing, learning) can now be logged manually with screenshot uploads",
      "Dashboard drafts a ready-to-post weekly recap for X/LinkedIn, copy it with one click",
      "Connected repos register a GitHub push webhook so new commits sync automatically in production",
    ],
  },
  {
    date: "2026-09-16",
    title: "GitHub auto-import live",
    items: [
      "First working end-to-end sync: a connected repo's commits flow into a public timeline entry",
      "AI-generated summary and auto-tagged skills for every entry, with a draft inbox to review before publishing",
    ],
  },
  {
    date: "2026-09-16",
    title: "Public profile pages",
    items: [
      "Mobile-friendly public timeline at /u/username shipped",
      "Weekly shipping streak indicator and recent-highlights section",
    ],
  },
  {
    date: "2026-09-16",
    title: "Landing page live",
    items: [
      "Homepage published with hero, feature breakdown, and GitHub connect CTA",
    ],
  },
  {
    date: "2026-09-16",
    title: "Project kickoff",
    items: [
      "Initial concept locked in",
      "Tech stack chosen: Next.js, Tailwind CSS, Supabase, Gemini Flash-Lite, Vercel",
    ],
  },
];

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function ChangelogPage() {
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col px-6 py-20">
      <div className="flex flex-col gap-3 pb-12">
        <h1 className="text-4xl font-semibold tracking-[-0.02em]">Changelog</h1>
        <p className="text-muted">What&apos;s shipped, in order.</p>
      </div>

      <div className="flex flex-col">
        {CHANGELOG_ENTRIES.map((entry, index) => (
          <article
            key={`${entry.date}-${entry.title}`}
            className={`flex flex-col gap-2 py-8 ${index === 0 ? "" : "border-t border-hairline"}`}
          >
            <div className="flex items-center gap-3 text-xs text-faint">
              <time dateTime={entry.date}>{formatDate(entry.date)}</time>
              {entry.tag && (
                <span className="rounded-md border border-hairline px-1.5 py-0.5 text-faint">
                  {entry.tag}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold tracking-[-0.02em]">{entry.title}</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
              {entry.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
