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


## GitHub Pages Quick Troubleshooting

If you still see the repository README instead of the app, you are opening the repository URL, not the Pages site URL.

- Repository URL (shows code/README): `https://github.com/<username>/<repo>`
- Live Pages URL (shows app): `https://<username>.github.io/<repo>/`

For this repo, the expected live URL format is:

- `https://devsmaj.github.io/dsiq/`

Also verify:

1. **Settings → Pages → Source** is set to **GitHub Actions**.
2. The latest **Deploy frontend to GitHub Pages** workflow run is green.
3. You open the Pages URL from the Pages settings panel (not the repository homepage).
