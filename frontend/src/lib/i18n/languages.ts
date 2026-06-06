import enTranslations from "@/lib/i18n/locales/en.json";

export const LANGUAGE_STORAGE_KEY = "dsiq-language";

export const languages = [
  { code: "auto", label: enTranslations["settings.language.autoDetect"], aiName: "Auto Detect" },
  { code: "en", label: "English", aiName: "English" },
  { code: "ha", label: "Hausa", aiName: "Hausa" },
  { code: "ar", label: "Arabic", aiName: "Arabic", direction: "rtl" },
  { code: "fr", label: "French", aiName: "French" },
  { code: "es", label: "Spanish", aiName: "Spanish" },
  { code: "pt", label: "Portuguese", aiName: "Portuguese" },
  { code: "de", label: "German", aiName: "German" },
  { code: "it", label: "Italian", aiName: "Italian" },
  { code: "tr", label: "Turkish", aiName: "Turkish" },
  { code: "ru", label: "Russian", aiName: "Russian" },
  { code: "zh-CN", label: "Chinese (Simplified)", aiName: "Chinese" },
  { code: "zh-TW", label: "Chinese (Traditional)", aiName: "Chinese" },
  { code: "ja", label: "Japanese", aiName: "Japanese" },
  { code: "ko", label: "Korean", aiName: "Korean" },
  { code: "hi", label: "Hindi", aiName: "Hindi" },
  { code: "ur", label: "Urdu", aiName: "Urdu", direction: "rtl" },
  { code: "bn", label: "Bengali", aiName: "Bengali" },
  { code: "id", label: "Indonesian", aiName: "Indonesian" },
  { code: "ms", label: "Malay", aiName: "Malay" },
  { code: "sw", label: "Swahili", aiName: "Swahili" },
  { code: "yo", label: "Yoruba", aiName: "Yoruba" },
  { code: "ig", label: "Igbo", aiName: "Igbo" },
  { code: "am", label: "Amharic", aiName: "Amharic" },
  { code: "so", label: "Somali", aiName: "Somali" },
  { code: "ff", label: "Fulfulde", aiName: "Fulfulde" },
  { code: "kr", label: "Kanuri", aiName: "Kanuri" },
  { code: "nl", label: "Dutch", aiName: "Dutch" },
  { code: "sv", label: "Swedish", aiName: "Swedish" },
  { code: "pl", label: "Polish", aiName: "Polish" },
  { code: "uk", label: "Ukrainian", aiName: "Ukrainian" },
  { code: "vi", label: "Vietnamese", aiName: "Vietnamese" },
  { code: "th", label: "Thai", aiName: "Thai" },
  { code: "fa", label: "Persian", aiName: "Persian", direction: "rtl" },
  { code: "he", label: "Hebrew", aiName: "Hebrew", direction: "rtl" },
  { code: "el", label: "Greek", aiName: "Greek" },
  { code: "ro", label: "Romanian", aiName: "Romanian" },
  { code: "cs", label: "Czech", aiName: "Czech" },
  { code: "hu", label: "Hungarian", aiName: "Hungarian" },
  { code: "da", label: "Danish", aiName: "Danish" },
  { code: "fi", label: "Finnish", aiName: "Finnish" },
  { code: "no", label: "Norwegian", aiName: "Norwegian" }
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

export function isLanguageCode(value: string | null): value is LanguageCode {
  return languages.some((item) => item.code === value);
}

export function getLanguageByCode(languageCode: string | null) {
  return languages.find((item) => item.code === languageCode);
}

export function getBrowserLanguage(): LanguageCode {
  if (typeof navigator === "undefined") {
    return "en";
  }

  const deviceLanguage = navigator.language || "en";
  const exactMatch = languages.find((item) => item.code === deviceLanguage);
  const baseMatch = languages.find(
    (item) => item.code === deviceLanguage.split("-")[0],
  );

  return (exactMatch || baseMatch)?.code || "en";
}

export function getAppliedLanguage(languageCode: LanguageCode): LanguageCode {
  return languageCode === "auto" ? getBrowserLanguage() : languageCode;
}

export function getLanguageDirection(languageCode: LanguageCode) {
  const language = getLanguageByCode(getAppliedLanguage(languageCode));
  return language && "direction" in language ? language.direction : "ltr";
}

export function getStoredLanguagePreference() {
  if (typeof window === "undefined") {
    return "auto" as LanguageCode;
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguageCode(savedLanguage) ? savedLanguage : "auto";
}

export function getAiLanguageInstruction(languageCodeInput?: string | null) {
  const languageCode = isLanguageCode(languageCodeInput ?? null)
    ? languageCodeInput
    : getStoredLanguagePreference();

  if (languageCode === "auto") {
    return "Language preference: Auto Detect. Respond in the main language of the user's latest message. If the user mixes languages, use the main language. Only use English if the user uses English or asks for English.";
  }

  const selectedLanguageCode = languageCode as LanguageCode;
  const language = getLanguageByCode(selectedLanguageCode);
  const languageName = language?.aiName || languageCode;
  return `Language preference: ${languageName}. Reply in ${languageName} unless the user's latest message clearly asks for a different language. If the user writes in another language, follow the user's latest message language.`;
}

export function t(key: keyof typeof enTranslations) {
  return enTranslations[key];
}
