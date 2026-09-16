/** Turns arbitrary text (a GitHub login, an email local-part, ...) into a
 * URL-safe username candidate for /u/[username]. */
export function slugifyUsername(raw: string): string {
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
  return slug || "builder";
}

/** Appends a short random suffix, used when the base slug is already taken. */
export function withRandomSuffix(base: string): string {
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}
