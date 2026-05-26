import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { withTimeout } from "@/lib/async-timeout";
import type { GeminiChatMessage } from "@/lib/gemini";

export type PrivateChatSummary = {
  id: string;
  title: string;
  updatedAtMs: number;
  lastMessage?: string;
};

type LocalPrivateChat = PrivateChatSummary & {
  createdAtMs: number;
  messages: Array<GeminiChatMessage & { createdAtMs: number }>;
  source: "private-chat";
};

const PRIVATE_CHAT_LIMIT = 30;
const LOCAL_PRIVATE_CHATS_PREFIX = "dsiq.private-chats.";

function getLocalPrivateChatsKey(uid: string) {
  return `${LOCAL_PRIVATE_CHATS_PREFIX}${uid}`;
}

function createChatTitle(text: string) {
  const title = text.trim().replace(/\s+/g, " ");
  return title.length > 46 ? `${title.slice(0, 43)}...` : title || "New chat";
}

function createLocalId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readLocalPrivateChats(uid: string) {
  if (typeof window === "undefined") {
    return [] as LocalPrivateChat[];
  }

  const raw = window.localStorage.getItem(getLocalPrivateChatsKey(uid));
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as LocalPrivateChat[];
  } catch {
    window.localStorage.removeItem(getLocalPrivateChatsKey(uid));
    return [];
  }
}

function writeLocalPrivateChats(uid: string, chats: LocalPrivateChat[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getLocalPrivateChatsKey(uid),
    JSON.stringify(chats),
  );
}

function upsertLocalPrivateChat(
  uid: string,
  chatId: string,
  titleSeed: string,
  message?: GeminiChatMessage,
) {
  const now = Date.now();
  const chats = readLocalPrivateChats(uid);
  const existingChat = chats.find((chat) => chat.id === chatId);
  const nextMessage = message
    ? {
        ...message,
        createdAtMs: now,
      }
    : null;
  const nextChat: LocalPrivateChat = existingChat
    ? {
        ...existingChat,
        updatedAtMs: now,
        lastMessage: message?.text || existingChat.lastMessage,
        messages: nextMessage
          ? [...existingChat.messages, nextMessage]
          : existingChat.messages,
      }
    : {
        id: chatId,
        title: createChatTitle(titleSeed),
        createdAtMs: now,
        updatedAtMs: now,
        lastMessage: message?.text,
        messages: nextMessage ? [nextMessage] : [],
        source: "private-chat",
      };

  writeLocalPrivateChats(
    uid,
    [nextChat, ...chats.filter((chat) => chat.id !== chatId)]
      .sort((first, second) => second.updatedAtMs - first.updatedAtMs)
      .slice(0, PRIVATE_CHAT_LIMIT),
  );
}

export async function createFirebaseChat(uid: string) {
  if (!db) {
    return null;
  }

  const chatRef = await withTimeout(
    addDoc(collection(db, "users", uid, "chats"), {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      source: "public-chat",
    }),
    undefined,
    "Chat creation timed out.",
  );

  return chatRef.id;
}

export async function saveFirebaseChatMessage(input: {
  chatId: string;
  message: GeminiChatMessage;
  uid: string;
}) {
  if (!db) {
    return;
  }

  const chatRef = doc(db, "users", input.uid, "chats", input.chatId);
  const messagesRef = collection(chatRef, "messages");

  await withTimeout(
    setDoc(
      chatRef,
      {
        updatedAt: serverTimestamp(),
        source: "public-chat",
      },
      { merge: true },
    ),
    undefined,
    "Chat update timed out.",
  );

  await withTimeout(
    addDoc(messagesRef, {
      role: input.message.role,
      text: input.message.text,
      createdAt: serverTimestamp(),
    }),
    undefined,
    "Chat message save timed out.",
  );
}

export async function createPrivateChat(uid: string, firstMessage: string) {
  const title = createChatTitle(firstMessage);
  const now = Date.now();

  if (!db) {
    const chat: LocalPrivateChat = {
      id: createLocalId(),
      title,
      createdAtMs: now,
      updatedAtMs: now,
      messages: [],
      source: "private-chat",
    };
    const chats = [chat, ...readLocalPrivateChats(uid)].slice(0, PRIVATE_CHAT_LIMIT);
    writeLocalPrivateChats(uid, chats);
    return chat.id;
  }

  try {
    const chatRef = await withTimeout(
      addDoc(collection(db, "users", uid, "chats"), {
        title,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdAtMs: now,
        updatedAtMs: now,
        source: "private-chat",
      }),
      undefined,
      "Private chat creation timed out.",
    );

    return chatRef.id;
  } catch (error) {
    console.warn("Firebase private chat creation failed; using local chat.", error);
    const chatId = createLocalId();
    upsertLocalPrivateChat(uid, chatId, firstMessage);
    return chatId;
  }
}

