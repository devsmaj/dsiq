import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { StoredUserProfile } from "@/lib/user-profile-store";

export const GUEST_DATA_CONTROL_PREFERENCES_KEY =
  "dsiq.data-control-preferences.guest";

export type DataControlPreferences = {
  aiMemoryEnabled: boolean;
  lastSyncedAt?: string;
};

export const defaultDataControlPreferences: DataControlPreferences = {
  aiMemoryEnabled: true,
};

function getUserDataControlPreferencesKey(uid: string) {
  return `dsiq.data-control-preferences.${uid}`;
}

function hasLocalUserDataControlPreferences(uid: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(getUserDataControlPreferencesKey(uid)) !== null;
}

function normalizePreferences(
  preferences?: Partial<DataControlPreferences> | null,
) {
  return {
    ...defaultDataControlPreferences,
    ...(preferences || {}),
  } satisfies DataControlPreferences;
}

function readLocalPreferences(key: string) {
  if (typeof window === "undefined") {
    return defaultDataControlPreferences;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return defaultDataControlPreferences;
  }

  try {
    return normalizePreferences(JSON.parse(raw) as Partial<DataControlPreferences>);
  } catch {
    window.localStorage.removeItem(key);
    return defaultDataControlPreferences;
  }
}

export function getGuestDataControlPreferences() {
  return readLocalPreferences(GUEST_DATA_CONTROL_PREFERENCES_KEY);
}

export function getLocalUserDataControlPreferences(uid: string) {
  return readLocalPreferences(getUserDataControlPreferencesKey(uid));
}

export function saveLocalDataControlPreferences(
  preferences: DataControlPreferences,
  uid?: string,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    uid ? getUserDataControlPreferencesKey(uid) : GUEST_DATA_CONTROL_PREFERENCES_KEY,
    JSON.stringify({
      ...preferences,
      lastSyncedAt: new Date().toISOString(),
    }),
  );
}

export async function loadFirebaseDataControlPreferences(uid: string) {
  if (!db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as {
    dataControlPreferences?: Partial<DataControlPreferences>;
    settings?: {
      aiMemoryEnabled?: boolean;
      dataControlPreferences?: Partial<DataControlPreferences>;
    };
  };

  return normalizePreferences(
    data.dataControlPreferences ||
      data.settings?.dataControlPreferences ||
      (typeof data.settings?.aiMemoryEnabled === "boolean"
        ? { aiMemoryEnabled: data.settings.aiMemoryEnabled }
        : null),
  );
}

export async function saveFirebaseDataControlPreferences(
  uid: string,
  preferences: DataControlPreferences,
) {
  if (!db) {
    return;
  }

  await setDoc(
    doc(db, "users", uid),
    {
      aiMemoryEnabled: preferences.aiMemoryEnabled,
      dataControlPreferences: preferences,
      settings: {
        aiMemoryEnabled: preferences.aiMemoryEnabled,
        dataControlPreferences: preferences,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function getEffectiveDataControlPreferences(
  profile?: Partial<StoredUserProfile> | null,
  uid?: string,
) {
  const localUserPreferences =
    uid && hasLocalUserDataControlPreferences(uid)
      ? getLocalUserDataControlPreferences(uid)
      : null;

  return normalizePreferences(
    localUserPreferences ||
      profile?.dataControlPreferences ||
      profile?.settings?.dataControlPreferences ||
      (typeof profile?.settings?.aiMemoryEnabled === "boolean"
        ? { aiMemoryEnabled: profile.settings.aiMemoryEnabled }
        : null) ||
      getGuestDataControlPreferences(),
  );
}
