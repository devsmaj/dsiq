# DSIQ

Your AI coach for skills, opportunities, and action.

Powered by DSIQ  
Part of the SMAJ Ecosystem

## Overview

DSIQ is an AI opportunity coach and accountability platform for:

- Students
- Developers
- Freelancers
- Entrepreneurs

It helps users answer practical questions like:

- What skill should I learn next?
- Which opportunity fits me best?
- What action should I take now?
- How do I stay consistent over time?

## Repository Structure

```text
dsiq/
├─ frontend/          # Next.js web app
│  ├─ public/
│  └─ src/
│     ├─ app/
│     ├─ components/
│     ├─ features/
│     └─ lib/
├─ backend/           # API and business logic
│  └─ src/
│     ├─ config/
│     ├─ modules/
│     └─ routes/
├─ docs/
├─ README.md
├─ TODO.md
└─ package.json       # workspace scripts
```

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript

### Planned Integrations

- Firebase Auth
- Firebase Firestore
- AI provider for coaching and opportunity analysis

## Workspace Scripts

From the repo root:

- `npm run dev` starts the frontend
- `npm run dev:frontend` starts the frontend explicitly
- `npm run dev:backend` starts the backend API
- `npm run build:frontend` builds the frontend
- `npm run build:backend` builds the backend

## Current Status

Early startup MVP development with a clean frontend/backend structure in place.
