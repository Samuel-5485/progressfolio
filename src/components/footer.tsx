import type { SVGProps } from "react";

function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-1.94c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.2-3.09-.12-.29-.52-1.47.11-3.06 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.83 0c2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.23 2.77.11 3.06.75.8 1.2 1.83 1.2 3.09 0 4.42-2.69 5.39-5.25 5.68.42.36.78 1.07.78 2.16v3.2c0 .31.21.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.3 2H21l-6.8 7.8L22 22h-6.3l-5-6.5L4.9 22H2l7.3-8.4L2 2h6.4l4.5 5.9L18.3 2Zm-1.1 18h1.7L7 4H5.3l12 16Z" />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.94 8.5H3.56v11.94h3.38V8.5ZM5.25 3.5a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.45 20.44h-3.37v-5.9c0-1.4-.03-3.21-1.96-3.21-1.96 0-2.26 1.53-2.26 3.11v6h-3.37V8.5h3.24v1.63h.05c.45-.86 1.56-1.77 3.2-1.77 3.43 0 4.06 2.26 4.06 5.19v7Z" />
    </svg>
  );
}

function EmailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { href: "https://github.com/Samuel-5485", label: "GitHub", icon: GitHubIcon, external: true },
  { href: "https://x.com/sami_diriba", label: "X", icon: XIcon, external: true },
  { href: "https://linkedin.com/in/samuel-diriba/", label: "LinkedIn", icon: LinkedInIcon, external: true },
  { href: "mailto:samediriba54@gmail.com", label: "Email", icon: EmailIcon, external: false },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-[1100px] flex-col items-start gap-4 px-6 py-10">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold tracking-[-0.02em] text-foreground">
            ProgressFolio
          </span>
          <p className="text-sm text-faint">
            Turn your commits into a portfolio that proves you ship.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {SOCIAL_LINKS.map(({ href, label, icon: Icon, external }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="rounded-md text-muted transition-colors duration-150 hover:text-foreground"
            >
              <Icon className="h-[18px] w-[18px]" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
