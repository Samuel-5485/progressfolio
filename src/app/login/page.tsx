"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleGithubLogin() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        // read:user + repo let us pull the builder's commit activity later.
        scopes: "read:user repo",
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-24">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold">Sign in to ProgressFolio</h1>
        <p className="text-sm text-foreground/60">
          Connect GitHub to auto-import your shipping activity.
        </p>
      </div>

      <button
        onClick={handleGithubLogin}
        className="flex w-full cursor-pointer items-center justify-center rounded-md bg-[#f5793a] px-6 py-3 text-sm font-medium text-[#0a0a0a] transition hover:bg-[#e06d32]"
      >
        Continue with GitHub
      </button>

      <div className="flex items-center gap-3 text-xs uppercase text-foreground/40">
        <span className="h-px flex-1 bg-foreground/10" />
        or
        <span className="h-px flex-1 bg-foreground/10" />
      </div>

      <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-foreground/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-foreground/40"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="flex w-full cursor-pointer items-center justify-center rounded-md border border-foreground/20 px-6 py-2.5 text-sm font-medium transition hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "sending" ? "Sending link..." : "Send link"}
        </button>
      </form>

      {status === "sent" && (
        <p className="text-center text-sm text-foreground/60">
          Check your inbox for a sign-in link.
        </p>
      )}
      {status === "error" && errorMessage && (
        <p className="text-center text-sm text-red-500">{errorMessage}</p>
      )}
    </main>
  );
}
