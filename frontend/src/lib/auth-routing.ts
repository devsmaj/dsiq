"use client";

import { getFirebaseUserProfile } from "@/lib/firebase-user-records";
import { readLocalUserProfile } from "@/lib/user-profile-store";
import { withTimeout } from "@/lib/async-timeout";

type RouteUser = {
  uid: string;
};

const PROFILE_ROUTE_LOOKUP_TIMEOUT_MS = 10000;

export async function getPostAuthPath(
  user: RouteUser,
  authMode: "firebase" | "local",
) {
  const localProfile = readLocalUserProfile(user.uid);
  if (localProfile?.onboardingCompleted) {
    return "/dsiq/chat";
  }


  try {
    const profile =
      authMode === "firebase" && !user.uid.startsWith("local-")
        ? await withTimeout(
            getFirebaseUserProfile(user.uid),
            PROFILE_ROUTE_LOOKUP_TIMEOUT_MS,
            "Firebase profile routing lookup timed out.",
          )
        : localProfile;

    return profile?.onboardingCompleted ? "/dsiq/chat" : "/onboarding";

  } catch (error) {
    console.warn("DSIQ profile routing failed; sending user to onboarding.", error);
    return "/onboarding";
  }
}
