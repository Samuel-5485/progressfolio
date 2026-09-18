import type { Metadata } from "next";
import Link from "next/link";
import { DocsMobileNav, DocsSidebar } from "./docs-nav";

export const metadata: Metadata = {
  title: "Docs - ProgressFolio",
  description: "A short, scannable reference for how ProgressFolio works.",
};

const sections = [
  {
    id: "getting-started",
    title: "Getting started",
    content: (
      <>
        <p>
          Sign in at <Link href="/login" className="underline underline-offset-4">/login</Link> with
          GitHub or an email magic link, then finish setup at{" "}
          <code className="rounded-md bg-elevated px-1.5 py-0.5 text-[13px]">/onboarding</code> by
          picking the one repo you want tracked.
        </p>
        <p>
          ProgressFolio immediately imports the last 60 days of commits from
          that repo and drafts your first timeline entries.
        </p>
      </>
    ),
  },
  {
    id: "how-entries-are-generated",
    title: "How entries are generated",
    content: (
      <>
        <p>
          Commits are grouped one entry per day per repo, from commit
          messages, diffs, and file lists, then rewritten into a short
          summary: what shipped, skills demonstrated, and a likely lesson
          learned.
        </p>
        <p>
          In production, new commits sync automatically through a GitHub
          webhook. You can also trigger a manual re-sync any time with{" "}
          <span className="text-foreground">Sync now</span> on your
          dashboard.
        </p>
      </>
    ),
  },
  {
    id: "editing-entries",
    title: "Editing entries",
    content: (
      <>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Recent entries auto-publish; older ones land in your dashboard&apos;s draft inbox for review first.</li>
          <li>Edit the title, summary, skills, or lesson before publishing, or discard anything you don&apos;t want.</li>
          <li>
            For work that isn&apos;t on GitHub, add a manual log from{" "}
            <code className="rounded-md bg-elevated px-1.5 py-0.5 text-[13px]">/dashboard/new</code> with
            text and screenshots - it publishes right away.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "visibility-privacy",
    title: "Visibility & privacy",
    content: (
      <>
        <p>
          Everything you publish is public on your{" "}
          <code className="rounded-md bg-elevated px-1.5 py-0.5 text-[13px]">/u/username</code> page.
          Draft entries stay private until you publish them.
        </p>
        <p>
          Per-repo visibility controls, so you can decide exactly which
          repos ProgressFolio ever reads, are planned for the paid plan.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Sharing",
    content: (
      <>
        <p>
          Your public URL is <code className="rounded-md bg-elevated px-1.5 py-0.5 text-[13px]">yourdomain.com/u/username</code> - link
          it from your resume, LinkedIn, or anywhere else.
        </p>
        <p>
          Each week your dashboard drafts a ready-to-post recap for X or
          LinkedIn. Copy it with one click, edit it if you want, and post it
          yourself.
        </p>
      </>
    ),
  },
  {
    id: "account-billing",
    title: "Account & billing",
    content: (
      <>
        <p>
          Free includes 1 connected repo, the last 60 days of history, and
          ProgressFolio branding on your public page.
        </p>
        <p>
          The Pro plan ($9/mo or $86/year) removes branding and adds
          unlimited repos, full history, and PDF export. See{" "}
          <Link href="/pricing" className="underline underline-offset-4">
            Pricing
          </Link>
          . Cancel or change interval from Manage billing (Polar customer
          portal).
        </p>
      </>
    ),
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    content: (
      <>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <span className="text-foreground">GitHub won&apos;t connect</span> - make sure you approved the OAuth
            request with repo access, then try signing in again.
          </li>
          <li>
            <span className="text-foreground">Entries aren&apos;t showing up</span> - hit Sync now on your
            dashboard, or check that the connected repo has commits in the
            last 60 days.
          </li>
          <li>
            <span className="text-foreground">Need to edit or delete something</span> - drafts and published
            entries are both editable from your dashboard.
          </li>
          <li>
            <span className="text-foreground">Still stuck</span> - email{" "}
            <a href="mailto:samediriba54@gmail.com" className="underline underline-offset-4">
              support
            </a>{" "}
            and we&apos;ll help sort it out.
          </li>
        </ul>
      </>
    ),
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-10 px-6 py-16 md:flex-row md:gap-16">
      <aside className="flex flex-col gap-4 md:w-52 md:shrink-0">
        <h1 className="text-lg font-semibold tracking-[-0.02em]">Docs</h1>
        <DocsMobileNav sections={sections} />
        <DocsSidebar sections={sections} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-8 border-t border-hairline py-10 first:border-t-0 first:pt-0"
          >
            <h2 className="pb-3 text-xl font-semibold tracking-[-0.02em]">{section.title}</h2>
            <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted">
              {section.content}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
