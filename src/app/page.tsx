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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-10 px-6 py-24 text-center">
      <div className="flex flex-col gap-4">
        <span className="text-sm font-medium uppercase tracking-wide text-foreground/50">
          ProgressFolio
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Turn your commits into a portfolio that proves you ship.
        </h1>
        <p className="mx-auto max-w-xl text-balance text-foreground/70">
          You&apos;re already shipping. Stop losing the proof. Connect GitHub
          and ProgressFolio builds a living, public timeline of your work -
          almost zero manual effort.
        </p>
      </div>

      <Link
        href="/login"
        className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
      >
        Connect GitHub &amp; get started
      </Link>

      <div className="grid gap-6 pt-8 text-left sm:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold">{feature.title}</h2>
            <p className="text-sm text-foreground/60">{feature.body}</p>
          </div>
        ))}
      </div>

      <p className="max-w-md text-xs text-foreground/40">
        Built for CS students, indie hackers, and anyone building in public
        who wants proof of consistency - not just a couple of polished
        projects.
      </p>
    </main>
  );
}
