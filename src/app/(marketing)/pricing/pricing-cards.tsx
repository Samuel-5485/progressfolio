"use client";

import Link from "next/link";
import { useState } from "react";

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

type Interval = "monthly" | "yearly";

export function PricingCards({
  loggedIn,
  isProUser,
  initialInterval,
}: {
  loggedIn: boolean;
  isProUser: boolean;
  initialInterval: Interval;
}) {
  const [interval, setInterval] = useState<Interval>(initialInterval);

  const loginHref = `/login?next=${encodeURIComponent(`/pricing?interval=${interval}`)}`;
  const checkoutHref = `/checkout?plan=${interval}`;

  return (
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
          href={loggedIn ? "/dashboard" : "/login"}
          className="mt-auto cursor-pointer rounded-md border border-hairline px-6 py-3 text-center text-sm font-medium text-foreground transition hover:bg-hairline-soft hover:text-foreground"
        >
          Connect GitHub
        </Link>
      </article>

      <article className="flex flex-col gap-6 rounded-md border border-accent bg-elevated p-8">
        <div className="flex flex-col gap-4">
          <div className="flex rounded-md border border-hairline p-1">
            <button
              type="button"
              onClick={() => setInterval("monthly")}
              className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition ${
                interval === "monthly"
                  ? "bg-accent text-background"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setInterval("yearly")}
              className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition ${
                interval === "yearly"
                  ? "bg-accent text-background"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Yearly
              <span className={`ml-2 text-xs ${interval === "yearly" ? "text-background" : "text-accent"}`}>
                Save 20%
              </span>
            </button>
          </div>

          {interval === "monthly" ? (
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold tracking-[-0.02em]">Pro</h2>
              <p className="text-4xl font-semibold tracking-[-0.02em]">
                $9
                <span className="text-lg font-medium text-muted">/mo</span>
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold tracking-[-0.02em]">Yearly</h2>
              <p className="text-4xl font-semibold tracking-[-0.02em]">
                $86
                <span className="text-lg font-medium text-muted">/year</span>
              </p>
              <p className="text-sm text-faint">$7.20/mo billed yearly · Save 20%</p>
            </div>
          )}
        </div>

        <ul className="flex flex-col gap-2 text-sm text-muted">
          {interval === "yearly" && <li>Everything in monthly Pro</li>}
          {PRO_FEATURES.map((item) => (
            <li key={item}>{item}</li>
          ))}
          {interval === "yearly" && <li>2 months free vs paying monthly</li>}
        </ul>

        {isProUser ? (
          <a
            href="/portal"
            className="mt-auto cursor-pointer rounded-md bg-accent px-6 py-3 text-center text-sm font-medium text-background transition hover:bg-accent-hover"
          >
            Manage billing
          </a>
        ) : (
          <a
            href={loggedIn ? checkoutHref : loginHref}
            className="mt-auto cursor-pointer rounded-md bg-accent px-6 py-3 text-center text-sm font-medium text-background transition hover:bg-accent-hover"
          >
            {interval === "yearly" ? "Upgrade to Pro yearly" : "Upgrade to Pro"}
          </a>
        )}
      </article>
    </div>
  );
}
