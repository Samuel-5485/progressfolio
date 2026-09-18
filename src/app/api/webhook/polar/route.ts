import { Webhooks } from "@polar-sh/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { syncPolarSubscription } from "@/lib/billing/sync-subscription";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "POLAR_WEBHOOK_SECRET is not set" }, { status: 503 });
  }

  const handler = Webhooks({
    webhookSecret,
    onPayload: async (payload) => {
      if (typeof payload.type === "string" && payload.type.startsWith("subscription.")) {
        await syncPolarSubscription(payload.data, payload.type);
      }
    },
  });

  return handler(request);
}
