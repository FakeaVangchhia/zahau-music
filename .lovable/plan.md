
# Zahau Music School — Build Plan

A premium, full music academy site built from the selected **Bold Performance** direction (Anton display + Inter + JetBrains Mono, navy `#0F172A` + azure `#3B82F6` on surface `#F8FAFC`). Light theme primary, dark mode secondary. Fully responsive, accessible (WCAG AA), SEO-optimized per-route, with Framer Motion micro-interactions. Backend powered by Lovable Cloud (Supabase under the hood).

## 1. Design system

- Install fonts via `<link>` in `__root.tsx` (Anton, Inter, JetBrains Mono).
- Rewrite `src/styles.css` with `@theme` tokens: `--color-navy`, `--color-azure`, `--color-surface`, plus shadcn semantic mappings, dark mode variants. Add `@utility` for marquee + reveal animations. Add brutalist hairline borders, `font-display`, `font-mono` utilities.
- Build a header (sticky, glassy on light), footer, theme toggle, mobile drawer nav, WhatsApp floating button, newsletter modal — all as reusable components in `src/components/site/`.
- Framer Motion for hero reveal, scroll-fade sections, hover lifts, marquee.

## 2. Routes (TanStack file-based, each with its own `head()` SEO)

```
src/routes/
  __root.tsx                 (Header, Footer, WhatsApp FAB, JSON-LD Organization)
  index.tsx                  Home
  about.tsx                  Mission, Vision, Founder (Henry Jahau), Methodology
  faculty.tsx                Faculty grid
  courses.index.tsx          Course hub w/ search + comparison
  courses.$slug.tsx          Dynamic course page (piano, keyboard, guitar, bass,
                              drums, violin, voice, music-theory) — overview,
                              curriculum, outcomes, duration, levels, cert, CTA
  learning-levels.tsx        Beginner → Intermediate → Advanced → Performance Cert
  online.tsx                 Online learning features
  events.index.tsx           Concerts, recitals, workshops, masterclasses
  events.$id.tsx             Event detail + registration
  gallery.tsx                Photos / videos / performances / studio
  testimonials.tsx           Video + written + success stories
  blog.index.tsx             Blog list
  blog.$slug.tsx             Blog post
  contact.tsx                Inquiry form, WhatsApp, email, Google Maps embed,
                              branches (Delhi)
  auth.tsx                   Sign in / sign up (email+password + Google)
  _authenticated/route.tsx   Auth gate (integration-managed)
  _authenticated/dashboard.tsx  Student portal: courses, assignments,
                              progress, certificates, upcoming classes
  sitemap[.]xml.tsx          Dynamic sitemap
  api/public/newsletter.ts   Newsletter subscribe endpoint (optional)
```

Hash anchors avoided — every major section is its own route for SEO and shareability.

## 3. Home page composition (mirrors selected direction exactly)

Sticky nav → Hero (navy, B&W piano image, headline "Master the Art of Sound", 3 CTAs, marquee of instruments at bottom) → Azure stats strip (Students / Years / Courses / Branches) → "Featured Disciplines" 3×2 hairline grid (6 instruments, hover-invert to navy) → "Why Choose Us" 4-up feature row → "The Zahau Journey" 6-step on navy (Discover → Learn → Practice → Perform → Record → Graduate) → Student Success Stories cards → Testimonials carousel → Branch Locations band → FAQ accordion → Contact CTA band → Footer. Component counts and ordering match the prototype.

## 4. Lovable Cloud backend

Enable Lovable Cloud, then migration creates:

- `profiles` (id → auth.users, full_name, avatar_url, phone) + auto-insert trigger on signup
- `user_roles` (separate table, `app_role` enum: admin/student) + `has_role()` security-definer
- `leads` (name, email, phone, course_interest, message, source) — public insert, admin read
- `newsletter_subscribers` (email unique, created_at) — public insert
- `courses` (slug, name, summary, curriculum jsonb, duration, levels, cert) — public read, admin write
- `enrollments` (user_id, course_id, status, enrolled_at) — owner R/W
- `assignments` (course_id, title, due_date, description) — student read
- `submissions` (assignment_id, user_id, file_url, grade) — owner R/W
- `events` (title, type, starts_at, location, description, image_url) — public read
- `event_registrations` (event_id, user_id) — owner R/W
- `certificates` (user_id, course_id, issued_at, url) — owner read

All tables get GRANTs + RLS policies per the user-roles knowledge.

Auth: email/password + Google (via `lovable.auth.signInWithOAuth("google")` + `supabase--configure_social_auth`). Password reset page included.

Server functions (`src/lib/*.functions.ts`): `submitLead`, `subscribeNewsletter`, `getCourses`, `getCourse`, `enroll`, `registerForEvent`, `getMyDashboard`. Public reads use `supabaseAdmin` inside the handler (imported via `await import`); auth'd actions use `requireSupabaseAuth`.

## 5. Forms & lead capture

- All forms use react-hook-form + zod (length caps, email/phone regex).
- Contact, enrollment CTA, free-consultation, newsletter, event-register — all post to server fns and write to DB.
- Toast feedback via existing sonner.
- WhatsApp floating button pre-fills inquiry message.

## 6. SEO / performance / a11y

- Per-route `head()` with title, description, og:title/description, og:image (only on leaf routes with hero imagery), canonical.
- JSON-LD: Organization in `__root.tsx`; `Course` schema on course pages; `Event` on event pages; `FAQPage` on home/contact; `Article` on blog posts; `BreadcrumbList` on deep routes.
- Generated hero/course imagery via imagegen, uploaded as Lovable Assets.
- Single `<main>` per route, semantic headings, alt text, aria-labels on icon buttons, 44px tap targets, `h-dvh` for hero, dark-mode-safe contrast tokens, prefers-reduced-motion respected by Motion components.
- `robots.txt` + dynamic `sitemap.xml`.

## 7. Build order (one continuous pass)

1. Enable Lovable Cloud + DB migration + auth providers.
2. Generate hero, course tile, branch images.
3. Design tokens, fonts, shared layout (Header/Footer/WhatsAppFAB/ThemeToggle).
4. Home page (all sections).
5. About, Faculty, Learning Levels, Online, Gallery, Testimonials, Events, Blog list+detail.
6. Courses index + dynamic course page (seed 8 course records).
7. Contact (form + Google Maps embed for Delhi branch).
8. Auth + password reset + protected `/dashboard` (current courses, assignments, progress bars, certificates, upcoming classes).
9. Server functions + form wiring.
10. SEO heads + JSON-LD + sitemap + robots.

## Technical notes

- Stack stays on TanStack Start (template default) — not Next.js, despite the brief.
- Public-route loaders avoid `requireSupabaseAuth`; data fetched via Query + server fns using `supabaseAdmin`.
- Google Maps embed uses a plain iframe (no key needed for basic embed); upgrade to Maps JS API only if user later wants interactivity.
- Google sign-in goes through Lovable broker.
- Blog/dashboard ship with seeded mock content so they look complete on day one.
