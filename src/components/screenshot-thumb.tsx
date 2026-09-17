"use client";

/**
 * Fixed-ratio screenshot thumbnail used on the public profile and
 * dashboard. The crop box is a plain div; the image is absolutely
 * positioned so it can only cover, never stretch.
 */
export function ScreenshotThumb({
  url,
  compact = false,
  location,
}: {
  url: string;
  compact?: boolean;
  location: string;
}) {
  return (
    <div className="relative aspect-video max-h-56 min-h-[7.5rem] w-full overflow-hidden rounded-md border border-foreground/10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        onLoad={(e) => {
          const el = e.currentTarget;
          const box = el.parentElement?.getBoundingClientRect();
          // #region agent log
          fetch("http://127.0.0.1:7405/ingest/f606287d-102e-4a04-817c-ef891adac058", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": "dfb447",
            },
            body: JSON.stringify({
              sessionId: "dfb447",
              runId: "post-fix",
              hypothesisId: "H6",
              location,
              message: "screenshot thumb rendered",
              data: {
                compact,
                naturalWidth: el.naturalWidth,
                naturalHeight: el.naturalHeight,
                boxW: box ? Math.round(box.width) : null,
                boxH: box ? Math.round(box.height) : null,
                objectFit: getComputedStyle(el).objectFit,
                ratio:
                  box && box.height > 0 ? Number((box.width / box.height).toFixed(2)) : null,
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
        }}
      />
    </div>
  );
}
