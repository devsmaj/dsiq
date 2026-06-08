import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "@/lib/i18n/locales/ar.json";
import en from "@/lib/i18n/locales/en.json";
import es from "@/lib/i18n/locales/es.json";
import fr from "@/lib/i18n/locales/fr.json";
import ha from "@/lib/i18n/locales/ha.json";

import { getAppliedLanguage, getStoredLanguagePreference } from "./languages";

const resources = {
  ar: { translation: ar },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  ha: { translation: ha },
};

function getInitialI18nLanguage() {
  if (typeof window === "undefined") {
    return "en";
  }

  return getAppliedLanguage(getStoredLanguagePreference());
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    lng: getInitialI18nLanguage(),
    resources,
    returnEmptyString: false,
    supportedLngs: false,
  });
}

export default i18n;
