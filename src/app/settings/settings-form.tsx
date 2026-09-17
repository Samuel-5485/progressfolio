"use client";

import { useState } from "react";
import { updateDisplayNameAction } from "./actions";

const inputClass =
  "rounded-md border border-[#1F1F1F] bg-[#111111] px-3 py-2.5 text-sm text-[#EDEDED] outline-none placeholder:text-[#5F5F5F] transition-colors duration-150 focus:border-[#F5793A]";

export function SettingsForm({
  initialDisplayName,
  fallbackName,
}: {
  initialDisplayName: string;
  fallbackName: string;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const result = await updateDisplayNameAction(displayName);

    if (result?.error) {
      setError(result.error);
      setStatus("error");
    } else {
      setStatus("saved");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-[#EDEDED]">
        Display name
        <input
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            setStatus("idle");
          }}
          placeholder={fallbackName}
          maxLength={50}
          className={inputClass}
        />
        <span className="text-xs text-[#8A8A8A]">
          Shown at the top of your public page. Leave blank to use @{fallbackName} instead - never your email.
        </span>
      </label>

      <button
        type="submit"
        disabled={status === "saving"}
        className="w-fit rounded-md bg-[#F5793A] px-5 py-2 text-sm font-medium text-[#0A0A0A] transition duration-150 hover:bg-[#FF8C4C] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "saving" ? "Saving..." : "Save"}
      </button>

      {status === "saved" && <p className="text-sm text-[#8A8A8A]">Saved.</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
