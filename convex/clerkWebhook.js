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

// NOTE ON PAYLOAD SHAPE: Clerk's exact Billing webhook payload field names
// (where the Clerk user id and plan slug live inside `data`) could not be
// confirmed from documentation at the time this was written. This tries
// several plausible locations and the handler logs the raw payload so the
// real shape can be read from Convex's function logs on the first real
// webhook delivery — adjust these two functions if the fields differ.
function extractClerkUserId(data) {
  return (
    data?.payer?.user_id ??
    data?.payer_id ??
    data?.subscriber_id ??
    data?.user_id ??
    data?.subscription?.payer?.user_id ??
    null
  );
}

function extractPlanSlug(data) {
  const slug = data?.plan?.slug ?? data?.plan_slug ?? data?.plan?.name ?? null;
  return slug ? String(slug).toLowerCase() : null;
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

    // Logged deliberately: this is how you confirm/fix the field paths above
    // against the real payload shape from your Clerk account.
    console.log(`Clerk webhook received: ${type}`, JSON.stringify(data));

    if (!ACTIVE_EVENTS.has(type) && !INACTIVE_EVENTS.has(type)) {
      // Not a plan-affecting event we care about (e.g. paymentAttempt.*) — ignore.
      return;
    }

    const clerkUserId = extractClerkUserId(data);
    if (!clerkUserId) {
      console.warn(
        `Clerk webhook ${type}: could not find a Clerk user id in the payload — see logged payload above and fix extractClerkUserId().`
      );
      return;
    }

    let plan = "free";
    if (ACTIVE_EVENTS.has(type)) {
      const slug = extractPlanSlug(data);
      if (!slug) {
        console.warn(
          `Clerk webhook ${type}: could not find a plan slug in the payload — see logged payload above and fix extractPlanSlug().`
        );
        return;
      }
      plan = slug.includes("pro") ? "pro" : "free";
    }
    // INACTIVE_EVENTS always mean plan = "free" (already set above).

    await ctx.runMutation(internal.users.setPlanByClerkUserId, {
      clerkUserId,
      plan,
    });
  },
});
