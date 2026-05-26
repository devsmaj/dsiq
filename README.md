# DSIQ

Your AI coach for skills, opportunities, and action.

Powered by DSIQ  
Part of the SMAJ Ecosystem

## Overview

DSIQ is a chat-first AI opportunity coach and accountability platform for:

- Students
- Developers
- Freelancers
- Entrepreneurs

It helps users answer practical questions like:

- What skill should I learn next?
- Which opportunity fits me best?
- What action should I take now?
- How do I stay consistent over time?

## Current Product State

- Public home page uses a chat-first landing experience.
- Public `/chat` supports guest chat with temporary session storage.
- Private workspace lives at `/dsiq/chat`.
- `/dashboard` redirects to `/dsiq/chat`.
- Private chat has a collapsible sidebar with New Chat, Search Chats, AI Mentor, Learning Roadmap, Projects, and Saved Chats.
- Private chat auto-saves conversations and shows recent chats in the expanded sidebar.
- Private chat history uses Firestore when available and local storage as a fallback.
- Active private chats include top-right New Chat and more-actions controls for email draft, markdown export, project handoff, and share/copy.
- AI responses include one-click copy feedback.
- Search Chats opens a searchable saved-chat panel with a top-right close button.
- Projects opens a panel where users can create projects, rename project names anytime, save the name, and add the current chat to a project.
- Project data uses Firestore when available and local storage as a fallback.
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
- Gemini-backed chat API

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

For Gemini chat, deploy/configure the backend with:

- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional, defaults to `gemini-2.0-flash`)

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
