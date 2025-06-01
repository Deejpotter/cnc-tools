/**
 * Canvas Mock
 * Updated: 01/06/2025
 * Author: Deej Potter
 * Description: Mock implementation of the canvas module for testing.
 * Prevents issues with the canvas module during Jest testing.
 */
module.exports = {
  Canvas: jest.fn(() => ({
    getContext: jest.fn(() => ({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({
        data: new Array(4),
      })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => []),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      fillText: jest.fn(),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
      })),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      bezierCurveTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      closePath: jest.fn(),
    })),
    toDataURL: jest.fn(),
    toBuffer: jest.fn(),
    addEventListener: jest.fn(),
    width: 100,
    height: 100,
  })),
  createCanvas: jest.fn(() => ({
    getContext: jest.fn(),
    toDataURL: jest.fn(),
    toBuffer: jest.fn(),
  })),
  Image: jest.fn(() => ({
    onload: jest.fn(),
    src: '',
    width: 100,
    height: 100,
  })),
  ImageData: jest.fn(),
  PNGStream: jest.fn(),
  JPEGStream: jest.fn(),
  PDFStream: jest.fn(),
  registerFont: jest.fn(),
};
