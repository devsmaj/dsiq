"use client";

import { getFirebaseUserProfile } from "@/lib/firebase-user-records";
import { readLocalUserProfile } from "@/lib/user-profile-store";

type RouteUser = {
  uid: string;
};

const FIREBASE_PROFILE_READ_TIMEOUT_MS = 3000;

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
            FIREBASE_PROFILE_READ_TIMEOUT_MS,
            "Firebase profile routing lookup timed out.",
          )
        : localProfile;

    return profile?.onboardingCompleted ? "/dsiq/chat" : "/onboarding";

  } catch (error) {
    console.warn("DSIQ profile routing failed; sending user to onboarding.", error);
    return "/onboarding";
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);

    promise
      .then((value) => {
        window.clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timeout);
        reject(error);
      });
  });
}
