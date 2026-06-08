import {
  detectLanguagePreferenceCommand,
  getLanguageConfirmation,
} from "@/lib/ai-language";
import { updateFirebaseUserLanguage } from "@/lib/firebase-user-records";
import { LANGUAGE_STORAGE_KEY, type LanguageCode } from "@/lib/i18n/languages";
import { updateLocalUserLanguage } from "@/lib/user-profile-store";

export async function saveLanguagePreference(input: {
  languageCode: LanguageCode;
  uid?: string | null;
}) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, input.languageCode);
  }

  if (!input.uid) {
    return;
  }

  updateLocalUserLanguage(input.uid, input.languageCode);

  try {
    await updateFirebaseUserLanguage({
      languagePreference: input.languageCode,
      uid: input.uid,
    });
  } catch (error) {
    console.warn("Language preference could not sync to Firestore.", error);
  }
}

export async function handleLanguagePreferenceCommand(input: {
  message: string;
  uid?: string | null;
}) {
  const languageCode = detectLanguagePreferenceCommand(input.message);

  if (!languageCode) {
    return null;
  }

  await saveLanguagePreference({
    languageCode,
    uid: input.uid,
  });

  return {
    languageCode,
    reply: getLanguageConfirmation(languageCode),
  };
}
