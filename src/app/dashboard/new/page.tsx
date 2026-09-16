import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ManualLogForm } from "./manual-log-form";

export default async function NewManualLogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/new");
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-16">
      <div>
        <Link href="/dashboard" className="text-sm text-foreground/50 underline underline-offset-4">
          &larr; Back to dashboard
        </Link>
        <h1 className="mt-2 text-xl font-semibold">Log off-GitHub work</h1>
        <p className="text-sm text-foreground/60">
          Design, writing, learning, or anything else that doesn&apos;t live
          in a commit. This publishes straight to your timeline.
        </p>
      </div>

      <ManualLogForm userId={user.id} />
    </main>
  );
}
