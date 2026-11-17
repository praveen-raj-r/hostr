"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import EventCard from "@/components/event-card";

// Upcoming featured events for the landing page. Renders nothing when there
// are none (or while loading) so the page never shows an empty shell.
export default function LandingFeatured() {
  const router = useRouter();
  const { data: events } = useConvexQuery(api.explore.getFeaturedEvents, {
    limit: 3,
  });

  if (!events || events.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-end justify-between gap-3 mb-6">
        <h2 className="text-[clamp(26px,4vw,38px)] font-bold tracking-tight">
          Happening soon
        </h2>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 min-h-11 text-sm font-medium hover:text-brand"
        >
          View all <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            onClick={() => router.push(`/events/${event.slug}`)}
          />
        ))}
      </div>
    </section>
  );
}
