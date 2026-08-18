"use client";

import { usePathname, useRouter } from "next/navigation";
import { useConvexQuery } from "./use-convex-query";
import { api } from "@/convex/_generated/api";

// Pages that require onboarding (attendee-centered)
const ATTENDEE_PAGES = ["/explore", "/events", "/my-tickets", "/profile"];

export function useOnboarding() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: currentUser, isLoading } = useConvexQuery(
    api.users.getCurrentUser
  );

  // Derived directly from query state instead of mirrored into its own
  // useState set from a useEffect (that pattern is what
  // react-hooks/set-state-in-effect flags — it was previously silenced
  // with an eslint-disable rather than removed). currentUser is a live
  // Convex query, so this recomputes on its own once completeOnboarding
  // commits — no manual refresh needed to make the modal close.
  const needsOnboarding =
    !isLoading && !!currentUser && !currentUser.hasCompletedOnboarding;
  const pageRequiresOnboarding = ATTENDEE_PAGES.some((page) =>
    pathname.startsWith(page)
  );
  const showOnboarding = needsOnboarding && pageRequiresOnboarding;

  const handleOnboardingComplete = () => {
    // No-op: currentUser.hasCompletedOnboarding flips via Convex's live
    // query the moment the mutation commits, which closes the modal.
  };

  const handleOnboardingSkip = () => {
    // Redirect back to homepage if they skip — "/" isn't in ATTENDEE_PAGES,
    // so showOnboarding becomes false as soon as the route changes.
    router.push("/");
  };

  return {
    showOnboarding,
    handleOnboardingComplete,
    handleOnboardingSkip,
    needsOnboarding,
  };
}
