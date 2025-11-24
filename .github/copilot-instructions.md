<!-- Auto-generated guidance for AI coding agents working on the CNC Tools repo -->

# CNC Tools — AI Assistant Instructions

This file briefly orients an AI coding assistant to be immediately productive in this repository.

**Big Picture**

- **Framework:** Next.js app (app/ directory) written in TypeScript. UI uses React 18 and some server/client components.
- **Deployment targets:** Local `next dev` development, static/SSR Netlify deploys (`netlify.toml` + `npm run netlify:build`).
- **Purpose:** Collection of small CNC-related utilities (cut optimizers, packing, calculators). Core algorithmic code lives under `app/*` (e.g. `app/20-series-extrusions/cutOptimizer.ts`, `app/box-shipping-calculator/BoxCalculations.ts`).

**Key files & places to inspect**

- `package.json` — scripts: `dev`, `build`, `start`, `test`, `test:watch`, `test:coverage`, `netlify:build`.
- `next.config.js` — Next configuration; image domains and trailing slash behavior.
- `middleware.ts` — Authentication middleware using `@clerk/nextjs` (important for routing & API access).
- `types/` — Central TypeScript types (e.g. `types/box-shipping-calculator/`, `types/mongodb`). Update types when changing data shapes.
- `contexts/` & `utils/` — app-level providers and helpers (e.g. `contexts/AuthProvider.tsx`, `utils/navigation.tsx`).
- `app/*` — Feature folders contain both components and algorithmic logic. Look for `.test.tsx` files alongside features.

**Architecture notes / conventions**

- Uses path alias `@/` (see `tsconfig.json` paths). Always import project files as `@/...` to stay consistent.
- Data access is abstracted via a `DataProvider` interface (`types/mongodb/DataProvider.ts`). Implementations may swap local vs remote storage — when changing the data layer, adjust or respect `DataProviderOptions`.
- Authentication is provided by Clerk and enforced in `middleware.ts`. Many pages/components assume an authenticated user from the provider/UI components package `@deejpotter/ui-components`.
- Algorithmic code is placed in plain TypeScript modules (not React components) for easy unit testing (examples: `cutOptimizer.ts`, `BoxCalculations.ts`). Tests use Jest + Testing Library.

**Developer workflows**

- Run dev server: `npm run dev` (Next.js dev). Use `npm run build` then `npm run start` to test production build locally.
- Run tests: `npm run test` (or `npm run test:watch`). Tests are Jest + jsdom; run coverage with `npm run test:coverage`.
- Lint: `npm run lint` (Next.js ESLint config).
- Netlify: repository includes `netlify.toml`; use `npm run netlify:build` or the Netlify CLI for deploy previews.

**Patterns to follow when changing code**

- Prefer small, focused edits. Many components are used across pages; search for a component before renaming.
- When editing algorithms (e.g. packing/cutting), keep logic in `app/...` TS modules and add unit tests under the same folder (e.g. `BoxCalculations.test.tsx`).
- Keep UI changes in React components under `app/*` or `components/` and preserve default exports for pages.
- If adding server-side code or API routes, be mindful of `middleware.ts` matcher rules that run Clerk middleware for `/api` and most app routes.

**Integrations & external deps**

- Authentication: `@clerk/nextjs` (see `middleware.ts`).
- Database: `mongodb` referenced; a `DataProvider` abstraction defines interactions. Look in `types/mongodb` and `utils/` for concrete usage.
- UI primitives: `@deejpotter/ui-components` — many wrappers/Providers rely on it.
- AI/chat: `ai` and `openai` in `package.json` — if modifying chat features check `app/cnc-technical-ai/*`.

**MCP server & tools**

- This workspace is backed by an MCP server that exposes helper tools useful to AI agents:

  - **Search tools**: web and repo search helpers (for quick web lookups or citation gathering).
  - **Context7 documentation tool**: fetches library documentation (Context7) for focused API docs.

- When you need external references or up-to-date docs, prefer the MCP tools rather than raw web scraping.
  - Example uses: request Context7 docs for a library ID (to get authoritative API docs), or run a Google/DuckDuckGo search to gather structured results.
  - These tools appear as the agent's `mcp_*` toolset and return structured results (titles, URLs, short snippets) or full documentation blocks.

**Search tokens / entry points for common tasks**

**Search tokens / entry points for common tasks**

- Algorithms: search for `Best Fit Decreasing`, `Extreme Point`, `cutOptimizer`, `BoxCalculations`.
- Auth & routing: `clerkMiddleware`, `middleware.ts`.
- Data layer: `DataProvider`, `DEFAULT_OPTIONS`, `types/mongodb`.

If anything in this guide is unclear or misses an important workflow you rely on, tell me which parts to expand and I will iterate.
