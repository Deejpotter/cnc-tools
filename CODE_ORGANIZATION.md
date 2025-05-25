# Code Organization in CNC Tools

## Updated: May 25, 2025

This document outlines the code organization principles in the CNC Tools application.

## API Routes and Client Utilities

The application follows Next.js conventions for separating server-side API routes and client-side utility functions:

### Server-Side API Routes

API routes are located in the `app/api/` directory and follow Next.js App Router conventions:

- **`app/api/data/route.ts`**: Handles data operations (shipping items, user data, sync)
- **`app/api/invoice-processing/route.ts`**: Handles invoice processing operations
- **`app/api/mongodb/route.ts`**: Provides a generic interface for MongoDB operations

These files should only export HTTP handlers (`GET`, `POST`, etc.) following Next.js conventions. They should not export client-side utility functions.

### Client-Side Utility Functions

Client-side utility functions are located in the `utils/` directory:

- **`utils/data-api.ts`**: Client-side functions for interacting with the data API
- **`utils/invoice-api.ts`**: Client-side functions for interacting with the invoice processing API
- **`utils/mongodb-api.ts`**: Client-side functions for interacting with the MongoDB API

These files provide client-side wrappers around the API endpoints and should be imported by client components.

## Shared Code Principles

1. **Separation of Concerns**: Keep server-side and client-side code separate
2. **Clean Imports**: Import from the appropriate location (utils for client-side, services for server-side)
3. **Documentation**: Document the purpose and usage of each file
4. **Compatibility**: Maintain backward compatibility when making changes

## Next.js Limitations

Next.js route handlers have specific limitations:

1. Route files can only export HTTP handlers (GET, POST, PUT, DELETE, etc.)
2. They cannot export non-route handler functions for use in client components
3. Shared code should be placed in separate utility files

## Example Usage

### Client Component

```typescript
// Client component example
import { dataAPI } from "@/utils/data-api";

// Use the client-side utility function
const items = await dataAPI.shippingItems.getAvailable();
```

### Server-Side API Route

```typescript
// Server-side API route
import { NextRequest, NextResponse } from "next/server";
import DataService from "@/utils/data/DataService";

export async function GET(request: NextRequest) {
  const items = await DataService.shippingItems.getAvailable();
  return NextResponse.json(items);
}
```
