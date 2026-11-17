"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building, Compass, Plus, Ticket } from "lucide-react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";

const TABS = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/my-tickets", label: "Tickets", icon: Ticket },
  { href: "/create-event", label: "Create", icon: Plus },
  { href: "/my-events", label: "Events", icon: Building },
];

const itemClass =
  "flex flex-1 min-h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-medium";

// Bottom navigation for phones. Desktop uses the header links instead.
export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed inset-x-0 bottom-0 z-30 h-16 border-t bg-background/85 backdrop-blur-xl flex items-center justify-around px-1"
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname?.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`${itemClass} ${
              active ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
      <div className={`${itemClass} text-muted-foreground`}>
        <Authenticated>
          <UserButton afterSignOutUrl="/" />
        </Authenticated>
        <Unauthenticated>
          <SignInButton mode="modal">
            <button className="flex flex-col items-center gap-0.5 cursor-pointer">
              <span className="size-5 rounded-full border-2 border-current" />
              Sign in
            </button>
          </SignInButton>
        </Unauthenticated>
      </div>
    </nav>
  );
}
