// Process-local sliding-window rate limiter. On serverless this only holds
// within one instance; swap for Upstash Redis for a distributed limit.
const buckets = new Map(); // key -> timestamps[]

export function isRateLimited(key, limit, windowMs) {
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  buckets.set(key, timestamps);

  // Evict idle keys occasionally so the map can't grow without bound.
  if (buckets.size > 1000) {
    for (const [k, ts] of buckets) {
      if (ts.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return timestamps.length > limit;
}
