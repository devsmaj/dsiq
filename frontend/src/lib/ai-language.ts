import {
  getLanguageByCode,
  isLanguageCode,
  languages,
  type LanguageCode,
} from "@/lib/i18n/languages";

export type AiLanguageChoice = {
  detectedLanguage: LanguageCode;
  preferredLanguage: LanguageCode | null;
  replyLanguage: LanguageCode;
};

const dynamicLanguageAliases = languages.reduce<Record<string, LanguageCode>>(
  (aliases, language) => {
    aliases[language.code.toLowerCase()] = language.code;
    aliases[language.label.toLowerCase()] = language.code;
    aliases[language.aiName.toLowerCase()] = language.code;
    return aliases;
  },
  {},
);

const languageNameToCode: Record<string, LanguageCode> = {
  ...dynamicLanguageAliases,
  arabic: "ar",
  "العربية": "ar",
  "عربي": "ar",
  chinese: "zh-CN",
  mandarin: "zh-CN",
  "中文": "zh-CN",
  "简体中文": "zh-CN",
  "繁體中文": "zh-TW",
  español: "es",
  espanol: "es",
  français: "fr",
  francais: "fr",
  deutsch: "de",
  português: "pt",
  portugues: "pt",
  hindi: "hi",
  "हिन्दी": "hi",
  "हिंदी": "hi",
  urdu: "ur",
  "اردو": "ur",
  turkish: "tr",
  türkçe: "tr",
  japanese: "ja",
  "日本語": "ja",
  korean: "ko",
  "한국어": "ko",
  indonesian: "id",
  "bahasa indonesia": "id",
  swahili: "sw",
  kiswahili: "sw",
  hausa: "ha",
};

const latinLanguageSignals: Partial<Record<LanguageCode, string[]>> = {
  cs: ["ahoj", "prosím", "děkuji", "jsem", "chci", "učit"],
  da: ["hej", "tak", "jeg", "vil", "lære", "hvordan"],
  de: ["hallo", "danke", "ich", "möchte", "lernen", "bitte", "wie"],
  en: ["hello", "hi", "teach", "learn", "always", "reply", "answer", "roadmap"],
  es: ["hola", "gracias", "quiero", "aprender", "por favor", "cómo", "responde"],
  fi: ["hei", "kiitos", "haluan", "oppia", "miten", "vastaa"],
  fr: ["bonjour", "merci", "je veux", "apprendre", "réponds", "toujours"],
  ha: ["sannu", "na gode", "ina so", "koyon", "amsa", "min", "da hausa"],
  id: ["halo", "terima kasih", "saya", "ingin", "belajar", "jawab"],
  it: ["ciao", "grazie", "voglio", "imparare", "rispondi", "sempre"],
  ms: ["halo", "terima kasih", "saya", "mahu", "belajar", "jawab"],
  nl: ["hallo", "dank", "ik wil", "leren", "antwoord"],
  no: ["hei", "takk", "jeg vil", "lære", "svar"],
  pl: ["cześć", "dziękuję", "chcę", "uczyć", "odpowiadaj"],
  pt: ["olá", "obrigado", "quero", "aprender", "responda", "sempre"],
  ro: ["salut", "mulțumesc", "vreau", "să învăț", "răspunde"],
  so: ["salaam", "mahadsanid", "waxaan rabaa", "baro", "jawaab"],
  sv: ["hej", "tack", "jag vill", "lära", "svara"],
  sw: ["habari", "asante", "nataka", "kujifunza", "jibu"],
  tr: ["merhaba", "teşekkür", "öğrenmek", "istiyorum", "cevap"],
  vi: ["xin chào", "cảm ơn", "tôi muốn", "học", "trả lời"],
  yo: ["bawo", "e se", "mo fe", "ko", "dahun"],
};

function normalizeText(text: string) {
  return text.trim().toLowerCase();
}

