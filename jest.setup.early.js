// jest.setup.early.js
// This file runs before JSDOM initializes to prevent canvas module loading

// Intercept module loading to prevent canvas from being loaded
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id) {
  // Prevent any canvas-related module loading
  if (id === 'canvas' ||
    id.includes('canvas.node') ||
    id.includes('build/Release/canvas') ||
    id.includes('/canvas/') ||
    id.endsWith('.node')) {
    // Return a mock canvas object
    return {
      Canvas: function () { return {}; },
      createCanvas: function () { return {}; },
      Image: function () { return {}; },
      ImageData: function () { return {}; },
      registerFont: function () { },
    };
  }
  return originalRequire.apply(this, arguments);
};

// Mock canvas at Jest level
jest.mock('canvas', () => ({
  Canvas: jest.fn(() => ({})),
  createCanvas: jest.fn(() => ({})),
  Image: jest.fn(() => ({})),
  ImageData: jest.fn(),
  registerFont: jest.fn(),
}), { virtual: true });

// Mock all possible canvas.node paths
jest.mock('canvas/build/Release/canvas.node', () => ({}), { virtual: true });
jest.mock('../build/Release/canvas.node', () => ({}), { virtual: true });
jest.mock('./build/Release/canvas.node', () => ({}), { virtual: true });
