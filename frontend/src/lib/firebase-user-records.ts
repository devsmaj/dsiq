import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { OnboardingAnswers } from "@/lib/user-profile-store";

type SyncFirebaseUserInput = {
  uid: string;
  email: string | null;
  displayName: string | null;
  reason: "signup" | "login";
  authProvider?: "password" | "google" | "apple";
};

type SaveOnboardingInput = {
  uid: string;
  answers: OnboardingAnswers;
};

export type FirebaseUserProfile = {
  fullName?: string;
  age?: string;
  selectedGoals?: string[];
  onboardingCompleted?: boolean;
  onboardingAnswers?: OnboardingAnswers;
  displayName?: string | null;
  email?: string | null;
};

export async function syncFirebaseUserRecord(input: SyncFirebaseUserInput) {
  if (!db) {
    return;
  }

  const userRef = doc(db, "users", input.uid);
  const existingSnapshot = await getDoc(userRef);

  const baseFields = {
    uid: input.uid,
    email: input.email,
    displayName: input.displayName,
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  if (!existingSnapshot.exists()) {
    await setDoc(userRef, {
      ...baseFields,
      createdAt: serverTimestamp(),
      onboardingCompleted: false,
      authProvider: input.authProvider || "password",
    });
    return;
  }

  await setDoc(
    userRef,
    {
      ...baseFields,
      authProvider: input.authProvider || "password",
      ...(input.reason === "signup" ? { createdAt: serverTimestamp() } : {}),
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
      age: input.answers.age,
      selectedGoals: input.answers.selectedGoals,
      onboardingCompleted: true,
      onboardingAnswers: input.answers,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
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
