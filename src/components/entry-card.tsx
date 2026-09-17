import { ScreenshotThumb } from "@/components/screenshot-thumb";
import { normalizeSkills } from "@/lib/skills";
import type { TimelineEntry } from "@/lib/types";

export function EntryCard({
  entry,
  compact = false,
  location,
}: {
  entry: TimelineEntry;
  compact?: boolean;
  location: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-foreground/10 p-4">
      <span className="text-xs uppercase tracking-wide text-foreground/40">
        {entry.entry_date}
        {entry.source === "manual" && " · manual log"}
      </span>
      <h3 className="font-medium">{entry.title}</h3>
      <p className={`text-sm text-foreground/70 ${compact ? "line-clamp-3" : ""}`}>
        {entry.summary}
      </p>
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
      {entry.screenshot_urls.length > 0 && (
        <div
          className={`grid gap-2 pt-1 ${
            compact || entry.screenshot_urls.length === 1
              ? "grid-cols-1"
              : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {(compact ? entry.screenshot_urls.slice(0, 1) : entry.screenshot_urls).map((url) => (
            <ScreenshotThumb key={url} url={url} compact={compact} location={location} />
          ))}
        </div>
      )}
      {!compact && entry.lessons && (
        <p className="pt-1 text-xs text-foreground/50">💡 {entry.lessons}</p>
      )}
    </div>
  );
}
