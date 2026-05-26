"use client";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarCheck,
  Check,
  Code2,
  GraduationCap,
  Megaphone,
  MoreHorizontal,
  Rocket,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { PrivateRoute } from "@/components/private-route";
import {
  isFirebaseNicknameTaken,
  saveFirebaseOnboardingAnswers,
} from "@/lib/firebase-user-records";
import {
  isLocalNicknameTaken,
  normalizeNickname,
  saveLocalOnboardingAnswers,
} from "@/lib/user-profile-store";

const goalOptions = [
  { label: "Learn programming", icon: Code2 },
  { label: "Build real projects", icon: Rocket },
  { label: "Find freelance work", icon: BriefcaseBusiness },
  { label: "Start a business", icon: Store },
  { label: "Improve my skills", icon: Sparkles },
  { label: "Prepare for jobs/career", icon: GraduationCap },
  { label: "Grow on social media", icon: Megaphone },
  { label: "Productivity & planning", icon: CalendarCheck },
  { label: "Other", icon: MoreHorizontal },
] as const;

const roleOptions = [
  "Student",
  "Developer",
  "Freelancer",
  "Entrepreneur",
  "Creator",
  "Other",
];

type OnboardingStep = "account" | "goals" | "success";
type NicknameStatus = "idle" | "checking" | "available" | "taken" | "error";

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>("account");
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [role, setRole] = useState("Student");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>("idle");
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { authMode, user } = useAuth();

  useEffect(() => {
    const normalizedNickname = normalizeNickname(nickname);

    if (!normalizedNickname) {
      // Avoid setState in effect when we don't need validation.
      return;
    }

    if (!user) {
      // No signed-in user yet.
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

  async function handleAccountNext() {
    if (!user) {
      setError("You need to be signed in before continuing.");
      return;
    }

    if (!fullName.trim()) {
      setError("Enter your full name to continue.");
      return;
    }

    const normalizedNickname = normalizeNickname(nickname);
    if (!normalizedNickname) {
      setError("Choose a nickname to continue.");
      return;
    }

    if (nicknameStatus === "taken") {
      setError("This nickname is already taken. Choose another one.");
      return;
    }

    const numericAge = Number(age);
    if (!age.trim() || Number.isNaN(numericAge) || numericAge < 1) {
      setError("Enter a valid age to continue.");
      return;
    }

    try {
      setIsCheckingNickname(true);
      const nicknameTaken =
        authMode === "firebase"
          ? await isFirebaseNicknameTaken(user.uid, nickname)
          : isLocalNicknameTaken(user.uid, nickname);

      if (nicknameTaken) {
        setError("This nickname is already taken. Choose another one.");
        return;
      }

      setError("");
      setStep("goals");
    } catch {
      setError("");
      setStep("goals");
    } finally {
      setIsCheckingNickname(false);
    }
  }

  function toggleGoal(goal: string) {
    setSelectedGoals((current) =>
      current.includes(goal)
        ? current.filter((item) => item !== goal)
        : [...current, goal],
    );
  }

  function handleGoalsNext() {
    if (!selectedGoals.length) {
      setError("Select at least one goal, or skip this step.");
      return;
    }

    setError("");
    setStep("success");
  }

  async function handleContinue() {
    if (!user) {
      setError("You need to be signed in before continuing.");
      return;
    }

    const goalSummary = selectedGoals.length
      ? selectedGoals.join(", ")
      : "Explore DSIQ";

    const answers = {
      fullName: fullName.trim(),
      nickname: normalizeNickname(nickname),
      role,
      profileImageUrl: "",
      age: age.trim(),
      selectedGoals,
      goal: goalSummary,
      skills: goalSummary,
      time: "Flexible",
      budget: "Not specified",
      interest: goalSummary,
    };

    try {
      setIsSubmitting(true);
      setError("");

      const saveSucceeded = (() => {
        try {
          // Save locally first for immediate redirect correctness.
          saveLocalOnboardingAnswers(user.uid, answers);
          return true;
        } catch {
          return false;
        }
      })();

      if (!saveSucceeded) {
        throw new Error("Unable to save onboarding answers locally.");
      }

      if (authMode === "firebase") {
        // Do not block redirect if Firebase fails, but still try to save.
        try {
          await saveFirebaseOnboardingAnswers({
            uid: user.uid,
            answers,
          });
        } catch (saveError) {
          console.warn(
            "Firebase onboarding save failed; proceeding with local onboarding completion.",
            saveError,
          );
        }
      }

      router.replace("/dsiq/chat");
      return;


    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to save onboarding answers.",
      );
    } finally {
      // If redirect happens, this will be ignored during navigation.
      setIsSubmitting(false);
    }
  }

  return (
    <PrivateRoute>
      <main className="flex min-h-screen items-center justify-center bg-[color:var(--color-background)] px-4 py-10 text-[color:var(--color-text)] sm:px-6 lg:px-8">
        <section className="w-full max-w-[560px] rounded-[2rem] border border-[color:var(--color-line)] bg-white px-5 py-7 shadow-[0_24px_80px_rgba(11,37,39,0.10)] sm:px-8 sm:py-9">
          {step === "account" ? (
            <div>
              <div className="text-center">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Create your DSIQ profile
                </h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[color:var(--color-muted)]">
                  This helps DSIQ personalize your coaching, learning path, and
                  recommendations.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <label className="block">
                  <span className="sr-only">Full name</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Full name"
                    className="h-[52px] w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[#111111]"
                  />
                </label>
                <label className="relative block">
                  <span className="sr-only">Nickname</span>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(event) =>
                      setNickname(normalizeNickname(event.target.value))
                    }
                    placeholder="Nickname"
                    className="h-[52px] w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 pr-12 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[#111111]"
                  />
                  {nicknameStatus === "checking" ? (
                    <span
                      className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-[color:var(--color-muted)] border-t-transparent"
                      aria-label="Checking nickname"
                    />
                  ) : null}
                  {nicknameStatus === "available" ? (
                    <Check
                      className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--color-brand-strong)]"
                      aria-label="Nickname available"
                    />
                  ) : null}
                  {nicknameStatus === "taken" ? (
                    <X
                      className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--color-danger)]"
                      aria-label="Nickname unavailable"
                    />
                  ) : null}
                </label>
                <label className="block">
                  <span className="sr-only">Age</span>
                  <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    placeholder="Age"
                    className="h-[52px] w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[#111111]"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {roleOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRole(option)}
                      className={`rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                        role === option
                          ? "border-[#111111] bg-[color:var(--color-surface-strong)] text-[color:var(--color-text)]"
                          : "border-[color:var(--color-line)] bg-white text-[color:var(--color-muted)] hover:border-[#111111] hover:text-[color:var(--color-text)]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {error ? (
                <p className="mt-4 rounded-2xl bg-[#fff5e7] px-4 py-3 text-sm text-[color:var(--color-text)]">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleAccountNext}
                disabled={
                  isCheckingNickname ||
                  nicknameStatus === "checking" ||
                  nicknameStatus === "taken"
                }
                className="mt-6 inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCheckingNickname ? <LoadingSpinner /> : "Finish creating account"}
              </button>

              <p className="mt-5 text-center text-xs leading-6 text-[color:var(--color-muted)]">
                By clicking &quot;Finish creating account&quot;, you agree to our{" "}
                <Link href="/terms" className="underline underline-offset-4">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline underline-offset-4">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          ) : null}

          {step === "goals" ? (
            <div>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep("account");
                }}
                className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <div className="text-center">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  What do you want to achieve with DSIQ?
                </h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[color:var(--color-muted)]">
                  Select all that apply. DSIQ will use this to build your
                  personal roadmap.
                </p>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {goalOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedGoals.includes(option.label);

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => toggleGoal(option.label)}
                      aria-pressed={isSelected}
                      className={`flex min-h-16 items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                        isSelected
                          ? "border-[#111111] bg-[color:var(--color-surface-strong)] text-[color:var(--color-text)]"
                          : "border-[color:var(--color-line)] bg-white text-[color:var(--color-text)] hover:border-[#111111]"
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-surface-strong)]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">{option.label}</span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-[#111111] bg-[#111111] text-white"
                            : "border-[color:var(--color-line)]"
                        }`}
                      >
                        {isSelected ? (
                          <Check className="h-3 w-3" aria-hidden="true" />
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>

              {error ? (
                <p className="mt-4 rounded-2xl bg-[#fff5e7] px-4 py-3 text-sm text-[color:var(--color-text)]">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleGoalsNext}
                className="mt-6 inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-black"
              >
                Next
              </button>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep("success");
                }}
                className="mx-auto mt-4 block text-sm font-medium text-[color:var(--color-muted)] underline-offset-4 transition hover:text-[color:var(--color-text)] hover:underline"
              >
                Skip
              </button>
            </div>
          ) : null}

          {step === "success" ? (
            <div>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep("goals");
                }}
                className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)]"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-strong)]">
                <Check className="h-7 w-7" aria-hidden="true" />
              </div>
              <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                You&apos;re all set
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[color:var(--color-muted)]">
                DSIQ is ready to guide your learning, skills, projects, and
                opportunities.
              </p>

              {error ? (
                <p className="mt-5 rounded-2xl bg-[#fff5e7] px-4 py-3 text-sm text-[color:var(--color-text)]">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleContinue}
                disabled={isSubmitting}
                className="mt-7 inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <LoadingSpinner /> : "Continue"}
              </button>

              {isSubmitting ? null : (
                <p className="mx-auto mt-5 max-w-sm text-xs leading-6 text-[color:var(--color-muted)]">
                  DSIQ can make mistakes. Don&apos;t share sensitive information.
                </p>
              )}
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </PrivateRoute>
  );
}

function LoadingSpinner() {
  return (
    <span
      className="mx-auto block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-label="Loading"
    />
  );
}
