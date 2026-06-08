import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { normalizeNickname, type OnboardingAnswers, type StoredUserProfile } from "@/lib/user-profile-store";

type SyncFirebaseUserInput = {
  uid: string;
  email: string | null;
  emailVerified?: boolean;
  displayName: string | null;
  photoURL?: string | null;
  reason: "signup" | "login";
  authProvider?: "password" | "google" | "apple";
  providerIds?: string[];
};

type SaveOnboardingInput = {
  uid: string;
  answers: OnboardingAnswers;
};

export type FirebaseUserProfile = {
  accountStatus?: string;
  authProvider?: string;
  authProviders?: string[];
  fullName?: string;
  nickname?: string;
  nicknameLower?: string;
  role?: string;
  profileImageUrl?: string;
  age?: string;
  selectedGoals?: string[];
  learningGoals?: string[];
  aiTeacherStyle?: string;
  focusPreference?: string;
  experienceLevel?: string;
  preferredLearningStyle?: string;
  preferredLanguage?: string | null;
  onboardingCompleted?: boolean;
  onboardingAnswers?: OnboardingAnswers;
  displayName?: string | null;
  email?: string | null;
  emailVerified?: boolean;
  photoURL?: string | null;
  languagePreference?: string | null;
  notificationPreferences?: import("@/lib/notification-preferences").NotificationPreferences;
  settings?: {
    emailNotifications?: boolean;
    notificationPreferences?: import("@/lib/notification-preferences").NotificationPreferences;
  };
};

function mergeProviderIds(
  existingProviders: unknown,
  nextProviders: string[],
) {
  const currentProviders = Array.isArray(existingProviders)
    ? existingProviders.filter((item) => typeof item === "string")
    : [];

  return Array.from(new Set([...currentProviders, ...nextProviders]));
}

