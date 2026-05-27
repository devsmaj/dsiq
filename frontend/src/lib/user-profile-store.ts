export type OnboardingAnswers = {
  fullName?: string;
  nickname?: string;
  role?: string;
  profileImageUrl?: string;
  age?: string;
  selectedGoals?: string[];
  goal: string;
  skills: string;
  time: string;
  budget: string;
  interest: string;
};

export type StoredUserProfile = {
  fullName?: string;
  nickname?: string;
  nicknameLower?: string;
  role?: string;
  profileImageUrl?: string;
  age?: string;
  selectedGoals?: string[];
  onboardingCompleted?: boolean;
  onboardingAnswers?: OnboardingAnswers;
  updatedAt?: string;
};

function getProfileKey(uid: string) {
  return `dsiq.profile.${uid}`;
}

export function normalizeNickname(nickname: string) {
  return nickname.trim().replace(/^@+/, "").toLowerCase();
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
      fullName: answers.fullName,
      nickname: answers.nickname,
      nicknameLower: answers.nickname ? normalizeNickname(answers.nickname) : undefined,
      role: answers.role,
      profileImageUrl: answers.profileImageUrl,
      age: answers.age,
      selectedGoals: answers.selectedGoals,
      onboardingCompleted: true,
      onboardingAnswers: answers,
      updatedAt: new Date().toISOString(),
    }),
  );
}

export function updateLocalUserProfile(
  uid: string,
  updates: Partial<StoredUserProfile>,
) {
  if (typeof window === "undefined") {
    return;
  }

  const existing = readLocalUserProfile(uid) || {};
  const nextAnswers = {
    ...(existing.onboardingAnswers || {
      goal: "",
      skills: "",
      time: "Flexible",
      budget: "Not specified",
      interest: "",
    }),
    fullName: updates.fullName,
    nickname: updates.nickname,
    role: updates.role,
    profileImageUrl: updates.profileImageUrl,
    age: updates.age,
    selectedGoals: updates.selectedGoals,
  };
  const goalSummary = updates.selectedGoals?.length
    ? updates.selectedGoals.join(", ")
    : nextAnswers.goal || "Explore DSIQ";

  window.localStorage.setItem(
    getProfileKey(uid),
    JSON.stringify({
      ...existing,
      ...updates,
      nicknameLower: updates.nickname
        ? normalizeNickname(updates.nickname)
        : existing.nicknameLower,
      onboardingCompleted: true,
      onboardingAnswers: {
        ...nextAnswers,
        goal: goalSummary,
        skills: goalSummary,
        interest: goalSummary,
      },
      updatedAt: new Date().toISOString(),
    }),
  );
}

export function updateLocalUserProfileImage(uid: string, profileImageUrl: string) {
  if (typeof window === "undefined") {
    return;
  }

  const existing = readLocalUserProfile(uid) || {};

  window.localStorage.setItem(
    getProfileKey(uid),
    JSON.stringify({
      ...existing,
      profileImageUrl,
      onboardingAnswers: existing.onboardingAnswers
        ? {
            ...existing.onboardingAnswers,
            profileImageUrl,
          }
        : existing.onboardingAnswers,
      updatedAt: new Date().toISOString(),
    }),
  );
}

export function isLocalNicknameTaken(uid: string, nickname: string) {
  if (typeof window === "undefined") {
    return false;
  }

  const normalizedNickname = normalizeNickname(nickname);
  if (!normalizedNickname) {
    return false;
  }

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith("dsiq.profile.") || key === getProfileKey(uid)) {
      continue;
    }

    try {
      const profile = JSON.parse(
        window.localStorage.getItem(key) || "{}",
      ) as StoredUserProfile;

      if (
        profile.nicknameLower === normalizedNickname ||
        normalizeNickname(profile.nickname || "") === normalizedNickname
      ) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
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
