import type { Profile } from "@/lib/types";

type BillingFields = Pick<Profile, "plan" | "plan_status" | "plan_current_period_end">;

/**
 * Monthly and yearly Polar subscriptions grant the same Pro features.
 * Interval only changes how Polar bills.
 */
export function isPro(profile: BillingFields | null | undefined): boolean {
  if (!profile || profile.plan !== "pro") return false;
  if (profile.plan_status === "revoked") return false;

  if (profile.plan_status === "canceled") {
    if (!profile.plan_current_period_end) return false;
    return new Date(profile.plan_current_period_end).getTime() > Date.now();
  }

  // active, past_due, or a not-yet-webhooked row still grants access
  // until Polar reports the subscription is gone.
  return true;
}
