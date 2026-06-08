import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "@/lib/firebase";

type HelpSubmissionType = "bug-report" | "feedback" | "support-request";

export type HelpSubmission = {
  createdAtIso: string;
  email?: string;
  message?: string;
  name?: string;
  pageUrl?: string;
  screenshotDataUrl?: string;
  status: "new";
  type: HelpSubmissionType;
  uid?: string;
  [key: string]: unknown;
};

const LOCAL_HELP_SUBMISSIONS_KEY = "dsiq.help-submissions";

function readLocalSubmissions() {
  if (typeof window === "undefined") {
    return [] as HelpSubmission[];
  }

  const raw = window.localStorage.getItem(LOCAL_HELP_SUBMISSIONS_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as HelpSubmission[];
  } catch {
    window.localStorage.removeItem(LOCAL_HELP_SUBMISSIONS_KEY);
    return [];
  }
}

function saveLocalSubmission(submission: HelpSubmission) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    LOCAL_HELP_SUBMISSIONS_KEY,
    JSON.stringify([submission, ...readLocalSubmissions()]),
  );
}

export async function saveHelpSubmission(submission: HelpSubmission) {
  saveLocalSubmission(submission);

  if (!db) {
    return;
  }

  await addDoc(collection(db, "helpSubmissions"), {
    ...submission,
    createdAt: serverTimestamp(),
  });
}
