import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { withTimeout } from "@/lib/async-timeout";
import type { GroqChatMessage } from "@/lib/groq";

export type PrivateChatSummary = {
  chatType: ChatType;
  id: string;
  isBookmarked?: boolean;
  title: string;
  updatedAtMs: number;
  lastMessage?: string;
};

export type ChatType = "normal" | "teacher";

export type PrivateChatMessage = GroqChatMessage & {
  createdAtMs: number;
  deletedAtMs?: number;
  id: string;
  imageAttachments?: Array<{
    dataUrl: string;
    name: string;
  }>;
  imageDataUrl?: string;
  imageName?: string;
};

type LocalPrivateChat = PrivateChatSummary & {
  createdAtMs: number;
  deletedAtMs?: number;
  messages: PrivateChatMessage[];
  source: "private-chat";
};

const PRIVATE_CHAT_LIMIT = 30;
const LOCAL_PRIVATE_CHATS_PREFIX = "dsiq.private-chats.";

function getPrivateChatCollectionName(chatType: ChatType) {
  return chatType === "teacher" ? "teacherChats" : "chats";
}

function canUseFirestoreForUid(uid: string) {
  return Boolean(db) && Boolean(uid?.trim()) && !uid.startsWith("local-");
}

function getPrivateChatDoc(uid: string, chatId: string, chatType: ChatType) {
  return doc(db!, "users", uid, getPrivateChatCollectionName(chatType), chatId);
}

function getUserDoc(uid: string) {
  return doc(db!, "users", uid);
}

function getPrivateChatPath(uid: string, chatId: string, chatType: ChatType) {
  return `users/${uid}/${getPrivateChatCollectionName(chatType)}/${chatId}`;
}

function isDevelopment() {
  return process.env.NODE_ENV !== "production";
}

function debugFirestorePath(action: string, uid: string, path: string) {
  if (!isDevelopment()) {
    return;
  }

  console.info(`[Firestore private chat] ${action}`, {
    path,
    uid,
  });
}

function debugFirestoreError(action: string, path: string, error: unknown) {
  if (!isDevelopment()) {
    return;
  }

  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";
  const message = error instanceof Error ? error.message : String(error);

  console.error(`[Firestore private chat] ${action} failed`, {
    code,
    message,
    path,
  });
}

function assertValidUid(uid: string) {
  if (!uid?.trim()) {
    throw new Error("Cannot sync private chat before Firebase Auth provides a user UID.");
  }
}

