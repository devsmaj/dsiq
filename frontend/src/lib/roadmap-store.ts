import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";

import { withTimeout } from "@/lib/async-timeout";
import { db } from "@/lib/firebase";

export type RoadmapStep = {
  completed: boolean;
  description: string;
  id: string;
  orderNumber: number;
  title: string;
};

export type Roadmap = {
  createdAtMs: number;
  goal: string;
  id: string;
  level: string;
  subject: string;
  title: string;
  updatedAtMs: number;
  steps: RoadmapStep[];
};

type LocalRoadmap = Roadmap & {
  deletedAtMs?: number;
};

const LOCAL_ROADMAPS_PREFIX = "dsiq.roadmaps.";
const ROADMAP_LIMIT = 12;

function getLocalRoadmapsKey(uid: string) {
  return `${LOCAL_ROADMAPS_PREFIX}${uid}`;
}

function createLocalId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readLocalRoadmaps(uid: string) {
  if (typeof window === "undefined") {
    return [] as LocalRoadmap[];
  }

  const raw = window.localStorage.getItem(getLocalRoadmapsKey(uid));
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as LocalRoadmap[];
  } catch {
    window.localStorage.removeItem(getLocalRoadmapsKey(uid));
    return [];
  }
}

function writeLocalRoadmaps(uid: string, roadmaps: LocalRoadmap[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getLocalRoadmapsKey(uid), JSON.stringify(roadmaps));
}

function cleanTitle(text: string) {
  const title = text.trim().replace(/\s+/g, " ");
  return title.length > 58 ? `${title.slice(0, 55)}...` : title;
}

function extractNumberedSteps(text: string) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const numbered = lines
    .map((line) => line.match(/^(?:\d+[\).]|[-*])\s*(.+)$/)?.[1]?.trim())
    .filter((line): line is string => Boolean(line));

  return numbered.length >= 2 ? numbered : lines.slice(0, 8);
}

export function isRoadmapRequest(text: string) {
  const normalized = text.toLowerCase();
  return [
    "roadmap",
    "learning path",
    "study plan",
    "plan to learn",
    "guide me from beginner",
  ].some((phrase) => normalized.includes(phrase));
}

export function createRoadmapFromAiResponse(input: {
  answer: string;
  prompt: string;
}) {
  const now = Date.now();
  const steps = extractNumberedSteps(input.answer).map((step, index) => {
    const [titlePart, ...descriptionParts] = step.split(":");
    const title = cleanTitle(titlePart || `Step ${index + 1}`);

    return {
      completed: false,
      description:
        cleanTitle(descriptionParts.join(":")) ||
        "Ask your AI Teacher for the next focused lesson.",
      id: createLocalId(),
      orderNumber: index + 1,
      title,
    };
  });

  return {
    createdAtMs: now,
    goal: cleanTitle(input.prompt) || "Learning goal",
    id: createLocalId(),
    level: "Beginner",
    subject: cleanTitle(input.prompt.replace(/roadmap|study plan/gi, "")) || "General learning",
    title: `${cleanTitle(input.prompt) || "Learning"} Roadmap`,
    updatedAtMs: now,
    steps: steps.length
      ? steps
      : [
          {
            completed: false,
            description: "Start with the first clear foundation lesson.",
            id: createLocalId(),
            orderNumber: 1,
            title: "Foundation",
          },
        ],
  } satisfies Roadmap;
}

export async function saveRoadmap(uid: string, roadmap: Roadmap) {
  const now = Date.now();
  const nextRoadmap = {
    ...roadmap,
    updatedAtMs: now,
  };

  const firestoreDb = db;

  if (!firestoreDb) {
    writeLocalRoadmaps(
      uid,
      [nextRoadmap, ...readLocalRoadmaps(uid).filter((item) => item.id !== roadmap.id)]
        .sort((first, second) => second.updatedAtMs - first.updatedAtMs)
        .slice(0, ROADMAP_LIMIT),
    );
    return nextRoadmap.id;
  }

  const roadmapRef = doc(collection(firestoreDb, "users", uid, "roadmaps"), roadmap.id);
  await withTimeout(
    setDoc(
      roadmapRef,
      {
        createdAt: serverTimestamp(),
        createdAtMs: nextRoadmap.createdAtMs,
        goal: nextRoadmap.goal,
        level: nextRoadmap.level,
        subject: nextRoadmap.subject,
        title: nextRoadmap.title,
        updatedAt: serverTimestamp(),
        updatedAtMs: nextRoadmap.updatedAtMs,
      },
      { merge: true },
    ),
    undefined,
    "Roadmap could not sync to Firestore. Check your connection and try again.",
  );

  await Promise.all(
    nextRoadmap.steps.map((step) =>
      withTimeout(
        setDoc(doc(roadmapRef, "steps", step.id), {
          completed: step.completed,
          description: step.description,
          orderNumber: step.orderNumber,
          title: step.title,
        }),
        undefined,
        "Roadmap steps could not sync to Firestore. Check your connection and try again.",
      ),
    ),
  );

  writeLocalRoadmaps(
    uid,
    [nextRoadmap, ...readLocalRoadmaps(uid).filter((item) => item.id !== roadmap.id)]
      .sort((first, second) => second.updatedAtMs - first.updatedAtMs)
      .slice(0, ROADMAP_LIMIT),
  );

  return nextRoadmap.id;
}

export async function listRoadmaps(uid: string) {
  const firestoreDb = db;

  if (!firestoreDb) {
    return readLocalRoadmaps(uid)
      .filter((roadmap) => !roadmap.deletedAtMs)
      .sort((first, second) => second.updatedAtMs - first.updatedAtMs)
      .slice(0, ROADMAP_LIMIT);
  }

  const snapshot = await withTimeout(
    getDocs(collection(firestoreDb, "users", uid, "roadmaps")),
    undefined,
    "Roadmaps could not load from Firestore. Check your connection and retry.",
  );

  const roadmaps = await Promise.all(
    snapshot.docs.map(async (roadmapDoc) => {
      const data = roadmapDoc.data();
      const stepsSnapshot = await withTimeout(
        getDocs(
          collection(
            doc(firestoreDb, "users", uid, "roadmaps", roadmapDoc.id),
            "steps",
          ),
        ),
        undefined,
        "Roadmap steps could not load from Firestore. Check your connection and retry.",
      );

      return {
        createdAtMs:
          typeof data.createdAtMs === "number" ? data.createdAtMs : 0,
        goal: typeof data.goal === "string" ? data.goal : "Learning goal",
        id: roadmapDoc.id,
        level: typeof data.level === "string" ? data.level : "Beginner",
        subject: typeof data.subject === "string" ? data.subject : "Learning",
        title: typeof data.title === "string" ? data.title : "Learning Roadmap",
        updatedAtMs:
          typeof data.updatedAtMs === "number" ? data.updatedAtMs : 0,
        steps: stepsSnapshot.docs
          .map((stepDoc) => {
            const step = stepDoc.data();
            return {
              completed: step.completed === true,
              description:
                typeof step.description === "string" ? step.description : "",
              id: stepDoc.id,
              orderNumber:
                typeof step.orderNumber === "number" ? step.orderNumber : 0,
              title: typeof step.title === "string" ? step.title : "Step",
            };
          })
          .sort((first, second) => first.orderNumber - second.orderNumber),
      } satisfies Roadmap;
    }),
  );

  const nextRoadmaps = roadmaps
    .sort((first, second) => second.updatedAtMs - first.updatedAtMs)
    .slice(0, ROADMAP_LIMIT);
  writeLocalRoadmaps(uid, nextRoadmaps);
  return nextRoadmaps;
}
