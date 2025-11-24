# Coding conventions

## Overview

This document outlines the coding conventions and best practices for the project. The goal is being able to know where to find files and making code easier to read and understand. I think having explicit conventions is easier than having to guess which style to use each time.

## File structure

📦 cnc-tools
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
│   ├── extrusions-calculator/     # Unified Extrusions Calculator (merged 20 & 40 series)
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

## State Management & Optimistic Updates (January 2025)

### Optimistic UI Pattern

- **Immediate Updates**: Update UI state immediately upon user action for responsive feedback
- **Background Sync**: Perform backend API calls asynchronously to persist changes
- **Error Recovery**: Implement mechanisms to handle and recover from failed backend operations
- **Parent-Child Communication**: Use callback props for state updates between components

### Callback Convention

Use standardized callback props for component communication:

```typescript
interface ComponentProps {
  onItemUpdate?: (updatedItem: ShippingItem) => void;
  onItemDelete?: (itemId: string) => void;
  onItemCreate?: (newItem: ShippingItem) => void;
}
```

### SSR/Client Consistency

To prevent Next.js hydration errors:

- **isMounted Pattern**: Use `useState` and `useEffect` to track mount status:

  ```typescript
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  
  if (!isMounted) {
    return <div>Loading...</div>; // Or appropriate loading state
  }
  ```

- **Deterministic IDs**: Use predictable ID generation (e.g., index-based) instead of time-based IDs
- **Consistent Initial State**: Ensure server and client render the same initial state

### Best Practices

- Test both optimistic updates and actual backend synchronization
- Always provide user feedback for long-running operations
- Use TypeScript for type safety in callback functions
- Document state flow and callback patterns in component comments

## Testing

### Test File Structure

#### File Naming and Location

1. **Unit Tests**: Place unit tests next to the file they're testing with a `.test.ts` or `.test.tsx` suffix
   - Example: `BoxCalculations.ts` → `BoxCalculations.test.ts`

2. **Integration Tests**: Create a `__tests__` folder within the feature directory
   - Example: `app/box-shipping-calculator/__tests__/integration.test.ts`

3. **E2E Tests**: Store in a top-level `e2e` directory (if implemented later)

### Testing Optimistic Updates

When testing components that use optimistic updates:

- Mock API calls to test both success and failure scenarios
- Verify that UI updates immediately upon user action
- Test that failed operations provide appropriate error feedback
- Ensure that state remains consistent after successful operations
- Test callback prop integration between parent and child components

Example test structure:

```typescript
describe('ItemSelectAndCalculate', () => {
  it('should update UI immediately when item is edited', async () => {
    const mockOnItemUpdate = jest.fn();
    render(<ItemSelectAndCalculate onItemUpdate={mockOnItemUpdate} {...props} />);
    
    // Trigger edit action
    // Verify immediate UI update
    // Verify callback was called with correct data
  });
});
```

- Test edge cases thoroughly
- Use table-driven tests for functions with many input/output combinations
- Test error handling

### Test Structure

Use the following structure for your tests:

```typescript
// Import dependencies
import { functionToTest } from './path-to-function';

// Describe block for the component/function
describe('FunctionName or ComponentName', () => {
  // Setup that runs before each test
  beforeEach(() => {
    // Setup code
  });

  // Individual test cases
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

### Running Tests

Use these npm scripts to run tests:

1. `npm test`: Run all tests once
2. `npm run test:watch`: Run tests in watch mode (rerun on file changes)
3. `npm run test:coverage`: Run tests with coverage report

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

## Navigation and Routing

- **Internal navigation:** Always use Next.js's `Link` component (`import Link from "next/link"`) for all internal navigation in shared and feature components. This ensures optimal routing, prefetching, and compatibility with Next.js best practices.
- **Portability:** If you intend to use a component outside of Next.js, replace the `Link` component with your router's link component (e.g., React Router's `Link`).
- **External links:** Use a standard `<a>` tag with `target="_blank"` and `rel="noreferrer"` for external URLs.

## Best practices

1. **TypeScript**: Use proper typing for all components and functions
2. **Error handling**: Include proper error handling for asynchronous operations
3. **Accessibility**: Follow accessibility best practices in UI components
4. **Performance**: Optimize components using React best practices (memoization, etc.)
5. **Testing**: Write tests following the testing conventions outlined above
6. **File Headers**: Include consistent file headers in all files as specified above
7. **Documentation**: Keep README files and inline documentation up to date

## API Integration Conventions (Updated January 2025)

- All frontend API calls for the Box Shipping Calculator use the `NEXT_PUBLIC_API_URL` environment variable.
- **CRUD Endpoints**: Follow RESTful conventions for item management:
  - `GET /api/shipping/items` - Fetch all items
  - `POST /api/shipping/items` - Create new item
  - `PUT /api/shipping/items/:id` - Update existing item
  - `DELETE /api/shipping/items/:id` - Delete item
- **Error Handling**: Always handle both success and failure cases for API calls.
- **Optimistic Updates**: Update UI immediately, sync with backend in background.
- Add detailed comments to API helper functions to clarify endpoint usage and expected responses.

## Environment Variables

- Store API URLs and other secrets in environment variables, never hard-code them.
- For Next.js, use `NEXT_PUBLIC_` prefix for variables that need to be exposed to the browser.
- `NEXT_PUBLIC_API_URL`: This variable should store the base URL for the backend API (e.g., `http://localhost:5000` for local development). It is used by client-side code to make API requests.

