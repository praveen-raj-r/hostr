// Shared auth helper for Convex functions. Works in queries and mutations.
// Throws a clear error (instead of a TypeError on null) when the caller is
// signed out or their user row hasn't been created yet by users.store.
export async function requireUser(ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("You must be signed in");
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();
  if (!user) {
    throw new Error("User not found. Please refresh and sign in again.");
  }
  return user;
}
