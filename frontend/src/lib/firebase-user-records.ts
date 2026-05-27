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
  displayName: string | null;
  photoURL?: string | null;
  reason: "signup" | "login";
  authProvider?: "password" | "google" | "apple";
};

type SaveOnboardingInput = {
  uid: string;
  answers: OnboardingAnswers;
};

export type FirebaseUserProfile = {
  fullName?: string;
  nickname?: string;
  nicknameLower?: string;
  role?: string;
  profileImageUrl?: string;
  age?: string;
  selectedGoals?: string[];
  onboardingCompleted?: boolean;
  onboardingAnswers?: OnboardingAnswers;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
};

export async function syncFirebaseUserRecord(input: SyncFirebaseUserInput) {
  if (!db) {
    return;
  }

  const userRef = doc(db, "users", input.uid);

  const baseFields = {
    uid: input.uid,
    email: input.email,
    displayName: input.displayName,
    photoURL: input.photoURL,
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  await setDoc(
    userRef,
    {
      ...baseFields,
      authProvider: input.authProvider || "password",
      ...(input.reason === "signup"
        ? {
            createdAt: serverTimestamp(),
            onboardingCompleted: false,
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
      onboardingAnswers: {
        profileImageUrl: input.profileImageUrl,
      },
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

  const userRef = doc(db, "users", uid);
  await deleteDoc(userRef);
}
