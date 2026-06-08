import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { StoredUserProfile } from "@/lib/user-profile-store";

export const GUEST_NOTIFICATION_PREFERENCES_KEY =
  "dsiq.notification-preferences.guest";

export type StudyReminderCadence = "daily" | "weekly" | "custom";
export type FocusReminderFrequency = "daily" | "weekdays" | "twice-weekly" | "weekly";

export type NotificationPreferences = {
  emailNotifications: boolean;
  emailTopics: {
    accountUpdates: boolean;
    importantUpdates: boolean;
    roadmapProgressSummaries: boolean;
  };
  studyReminders: {
    enabled: boolean;
    cadence: StudyReminderCadence;
    customDays: string[];
    reminderTime: string;
  };
  focusReminders: {
    enabled: boolean;
    frequency: FocusReminderFrequency;
  };
  browserNotificationPermission?: NotificationPermission | "unsupported";
};

export const defaultNotificationPreferences: NotificationPreferences = {
  emailNotifications: false,
  emailTopics: {
    accountUpdates: true,
    importantUpdates: true,
    roadmapProgressSummaries: true,
  },
  studyReminders: {
    enabled: false,
    cadence: "daily",
    customDays: ["monday", "wednesday", "friday"],
    reminderTime: "19:00",
  },
  focusReminders: {
    enabled: false,
    frequency: "daily",
  },
};

function getUserNotificationPreferencesKey(uid: string) {
  return `dsiq.notification-preferences.${uid}`;
}

function normalizePreferences(
  preferences?: Partial<NotificationPreferences> | null,
) {
  return {
    ...defaultNotificationPreferences,
    ...(preferences || {}),
    emailTopics: {
      ...defaultNotificationPreferences.emailTopics,
      ...(preferences?.emailTopics || {}),
    },
    studyReminders: {
      ...defaultNotificationPreferences.studyReminders,
      ...(preferences?.studyReminders || {}),
      customDays: preferences?.studyReminders?.customDays?.length
        ? preferences.studyReminders.customDays
        : defaultNotificationPreferences.studyReminders.customDays,
    },
    focusReminders: {
      ...defaultNotificationPreferences.focusReminders,
      ...(preferences?.focusReminders || {}),
    },
  } satisfies NotificationPreferences;
}

function readLocalPreferences(key: string) {
  if (typeof window === "undefined") {
    return defaultNotificationPreferences;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return defaultNotificationPreferences;
  }

  try {
    return normalizePreferences(JSON.parse(raw) as Partial<NotificationPreferences>);
  } catch {
    window.localStorage.removeItem(key);
    return defaultNotificationPreferences;
  }
}

export function getGuestNotificationPreferences() {
  return readLocalPreferences(GUEST_NOTIFICATION_PREFERENCES_KEY);
}

export function getLocalUserNotificationPreferences(uid: string) {
  return readLocalPreferences(getUserNotificationPreferencesKey(uid));
}

export function saveLocalNotificationPreferences(
  preferences: NotificationPreferences,
  uid?: string,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    uid ? getUserNotificationPreferencesKey(uid) : GUEST_NOTIFICATION_PREFERENCES_KEY,
    JSON.stringify(preferences),
  );
}

export async function loadFirebaseNotificationPreferences(uid: string) {
  if (!db) {
    return null;
  }

  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as {
    notificationPreferences?: Partial<NotificationPreferences>;
    settings?: {
      notificationPreferences?: Partial<NotificationPreferences>;
    };
  };

  return normalizePreferences(
    data.notificationPreferences || data.settings?.notificationPreferences,
  );
}

export async function saveFirebaseNotificationPreferences(
  uid: string,
  preferences: NotificationPreferences,
) {
  if (!db) {
    return;
  }

  const userRef = doc(db, "users", uid);

  await setDoc(
    userRef,
    {
      emailNotifications: preferences.emailNotifications,
      notificationPreferences: preferences,
      settings: {
        emailNotifications: preferences.emailNotifications,
        notificationPreferences: preferences,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function getEffectiveNotificationPreferences(
  profile?: Partial<StoredUserProfile> | null,
  uid?: string,
) {
  return normalizePreferences(
    profile?.notificationPreferences ||
      profile?.settings?.notificationPreferences ||
      (uid ? getLocalUserNotificationPreferences(uid) : null) ||
      getGuestNotificationPreferences(),
  );
}

export function buildNotificationInstruction(
  preferences: NotificationPreferences,
) {
  const study = preferences.studyReminders;
  const focus = preferences.focusReminders;
  const customDays = study.customDays.length ? study.customDays.join(", ") : "none";

  return [
    "DSIQ notification and learning schedule settings:",
    `Email notifications: ${preferences.emailNotifications ? "enabled" : "disabled"}.`,
    `Study reminders enabled: ${study.enabled ? "yes" : "no"}.`,
    `Learning schedule: ${study.cadence} at ${study.reminderTime}; custom days: ${customDays}.`,
    `Focus reminders enabled: ${focus.enabled ? "yes" : "no"}.`,
    `Focus reminder frequency: ${focus.frequency}.`,
    "Use this schedule to adapt plans, pacing, check-ins, and suggested mission timing.",
  ].join("\n");
}
