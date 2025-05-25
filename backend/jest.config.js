/**
 * Jest configuration for backend testing
 * Updated: 25/05/25
 * Author: Deej Potter
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!**/node_modules/**',
  ],
  verbose: true,
  // Handle path separators consistently on Windows
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
