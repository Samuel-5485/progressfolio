import { CustomerPortal } from "@polar-sh/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appUrl, polarBillingError, polarServer } from "@/lib/polar";

function billingUnavailable(message: string) {
  return new NextResponse(
    `Billing is not configured (${message}). The customer portal is disabled until Polar production keys are set.`,
    { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", "/pricing");
    return NextResponse.redirect(login);
  }

  const missing = polarBillingError();
  if (missing) {
    return billingUnavailable(missing);
  }

  const polarPortal = CustomerPortal({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server: polarServer(),
    returnUrl: `${appUrl()}/dashboard`,
    getExternalCustomerId: async () => user.id,
  });

  return polarPortal(request);
}
