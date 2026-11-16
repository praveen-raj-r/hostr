"use node";

import { Webhook } from "svix";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Event types that mean "this subscription item is the user's live plan".
// Confirmed against Clerk's Billing webhook event catalog.
const ACTIVE_EVENTS = new Set(["subscriptionItem.active"]);

// Event types that mean "this plan is no longer active for the user" —
// i.e. they should fall back to the free plan.
const INACTIVE_EVENTS = new Set([
  "subscriptionItem.canceled",
  "subscriptionItem.ended",
  "subscriptionItem.abandoned",
]);

// Payload shape per Clerk's Billing webhook docs: the user id is at
// data.payer.user_id and the plan slug at data.plan.slug. (Documented for the
// subscriptionItem.* family; if Clerk's real payload ever differs, the handler
// logs the payload's key structure — never its values — to make that visible.)
function extractClerkUserId(data) {
  return data?.payer?.user_id ?? null;
}

function extractPlanSlug(data) {
  const slug = data?.plan?.slug;
  return typeof slug === "string" ? slug.toLowerCase() : null;
}

// Key names only, so logs stay useful without leaking PII or billing details.
function describeShape(value, depth = 0) {
  if (value === null || typeof value !== "object" || depth >= 2) {
    return typeof value;
  }
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, describeShape(v, depth + 1)])
  );
}

export const handleClerkWebhook = internalAction({
  args: {
    body: v.string(),
    svixId: v.string(),
    svixTimestamp: v.string(),
    svixSignature: v.string(),
  },
  handler: async (ctx, args) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error(
        "CLERK_WEBHOOK_SECRET is not set. Run: npx convex env set CLERK_WEBHOOK_SECRET whsec_..."
      );
    }

    const wh = new Webhook(secret);
    let event;
    try {
      event = wh.verify(args.body, {
        "svix-id": args.svixId,
        "svix-timestamp": args.svixTimestamp,
        "svix-signature": args.svixSignature,
      });
    } catch (err) {
      throw new Error(`Clerk webhook signature verification failed: ${err.message}`);
    }

    const { type, data } = event;

    if (!ACTIVE_EVENTS.has(type) && !INACTIVE_EVENTS.has(type)) {
      // Not a plan-affecting event we care about (e.g. paymentAttempt.*) — ignore.
      return;
    }

    const clerkUserId = extractClerkUserId(data);
    if (!clerkUserId) {
      console.warn(
        `Clerk webhook ${type}: no payer.user_id in payload. Shape: ${JSON.stringify(describeShape(data))}`
      );
      return;
    }

    let plan = "free";
    if (ACTIVE_EVENTS.has(type)) {
      const slug = extractPlanSlug(data);
      if (!slug) {
        console.warn(
          `Clerk webhook ${type}: no plan.slug in payload. Shape: ${JSON.stringify(describeShape(data))}`
        );
        return;
      }
      // Must match the slug used by has({ plan: "pro" }) in the client.
      plan = slug === "pro" ? "pro" : "free";
    }
    // INACTIVE_EVENTS always mean plan = "free" (already set above).

    await ctx.runMutation(internal.users.setPlanByClerkUserId, {
      clerkUserId,
      plan,
    });
  },
});
