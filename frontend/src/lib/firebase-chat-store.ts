import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { GeminiChatMessage } from "@/lib/gemini";

export async function createFirebaseChat(uid: string) {
  if (!db) {
    return null;
  }

  const chatRef = await addDoc(collection(db, "users", uid, "chats"), {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    source: "public-chat",
  });

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

  await setDoc(
    chatRef,
    {
      updatedAt: serverTimestamp(),
      source: "public-chat",
    },
    { merge: true },
  );

  await addDoc(messagesRef, {
    role: input.message.role,
    text: input.message.text,
    createdAt: serverTimestamp(),
  });
}
