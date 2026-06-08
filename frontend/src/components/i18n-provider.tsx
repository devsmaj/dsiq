"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { I18nextProvider } from "react-i18next";

import { useAuth } from "@/components/auth-provider";
import {
  getFirebaseUserProfile,
  updateFirebaseUserLanguage,
} from "@/lib/firebase-user-records";
import i18n from "@/lib/i18n";
import {
  getAppliedLanguage,
  getLanguageDirection,
  getStoredLanguagePreference,
  isLanguageCode,
  LANGUAGE_STORAGE_KEY,
  type LanguageCode,
} from "@/lib/i18n/languages";
import { saveGuestPersonalizationSettings } from "@/lib/personalization";
import {
  readLocalUserProfile,
  updateLocalUserLanguage,
} from "@/lib/user-profile-store";

type DsiqLanguageContextValue = {
  currentLanguage: LanguageCode;
  setCurrentLanguage: (language: LanguageCode) => Promise<void>;
};

const DsiqLanguageContext = createContext<DsiqLanguageContextValue | null>(null);

function applyAppLanguage(language: LanguageCode) {
  const appliedLanguage = getAppliedLanguage(language);
  document.documentElement.lang = appliedLanguage;
  document.documentElement.dir = getLanguageDirection(language);
  void i18n.changeLanguage(appliedLanguage);
}

export function DsiqI18nProvider({ children }: { children: React.ReactNode }) {
  const { authMode, isLoading: isAuthLoading, user } = useAuth();
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>(
    getStoredLanguagePreference,
  );

  useEffect(() => {
    applyAppLanguage(currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    async function loadUserLanguage() {
      if (isAuthLoading || !user) {
        return;
      }

      const localLanguageCandidate = readLocalUserProfile(user.uid)?.languagePreference ?? null;

      if (
        isLanguageCode(localLanguageCandidate) &&
        localLanguageCandidate !== currentLanguage
      ) {
        setCurrentLanguageState(localLanguageCandidate);
      }

      if (authMode !== "firebase" || user.uid.startsWith("local-")) {
        return;
      }

      try {
        const profile = await getFirebaseUserProfile(user.uid);
        const profileLanguageCandidate =
          profile?.preferredLanguage || profile?.languagePreference || null;

        if (
          isLanguageCode(profileLanguageCandidate) &&
          profileLanguageCandidate !== currentLanguage
        ) {
          window.localStorage.setItem(LANGUAGE_STORAGE_KEY, profileLanguageCandidate);
          setCurrentLanguageState(profileLanguageCandidate);
        }
      } catch (error) {
        console.warn("Language preference could not load from profile.", error);
      }
    }

    void loadUserLanguage();
  }, [authMode, currentLanguage, isAuthLoading, user]);

  const contextValue = useMemo<DsiqLanguageContextValue>(() => ({
    currentLanguage,
    async setCurrentLanguage(language: LanguageCode) {
      const savedLanguage = language === "auto" ? null : language;

      setCurrentLanguageState(language);
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      saveGuestPersonalizationSettings({ preferredLanguage: language });

      if (!user) {
        return;
      }

      updateLocalUserLanguage(user.uid, savedLanguage);

      if (authMode !== "firebase" || user.uid.startsWith("local-")) {
        return;
      }

      try {
        await updateFirebaseUserLanguage({
          languagePreference: savedLanguage,
          uid: user.uid,
        });
      } catch (error) {
        console.warn("Language preference could not sync to profile.", error);
      }
    },
  }), [authMode, currentLanguage, user]);

  return (
    <DsiqLanguageContext.Provider value={contextValue}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </DsiqLanguageContext.Provider>
  );
}

export function useDsiqLanguage() {
  const value = useContext(DsiqLanguageContext);

  if (!value) {
    throw new Error("useDsiqLanguage must be used inside DsiqI18nProvider.");
  }

  return value;
}
