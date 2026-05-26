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

export type DsiqProject = {
  id: string;
  name: string;
  chatIds: string[];
  updatedAtMs: number;
};

type LocalProject = DsiqProject & {
  createdAtMs: number;
};

const LOCAL_PROJECTS_PREFIX = "dsiq.projects.";

function getLocalProjectsKey(uid: string) {
  return `${LOCAL_PROJECTS_PREFIX}${uid}`;
}

function createLocalId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readLocalProjects(uid: string) {
  if (typeof window === "undefined") {
    return [] as LocalProject[];
  }

  const raw = window.localStorage.getItem(getLocalProjectsKey(uid));
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as LocalProject[];
  } catch {
    window.localStorage.removeItem(getLocalProjectsKey(uid));
    return [];
  }
}

function writeLocalProjects(uid: string, projects: LocalProject[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getLocalProjectsKey(uid), JSON.stringify(projects));
}

function sortProjects(projects: DsiqProject[]) {
  return [...projects].sort(
    (first, second) => second.updatedAtMs - first.updatedAtMs,
  );
}

function upsertLocalProject(uid: string, project: LocalProject) {
  const projects = readLocalProjects(uid);
  const existingIndex = projects.findIndex((item) => item.id === project.id);

  if (existingIndex >= 0) {
    projects[existingIndex] = {
      ...projects[existingIndex],
      ...project,
      createdAtMs: projects[existingIndex].createdAtMs || project.createdAtMs,
    };
    writeLocalProjects(uid, projects);
    return;
  }

  writeLocalProjects(uid, [project, ...projects]);
}

function updateLocalProjectName(uid: string, projectId: string, name: string) {
  const now = Date.now();
  const projects = readLocalProjects(uid);
  const existing = projects.find((project) => project.id === projectId);

  upsertLocalProject(uid, {
    id: projectId,
    name,
    chatIds: existing?.chatIds ?? [],
    createdAtMs: existing?.createdAtMs ?? now,
    updatedAtMs: now,
  });
}

function addLocalChatToProject(uid: string, projectId: string, chatId: string) {
  const now = Date.now();
  const projects = readLocalProjects(uid);
  const existing = projects.find((project) => project.id === projectId);

  upsertLocalProject(uid, {
    id: projectId,
    name: existing?.name ?? "Untitled project",
    chatIds: Array.from(new Set([...(existing?.chatIds ?? []), chatId])),
    createdAtMs: existing?.createdAtMs ?? now,
    updatedAtMs: now,
  });
}

export async function listProjects(uid: string): Promise<DsiqProject[]> {
  if (!db) {
    return sortProjects(readLocalProjects(uid));
  }

  try {
    const snapshot = await withTimeout(
      getDocs(collection(db, "users", uid, "projects")),
      undefined,
      "Projects loading timed out.",
    );

    const projects = snapshot.docs.map((projectDoc) => {
        const data = projectDoc.data();
        return {
          id: projectDoc.id,
          name:
            typeof data.name === "string" && data.name.trim()
              ? data.name
              : "Untitled project",
          chatIds: Array.isArray(data.chatIds)
            ? data.chatIds.filter((item) => typeof item === "string")
            : [],
          updatedAtMs:
            typeof data.updatedAtMs === "number" ? data.updatedAtMs : 0,
        };
      });

    writeLocalProjects(
      uid,
      projects.map((project) => ({
        ...project,
        createdAtMs: project.updatedAtMs || Date.now(),
      })),
    );

    return sortProjects(projects);
  } catch (error) {
    console.warn("Firebase projects loading failed; using local projects.", error);
    return sortProjects(readLocalProjects(uid));
  }
}

export async function createProject(uid: string, name: string) {
  const now = Date.now();
  const projectName = name.trim() || "Untitled project";

  if (!db) {
    const project: LocalProject = {
      id: createLocalId(),
      name: projectName,
      chatIds: [],
      createdAtMs: now,
      updatedAtMs: now,
    };
    writeLocalProjects(uid, [project, ...readLocalProjects(uid)]);
    return project.id;
  }

  try {
    const projectRef = await withTimeout(
      addDoc(collection(db, "users", uid, "projects"), {
        name: projectName,
        chatIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedAtMs: now,
      }),
      undefined,
      "Project creation timed out.",
    );

    upsertLocalProject(uid, {
      id: projectRef.id,
      name: projectName,
      chatIds: [],
      createdAtMs: now,
      updatedAtMs: now,
    });

    return projectRef.id;
  } catch (error) {
    console.warn("Firebase project creation failed; using local project.", error);
    const project: LocalProject = {
      id: createLocalId(),
      name: projectName,
      chatIds: [],
      createdAtMs: now,
      updatedAtMs: now,
    };
    writeLocalProjects(uid, [project, ...readLocalProjects(uid)]);
    return project.id;
  }
}

export async function updateProjectName(input: {
  name: string;
  projectId: string;
  uid: string;
}) {
  const now = Date.now();
  const name = input.name.trim() || "Untitled project";

  if (!db) {
    updateLocalProjectName(input.uid, input.projectId, name);
    return;
  }

  try {
    await withTimeout(
      setDoc(
        doc(db, "users", input.uid, "projects", input.projectId),
        {
          name,
          updatedAt: serverTimestamp(),
          updatedAtMs: now,
        },
        { merge: true },
      ),
      undefined,
      "Project update timed out.",
    );
    updateLocalProjectName(input.uid, input.projectId, name);
  } catch (error) {
    console.warn("Firebase project update failed; using local project.", error);
    updateLocalProjectName(input.uid, input.projectId, name);
  }
}

export async function addChatToProject(input: {
  chatId: string;
  projectId: string;
  uid: string;
}) {
  const now = Date.now();

  if (!db) {
    addLocalChatToProject(input.uid, input.projectId, input.chatId);
    return;
  }

  try {
    const projectRef = doc(db, "users", input.uid, "projects", input.projectId);
    const snapshot = await withTimeout(
      getDoc(projectRef),
      undefined,
      "Project lookup timed out.",
    );
    const data = snapshot.exists() ? snapshot.data() : {};
    const chatIds = Array.isArray(data.chatIds)
      ? data.chatIds.filter((item) => typeof item === "string")
      : [];

    await withTimeout(
      setDoc(
        projectRef,
        {
          chatIds: Array.from(new Set([...chatIds, input.chatId])),
          updatedAt: serverTimestamp(),
          updatedAtMs: now,
        },
        { merge: true },
      ),
      undefined,
      "Project chat update timed out.",
    );
    addLocalChatToProject(input.uid, input.projectId, input.chatId);
  } catch (error) {
    console.warn("Firebase add chat to project failed; using local project.", error);
    addLocalChatToProject(input.uid, input.projectId, input.chatId);
  }
}
