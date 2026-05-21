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

- [ ] `/` Home
- [ ] `/about` About
- [ ] `/features` Features
- [ ] `/how-it-works` How It Works
- [ ] `/pricing` Pricing
- [ ] `/contact` Contact
- [ ] `/login` Login

### Public Pages For Later

- [ ] `/signup`
- [ ] `/privacy`
- [ ] `/terms`

### Private Pages

- [ ] `/dashboard`
- [ ] `/onboarding`
- [ ] `/coach`
- [ ] `/missions`
- [ ] `/opportunities`
- [ ] `/progress`
- [ ] `/profile`
- [ ] `/settings`

### Private Pages For Later

- [ ] `/billing`
- [ ] `/admin`

## Shared UI

### Public Header

- [ ] Add DSIQ logo
- [ ] Add nav links: Home, About, Features, How It Works, Pricing, Contact
- [ ] Add `Login` button
- [ ] Add `Get Started` button
- [ ] Add mobile layout with logo and menu icon

### Public Footer

- [ ] Add DSIQ brand block
- [ ] Add tagline: "Your AI coach for skills, opportunities, and action."
- [ ] Add links: Home, About, Features, Pricing, Contact
- [ ] Add legal links: Privacy, Terms
- [ ] Add "Powered by DSIQ"
- [ ] Add "Part of the SMAJ Ecosystem"

### Private Header

- [ ] Add DSIQ logo
- [ ] Add nav links: Dashboard, Coach, Missions, Opportunities, Progress, Profile
- [ ] Add `Logout`
- [ ] Add mobile layout with logo and menu icon

### Private Footer

- [ ] Add "Powered by DSIQ"
- [ ] Add "Part of the SMAJ Ecosystem"

## Page Sections

### Home `/`

- [ ] Header
- [ ] Hero
- [ ] Problem
- [ ] Solution
- [ ] How DSIQ Works
- [ ] Features
- [ ] Target Users
- [ ] Pricing Preview
- [ ] Call to Action
- [ ] Footer

### About `/about`

- [ ] Header
- [ ] Mission
- [ ] Why DSIQ exists
- [ ] Who it helps
- [ ] SMAJ Ecosystem connection
- [ ] Footer

### Features `/features`

- [ ] Header
- [ ] AI Opportunity Analysis
- [ ] Weekly Missions
- [ ] Accountability Coach
- [ ] Progress Tracking
- [ ] Learning Roadmaps
- [ ] Footer

### How It Works `/how-it-works`

- [ ] Header
- [ ] Step 1: Create account
- [ ] Step 2: Answer simple questions
- [ ] Step 3: Get AI path
- [ ] Step 4: Complete missions
- [ ] Step 5: Grow with coaching
- [ ] Footer

### Pricing `/pricing`

- [ ] Header
- [ ] Free plan
- [ ] Pro plan
- [ ] What is included
- [ ] FAQ
- [ ] Footer

### Contact `/contact`

- [ ] Header
- [ ] Contact form
- [ ] Email/social links
- [ ] Footer

### Login `/login`

- [ ] Logo
- [ ] Login form
- [ ] Forgot password
- [ ] Create account link

### Dashboard `/dashboard`

- [ ] Private Header
- [ ] Welcome message
- [ ] Today's coach advice
- [ ] Weekly mission summary
- [ ] Recommended opportunity
- [ ] Progress overview
- [ ] Private Footer

### Onboarding `/onboarding`

- [ ] Goal question
- [ ] Skills question
- [ ] Time question
- [ ] Budget question
- [ ] Interest question
- [ ] Generate AI path button

### Coach `/coach`

- [ ] AI chat
- [ ] Coach messages
- [ ] Action advice
- [ ] Save recommendation

### Missions `/missions`

- [ ] Weekly missions
- [ ] Task checklist
- [ ] Completed tasks
- [ ] Missed tasks
- [ ] Generate next missions

### Opportunities `/opportunities`

- [ ] Freelance ideas
- [ ] Business ideas
- [ ] Learning paths
- [ ] Scholarships
- [ ] Remote jobs
- [ ] Hackathons

### Progress `/progress`

- [ ] Progress score
- [ ] Completed missions
- [ ] Consistency streak
- [ ] Goal/action match
- [ ] AI warning or encouragement

### Profile `/profile`

- [ ] Name
- [ ] Skills
- [ ] Goals
- [ ] Interests
- [ ] Budget
- [ ] Time available
- [ ] Edit profile

### Settings `/settings`

- [ ] Account
- [ ] Language
- [ ] Notification preferences
- [ ] Delete account
- [ ] Logout

## Best Build Order

### Phase 1

- [ ] 1. Home page
- [ ] 2. Public header
- [ ] 3. Public footer

### Phase 2

- [ ] 4. Login/signup
- [ ] 5. Onboarding
- [ ] 6. Dashboard

### Phase 3

- [ ] 7. AI coach
- [ ] 8. Missions
- [ ] 9. Progress
- [ ] 10. Opportunities

### Phase 4

- [ ] 11. Pricing
- [ ] 12. About/contact

## Suggested Delivery Checklist

- [ ] Define route structure
- [ ] Create shared public layout
- [ ] Create shared private layout
- [ ] Add auth guard for private pages
- [ ] Add mobile nav behavior
- [ ] Add placeholder content for each page before polish
- [ ] Connect onboarding data to dashboard state
- [ ] Connect coach, missions, progress, and opportunities to shared user data
- [ ] Add loading, empty, and error states
- [ ] Add basic SEO for public pages
- [ ] Add analytics later if needed

## Immediate Next Step

- [ ] Start with the Home page only
