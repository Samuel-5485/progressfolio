import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-xl font-semibold">Sign-in link expired or invalid</h1>
      <p className="text-sm text-foreground/60">
        That link didn&apos;t work - it may have expired or already been used.
      </p>
      <Link href="/login" className="text-sm font-medium underline underline-offset-4">
        Back to sign in
      </Link>
    </main>
  );
}
