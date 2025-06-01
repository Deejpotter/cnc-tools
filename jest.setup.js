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

// Mock browser APIs not available in Jest's JSDOM environment
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock Next.js hooks and components where needed
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('canvas', () => require('./__mocks__/canvas.js'));

// Mock canvas-related JSDOM functionality
if (typeof window !== 'undefined' && window.HTMLCanvasElement) {
  Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
    value: jest.fn(() => ({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({ data: new Array(4) })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => []),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      arc: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      translate: jest.fn(),
      clip: jest.fn(),
      quadraticCurveTo: jest.fn(),
      bezierCurveTo: jest.fn(),
    })),
  });
}