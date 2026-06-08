import { getLanguageByCode, isLanguageCode, type LanguageCode } from "@/lib/i18n/languages";
import type { StoredUserProfile } from "@/lib/user-profile-store";

export const GUEST_PERSONALIZATION_KEY = "dsiq.personalization.guest";

export type PersonalizationSettings = {
  learningGoals: string[];
  aiTeacherStyle: string;
  focusPreference: string;
  experienceLevel: string;
  preferredLearningStyle: string;
  preferredLanguage: LanguageCode | "auto";
};

export const personalizationOptions = {
  learningGoals: [
    { value: "websites-apps", label: "Build websites and apps" },
    { value: "mobile-apps", label: "Create mobile applications" },
    { value: "ai", label: "Learn AI" },
    { value: "tech-job", label: "Get a programming job" },
    { value: "choose-direction", label: "Help me choose" },
  ],
  aiTeacherStyle: [
    { value: "step-by-step", label: "Step-by-step and practical" },
    { value: "short-simple", label: "Short explanations" },
    { value: "challenge-mode", label: "Challenge mode" },
    { value: "mentor-coach", label: "Mentor and accountability coach" },
  ],
  focusPreference: [
    { value: "one-task", label: "One focused task at a time" },
    { value: "projects", label: "Learn through projects" },
    { value: "daily-missions", label: "Daily missions" },
    { value: "deep-work", label: "Deep focused sessions" },
  ],
  experienceLevel: [
    { value: "beginner", label: "Beginner" },
    { value: "basics", label: "Know the basics" },
    { value: "building-projects", label: "Already building projects" },
    { value: "advanced", label: "Advanced" },
  ],
  preferredLearningStyle: [
    { value: "examples", label: "Simple examples" },
    { value: "practice", label: "Practice first" },
    { value: "visual", label: "Visual explanation" },
    { value: "projects", label: "Projects" },
    { value: "reading", label: "Reading and notes" },
  ],
} as const;

export const defaultPersonalizationSettings: PersonalizationSettings = {
  learningGoals: [],
  aiTeacherStyle: "step-by-step",
  focusPreference: "one-task",
  experienceLevel: "beginner",
  preferredLearningStyle: "examples",
  preferredLanguage: "auto",
};

type PersonalizationValue = string | string[] | null | undefined;

function getOptionLabel(
  field: keyof typeof personalizationOptions,
  value: string | undefined,
) {
  return personalizationOptions[field].find((option) => option.value === value)?.label || value || "";
}

function normalizePreferredLanguage(value: string | null | undefined): LanguageCode | "auto" {
  return isLanguageCode(value ?? null) ? value as LanguageCode : "auto";
}

export function getGuestPersonalizationSettings() {
  if (typeof window === "undefined") {
    return defaultPersonalizationSettings;
  }

  const raw = window.localStorage.getItem(GUEST_PERSONALIZATION_KEY);
  if (!raw) {
    return defaultPersonalizationSettings;
  }

  try {
    return {
      ...defaultPersonalizationSettings,
      ...(JSON.parse(raw) as Partial<PersonalizationSettings>),
    };
  } catch {
    window.localStorage.removeItem(GUEST_PERSONALIZATION_KEY);
    return defaultPersonalizationSettings;
  }
}

export function saveGuestPersonalizationSettings(updates: Partial<PersonalizationSettings>) {
  if (typeof window === "undefined") {
    return;
  }

  const nextSettings = {
    ...getGuestPersonalizationSettings(),
    ...updates,
  };

  window.localStorage.setItem(GUEST_PERSONALIZATION_KEY, JSON.stringify(nextSettings));
}

export function getEffectivePersonalizationSettings(
  profile?: Partial<StoredUserProfile> | null,
) {
  const guestSettings = getGuestPersonalizationSettings();
  const profileLanguage = profile?.preferredLanguage ?? profile?.languagePreference;

  return {
    ...guestSettings,
    learningGoals:
      profile?.learningGoals?.length
        ? profile.learningGoals
        : profile?.selectedGoals?.length
          ? profile.selectedGoals
          : guestSettings.learningGoals,
    aiTeacherStyle: profile?.aiTeacherStyle || guestSettings.aiTeacherStyle,
    focusPreference: profile?.focusPreference || guestSettings.focusPreference,
    experienceLevel: profile?.experienceLevel || profile?.role || guestSettings.experienceLevel,
    preferredLearningStyle:
      profile?.preferredLearningStyle || guestSettings.preferredLearningStyle,
    preferredLanguage: normalizePreferredLanguage(profileLanguage || guestSettings.preferredLanguage),
  } satisfies PersonalizationSettings;
}

export function getPersonalizationLabel(
  field: keyof PersonalizationSettings,
  value: PersonalizationValue,
) {
  if (field === "preferredLanguage") {
    const languageCode = normalizePreferredLanguage(typeof value === "string" ? value : null);
    return languageCode === "auto"
      ? "Auto detect"
      : getLanguageByCode(languageCode)?.label || languageCode;
  }

  if (field === "learningGoals") {
    const goals = Array.isArray(value) ? value : [];
    return goals.length
      ? goals.map((goal) => getOptionLabel("learningGoals", goal)).join(", ")
      : "Not set";
  }

  return getOptionLabel(field, typeof value === "string" ? value : undefined) || "Not set";
}

export function buildPersonalizationInstruction(settings: PersonalizationSettings) {
  const languageLabel = getPersonalizationLabel(
    "preferredLanguage",
    settings.preferredLanguage,
  );

  return [
    "DSIQ personalization settings:",
    `Learning goals: ${getPersonalizationLabel("learningGoals", settings.learningGoals)}.`,
    `AI teacher style: ${getPersonalizationLabel("aiTeacherStyle", settings.aiTeacherStyle)}.`,
    `Focus preference: ${getPersonalizationLabel("focusPreference", settings.focusPreference)}.`,
    `Experience level: ${getPersonalizationLabel("experienceLevel", settings.experienceLevel)}.`,
    `Preferred learning style: ${getPersonalizationLabel("preferredLearningStyle", settings.preferredLearningStyle)}.`,
    `Preferred language setting: ${languageLabel}.`,
    "Adapt the lesson difficulty, examples, missions, and roadmap pacing to these saved settings.",
    "If beginner or short explanations is selected, use simpler lessons and smaller missions.",
    "If advanced or challenge mode is selected, give harder tasks and expect more independent problem solving.",
  ].join("\n");
}

export function toProfilePersonalizationUpdates(
  settings: Partial<PersonalizationSettings>,
) {
  const preferredLanguage = settings.preferredLanguage === "auto"
    ? null
    : settings.preferredLanguage;

  return {
    ...settings,
    preferredLanguage,
    languagePreference: preferredLanguage,
  } satisfies Partial<StoredUserProfile>;
}
