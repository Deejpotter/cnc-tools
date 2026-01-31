# CNC Tools Developer Guide

This guide helps new contributors get the CNC Tools app running and testing locally.

## Prerequisites

- Node.js 18+ and npm
- Git

## Environment Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd cnc-tools
npm install
```

**Note:** This project no longer requires `NODE_AUTH_TOKEN` or GitHub package registry authentication. The `.npmrc` file has been removed as the `@deejpotter/ui-components` dependency was replaced with local Clerk implementations.

### 2. Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Clerk Authentication (required for admin features)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Technical AI Backend (optional - can use mocks for development)
NEXT_PUBLIC_API_URL=http://localhost:5000

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Clerk Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Copy the publishable key and secret key to your `.env.local`
3. Configure Clerk to allow sign-ups and set up user metadata for admin roles

### 4. Technical AI Backend (Optional)

The app integrates with a Python backend for AI features. For development:

**Option A: Run the real backend**

```bash
# Clone and setup the technical-ai backend
git clone <backend-repo-url>
cd technical-ai
pip install -r requirements.txt
python app.py  # Runs on localhost:5000
```

**Option B: Use mocks (recommended for frontend-only development)**

- Tests already use mocks for the backend
- The app gracefully handles missing backend by falling back to local calculations

## Development Workflow

### Running the App

```bash
# Development server
npm run dev

# Production build
npm run build
npm start

# Netlify build (for deployment)
npm run netlify:build
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=BoxCalculations.test.ts

# Run tests with verbose output and open handle detection
npm test -- --detectOpenHandles --verbose
```

### Linting

```bash
npm run lint
```

## Architecture Overview

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Bootstrap 5, custom SCSS
- **Authentication**: Clerk
- **Backend Integration**: REST API to Python backend
- **Testing**: Jest, React Testing Library
- **Deployment**: Netlify (static/SSR)

### Key Directories

- `app/` - Next.js app router pages and API routes
- `components/` - Reusable React components
- `types/` - TypeScript type definitions
- `utils/` - Utility functions
- `contexts/` - React contexts for state management

### Core Features

1. **Box Shipping Calculator** - Calculates optimal box packing for items
2. **CNC Technical AI** - AI-powered CNC machining assistance
3. **Admin Panel** - User management and system administration
4. **Invoice Processing** - PDF/text invoice parsing and item extraction

## Testing Patterns

### Mocking Clerk Authentication

```typescript
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      publicMetadata: { role: 'admin' }
    }
  }),
  useAuth: () => ({
    getToken: jest.fn().mockResolvedValue('fake-jwt-token')
  })
}));
```

### Mocking Fetch API

```typescript
// In test setup or individual tests
global.fetch = jest.fn();

// Mock a specific response
(global.fetch as jest.Mock).mockResolvedValueOnce({
  ok: true,
  json: () => Promise.resolve({ success: true, data: mockData })
});
```

### Mocking Components

```typescript
jest.mock('./ChildComponent', () => () => <div data-testid="mocked-component">Mocked</div>);
```

## Common Issues

### Test Hangs

If tests hang with `--detectOpenHandles`:

1. Check for unclosed timers: `setTimeout`, `setInterval`
2. Ensure mocks are properly cleaned up in `afterEach`
3. Look for open streams or connections
4. Use `jest.useFakeTimers()` for timer-dependent code

### Authentication Issues

- Ensure Clerk keys are correct in `.env.local`
- Check that user metadata includes required fields for admin access
- Verify middleware.ts allows the correct routes

### Backend Integration

- Backend endpoints return `{ success: boolean, data?: any, error?: string }`
- Frontend handles both success and error responses
- Fallback to local calculations when backend is unavailable

## Contributing

1. Create a feature branch from `main`
2. Write tests for new functionality
3. Ensure all tests pass: `npm test`
4. Run linting: `npm run lint`
5. Test production build: `npm run build`
6. Submit a PR with a clear description

## Deployment

The app deploys to Netlify with the following build settings:

- Build command: `npm run netlify:build`
- Publish directory: `out`
- Environment variables: Same as `.env.local`

For more details, see `netlify.toml`.</content>
<parameter name="filePath">c:\Users\Deej\Repos\cnc-tools\DEVELOPER.md
