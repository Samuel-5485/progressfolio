import { ScreenshotThumb } from "@/components/screenshot-thumb";
import { normalizeSkills } from "@/lib/skills";
import type { TimelineEntry } from "@/lib/types";

/** Single card used on both /dashboard and /u/[username]. */
export function EntryCard({
  entry,
  location,
}: {
  entry: TimelineEntry;
  location: string;
}) {
  const shots = entry.screenshot_urls ?? [];

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-foreground/10 p-4">
      <span className="text-xs uppercase tracking-wide text-foreground/40">
        {entry.entry_date}
        {entry.source === "manual" && " · manual log"}
      </span>
      <h3 className="font-medium">{entry.title}</h3>
      <p className="text-sm text-foreground/70">{entry.summary}</p>
      {entry.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {normalizeSkills(entry.skills).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs text-foreground/60"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
      {shots.length > 0 && (
        <div
          className={`grid gap-2 pt-1 ${
            shots.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {shots.map((url) => (
            <ScreenshotThumb key={url} url={url} location={location} />
          ))}
        </div>
      )}
      {entry.lessons && (
        <p className="pt-1 text-xs text-foreground/50">💡 {entry.lessons}</p>
      )}
    </div>
  );
}
