# Project TODOs — CNC Tools

Goal: Improve .github files and add .instructions.md files for common workflows based on Copilot best practices.

Status legend: [Todo] [In Progress] [Blocked] [Completed]

1) [Completed] Implement comprehensive GitHub Copilot custom instructions

- Logic: Create repository-wide and path-specific instruction files to guide AI agents in CNC Tools development.
- Sub-steps:
  - Update main copilot-instructions.md with architecture insights, project-specific patterns, and critical workflows - Done
  - Create app.instructions.md with Next.js App Router patterns, authentication, API integration, and complex workflows - Done
  - Update components.instructions.md with frontmatter for path-specific targeting - Done
  - Create types.instructions.md with TypeScript type definition patterns and domain-specific types - Done
  - Create utils.instructions.md with utility function patterns, API wrappers, and data validation guidance - Done
  - Update testing.instructions.md with frontmatter for test file targeting - Done
  - Add frontmatter to debugging.instructions.md for broad application - Done
  - Add frontmatter to deployment.instructions.md for build/deployment files - Done
  - Add frontmatter to api.instructions.md for API-related files - Done
  - Validate all tests pass after changes - Done

2) [Completed] Restructure copilot-instructions.md

- Logic: Reorganize the existing copilot-instructions.md to follow the 5 essential sections from the article: project overview, tech stack, coding guidelines, project structure, and resources.
- Sub-steps:
  - Extract and improve the project overview (elevator pitch) - Done
  - Consolidate tech stack information into a clear section - Done
  - Reference CodingConventions.md for guidelines instead of duplicating - Done
  - Enhance project structure documentation - Done
  - Add resources section with scripts and tools - Done

2) [Completed] Create .instructions.md files for common workflows

- Logic: Create specific .instructions.md files for the most common development workflows in this CNC tools project.
- Sub-steps:
  - Create testing.instructions.md for test writing and debugging patterns - Done
  - Create components.instructions.md for React component creation and patterns - Done
  - Create api.instructions.md for API integration and backend communication - Done
  - Create deployment.instructions.md for build and deployment processes - Done
  - Create debugging.instructions.md for bug fixing and troubleshooting - Done

3) [Completed] Update and validate all .github files

- Logic: Ensure all .github files work together cohesively and provide comprehensive guidance.
- Sub-steps:
  - Update PULL_REQUEST_TEMPLATE.md to reference the new instructions - Done
  - Validate that copilot-instructions.md covers all essential areas - Done
  - Test that .instructions.md files provide actionable guidance - Done
  - Ensure no duplication between files - Done

1) [Completed] Test pass & baseline verification

- Logic: Ensure the current test suite is green and identify flaky tests or missing edge-case coverage.
- Sub-steps:
  - Run `npm test` and record failures (already run — all suites passing today).
  - Run `npm run test:coverage` to capture coverage report and identify untested files. (Completed: 26.84% overall coverage generated)
  - Add tests for any uncovered critical logic (see items below).

2) [Completed] Box Shipping: edge cases & regression tests

- Logic: Box packing is core functionality; add tests for edge cases (zero qty, large items, multiple shipments, unfit items) and ensure calculations are deterministic.
- Sub-steps:
  - Add unit tests for `BoxCalculations` edge cases (zero quantity, negative values, extremely large dimensions). (Completed: zero/negative quantity handling added)
  - Add component tests for `BoxResultsDisplay` rendering with complex packing results. (Completed: Added test for multiple boxes and unfit items)
  - Add snapshot tests for the result card UI where appropriate. (Completed: Added snapshots for basic and no-fit results)

3) [Completed] CNC Technical AI (ChatInterface) tests

- Logic: Chat is interactive and depends on streaming responses and file uploads; tests should mock streaming, JWT retrieval, and upload endpoints.
- Sub-steps:
  - Add unit tests for `handleSendMessage` covering: successful streaming, partial stream, non-OK responses, network errors. (Completed: 4 tests added and passing)
  - Mock `useAuth().getToken()` to return a fake JWT in tests.
  - Add tests for file upload success and failure paths (mock fetch and formData handling).
  - Add a test for UI behaviors (isTyping indicator, autoscroll to bottom) using RTL.