export async function syncFirebaseUserRecord(input: SyncFirebaseUserInput) {
  if (!db) {
    return;
  }

  const userRef = doc(db, "users", input.uid);
  const existingSnapshot = await getDoc(userRef);
  const existingData = existingSnapshot.exists()
    ? (existingSnapshot.data() as FirebaseUserProfile)
    : null;
  const authProvider = input.authProvider || "password";
  const authProviders = mergeProviderIds(existingData?.authProviders, [
    authProvider,
    ...(input.providerIds || []),
  ]);

  const baseFields = {
    uid: input.uid,
    email: input.email,
    emailVerified: Boolean(input.emailVerified),
    displayName: input.displayName,
    photoURL: input.photoURL,
    authProvider,
    authProviders,
    accountStatus: "active",
    auth: {
      provider: authProvider,
      providers: authProviders,
      emailVerified: Boolean(input.emailVerified),
      lastSignInAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  await setDoc(
    userRef,
    {
      ...baseFields,
      ...(!existingSnapshot.exists() || input.reason === "signup"
        ? {
            createdAt: serverTimestamp(),
            onboardingCompleted: existingData?.onboardingCompleted || false,
          }
        : {}),
    },
    { merge: true },
  );
}

export async function saveFirebaseOnboardingAnswers(input: SaveOnboardingInput) {
  if (!db) {
    return;
  }

  const userRef = doc(db, "users", input.uid);

  await setDoc(
    userRef,
    {
      fullName: input.answers.fullName,
      nickname: input.answers.nickname,
      nicknameLower: input.answers.nickname
        ? normalizeNickname(input.answers.nickname)
        : undefined,
      role: input.answers.role,
      profileImageUrl: input.answers.profileImageUrl,
      age: input.answers.age,
      selectedGoals: input.answers.selectedGoals,
      onboardingCompleted: true,
      onboardingAnswers: input.answers,
      profile: {
        fullName: input.answers.fullName,
        nickname: input.answers.nickname,
        role: input.answers.role,
        profileImageUrl: input.answers.profileImageUrl,
        age: input.answers.age,
        selectedGoals: input.answers.selectedGoals,
      },
      accountStatus: "active",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateFirebaseUserProfile(input: {
  uid: string;
  updates: Partial<StoredUserProfile>;
}) {
  if (!db) {
    return;
  }

  const userRef = doc(db, "users", input.uid);
  const goalSummary = input.updates.selectedGoals?.length
    ? input.updates.selectedGoals.join(", ")
    : "Explore DSIQ";

  await setDoc(
    userRef,
    {
      ...input.updates,
      nicknameLower: input.updates.nickname
        ? normalizeNickname(input.updates.nickname)
        : undefined,
      onboardingCompleted: true,
      profile: {
        fullName: input.updates.fullName,
        nickname: input.updates.nickname,
        role: input.updates.role,
        profileImageUrl: input.updates.profileImageUrl,
        age: input.updates.age,
        selectedGoals: input.updates.selectedGoals,
      },
      onboardingAnswers: {
        fullName: input.updates.fullName,
        nickname: input.updates.nickname,
        role: input.updates.role,
        profileImageUrl: input.updates.profileImageUrl,
        age: input.updates.age,
        selectedGoals: input.updates.selectedGoals,
        goal: goalSummary,
        skills: goalSummary,
        time: "Flexible",
        budget: "Not specified",
        interest: goalSummary,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateFirebaseUserProfileImage(input: {
  uid: string;
  profileImageUrl: string;
}) {
  if (!db) {
    return;
  }

  const userRef = doc(db, "users", input.uid);

  await setDoc(
    userRef,
    {
      profileImageUrl: input.profileImageUrl,
      profile: {
        profileImageUrl: input.profileImageUrl,
      },
      onboardingAnswers: {
        profileImageUrl: input.profileImageUrl,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateFirebaseUserLanguage(input: {
  languagePreference: string | null;
  uid: string;
}) {
  if (!db) {
    return;
  }

  const userRef = doc(db, "users", input.uid);

  await setDoc(
    userRef,
    {
      languagePreference: input.languagePreference,
      preferredLanguage: input.languagePreference,
      settings: {
        languagePreference: input.languagePreference,
        preferredLanguage: input.languagePreference,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateFirebaseUserPersonalization(input: {
  uid: string;
  updates: Partial<StoredUserProfile>;
}) {
  if (!db) {
    return;
  }

  const userRef = doc(db, "users", input.uid);

  await setDoc(
    userRef,
    {
      ...input.updates,
      personalization: input.updates,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function isFirebaseNicknameTaken(uid: string, nickname: string) {
  if (!db) {
    return false;
  }

  const normalizedNickname = normalizeNickname(nickname);
  if (!normalizedNickname) {
    return false;
  }

  const usersRef = collection(db, "users");
  const nicknameQuery = query(
    usersRef,
    where("nicknameLower", "==", normalizedNickname),
  );
  const snapshot = await getDocs(nicknameQuery);

  return snapshot.docs.some((profileDoc) => profileDoc.id !== uid);
}

export async function getFirebaseUserProfile(uid: string) {
  if (!db) {
    return null;
  }

  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as FirebaseUserProfile;
}

export async function deleteFirebaseUserRecord(uid: string) {
  if (!db) {
    return;
  }

  const firestore = db;
  const userRef = doc(firestore, "users", uid);

  for (const chatCollectionName of ["chats", "teacherChats"]) {
    const chatsSnapshot = await getDocs(collection(userRef, chatCollectionName));

    for (const chatDocument of chatsSnapshot.docs) {
      const chatRef = doc(userRef, chatCollectionName, chatDocument.id);
      const messagesSnapshot = await getDocs(collection(chatRef, "messages"));

      await Promise.all(
        messagesSnapshot.docs.map((messageDocument) =>
          deleteDoc(doc(chatRef, "messages", messageDocument.id)),
        ),
      );
      await deleteDoc(chatRef);
    }
  }

  const roadmapsSnapshot = await getDocs(collection(userRef, "roadmaps"));
  for (const roadmapDocument of roadmapsSnapshot.docs) {
    const roadmapRef = doc(userRef, "roadmaps", roadmapDocument.id);
    const stepsSnapshot = await getDocs(collection(roadmapRef, "steps"));

    await Promise.all(
      stepsSnapshot.docs.map((stepDocument) =>
        deleteDoc(doc(roadmapRef, "steps", stepDocument.id)),
      ),
    );
    await deleteDoc(roadmapRef);
  }

  await Promise.all(
    ["projects", "library", "savedChats"].map(async (collectionName) => {
      const snapshot = await getDocs(collection(userRef, collectionName));

      await Promise.all(
        snapshot.docs.map((item) =>
          deleteDoc(doc(userRef, collectionName, item.id)),
        ),
      );
    }),
  );

  await deleteDoc(userRef);
}
