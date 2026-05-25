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
  try {
    const profile =
      authMode === "firebase" && !user.uid.startsWith("local-")
        ? await getFirebaseUserProfile(user.uid)
        : readLocalUserProfile(user.uid);

    return profile?.onboardingCompleted ? "/dsiq/chat" : "/onboarding";
  } catch (error) {
    console.warn("DSIQ profile routing failed; sending user to onboarding.", error);
    const localProfile = readLocalUserProfile(user.uid);
    return localProfile?.onboardingCompleted ? "/dsiq/chat" : "/onboarding";
  }
}
