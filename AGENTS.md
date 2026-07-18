# Repository Guidelines

## Project Structure & Module Organization

The root project is a TypeScript TanStack Start application. Keep pages in `src/routes/` (file-based routing), reusable UI in `src/components/`, shared code in `src/lib/`, and Supabase integration code in `src/integrations/` and `utils/supabase/`. `src/routeTree.gen.ts` is generated; do not edit it manually. Static assets belong in `public/` or `src/assets/` as appropriate.

`next-app/` is a separate Next.js implementation with its own `package.json`, App Router pages in `next-app/app/`, and components in `next-app/components/`. Database migrations and local Supabase configuration live in `supabase/`; add schema changes as timestamped SQL migrations there.

## Build, Test, and Development Commands

Run these from the repository root:

- `npm ci` — install the locked dependencies.
- `npm run dev` — start the TanStack Start/Vite development server.
- `npm run build` — create a production build.
- `npm run preview` — serve the root production build locally.
- `npm run lint` — run ESLint across the project.
- `npm run format` — apply Prettier formatting.

For the Next.js app, run the equivalent commands from `next-app/`, for example `cd next-app; npm run dev`.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Prettier is authoritative: 100-character lines, semicolons, double quotes, and trailing commas. Run formatting before committing. Use PascalCase for component exports (for example, `BookDemoModal`) and lowercase/hyphenated names for ordinary component files (for example, `book-demo-modal.tsx`). Follow TanStack route conventions in `src/routes/`, such as `courses.$slug.tsx` for dynamic routes; preserve `__root.tsx` and generated route files.

## Testing Guidelines

No automated test runner or coverage target is currently configured. For each change, run `npm run lint` and `npm run build`, then manually verify the affected route and responsive UI. Add focused tests alongside new test infrastructure when introducing non-trivial business logic.

## Commit & Pull Request Guidelines

Recent history uses short, imperative summaries, sometimes with Conventional Commit prefixes (for example, `fix: resolve theme toggle hydration reset issue` and `build: configure Nitro`). Prefer `type: concise imperative summary`; keep each commit focused.

PRs should explain the user-visible change, link relevant issues, note required migrations or environment configuration, and include screenshots for visual changes. Never commit credentials or production secrets; keep them in local environment files or deployment settings.
