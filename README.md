# DSIQ

Your AI teacher, mentor, coach, and accountability partner for student progress.

Powered by DSIQ  
Part of the SMAJ Ecosystem

## Overview

DSIQ is a student-focused AI Teacher and accountability platform for:

- Students
- Developers
- Freelancers
- Entrepreneurs

It helps users learn step by step, stay focused, and move toward real goals. It helps users answer practical questions like:

- What skill should I learn next?
- Which opportunity fits me best?
- What action should I take now?
- How do I stay consistent over time?

## AI Teacher Product Vision

DSIQ is not a normal chatbot. DSIQ is a professional AI Teacher, Mentor, Coach, and Accountability Partner that guides students from where they are today to where they want to be.

DSIQ should behave like a caring teacher and trusted guide: human, patient, thoughtful, clear, and professional. It should keep responses short and meaningful, avoid overwhelming users, and focus on one lesson, one mission, and one goal at a time.

The goal is not to answer everything. The goal is to help the student master the current step before moving to the next one.

### Core Teaching Rules

- Understand the user's goal, level, learning history, progress, weak areas, and strong areas before creating a plan.
- Ask good questions before building a roadmap.
- Teach one concept at a time.
- Verify learning with questions, exercises, quizzes, and small projects.
- Adjust difficulty based on performance.
- Give practical coaching when consistency drops.
- Avoid generic motivation.
- Avoid large roadmap dumps inside chat.

### Focus Protection

DSIQ should help students avoid jumping between topics without finishing anything. When a student wants to switch topics, DSIQ should check roadmap progress, ask why, explain the tradeoff, and recommend the best path without forcing the user.

Example:

"You have completed only 20% of HTML Fundamentals. I recommend finishing this module first because it will make your next topic much easier."

### Roadmap Connection

Roadmaps should live in the Roadmap section, not only inside chat. A roadmap should include the student's goal, current stage, missions, progress percentage, completed lessons, and skills gained.

The AI Teacher should read the user's roadmap before responding so it can continue from where the student stopped.

## Current Product State

- Public home page uses a chat-first landing experience.
- Public `/chat` supports guest chat with temporary session storage.
- Private workspace lives at `/dsiq/chat`.
- Private AI Teacher lives at `/dsiq/mentor`.
- `/dashboard` redirects to `/dsiq/chat`.
- Private chat has a collapsible sidebar with New Chat, Search Chats, AI Teacher, Learning Roadmap, Focus Mode, and Saved Chats.
- AI Teacher is visually emphasized in the private sidebar as the main student feature.
- AI Teacher is a private student-focused teacher page that uses onboarding/profile goals for welcome text, focus guidance, mentor chat, Smart Focus, and insight cards.
- Private chat auto-saves conversations and shows recent chats in the expanded sidebar.
- Private chat history uses Firestore when available and local storage as a fallback.
- Active private chats include top-right New Chat and more-actions controls for read aloud, email draft, markdown export, share, and copy.
- AI responses use plain human text and include one-click copy feedback.
- Recent sidebar chat rows include a three-dot menu with Delete confirmation.
- Saved chat messages keep stable IDs/timestamps.
- Search Chats opens a searchable saved-chat panel with a top-right close button.
- Saved Chats opens a management panel with rename, export, delete, and bulk delete.
- Profile popup includes Profile, Settings, Help, and Logout.
- Settings is a shared appearance/language/data-controls panel used from public and private UI.
- Profile editing supports role dropdown, goals dropdown, image URL, local image upload, cancel, local save, and Firebase sync when available.
- Google/Firebase profile photos are used when no saved profile image exists.
- Public and private chat inputs stay above the mobile keyboard.
- Signed-in users who land on `/login` are redirected back into the app, while browser Back remains normal browser behavior.

## Repository Structure

```text
dsiq/
├── frontend/          # Next.js web app
│   ├── public/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/
│       └── lib/
├── backend/           # API and business logic
│   └── src/
│       ├── config/
│       ├── modules/
│       └── routes/
├── docs/
├── README.md
├── TODO.md
└── package.json       # workspace scripts
```

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Firebase Auth and Firestore

### Backend

- Node.js
- Express
- TypeScript
- Groq-backed chat API for testing
- Gemini API integration is the intended real/live AI provider

## Workspace Scripts

From the repo root:

- `npm run dev` starts the frontend.
- `npm run dev:frontend` starts the frontend explicitly.
- `npm run dev:backend` starts the backend API.
- `npm run build:frontend` builds the frontend.
- `npm run build:backend` builds the backend.

## Environment

Add Firebase public config as repository secrets or local environment variables if you want live Firebase auth:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

For current testing, deploy/configure the backend with Groq:

- `GROQ_API_KEY`
- `GROQ_MODEL` (optional, defaults to `llama-3.3-70b-versatile`)

For the real live AI integration, the target provider is Gemini API:

- `GEMINI_API_KEY`
- `GEMINI_MODEL`

## Verification

Current local verification notes:

- `npm.cmd exec tsc -- --noEmit` passes in `frontend`.
- `npm.cmd run lint` is currently blocked by a missing local dependency file: `frontend/node_modules/hermes-parser/dist/index.js`.

## GitHub Pages Deployment

The frontend is configured for static export and can be deployed using GitHub Pages.

### One-time GitHub setup

1. Push this repository to GitHub.
2. In **Settings > Pages**, set **Source** to **GitHub Actions**.
3. Ensure your default deployment branch is `main` or update the workflow trigger.

### Deployment workflow

- Workflow file: `.github/workflows/deploy-gh-pages.yml`
- Trigger: pushes to `main` and manual runs
- Output: static files from `frontend/out`

After the workflow finishes, your site will be available from your GitHub Pages URL.

The frontend build automatically sets the correct base path for project Pages sites, for example `/repo-name`, when running in GitHub Actions.
