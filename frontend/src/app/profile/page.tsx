"use client";

import { Camera, Check, ChevronDown, Save, X } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";

import { PrivateRoute } from "@/components/private-route";
import { withTimeout } from "@/lib/async-timeout";
import {
  isFirebaseNicknameTaken,
  updateFirebaseUserProfile,
} from "@/lib/firebase-user-records";
import {
  isLocalNicknameTaken,
  normalizeNickname,
  updateLocalUserProfile,
} from "@/lib/user-profile-store";
import { useUserProfile } from "@/lib/use-user-profile";

const roleOptions = [
  "Student",
  "Developer",
  "Freelancer",
  "Entrepreneur",
  "Creator",
  "Other",
];

const goalOptions = [
  "Learn programming",
  "Build real projects",
  "Find freelance work",
  "Start a business",
  "Improve my skills",
  "Prepare for jobs/career",
  "Grow on social media",
  "Productivity & planning",
  "Other",
];

type NicknameStatus = "idle" | "checking" | "available" | "taken" | "error";

const MAX_PROFILE_IMAGE_BYTES = 500 * 1024;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const { answers, authMode, profile, user } = useUserProfile();
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [role, setRole] = useState("Student");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>("idle");
  const [isSaving, setIsSaving] = useState(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);

  function getDefaultProfileImageUrl() {
    return (
      profile?.profileImageUrl ||
      answers?.profileImageUrl ||
      user?.photoURL ||
      ""
    );
  }

  function resetFormToSavedProfile() {
    setFullName(
      profile?.fullName ||
        answers?.fullName ||
        user?.displayName ||
        user?.email?.split("@")[0] ||
        "",
    );
    setNickname(profile?.nickname || answers?.nickname || "");
    setAge(profile?.age || answers?.age || "");
    setRole(profile?.role || answers?.role || "Student");
    setProfileImageUrl(getDefaultProfileImageUrl());
    setSelectedGoals(profile?.selectedGoals || answers?.selectedGoals || []);
    setIsGoalsOpen(false);
    setError("");
    setStatusMessage("");
  }

  useEffect(() => {
    resetFormToSavedProfile();
    // resetFormToSavedProfile intentionally reads current profile/auth state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, profile, user]);

  useEffect(() => {
    const normalizedNickname = normalizeNickname(nickname);
    if (!normalizedNickname || !user) {
      setNicknameStatus("idle");
      return;
    }

    setNicknameStatus("checking");
    const timeout = window.setTimeout(async () => {
      try {
        const nicknameTaken =
          authMode === "firebase"
            ? await withTimeout(
                isFirebaseNicknameTaken(user.uid, normalizedNickname),
                undefined,
                "Nickname check timed out.",
              )
            : isLocalNicknameTaken(user.uid, normalizedNickname);

        setNicknameStatus(nicknameTaken ? "taken" : "available");
      } catch {
        setNicknameStatus("error");
      }
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [authMode, nickname, user]);

  function toggleGoal(goal: string) {
    setSelectedGoals((current) =>
      current.includes(goal)
        ? current.filter((item) => item !== goal)
        : [...current, goal],
    );
  }

  function handleProfileImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setError("Choose an image smaller than 500 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImageUrl(reader.result);
        setError("");
        setStatusMessage("");
      }
    };
    reader.onerror = () => {
      setError("We could not read that image. Please try another one.");
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!user) {
      setError("You need to be signed in before saving.");
      return;
    }

    if (!fullName.trim()) {
      setError("Enter your full name.");
      return;
    }

    const normalizedNickname = normalizeNickname(nickname);
    if (!normalizedNickname) {
      setError("Choose a nickname.");
      return;
    }

    if (nicknameStatus === "taken") {
      setError("This nickname is already taken. Choose another one.");
      return;
    }

    if (!age.trim()) {
      setError("Enter your age.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setStatusMessage("");

      try {
        const nicknameTaken =
          authMode === "firebase"
            ? await withTimeout(
                isFirebaseNicknameTaken(user.uid, normalizedNickname),
                undefined,
                "Nickname check timed out.",
              )
            : isLocalNicknameTaken(user.uid, normalizedNickname);

        if (nicknameTaken) {
          setError("This nickname is already taken. Choose another one.");
          return;
        }
      } catch (nicknameError) {
        console.warn("Nickname check failed before profile save.", nicknameError);
      }

      const updates = {
        fullName: fullName.trim(),
        nickname: normalizedNickname,
        role,
        profileImageUrl: profileImageUrl.trim(),
        age: age.trim(),
        selectedGoals,
      };

      updateLocalUserProfile(user.uid, updates);

      if (authMode === "firebase") {
        try {
          await withTimeout(
            updateFirebaseUserProfile({ uid: user.uid, updates }),
            undefined,
            "Profile save timed out.",
          );
        } catch (syncError) {
          console.warn("Firebase profile sync failed.", syncError);
          setNickname(normalizedNickname);
          setStatusMessage(
            "Profile saved on this device. Cloud sync will try again later.",
          );
          return;
        }
      }

      setNickname(normalizedNickname);
      setStatusMessage("Profile saved.");
    } catch {
      setError("We could not save your profile right now.");
    } finally {
      setIsSaving(false);
    }
  }

  const avatarName = fullName || nickname || "DSIQ User";

  return (
    <PrivateRoute>
      <main className="min-h-screen bg-[color:var(--color-background)] px-4 py-8 text-[color:var(--color-text)] sm:px-6 lg:px-8">
        <section className="mx-auto w-full max-w-3xl rounded-[2rem] border border-[color:var(--color-line)] bg-white p-5 shadow-[0_24px_80px_rgba(11,37,39,0.10)] sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt=""
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#111111] text-2xl font-semibold text-white">
                  {getInitials(avatarName) || "D"}
                </div>
              )}
              <button
                type="button"
                aria-label="Upload profile picture"
                onClick={() => profileImageInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.10)] transition hover:bg-[color:var(--color-surface-strong)]"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
              </button>
              <input
                ref={profileImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageUpload}
              />
            </div>

            <h1 className="mt-5 text-2xl font-semibold tracking-tight">
              User profile
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-[color:var(--color-muted)]">
              Edit the details DSIQ uses for your coaching, learning path, and
              recommendations.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                Full name
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="h-[52px] w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 text-sm outline-none transition focus:border-[#111111]"
              />
            </label>

            <label className="relative block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                Nickname
              </span>
              <input
                type="text"
                value={nickname}
                onChange={(event) =>
                  setNickname(normalizeNickname(event.target.value))
                }
                className="h-[52px] w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 pr-12 text-sm outline-none transition focus:border-[#111111]"
              />
              {nicknameStatus === "checking" ? (
                <span
                  className="absolute bottom-4 right-4 h-4 w-4 animate-spin rounded-full border-2 border-[color:var(--color-muted)] border-t-transparent"
                  aria-label="Checking nickname"
                />
              ) : null}
              {nicknameStatus === "available" ? (
                <Check
                  className="absolute bottom-3.5 right-4 h-5 w-5 text-[color:var(--color-brand-strong)]"
                  aria-label="Nickname available"
                />
              ) : null}
              {nicknameStatus === "taken" ? (
                <X
                  className="absolute bottom-3.5 right-4 h-5 w-5 text-[color:var(--color-danger)]"
                  aria-label="Nickname unavailable"
                />
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                Age
              </span>
              <input
                type="number"
                min="1"
                value={age}
                onChange={(event) => setAge(event.target.value)}
                className="h-[52px] w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 text-sm outline-none transition focus:border-[#111111]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                Profile image URL
              </span>
              <input
                type="url"
                value={profileImageUrl}
                onChange={(event) => setProfileImageUrl(event.target.value)}
                placeholder="https://..."
                className="h-[52px] w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 text-sm outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[#111111]"
              />
            </label>
          </div>

          <label className="mt-6 block">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
              Role
            </span>
            <div className="relative">
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="h-[52px] w-full appearance-none rounded-2xl border border-[color:var(--color-line)] bg-white px-4 pr-12 text-sm font-medium text-[color:var(--color-text)] outline-none transition focus:border-[#111111]"
              >
                {roleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted)]"
                aria-hidden="true"
              />
            </div>
          </label>

          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
              Goals
            </p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsGoalsOpen((value) => !value)}
                className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border border-[color:var(--color-line)] bg-white px-4 py-3 text-left text-sm font-medium text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
              >
                <span className="min-w-0 truncate">
                  {selectedGoals.length
                    ? selectedGoals.join(", ")
                    : "Select goals"}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
              </button>
              {isGoalsOpen ? (
                <div className="absolute left-0 right-0 top-14 z-20 max-h-72 overflow-y-auto rounded-2xl border border-[color:var(--color-line)] bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
                  {goalOptions.map((goal) => {
                    const isSelected = selectedGoals.includes(goal);

                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                          isSelected
                            ? "bg-[color:var(--color-surface-strong)] text-[color:var(--color-text)]"
                            : "text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-strong)] hover:text-[color:var(--color-text)]"
                        }`}
                      >
                        {goal}
                        {isSelected ? <Check className="h-4 w-4" /> : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          {error ? (
            <p className="mt-5 rounded-2xl bg-[#fff5e7] px-4 py-3 text-sm text-[color:var(--color-text)]">
              {error}
            </p>
          ) : null}
          {statusMessage ? (
            <p className="mt-5 rounded-2xl bg-[color:var(--color-brand-soft)] px-4 py-3 text-sm text-[color:var(--color-text)]">
              {statusMessage}
            </p>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={resetFormToSavedProfile}
              disabled={isSaving}
              className="inline-flex h-[52px] w-full items-center justify-center rounded-full border border-[color:var(--color-line)] px-5 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={
                isSaving ||
                nicknameStatus === "checking" ||
                nicknameStatus === "taken"
              }
              className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {isSaving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </section>
      </main>
    </PrivateRoute>
  );
}
