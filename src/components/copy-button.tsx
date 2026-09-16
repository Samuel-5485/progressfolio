"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="w-fit rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background transition hover:opacity-90"
    >
      {copied ? "Copied!" : "Copy post"}
    </button>
  );
}
