import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";

import { withTimeout } from "@/lib/async-timeout";
import { db } from "@/lib/firebase";

export type RoadmapStep = {
  completed: boolean;
  description: string;
  id: string;
  orderNumber: number;
  phaseTitle?: string;
  status?: "completed" | "current" | "locked";
  title: string;
};

export type RoadmapPhase = {
  id: string;
  orderNumber: number;
  title: string;
};

export type Roadmap = {
  completedLessonIds?: string[];
  createdAtMs: number;
  currentActiveMissionId?: string;
  dailyStudyTime?: string;
  experience?: string;
  goal: string;
  id: string;
  lastActivityMs?: number;
  level: string;
  phases?: RoadmapPhase[];
  progressPercentage?: number;
  resources?: string;
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

function getVisibleLocalRoadmaps(uid: string) {
  return readLocalRoadmaps(uid)
    .filter((roadmap) => !roadmap.deletedAtMs)
    .sort((first, second) => second.updatedAtMs - first.updatedAtMs)
    .slice(0, ROADMAP_LIMIT);
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

function getCompletedLessonIds(steps: RoadmapStep[]) {
  return steps.filter((step) => step.completed).map((step) => step.id);
}

function parseRoadmapStepStatus(status: unknown): RoadmapStep["status"] {
  return status === "completed" || status === "current" || status === "locked"
    ? status
    : undefined;
}

function getProgressPercentage(steps: RoadmapStep[]) {
  if (!steps.length) {
    return 0;
  }

  return Math.round((steps.filter((step) => step.completed).length / steps.length) * 100);
}

function getCurrentActiveMissionId(steps: RoadmapStep[]) {
  return steps.find((step) => !step.completed)?.id || steps[steps.length - 1]?.id;
}

function normalizeRoadmapSteps(steps: RoadmapStep[]) {
  const activeMissionId = getCurrentActiveMissionId(steps);

  return steps.map((step) => {
    const status = step.completed
      ? "completed"
      : step.id === activeMissionId
        ? "current"
        : "locked";

    return {
      ...step,
      status,
    } satisfies RoadmapStep;
  });
}

function buildRoadmapPhases(steps: RoadmapStep[]) {
  const phaseTitles = Array.from(
    new Set(steps.map((step) => step.phaseTitle || "Foundation").filter(Boolean)),
  );

  return phaseTitles.map((title, index) => ({
    id: `phase-${index + 1}`,
    orderNumber: index + 1,
    title,
  }));
}

function withRoadmapProgress(roadmap: Roadmap) {
  const steps = normalizeRoadmapSteps(roadmap.steps);
  const completedLessonIds = getCompletedLessonIds(steps);
  const currentActiveMissionId = getCurrentActiveMissionId(steps);

  return {
    ...roadmap,
    completedLessonIds,
    currentActiveMissionId,
    lastActivityMs: roadmap.lastActivityMs || roadmap.updatedAtMs,
    phases: roadmap.phases?.length ? roadmap.phases : buildRoadmapPhases(steps),
    progressPercentage: getProgressPercentage(steps),
    steps,
  } satisfies Roadmap;
}

function getCurrentMission(roadmap: Roadmap) {
  return (
    roadmap.steps.find((step) => step.id === roadmap.currentActiveMissionId) ||
    roadmap.steps.find((step) => !step.completed) ||
    roadmap.steps[roadmap.steps.length - 1]
  );
}

function getNextMission(roadmap: Roadmap) {
  const currentMission = getCurrentMission(roadmap);
  if (!currentMission) {
    return undefined;
  }

  return roadmap.steps.find((step) => step.orderNumber > currentMission.orderNumber);
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
  const steps: RoadmapStep[] = extractNumberedSteps(input.answer).map((step, index) => {
    const [titlePart, ...descriptionParts] = step.split(":");
    const title = cleanTitle(titlePart || `Step ${index + 1}`);

    return {
      completed: false,
      description:
        cleanTitle(descriptionParts.join(":")) ||
        "Ask your AI Teacher for the next focused lesson.",
      id: createLocalId(),
      orderNumber: index + 1,
      phaseTitle: index < 5 ? "Foundation" : "Projects",
      status: index === 0 ? "current" : "locked",
      title,
    };
  });

  return withRoadmapProgress({
    createdAtMs: now,
    dailyStudyTime: "Not provided",
    experience: "Not provided",
    goal: cleanTitle(input.prompt) || "Learning goal",
    id: createLocalId(),
    lastActivityMs: now,
    level: "Beginner",
    resources: "Not provided",
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
            phaseTitle: "Foundation",
            status: "current",
            title: "Foundation",
          },
        ],
  } satisfies Roadmap);
}

