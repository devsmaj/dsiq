# DSIQ Website/App Build TODO

This TODO is organized to help build the DSIQ website/app one step at a time.

## Core Rules

- [ ] Build in the approved order only.
- [ ] Do not try to ship every page at once.
- [ ] Finish shared layout pieces early so later pages move faster.
- [ ] Keep public and private navigation separate.
- [ ] Make desktop and mobile states for headers from the start.

## Information Architecture

### Public Pages

- [x] `/` Home
- [x] `/about` About
- [x] `/features` Features
- [x] `/how-it-works` How It Works
- [x] `/pricing` Pricing
- [x] `/contact` Contact
- [x] `/login` Login

### Public Pages For Later

- [x] `/signup`
- [x] `/privacy`
- [x] `/terms`

### Private Pages

- [x] `/dashboard`
- [x] `/onboarding`
- [x] `/coach`
- [x] `/missions`
- [x] `/opportunities`
- [x] `/progress`
- [x] `/profile`
- [x] `/settings`

### Private Pages For Later

- [ ] `/billing`
- [ ] `/admin`

## Shared UI

### Public Header

- [x] Add DSIQ logo
- [x] Add nav links: Home, About, Features, How It Works, Pricing, Contact
- [x] Add `Login` button
- [x] Add `Get Started` button
- [x] Add mobile layout with logo and menu icon

### Public Footer

- [x] Add DSIQ brand block
- [x] Add tagline: "Your AI coach for skills, opportunities, and action."
- [x] Add links: Home, About, Features, Pricing, Contact
- [x] Add legal links: Privacy, Terms
- [x] Add "Powered by DSIQ"
- [x] Add "Part of the SMAJ Ecosystem"

### Private Header

- [x] Add DSIQ logo
- [x] Add nav links: Dashboard, Coach, Missions, Opportunities, Progress, Profile
- [x] Add `Logout`
- [x] Add mobile layout with logo and menu icon

### Private Footer

- [x] Add "Powered by DSIQ"
- [x] Add "Part of the SMAJ Ecosystem"

## Page Sections

### Home `/`

- [x] Header
- [x] Hero
- [x] Problem
- [x] Solution
- [x] How DSIQ Works
- [x] Features
- [x] Target Users
- [x] Pricing Preview
- [x] Call to Action
- [x] Footer

### About `/about`

- [x] Header
- [x] Mission
- [x] Why DSIQ exists
- [x] Who it helps
- [x] SMAJ Ecosystem connection
- [x] Footer

### Features `/features`

- [x] Header
- [x] AI Opportunity Analysis
- [x] Weekly Missions
- [x] Accountability Coach
- [x] Progress Tracking
- [x] Learning Roadmaps
- [x] Footer

### How It Works `/how-it-works`

- [x] Header
- [x] Step 1: Create account
- [x] Step 2: Answer simple questions
- [x] Step 3: Get AI path
- [x] Step 4: Complete missions
- [x] Step 5: Grow with coaching
- [x] Footer

### Pricing `/pricing`

- [x] Header
- [x] Free plan
- [x] Pro plan
- [x] What is included
- [x] FAQ
- [x] Footer

### Contact `/contact`

- [x] Header
- [x] Contact form
- [x] Email/social links
- [x] Footer

### Login `/login`

- [x] Logo
- [x] Login form
- [x] Forgot password
- [x] Create account link

### Dashboard `/dashboard`

- [x] Private Header
- [x] Welcome message
- [x] Today's coach advice
- [x] Weekly mission summary
- [x] Recommended opportunity
- [x] Progress overview
- [x] Private Footer

### Onboarding `/onboarding`

- [x] Goal question
- [x] Skills question
- [x] Time question
- [x] Budget question
- [x] Interest question
- [x] Generate AI path button

### Coach `/coach`

- [x] AI chat
- [x] Coach messages
- [x] Action advice
- [x] Save recommendation

### Missions `/missions`

- [x] Weekly missions
- [x] Task checklist
- [x] Completed tasks
- [x] Missed tasks
- [x] Generate next missions

### Opportunities `/opportunities`

- [x] Freelance ideas
- [x] Business ideas
- [x] Learning paths
- [x] Scholarships
- [x] Remote jobs
- [x] Hackathons

