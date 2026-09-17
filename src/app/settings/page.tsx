import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";
import type { Profile } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/settings");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 bg-[#0A0A0A] px-6 py-16 text-[#EDEDED]">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard"
          className="w-fit text-sm text-[#8A8A8A] underline underline-offset-4 transition duration-150 hover:text-[#EDEDED]"
        >
          &larr; Back to dashboard
        </Link>
        <h1 className="text-xl font-semibold">Account settings</h1>
        <p className="text-sm text-[#8A8A8A]">
          Your account email is private and never shown on your public page -
          only your display name (or @username) appears there.
        </p>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-[#1F1F1F] bg-[#111111] p-6">
        <SettingsForm
          initialDisplayName={profile.display_name ?? ""}
          fallbackName={profile.github_login ?? profile.username}
        />
      </section>

      <p className="text-xs text-[#5F5F5F]">
        Public page:{" "}
        <Link href={`/u/${profile.username}`} className="underline underline-offset-4">
          /u/{profile.username}
        </Link>
      </p>
    </main>
  );
}
