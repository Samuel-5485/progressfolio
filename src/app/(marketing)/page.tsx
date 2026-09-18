import Link from "next/link";
import { ArrowRight, Check, GitBranch, Sparkles, Zap } from "lucide-react";

const features = [
  { icon: GitBranch, number: "01", title: "Connect once", body: "Link GitHub and choose the repos you want to show. ProgressFolio handles the rest." },
  { icon: Sparkles, number: "02", title: "Make it readable", body: "AI turns raw commits into clear stories: what shipped, what you learned, and what is next." },
  { icon: Zap, number: "03", title: "Keep shipping", body: "Your public timeline updates with your work, so your portfolio stays current without extra admin." },
];

const timeline = [
  { date: "SEP 18", repo: "progressfolio", title: "Shipped the first version of public timelines", tags: ["Next.js", "Product design"] },
  { date: "SEP 12", repo: "progressfolio", title: "Added GitHub sync and weekly streaks", tags: ["Supabase", "GitHub API"] },
  { date: "SEP 04", repo: "side-project", title: "Built a faster onboarding flow", tags: ["UX", "TypeScript"] },
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      <section className="mx-auto grid w-full max-w-[1180px] gap-14 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-20 lg:pt-28">
        <div className="flex flex-col items-start gap-7">
          <div className="eyebrow"><span className="eyebrow-dot" /> Built for people who ship</div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[.98] tracking-[-0.065em] sm:text-7xl">Your work deserves <span className="text-accent">proof.</span></h1>
          <p className="max-w-xl text-lg leading-8 text-muted">ProgressFolio turns your GitHub activity into a living portfolio that shows how you think, build, and keep going.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/login" className="button-primary">Connect GitHub <ArrowRight data-icon="inline-end" /></Link>
            <Link href="#how-it-works" className="button-quiet">See how it works</Link>
          </div>
          <p className="text-xs text-faint">Free to start · No manual logging · Your page updates automatically</p>
        </div>

        <div className="proof-card" aria-label="Example ProgressFolio timeline">
          <div className="flex items-center justify-between border-b border-hairline px-5 py-4"><div className="flex items-center gap-2 text-sm font-semibold"><span className="brand-mark">P</span> / alex-builds</div><span className="status-pill"><span /> Live</span></div>
          <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-hairline px-5 py-5"><div><p className="text-xs uppercase tracking-[.16em] text-faint">Shipping streak</p><p className="mt-1 text-3xl font-semibold tracking-[-.05em]">12 weeks</p></div><div className="streak-bars" aria-hidden="true">{[1,1,1,1,1,0,1,1,1,1,1,1].map((active, i) => <span key={i} className={active ? "active" : ""} />)}</div></div>
          <div className="flex flex-col gap-0 px-5 py-5"><div className="mb-5 flex items-center justify-between"><p className="text-sm font-semibold">Recent shipping</p><span className="text-xs text-faint">Updated just now</span></div>{timeline.map((item, index) => <div key={item.title} className="timeline-row"><div className="timeline-date">{item.date}</div><div className="timeline-line"><span /><i /></div><div className="pb-6"><p className="text-[11px] font-medium uppercase tracking-[.14em] text-accent">{item.repo}</p><p className="mt-1 text-sm font-medium leading-5">{item.title}</p><div className="mt-2 flex flex-wrap gap-1.5">{item.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}</div></div></div>)}</div>
          <div className="flex items-center justify-between border-t border-hairline bg-white/[.02] px-5 py-4 text-xs"><span className="text-muted">alex.dev/proof</span><span className="text-accent">View public page →</span></div>
        </div>
      </section>

      <section className="border-y border-hairline bg-elevated/40" id="how-it-works"><div className="mx-auto max-w-[1180px] px-6 py-20"><div className="mb-12 max-w-xl"><p className="section-kicker">The missing layer</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.05em] sm:text-5xl">You are already doing the work. <span className="text-muted">Now make it visible.</span></h2></div><div className="grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline md:grid-cols-3">{features.map(({ icon: Icon, number, title, body }) => <div key={number} className="bg-background p-7"><div className="mb-12 flex items-center justify-between"><Icon className="text-accent" /><span className="font-mono text-xs text-faint">{number}</span></div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{body}</p></div>)}</div></div></section>

      <section className="mx-auto grid max-w-[1180px] gap-10 px-6 py-20 md:grid-cols-2 md:items-center"><div><p className="section-kicker">Built for momentum</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.05em] sm:text-5xl">A portfolio that gets better when you do.</h2><p className="mt-5 max-w-lg leading-7 text-muted">No blank page. No weekly admin. Just a clear record of the projects, decisions, and small wins that add up to becoming a better builder.</p><ul className="mt-8 flex flex-col gap-4 text-sm">{["Automatic GitHub imports", "AI-written summaries you can edit", "A public page ready to share", "Weekly consistency, without the guilt"].map((item) => <li key={item} className="flex items-center gap-3"><span className="check-icon"><Check /></span>{item}</li>)}</ul></div><div className="quote-card"><p>“The best portfolio is not a museum of finished work. It is evidence that you know how to move.”</p><span>— The ProgressFolio principle</span></div></section>

      <section className="mx-6 mb-16 rounded-2xl bg-accent px-7 py-14 text-background sm:px-14"><div className="mx-auto flex max-w-[1060px] flex-col gap-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[.15em] text-background/60">Start with your next commit</p><h2 className="mt-3 max-w-xl text-4xl font-semibold leading-none tracking-[-.06em] sm:text-6xl">Stop losing the proof.</h2></div><Link href="/login" className="button-dark">Build your ProgressFolio <ArrowRight data-icon="inline-end" /></Link></div></section>
    </div>
  );
}