### Progress `/progress`

- [x] Progress score
- [x] Completed missions
- [x] Consistency streak
- [x] Goal/action match
- [x] AI warning or encouragement

### Profile `/profile`

- [x] Name
- [x] Skills
- [x] Goals
- [x] Interests
- [x] Budget
- [x] Time available
- [x] Edit profile

### Settings `/settings`

- [x] Account
- [x] Language
- [x] Notification preferences
- [x] Delete account
- [x] Logout

## Best Build Order

### Phase 1

- [x] 1. Home page
- [x] 2. Public header
- [x] 3. Public footer

### Phase 2

- [x] 4. Login/signup
- [x] 5. Onboarding
- [x] 6. Dashboard

### Phase 3

- [x] 7. AI coach
- [x] 8. Missions
- [x] 9. Progress
- [x] 10. Opportunities

### Phase 4

- [x] 11. Pricing
- [x] 12. About/contact

## Suggested Delivery Checklist

- [x] Define route structure
- [x] Create shared public layout
- [x] Create shared private layout
- [x] Add auth guard for private pages
- [x] Add mobile nav behavior
- [ ] Add placeholder content for each page before polish
- [x] Connect onboarding data to dashboard state
- [x] Connect coach, missions, progress, and opportunities to shared user data
- [x] Add loading, empty, and error states
- [x] Add basic SEO for public pages
- [ ] Add analytics later if needed

## Immediate Next Step

- [x] Start with the Home page only

---

# DSIQ UI/UX Design Roadmap

## Phase 1 - Brand Identity

- [x] Finalize DSIQ logo
- [x] Create favicon
- [x] Choose brand colors
- [x] Add Inter font
- [x] Create typography system
- [x] Create spacing system
- [x] Create border radius system

## Colors

### Backgrounds

- [x] Main background: `#0D0D0D`
- [x] Secondary background: `#171717`
- [x] Border color: `#2A2A2A`

### Text

- [x] Primary text: `#FFFFFF`
- [x] Secondary text: `#A1A1AA`

### Brand Colors

- [x] Primary green: `#10A37F`
- [x] Hover green: `#0D8C6D`

## Components

### Buttons

- [x] Primary button
- [x] Secondary button
- [x] Hover animation
- [x] Disabled button state

### Inputs

- [x] Email input
- [x] Password input
- [x] Search input
- [x] Focus states

### Cards

- [x] Feature card
- [x] Opportunity card
- [x] Dashboard stat card

### Navigation

- [x] Desktop navbar
- [x] Mobile navbar
- [x] Mobile hamburger menu

## Public Pages

### Homepage

- [x] Hero section
- [x] Problem section
- [x] Solution section
- [x] Features section
- [x] Target users section
- [x] Pricing preview
- [x] CTA section
- [x] Footer

### Login / Signup

- [x] Signup form
- [x] Login form
- [x] Forgot password
- [x] Form validation
- [x] Loading states

### Pricing

- [x] Free plan card
- [x] Pro plan card
- [x] FAQ section

## Private Pages

### Dashboard

- [x] Welcome section
- [x] Coach message card
- [x] Weekly missions card
- [x] Opportunity card
- [x] Progress overview

### AI Coach

- [x] Chat layout
- [x] Message bubbles
- [x] Typing animation
- [x] AI response card

### Missions

- [x] Mission checklist
- [x] Complete task button
- [x] Progress percentage

### Progress

- [x] Streak system
- [x] Goal tracking
- [x] AI accountability warning

## Mobile Responsiveness

- [x] iPhone responsive
- [x] Android responsive
- [x] Tablet responsive
- [x] Navbar mobile menu
- [x] Touch-friendly buttons
- [x] Responsive cards
- [x] Responsive typography

## UX Improvements

- [x] Smooth transitions
- [x] Loading skeletons
- [x] Empty states
- [x] Error states
- [x] Toast notifications
- [x] Scroll animations
- [x] Dark mode polish

## Final Polish

- [x] Consistent spacing
- [x] Consistent button style
- [x] Consistent typography
- [x] Accessibility check
- [x] Performance optimization
- [x] SEO optimization
- [x] PWA support
