# Testing the FileUpload Component

The FileUpload component is a complex component that handles file selection, drag and drop, validation, and file processing. This document provides guidance on how to properly test this component.

## Mock Setup

The FileUpload component relies on the `useFileUpload` hook, which we mock in tests to:

1. Avoid dealing with actual file operations
2. Control the state of the component for testing
3. Simulate different scenarios like loading, errors, etc.

## Test Cases

When testing the FileUpload component, ensure you cover:

### 1. Rendering with different props

- Default props
- Custom messages
- With/without file type restrictions
- With/without file information display
- Light/dark theme

### 2. State handling

- Loading state
- Error state
- Drag active state
- File information display

### 3. Event handling

- File selection
- File drop
- Custom file processing

## Example Test

```tsx
// Import the configureMock utility
import { configureMock } from './useFileUpload.mock';

test('displays loading message when isLoading is true', () => {
  // Configure the mock for loading state
  configureMock({
    isLoading: true
  });
  
  const loadingMessage = 'Processing your files...';
  render(<FileUpload loadingMessage={loadingMessage} />);
  
  expect(screen.getByText(loadingMessage)).toBeInTheDocument();
});
```

## Integration Testing

When testing components that use FileUpload:

1. Mock the FileUpload component to avoid its complexity
2. Focus on how your component interacts with FileUpload
3. Test the handling of file upload completion events

Example mock for integration tests:

```tsx
jest.mock('../shared/FileUpload', () => {
  return jest.fn(props => (
    <div data-testid="mock-file-upload">
      <button 
        data-testid="trigger-upload-complete" 
        onClick={() => props.onProcessingComplete?.({ success: true })}
      >
        Simulate Upload Complete
      </button>
    </div>
  ));
});
```
