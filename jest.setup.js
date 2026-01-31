// jest.setup.js

// Import Jest DOM library to extend Jest matchers with DOM-specific assertions.
// This is useful for testing React components and other DOM manipulations.
import '@testing-library/jest-dom';

// Polyfill for TextEncoder and TextDecoder:
// The JSDOM test environment used by Jest doesn't always include implementations for
// TextEncoder and TextDecoder, which are standard Web APIs.
// Some libraries, like 'whatwg-url' (a dependency used by the MongoDB driver in your project),
// rely on these being globally available.
// To fix 'ReferenceError: TextEncoder is not defined' during tests,
// we import these utilities from Node.js's 'util' module and assign them to the global scope.
// This makes them accessible to all test files and the modules they import.
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// JSDOM does not implement scrollIntoView in some environments; add a noop to avoid test errors
if (typeof global.HTMLElement !== 'undefined' && !global.HTMLElement.prototype.scrollIntoView) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  global.HTMLElement.prototype.scrollIntoView = function () { };
}

// Additional global Jest setup can be placed below.
// For example, you might add:
// - Custom Jest matchers for more specific assertions.
// - Mocks for browser APIs like 'fetch' or 'localStorage' if not handled by JSDOM.
// - Any other configuration or setup that needs to run once before your test suites.