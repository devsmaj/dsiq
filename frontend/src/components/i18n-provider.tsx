"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";

import i18n from "@/lib/i18n";
import {
  getAppliedLanguage,
  getLanguageDirection,
  getStoredLanguagePreference,
} from "@/lib/i18n/languages";

export function DsiqI18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function applyDocumentLanguage(language: string) {
      document.documentElement.lang = language;
      document.documentElement.dir =
        language === "ar" || language === "ur" || language === "fa" || language === "he"
          ? "rtl"
          : "ltr";
    }

    const preferredLanguage = getStoredLanguagePreference();
    const appliedLanguage = getAppliedLanguage(preferredLanguage);
    void i18n.changeLanguage(appliedLanguage);
    document.documentElement.lang = appliedLanguage;
    document.documentElement.dir = getLanguageDirection(preferredLanguage);

    i18n.on("languageChanged", applyDocumentLanguage);
    return () => {
      i18n.off("languageChanged", applyDocumentLanguage);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

