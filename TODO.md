# DSIQ Web TODO

This TODO tracks the current DSIQ web app as built in this repository.

## Current App Shape

- [x] Public website built with Next.js, React, TypeScript, and Tailwind CSS.
- [x] Public home page is a chat-first landing experience.
- [x] Public `/chat` supports guest chat mode.
- [x] Private workspace lives at `/dsiq/chat`.
- [x] `/dashboard` redirects to `/dsiq/chat`.
- [x] Authentication and onboarding route users into the correct workspace.
- [x] Profile data is shared between onboarding, profile, and private chat.

## Public Routes

- [x] `/` Home chat landing page.
- [x] `/chat` Public/guest chat page.
- [x] `/about` About page.
- [x] `/features` Features page.
- [x] `/how-it-works` How It Works page.
- [x] `/pricing` Pricing page.
- [x] `/contact` Contact page.
- [x] `/login` Login page.
- [x] `/signup` Signup page.
- [x] `/forgot-password` Forgot password page.
- [x] `/privacy` Privacy page.
- [x] `/terms` Terms page.

## Private Routes

- [x] `/dsiq/chat` Private DSIQ chat workspace.
- [x] `/dashboard` Redirects to `/dsiq/chat`.
- [x] `/onboarding` User setup flow.
- [x] `/profile` Editable user profile.
- [ ] `/billing` Future plan/billing page.
- [ ] `/admin` Future admin page.

## Public Home Page

- [x] Chat-first hero with DSIQ headline.
- [x] Prompt input with send button.
- [x] Attachment menu for photo/file labels.
- [x] Voice input support when browser supports speech recognition.
- [x] Quick prompt chips.
- [x] Public top nav links: About, Features, How It Works, Pricing, Contact.
- [x] Login button.
- [x] Public sidebar/menu for New Chat, Search Chats, and Settings.
- [x] Closed public sidebar shows icon-only actions.
- [x] New Chat confirmation popup.
- [x] New Chat popup has top-right X close button.
- [x] Public New Chat stays in public guest chat instead of redirecting to private chat.
- [x] Settings popup opens from the public menu.
- [x] Public home input lifts above the mobile keyboard.

## Public Chat `/chat`

- [x] Guest chat mode with `?guest=true`.
- [x] Initial prompt support from `?q=`.
- [x] Public chat does not redirect signed-in users when `guest=true`.
- [x] Guest messages persist in session storage.
- [x] Logged-in public chat can save messages when not in guest mode.
- [x] Typing/thinking state.
- [x] Error state when AI server fails.
- [x] New Chat clears the current public/guest chat.
- [x] Attachment and voice controls.
- [x] Public chat input stays above the mobile keyboard.

## Private Chat `/dsiq/chat`

- [x] PrivateRoute protection.
- [x] Incomplete profiles route back to onboarding.
- [x] Desktop sidebar with collapse/expand state.
- [x] Mobile sidebar overlay.
- [x] Expanded sidebar items:
  - [x] New Chat
  - [x] Search Chats
  - [x] AI Mentor
  - [x] Learning Roadmap
  - [x] Library
  - [x] Saved Chats
- [x] Collapsed sidebar shows icons only:
  - [x] DSIQ logo
  - [x] New Chat
  - [x] Search Chats
  - [x] AI Mentor
  - [x] Learning Roadmap
  - [x] Library
  - [x] Profile avatar at bottom
- [x] Bottom profile area shows avatar, user name, and Free.
- [x] Profile popup includes user name and Free Plan.
- [x] Profile popup actions: Profile, Settings, Help, Logout.
- [x] Profile popup has top-right X close button.
- [x] Private chat input sends messages to DSIQ AI.
- [x] Private chat displays DSIQ responses.
- [x] Private chat has typing/thinking state.
- [x] Private chat has error state.
- [x] Private chat user message text has no black bubble/border.
- [x] Private chat input sits centered on desktop start state.
- [x] Private chat input stays above the mobile keyboard.
- [x] Removed suggested prompt chips under private chat input.
- [x] Attachment and voice controls.
- [x] Private chats auto-create from the first sent message.
- [x] Private user/model messages save to chat history.
- [x] Recent private chats appear in the expanded sidebar.
- [x] Recent sidebar chat rows include a three-dot menu with Delete confirmation.
- [x] Clicking a recent private chat reloads its conversation.
- [x] Local chat-history fallback works when Firebase is unavailable.
- [x] Active private chats show top-right New Chat and more-actions controls.
- [x] Chat actions support draft to email, export to docs, add to Library, and share.
- [x] Top-right chat actions include Read aloud / Stop reading.
- [x] AI responses include copy action with copied check feedback.
- [x] Saved chat messages include stable message IDs and timestamps.
- [x] Search Chats opens a real searchable saved-chat panel with top-right X close.
- [x] Saved Chats opens a real management panel with top-right X close.
- [x] Saved Chats supports single-chat rename, export, add to Library, and delete.
- [x] Saved Chats supports multi-select bulk delete.
- [x] Saved Chats supports multi-select bulk add to Library.
- [x] Deleted saved chats are hidden with a deletion timestamp.
- [x] Library opens a real folder panel with top-right X close.
- [x] Users can create folders from the Library panel.
- [x] Users can edit a folder name anytime and save it.
- [x] Users can add the current chat to a Library folder.
- [x] Library folders save to Firestore with local storage fallback.
- [ ] Build real screens/panels for AI Mentor and Learning Roadmap.
- [x] Save private chat history to Firestore/local store.
- [x] Load saved private chats from sidebar.

