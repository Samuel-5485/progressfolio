"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createManualEntryAction } from "./actions";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ManualLogForm({ userId }: { userId: string }) {
  const [entryDate, setEntryDate] = useState(todayIso());
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [lessons, setLessons] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function uploadScreenshots(): Promise<string[]> {
    if (files.length === 0) return [];

    const supabase = createClient();
    const urls: string[] = [];

    for (const file of files) {
      const path = `${userId}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("entry-media")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
      }

      const { data } = supabase.storage.from("entry-media").getPublicUrl(path);
      urls.push(data.publicUrl);
    }

    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setStatus("uploading");
      const screenshotUrls = await uploadScreenshots();

      setStatus("saving");
      const result = await createManualEntryAction({
        entryDate,
        title,
        summary,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        lessons,
        screenshotUrls,
      });

      if (result?.error) {
        setError(result.error);
        setStatus("error");
      }
      // On success the action redirects, so no further state update needed.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const isBusy = status === "uploading" || status === "saving";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Date
        <input
          type="date"
          required
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          className="rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Title
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Redesigned the onboarding flow"
          className="rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        What did you do?
        <textarea
          required
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Skills (comma separated)
        <input
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Figma, user research"
          className="rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        What was hard / what you learned (optional)
        <textarea
          rows={2}
          value={lessons}
          onChange={(e) => setLessons(e.target.value)}
          className="rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40"
        />
      </label>

        <label className="flex flex-col gap-1 text-sm">
        Screenshots (optional)
        <input
          id="screenshots"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="sr-only"
        />
        <span className="inline-flex w-fit cursor-pointer items-center rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium transition hover:bg-foreground/5">
          Choose files
        </span>
        <span className="text-xs text-faint">
          {files.length === 0
            ? "No file chosen"
            : files.map((file) => file.name).join(", ")}
        </span>
      </label>

      <button
        type="submit"
        disabled={isBusy}
        className="mt-2 w-fit cursor-pointer rounded-md bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "uploading"
          ? "Uploading..."
          : status === "saving"
            ? "Saving..."
            : "Publish entry"}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