async function ensureFirebaseUserDocument(uid: string) {
  if (!canUseFirestoreForUid(uid)) {
    return;
  }

  assertValidUid(uid);

  const path = `users/${uid}`;
  debugFirestorePath("merge user document", uid, path);

  try {
    await withTimeout(
      setDoc(
        getUserDoc(uid),
        {
          uid,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      ),
      undefined,
      "User document sync timed out.",
    );
  } catch (error) {
    debugFirestoreError("merge user document", path, error);
    throw error;
  }
}

async function findPrivateChatType(uid: string, chatId: string, preferredType?: ChatType) {
  if (preferredType) {
    return preferredType;
  }

  if (!canUseFirestoreForUid(uid)) {
    return "normal" as const;
  }

  const teacherSnapshot = await withTimeout(
    getDoc(getPrivateChatDoc(uid, chatId, "teacher")),
    undefined,
    "AI Teacher chat lookup timed out.",
  );

  return teacherSnapshot.exists() ? ("teacher" as const) : ("normal" as const);
}

function getSyncErrorMessage(label: string) {
  return `${label} could not sync to Firestore. Check your connection and try again.`;
}

function normalizeChatType(value: unknown): ChatType {
  return value === "teacher" ? "teacher" : "normal";
}

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
  chatType: ChatType,
  message?: GroqChatMessage & Partial<PrivateChatMessage>,
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
        chatType: existingChat.chatType || chatType,
        lastMessage: message?.text || existingChat.lastMessage,
        messages: nextMessage
          ? [...existingChat.messages, nextMessage]
          : existingChat.messages,
      }
    : {
        id: chatId,
        title: createChatTitle(titleSeed),
        chatType,
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

function updateLocalPrivateChatBookmark(
  uid: string,
  chatId: string,
  isBookmarked: boolean,
) {
  const now = Date.now();

  writeLocalPrivateChats(
    uid,
    readLocalPrivateChats(uid).map((chat) =>
      chat.id === chatId
        ? {
            ...chat,
            isBookmarked,
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
  assertValidUid(uid);

  if (!canUseFirestoreForUid(uid)) {
    return null;
  }

  await ensureFirebaseUserDocument(uid);

  const firestoreDb = db!;
  const chatRef = await withTimeout(
    addDoc(collection(firestoreDb, "users", uid, "chats"), {
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
  message: GroqChatMessage;
  uid: string;
}) {
  assertValidUid(input.uid);

  if (!canUseFirestoreForUid(input.uid)) {
    return;
  }

  await ensureFirebaseUserDocument(input.uid);

  const firestoreDb = db!;
  const chatRef = doc(firestoreDb, "users", input.uid, "chats", input.chatId);
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

export async function createPrivateChat(
  uid: string,
  firstMessage: string,
  chatType: ChatType = "normal",
) {
  assertValidUid(uid);

  const title = createChatTitle(firstMessage);
  const now = Date.now();

  if (!canUseFirestoreForUid(uid)) {
    const chat: LocalPrivateChat = {
      id: createLocalId(),
      title,
      chatType,
      createdAtMs: now,
      updatedAtMs: now,
      messages: [],
      source: "private-chat",
    };
    const chats = [chat, ...readLocalPrivateChats(uid)].slice(0, PRIVATE_CHAT_LIMIT);
    writeLocalPrivateChats(uid, chats);
    return chat.id;
  }

  await ensureFirebaseUserDocument(uid);

  const firestoreDb = db!;
  const collectionPath = `users/${uid}/${getPrivateChatCollectionName(chatType)}`;
  debugFirestorePath("create private chat", uid, collectionPath);
  let chatRef;

  try {
    chatRef = await withTimeout(
      addDoc(collection(firestoreDb, "users", uid, getPrivateChatCollectionName(chatType)), {
        title,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdAtMs: now,
        updatedAtMs: now,
        chatType,
        source: "private-chat",
      }),
      undefined,
      getSyncErrorMessage("Chat"),
    );
  } catch (error) {
    debugFirestoreError("create private chat", collectionPath, error);
    throw error;
  }

  return chatRef.id;
}

export async function savePrivateChatMessage(input: {
  chatId: string;
  chatType?: ChatType;
  message: GroqChatMessage & Partial<PrivateChatMessage>;
  uid: string;
}): Promise<PrivateChatMessage> {
  assertValidUid(input.uid);

  const now = Date.now();
  const chatType = input.chatType || "normal";
  const message: PrivateChatMessage = {
    id: input.message.id || createMessageId(),
    role: input.message.role,
    text: input.message.text,
    createdAtMs: input.message.createdAtMs || now,
    deletedAtMs: input.message.deletedAtMs,
    imageAttachments: input.message.imageAttachments,
    imageDataUrl: input.message.imageDataUrl,
    imageName: input.message.imageName,
  };

  if (!canUseFirestoreForUid(input.uid)) {
    return (
      upsertLocalPrivateChat(input.uid, input.chatId, message.text, chatType, message) ||
      message
    );
  }

  await ensureFirebaseUserDocument(input.uid);

  const collectionChatType = await findPrivateChatType(input.uid, input.chatId);
  const chatRef = getPrivateChatDoc(input.uid, input.chatId, collectionChatType);
  const messageRef = doc(collection(chatRef, "messages"), message.id);
  const chatPath = getPrivateChatPath(input.uid, input.chatId, collectionChatType);
  const messagePath = `${chatPath}/messages/${message.id}`;

  debugFirestorePath("write private chat", input.uid, chatPath);
  try {
    await withTimeout(
      setDoc(
        chatRef,
        {
          updatedAt: serverTimestamp(),
          updatedAtMs: message.createdAtMs,
          lastMessage: message.text,
          chatType,
          source: "private-chat",
        },
        { merge: true },
      ),
      undefined,
      getSyncErrorMessage("Chat"),
    );
  } catch (error) {
    debugFirestoreError("write private chat", chatPath, error);
    throw error;
  }

  debugFirestorePath("write private chat message", input.uid, messagePath);
  try {
    await withTimeout(
      setDoc(messageRef, {
        role: message.role,
        text: message.text,
        createdAt: serverTimestamp(),
        createdAtMs: message.createdAtMs,
        imageAttachments: message.imageAttachments,
        imageDataUrl: message.imageDataUrl,
        imageName: message.imageName,
      }),
      undefined,
      getSyncErrorMessage("Chat message"),
    );
  } catch (error) {
    debugFirestoreError("write private chat message", messagePath, error);
    throw error;
  }

  upsertLocalPrivateChat(input.uid, input.chatId, message.text, chatType, message);

  return message;
}

export async function listPrivateChats(uid: string, chatType?: ChatType) {
  assertValidUid(uid);

  if (!canUseFirestoreForUid(uid)) {
    return readLocalPrivateChats(uid)
      .filter(
        (chat) =>
          !chat.deletedAtMs &&
          (!chatType || normalizeChatType(chat.chatType) === chatType),
      )
      .sort((first, second) => second.updatedAtMs - first.updatedAtMs)
      .slice(0, PRIVATE_CHAT_LIMIT)
      .map(({ chatType: itemChatType, id, isBookmarked, title, updatedAtMs, lastMessage }) => ({
        chatType: normalizeChatType(itemChatType),
        id,
        isBookmarked,
        title,
        updatedAtMs,
        lastMessage,
      }));
  }

  await ensureFirebaseUserDocument(uid);

  const firestoreDb = db!;
  const chatTypes = chatType ? [chatType] : (["normal", "teacher"] as const);
  const snapshots = await Promise.all(
    chatTypes.map(async (itemChatType) => ({
      chatType: itemChatType,
      snapshot: await (async () => {
        const path = `users/${uid}/${getPrivateChatCollectionName(itemChatType)}`;
        debugFirestorePath("read private chats", uid, path);
        try {
          return await withTimeout(
            getDocs(collection(firestoreDb, "users", uid, getPrivateChatCollectionName(itemChatType))),
            undefined,
            "Chats loading timed out.",
          );
        } catch (error) {
          debugFirestoreError("read private chats", path, error);
          throw error;
        }
      })(),
    })),
  );

  return snapshots
    .flatMap(({ chatType: itemChatType, snapshot }) =>
      snapshot.docs.map((chatDoc) => {
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
          isBookmarked: data.isBookmarked === true,
          deletedAtMs:
            typeof data.deletedAtMs === "number" ? data.deletedAtMs : undefined,
          source: data.source,
          chatType: normalizeChatType(data.chatType || itemChatType),
        };
      }),
    )
    .filter((chat) => chat.source === "private-chat" && !chat.deletedAtMs)
    .sort((first, second) => second.updatedAtMs - first.updatedAtMs)
    .slice(0, PRIVATE_CHAT_LIMIT)
    .map(({ chatType, id, title, updatedAtMs, lastMessage, isBookmarked }) => ({
      chatType,
      id,
      isBookmarked,
      title,
      updatedAtMs,
      lastMessage,
    }));
}

export async function listBookmarkedPrivateChats(uid: string) {
  return (await listPrivateChats(uid)).filter((chat) => chat.isBookmarked);
}

export async function updatePrivateChatTitle(input: {
  chatId: string;
  chatType?: ChatType;
  title: string;
  uid: string;
}) {
  assertValidUid(input.uid);

  const title = input.title.trim() || "New chat";
  const now = Date.now();

  if (!canUseFirestoreForUid(input.uid)) {
    updateLocalPrivateChatTitle(input.uid, input.chatId, title);
    return;
  }

  await ensureFirebaseUserDocument(input.uid);

  const chatType = await findPrivateChatType(input.uid, input.chatId, input.chatType);
  const path = getPrivateChatPath(input.uid, input.chatId, chatType);
  debugFirestorePath("rename private chat", input.uid, path);

  try {
    await withTimeout(
      setDoc(
        getPrivateChatDoc(input.uid, input.chatId, chatType),
        {
          title,
          updatedAt: serverTimestamp(),
          updatedAtMs: now,
        },
        { merge: true },
      ),
      undefined,
      getSyncErrorMessage("Chat title"),
    );
  } catch (error) {
    debugFirestoreError("rename private chat", path, error);
    throw error;
  }
  updateLocalPrivateChatTitle(input.uid, input.chatId, title);
}

export async function updatePrivateChatBookmark(input: {
  chatId: string;
  chatType?: ChatType;
  isBookmarked: boolean;
  uid: string;
}) {
  assertValidUid(input.uid);

  const now = Date.now();

  if (!canUseFirestoreForUid(input.uid)) {
    updateLocalPrivateChatBookmark(
      input.uid,
      input.chatId,
      input.isBookmarked,
    );
    return;
  }

  await ensureFirebaseUserDocument(input.uid);

  const chatType = await findPrivateChatType(input.uid, input.chatId, input.chatType);
  const chatRef = getPrivateChatDoc(input.uid, input.chatId, chatType);
  const path = getPrivateChatPath(input.uid, input.chatId, chatType);
  debugFirestorePath("bookmark private chat", input.uid, path);

  try {
    await withTimeout(
      setDoc(
        chatRef,
        {
          isBookmarked: input.isBookmarked,
          updatedAt: serverTimestamp(),
          updatedAtMs: now,
        },
        { merge: true },
      ),
      undefined,
      getSyncErrorMessage("Saved chat"),
    );
  } catch (error) {
    debugFirestoreError("bookmark private chat", path, error);
    throw error;
  }

  const firestoreDb = db!;
  const savedChatRef = doc(firestoreDb, "users", input.uid, "savedChats", input.chatId);
  if (input.isBookmarked) {
    const chatSnapshot = await withTimeout(
      getDoc(chatRef),
      undefined,
      "Saved chat lookup timed out.",
    );
    const data = chatSnapshot.data();
    await withTimeout(
      setDoc(
        savedChatRef,
        {
          chatId: input.chatId,
          chatType,
          title: typeof data?.title === "string" ? data.title : "Saved chat",
          lastMessage:
            typeof data?.lastMessage === "string" ? data.lastMessage : "",
          savedAt: serverTimestamp(),
          savedAtMs: now,
          updatedAt: serverTimestamp(),
          updatedAtMs: now,
        },
        { merge: true },
      ),
      undefined,
      getSyncErrorMessage("Saved chat"),
    );
  } else {
    await withTimeout(
      deleteDoc(savedChatRef),
      undefined,
      getSyncErrorMessage("Saved chat"),
    );
  }

  updateLocalPrivateChatBookmark(
    input.uid,
    input.chatId,
    input.isBookmarked,
  );
}

export async function deletePrivateChat(input: {
  chatId: string;
  chatType?: ChatType;
  uid: string;
}) {
  assertValidUid(input.uid);

  const now = Date.now();

  if (!canUseFirestoreForUid(input.uid)) {
    deleteLocalPrivateChat(input.uid, input.chatId);
    return;
  }

  await ensureFirebaseUserDocument(input.uid);

  const chatType = await findPrivateChatType(input.uid, input.chatId, input.chatType);
  const path = getPrivateChatPath(input.uid, input.chatId, chatType);
  debugFirestorePath("delete private chat", input.uid, path);

  try {
    await withTimeout(
      setDoc(
        getPrivateChatDoc(input.uid, input.chatId, chatType),
        {
          deletedAt: serverTimestamp(),
          deletedAtMs: now,
          updatedAt: serverTimestamp(),
          updatedAtMs: now,
        },
        { merge: true },
      ),
      undefined,
      getSyncErrorMessage("Chat delete"),
    );
  } catch (error) {
    debugFirestoreError("delete private chat", path, error);
    throw error;
  }

  await withTimeout(
    deleteDoc(doc(db!, "users", input.uid, "savedChats", input.chatId)),
    undefined,
    getSyncErrorMessage("Saved chat cleanup"),
  ).catch(() => undefined);
  deleteLocalPrivateChat(input.uid, input.chatId);
}

export async function loadPrivateChatMessages(
  uid: string,
  chatId: string,
  chatTypeInput?: ChatType,
): Promise<PrivateChatMessage[]> {
  assertValidUid(uid);

  if (!canUseFirestoreForUid(uid)) {
    return (
      readLocalPrivateChats(uid)
        .find((chat) => chat.id === chatId)
        ?.messages.sort((first, second) => first.createdAtMs - second.createdAtMs)
        .filter((message) => !message.deletedAtMs) || []
    );
  }

  await ensureFirebaseUserDocument(uid);

  const chatType = await findPrivateChatType(uid, chatId, chatTypeInput);
  const chatRef = getPrivateChatDoc(uid, chatId, chatType);
  const path = `${getPrivateChatPath(uid, chatId, chatType)}/messages`;
  debugFirestorePath("read private chat messages", uid, path);
  let snapshot;

  try {
    snapshot = await withTimeout(
      getDocs(collection(chatRef, "messages")),
      undefined,
      "Chat messages could not load from Firestore. Check your connection and retry.",
    );
  } catch (error) {
    debugFirestoreError("read private chat messages", path, error);
    throw error;
  }

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
        imageAttachments: Array.isArray(data.imageAttachments)
          ? data.imageAttachments
              .map((attachment) => ({
                dataUrl:
                  typeof attachment?.dataUrl === "string"
                    ? attachment.dataUrl
                    : "",
                name:
                  typeof attachment?.name === "string"
                    ? attachment.name
                    : "Uploaded image",
              }))
              .filter((attachment) => attachment.dataUrl)
          : undefined,
        imageDataUrl:
          typeof data.imageDataUrl === "string" ? data.imageDataUrl : undefined,
        imageName: typeof data.imageName === "string" ? data.imageName : undefined,
      };
    })
    .filter((message) => message.text.trim() && !message.deletedAtMs)
    .sort((first, second) => first.createdAtMs - second.createdAtMs);
}

export async function deletePrivateChatMessage(input: {
  chatId: string;
  chatType?: ChatType;
  messageId: string;
  uid: string;
}) {
  assertValidUid(input.uid);

  const now = Date.now();

  if (!canUseFirestoreForUid(input.uid)) {
    deleteLocalPrivateChatMessage(input.uid, input.chatId, input.messageId);
    return;
  }

  await ensureFirebaseUserDocument(input.uid);

  const chatType = await findPrivateChatType(input.uid, input.chatId, input.chatType);
  const chatRef = getPrivateChatDoc(input.uid, input.chatId, chatType);
  const messageRef = doc(chatRef, "messages", input.messageId);
  const messagePath = `${getPrivateChatPath(input.uid, input.chatId, chatType)}/messages/${input.messageId}`;
  debugFirestorePath("delete private chat message", input.uid, messagePath);

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
      getSyncErrorMessage("Chat message delete"),
    );
  } catch (error) {
    debugFirestoreError("delete private chat message", messagePath, error);
    throw error;
  }

  const snapshot = await withTimeout(
    getDocs(collection(chatRef, "messages")),
    undefined,
    getSyncErrorMessage("Chat messages refresh"),
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
    getSyncErrorMessage("Chat update after delete"),
  );
  deleteLocalPrivateChatMessage(input.uid, input.chatId, input.messageId);
}
