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

## GitHub Pages Deploy

The frontend is configured for static export and deploys from GitHub Actions.

1. Push changes to the `main` branch.
2. In GitHub, open `Settings > Pages`.
3. Set `Build and deployment` to `GitHub Actions`.
4. The site will publish to `https://devsmaj.github.io/dsiq/`.

Add Firebase public config as repository secrets if you want live Firebase auth:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

For Gemini chat on GitHub Pages, deploy the backend separately with:

- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional, defaults to `gemini-2.0-flash`)

## Current Status

Early startup MVP development with a clean frontend/backend structure in place.

## GitHub Pages Deployment

The frontend is configured for static export and can be deployed using GitHub Pages.

### One-time GitHub setup

1. Push this repository to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Ensure your default deployment branch is `main` (or update the workflow trigger).

### Deployment workflow

- Workflow file: `.github/workflows/deploy-gh-pages.yml`
- Trigger: pushes to `main` and manual runs
- Output: static files from `frontend/out`

After the workflow finishes, your site will be available from your GitHub Pages URL.

The frontend build automatically sets the correct base path for project Pages sites (for example, `/repo-name`) when running in GitHub Actions.
