<!--
 * codeupdates.md
 * Updated: 25/06/2025
 * Author: Deej Potter
 * Description: Log of all major codebase changes, especially authentication and API integration migrations. Used by AI agents and developers to track progress and ensure all changes are tested and documented.
 Delete completed entries to keep the log current. Keep the last 5 entries for reference.
-->
# Code Updates Log

## (completed) - June 25, 2025 (Codebase Cleanup: Remove Deprecated Auth Files)

- Deleted `contexts/AuthContext.tsx` and `components/navbar/Auth.tsx` (both deprecated after Clerk migration, now fully removed from the codebase).
- Searched for and removed any references to these files in the project.
- This is part of a broader codebase cleanup to remove dead code and clarify abstractions.
- Next steps: Continue auditing for other unused or overly abstracted files, improve comments, and ensure all changes are tracked here.

---

## (in progress) - June 12, 2025 (Clerk JWT in React Fetch for Backend API)

- Updated `PdfImport.backend.tsx` to always send Clerk JWT in Authorization header for backend-protected endpoints.
- Fetch now uses `NEXT_PUBLIC_TECHNICAL_AI_API_URL` if set, otherwise falls back to local API route for dev/test.
- Added detailed comments to clarify why this is required and how to use the pattern for all Clerk-protected endpoints.
- To avoid 401 errors, all React fetch/axios calls to backend must include the Clerk JWT in the Authorization header.

## (in progress) - June 11, 2025 (PDF Invoice Processing - CNC Tools Frontend)

- **Goal**: Update `cnc-tools/components/PdfImport.backend.tsx` to send PDF files directly to the `technical-ai` Express backend for processing.
- This approach leverages the `technical-ai` backend for robust, long-running tasks (PDF parsing, AI interaction) to avoid potential Next.js API route timeouts.
- The component will use a `NEXT_PUBLIC_TECHNICAL_AI_API_URL` environment variable to target the Express server.
- **Next Steps**:
  - Implement the direct API call in `PdfImport.backend.tsx`.
  - Ensure Clerk JWT is passed for authentication.
  - Handle the structured JSON response from `technical-ai`.

## (paused) - June 11, 2025 (Box Shipping Calculator Implementation)

- This task is currently paused to prioritize the PDF Invoice Processing feature.
- Backend: Initial tests for `packItemsIntoMultipleBoxes` created in `technical-ai` project.
- Frontend: Starting implementation of UI for item input and results display in `cnc-tools/app/box-shipping-calculator/page.tsx`.

## (in progress) - June 11, 2025 (Testing Admin Functionality)

- Running `yarn build` in `cnc-tools` to test the recent admin section and user management UI implementation.
- Next steps: Manually test admin features with dev servers if build is successful.

---

## (completed) - June 10, 2025 (Admin Section & User Management UI)

- Implemented a two-tiered admin system (Admin and Master Admin) in the frontend and backend.
- Admins (`publicMetadata.isAdmin: true`) have access to general admin tools.
- Master Admin (`publicMetadata.isMaster: true` and specific userId) can manage user roles via the admin UI.
- `/admin` page now includes user management UI for Master Admins, calling backend endpoints `/api/users/list-users` and `/api/users/update-user-role`.
- Navbar shows "Admin" link for users with `isAdmin` or `isMaster`.
- All API calls use `NEXT_PUBLIC_API_URL` from environment variables.
- Clerk metadata (`isAdmin`, `isMaster`) must be set in the Clerk dashboard for correct access control.
- See README.md for details on configuration and usage.

---

## (completed) - June 9, 2025 (Backend Integration Test: Fetch Shipping Items)

- ✅ Successfully tested the integration between `cnc-tools` frontend and `technical-ai` backend for fetching shipping items.
- ✅ Verified `GET /api/shipping/items` endpoint in `technical-ai` returns shipping items from database.
- ✅ Verified `fetchAvailableItems` function in `cnc-tools/app/box-shipping-calculator/page.tsx` correctly fetches data.
- ✅ Confirmed both dev servers running and live data fetching works - shipping items visible in Box Shipping Calculator interface.
- ✅ Environment variable `NEXT_PUBLIC_API_URL=http://localhost:5000` properly configured.
- ✅ API endpoints updated to use `/api/shipping/` prefix instead of `/api/items`.

---

## (completed) - June 9, 2025 (Component Library Deletion)

- Removed all references to the (now deleted) `@deejpotter/component-library`.
- The component library was deprecated and has been removed from the workspace.

---

## (completed) - June 9, 2025 (Clerk.dev Migration)

