"use client";

import { Calendar, MapPin, Users, Trash2, X, QrCode, Eye } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DEFAULT_THEME = "#1e3a8a";

function spotsInfo(event) {
  const left = Math.max((event.capacity ?? 0) - (event.registrationCount ?? 0), 0);
  const pct = event.capacity
    ? Math.min(Math.round((event.registrationCount / event.capacity) * 100), 100)
    : 0;
  return { left, pct, full: left === 0 && event.capacity > 0 };
}

function priceLabel(event) {
  if (event.ticketType === "free") return "Free";
  return event.ticketPrice ? `₹${event.ticketPrice}` : "Paid";
}

export default function EventCard({
  event,
  onClick,
  onDelete,
  variant = "grid", // "grid" or "list"
  action = null, // "event" | "ticket" | null
  className = "",
}) {
  const theme = event.themeColor || DEFAULT_THEME;
  const { left, pct, full } = spotsInfo(event);

  // List variant (compact horizontal layout)
  if (variant === "list") {
    return (
      <Card
        className={`py-0 group rounded-2xl ${
          onClick
            ? "cursor-pointer hover:border-brand/50 transition-colors"
            : ""
        } ${className}`}
        onClick={onClick}
      >
        <CardContent className="p-3 flex gap-3 items-center">
          {/* Event image */}
          <div className="size-[72px] rounded-xl shrink-0 overflow-hidden relative">
            {event.coverImage ? (
              <Image
                src={event.coverImage}
                alt=""
                fill
                sizes="72px"
                className="object-cover"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center text-3xl"
                style={{ backgroundColor: theme }}
              >
                {getCategoryIcon(event.category)}
              </div>
            )}
          </div>

          {/* Event details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-brand transition-colors">
              {event.title}
            </h3>
            <p className="text-[13px] text-muted-foreground mt-1">
              {format(event.startDate, "EEE, dd MMM, HH:mm")} ·{" "}
              {event.locationType === "online" ? "Online" : event.city}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {event.registrationCount} attending
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid variant (default)
  return (
    <Card
      className={`overflow-hidden group pt-0 gap-0 rounded-2xl ${
        onClick
          ? "cursor-pointer hover:border-brand/50 hover:-translate-y-0.5 transition-all"
          : ""
      } ${className}`}
      onClick={onClick}
    >
      <div className="relative h-40 overflow-hidden">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            width={500}
            height={192}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: theme }}
          >
            {getCategoryIcon(event.category)}
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
          {getCategoryLabel(event.category)}
        </span>
        <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-neutral-900">
          {priceLabel(event)}
        </span>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-brand transition-colors">
            {event.title}
          </h3>
          <div className="mt-1.5 space-y-1 text-[13px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 shrink-0" />
              <span>{format(event.startDate, "EEE, dd MMM · p")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0" />
              <span className="line-clamp-1">
                {event.locationType === "online"
                  ? "Online event"
                  : `${event.city}, ${event.state || event.country}`}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div
            className="h-1 rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Spots filled"
          >
            <div
              className="h-1 rounded-full"
              style={{ width: `${pct}%`, backgroundColor: theme }}
            />
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            {full ? "Full" : `${left} spots left`} · {event.registrationCount} /{" "}
            {event.capacity} registered
          </div>
        </div>

        {action && (
          <div className="flex gap-2 pt-1">
            {/* Primary button */}
            <Button
              variant="outline"
              className="flex-1 gap-2 h-11"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(e);
              }}
            >
              {action === "event" ? (
                <>
                  <Eye className="size-4" />
                  View
                </>
              ) : (
                <>
                  <QrCode className="size-4" />
                  Show ticket
                </>
              )}
            </Button>

            {/* Secondary button: delete or cancel */}
            {onDelete && (
              <Button
                variant="outline"
                className="size-11 p-0 text-destructive hover:text-destructive"
                aria-label={action === "event" ? "Delete event" : "Cancel ticket"}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event._id);
                }}
              >
                {action === "event" ? (
                  <Trash2 className="size-4" />
                ) : (
                  <X className="size-4" />
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
