import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-sm text-foreground/60">
        This page doesn&apos;t exist, or the builder hasn&apos;t claimed this
        username yet.
      </p>
      <Link
        href="/"
        className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-90"
      >
        Back to ProgressFolio
      </Link>
    </main>
  );
}
