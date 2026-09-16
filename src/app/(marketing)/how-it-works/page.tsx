import type { Metadata } from "next";
import type { SVGProps } from "react";

export const metadata: Metadata = {
  title: "How it works - ProgressFolio",
  description: "The exact flow from connecting GitHub to a public, self-updating timeline.",
};

function IconBase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      {...props}
    />
  );
}

const steps = [
  {
    title: "Sign up",
    body: "Create an account with email or GitHub - whichever's faster.",
    icon: (
      <IconBase>
        <path d="M4 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <circle cx="10" cy="7" r="3.5" />
        <path d="M18 8v4M20 10h-4" />
      </IconBase>
    ),
  },
  {
    title: "Connect GitHub",
    body: "Authorize with OAuth and choose which repo you want included.",
    icon: (
      <IconBase>
        <path d="M8 15c-3 1-3-1.5-4.5-2M15.5 20v-2.7c0-.7.3-1.4.9-1.9 2.5-.5 4.6-2 4.6-6a4.6 4.6 0 0 0-1.2-3.2 4.3 4.3 0 0 0-.1-3.2s-1 -.3-3.2 1.2a11 11 0 0 0-5.6 0C8.2 2.7 7.2 3 7.2 3a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 5.9 9.4c0 4 2.1 5.5 4.6 6 .6.5.9 1.2.9 1.9V20" />
      </IconBase>
    ),
  },
  {
    title: "ProgressFolio reads your activity",
    body: "It pulls recent commits, diffs, and repo metadata - no code is stored beyond what's needed to write a summary.",
    icon: (
      <IconBase>
        <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </IconBase>
    ),
  },
  {
    title: "AI drafts your entries",
    body: "A clean write-up per meaningful chunk of work, tagged with the skills it shows.",
    icon: (
      <IconBase>
        <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        <circle cx="12" cy="12" r="3" />
      </IconBase>
    ),
  },
  {
    title: "You review and publish",
    body: "Edit anything that's off, add screenshots or context the AI couldn't infer, then publish.",
    icon: (
      <IconBase>
        <path d="M20 6 9 17l-5-5" />
      </IconBase>
    ),
  },
  {
    title: "Your page updates itself",
    body: "New entries appear as you keep committing. Your streak counter tracks consistency automatically.",
    icon: (
      <IconBase>
        <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16M3 21v-5h5" />
      </IconBase>
    ),
  },
];

const faqs = [
  {
    q: "Do you store my code?",
    a: "No - only what's needed to generate a summary: commit messages, diffs at a high level, and repo metadata.",
  },
  {
    q: "Can I edit what the AI writes?",
    a: "Yes. Every entry is editable before publishing, and you can go back and change or remove anything later.",
  },
  {
    q: "What if I don't want everything public?",
    a: "Per-repo visibility controls are coming to the paid plan. Today, keep a repo off ProgressFolio by not connecting it.",
  },
  {
    q: "Does this work with GitLab?",
    a: "Not yet - GitHub only for now. More integrations are planned.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col px-6 py-20">
      <div className="flex flex-col gap-3 pb-16 text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">How it works</h1>
        <p className="mx-auto max-w-lg text-muted">
          Connecting your GitHub account is a bigger ask than a normal
          signup. Here&apos;s exactly what happens, step by step.
        </p>
      </div>

      <ol className="flex flex-col">
        {steps.map((step, index) => (
          <li key={step.title} className="grid grid-cols-[auto_1fr] gap-4 border-t border-hairline py-8 sm:grid-cols-[48px_auto_1fr] sm:items-start sm:gap-6">
            <span className="hidden text-sm text-faint sm:block">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-elevated text-accent">
              {step.icon}
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold tracking-[-0.02em]">
                <span className="text-faint sm:hidden">{index + 1}. </span>
                {step.title}
              </h2>
              <p className="max-w-xl text-sm text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="border-t border-hairline pt-16">
        <h2 className="pb-6 text-2xl font-semibold tracking-[-0.02em]">Common questions</h2>
        <div className="flex flex-col">
          {faqs.map((faq) => (
            <details key={faq.q} className="group border-t border-hairline py-5 first:border-t-0">
              <summary className="cursor-pointer list-none rounded-md text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                {faq.q}
              </summary>
              <p className="mt-2 max-w-xl text-sm text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
