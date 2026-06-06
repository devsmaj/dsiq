"use client";

import Link from "next/link";
import { FileText, Save, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { DsiqAppSidebar } from "@/components/dsiq-app-sidebar";
import { PrivateRoute } from "@/components/private-route";
import { getFriendlyFirestoreError } from "@/lib/firestore-errors";
import {
  listBookmarkedPrivateChats,
  type PrivateChatSummary,
} from "@/lib/firebase-chat-store";
import { useUserProfile } from "@/lib/use-user-profile";

function formatUpdatedAt(updatedAtMs: number) {
  if (!updatedAtMs) {
    return "Saved";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(updatedAtMs));
}

function getSavedChatHref(chat: PrivateChatSummary) {
  const path = chat.chatType === "teacher" ? "/dsiq/mentor" : "/dsiq/chat";
  return `${path}?chatId=${encodeURIComponent(chat.id)}`;
}

export default function DsiqSavedChatsPage() {
  const { t } = useTranslation();
  const { isAuthLoading, user } = useUserProfile();
  const [chats, setChats] = useState<PrivateChatSummary[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSavedChats() {
      if (isAuthLoading) {
        return;
      }

      if (!user) {
        setChats([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        setChats(await listBookmarkedPrivateChats(user.uid));
      } catch (loadError) {
        setError(
          getFriendlyFirestoreError(
            loadError,
            "Saved chats could not load from Firestore. Please retry.",
          ),
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadSavedChats();
  }, [isAuthLoading, user]);

  return (
    <PrivateRoute>
      <DsiqAppSidebar activeHref="/dsiq/saved">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-5 py-20 sm:px-8 lg:py-10">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--color-line)] pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                {t("saved.title")}
              </p>
              <h1 className="mt-2 text-2xl font-semibold">Bookmarked learning chats</h1>
            </div>
            <Link
              href="/dsiq/chat"
              className="primary-button inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:bg-black"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Back to chat
            </Link>
          </header>

          {isLoading ? (
            <p className="rounded-2xl bg-white px-5 py-4 text-sm text-[color:var(--color-muted)]">
              Loading saved chats...
            </p>
          ) : error ? (
            <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-700">
              {error}
            </p>
          ) : chats.length ? (
            <section className="flex flex-col gap-3">
              {chats.map((chat) => (
                <Link
                  key={chat.id}
                  href={getSavedChatHref(chat)}
                  className="rounded-2xl border border-[color:var(--color-line)] bg-white p-4 transition hover:border-[#111111]/30 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-strong)]">
                      <Save className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="mb-2 inline-flex rounded-full bg-[color:var(--color-surface-strong)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--color-muted)]">
                        {chat.chatType === "teacher"
                          ? t("sidebar.aiTeacher")
                          : t("sidebar.normalChat")}
                      </span>
                      <h2 className="truncate text-sm font-semibold">
                        {chat.title}
                      </h2>
                      {chat.lastMessage ? (
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-[color:var(--color-muted)]">
                          {chat.lastMessage}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs text-[color:var(--color-muted)]">
                        {formatUpdatedAt(chat.updatedAtMs)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          ) : (
            <section className="rounded-2xl border border-[color:var(--color-line)] bg-white px-5 py-12 text-center">
              <FileText
                className="mx-auto h-10 w-10 text-[color:var(--color-muted)]"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-semibold">No saved chats yet.</h2>
              <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                Open a recent chat and choose Save chat to bookmark it here.
              </p>
              <Link
                href="/dsiq/chat"
                className="primary-button mt-5 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:bg-black"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Back to chat
              </Link>
            </section>
          )}
        </div>
      </DsiqAppSidebar>
    </PrivateRoute>
  );
}