export async function saveRoadmap(uid: string, roadmap: Roadmap) {
  const now = Date.now();
  const nextRoadmap = withRoadmapProgress({
    ...roadmap,
    lastActivityMs: now,
    updatedAtMs: now,
  });

  const firestoreDb = db;

  writeLocalRoadmaps(
    uid,
    [nextRoadmap, ...readLocalRoadmaps(uid).filter((item) => item.id !== roadmap.id)]
      .sort((first, second) => second.updatedAtMs - first.updatedAtMs)
      .slice(0, ROADMAP_LIMIT),
  );

  if (!firestoreDb) {
    return nextRoadmap.id;
  }

  try {
    const roadmapRef = doc(collection(firestoreDb, "users", uid, "roadmaps"), roadmap.id);
    await withTimeout(
      setDoc(
        roadmapRef,
        {
          createdAt: serverTimestamp(),
          createdAtMs: nextRoadmap.createdAtMs,
          completedLessonIds: nextRoadmap.completedLessonIds || [],
          currentActiveMissionId: nextRoadmap.currentActiveMissionId || "",
          dailyStudyTime: nextRoadmap.dailyStudyTime || "",
          experience: nextRoadmap.experience || "",
          goal: nextRoadmap.goal,
          lastActivity: serverTimestamp(),
          lastActivityMs: nextRoadmap.lastActivityMs || now,
          level: nextRoadmap.level,
          phases: nextRoadmap.phases || [],
          progressPercentage: nextRoadmap.progressPercentage || 0,
          resources: nextRoadmap.resources || "",
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
            phaseTitle: step.phaseTitle || "",
            status: step.status || (step.completed ? "completed" : "locked"),
            title: step.title,
          }),
          undefined,
          "Roadmap steps could not sync to Firestore. Check your connection and try again.",
        ),
      ),
    );
  } catch (error) {
    console.warn("Roadmap Firestore sync failed. Using local roadmap storage.", error);
  }

  return nextRoadmap.id;
}

export async function listRoadmaps(uid: string) {
  const firestoreDb = db;

  if (!firestoreDb) {
    return getVisibleLocalRoadmaps(uid);
  }

  try {
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

        return withRoadmapProgress({
          completedLessonIds: Array.isArray(data.completedLessonIds)
            ? data.completedLessonIds.filter((item): item is string => typeof item === "string")
            : [],
          createdAtMs:
            typeof data.createdAtMs === "number" ? data.createdAtMs : 0,
          currentActiveMissionId:
            typeof data.currentActiveMissionId === "string" ? data.currentActiveMissionId : "",
          dailyStudyTime:
            typeof data.dailyStudyTime === "string" ? data.dailyStudyTime : "",
          experience: typeof data.experience === "string" ? data.experience : "",
          goal: typeof data.goal === "string" ? data.goal : "Learning goal",
          id: roadmapDoc.id,
          lastActivityMs:
            typeof data.lastActivityMs === "number" ? data.lastActivityMs : 0,
          level: typeof data.level === "string" ? data.level : "Beginner",
          phases: Array.isArray(data.phases) ? (data.phases as RoadmapPhase[]) : [],
          progressPercentage:
            typeof data.progressPercentage === "number" ? data.progressPercentage : 0,
          resources: typeof data.resources === "string" ? data.resources : "",
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
                phaseTitle:
                  typeof step.phaseTitle === "string" ? step.phaseTitle : "Foundation",
                status: parseRoadmapStepStatus(step.status),
                title: typeof step.title === "string" ? step.title : "Step",
              };
            })
            .sort((first, second) => first.orderNumber - second.orderNumber),
        } satisfies Roadmap);
      }),
    );

    const nextRoadmaps = roadmaps
      .sort((first, second) => second.updatedAtMs - first.updatedAtMs)
      .slice(0, ROADMAP_LIMIT);
    writeLocalRoadmaps(uid, nextRoadmaps);
    return nextRoadmaps;
  } catch (error) {
    console.warn("Roadmap Firestore loading failed. Using local roadmap storage.", error);
    return getVisibleLocalRoadmaps(uid);
  }
}

