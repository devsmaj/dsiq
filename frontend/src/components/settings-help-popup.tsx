"use client";

import {
  Check,
  ChevronDown,
  Database,
  Monitor,
  Moon,
  Settings,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const OPEN_SETTINGS_EVENT = "dsiq:open-settings-help";
const LANGUAGE_STORAGE_KEY = "dsiq-language";
const APPEARANCE_STORAGE_KEY = "dsiq-appearance";

// Set to false to disable Google Website Translator integration entirely.
const ENABLE_GOOGLE_TRANSLATE = false;


const languages = [
  { code: "auto", label: "Auto-detect" },
  { code: "en", label: "English (US)" },
  { code: "ar", label: "Arabic" },
  { code: "it", label: "Italian" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "hi", label: "Hindi" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "ru", label: "Russian" },
  { code: "tr", label: "Turkish" },
  { code: "nl", label: "Dutch" },
  { code: "sv", label: "Swedish" },
  { code: "pl", label: "Polish" },
  { code: "uk", label: "Ukrainian" },
  { code: "id", label: "Indonesian" },
  { code: "vi", label: "Vietnamese" },
  { code: "th", label: "Thai" },
  { code: "fa", label: "Persian" },
  { code: "he", label: "Hebrew" },
  { code: "el", label: "Greek" },
  { code: "ro", label: "Romanian" },
  { code: "cs", label: "Czech" },
  { code: "hu", label: "Hungarian" },
  { code: "da", label: "Danish" },
  { code: "fi", label: "Finnish" },
  { code: "no", label: "Norwegian" },
  { code: "ha", label: "Hausa" },
  { code: "sw", label: "Swahili" },
] as const;

const appearanceOptions = [
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
] as const;

type LanguageCode = (typeof languages)[number]["code"];
type AppearanceValue = (typeof appearanceOptions)[number]["value"];

type GoogleTranslateWindow = Window &
  typeof globalThis & {
    google?: {
      translate?: {
        TranslateElement?: new (
          options: Record<string, unknown>,
          elementId: string,
        ) => void;
      };
    };
    googleTranslateElementInit?: () => void;
  };

function getInitialAppearance(): AppearanceValue {
  if (typeof window === "undefined") {
    return "system";
  }

  const savedAppearance = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
  return appearanceOptions.some((item) => item.value === savedAppearance)
    ? (savedAppearance as AppearanceValue)
    : "system";
}

function getInitialLanguage(): LanguageCode {
  if (typeof window === "undefined") {
    return "auto";
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return languages.some((item) => item.code === savedLanguage)
    ? (savedLanguage as LanguageCode)
    : "auto";
}

export function openSettingsHelpPopup() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

function setTranslateCookie(languageCode: LanguageCode) {
  const translateCode = languageCode === "auto" ? "en" : languageCode;
  const cookieValue = `/en/${translateCode}`;
  const maxAge = 60 * 60 * 24 * 365;

  document.cookie = `googtrans=${cookieValue};path=/;max-age=${maxAge}`;
  document.cookie = `googtrans=${cookieValue};domain=${window.location.hostname};path=/;max-age=${maxAge}`;
}

function getTranslateCombo() {
  return document.querySelector<HTMLSelectElement>(".goog-te-combo");
}

function applyGoogleTranslate(languageCode: LanguageCode) {
  setTranslateCookie(languageCode);
  document.documentElement.lang = languageCode === "auto" ? "en" : languageCode;

  const combo = getTranslateCombo();
  if (!combo) {
    return false;
  }

  combo.value = languageCode === "auto" ? "en" : languageCode;
  combo.dispatchEvent(new Event("change"));
  return true;
}

function applyAppearance(appearance: AppearanceValue) {
  const root = document.documentElement;
  root.dataset.dsiqTheme = appearance;
  root.style.colorScheme =
    appearance === "dark"
      ? "dark"
      : appearance === "light"
        ? "light"
        : "light dark";
}

export function SettingsHelpPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"general" | "data">("general");
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [appearance, setAppearance] =
    useState<AppearanceValue>(getInitialAppearance);
  const [language, setLanguage] = useState<LanguageCode>(getInitialLanguage);
  const retryTimerRef = useRef<number | null>(null);

  const selectedLanguage = useMemo(
    () => languages.find((item) => item.code === language) || languages[0],
    [language],
  );
  const selectedAppearance = useMemo(
    () =>
      appearanceOptions.find((item) => item.value === appearance) ||
      appearanceOptions[0],
    [appearance],
  );

  useEffect(() => {
    function openPopup() {
      setIsOpen(true);
      setActivePanel("general");
    }

    window.addEventListener(OPEN_SETTINGS_EVENT, openPopup);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, openPopup);
  }, []);

  useEffect(() => {
    applyAppearance(appearance);

    // Disable Google Translate usage.
    if (ENABLE_GOOGLE_TRANSLATE) {
      setTranslateCookie(language);
    }
  }, [appearance, language]);

  useEffect(() => {
    if (!ENABLE_GOOGLE_TRANSLATE) return;

    const translateWindow = window as GoogleTranslateWindow;
    translateWindow.googleTranslateElementInit = () => {
      if (!translateWindow.google?.translate?.TranslateElement) {
        return;
      }

      new translateWindow.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: languages
            .filter((item) => item.code !== "auto")
            .map((item) => item.code)
            .join(","),
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };

    if (!document.querySelector("#dsiq-google-translate-script")) {
      const script = document.createElement("script");
      script.id = "dsiq-google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      translateWindow.googleTranslateElementInit();
    }
  }, []);

  useEffect(() => {
    if (!ENABLE_GOOGLE_TRANSLATE) return;

    const savedLanguage =
      (window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null) ||
      "auto";

    if (savedLanguage === "auto") {
      return;
    }

    if (retryTimerRef.current) {
      window.clearTimeout(retryTimerRef.current);
    }

    retryTimerRef.current = window.setTimeout(() => {
      applyGoogleTranslate(savedLanguage);
    }, 500);

    return () => {
      if (retryTimerRef.current) {
        window.clearTimeout(retryTimerRef.current);
      }
    };
  }, [pathname]);

  function selectAppearance(nextAppearance: AppearanceValue) {
    setAppearance(nextAppearance);
    applyAppearance(nextAppearance);
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, nextAppearance);
    setIsAppearanceOpen(false);
  }

  function selectLanguage(nextLanguage: LanguageCode) {
    // Store selection, but do NOT apply Google Translate.
    setLanguage(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    setIsLanguageOpen(false);
  }

  return (
    <>
      {ENABLE_GOOGLE_TRANSLATE ? (
        <div id="google_translate_element" className="dsiq-translate-widget" />
      ) : null}

      {isOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/35 px-4 py-8 backdrop-blur-sm sm:items-center"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-help-title"
            className="grid max-h-[88vh] w-full max-w-[760px] grid-cols-1 overflow-hidden rounded-[1.5rem] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] shadow-[0_26px_80px_rgba(0,0,0,0.22)] md:grid-cols-[230px_minmax(0,1fr)]"
          >
            <aside className="border-b border-[color:var(--color-line)] bg-[color:var(--color-surface-strong)] p-3 md:border-b-0 md:border-r">
              <div className="mb-2 flex items-center justify-between md:hidden">
                <p className="text-sm font-semibold">Settings</p>
                <button
                  type="button"
                  aria-label="Close settings"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[color:var(--color-line)]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActivePanel("general")}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${
                  activePanel === "general"
                    ? "bg-[color:var(--color-surface)] shadow-[0_8px_22px_rgba(0,0,0,0.06)]"
                    : "hover:bg-[color:var(--color-surface)]"
                }`}
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                General
              </button>
              <button
                type="button"
                onClick={() => setActivePanel("data")}
                className={`mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${
                  activePanel === "data"
                    ? "bg-[color:var(--color-surface)] shadow-[0_8px_22px_rgba(0,0,0,0.06)]"
                    : "hover:bg-[color:var(--color-surface)]"
                }`}
              >
                <Database className="h-4 w-4" aria-hidden="true" />
                Data Controls
              </button>
            </aside>

            <div className="min-h-[430px] overflow-y-auto p-5 sm:p-6">
              <div className="mb-5 hidden items-center justify-end md:flex">
                <button
                  type="button"
                  aria-label="Close settings"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[color:var(--color-surface-strong)]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {activePanel === "general" ? (
                <div>
                  <h2
                    id="settings-help-title"
                    className="text-center text-lg font-semibold"
                  >
                    General
                  </h2>

                  <div className="mt-7 divide-y divide-[color:var(--color-line)]">
                    <div className="grid gap-3 py-4 sm:grid-cols-[1fr_190px] sm:items-center">
                      <div>
                        <p className="text-sm font-semibold">Appearance</p>
                        <p className="mt-1 text-xs leading-5 text-[color:var(--color-muted)]">
                          Match your device or choose a fixed look.
                        </p>
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAppearanceOpen((value) => !value);
                            setIsLanguageOpen(false);
                          }}
                          className="flex h-11 w-full items-center justify-between rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-3 text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
                          aria-expanded={isAppearanceOpen}
                        >
                          <span>{selectedAppearance.label}</span>
                          <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        </button>
                        {isAppearanceOpen ? (
                          <div className="absolute right-0 top-12 z-20 w-full rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-1 shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
                            {appearanceOptions.map((option) => {
                              const Icon = option.icon;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => selectAppearance(option.value)}
                                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[color:var(--color-surface-strong)]"
                                >
                                  <span className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                    {option.label}
                                  </span>
                                  {appearance === option.value ? (
                                    <Check className="h-4 w-4" aria-hidden="true" />
                                  ) : null}
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-3 py-4 sm:grid-cols-[1fr_240px] sm:items-start">
                      <div>
                        <p className="text-sm font-semibold">Language</p>
                        <p className="mt-1 text-xs leading-5 text-[color:var(--color-muted)]">
                          Translate DSIQ pages automatically after selection.
                        </p>
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsLanguageOpen((value) => !value);
                            setIsAppearanceOpen(false);
                          }}
                          className="flex h-11 w-full items-center justify-between rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-3 text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
                          aria-expanded={isLanguageOpen}
                        >
                          <span>{selectedLanguage.label}</span>
                          <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        </button>
                        {isLanguageOpen ? (
                          <div className="absolute right-0 top-12 z-30 max-h-72 w-full overflow-y-auto rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-1 shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
                            {languages.map((option) => (
                              <button
                                key={option.code}
                                type="button"
                                onClick={() => selectLanguage(option.code)}
                                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[color:var(--color-surface-strong)]"
                              >
                                <span>{option.label}</span>
                                {language === option.code ? (
                                  <Check className="h-4 w-4" aria-hidden="true" />
                                ) : null}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-center text-lg font-semibold">
                    Data Controls
                  </h2>
                  <div className="mt-7 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface-strong)] p-4">
                    <p className="text-sm font-semibold">Chat and page data</p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--color-muted)]">
                      Your selected appearance and language are saved in this
                      browser so every page keeps the same preference.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
