import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { intervalForProductId } from "@/lib/polar";
import type { BillingInterval, Plan, PlanStatus } from "@/lib/types";

type Json = Record<string, unknown>;

function asRecord(value: unknown): Json | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
    : null;
}

function str(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

function nested(obj: Json | null, key: string): Json | null {
  return obj ? asRecord(obj[key]) : null;
}

/**
 * Maps a Polar subscription webhook payload onto profiles.
 * Service-role only. Idempotent: repeating the same event overwrites
 * the same columns with the same values.
 */
export async function syncPolarSubscription(data: unknown, eventType: string): Promise<void> {
  const payload = asRecord(data);
  if (!payload) return;

  const customer = nested(payload, "customer");
  const product = nested(payload, "product");

  const userId = str(
    customer?.externalId,
    customer?.external_id,
    payload.customerExternalId,
    payload.customer_external_id,
    nested(payload, "metadata")?.userId,
    nested(payload, "metadata")?.user_id
  );
  const polarCustomerId = str(payload.customerId, payload.customer_id, customer?.id);
  const polarSubscriptionId = str(payload.id);
  const polarProductId = str(payload.productId, payload.product_id, product?.id);
  const recurring = str(
    payload.recurringInterval,
    payload.recurring_interval,
    product?.recurringInterval,
    product?.recurring_interval
  );
  const polarStatus = str(payload.status);
  const periodEnd = str(payload.currentPeriodEnd, payload.current_period_end);
  const cancelAtPeriodEnd = Boolean(
    payload.cancelAtPeriodEnd ?? payload.cancel_at_period_end
  );

  const supabase = createServiceRoleClient();

  let profileId = userId;
  if (!profileId && polarCustomerId) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("polar_customer_id", polarCustomerId)
      .maybeSingle();
    profileId = existing?.id ?? null;
  }

  if (!profileId) return;

  const billingInterval: BillingInterval | null =
    intervalForProductId(polarProductId) ??
    (recurring === "year" || recurring === "yearly"
      ? "year"
      : recurring === "month" || recurring === "monthly"
        ? "month"
        : null);

  const revoked =
    eventType === "subscription.revoked" ||
    polarStatus === "revoked" ||
    polarStatus === "incomplete_expired";

  const pastDue = eventType === "subscription.past_due" || polarStatus === "past_due";

  const canceledEvent = eventType === "subscription.canceled" || polarStatus === "canceled";

  let plan: Plan = "free";
  let planStatus: PlanStatus = "revoked";

  if (revoked) {
    plan = "free";
    planStatus = "revoked";
  } else if (pastDue) {
    plan = "pro";
    planStatus = "past_due";
  } else if (canceledEvent || cancelAtPeriodEnd) {
    const stillEntitled = periodEnd ? new Date(periodEnd).getTime() > Date.now() : false;
    plan = stillEntitled ? "pro" : "free";
    planStatus = "canceled";
  } else if (
    polarStatus === "active" ||
    polarStatus === "trialing" ||
    eventType === "subscription.active" ||
    eventType === "subscription.created" ||
    eventType === "subscription.updated"
  ) {
    plan = "pro";
    planStatus = "active";
  } else {
    plan = "free";
    planStatus = (polarStatus as PlanStatus) ?? "revoked";
  }

  await supabase
    .from("profiles")
    .update({
      plan,
      billing_interval: billingInterval,
      polar_customer_id: polarCustomerId,
      polar_subscription_id: polarSubscriptionId,
      polar_product_id: polarProductId,
      plan_status: planStatus,
      plan_current_period_end: periodEnd,
    })
    .eq("id", profileId);

  revalidatePath("/dashboard");
  revalidatePath("/pricing");
  revalidatePath("/u", "layout");
}
