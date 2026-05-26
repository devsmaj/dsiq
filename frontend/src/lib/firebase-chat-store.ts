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

export type PrivateChatMessage = GeminiChatMessage & {
  createdAtMs: number;
  deletedAtMs?: number;
  id: string;
};

type LocalPrivateChat = PrivateChatSummary & {
  createdAtMs: number;
  deletedAtMs?: number;
  messages: PrivateChatMessage[];
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

function createMessageId() {
  return `message-${createLocalId()}`;
}

function normalizeLocalChats(chats: LocalPrivateChat[]) {
  return chats.map((chat) => ({
    ...chat,
    messages: (chat.messages || []).map((message) => ({
      ...message,
      id: message.id || createMessageId(),
      createdAtMs: message.createdAtMs || chat.createdAtMs || Date.now(),
    })),
  }));
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
    return normalizeLocalChats(JSON.parse(raw) as LocalPrivateChat[]);
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
  message?: GeminiChatMessage & Partial<PrivateChatMessage>,
) {
  const now = Date.now();
  const chats = readLocalPrivateChats(uid);
  const existingChat = chats.find((chat) => chat.id === chatId);
  const nextMessage = message
    ? {
        ...message,
        createdAtMs: message.createdAtMs || now,
        id: message.id || createMessageId(),
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

  return nextMessage;
}

function deleteLocalPrivateChatMessage(
  uid: string,
  chatId: string,
  messageId: string,
) {
  const now = Date.now();

  writeLocalPrivateChats(
    uid,
    readLocalPrivateChats(uid).map((chat) => {
      if (chat.id !== chatId) {
        return chat;
      }

      const messages = chat.messages.map((message) =>
        message.id === messageId
          ? { ...message, deletedAtMs: message.deletedAtMs || now }
          : message,
      );
      const lastVisibleMessage = [...messages]
        .filter((message) => !message.deletedAtMs)
        .sort((first, second) => second.createdAtMs - first.createdAtMs)[0];

      return {
        ...chat,
        lastMessage: lastVisibleMessage?.text || "",
        messages,
        updatedAtMs: now,
      };
    }),
  );
}

function updateLocalPrivateChatTitle(uid: string, chatId: string, title: string) {
  const now = Date.now();

  writeLocalPrivateChats(
    uid,
    readLocalPrivateChats(uid).map((chat) =>
      chat.id === chatId
        ? {
            ...chat,
            title,
            updatedAtMs: now,
          }
        : chat,
    ),
  );
}

function deleteLocalPrivateChat(uid: string, chatId: string) {
  const now = Date.now();

  writeLocalPrivateChats(
    uid,
    readLocalPrivateChats(uid).map((chat) =>
      chat.id === chatId
        ? {
            ...chat,
            deletedAtMs: chat.deletedAtMs || now,
            updatedAtMs: now,
          }
        : chat,
    ),
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
  message: GeminiChatMessage & Partial<PrivateChatMessage>;
  uid: string;
}): Promise<PrivateChatMessage> {
  const now = Date.now();
  const message: PrivateChatMessage = {
    id: input.message.id || createMessageId(),
    role: input.message.role,
    text: input.message.text,
    createdAtMs: input.message.createdAtMs || now,
    deletedAtMs: input.message.deletedAtMs,
  };

  if (!db) {
    return (
      upsertLocalPrivateChat(input.uid, input.chatId, message.text, message) ||
      message
    );
  }

  const chatRef = doc(db, "users", input.uid, "chats", input.chatId);
  const messageRef = doc(collection(chatRef, "messages"), message.id);

  try {
    await withTimeout(
      setDoc(
        chatRef,
        {
          updatedAt: serverTimestamp(),
          updatedAtMs: message.createdAtMs,
          lastMessage: message.text,
          source: "private-chat",
        },
        { merge: true },
      ),
      undefined,
      "Private chat update timed out.",
    );

    await withTimeout(
      setDoc(messageRef, {
        role: message.role,
        text: message.text,
        createdAt: serverTimestamp(),
        createdAtMs: message.createdAtMs,
      }),
      undefined,
      "Private chat message save timed out.",
    );
  } catch (error) {
    console.warn("Firebase private chat save failed; using local chat.", error);
    upsertLocalPrivateChat(input.uid, input.chatId, message.text, message);
  }

  return message;
}

export async function listPrivateChats(uid: string) {
  if (!db) {
    return readLocalPrivateChats(uid)
      .filter((chat) => !chat.deletedAtMs)
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
          deletedAtMs:
            typeof data.deletedAtMs === "number" ? data.deletedAtMs : undefined,
          source: data.source,
        };
      })
      .filter((chat) => chat.source === "private-chat" && !chat.deletedAtMs)
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
      .filter((chat) => !chat.deletedAtMs)
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

export async function updatePrivateChatTitle(input: {
  chatId: string;
  title: string;
  uid: string;
}) {
  const title = input.title.trim() || "New chat";
  const now = Date.now();

  if (!db) {
    updateLocalPrivateChatTitle(input.uid, input.chatId, title);
    return;
  }

  try {
    await withTimeout(
      setDoc(
        doc(db, "users", input.uid, "chats", input.chatId),
        {
          title,
          updatedAt: serverTimestamp(),
          updatedAtMs: now,
        },
        { merge: true },
      ),
      undefined,
      "Private chat title update timed out.",
    );
    updateLocalPrivateChatTitle(input.uid, input.chatId, title);
  } catch (error) {
    console.warn("Firebase private chat title update failed; using local chat.", error);
    updateLocalPrivateChatTitle(input.uid, input.chatId, title);
  }
}

export async function deletePrivateChat(input: {
  chatId: string;
  uid: string;
}) {
  const now = Date.now();

  if (!db) {
    deleteLocalPrivateChat(input.uid, input.chatId);
    return;
  }

  try {
    await withTimeout(
      setDoc(
        doc(db, "users", input.uid, "chats", input.chatId),
        {
          deletedAt: serverTimestamp(),
          deletedAtMs: now,
          updatedAt: serverTimestamp(),
          updatedAtMs: now,
        },
        { merge: true },
      ),
      undefined,
      "Private chat delete timed out.",
    );
    deleteLocalPrivateChat(input.uid, input.chatId);
  } catch (error) {
    console.warn("Firebase private chat delete failed; using local chat.", error);
    deleteLocalPrivateChat(input.uid, input.chatId);
  }
}

export async function loadPrivateChatMessages(
  uid: string,
  chatId: string,
): Promise<PrivateChatMessage[]> {
  if (!db) {
    return (
      readLocalPrivateChats(uid)
        .find((chat) => chat.id === chatId)
        ?.messages.sort((first, second) => first.createdAtMs - second.createdAtMs)
        .filter((message) => !message.deletedAtMs) || []
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
          id: messageDoc.id,
          role: data.role === "model" ? ("model" as const) : ("user" as const),
          text: typeof data.text === "string" ? data.text : "",
          createdAtMs:
            typeof data.createdAtMs === "number" ? data.createdAtMs : 0,
          deletedAtMs:
            typeof data.deletedAtMs === "number" ? data.deletedAtMs : undefined,
        };
      })
      .filter((message) => message.text.trim() && !message.deletedAtMs)
      .sort((first, second) => first.createdAtMs - second.createdAtMs)
  } catch (error) {
    console.warn("Firebase private chat messages failed; using local chat.", error);
    return (
      readLocalPrivateChats(uid)
        .find((chat) => chat.id === chatId)
        ?.messages.sort((first, second) => first.createdAtMs - second.createdAtMs)
        .filter((message) => !message.deletedAtMs) || []
    );
  }
}

