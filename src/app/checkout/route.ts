import { Checkout } from "@polar-sh/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  appUrl,
  polarBillingError,
  polarProductId,
  polarServer,
  type PolarPlan,
} from "@/lib/polar";

function asPlan(value: string | null): PolarPlan {
  return value === "yearly" ? "yearly" : "monthly";
}

function billingUnavailable(message: string) {
  return new NextResponse(
    `Billing is not configured (${message}). Checkout is disabled until Polar production keys are set.`,
    { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const plan = asPlan(request.nextUrl.searchParams.get("plan"));

  if (!user) {
    const next = `/pricing?interval=${plan}`;
    const login = new URL("/login", request.url);
    login.searchParams.set("next", next);
    return NextResponse.redirect(login);
  }

  const missing = polarBillingError();
  if (missing) {
    return billingUnavailable(missing);
  }

  const checkoutUrl = request.nextUrl.clone();
  checkoutUrl.searchParams.set("products", polarProductId(plan));
  checkoutUrl.searchParams.set("customerExternalId", user.id);
  if (user.email) {
    checkoutUrl.searchParams.set("customerEmail", user.email);
  }
  checkoutUrl.searchParams.set("metadata", JSON.stringify({ userId: user.id }));

  const polarCheckout = Checkout({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    successUrl: `${appUrl()}/dashboard?upgrade=success`,
    returnUrl: `${appUrl()}/pricing`,
    server: polarServer(),
    theme: "dark",
    includeCheckoutId: false,
  });

  return polarCheckout(new NextRequest(checkoutUrl, request));
}
