// packages/payments/src/lib/payments/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createCheckoutSession, createCustomerPortalSession } from "./stripe";
import { withTeam } from "@your-org/auth/lib/auth/middleware";

export const checkoutAction = withTeam(async (formData, team) => {
  const priceId = formData.get("priceId") as string;
  const session = await createCheckoutSession({ team, priceId });
  redirect(session.url!);
});

export const customerPortalAction = withTeam(async (_, team) => {
  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
});
