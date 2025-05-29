# Coding conventions

## Overview

This document outlines the coding conventions and best practices for the project. The goal is being able to know where to find files and making code easier to read and understand. I think having explicit conventions is easier than having to guess which style to use each time.

## File structure

cnc-tools
├── app/                      # Main application directory (Next.js App Router)
│   ├── page.tsx              # Home page with tiles for all tools
│   ├── layout.tsx            # Root layout for all pages
│   ├── globals.scss          # Global styles
│   ├── actions/              # Server actions
│   │   ├── chat.ts           # Chat functionality actions
│   │   ├── processInvoice.ts # Invoice processing logic
│   │   └── mongodb/          # MongoDB database operations
│   ├── box-shipping-calculator/  # Box Shipping Calculator tool
│   ├── cnc-calibration-tool/     # CNC Calibration tool
│   ├── cnc-technical-ai/         # AI chatbot for CNC technical questions
│   ├── 20-series-extrusions/     # 20-Series Extrusions calculator
│   ├── 40-series-extrusions/     # 40-Series Extrusions calculator
│   ├── enclosure-calculator/     # Enclosure calculator
│   └── price-difference-tool/    # Price comparison tool
├── components/               # Reusable UI components
│   ├── LayoutContainer.tsx   # Container component for consistent layout
│   ├── Tile.tsx              # Individual tile component for tool cards
│   ├── TileSection.tsx       # Section component to display multiple tiles
│   └── navbar/               # Navigation components
├── contexts/                 # React context providers
│   ├── AuthContext.tsx       # Authentication context
│   └── ItemContext.tsx       # Item management context
├── interfaces/               # TypeScript interfaces
│   └── box-shipping-calculator/  # Interfaces for box shipping calculator
├── public/                   # Static assets
├── styles/                   # Component-specific styles
├── types/                    # TypeScript type definitions
│   ├── hui-types.d.ts        # UI component types
│   ├── navigation.d.ts       # Navigation types
│   └── types.ts              # Common types
├── utils/                    # Utility functions
│   ├── chatStream.ts         # Chat streaming functionality
│   └── navigation.tsx        # Navigation helpers
└── docs/                     # Documentation files

## Naming conventions

### Files and folders

1. **React components**: Use PascalCase for component files (e.g., `ItemAddForm.tsx`, `LayoutContainer.tsx`)
2. **Non-component files**: Use camelCase (e.g., `chatStream.ts`, `processInvoice.ts`)
3. **Folder names**: Use kebab-case for feature folders (e.g., `box-shipping-calculator`, `cnc-technical-ai`)
4. **Special files**: Use the Next.js convention for special files (`page.tsx`, `layout.tsx`)

### TypeScript

1. **Interfaces**: Use PascalCase starting with "I" or descriptive names (e.g., `ShippingItem`, `Dimensions`)
2. **Type definitions**: Store in the `/types` directory with `.d.ts` extension or `types.ts` files
3. **Component Props**: Name as `ComponentNameProps` (e.g., `LayoutContainerProps`)

## Component structure

### Components organization

Components are organized in two main ways:

1. **Shared components**: Located in `/components` folder, reusable across the application
2. **Feature-specific components**: Located within their respective feature folder in `/app`

### Component file structure

1. **Imports**: Group imports by type (React, local, external)
2. **Interface/Type definitions**: Define component props interfaces
3. **Component declaration**: Use functional components with TypeScript typing
4. **Export**: Default export at the end of the file

Example:

```tsx
// Imports
import React, { useState, useEffect } from "react";
import { SomeType } from "@/types/types";

// Interface definition
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

// Component declaration
const Component = ({ prop1, prop2 }: ComponentProps) => {
  // Component logic
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default Component;
```

## Styling conventions

1. **Primary styling**: Bootstrap classes for consistent layout and components
2. **Custom styling**:
   - Global styles in `app/globals.scss`
   - Component-specific styles in `styles/` directory with matching component names
3. **Naming**: Use descriptive class names following Bootstrap conventions when possible

## Documentation

1. **Code comments**: Include descriptive comments for complex logic and component documentation
2. **JSDoc**: Use JSDoc style comments for functions and components
3. **Documentation files**: Maintain documentation in `/docs` folder

## Mini-app structure

Each mini-app in the `/app` directory should follow this structure:

1. **page.tsx**: Main entry point for the feature
2. **Component files**: Feature-specific components with PascalCase naming
3. **Utility files**: Feature-specific utilities with camelCase naming

## State management

1. **Local state**: Use React hooks (`useState`, `useReducer`) for component-local state
2. **Shared state**: Use context providers in `/contexts` folder
3. **Data fetching**: Use server actions in `/app/actions` for data operations

## Testing Conventions

### Testing Overview

This document outlines the testing conventions and best practices for the CNC Tools project. Following these guidelines will ensure consistency in how we test our code and make it easier for team members to understand and contribute to tests.

### Test File Structure

#### File Naming and Location

1. **Unit Tests**: Place unit tests next to the file they're testing with a `.test.ts` or `.test.tsx` suffix
   - Example: `BoxCalculations.ts` → `BoxCalculations.test.ts`
2. **Integration Tests**: Create a `__tests__` folder within the feature directory
   - Example: `app/box-shipping-calculator/__tests__/integration.test.ts`
3. **E2E Tests**: Store in a top-level `e2e` directory (if implemented later)

### Testing Approaches

#### Server Actions & API Testing

- Mock external dependencies (databases, third-party services)
- Test both success and error cases
- Verify that returned data matches expected format

#### Component Testing

- Focus on component behavior rather than implementation details
- Test user interactions (clicks, form submissions)
- Verify that components render correctly with different props
- Test accessibility where applicable

#### Utility Functions Testing

- Test edge cases thoroughly
- Use table-driven tests for functions with many input/output combinations
- Test error handling

### Test Structure

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

### Mocking

- Use Jest's mocking capabilities for external dependencies
- Create mock data factories for commonly used test data
- Define mocks in a separate file if they're reused across tests

### Coverage Goals

- Aim for at least 80% code coverage for critical business logic
- Focus on meaningful tests rather than hitting coverage numbers
- Always test edge cases and error handling

### Continuous Integration

- Tests will run automatically on pull requests
- Failed tests should block merges to main branches

## File Headers

Every file should include a consistent header comment with the following format:

```typescript
/**
 * [File Name]
 * Updated: [Date in DD/MM/YYYY format]
 * Author: [Author Name]
 * Description: [Brief description of the file's purpose]
 * [Optional additional details about implementation]
 */
```

Example:

```typescript
/**
 * BoxCalculations
 * Updated: 13/05/2025
 * Author: Deej Potter
 * Description: Helper functions for calculating the best box size for shipping items.
 * Implements the Extreme Point-based 3D bin packing algorithm for optimal packing.
 */
```

## Best practices

1. **TypeScript**: Use proper typing for all components and functions
2. **Error handling**: Include proper error handling for asynchronous operations
3. **Accessibility**: Follow accessibility best practices in UI components
4. **Performance**: Optimize components using React best practices (memoization, etc.)
5. **Testing**: Write tests following the testing conventions outlined above
6. **File Headers**: Include consistent file headers in all files as specified above
7. **Documentation**: Keep README files and inline documentation up to date
