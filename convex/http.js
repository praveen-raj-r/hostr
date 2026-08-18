import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Clerk Billing webhook endpoint. Configure this URL in the Clerk Dashboard
// (Webhooks > Add Endpoint) as: https://<your-deployment>.convex.site/clerk/webhook
// Note the .convex.site domain — Convex HTTP actions are served from a
// different host than the .convex.cloud client/API URL.
http.route({
  path: "/clerk/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const body = await request.text();

    try {
      await ctx.runAction(internal.clerkWebhook.handleClerkWebhook, {
        body,
        svixId,
        svixTimestamp,
        svixSignature,
      });
    } catch (err) {
      console.error("Clerk webhook handling failed:", err);
      return new Response("Webhook handler error", { status: 400 });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
