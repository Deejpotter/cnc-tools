/**
 * Jest configuration for backend testing
 * Updated: 25/05/25
 * Author: Deej Potter
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('../jest.config.base'); // CommonJS require for Jest config compatibility

module.exports = {
  ...baseConfig,
  roots: ['<rootDir>/src'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!**/node_modules/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  verbose: true,
};
