import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./lib/auth";

// Keep in sync with FREE_PLAN_LIMIT in lib/constants.js
const FREE_PLAN_LIMIT = 1;

// Create a new event
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    timezone: v.string(),
    locationType: v.union(v.literal("physical"), v.literal("online")),
    venue: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.string(),
    state: v.optional(v.string()),
    country: v.string(),
    capacity: v.number(),
    ticketType: v.union(v.literal("free"), v.literal("paid")),
    ticketPrice: v.optional(v.number()),
    coverImage: v.optional(v.string()),
    themeColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const user = await requireUser(ctx);
      // hasPro must come from our own DB, set only by the Clerk Billing
      // webhook (convex/clerkWebhook.js) — never from client input or from
      // hasCompletedOnboarding, which every attendee sets regardless of plan.
      const hasPro = user?.plan === "pro";
      // SERVER-SIDE CHECK: Validate input
      const title = args.title.trim();
      if (!title || title.length > 120) {
        throw new Error("Title is required (max 120 characters)");
      }
      if (args.description.length > 5000) {
        throw new Error("Description is too long (max 5000 characters)");
      }
      if (args.tags.length > 10 || args.tags.some((t) => t.length > 50)) {
        throw new Error("Too many or too long tags");
      }
      if (!Number.isFinite(args.startDate) || !Number.isFinite(args.endDate) || args.endDate < args.startDate) {
        throw new Error("End date must be after the start date");
      }
      if (!Number.isInteger(args.capacity) || args.capacity < 1 || args.capacity > 100000) {
        throw new Error("Capacity must be a whole number between 1 and 100000");
      }
      if (args.ticketPrice !== undefined && (!Number.isFinite(args.ticketPrice) || args.ticketPrice < 0 || args.ticketPrice > 1000000)) {
        throw new Error("Invalid ticket price");
      }
      const isHttpUrl = (u) => {
        try {
          return ["http:", "https:"].includes(new URL(u).protocol);
        } catch {
          return false;
        }
      };
      if (args.venue && !isHttpUrl(args.venue)) {
        throw new Error("Venue link must be an http(s) URL");
      }
      if (args.coverImage) {
        let host = "";
        try {
          const u = new URL(args.coverImage);
          host = u.protocol === "https:" ? u.hostname : "";
        } catch {}
        if (host !== "images.unsplash.com") {
          throw new Error("Cover image must be an https Unsplash image");
        }
      }
      if (args.themeColor && !/^#[0-9a-fA-F]{6}$/.test(args.themeColor)) {
        throw new Error("Invalid theme color");
      }

      // SERVER-SIDE CHECK: Verify event limit for Free users
      if (!hasPro && user.freeEventsCreated >= FREE_PLAN_LIMIT) {
        throw new Error(
          "Free event limit reached. Please upgrade to Pro to create more events."
        );
      }

      // SERVER-SIDE CHECK: Verify custom color usage
      const defaultColor = "#1e3a8a";
      if (!hasPro && args.themeColor && args.themeColor !== defaultColor) {
        throw new Error(
          "Custom theme colors are a Pro feature. Please upgrade to Pro."
        );
      }

      // Force default color for Free users
      const themeColor = hasPro ? args.themeColor : defaultColor;

      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Create event
      const eventId = await ctx.db.insert("events", {
        ...args,
        title,
        themeColor, // Use validated color
        slug: `${slug}-${crypto.randomUUID().slice(0, 8)}`,
        organizerId: user._id,
        organizerName: user.name,
        registrationCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Update user's free event count
      await ctx.db.patch(user._id, {
        freeEventsCreated: user.freeEventsCreated + 1,
      });

      return eventId;
    } catch (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
  },
});

// Get event by slug
export const getEventBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    return event;
  },
});

// Get events by organizer
export const getMyEvents = query({
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const events = await ctx.db
      .query("events")
      .withIndex("by_organizer", (q) => q.eq("organizerId", user._id))
      .order("desc")
      .collect();

    return events;
  },
});

// Delete event
export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user is the organizer
    if (event.organizerId !== user._id) {
      throw new Error("You are not authorized to delete this event");
    }

    // Delete the event now and the first batch of registrations; if there are
    // more, finish in follow-up mutations so no single mutation exceeds
    // Convex's read/write limits for very large events.
    await ctx.db.delete(args.eventId);

    // Every created event counts toward the free quota (see createEvent),
    // so every deletion gives one back.
    if (user.freeEventsCreated > 0) {
      await ctx.db.patch(user._id, {
        freeEventsCreated: user.freeEventsCreated - 1,
      });
    }

    await ctx.scheduler.runAfter(0, internal.events.purgeRegistrations, {
      eventId: args.eventId,
    });

    return { success: true };
  },
});

const PURGE_BATCH_SIZE = 500;

// Internal: deletes an event's registrations in batches, re-scheduling itself
// until none remain.
export const purgeRegistrations = internalMutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const batch = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .take(PURGE_BATCH_SIZE);

    for (const registration of batch) {
      await ctx.db.delete(registration._id);
    }

    if (batch.length === PURGE_BATCH_SIZE) {
      await ctx.scheduler.runAfter(0, internal.events.purgeRegistrations, {
        eventId: args.eventId,
      });
    }
  },
});
