import { Polar } from "@polar-sh/sdk";

export type PolarPlan = "monthly" | "yearly";
export type PolarEnv = "sandbox" | "production";

/**
 * Sandbox only when POLAR_SERVER is explicitly "sandbox" (local / Vercel
 * Preview). Every other value — including unset — is Polar production so
 * a missing env var cannot send live users to sandbox checkout.
 */
export function polarServer(): PolarEnv {
  return process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production";
}

/** Polar success/return URLs. Requires NEXT_PUBLIC_APP_URL — never localhost fallback. */
export function appUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  if (!raw) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set");
  }
  return raw.replace(/\/$/, "");
}

export function polarBillingError(): string | null {
  if (!process.env.POLAR_ACCESS_TOKEN) return "POLAR_ACCESS_TOKEN is not set";
  if (!process.env.POLAR_PRODUCT_ID_PRO_MONTHLY) {
    return "POLAR_PRODUCT_ID_PRO_MONTHLY is not set";
  }
  if (!process.env.POLAR_PRODUCT_ID_PRO_YEARLY) {
    return "POLAR_PRODUCT_ID_PRO_YEARLY is not set";
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) return "NEXT_PUBLIC_APP_URL is not set";
  return null;
}

export function polarProductId(plan: PolarPlan): string {
  const id =
    plan === "yearly"
      ? process.env.POLAR_PRODUCT_ID_PRO_YEARLY
      : process.env.POLAR_PRODUCT_ID_PRO_MONTHLY;
  if (!id) {
    throw new Error(`POLAR_PRODUCT_ID_PRO_${plan === "yearly" ? "YEARLY" : "MONTHLY"} is not set`);
  }
  return id;
}

export function intervalForProductId(productId: string | null | undefined): "month" | "year" | null {
  if (!productId) return null;
  if (productId === process.env.POLAR_PRODUCT_ID_PRO_YEARLY) return "year";
  if (productId === process.env.POLAR_PRODUCT_ID_PRO_MONTHLY) return "month";
  return null;
}

export function createPolarClient(): Polar {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not set");
  }
  return new Polar({
    accessToken,
    server: process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production",
  });
}
