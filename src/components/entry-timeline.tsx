"use client";

import { useState } from "react";
import { EntryCard } from "@/components/entry-card";
import type { TimelineEntry } from "@/lib/types";

const PAGE_SIZE = 6;

/**
 * Newest-first entry list shared by the dashboard and the public
 * profile. Shows the first PAGE_SIZE cards, then a Load more control
 * so older entries don't all mount (and fetch images) up front.
 */
export function EntryTimeline({
  entries,
  location,
  title,
}: {
  entries: TimelineEntry[];
  location: string;
  title: string;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = entries.slice(0, visible);
  const remaining = Math.max(0, entries.length - shown.length);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-medium">{title}</h2>
      <ul className="flex flex-col gap-4">
        {shown.map((entry) => (
          <li key={entry.id}>
            <EntryCard entry={entry} location={location} />
          </li>
        ))}
      </ul>
      {remaining > 0 && (
        <button
          type="button"
          onClick={() => {
            // #region agent log
            fetch("http://127.0.0.1:7405/ingest/f606287d-102e-4a04-817c-ef891adac058", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Debug-Session-Id": "dfb447",
              },
              body: JSON.stringify({
                sessionId: "dfb447",
                runId: "shared-timeline",
                hypothesisId: "H7",
                location,
                message: "load more clicked",
                data: {
                  before: visible,
                  after: visible + PAGE_SIZE,
                  remaining,
                  total: entries.length,
                },
                timestamp: Date.now(),
              }),
            }).catch(() => {});
            // #endregion
            setVisible((n) => n + PAGE_SIZE);
          }}
          className="w-fit rounded-full border border-foreground/20 px-4 py-1.5 text-sm font-medium transition hover:bg-foreground/5"
        >
          Load more
        </button>
      )}
    </section>
  );
}
