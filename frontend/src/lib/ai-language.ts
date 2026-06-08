import {
  getLanguageByCode,
  isLanguageCode,
  LANGUAGE_STORAGE_KEY,
  type LanguageCode,
} from "@/lib/i18n/languages";

export type AiLanguageChoice = {
  detectedLanguage: LanguageCode;
  preferredLanguage: LanguageCode | null;
  replyLanguage: LanguageCode;
};

const languageNameToCode: Record<string, LanguageCode> = {
  arabic: "ar",
  ar: "ar",
  العربية: "ar",
  عربي: "ar",
  english: "en",
  en: "en",
  french: "fr",
  français: "fr",
  francais: "fr",
  fr: "fr",
  hausa: "ha",
  ha: "ha",
};

function normalizeText(text: string) {
  return text.trim().toLowerCase();
}

function hasArabic(text: string) {
  return /[\u0600-\u06ff]/.test(text);
}

function getStoredReplyLanguage() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguageCode(value) && value !== "auto" ? value : null;
}

export function detectMessageLanguage(text: string): LanguageCode {
  const normalized = normalizeText(text);

  if (hasArabic(text)) {
    return "ar";
  }

  if (/\b(réponds|reponds|toujours|français|francais|bonjour|merci)\b/i.test(text)) {
    return "fr";
  }

  if (/\b(ka|kana|kika|amsa|min|da hausa|ina so|na gode|sannu)\b/i.test(text)) {
    return "ha";
  }

  if (/\b(hello|hi|teach|learn|always|reply|answer|roadmap|javascript|html)\b/.test(normalized)) {
    return "en";
  }

  return "en";
}

export function detectLanguagePreferenceCommand(text: string) {
  const normalized = normalizeText(text);

  const commandPatterns = [
    /always\s+(?:reply|answer|respond)\s+(?:to\s+me\s+)?in\s+([a-zA-Z\u0600-\u06ff]+)/i,
    /(?:reply|answer|respond)\s+(?:to\s+me\s+)?always\s+in\s+([a-zA-Z\u0600-\u06ff]+)/i,
    /réponds-moi\s+toujours\s+en\s+([a-zA-Z]+)/i,
    /reponds-moi\s+toujours\s+en\s+([a-zA-Z]+)/i,
    /ka\s+rika\s+amsa\s+min\s+da\s+([a-zA-Z]+)/i,
  ];

  for (const pattern of commandPatterns) {
    const match = text.match(pattern);
    const rawLanguage = match?.[1]?.toLowerCase();
    const languageCode = rawLanguage ? languageNameToCode[rawLanguage] : undefined;

    if (languageCode) {
      return languageCode;
    }
  }

  if (
    normalized.includes("always answer me in arabic") ||
    normalized.includes("always reply in arabic") ||
    normalized.includes("always respond in arabic")
  ) {
    return "ar";
  }

  if (
    normalized.includes("always answer me in french") ||
    normalized.includes("always reply in french") ||
    normalized.includes("always respond in french")
  ) {
    return "fr";
  }

  if (
    normalized.includes("always answer me in hausa") ||
    normalized.includes("always reply in hausa") ||
    normalized.includes("ka rika amsa min da hausa")
  ) {
    return "ha";
  }

  return null;
}

export function getLanguageConfirmation(languageCode: LanguageCode) {
  if (languageCode === "fr") {
    return "D'accord, je répondrai en français à partir de maintenant.";
  }

  if (languageCode === "ar") {
    return "حسنًا، سأجيب باللغة العربية من الآن فصاعدًا.";
  }

  if (languageCode === "ha") {
    return "To, zan rika amsa maka da Hausa daga yanzu.";
  }

  return `Done. I will reply in ${getLanguageByCode(languageCode)?.aiName || languageCode} from now on.`;
}

export function chooseAiReplyLanguage(input: {
  latestMessage: string;
  preferredLanguage?: string | null;
}) {
  const detectedLanguage = detectMessageLanguage(input.latestMessage);
  let explicitPreference: LanguageCode | null = null;
  const requestedPreference = input.preferredLanguage ?? null;

  if (
    isLanguageCode(requestedPreference) &&
    requestedPreference !== "auto"
  ) {
    explicitPreference = requestedPreference;
  }
  const storedLanguage = getStoredReplyLanguage();
  const preferredLanguage: LanguageCode | null = explicitPreference || storedLanguage;
  const replyLanguage: LanguageCode = preferredLanguage || detectedLanguage;

  return {
    detectedLanguage,
    preferredLanguage,
    replyLanguage,
  } satisfies AiLanguageChoice;
}

export function getAiReplyLanguageInstruction(choice: AiLanguageChoice) {
  const detectedName =
    getLanguageByCode(choice.detectedLanguage)?.aiName || choice.detectedLanguage;
  const preferredName = choice.preferredLanguage
    ? getLanguageByCode(choice.preferredLanguage)?.aiName || choice.preferredLanguage
    : "None";
  const replyName = getLanguageByCode(choice.replyLanguage)?.aiName || choice.replyLanguage;

  return [
    `User preferred language: ${preferredName}`,
    `User latest message language: ${detectedName}`,
    `Reply language: ${replyName}`,
    "Reply ONLY in the reply language unless the user asks to change language.",
    "If the user mixes languages and no saved preference exists, use the main meaning or emotional language. If unclear, briefly ask which language they prefer.",
  ].join("\n");
}
