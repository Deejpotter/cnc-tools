# CNC Tools — Current Plan & Progress

Date: 2025-11-24
Branch: `data/clean-extrusions` (work in progress)

This file records the current assessment of the `app/` feature folders, the planned next steps, and lightweight effort estimates.

Per-app completion summary:

20-series-extrusions: The folder contains the algorithm module `cutOptimizer.ts`, multiple UI components (`CutPatternVisualization.tsx`, `CutRequirementsTable.tsx`, `ResultsDisplay.tsx`, `StockItemsTable.tsx`), styles, and a `page.tsx` with a `page.old.tsx` present. This feature is functionally implemented but lacks dedicated unit tests for the algorithm module. Estimated effort to reach "complete" (page, tests, README): small.

40-series-extrusions: The folder currently contains `page.tsx` and `page.tsx.new`, indicating an in-progress refactor. There is no separate algorithm module or tests in this folder. Estimated effort to reach working feature: small to medium depending on whether algorithm logic is needed here.

box-shipping-calculator: This folder contains the algorithm `BoxCalculations.ts`, multiple tests (`BoxCalculations.test.ts`, `BoxCalculationsTest.js`, `BoxResultsDisplay.test.tsx`), UI components, a `page.tsx`, and a `README.md`. This is one of the most complete apps. Estimated effort for polish or bugfixes: small.

cnc-calibration-tool: The folder contains UI components and a test `StepsPerMmSection.test.tsx`, indicating implemented UI and some tests. Estimated effort for completion or additional coverage: small.

cnc-technical-ai: The feature contains `ChatInterface.tsx`, `ChatInterface.new.tsx`, conversation/message components, and file upload component; there are no unit tests in this folder. The repo includes `ai` and `openai` deps which align with the feature. Estimated effort to add test coverage and docs: small to medium.

price-difference-tool: The folder only contains `page.tsx`. This is a scaffolded feature with no tests, components, or README. Estimated effort to reach minimal working feature: medium.

table-enclosure-calculator: The folder contains `calcUtils.ts`, `calcUtils.test.ts`, components, page tests, and `README.md`. This appears well implemented. Estimated effort for polish: small.

whoami: The folder contains `page.tsx` and `page.test.tsx`, indicating a simple tested feature. Estimated effort: small.

Planned next steps (high-level):

1. Add or improve unit tests for algorithm modules that lack coverage, starting with `app/20-series-extrusions` and `app/cnc-technical-ai`.
2. Add minimal README stubs where missing, starting with `app/40-series-extrusions` and `app/price-difference-tool`.
3. Triage any failing tests across the repository and fix small issues discovered by running the test suite.
4. For the `40-series-extrusions` and `price-difference-tool` folders, decide whether they need algorithm modules or are purely UI pages; implement accordingly.
5. Implement merged UI page at `app/extrusions-calculator/page.tsx` that uses `calculateStockUsage` and renders invoice, costs, and warehouse instructions. (IN PROGRESS)
6. Add additional tests for `calculateStockUsage` edge cases and integrate with existing UI components for visualization.

Branching and implementation scope: I will prepare changes on a short-lived feature branch unless you prefer direct edits on `dev`.

Quick commands to run locally:

```fish
npm install
npm run dev
npm run test
npm run test:coverage
```

Please confirm whether you want me to proceed with the planned next steps, and whether you prefer me to create changes on a feature branch or directly on `dev`. If you want me to start with a specific app, tell me which one to prioritize.
