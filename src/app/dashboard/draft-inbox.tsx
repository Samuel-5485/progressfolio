import { discardEntryAction, publishEntryAction } from "./actions";
import type { TimelineEntry } from "@/lib/types";

export function DraftInbox({ drafts }: { drafts: TimelineEntry[] }) {
  if (drafts.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-foreground/10 p-6">
      <div>
        <h2 className="font-medium">Draft inbox</h2>
        <p className="text-sm text-foreground/60">
          Gemini drafted these from your older commits. Edit anything, then publish.
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {drafts.map((entry) => (
          <li key={entry.id} className="flex flex-col gap-3 rounded-lg border border-foreground/10 p-4">
            <span className="text-xs uppercase tracking-wide text-foreground/40">
              {entry.entry_date}
            </span>

            <form action={publishEntryAction} className="flex flex-col gap-2">
              <input type="hidden" name="id" value={entry.id} />
              <input
                name="title"
                defaultValue={entry.title}
                className="rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm font-medium outline-none focus:border-foreground/40"
              />
              <textarea
                name="summary"
                defaultValue={entry.summary}
                rows={3}
                className="rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40"
              />
              <input
                name="skills"
                defaultValue={entry.skills.join(", ")}
                placeholder="skills, comma separated"
                className="rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-xs outline-none focus:border-foreground/40"
              />
              <textarea
                name="lessons"
                defaultValue={entry.lessons ?? ""}
                rows={2}
                placeholder="likely lesson learned"
                className="rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-xs text-foreground/70 outline-none focus:border-foreground/40"
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background transition hover:opacity-90"
                >
                  Publish
                </button>
                <button
                  type="submit"
                  formAction={discardEntryAction}
                  className="rounded-full border border-foreground/20 px-4 py-1.5 text-xs font-medium transition hover:bg-foreground/5"
                >
                  Discard
                </button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
