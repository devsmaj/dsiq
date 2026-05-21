"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import {
  getFirebaseUserProfile,
  type FirebaseUserProfile,
} from "@/lib/firebase-user-records";
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

      try {
        if (authMode === "firebase") {
          const nextProfile = await getFirebaseUserProfile(user.uid);
          setProfile(nextProfile);
        } else {
          setProfile(readLocalUserProfile(user.uid));
        }
      } catch {
        setProfile(null);
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
