"use client";

import { getFirebaseUserProfile } from "@/lib/firebase-user-records";
import { readLocalUserProfile } from "@/lib/user-profile-store";

type RouteUser = {
  uid: string;
};

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
        ? await getFirebaseUserProfile(user.uid)
        : localProfile;

    return profile?.onboardingCompleted ? "/dsiq/chat" : "/onboarding";

  } catch (error) {
    console.warn("DSIQ profile routing failed; sending user to onboarding.", error);
    return "/onboarding";
  }
}
