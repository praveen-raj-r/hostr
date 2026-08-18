import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Store or update user from Clerk
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this identity before
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      // If we've seen this identity before but details changed, update them
      const updates = {};
      if (user.name !== identity.name) {
        updates.name = identity.name ?? "Anonymous";
      }
      if (user.email !== identity.email) {
        updates.email = identity.email ?? "";
      }
      if (user.imageUrl !== identity.pictureUrl) {
        updates.imageUrl = identity.pictureUrl;
      }
      // Backfill for users created before clerkUserId was tracked
      if (user.clerkUserId !== identity.subject) {
        updates.clerkUserId = identity.subject;
      }

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = Date.now();
        await ctx.db.patch(user._id, updates);
      }

      return user._id;
    }

    // If it's a new identity, create a new user with defaults
    return await ctx.db.insert("users", {
      email: identity.email ?? "",
      tokenIdentifier: identity.tokenIdentifier,
      clerkUserId: identity.subject,
      name: identity.name ?? "Anonymous",
      imageUrl: identity.pictureUrl,
      hasCompletedOnboarding: false,
      freeEventsCreated: 0,
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Set a user's plan from the Clerk Billing webhook (convex/clerkWebhook.js).
// Internal only — must never be callable directly from the client, since it's
// the sole source of truth for paid-plan gating in convex/events.js.
export const setPlanByClerkUserId = internalMutation({
  args: {
    clerkUserId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .unique();

    if (!user) {
      // The user may not have signed into the app yet (no Convex row exists).
      // Nothing to update — they'll get the correct plan once `store` runs
      // and clerkUserId matches, since this webhook may also arrive again
      // on subscription updates. Log so it's visible rather than silently lost.
      console.warn(
        `setPlanByClerkUserId: no Convex user found for clerkUserId=${args.clerkUserId}`
      );
      return;
    }

    await ctx.db.patch(user._id, {
      plan: args.plan,
      updatedAt: Date.now(),
    });
  },
});

// Get current authenticated user
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 🔹 Lookup by tokenIdentifier
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
});

// Complete onboarding (attendee preferences)
export const completeOnboarding = mutation({
  args: {
    location: v.object({
      city: v.string(),
      state: v.optional(v.string()), // Added state field
      country: v.string(),
    }),
    interests: v.array(v.string()), // Min 3 categories
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    await ctx.db.patch(user._id, {
      location: args.location,
      interests: args.interests,
      hasCompletedOnboarding: true,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});