export async function getActiveRoadmap(uid: string) {
  const roadmaps = await listRoadmaps(uid);
  return roadmaps[0];
}

export async function clearRoadmapMemory(uid: string) {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(getLocalRoadmapsKey(uid));
  }

  const firestoreDb = db;
  if (!firestoreDb) {
    return;
  }

  const snapshot = await getDocs(collection(firestoreDb, "users", uid, "roadmaps"));

  await Promise.all(
    snapshot.docs.map(async (roadmapDocument) => {
      const roadmapRef = doc(firestoreDb, "users", uid, "roadmaps", roadmapDocument.id);
      const stepsSnapshot = await getDocs(collection(roadmapRef, "steps"));

      await Promise.all(
        stepsSnapshot.docs.map((stepDocument) =>
          deleteDoc(doc(roadmapRef, "steps", stepDocument.id)),
        ),
      );
      await deleteDoc(roadmapRef);
    }),
  );
}

export function formatRoadmapContext(roadmap?: Roadmap) {
  if (!roadmap) {
    return "No active Learning Roadmap is saved yet.";
  }

  const currentMission = getCurrentMission(roadmap);
  const nextMission = getNextMission(roadmap);
  const completedMissions = roadmap.steps
    .filter((step) => step.completed)
    .map((step) => step.title);

  return [
    "Saved Learning Roadmap context:",
    `Roadmap title: ${roadmap.title}`,
    `Goal: ${roadmap.goal}`,
    `Skill level: ${roadmap.level}`,
    `Daily study time: ${roadmap.dailyStudyTime || "Not provided"}`,
    `Progress: ${roadmap.progressPercentage || 0}%`,
    `Current phase: ${currentMission?.phaseTitle || "Not started"}`,
    `Completed missions: ${completedMissions.length ? completedMissions.join(", ") : "None yet"}`,
    `Current mission: ${currentMission?.title || "No active mission"}`,
    `Next mission: ${nextMission?.title || "No next mission yet"}`,
    "Use this context before asking the student for their goal again.",
  ].join("\n");
}

export function isMissionCompletionMessage(text: string) {
  const normalized = text.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  return [
    "done",
    "finished",
    "completed",
    "i finished",
    "i completed",
    "mission complete",
    "today's mission",
    "todays mission",
  ].some((phrase) => normalized.includes(phrase));
}

export async function completeCurrentRoadmapMission(uid: string, roadmap: Roadmap) {
  const normalizedRoadmap = withRoadmapProgress(roadmap);
  const currentMission = getCurrentMission(normalizedRoadmap);

  if (!currentMission) {
    return {
      completedMission: undefined,
      nextMission: undefined,
      roadmap: normalizedRoadmap,
    };
  }

  const nextSteps = normalizedRoadmap.steps.map((step) =>
    step.id === currentMission.id
      ? {
          ...step,
          completed: true,
          status: "completed" as const,
        }
      : step,
  );
  const completedRoadmap = withRoadmapProgress({
    ...normalizedRoadmap,
    lastActivityMs: Date.now(),
    steps: nextSteps,
  });
  const nextMission = completedRoadmap.steps.find((step) => !step.completed);

  await saveRoadmap(uid, completedRoadmap);

  return {
    completedMission: currentMission,
    nextMission,
    roadmap: completedRoadmap,
  };
}

export function shouldSaveRoadmapFromResponse(text: string) {
  const normalized = text.toLowerCase();

  return (
    normalized.includes("phase") ||
    normalized.includes("mission") ||
    normalized.includes("roadmap") ||
    extractNumberedSteps(text).length >= 3
  );
}