## Profile

- [x] Profile page displays avatar/initials.
- [x] Full name field.
- [x] Nickname field with availability check.
- [x] Age field.
- [x] Role selection.
- [x] Role uses dropdown control.
- [x] Profile image URL field.
- [x] Camera button uploads profile image from device.
- [x] Google/Firebase photo is used when no saved profile image exists.
- [x] Goals selection.
- [x] Goals use dropdown-style multi-select.
- [x] Cancel button restores last saved profile values.
- [x] Save profile updates locally.
- [x] Save profile updates to Firebase when Firebase auth is active.
- [x] Profile still saves locally if cloud sync fails.
- [x] Sidebar profile avatar uses saved profile image or auth provider photo.

## Onboarding

- [x] PrivateRoute protection.
- [x] Basic profile setup.
- [x] Goal selection.
- [x] Skills/time/budget/interests flow.
- [x] Saves onboarding answers.
- [x] Routes completed users to `/dsiq/chat`.

## Settings

- [x] Global settings popup.
- [x] Appearance selector: System, Dark, Light.
- [x] Language selector UI.
- [x] Data controls panel.
- [x] Public menu opens Settings.
- [x] Private profile popup opens Settings.

## Auth

- [x] Email/password login.
- [x] Signup.
- [x] Forgot password.
- [x] Google auth support.
- [x] Local auth fallback.
- [x] Private route guard.
- [x] Post-auth routing based on onboarding completion.
- [x] Login respects safe `next` paths after private-route redirects.
- [x] Signed-in users who land on `/login` are redirected back into the app.
- [x] Browser Back is left to normal browser behavior.
- [x] Logout from private workspace.

## AI / Backend

- [x] Frontend chat helper calls DSIQ chat API.
- [x] Backend `/api/chat` route exists.
- [x] Gemini-backed response flow.
- [x] Public and private chat share the same AI helper.
- [x] Request timeout increased for slower AI responses.
- [ ] Add streaming responses.
- [ ] Add richer retry behavior.
- [ ] Add server health indicator in UI.

## Design System

- [x] DSIQ brand name/logo text.
- [x] Favicon/app icon.
- [x] Inter font.
- [x] Light theme variables.
- [x] Dark/system theme variables.
- [x] Shared button styles.
- [x] Shared input styles.
- [x] Shared card/surface styles.
- [x] Mobile responsive layouts.
- [x] Touch-friendly controls.
- [x] Shared mobile keyboard offset hook for chat inputs.
- [x] Loading and empty states.
- [x] Error states.
- [ ] Continue polishing spacing consistency across public content pages.
- [ ] Review all pages in dark mode.

## SEO / App Metadata

- [x] Root metadata.
- [x] Public page metadata.
- [x] Sitemap.
- [x] Robots config.
- [x] Manifest.
- [x] Favicon/icon.
- [ ] Add production Open Graph image.

## Deployment

- [x] Workspace scripts in root `package.json`.
- [x] Frontend package scripts.
- [x] Backend package scripts.
- [x] GitHub Pages workflow present.
- [x] Static export notes in README.
- [ ] Confirm production backend URL and environment variables.
- [ ] Confirm Firebase public env vars in deployment.

## Verification Notes

- [x] TypeScript check passes with `npm.cmd exec tsc -- --noEmit`.
- [ ] ESLint currently blocked by missing local dependency: `frontend/node_modules/hermes-parser/dist/index.js`.
- [ ] Run full frontend build after dependency install is repaired.
- [ ] Test public guest chat manually in browser.
- [ ] Test private chat manually in browser.
- [ ] Test auth/onboarding/profile flow manually.

## Immediate Next Steps

- [ ] Repair local frontend dependencies so ESLint can run.
- [x] Build the real private Search Chats panel.
- [x] Build the real private Library panel.
- [x] Build the real private Saved Chats panel.
- [ ] Build the real private sidebar panels for AI Mentor and Learning Roadmap.
- [x] Persist and reload private chat history.
- [ ] Add production Open Graph image.
