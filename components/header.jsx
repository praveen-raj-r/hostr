"use client";

import { useState } from "react";
import Link from "next/link";
import { Building, Crown, Plus, Ticket } from "lucide-react";
import { SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { BarLoader } from "react-spinners";
import { useStoreUser } from "@/hooks/use-store-user";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import UpgradeModal from "./upgrade-modal";
import { Badge } from "@/components/ui/badge";
import OnboardingModal from "./onboarding-modal";
import dynamic from "next/dynamic";

const SearchLocationBar = dynamic(
  () => import("@/components/search-location-bar"),
  { ssr: false }
);

export default function Header() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { isLoading } = useStoreUser();
  const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } =
    useOnboarding();

  const { has } = useAuth();
  const hasPro = has?.({ plan: "pro" });

  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-16 py-2 flex items-center gap-4">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Hostr home"
            className="flex items-center shrink-0"
          >
            <Image
              src="/hostr.png"
              alt="Hostr logo"
              width={500}
              height={500}
              className="w-auto h-9"
              priority
            />

            {hasPro && (
              <Badge className="bg-linear-to-r from-pink-500 to-orange-500 gap-1 text-white ml-3">
                <Crown className="w-3 h-3" />
                Pro
              </Badge>
            )}
          </Link>

          {/* Search & Location - Desktop */}
          <div className="hidden md:flex flex-1 justify-center min-w-0">
            <SearchLocationBar />
          </div>

          {/* Right side actions */}
          <nav
            aria-label="Main"
            className="ml-auto flex items-center gap-1 sm:gap-2"
          >
            {!hasPro && (
              <Button
                variant="ghost"
                className="hidden sm:inline-flex h-11"
                onClick={() => setShowUpgradeModal(true)}
              >
                Pricing
              </Button>
            )}

            <Button
              variant="ghost"
              asChild
              className="hidden sm:inline-flex h-11"
            >
              <Link href="/explore">Explore</Link>
            </Button>

            <Authenticated>
              <Button
                asChild
                className="hidden md:inline-flex h-11 px-4 gap-2"
              >
                <Link href="/create-event">
                  <Plus className="size-4" />
                  Create event
                </Link>
              </Button>

              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "size-10",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="My Tickets"
                    labelIcon={<Ticket size={16} />}
                    href="/my-tickets"
                  />
                  <UserButton.Link
                    label="My Events"
                    labelIcon={<Building size={16} />}
                    href="/my-events"
                  />
                  <UserButton.Action label="manageAccount" />
                </UserButton.MenuItems>
              </UserButton>
            </Authenticated>

            <Unauthenticated>
              <SignInButton mode="modal">
                <Button className="h-11 px-5">Sign in</Button>
              </SignInButton>
            </Unauthenticated>
          </nav>
        </div>

        {/* Mobile search and location, below the main row */}
        <div className="md:hidden border-t px-3 py-2">
          <SearchLocationBar />
        </div>

        {isLoading && (
          <div className="absolute bottom-0 left-0 w-full">
            <BarLoader width={"100%"} color="#a855f7" />
          </div>
        )}
      </header>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingSkip}
        onComplete={handleOnboardingComplete}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="header"
      />
    </>
  );
}
