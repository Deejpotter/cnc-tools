/**
 * Playwright Configuration for CNC Tools E2E Tests
 * Updated: 25/05/25
 * Author: Deej Potter
 * Description: Configuration for end-to-end testing with Playwright.
 * Separates E2E tests from Jest unit tests for reliable testing.
 */

import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	// Test directory - all E2E tests are in the e2e folder
	testDir: "./e2e",

	// Run tests in files in parallel
	fullyParallel: true,

	// Fail the build on CI if you accidentally left test.only in the source code
	forbidOnly: !!process.env.CI,

	// Retry on CI only - helps with flaky tests in CI environments
	retries: process.env.CI ? 2 : 0,

	// Opt out of parallel tests on CI for more reliable results
	workers: process.env.CI ? 1 : undefined,

	// Reporter to use. See https://playwright.dev/docs/test-reporters
	reporter: "html",

	// Shared settings for all tests
	use: {
		// Base URL to use in actions like `await page.goto('/')`
		baseURL: "http://localhost:3000",

		// Collect trace when retrying the failed test for debugging
		trace: "on-first-retry",

		// Take screenshots when tests fail
		screenshot: "only-on-failure",

		// Record video on failure for debugging
		video: "retain-on-failure",

		// Timeout for each action (e.g., click, fill, etc.)
		actionTimeout: 10000,

		// Timeout for navigation actions
		navigationTimeout: 30000,
	},

	// Test timeout - how long each test can run
	timeout: 60000,

	// Expect timeout - how long to wait for assertions
	expect: {
		timeout: 10000,
	},

	// Configure projects for major browsers
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},

		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},

		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},

		// Uncomment for mobile testing
		/* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */
	],
	// Run local dev server before starting the tests
	// This ensures the app is running for E2E tests
	// Updated to use yarn since that's the package manager for this project
	webServer: {
		command: "yarn dev",
		port: 3000,
		reuseExistingServer: !process.env.CI,
		timeout: 60000,
	},

	// Output directory for test results
	outputDir: "test-results/",

	// Global setup if needed
	// globalSetup: require.resolve('./playwright.global-setup.ts'),
});
