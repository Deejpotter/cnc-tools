// --- CNC Tools Testing Conventions ---
// This document outlines the testing conventions and best practices for the CNC Tools project.
//
// Updated: 2025-05-28
// Maintainer: Deej Potter

# Testing Conventions

## Overview

This document outlines the testing conventions and best practices for the CNC Tools project. Following these guidelines will ensure consistency in how we test our code and make it easier for team members to understand and contribute to tests.

## Test File Structure

### File Naming and Location

1. **Unit Tests**: Place unit tests next to the file they're testing with a `.test.ts` or `.test.tsx` suffix
   - Example: `BoxCalculations.ts` → `BoxCalculations.test.ts`
2. **Integration Tests**: Create a `__tests__` folder within the feature directory
   - Example: `app/box-shipping-calculator/__tests__/integration.test.ts`
3. **E2E Tests**: Store in a top-level `e2e` directory (if implemented later)

## Testing Approaches

### Server Actions & API Testing

- Mock external dependencies (databases, third-party services)
- Test both success and error cases
- Verify that returned data matches expected format

### Component Testing

- Focus on component behavior rather than implementation details
- Test user interactions (clicks, form submissions)
- Verify that components render correctly with different props
- Test accessibility where applicable

### Utility Functions Testing

- Test edge cases thoroughly
- Use table-driven tests for functions with many input/output combinations
- Test error handling

## Test Structure

Use the following structure for your tests:

```typescript
// Import dependencies
import { functionToTest } from './path-to-function';

describe('FunctionName or ComponentName', () => {
  beforeEach(() => {
    // Setup code
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test';
    // Act
    const result = functionToTest(input);
    // Assert
    expect(result).toBe('expected output');
  });
});
```

## Mocking

- Use Jest's mocking capabilities for external dependencies
- Create mock data factories for commonly used test data
- Define mocks in a separate file if they're reused across tests

## Coverage Goals

- Aim for at least 80% code coverage for critical business logic
- Focus on meaningful tests rather than hitting coverage numbers
- Always test edge cases and error handling

## Continuous Integration

- Tests will run automatically on pull requests
- Failed tests should block merges to main branches
