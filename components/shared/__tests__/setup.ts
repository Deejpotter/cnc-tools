/**
 * Test Setup for Shared Components
 * Updated: 01/06/2025
 * Author: Deej Potter
 * Description: Setup file for testing shared components
 */

// Mock the canvas module to avoid issues with JSDOM
jest.mock("canvas", () => {
	return {
		// Add any canvas methods needed by tests
	};
});

// Setup global mocks for browser APIs not available in JSDOM
global.ResizeObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
}));

// Mock any other problematic browser APIs
window.matchMedia =
	window.matchMedia ||
	function () {
		return {
			matches: false,
			addListener: jest.fn(),
			removeListener: jest.fn(),
		};
	};
