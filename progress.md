# Zahau Music School - Project Progress Tracker

Welcome to the progress tracking document for the **Zahau Music School** web application. This document tracks the tech stack, directory structure, project milestones, completed tasks, and upcoming developments.

---

## 🛠️ Project Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) (Client and Server rendering)
- **Routing & Framework Core**: [TanStack Start](https://tanstack.com/router/latest/docs/start/overview) (Type-safe routing, SSR, hydration support, and API Server Functions)
- **State Management & Querying**: [TanStack Query v5](https://tanstack.com/query/latest) (React Query)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using the `@tailwindcss/vite` plugin for build integration)
- **UI Components**: Built on [Radix UI](https://www.radix-ui.com/) primitives styled with Tailwind, following [shadcn/ui](https://ui.shadcn.com/) guidelines (e.g., Accordion, Dialog, Dropdown Menu, Forms, Carousel, Charts, Sidebar, etc.)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

### Backend & Database
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth (supports Email/Password and Google OAuth sign-in)
- **Authorization**: Role-based access control (`student` and `admin` roles) via database triggers, the `user_roles` table, and the `has_role` PostgreSQL function.
- **ORM & Types**: TypeScript types auto-generated from the Supabase schema (`src/integrations/supabase/types.ts`).

### Tooling & Infrastructure
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Runtime**: [Bun](https://bun.sh/) (configured via `bunfig.toml` and lockfile `bun.lock`)
- **Server Engine**: [Nitro](https://nitro.unjs.io/) (configured for production-ready, edge-compatible deployments)
- **Linter & Formatter**: ESLint v9 & Prettier

---

## 📁 Project Structure

Here is an overview of the directory layout of the repository:

```
zahau-music/
├── .env                              # Local environment variables (Supabase secrets)
├── package.json                      # NPM package script and dependencies
├── vite.config.ts                    # Vite config combining TanStack Start, React, Tailwind, and Nitro
├── tsconfig.json                     # TypeScript compilation options
├── eslint.config.js                  # Linter settings
├── setup_supabase_db.sql             # SQL script for database setup (run in Supabase editor)
├── test_signin.cjs                   # Script for testing connection & sign-in
├── test_claims.cjs                   # Script for testing token claims
├── supabase/
│   ├── config.toml                   # Supabase project configuration (links to project_id)
│   └── migrations/                   # Database migrations (RLS, schema patches, video support)
├── public/                           # Static assets available at the root URL
└── src/
    ├── start.ts                      # App bootstrap, global middleware configuration (CSRF & Error)
    ├── server.ts                     # SSR entrypoint & catastrophic error page fallback handler
    ├── router.tsx                    # TanStack Router instance setup
    ├── routeTree.gen.ts              # Automatically generated type-safe route tree
    ├── styles.css                    # Tailwind CSS v4 directives & custom theme variables
    ├── assets/                       # Image assets, graphics, and icons
    ├── components/
    │   ├── admin/
    │   │   └── AdminDashboard.tsx    # Admin Dashboard (tabs: courses, leads, subscribers, events)
    │   ├── site/
    │   │   ├── header.tsx            # Header component with theme-switch and dynamic auth actions
    │   │   ├── footer.tsx            # Standard site footer
    │   │   ├── lead-form.tsx         # Trial class booking / Consultation inquiry form
    │   │   ├── newsletter-form.tsx   # Newsletter email signup form
    │   │   └── whatsapp-fab.tsx      # Floating action button for WhatsApp chat
    │   └── ui/                       # Reusable shadcn/ui components (radix primitives)
    ├── hooks/                        # Custom React hooks (e.g., use-mobile)
    ├── lib/
    │   ├── site.functions.ts         # TanStack Server Functions (submitLead, getCourses, getEvents, etc.)
    │   ├── utils.ts                  # Class merger utility (cn)
    │   ├── error-capture.ts          # Server-side unhandled error capturing
    │   └── error-page.ts             # HTML string for fallback SSR error page
    │   └── api/                      # Backend API routing
    ├── integrations/
    │   └── supabase/
    │       ├── client.ts             # Client-side Supabase client (persists auth in localStorage)
    │       ├── client.server.ts      # Server-side Supabase client using Service Role (bypasses RLS)
    │       ├── auth-attacher.ts      # Middleware to attach JWT authorization headers to client calls
    │       ├── auth-middleware.ts    # Unused Server-side token claims verification middleware
    │       └── types.ts              # Auto-generated database typings
    └── routes/
        ├── _authenticated/           # Authenticated user routes
        │   ├── route.tsx             # Auth checker layout (verifies session or redirects)
        │   └── dashboard.tsx         # User dashboard (directs to Admin Console or Student Portal)
        ├── __root.tsx                # App shell layout containing navigation and query context
        ├── index.tsx                 # Homepage
        ├── auth.tsx                  # Login and account registration page
        ├── curriculum.index.tsx      # Curriculum catalog listing courses
        ├── curriculum.$slug.tsx      # Course details page (includes intro video & curriculum breakdown)
        ├── online.tsx                # Online lessons info page
        ├── about.tsx                 # About us page
        ├── gallery.tsx               # Photo gallery page
        ├── courses.tsx               # Lessons/videos listing page (replaces events.tsx)
        ├── testimonials.tsx          # Testimonials page
        ├── contact.tsx               # Contact page (Lead Form)
        ├── fees.tsx                  # Fees structure page (with dynamic admin management)
        └── schedule.tsx              # Weekly Schedule page (replaces blog pages)
```

---

## 📈 Milestone & Step Tracking

### 🏁 Phase 1: Core Architecture & Setup
- [x] Initialize project with TanStack Start, React 19, and TypeScript
- [x] Configure Vite with plugin support for TanStack Router, React, Tailwind CSS v4, and Nitro
- [x] Set up ESLint, Prettier, and path aliases (`@/*` pointing to `src/*`)
- [x] Configure Local environment settings (`.env`, `bunfig.toml`)

### 🏁 Phase 2: Database Schema & Supabase Setup
- [x] Set up remote/local Supabase project (project ID updated to `lzzhxceprsykslwfclxp`)
- [x] Write SQL initialization script (`setup_supabase_db.sql`) defining:
  - Tables: `profiles`, `user_roles`, `leads`, `newsletter_subscribers`, `courses`, `enrollments`, `events`, `event_registrations`
  - Enums: `app_role` (`admin`, `student`)
  - DB function: `has_role`
  - Trigger: `handle_new_user` running `on_auth_user_created`
- [x] Configure Row Level Security (RLS) policies for all public/authenticated tables
- [x] Generate TypeScript database types (`src/integrations/supabase/types.ts`)
- [x] Seed initial 8 courses details into the database

### 🏁 Phase 3: Site Layout & Basic Routing
- [x] Create site structure and core pages (Home, About, Curriculum, Gallery, Courses, Weekly Schedule, Contact, Fees)
- [x] Create layout shell (`__root.tsx`) with global Header, Footer, and WhatsApp FAB
- [x] Build forms for user interaction:
  - `LeadForm` for consultation bookings (submits to `leads` table via Server Function)
  - `NewsletterForm` for subscribers (submits to `newsletter_subscribers` table via Server Function)

### 🏁 Phase 4: Authentication & Role Management
- [x] Create authentication route (`/auth`) supporting Email/Password signin, signup, and Google OAuth
- [x] Setup client-side and server-side Supabase client instances (`client.ts`, `client.server.ts`)
- [x] Configure global middleware (`attachSupabaseAuth`) to automatically pass bearer JWT tokens to server functions
- [x] Assign the `admin` role to seed administrator `henrysui7@gmail.com`
- [x] Implement database checks to verify role authorization upon session retrieval

### 🏁 Phase 5: Dashboard & Portal Separation
- [x] Create protected routing group (`/_authenticated`) requiring users to sign in
- [x] Implement dynamic branching in `dashboard.tsx` based on user roles:
  - Render **Student Portal** for users with `student` role (displays courses, progress, assignments, events, and certs)
  - Render **Admin Console** (`AdminDashboard`) for users with `admin` role
- [x] Modify root shell layout (`__root.tsx`) to hide the client Header, Footer, and WhatsApp FAB when an admin is navigating the Dashboard, ensuring a clean dashboard layout.
- [x] Customize site navigation header to dynamically display "Dashboard" (for students), "Admin Console" (for admins), or "Login" (for visitors) depending on session status.

### 🏁 Phase 6: Admin Console Features (Management Portal)
- [x] **Overview Tab**: Show metrics summarizing total courses, consultations/leads, newsletter subscribers, lessons, and active fees.
- [x] **Courses Management Tab**: Allow admins to view courses, update details (name, duration, tagline, summary, certification, display order), and add/modify YouTube introduction videos.
- [x] **Leads Tab**: Display lead entries submitted through forms, showing contact info (name, phone, email, source), selected interest, and messages.
- [x] **Subscribers Tab**: Display email subscriptions.
- [x] **Lessons/Videos Tab**: Add, edit, and delete lesson videos and links directly from the console (replaces Events management).
- [x] **Fees Management Tab**: Add, edit, and delete school tuition fee options directly from the console.

### 🏁 Phase 7: Video Support & Enhancements
- [x] Create database migration `20260613194500_add_video_url_to_courses.sql` adding `video_url` column to courses
- [x] Create YouTube URL parser utility to extract video IDs and generate secure embed URLs (`https://www.youtube.com/embed/...`)
- [x] Update Course Details page (`/curriculum/$slug`) to dynamically display YouTube player if a `video_url` is configured for that course
- [x] Hide consultation/enrollment CTA forms on the Course Details page and homepage when the user is logged in as an administrator
- [x] Resolve theme toggler hydration reset and local storage issues
- [x] Add CSRF security middleware to TanStack Start instance in `src/start.ts`

---

## 🛠️ Diagnostics & Refactoring Opportunities

### ⚠️ Unused & Buggy Middleware (`auth-middleware.ts`)
Inside `src/integrations/supabase/auth-middleware.ts`, there is an authentication middleware `requireSupabaseAuth` containing:
```typescript
const { data, error } = await supabase.auth.getClaims(token);
```
**Issue**: The `@supabase/supabase-js` library does not have a `getClaims(token)` function on the `auth` namespace. Running this middleware results in a runtime error (`undefined` function error). 
**Status**: This middleware is currently **not** imported or used anywhere in the active routes. However, if this middleware is intended for future backend API endpoint protection, it should be refactored to use:
```typescript
const { data: { user }, error } = await supabase.auth.getUser(token);
// Roles/claims can then be read from user.app_metadata or by querying user_roles
```

---

## 📅 Next Steps & Recommendations

1. **Resolve Auth Middleware Bug**: Edit `src/integrations/supabase/auth-middleware.ts` to replace `auth.getClaims(token)` with `auth.getUser(token)` to prevent potential future issues if someone starts using it.
2. **Database Backup / Sync**: Ensure changes made via `setup_supabase_db.sql` are version-controlled properly, keeping local migrations and production database schemas perfectly synchronized.
3. **Admin Console Enhancements**:
   - Add search and pagination for leads and newsletter subscribers once numbers increase.
   - Add "Export to CSV" button for Leads and Newsletter Subscribers.
4. **Performance Tuning**: Verify server response times for SSR pages and review bundle size optimizations when compiling production builds using `npm run build`.