- Migrated authentication from Auth0/Netlify Identity to Clerk.dev using the official Next.js App Router integration. Deprecated and removed AuthContext.tsx and all legacy auth code. All authentication now uses ClerkProvider, Clerk middleware, and Clerk UI components. All protected API calls use Clerk JWT. All documentation and code tracking updated for Clerk. All tests and build pass.
- Removed all Auth0 and Netlify Identity code and dependencies from the codebase.
- Added ClerkProvider to app/layout.tsx and used Clerk's React components for authentication UI.
- Added middleware.ts with clerkMiddleware for route protection.
- Updated documentation (README.md, CodingConventions.md, docs/CNCToolsDoc.md) to reflect Clerk usage and integration steps.
- Marked as (completed) after all changes and tests passed.

---

## (completed) - June 9, 2025 (API Integration)

- Updating frontend API integration to use Express backend at <http://localhost:5000> via NEXT_PUBLIC_API_URL.
- Ensuring all API calls use the environment variable and include Netlify Identity JWT in Authorization header for protected endpoints.
- Adding/updating comments to clarify code purpose and integration details.
- Updating documentation (README.md, CodingConventions.md) to reflect new integration and conventions.
- Marked as (completed) after all changes and tests passed.

---

## (completed) - June 8, 2025

- (completed) Updated README.md to document Express backend integration, API URL env variable, Netlify Identity, and conventions.
- (completed) Added API integration and environment variable conventions to CodingConventions.md.
- (completed) Refactored ChatInterface.tsx and FileUpload.tsx to use NEXT_PUBLIC_API_URL and include JWT Authorization header for protected endpoints. Added detailed comments explaining integration.
- (in progress) Searched for additional API calls in all app, components, contexts, and utils folders. No other direct API calls found. Ready to test and validate integration.

---

## (completed) - June 9, 2025 (Auth0 Migration)

- Refactoring authentication from Netlify Identity to Auth0 across the entire codebase.
- Removing all server actions and server code from the frontend; all business logic and data access will be handled by the Express backend.
- Updating documentation (README.md, CodingConventions.md) to reflect Auth0 usage and the new frontend/backend split.
- Will mark as (completed) after all changes and tests pass.

---

## (in progress) - June 9, 2025 (Clerk Key Build Failure)

- Netlify build failed due to missing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (publishableKey) for Clerk.dev.
- Solution: Add both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to local `.env` and Netlify environment variables (Site settings > Build & deploy > Environment > Environment variables).
- Documented this requirement in README.md and CodingConventions.md.
- Will mark as (completed) after confirming successful Netlify build and local test/build pass.

---

## (in progress) - June 9, 2025 (Remove custom Auth component, use Clerk UI directly)

- Deprecated and removed the custom Auth component from the navigation. All authentication UI is now handled by Clerk's built-in components (SignInButton, SignUpButton, UserButton, SignedIn, SignedOut) directly in Navbar.tsx.
- Updated Navbar.tsx to remove all references to Auth and use Clerk UI directly.
- Updated README.md and CodingConventions.md to clarify this change and document the new convention.
- Mark as (completed) after tests/build pass and code is reviewed.

---

## (in progress) - June 9, 2025 (Fix build error: remove authProps and Auth references from Navbar.tsx)

- Removed all references to 'authProps' and 'Auth' from components/navbar/Navbar.tsx.
- Updated NavbarProps interface and related comments to clarify that authentication is now handled directly by Clerk components (SignedIn, SignedOut, SignInButton, SignUpButton, UserButton).
- This resolves a build error caused by a missing 'Auth' symbol and documents the migration away from a custom Auth component.

---

## (in progress) - June 9, 2025 (Box Shipping Calculator API Integration)

- Added NEXT_PUBLIC_API_URL to .env for backend API integration.
- Updated all box shipping calculator API calls to use /api/shipping/items and related endpoints to match backend.
- Added/updated detailed comments in API helper functions to clarify integration and endpoint usage.
- Confirmed backend GET /api/shipping/items is available; POST/PUT/DELETE endpoints for items are not yet implemented in backend (future work).
- Next: Test frontend fetching logic, improve error handling, and update documentation after validation.

---

## (in progress) - June 12, 2025 (PDF Processing 404/HTML error handling)

- Added robust error handling to PdfImport.backend.tsx to catch and log non-JSON responses (e.g., HTML error pages from 404s).
- Confirmed backend invoiceRoutes is mounted at /api/invoice and protected by Clerk.
- If you see a 404 and an HTML response, the backend route is missing or the server is not running.

(Older entries below this line)

- (completed) All tests passed after API integration refactor. Integration with Express backend and Netlify Identity JWT is now fully trusted and complete as of June 9, 2025.