export async function deletePrivateChatMessage(input: {
  chatId: string;
  messageId: string;
  uid: string;
}) {
  const now = Date.now();

  if (!db) {
    deleteLocalPrivateChatMessage(input.uid, input.chatId, input.messageId);
    return;
  }

  const chatRef = doc(db, "users", input.uid, "chats", input.chatId);
  const messageRef = doc(chatRef, "messages", input.messageId);

  try {
    await withTimeout(
      setDoc(
        messageRef,
        {
          deletedAt: serverTimestamp(),
          deletedAtMs: now,
        },
        { merge: true },
      ),
      undefined,
      "Private chat message delete timed out.",
    );

    const snapshot = await withTimeout(
      getDocs(collection(chatRef, "messages")),
      undefined,
      "Private chat messages refresh timed out.",
    );
    const lastVisibleMessage = snapshot.docs
      .map((messageDoc) => {
        const data = messageDoc.data();
        const deletedAtMs =
          messageDoc.id === input.messageId
            ? now
            : typeof data.deletedAtMs === "number"
              ? data.deletedAtMs
              : undefined;

        return {
          text: typeof data.text === "string" ? data.text : "",
          createdAtMs:
            typeof data.createdAtMs === "number" ? data.createdAtMs : 0,
          deletedAtMs,
        };
      })
      .filter((message) => message.text.trim() && !message.deletedAtMs)
      .sort((first, second) => second.createdAtMs - first.createdAtMs)[0];

    await withTimeout(
      setDoc(
        chatRef,
        {
          lastMessage: lastVisibleMessage?.text || "",
          updatedAt: serverTimestamp(),
          updatedAtMs: now,
        },
        { merge: true },
      ),
      undefined,
      "Private chat update after delete timed out.",
    );
  } catch (error) {
    console.warn("Firebase private chat message delete failed; using local chat.", error);
    deleteLocalPrivateChatMessage(input.uid, input.chatId, input.messageId);
  }
}
