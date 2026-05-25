"use client";

import { Camera, Check, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

import { PrivateRoute } from "@/components/private-route";
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

  useEffect(() => {
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
    setProfileImageUrl(profile?.profileImageUrl || answers?.profileImageUrl || "");
    setSelectedGoals(profile?.selectedGoals || answers?.selectedGoals || []);
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
            ? await isFirebaseNicknameTaken(user.uid, normalizedNickname)
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

      const nicknameTaken =
        authMode === "firebase"
          ? await isFirebaseNicknameTaken(user.uid, normalizedNickname)
          : isLocalNicknameTaken(user.uid, normalizedNickname);

      if (nicknameTaken) {
        setError("This nickname is already taken. Choose another one.");
        return;
      }

      const updates = {
        fullName: fullName.trim(),
        nickname: normalizedNickname,
        role,
        profileImageUrl: profileImageUrl.trim(),
        age: age.trim(),
        selectedGoals,
      };

      if (authMode === "firebase") {
        await updateFirebaseUserProfile({ uid: user.uid, updates });
      } else {
        updateLocalUserProfile(user.uid, updates);
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
              <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.10)]">
                <Camera className="h-4 w-4" aria-hidden="true" />
              </span>
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

          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
              Role
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {roleOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={`rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                    role === option
                      ? "border-[#111111] bg-[color:var(--color-surface-strong)]"
                      : "border-[color:var(--color-line)] text-[color:var(--color-muted)] hover:border-[#111111] hover:text-[color:var(--color-text)]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
              Goals
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {goalOptions.map((goal) => {
                const isSelected = selectedGoals.includes(goal);

                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                      isSelected
                        ? "border-[#111111] bg-[color:var(--color-surface-strong)]"
                        : "border-[color:var(--color-line)] hover:border-[#111111]"
                    }`}
                  >
                    {goal}
                    {isSelected ? <Check className="h-4 w-4" /> : null}
                  </button>
                );
              })}
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

          <button
            type="button"
            onClick={handleSave}
            disabled={
              isSaving ||
              nicknameStatus === "checking" ||
              nicknameStatus === "taken"
            }
            className="mt-6 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {isSaving ? "Saving..." : "Save profile"}
          </button>
        </section>
      </main>
    </PrivateRoute>
  );
}
