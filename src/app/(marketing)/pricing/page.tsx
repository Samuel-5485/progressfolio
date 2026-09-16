import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - ProgressFolio",
  description: "Free to start. A paid plan is coming for builders who want more.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center gap-6 px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">Pricing</h1>
      <p className="max-w-md text-muted">
        ProgressFolio is free to start: 1 connected repo, the last 60 days
        of history, ProgressFolio branding on your public page. A paid
        plan ($5-9/mo) is coming, with unlimited repos, full history, no
        branding, and PDF export - see the full breakdown on{" "}
        <Link href="/features" className="underline underline-offset-4">
          Features
        </Link>
        .
      </p>
      <Link
        href="/login"
        className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-background transition hover:bg-accent-hover"
      >
        Connect GitHub &amp; get started
      </Link>
    </div>
  );
}
