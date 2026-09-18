import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  return (
    <header className="border-b border-hairline">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 rounded-md text-sm font-semibold tracking-[-0.02em] text-foreground">
          <span className="brand-mark">P</span> ProgressFolio
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-md bg-accent px-4 py-2 text-sm font-medium text-background transition hover:bg-accent-hover sm:inline-flex"
          >
            Start building <ArrowUpRight data-icon="inline-end" />
          </Link>

          <details className="relative md:hidden">
            <summary className="flex cursor-pointer list-none items-center rounded-md border border-hairline px-3 py-2 text-sm text-foreground [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <div className="absolute right-0 top-[calc(100%+8px)] z-10 flex w-48 flex-col gap-1 rounded-md border border-hairline bg-elevated p-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm text-muted transition hover:bg-hairline-soft hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-background transition hover:bg-accent-hover"
              >
                Connect GitHub
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
