"use node";

import { Webhook } from "svix";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Must match the plan key used by has({ plan: "pro" }) in the client.
const PRO_PLAN_SLUG = "pro";

// Event types that mean "this subscription item is the user's live plan".
// Confirmed against Clerk's Billing webhook event catalog.
// "subscriptionItem.updated" is also accepted, but only counts as an upgrade
// when the item's own status is "active" (checked below). In practice Clerk
// delivers .updated on upgrade, and .active may not be sent to every endpoint.
const ACTIVE_EVENTS = new Set(["subscriptionItem.active"]);
const UPDATE_EVENT = "subscriptionItem.updated";

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

    if (
      !ACTIVE_EVENTS.has(type) &&
      !INACTIVE_EVENTS.has(type) &&
      type !== UPDATE_EVENT
    ) {
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

    // Only the Pro plan item matters. Subscribing to Pro also fires events for
    // the Free plan item (e.g. free_user ending); acting on those could
    // overwrite "pro" with "free" depending on delivery order. Free is the
    // default, so ignoring non-Pro items is safe.
    const slug = extractPlanSlug(data);
    if (!slug) {
      console.warn(
        `Clerk webhook ${type}: no plan.slug in payload. Shape: ${JSON.stringify(describeShape(data))}`
      );
      return;
    }
    if (slug !== PRO_PLAN_SLUG) {
      console.log(`Clerk webhook ${type}: ignoring non-pro plan "${slug}"`);
      return;
    }

    let plan;
    if (ACTIVE_EVENTS.has(type)) {
      plan = "pro";
    } else if (INACTIVE_EVENTS.has(type)) {
      plan = "free";
    } else {
      // subscriptionItem.updated: only an active Pro item upgrades the user.
      if (data?.status !== "active") {
        console.log(
          `Clerk webhook ${type}: pro item status "${data?.status}" - no change`
        );
        return;
      }
      plan = "pro";
    }
    console.log(`Clerk webhook ${type}: plan "${slug}" -> ${plan}`);

    await ctx.runMutation(internal.users.setPlanByClerkUserId, {
      clerkUserId,
      plan,
    });
  },
});
