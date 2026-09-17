import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - ProgressFolio",
  description:
    "Start free with one repo and 60 days of history. Pro is $9/mo, coming soon.",
};

const FREE_FEATURES = [
  "Auto-import from 1 repo",
  "Basic AI summaries",
  "Public page with ProgressFolio branding",
  "Last 60 days of history",
  "Manual logs and screenshots",
];

const PRO_FEATURES = [
  "Unlimited repos",
  "Deeper AI summaries and pattern insights",
  "Branding removed from your public page",
  "Full history and private logs",
  "PDF export and custom domain later",
];

export default function PricingPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col px-6 py-20">
      <div className="flex flex-col gap-3 pb-16 text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
          Pricing
        </h1>
        <p className="mx-auto max-w-lg text-muted">
          Start free. Upgrade when one repo and 60 days is not enough.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <article className="flex flex-col gap-6 rounded-md border border-hairline bg-elevated p-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold tracking-[-0.02em]">Free</h2>
            <p className="text-4xl font-semibold tracking-[-0.02em]">$0</p>
            <p className="text-sm text-faint">Forever</p>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            {FREE_FEATURES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link
            href="/login"
            className="mt-auto cursor-pointer rounded-md border border-hairline px-6 py-3 text-center text-sm font-medium text-foreground transition hover:bg-hairline-soft hover:text-foreground"
          >
            Connect GitHub
          </Link>
        </article>

        <article className="flex flex-col gap-6 rounded-md border border-accent bg-elevated p-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold tracking-[-0.02em]">Pro</h2>
            <p className="text-4xl font-semibold tracking-[-0.02em]">
              $9
              <span className="text-lg font-medium text-muted">/mo</span>
            </p>
            <p className="text-sm text-faint">Coming soon</p>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            {PRO_FEATURES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <button
            type="button"
            disabled
            className="mt-auto cursor-pointer rounded-md bg-accent px-6 py-3 text-sm font-medium text-background transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Pro checkout coming soon
          </button>
        </article>
      </div>
    </div>
  );
}