function getScriptLanguage(text: string): LanguageCode | null {
  if (/[\u3040-\u30ff]/.test(text)) {
    return "ja";
  }

  if (/[\uac00-\ud7af]/.test(text)) {
    return "ko";
  }

  if (/[\u4e00-\u9fff]/.test(text)) {
    return "zh-CN";
  }

  if (/[\u0590-\u05ff]/.test(text)) {
    return "he";
  }

  if (/[\u0600-\u06ff]/.test(text)) {
    if (/[ٹڈڑںھے]/.test(text)) {
      return "ur";
    }

    if (/[پچژگ]/.test(text)) {
      return "fa";
    }

    return "ar";
  }

  if (/[\u0900-\u097f]/.test(text)) {
    return "hi";
  }

  if (/[\u0980-\u09ff]/.test(text)) {
    return "bn";
  }

  if (/[\u0e00-\u0e7f]/.test(text)) {
    return "th";
  }

  if (/[\u1200-\u137f]/.test(text)) {
    return "am";
  }

  if (/[\u0370-\u03ff]/.test(text)) {
    return "el";
  }

  if (/[\u0400-\u04ff]/.test(text)) {
    return /\b(привіт|дякую|хочу|навчитися|будь ласка)\b/i.test(text)
      ? "uk"
      : "ru";
  }

  return null;
}

function detectLatinLanguage(text: string): LanguageCode {
  const normalized = normalizeText(text);
  let bestLanguage: LanguageCode = "en";
  let bestScore = 0;

  for (const [languageCode, signals] of Object.entries(latinLanguageSignals)) {
    const score = signals.reduce(
      (currentScore, signal) =>
        normalized.includes(signal) ? currentScore + signal.length : currentScore,
      0,
    );

    if (score > bestScore && isLanguageCode(languageCode)) {
      bestLanguage = languageCode;
      bestScore = score;
    }
  }

  return bestLanguage;
}

export function detectMessageLanguage(text: string): LanguageCode {
  const scriptLanguage = getScriptLanguage(text);

  if (scriptLanguage) {
    return scriptLanguage;
  }

  return detectLatinLanguage(text);
}

function resolveLanguageName(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[.؟?!,;:]+$/g, "")
    .replace(/\s+/g, " ");

  return languageNameToCode[normalized] || null;
}

export function detectLanguagePreferenceCommand(text: string) {
  const commandPatterns = [
    /always\s+(?:reply|answer|respond)\s+(?:to\s+me\s+)?in\s+([\p{L}\s()-]+)/iu,
    /(?:reply|answer|respond)\s+(?:to\s+me\s+)?always\s+in\s+([\p{L}\s()-]+)/iu,
    /(?:reply|answer|respond)\s+(?:only\s+)?(?:in|with)\s+([\p{L}\s()-]+)/iu,
    /réponds-moi\s+toujours\s+en\s+([\p{L}\s()-]+)/iu,
    /reponds-moi\s+toujours\s+en\s+([\p{L}\s()-]+)/iu,
    /ka\s+rika\s+amsa\s+min\s+da\s+([\p{L}\s()-]+)/iu,
  ];

  for (const pattern of commandPatterns) {
    const languageCode = resolveLanguageName(text.match(pattern)?.[1]);

    if (languageCode) {
      return languageCode;
    }
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
  const preferredLanguage: LanguageCode | null = explicitPreference;
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
    `Current message language: ${detectedName}`,
    `Reply language: ${replyName}`,
    "Respond only in the user's preferred language. If no preference exists, respond in the detected language of the latest message.",
    "If the user asks to change language, update the language preference and use the new language.",
    "If the user mixes languages and no saved preference exists, use the language carrying the main meaning or emotional part. If unclear, briefly ask which language they prefer.",
  ].join("\n");
}

export function getFinalReplyLanguageRule(choice: AiLanguageChoice) {
  const replyName = getLanguageByCode(choice.replyLanguage)?.aiName || choice.replyLanguage;

  return [
    `User saved language preference: ${replyName}.`,
    "You MUST respond only in this language unless the user asks to change.",
    "Do not switch to English unless the user explicitly requests English.",
  ].join("\n");
}
