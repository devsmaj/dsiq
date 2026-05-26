"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import {
  getFirebaseUserProfile,
  type FirebaseUserProfile,
} from "@/lib/firebase-user-records";
import { withTimeout } from "@/lib/async-timeout";
import { readLocalUserProfile, type StoredUserProfile } from "@/lib/user-profile-store";

type ProfileState = StoredUserProfile | FirebaseUserProfile | null;

export function useUserProfile() {
  const { authMode, authMessage, user } = useAuth();
  const [profile, setProfile] = useState<ProfileState>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null);
        setProfileError(null);
        setIsProfileLoading(false);
        return;
      }

      setIsProfileLoading(true);
      setProfileError(null);

      const localProfile = readLocalUserProfile(user.uid);
      setProfile(localProfile);

      try {
        if (authMode === "firebase" && !user.uid.startsWith("local-")) {
          const firebaseProfile = await withTimeout(
            getFirebaseUserProfile(user.uid),
            undefined,
            "Firebase profile loading timed out.",
          );

          setProfile(
            firebaseProfile
              ? {
                  ...localProfile,
                  ...firebaseProfile,
                  onboardingAnswers:
                    firebaseProfile.onboardingAnswers ||
                    localProfile?.onboardingAnswers,
                  onboardingCompleted:
                    firebaseProfile.onboardingCompleted ||
                    localProfile?.onboardingCompleted,
                }
              : localProfile,
          );
        } else {
          setProfile(localProfile);
        }
      } catch {
        setProfile(localProfile);
        setProfileError(
          "We could not load your saved profile right now. Please refresh or try again in a moment.",
        );
      } finally {
        setIsProfileLoading(false);
      }
    }

    void loadProfile();
  }, [authMode, user]);

  return {
    user,
    authMode,
    authMessage,
    profile,
    answers: profile?.onboardingAnswers,
    hasAnswers: Boolean(profile?.onboardingAnswers),
    isProfileLoading,
    profileError,
  };
}