## Authentication and Authorization

- User authentication is handled by Clerk.dev.
- Role-based access control in the frontend should utilize the `publicMetadata` field from the Clerk user object.
  - `user.publicMetadata.isAdmin === true` indicates an administrative user.
  - `user.publicMetadata.isMaster === true` (in conjunction with a specific User ID check) indicates a master administrative user with elevated privileges.
- Always use `useUser` and `useAuth` hooks from `@clerk/nextjs` for accessing user information and authentication tokens.

## API Communication

- All frontend API calls for the Box Shipping Calculator use the `NEXT_PUBLIC_API_URL` environment variable.
- Endpoints for item management and box calculations are under `/api/shipping/` (e.g., `/api/shipping/items`).
- Always update the API URL in `.env` if the backend service location changes.
- Add detailed comments to API helper functions to clarify endpoint usage and expected responses.

## Clerk.dev Authentication Conventions (Updated 09/06/2025)

- Use @clerk/nextjs for authentication in the frontend (App Router only).
- Add `middleware.ts` at the project root using `clerkMiddleware()` from `@clerk/nextjs/server`.
- Wrap your app with `ClerkProvider` in `app/layout.tsx`.
- Use Clerk's built-in components: SignInButton, SignUpButton, UserButton, SignedIn, SignedOut directly in your navigation or UI. Do not use a custom Auth component.
- All API calls requiring authentication must include the Clerk JWT in the Authorization header (see Clerk docs for how to get the token).
- Required environment variables: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY.
- Remove all Auth0/Netlify Identity code and variables.
- All protected endpoints in the backend must validate Clerk JWTs.
- All legacy authentication code and references must be removed from the codebase and documentation.

### Admin Roles using publicMetadata

User roles for the admin section are managed using Clerk's `publicMetadata`:

- `isAdmin` (boolean): Grants general admin privileges. Set to `true` for admin users.
- `isMaster` (boolean): Grants master admin privileges (e.g., user management). Set to `true` for master admin users. The master admin role is additionally restricted to a specific user ID (`user_2yFautivzaceEYXXlepE2IMUsEE`) in the application code.

This metadata should be set directly in the Clerk.dev dashboard for the respective users.

## Admin & Role-Based Access Conventions

- Use Clerk's `publicMetadata` for role-based access:
  - `user.publicMetadata.isAdmin === true` for admin access.
  - `user.publicMetadata.isMaster === true` (and specific userId) for master admin access.
- Always check both `isMaster` and userId for master admin features.
- Set these fields in the Clerk dashboard for each user as needed.

## API URL Convention

- All frontend API calls must use the `NEXT_PUBLIC_API_URL` environment variable.
- Never hard-code backend URLs in the codebase.
- Update `.env.local` if the backend location changes.

## Clerk-Protected Backend API Calls

- All frontend fetch/axios calls to backend endpoints protected by Clerk (requireAuth) must include the Clerk JWT in the Authorization header.
- Use `getToken()` from Clerk's `useAuth()` in React components to get the JWT before making the request.
- Always set the header: `Authorization: Bearer <jwt>`.
- Use the `NEXT_PUBLIC_TECHNICAL_AI_API_URL` environment variable to target the backend Express server directly (not through Next.js API routes).
- Example:

```ts
const { getToken } = useAuth();
const jwt = await getToken();
const apiBase = process.env.NEXT_PUBLIC_TECHNICAL_AI_API_URL || "";
const endpoint = apiBase ? `${apiBase}/api/your-endpoint` : "/api/your-endpoint";
fetch(endpoint, {
  method: "POST",
  headers: { Authorization: `Bearer ${jwt}` },
  body: ...
});
```

- See `PdfImport.backend.tsx` for a working example.

- Always check for non-JSON responses in fetch/axios error handling, especially for protected endpoints. See PdfImport.backend.tsx for an example.
