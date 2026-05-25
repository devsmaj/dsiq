export type OnboardingAnswers = {
  fullName?: string;
  age?: string;
  selectedGoals?: string[];
  goal: string;
  skills: string;
  time: string;
  budget: string;
  interest: string;
};

export type StoredUserProfile = {
  onboardingCompleted?: boolean;
  onboardingAnswers?: OnboardingAnswers;
  updatedAt?: string;
};

function getProfileKey(uid: string) {
  return `dsiq.profile.${uid}`;
}

export function saveLocalOnboardingAnswers(uid: string, answers: OnboardingAnswers) {
  if (typeof window === "undefined") {
    return;
  }

  const existing = readLocalUserProfile(uid) || {};

  window.localStorage.setItem(
    getProfileKey(uid),
    JSON.stringify({
      ...existing,
      onboardingCompleted: true,
      onboardingAnswers: answers,
      updatedAt: new Date().toISOString(),
    }),
  );
}

export function readLocalUserProfile(uid: string): StoredUserProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(getProfileKey(uid));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredUserProfile;
  } catch {
    return null;
  }
}
