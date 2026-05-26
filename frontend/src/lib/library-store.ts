import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { withTimeout } from "@/lib/async-timeout";
import { db } from "@/lib/firebase";

export type DsiqLibraryFolder = {
  id: string;
  name: string;
  chatIds: string[];
  updatedAtMs: number;
};

type LocalLibraryFolder = DsiqLibraryFolder & {
  createdAtMs: number;
};

const LIBRARY_COLLECTION = "projects";
const LOCAL_LIBRARY_PREFIX = "dsiq.projects.";

function getLocalLibraryKey(uid: string) {
  return `${LOCAL_LIBRARY_PREFIX}${uid}`;
}

function createLocalId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `library-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readLocalLibraryFolders(uid: string) {
  if (typeof window === "undefined") {
    return [] as LocalLibraryFolder[];
  }

  const raw = window.localStorage.getItem(getLocalLibraryKey(uid));
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as LocalLibraryFolder[];
  } catch {
    window.localStorage.removeItem(getLocalLibraryKey(uid));
    return [];
  }
}

function writeLocalLibraryFolders(uid: string, folders: LocalLibraryFolder[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getLocalLibraryKey(uid), JSON.stringify(folders));
}

function sortLibraryFolders(folders: DsiqLibraryFolder[]) {
  return [...folders].sort(
    (first, second) => second.updatedAtMs - first.updatedAtMs,
  );
}

function upsertLocalLibraryFolder(uid: string, folder: LocalLibraryFolder) {
  const folders = readLocalLibraryFolders(uid);
  const existingIndex = folders.findIndex((item) => item.id === folder.id);

  if (existingIndex >= 0) {
    folders[existingIndex] = {
      ...folders[existingIndex],
      ...folder,
      createdAtMs: folders[existingIndex].createdAtMs || folder.createdAtMs,
    };
    writeLocalLibraryFolders(uid, folders);
    return;
  }

  writeLocalLibraryFolders(uid, [folder, ...folders]);
}

function updateLocalLibraryFolderName(uid: string, folderId: string, name: string) {
  const now = Date.now();
  const folders = readLocalLibraryFolders(uid);
  const existing = folders.find((folder) => folder.id === folderId);

  upsertLocalLibraryFolder(uid, {
    id: folderId,
    name,
    chatIds: existing?.chatIds ?? [],
    createdAtMs: existing?.createdAtMs ?? now,
    updatedAtMs: now,
  });
}

function addLocalChatToLibraryFolder(uid: string, folderId: string, chatId: string) {
  const now = Date.now();
  const folders = readLocalLibraryFolders(uid);
  const existing = folders.find((folder) => folder.id === folderId);

  upsertLocalLibraryFolder(uid, {
    id: folderId,
    name: existing?.name ?? "Untitled folder",
    chatIds: Array.from(new Set([...(existing?.chatIds ?? []), chatId])),
    createdAtMs: existing?.createdAtMs ?? now,
    updatedAtMs: now,
  });
}

export async function listLibraryFolders(
  uid: string,
): Promise<DsiqLibraryFolder[]> {
  if (!db) {
    return sortLibraryFolders(readLocalLibraryFolders(uid));
  }

  try {
    const snapshot = await withTimeout(
      getDocs(collection(db, "users", uid, LIBRARY_COLLECTION)),
      undefined,
      "Library loading timed out.",
    );

    const folders = snapshot.docs.map((folderDoc) => {
      const data = folderDoc.data();
      return {
        id: folderDoc.id,
        name:
          typeof data.name === "string" && data.name.trim()
            ? data.name
            : "Untitled folder",
        chatIds: Array.isArray(data.chatIds)
          ? data.chatIds.filter((item) => typeof item === "string")
          : [],
        updatedAtMs:
          typeof data.updatedAtMs === "number" ? data.updatedAtMs : 0,
      };
    });

    writeLocalLibraryFolders(
      uid,
      folders.map((folder) => ({
        ...folder,
        createdAtMs: folder.updatedAtMs || Date.now(),
      })),
    );

    return sortLibraryFolders(folders);
  } catch (error) {
    console.warn("Firebase library loading failed; using local library.", error);
    return sortLibraryFolders(readLocalLibraryFolders(uid));
  }
}

export async function createLibraryFolder(uid: string, name: string) {
  const now = Date.now();
  const folderName = name.trim() || "Untitled folder";

  if (!db) {
    const folder: LocalLibraryFolder = {
      id: createLocalId(),
      name: folderName,
      chatIds: [],
      createdAtMs: now,
      updatedAtMs: now,
    };
    writeLocalLibraryFolders(uid, [folder, ...readLocalLibraryFolders(uid)]);
    return folder.id;
  }

  try {
    const folderRef = await withTimeout(
      addDoc(collection(db, "users", uid, LIBRARY_COLLECTION), {
        name: folderName,
        chatIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedAtMs: now,
      }),
      undefined,
      "Library folder creation timed out.",
    );

    upsertLocalLibraryFolder(uid, {
      id: folderRef.id,
      name: folderName,
      chatIds: [],
      createdAtMs: now,
      updatedAtMs: now,
    });

    return folderRef.id;
  } catch (error) {
    console.warn("Firebase library creation failed; using local library.", error);
    const folder: LocalLibraryFolder = {
      id: createLocalId(),
      name: folderName,
      chatIds: [],
      createdAtMs: now,
      updatedAtMs: now,
    };
    writeLocalLibraryFolders(uid, [folder, ...readLocalLibraryFolders(uid)]);
    return folder.id;
  }
}

export async function updateLibraryFolderName(input: {
  name: string;
  folderId: string;
  uid: string;
}) {
  const now = Date.now();
  const name = input.name.trim() || "Untitled folder";

  if (!db) {
    updateLocalLibraryFolderName(input.uid, input.folderId, name);
    return;
  }

  try {
    await withTimeout(
      setDoc(
        doc(db, "users", input.uid, LIBRARY_COLLECTION, input.folderId),
        {
          name,
          updatedAt: serverTimestamp(),
          updatedAtMs: now,
        },
        { merge: true },
      ),
      undefined,
      "Library folder update timed out.",
    );
    updateLocalLibraryFolderName(input.uid, input.folderId, name);
  } catch (error) {
    console.warn("Firebase library update failed; using local library.", error);
    updateLocalLibraryFolderName(input.uid, input.folderId, name);
  }
}

export async function addChatToLibraryFolder(input: {
  chatId: string;
  folderId: string;
  uid: string;
}) {
  const now = Date.now();

  if (!db) {
    addLocalChatToLibraryFolder(input.uid, input.folderId, input.chatId);
    return;
  }

  try {
    const folderRef = doc(
      db,
      "users",
      input.uid,
      LIBRARY_COLLECTION,
      input.folderId,
    );
    const snapshot = await withTimeout(
      getDoc(folderRef),
      undefined,
      "Library folder lookup timed out.",
    );
    const data = snapshot.exists() ? snapshot.data() : {};
    const chatIds = Array.isArray(data.chatIds)
      ? data.chatIds.filter((item) => typeof item === "string")
      : [];

    await withTimeout(
      setDoc(
        folderRef,
        {
          chatIds: Array.from(new Set([...chatIds, input.chatId])),
          updatedAt: serverTimestamp(),
          updatedAtMs: now,
        },
        { merge: true },
      ),
      undefined,
      "Library chat update timed out.",
    );
    addLocalChatToLibraryFolder(input.uid, input.folderId, input.chatId);
  } catch (error) {
    console.warn("Firebase add chat to library failed; using local library.", error);
    addLocalChatToLibraryFolder(input.uid, input.folderId, input.chatId);
  }
}
