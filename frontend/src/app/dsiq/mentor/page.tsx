"use client";

import Link from "next/link";
import {
  Bot,
  CalendarCheck,
  Check,
  CircleUserRound,
  Compass,
  FileText,
  GraduationCap,
  Lightbulb,
  Menu,
  Search,
  Send,
  Shield,
  Sparkles,
  SquarePen,
  Target,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { PrivateRoute } from "@/components/private-route";
import { askGemini, type GeminiChatMessage } from "@/lib/gemini";
import { dsiqLogoSrc } from "@/lib/public-asset";
import { useUserProfile } from "@/lib/use-user-profile";

const sidebarItems = [
  { label: "New Chat", href: "/dsiq/chat", icon: SquarePen },
  { label: "Search Chats", href: "/dsiq/chat?panel=search", icon: Search },
  { label: "AI Teacher", href: "/dsiq/mentor", icon: Bot },
  {
    label: "Learning Roadmap",
    href: "/dsiq/chat?panel=roadmap",
    icon: GraduationCap,
  },
  { label: "Focus Mode", href: "/dsiq/chat?panel=focus", icon: Target },
  { label: "Saved Chats", href: "/dsiq/chat?panel=saved", icon: FileText },
] as const;

const collapsedItems = [
  sidebarItems[0],
  sidebarItems[1],
  sidebarItems[2],
  sidebarItems[3],
  sidebarItems[4],
] as const;

const suggestedPrompts = [
  "Teach me step by step",
  "Create today's study plan",
  "Check my progress",
  "Give me practice tasks",
  "Help me stay focused",
];

const insightTexts = [
  "You are building consistency.",
  "Your next step is more important than motivation.",
  "Focus on one skill today.",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getProfileRoleLabel(role?: string | null) {
  const trimmedRole = role?.trim();
  return trimmedRole || "Member";
}

export default function DsiqMentorPage() {
  const { answers, profile, user } = useUserProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mentorMessages, setMentorMessages] = useState<GeminiChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [focusEnabled, setFocusEnabled] = useState(false);

  const displayName =
    profile?.fullName ||
    answers?.fullName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "there";
  const profileImageUrl =
    profile?.profileImageUrl || answers?.profileImageUrl || user?.photoURL || "";
  const role = profile?.role || answers?.role || "student";
  const profileRoleLabel = getProfileRoleLabel(profile?.role || answers?.role);
  const goals =
    profile?.selectedGoals?.length
      ? profile.selectedGoals
      : answers?.selectedGoals?.length
        ? answers.selectedGoals
        : [];
  const primaryGoal =
    goals[0] || answers?.goal || answers?.interest || role || "a focused learner";
  const learningFocus =
    answers?.skills ||
    goals[0] ||
    "one important skill that moves you closer to your goal";
  const nextTask = goals.length
    ? `Practice one small task for ${goals[0]}`
    : "Complete one focused study block and write what you learned";
  const estimatedTime = answers?.time || "30 minutes";

  const mentorContext = useMemo(
    () =>
      [
        "You are DSIQ Mentor, a calm personal AI teacher for a student.",
        "Do not act like a normal open-ended chat. Teach, focus, guide, and give practical next steps.",
        `Student name: ${displayName}.`,
        `Role: ${role}.`,
        `Selected goals: ${goals.length ? goals.join(", ") : "Not provided"}.`,
        `Age: ${profile?.age || answers?.age || "Not provided"}.`,
        `Current learning focus: ${learningFocus}.`,
        "Keep responses clear, supportive, and action-focused.",
      ].join("\n"),
    [answers?.age, displayName, goals, learningFocus, profile?.age, role],
  );

  async function submitMentorPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = prompt.trim();
    if (!question || isSending) {
      return;
    }

    setPrompt("");
    setError("");
    setIsSending(true);

    const userMessage: GeminiChatMessage = {
      role: "user",
      text: question,
    };
    const nextMessages = [...mentorMessages, userMessage];
    setMentorMessages(nextMessages);

    try {
      const answer = await askGemini([
        {
          role: "user",
          text: `${mentorContext}\n\nStudent question: ${question}`,
        },
      ]);
      setMentorMessages((current) => [
        ...current,
        {
          role: "model",
          text: answer,
        },
      ]);
    } catch (mentorError) {
      setError(
        mentorError instanceof Error
          ? mentorError.message
          : "DSIQ Mentor could not answer right now. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  }

  const ProfileAvatar = ({ size = "md" }: { size?: "sm" | "md" }) => {
    const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-xs";

    if (profileImageUrl) {
      return (
        <img
          src={profileImageUrl}
          alt=""
          className={`${sizeClass} shrink-0 rounded-full object-cover`}
        />
      );
    }

    return (
      <span
        className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-[#111111] font-semibold text-white`}
      >
        {getInitials(displayName) || "D"}
      </span>
    );
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => {
    const expanded = mobile || isSidebarOpen;
    const visibleItems = expanded ? sidebarItems : collapsedItems;

    return (
      <aside
        className={`flex h-full flex-col border-r border-[color:var(--color-line)] bg-[color:var(--color-surface-strong)] px-3 py-4 transition-all ${
          expanded ? "w-[292px]" : "w-[76px]"
        }`}
      >
        <div className="flex items-center justify-between">
          {expanded ? (
            <Link
              href="/dsiq/chat"
              className="flex h-12 items-center gap-3 rounded-2xl px-3 text-[color:var(--color-text)] transition hover:bg-white"
              aria-label="DSIQ chat"
            >
              <img
                src={dsiqLogoSrc}
                alt=""
                className="h-10 w-10 shrink-0 object-contain"
              />
              <span className="text-sm font-semibold tracking-[0.02em]">
                DSIQ
              </span>
            </Link>
          ) : (
            <button
              type="button"
              aria-label="Open sidebar"
              title="Open sidebar"
              onClick={() => setIsSidebarOpen(true)}
              className="hidden h-12 w-12 items-center justify-center rounded-2xl transition hover:bg-white lg:flex"
            >
              <img
                src={dsiqLogoSrc}
                alt=""
                className="h-10 w-10 shrink-0 object-contain"
              />
            </button>
          )}

          {mobile ? (
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setIsSidebarOpen(false)}
              className={`hidden h-10 w-10 items-center justify-center rounded-full transition hover:bg-white lg:flex ${
                expanded ? "" : "pointer-events-none invisible"
              }`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <nav className="mt-7 flex flex-1 flex-col gap-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/dsiq/mentor";
            const isAiTeacher = item.label === "AI Teacher";

            return (
              <Link
                key={item.label}
                href={item.href}
                title={expanded ? undefined : item.label}
                onClick={() => {
                  if (mobile) {
                    setIsMobileSidebarOpen(false);
                  }
                }}
                className={`flex min-h-11 items-center rounded-2xl text-sm text-[color:var(--color-text)] transition hover:bg-white ${
                  expanded ? "gap-3 px-3" : "justify-center px-0"
                } ${
                  isAiTeacher
                    ? "border border-[#111111]/10 bg-white font-semibold shadow-[0_8px_20px_rgba(0,0,0,0.04)]"
                    : "font-medium"
                } ${isActive ? "bg-white" : ""}`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {expanded ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[color:var(--color-line)] pt-3">
          <Link
            href="/profile"
            className={`flex w-full items-center rounded-2xl text-left transition hover:bg-white ${
              expanded ? "gap-3 px-3 py-3" : "justify-center px-0 py-3"
            }`}
          >
            <ProfileAvatar />
            {expanded ? (
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[color:var(--color-text)]">
                  {displayName}
                </span>
                <span className="block text-xs text-[color:var(--color-muted)]">
                  {profileRoleLabel}
                </span>
              </span>
            ) : null}
          </Link>
        </div>
      </aside>
    );
  };

  return (
    <PrivateRoute>
      <main className="min-h-screen bg-white text-[color:var(--color-text)]">
        <div className="flex min-h-screen">
          <div className="hidden lg:block">
            <SidebarContent />
          </div>

          {isMobileSidebarOpen ? (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                aria-label="Close menu overlay"
                className="absolute inset-0 bg-black/25"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              <div className="absolute inset-y-0 left-0">
                <SidebarContent mobile />
              </div>
            </div>
          ) : null}

          <section className="min-w-0 flex-1 bg-white">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="fixed left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:bg-[color:var(--color-surface-strong)] lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 pt-20 sm:px-8 lg:px-10 lg:pt-10">
              <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="rounded-[1.75rem] border border-[color:var(--color-line)] bg-white p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)] sm:p-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-line)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-muted)]">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    DSIQ Mentor
                  </div>
                  <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-normal text-[#111111] sm:text-5xl">
                    Your AI teacher that knows your goals.
                  </h1>
                  <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--color-muted)] sm:text-lg">
                    DSIQ Mentor helps you stay focused, learn faster, build real
                    projects, and become the person you said you want to become.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-[color:var(--color-line)] bg-[color:var(--color-surface-strong)] p-5">
                  <div className="flex items-start gap-3">
                    <ProfileAvatar size="sm" />
                    <div>
                      <p className="text-sm font-semibold">
                        Good to see you, {displayName}.
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">
                        You said you want to become: {primaryGoal}.
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">
                        Let&apos;s focus on what matters today.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                <div className="flex flex-col gap-6">
                  <article className="rounded-[1.5rem] border border-[color:var(--color-line)] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--color-surface-strong)]">
                        <Target className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h2 className="text-base font-semibold">
                          Today&apos;s Focus
                        </h2>
                        <p className="text-xs text-[color:var(--color-muted)]">
                          Current learning focus
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 rounded-2xl bg-[color:var(--color-surface-strong)] p-4">
                      <p className="text-sm font-semibold">{learningFocus}</p>
                      <p className="mt-3 text-sm leading-6 text-[color:var(--color-muted)]">
                        {nextTask}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[color:var(--color-muted)]">
                        <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                        {estimatedTime}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPrompt(
                          `Start a focus session for ${learningFocus}. Give me the first step and keep me on track.`,
                        )
                      }
                      className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-black"
                    >
                      Start focus session
                    </button>
                  </article>

                  <article className="rounded-[1.5rem] border border-[color:var(--color-line)] bg-white p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--color-surface-strong)]">
                        <Shield className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <h2 className="text-base font-semibold">
                        Smart Focus Mentor
                      </h2>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[color:var(--color-muted)]">
                      With your permission, DSIQ Mentor can help you notice
                      when your activity does not match your learning goals.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFocusEnabled((value) => !value)}
                      className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-black"
                    >
                      {focusEnabled ? "Smart Focus enabled" : "Enable Smart Focus"}
                    </button>
                    <p className="mt-3 text-xs leading-5 text-[color:var(--color-muted)]">
                      You stay in control. You can turn this off anytime.
                    </p>
                  </article>

                  <article className="rounded-[1.5rem] border border-[color:var(--color-line)] bg-white p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--color-surface-strong)]">
                        <Lightbulb className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <h2 className="text-base font-semibold">Mentor insight</h2>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {insightTexts.map((insight) => (
                        <div
                          key={insight}
                          className="flex items-start gap-3 rounded-2xl bg-[color:var(--color-surface-strong)] px-4 py-3 text-sm"
                        >
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0"
                            aria-hidden="true"
                          />
                          {insight}
                        </div>
                      ))}
                    </div>
                  </article>
                </div>

                <article className="flex min-h-[620px] flex-col rounded-[1.75rem] border border-[color:var(--color-line)] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.04)]">
                  <div className="border-b border-[color:var(--color-line)] px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#111111] text-white">
                        <Bot className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h2 className="text-base font-semibold">Mentor Chat</h2>
                        <p className="text-xs text-[color:var(--color-muted)]">
                          Personal teacher mode
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
                    {mentorMessages.length ? (
                      mentorMessages.map((message, index) => (
                        <div
                          key={`${message.role}-${index}`}
                          className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-7 ${
                            message.role === "user"
                              ? "ml-auto bg-[#111111] text-white"
                              : "mr-auto border border-[color:var(--color-line)] bg-[color:var(--color-surface-strong)] text-[color:var(--color-text)]"
                          }`}
                        >
                          {message.text}
                        </div>
                      ))
                    ) : (
                      <div className="my-auto mx-auto max-w-md text-center">
                        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--color-surface-strong)]">
                          <Compass className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <p className="mt-4 text-sm font-semibold">
                          Ask your Mentor what to do next.
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[color:var(--color-muted)]">
                          DSIQ Mentor uses your profile and onboarding answers
                          to guide your learning with practical next steps.
                        </p>
                      </div>
                    )}

                    {isSending ? (
                      <div className="mr-auto inline-flex items-center gap-2 rounded-full bg-[color:var(--color-surface-strong)] px-4 py-3 text-[color:var(--color-muted)]">
                        <span className="typing-dot" />
                        <span className="typing-dot [animation-delay:120ms]" />
                        <span className="typing-dot [animation-delay:240ms]" />
                        <span className="ml-2 text-xs font-semibold uppercase tracking-[0.18em]">
                          Mentor thinking
                        </span>
                      </div>
                    ) : null}

                    {error ? (
                      <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                        {error}
                      </p>
                    ) : null}
                  </div>

                  <div className="border-t border-[color:var(--color-line)] p-4">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {suggestedPrompts.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setPrompt(suggestion)}
                          className="rounded-full border border-[color:var(--color-line)] px-3 py-2 text-xs font-semibold transition hover:bg-[color:var(--color-surface-strong)]"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                    <form
                      onSubmit={submitMentorPrompt}
                      className="flex items-center gap-3 rounded-[1.5rem] border border-[color:var(--color-line)] bg-white px-4 py-3 focus-within:border-[#111111]"
                    >
                      <input
                        type="text"
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        placeholder="Ask your AI Mentor anything..."
                        className="min-h-10 flex-1 bg-transparent text-sm outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!prompt.trim() || isSending}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Send mentor question"
                      >
                        <Send className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </form>
                  </div>
                </article>
              </section>
            </div>
          </section>
        </div>
      </main>
    </PrivateRoute>
  );
}
