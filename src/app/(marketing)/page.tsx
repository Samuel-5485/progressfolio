import Link from "next/link";

const features = [
  {
    title: "Auto-import from GitHub",
    body: "Commits and repo activity become timeline entries automatically - no daily logging required.",
  },
  {
    title: "AI rewrite",
    body: "Raw commit messages and diffs become a readable summary: what shipped, skills shown, likely lessons learned.",
  },
  {
    title: "Living public page",
    body: "A shareable portfolio that updates itself as you keep working, plus a weekly streak indicator.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-16 px-6 py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-sm font-medium text-muted">ProgressFolio</span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
          Turn your commits into a portfolio that proves you ship.
        </h1>
        <p className="mx-auto max-w-xl text-balance text-muted">
          You&apos;re already shipping. Stop losing the proof. Connect GitHub
          and ProgressFolio builds a living, public timeline of your work -
          almost zero manual effort.
        </p>

        <Link
          href="/login"
          className="mt-2 rounded-md bg-accent px-6 py-3 text-sm font-medium text-background transition hover:bg-accent-hover"
        >
          Connect GitHub &amp; get started
        </Link>
      </div>

      <div className="border-t border-hairline pt-12">
        <div className="grid gap-8 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-2 text-left">
              <h2 className="text-sm font-semibold tracking-[-0.02em]">{feature.title}</h2>
              <p className="text-sm text-muted">{feature.body}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mx-auto max-w-md text-center text-xs text-faint">
        Built for CS students, indie hackers, and anyone building in public
        who wants proof of consistency - not just a couple of polished
        projects.
      </p>
    </div>
  );
}
