"use client";

import Link from "next/link";
import { FileText, Save, Send } from "lucide-react";
import { useEffect, useState } from "react";

import { PrivateRoute } from "@/components/private-route";
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

export default function DsiqSavedChatsPage() {
  const { user } = useUserProfile();
  const [chats, setChats] = useState<PrivateChatSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSavedChats() {
      if (!user) {
        setChats([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setChats(await listBookmarkedPrivateChats(user.uid));
      setIsLoading(false);
    }

    void loadSavedChats();
  }, [user]);

  return (
    <PrivateRoute>
      <main className="min-h-[100dvh] bg-[color:var(--color-background)] text-[color:var(--color-text)]">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-5 py-6 sm:px-8 lg:py-10">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--color-line)] pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                Saved Chats
              </p>
              <h1 className="mt-2 text-2xl font-semibold">Bookmarked learning chats</h1>
            </div>
            <Link
              href="/dsiq/chat"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-black"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Back to chat
            </Link>
          </header>

          {isLoading ? (
            <p className="rounded-2xl bg-white px-5 py-4 text-sm text-[color:var(--color-muted)]">
              Loading saved chats...
            </p>
          ) : chats.length ? (
            <section className="flex flex-col gap-3">
              {chats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/dsiq/chat?chatId=${encodeURIComponent(chat.id)}`}
                  className="rounded-2xl border border-[color:var(--color-line)] bg-white p-4 transition hover:border-[#111111]/30 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-strong)]">
                      <Save className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
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
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-black"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Back to chat
              </Link>
            </section>
          )}
        </div>
      </main>
    </PrivateRoute>
  );
}
