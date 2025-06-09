<!--
 * codeupdates.md
 * Updated: 09/06/2025
 * Author: Deej Potter
 * Description: Log of all major codebase changes, especially authentication and API integration migrations. Used by AI agents and developers to track progress and ensure all changes are tested and documented.
 Delete completed entries to keep the log current. Keep the last 5 entries for reference.
-->
# Code Updates Log

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

(Older entries below this line)

- (completed) All tests passed after API integration refactor. Integration with Express backend and Netlify Identity JWT is now fully trusted and complete as of June 9, 2025.
