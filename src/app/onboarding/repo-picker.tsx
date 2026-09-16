"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { connectRepoAction, type ConnectRepoState } from "./actions";
import type { GithubRepoSummary } from "@/lib/github/client";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-fit rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Importing commits..." : "Import this repo"}
    </button>
  );
}

export function RepoPicker({ repos }: { repos: GithubRepoSummary[] }) {
  const [state, formAction] = useActionState<ConnectRepoState, FormData>(connectRepoAction, {});
  const [selected, setSelected] = useState<GithubRepoSummary | undefined>(repos[0]);

  if (repos.length === 0) {
    return (
      <p className="text-sm text-foreground/60">
        No repos found on your GitHub account yet - push something and refresh this page.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <select
        name="repoFullName"
        value={selected?.fullName}
        onChange={(e) => setSelected(repos.find((r) => r.fullName === e.target.value))}
        className="rounded-lg border border-foreground/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-foreground/40"
      >
        {repos.map((repo) => (
          <option key={repo.githubRepoId} value={repo.fullName}>
            {repo.fullName}
            {repo.isPrivate ? " (private)" : ""}
          </option>
        ))}
      </select>
      <input type="hidden" name="repoId" value={selected?.githubRepoId ?? ""} />
      <input type="hidden" name="isPrivate" value={String(selected?.isPrivate ?? false)} />

      <p className="text-xs text-foreground/50">
        We&apos;ll import your commits from the last 60 days to build your first timeline entries.
      </p>

      <SubmitButton />

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
    </form>
  );
}
