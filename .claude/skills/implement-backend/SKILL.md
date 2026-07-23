---
name: implement-backend
description: Wire the Zahau Music Supabase backend for a feature whose code is already written — apply pending SQL migrations, regenerate types, configure any in-app settings, and verify end-to-end. Use when a feature was built "frontend + server-functions first" and the database side was deliberately left for later.
---

# Implement the Supabase backend for a pending feature

This repo is often built **code-first**: the routes, components, and
`createServerFn` handlers land in `src/`, but the matching Supabase schema is
left unapplied so the live database isn't touched until the owner is ready. This
skill turns a written-but-unwired feature ON.

The backend stays on **Supabase** (project ref `srxogdtbokmlfibjkvcw`, see
`.mcp.json`). Do not migrate to another backend.

## 0. Find what's pending

- New migration files in `supabase/migrations/` that haven't been run yet
  (compare against what exists in the live DB).
- The server functions that read/write the new tables live in
  `src/lib/site.functions.ts`.
- Generated types in `src/integrations/supabase/types.ts` should already list
  the new tables (they're maintained by hand here).

Confirm with the owner which migration(s) to apply before touching the database
— applying schema is hard to reverse.

## 1. Apply the migration

The migration file is the source of truth; `setup_supabase_db.sql` is only a
consolidated mirror for fresh setups. Two ways to apply, in order of preference:

**A. Supabase dashboard SQL editor (simplest, no MCP auth):**

1. Open https://supabase.com/dashboard/project/srxogdtbokmlfibjkvcw/sql/new
2. Paste the **entire** contents of the pending migration file and Run.
3. Re-running is safe-ish: `CREATE TABLE`/`CREATE POLICY` throw "already exists"
   if it was applied before — harmless, means it's live.

**B. Supabase MCP** (`mcp__supabase__*`): call `mcp__supabase__authenticate`,
share the URL with the owner, then `complete_authentication` with the callback
URL. If OAuth fails ("Unrecognized client_id" or similar), don't rabbit-hole —
fall back to option A.

## 2. Regenerate / verify types

`src/integrations/supabase/types.ts` is marked auto-generated. New tables are
added here by hand in this repo — after applying a migration, confirm the
`Database["public"]["Tables"]` entries match the migration's columns. Run
`npx tsc --noEmit` to catch any drift.

## 3. Configure in-app settings

Some features need a row of runtime config the admin sets in the console rather
than an env var. For **UPI QR payments**: admin console → **Payments** tab → set
**UPI ID (VPA)** + **Payee name** → Save. Until the UPI ID is set, checkout
falls back to the "reserve / contact us" path instead of showing a QR.

## 4. Verify end-to-end

Static checks first (or run the `verify-app` skill):

```
npm run lint          # 0 errors (ui/ warnings ok)
npx tsc --noEmit      # vite build does NOT typecheck
npm run build
npm run dev           # http://localhost:3000
```

Then drive the real flow. For **UPI QR payments** specifically:

1. Admin → Payments → set UPI ID → Save.
2. Student on `/fees` → pick a package → QR shows with the **exact package
   amount** embedded; enter a UTR (+ optional screenshot) → "under review".
3. Dashboard → Purchase tab shows the enrollment with an amber **Under review**
   badge.
4. Admin → Payments → the row is `pending`, screenshot opens via signed URL →
   **Approve** → student's enrollment flips to `active`.
5. `/book-demo` → pick a slot → pay Rs. 500 QR → submit UTR → slot is held;
   admin approval sends the demo confirmation email.

## 5. Security checks (do not skip)

The security model mirrors `20260719000000_lock_down_enrollments_writes.sql`:
clients may never grant themselves a paid state. Confirm after wiring:

- A signed-in **non-admin** cannot call `reviewPaymentSubmission` (it runs
  `assertAdmin`, which bypasses RLS-friendliness with an explicit role check).
- A student cannot read another student's `payment_submissions` row or
  screenshot (RLS: owner-read + admin-read only; the `payment-proofs` bucket is
  private and folder-scoped to `auth.uid()`).
- Amounts are set server-side from `fees.raw_fees` — a doctored client request
  can't change what's owed.

## Notes

- Never edit past migration files — add new timestamped ones.
- `supabaseAdmin` (`client.server.ts`) bypasses RLS and is server-only; any
  admin action it performs must be gated by `assertAdmin` first.
