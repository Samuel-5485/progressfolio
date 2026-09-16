import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import type { Profile } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const { count: repoCount } = await supabase
    .from("tracked_repos")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}
          </h1>
          {profile?.username && (
            <p className="text-sm text-foreground/60">
              Public page:{" "}
              <Link href={`/u/${profile.username}`} className="underline underline-offset-4">
                /u/{profile.username}
              </Link>
            </p>
          )}
        </div>
        <SignOutButton />
      </header>

      {!repoCount ? (
        <div className="flex flex-col gap-3 rounded-xl border border-foreground/10 p-6">
          <h2 className="font-medium">Connect a repo to get started</h2>
          <p className="text-sm text-foreground/60">
            Pick one GitHub repo and ProgressFolio will turn your recent
            commits into your first timeline entries.
          </p>
          <Link
            href="/onboarding"
            className="w-fit rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            Finish onboarding
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border border-foreground/10 p-6">
          <h2 className="font-medium">Streak: {profile?.streak_weeks ?? 0} weeks</h2>
          <p className="text-sm text-foreground/60">
            Your timeline inbox and weekly share post are coming in the next
            build steps.
          </p>
        </div>
      )}
    </main>
  );
}