export async function savePrivateChatMessage(input: {
  chatId: string;
  message: GeminiChatMessage;
  uid: string;
}) {
  const now = Date.now();

  if (!db) {
    upsertLocalPrivateChat(input.uid, input.chatId, input.message.text, input.message);
    return;
  }

  const chatRef = doc(db, "users", input.uid, "chats", input.chatId);
  const messagesRef = collection(chatRef, "messages");

  try {
    await withTimeout(
      setDoc(
        chatRef,
        {
          updatedAt: serverTimestamp(),
          updatedAtMs: now,
          lastMessage: input.message.text,
          source: "private-chat",
        },
        { merge: true },
      ),
      undefined,
      "Private chat update timed out.",
    );

    await withTimeout(
      addDoc(messagesRef, {
        role: input.message.role,
        text: input.message.text,
        createdAt: serverTimestamp(),
        createdAtMs: now,
      }),
      undefined,
      "Private chat message save timed out.",
    );
  } catch (error) {
    console.warn("Firebase private chat save failed; using local chat.", error);
    upsertLocalPrivateChat(input.uid, input.chatId, input.message.text, input.message);
  }
}

export async function listPrivateChats(uid: string) {
  if (!db) {
    return readLocalPrivateChats(uid)
      .sort((first, second) => second.updatedAtMs - first.updatedAtMs)
      .slice(0, PRIVATE_CHAT_LIMIT)
      .map(({ id, title, updatedAtMs, lastMessage }) => ({
        id,
        title,
        updatedAtMs,
        lastMessage,
      }));
  }

  try {
    const snapshot = await withTimeout(
      getDocs(collection(db, "users", uid, "chats")),
      undefined,
      "Private chats loading timed out.",
    );

    return snapshot.docs
      .map((chatDoc) => {
        const data = chatDoc.data();
        return {
          id: chatDoc.id,
          title:
            typeof data.title === "string" && data.title.trim()
              ? data.title
              : "New chat",
          updatedAtMs:
            typeof data.updatedAtMs === "number" ? data.updatedAtMs : 0,
          lastMessage:
            typeof data.lastMessage === "string" ? data.lastMessage : undefined,
          source: data.source,
        };
      })
      .filter((chat) => chat.source === "private-chat")
      .sort((first, second) => second.updatedAtMs - first.updatedAtMs)
      .slice(0, PRIVATE_CHAT_LIMIT)
      .map(({ id, title, updatedAtMs, lastMessage }) => ({
        id,
        title,
        updatedAtMs,
        lastMessage,
      }));
  } catch (error) {
    console.warn("Firebase private chats loading failed; using local chats.", error);
    return readLocalPrivateChats(uid)
      .sort((first, second) => second.updatedAtMs - first.updatedAtMs)
      .slice(0, PRIVATE_CHAT_LIMIT)
      .map(({ id, title, updatedAtMs, lastMessage }) => ({
        id,
        title,
        updatedAtMs,
        lastMessage,
      }));
  }
}

export async function loadPrivateChatMessages(
  uid: string,
  chatId: string,
): Promise<GeminiChatMessage[]> {
  if (!db) {
    return (
      readLocalPrivateChats(uid)
        .find((chat) => chat.id === chatId)
        ?.messages.sort((first, second) => first.createdAtMs - second.createdAtMs)
        .map(({ role, text }) => ({ role, text })) || []
    );
  }

  try {
    const chatRef = doc(db, "users", uid, "chats", chatId);
    const snapshot = await withTimeout(
      getDocs(collection(chatRef, "messages")),
      undefined,
      "Private chat messages loading timed out.",
    );

    return snapshot.docs
      .map((messageDoc) => {
        const data = messageDoc.data();
        return {
          role: data.role === "model" ? ("model" as const) : ("user" as const),
          text: typeof data.text === "string" ? data.text : "",
          createdAtMs:
            typeof data.createdAtMs === "number" ? data.createdAtMs : 0,
        };
      })
      .filter((message) => message.text.trim())
      .sort((first, second) => first.createdAtMs - second.createdAtMs)
      .map(({ role, text }) => ({ role, text }));
  } catch (error) {
    console.warn("Firebase private chat messages failed; using local chat.", error);
    return (
      readLocalPrivateChats(uid)
        .find((chat) => chat.id === chatId)
        ?.messages.sort((first, second) => first.createdAtMs - second.createdAtMs)
        .map(({ role, text }) => ({ role, text })) || []
    );
  }
}
