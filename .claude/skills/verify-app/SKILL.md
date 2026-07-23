---
name: verify-app
description: Verify a change to the Zahau Music site end-to-end — lint, typecheck, build both apps, and drive the affected routes on the dev server. Use before committing any change to src/ or next-app/.
---

# Verify a change in this repo

This repo holds **two apps sharing one Supabase backend**: the production
TanStack Start app at the root (`src/`) and a secondary inquiry-only Next.js
app in `next-app/`. Verify whichever you touched; if a behavior change applies
to both (forms, data queries, page content), check for a mirror change in the
other app before finishing.

## 1. Static checks (root app)

Run from the repo root:

```
npm run lint          # ESLint — must be 0 errors (warnings in src/components/ui are accepted)
npx tsc --noEmit      # typecheck — vite build does NOT typecheck, so run this explicitly
npm run build         # production build (vite + nitro)
```

If `npm run lint` hangs for minutes, something re-added scratch files or build
output outside the ignore list in `eslint.config.js` — extend `ignores` there
rather than waiting it out.

## 2. Static checks (next-app, only if touched)

```
cd next-app
npm run build
```

Caution: `next-app/next.config.ts` sets `ignoreBuildErrors` and
`ignoreDuringBuilds`, so a green `next build` does NOT prove types/lint are
clean — it only proves pages prerender. Any client component using
`useSearchParams()` must be wrapped in a `<Suspense>` boundary or the build
fails at prerender.

## 3. Drive the affected flow

```
npm run dev           # root app, serves on http://localhost:3000
```

Then hit the routes you changed (curl status + grep the SSR HTML, or open the
browser). High-value flows and their checkpoints:

- **Buy Course & Enroll**: `/courses/piano` → enroll link carries
  `?plan=…&instrument=…` → `/fees` preselects the instrument (plan falls back
  to the default package when no title/duration matches). Unauthenticated
  "Buy" click must redirect to `/auth?redirect=/fees`, and signing in must
  return to `/fees`.
- **Contact prefill**: `/contact?course=X` must prefill the course-interest
  input (`value="X"` in SSR HTML).
- **Student dashboard** (`/dashboard`, auth required, `ssr: false`): three tabs
  — Overview, Purchase, Courses. Pending UPI payments show an amber "Under
  review" badge in the Purchase tab; approved ones flip to `active`.
- **Payments (manual UPI QR — no gateway)**: the checkout modal (`/fees` and
  dashboard) and `/book-demo` render a UPI QR from `payment_settings`
  (`upi_vpa` + `payee_name`, set in admin → Payments). No QR renders while
  `upi_vpa` is empty — the UI falls back to reserve/contact. A submission
  inserts a `pending` `payment_submissions` row (+ a `pending` enrollment or a
  slot-holding `leads` row); admin Approve (or UTR auto-match via
  `POST /api/upi-sms`, secret `UPI_WEBHOOK_SECRET`) activates it. The UTR
  field accepts only 12-digit references. Verify a non-admin cannot write
  `enrollments`/`payment_submissions` directly — all writes are service-role.

## 4. Database-touching changes

Schema changes go in `supabase/migrations/` as new timestamped files — never
edit past migrations. After changing schema, regenerate
`src/integrations/supabase/types.ts` (marked auto-generated) rather than
hand-editing it. The Supabase MCP server (`.mcp.json`) can run read-only
queries to confirm seeded data — e.g. course slugs must stay in sync with
`instrumentToSlug` in `src/lib/payments.ts`. Note: the live DB was seeded from
the base schema, not the full migration chain — verify a table/column/policy
exists in the live DB before relying on it.
