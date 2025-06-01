# Testing Shared Components

This directory contains tests for the shared component library. The tests use Jest and React Testing Library to validate component functionality.

## Testing Approach

### Component Testing

We follow these principles when testing components:

1. **Focus on behavior, not implementation details**
   - Test what the user sees and interacts with
   - Avoid testing internal state or methods directly

2. **Test component variations**
   - Test different prop combinations
   - Verify conditional rendering works correctly
   - Check that styling classes are applied properly

3. **Use meaningful assertions**
   - Write assertions that verify important functionality
   - Use screen queries that match how users find elements

## Running Tests

To run tests for the shared components:

```bash
# Run all shared component tests
npm test -- components/shared

# Run tests for a specific component
npm test -- components/shared/__tests__/FileUpload.test.tsx

# Run tests in watch mode
npm test -- --watch components/shared
```

## Mocking

### useFileUpload Hook

The FileUpload component depends on the `useFileUpload` hook. We mock this hook using:

```typescript
import { useFileUploadMock, configureMock, resetMock } from './useFileUpload.mock';

// In test setup
jest.mock('../hooks/useFileUpload', () => ({
  useFileUpload: jest.fn(props => useFileUploadMock(props))
}));

// Before each test
beforeEach(() => {
  resetMock();
});

// Configure for specific test cases
test('some test', () => {
  configureMock({ 
    isLoading: true,
    // other properties to override
  });
  
  // rest of the test
});
```

## Test Utilities

The `test-utils.ts` file provides helper functions for testing:

- `render()`: Custom render function that can include providers
- `createMockFile()`: Creates a mock File object for testing file uploads
- `createMockFileList()`: Creates a mock FileList for testing file inputs

## Known Issues

If you encounter issues with the canvas module when running tests:

1. Tests skip canvas-dependent functionality
2. If needed, you can mock the canvas module by adding a mock file in `__mocks__/canvas.js`

## Adding New Tests

When adding tests for new components:

1. Create a new test file named `ComponentName.test.tsx`
2. Import the component and testing utilities
3. Write test cases for core functionality and variations
4. If the component has complex dependencies, add appropriate mocks

Follow the existing test patterns for consistency.