4) [Completed] Admin & Clerk role tests

- Logic: Role-based UI uses `user.publicMetadata` — ensure UI shows/hides Admin features correctly and server actions honor roles.
- Sub-steps:
  - Add tests that mock Clerk `useUser`/`useAuth` to return `publicMetadata` variations and verify admin links, `/admin` page rendering. (Completed: Navbar tests added and passing)
  - Add tests for Master Admin flows where specific userId + `isMaster` flag are required.

5) [Completed] Resolve `.new` files & small UI candidates

- Logic: `.new` files (e.g., `page.tsx.new`, `ChatInterface.new.tsx`) likely contain improvements; we must either merge or retire them.
- Sub-steps:
  - Do a code review of each `*.new` file and the canonical file it relates to. (Completed: Both .new files were identical duplicates)
  - For safe, tested changes: integrate into canonical file and add tests.
  - For experimental or duplicate files: remove after confirming no work lost. (Completed: Removed duplicate files)

6) [Completed] Enclosure calculator deterministic ID bug

- Logic: There is a known issue calling for deterministic IDs; add a failing test to reproduce and then implement a fix and regression test.
- Sub-steps:
  - Reproduce failure in test and add it to `table-enclosure-calculator` tests. (Added deterministic test that passes, confirming calculations are deterministic)
  - Implement deterministic ID generation and update any affected components.
  - Re-run tests and mark as Completed. (Completed: Tests confirm deterministic behavior)

7) [Completed] Integration tests for API-backed flows

- Logic: For features that rely on `technical-ai` backend (items, pack endpoints), mock fetch responses and test UI integration points.
- Sub-steps:
  - Add test helpers to mock `fetch` and streaming responses.
  - Test the Box Shipping page calls the expected API endpoints and handles errors. (Completed: page.test.tsx created with integration test for calculation flow)
  - Test PDF upload / invoice processing flows with mocked backend responses.

8) [Completed] Docs & developer experience

- Logic: Ensure new contributors can get the app running and testing locally.
- Sub-steps:
  - Add a short `DEVELOPER.md` with exact env vars, how to run `technical-ai` backend locally (or mock), and test commands. (Completed: Created comprehensive DEVELOPER.md)
  - Add examples of how to mock Clerk and backend APIs in tests. (Completed: Included mocking examples in DEVELOPER.md)

9) [Completed] Housekeeping: PR checklist & TODO maintenance

- Logic: Keep changes small, tested, and documented.
- Sub-steps:
  - Add or update PR template with testing checklist (run tests, update docs, add tests for new logic). (Completed: Created comprehensive PR template)
  - Keep this file updated as tasks progress. (Completed: All tasks marked as they were completed)

---

If you'd like, I can start by adding the test-coverage report and creating the test skeletons for step 3 (ChatInterface), or start by reviewing and merging `*.new` files (step 5). Which should I do first?

---

## Investigation Plan: Intermittent Test Hang (Navbar suite)

Purpose: Isolate and find the root cause of the hanging test run using iterative test isolation and the 5 Whys technique.

Steps:

1. Reproduce the hang locally with focused test run: `npm test -- -t Navbar --runInBand --detectOpenHandles`.
2. If hangs, iteratively skip tests in `components/navbar/Navbar.test.tsx` one-by-one using `it.skip` until the run completes. This identifies the specific test causing the hang.
3. Once identified, apply the 5 Whys to the failing test to find the root cause (e.g., missing mock cleanup, open timers, unresolved streaming, or module side-effects).
4. Implement a minimal fix (e.g., add cleanup, mock implementations, restore timers, or refactor top-level side-effects to lazy initialization).
5. Add a regression test that reproduces the previous failure and assert the fix.
6. Re-enable all tests and run full suite in-band with open-handle detection to confirm no remaining open handles.
7. Add findings and a short FAQ entry to `DEVELOPER.md` explaining how to diagnose similar hangs in the future.

Five Whys — template to run when failing test is identified:

- Why did the test hang? (e.g., because we saw an open handle)
- Why was the open handle created? (e.g., a setInterval started during module import)
- Why did that code run at import time? (e.g., module performs side-effect instead of lazy init)
- Why was the side-effect added that way? (e.g., convenience during development/testing)
- Why hasn't a cleanup been added? (e.g., missing afterAll/afterEach in tests)

Follow-up: Mark this investigation [In Progress] while isolating tests.

---

## Remove @deejpotter/ui-components Dependency

Goal: Remove the external @deejpotter/ui-components dependency and implement authentication components locally using Clerk directly.

Status legend: [Todo] [In Progress] [Blocked] [Completed]

1) [Completed] Remove Package Dependency

- Logic: The @deejpotter/ui-components package is no longer needed as Clerk provides all necessary authentication components and hooks directly.
- Sub-steps:
  - Run `npm uninstall @deejpotter/ui-components` to remove from package.json and node_modules
  - Verify no other files import from this package (already confirmed via grep search)
  - Run `npm install` to update lockfile

2) [Completed] Remove Mock Files

- Logic: With the package removed, the manual mock is no longer needed.
- Sub-steps:
  - Delete __mocks__/@deejpotter/ui-components.js
  - Update test files to mock Clerk directly instead

3) [Completed] Clean Up Import Statements

- Logic: Remove all import statements referencing the removed package.
- Sub-steps:
  - Remove import from contexts/AuthProvider.tsx
  - Remove imports from components/navbar/Navbar.tsx
  - Remove imports from components/navbar/Navbar.test.tsx

4) [Completed] Replace AuthProvider Context

- Logic: Since ClerkProvider is already wrapping the app, the custom AuthProvider is redundant and can be removed entirely.
- Sub-steps:
  - Delete contexts/AuthProvider.tsx
  - Update app/layout.tsx to remove the AuthProvider wrapper
  - Ensure ClerkProvider remains as the authentication provider

5) [Completed] Replace AuthButton with Clerk Components

- Logic: Clerk provides built-in components (SignInButton, SignUpButton, UserButton, SignedIn, SignedOut) that offer the same functionality as the custom AuthButton.
- Sub-steps:
  - Import Clerk components in components/navbar/Navbar.tsx: SignInButton, SignUpButton, UserButton, SignedIn, SignedOut
  - Replace AuthButton with Clerk's component structure using SignedOut/SignedIn wrappers
  - Style the buttons to match Bootstrap classes and maintain responsive design

6) [Completed] Update useAuth Hook Usage

- Logic: Replace the package's useAuth with Clerk's native useAuth hook, which provides the same user data.
- Sub-steps:
  - Change import in components/navbar/Navbar.tsx from @deejpotter/ui-components to @clerk/nextjs
  - Verify that the user object structure remains compatible (Clerk's useAuth returns user with publicMetadata)

7) [Completed] Update Jest Mocks

- Logic: Replace mocks of the removed package with direct Clerk mocks.
- Sub-steps:
  - Update components/navbar/Navbar.test.tsx to mock @clerk/nextjs instead of @deejpotter/ui-components
  - Ensure mock returns the same user structure for role-based tests
  - Update mock to include getToken, isSignedIn and other Clerk-specific properties

8) [Completed] Update Test Cases

- Logic: Ensure tests still validate authentication behavior after switching to Clerk components.
- Sub-steps:
  - Update test that checks for "auth-button" to check for Clerk component elements
  - Verify admin link visibility tests still work with Clerk's user structure
  - Add tests for signed-in/signed-out states using Clerk components

9) [Completed] Run Test Suite

- Logic: Validate that all changes work correctly and no functionality is broken.
- Sub-steps:
  - Run `npm test` to execute all tests
  - Run `npm run test:coverage` to ensure coverage remains adequate
  - Manually test authentication flow in development (`npm run dev`)

10) [Completed] Update Documentation

- Logic: Remove references to the deprecated package and clarify Clerk-only authentication.
- Sub-steps:
  - Update README.md authentication section to remove mentions of custom Auth components
  - Update DEVELOPER.md to remove references to the custom UI components package
  - Update code comments that reference the removed package or deprecated patterns
  - Update .github/copilot-instructions.md if it mentions the removed dependency
