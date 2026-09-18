import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isPro } from "@/lib/billing/entitlements";
import type { Profile } from "@/lib/types";
import { PricingCards } from "./pricing-cards";

export const metadata: Metadata = {
  title: "Pricing - ProgressFolio",
  description:
    "Start free with one repo and 60 days of history. Pro is $9/mo or $86/year.",
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ interval?: string }>;
}) {
  const { interval } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isProUser = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, plan_status, plan_current_period_end")
      .eq("id", user.id)
      .maybeSingle<Pick<Profile, "plan" | "plan_status" | "plan_current_period_end">>();
    isProUser = isPro(profile);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col px-6 py-20">
      <div className="flex flex-col gap-3 pb-16 text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
          Pricing
        </h1>
        <p className="mx-auto max-w-lg text-muted">
          Start free. Upgrade when one repo and 60 days is not enough.
        </p>
      </div>

      <PricingCards
        loggedIn={Boolean(user)}
        isProUser={isProUser}
        initialInterval={interval === "yearly" ? "yearly" : "monthly"}
      />
    </div>
  );
}
