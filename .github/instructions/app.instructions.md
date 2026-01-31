---
applyTo: "app/**/*.ts,app/**/*.tsx"
---

# App Directory Instructions

This file provides guidance for working with Next.js App Router components and pages in the CNC Tools application.

## Next.js App Router Patterns

### Page Components (`page.tsx`)

- Use `"use client"` directive for client-side interactivity
- Follow the pattern: data fetching → state management → UI rendering
- Handle loading states and error boundaries appropriately

```typescript
// app/box-shipping-calculator/page.tsx
"use client";

import { useState, useEffect } from "react";
import { fetchAvailableItems } from "./api";

export default function BoxShippingCalculatorPage() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadItems();
	}, []);

	const loadItems = async () => {
		try {
			const data = await fetchAvailableItems();
			setItems(data);
		} catch (error) {
			console.error("Failed to load items:", error);
		} finally {
			setLoading(false);
		}
	};

	// Component JSX
}
```

### API Route Handlers (`route.ts`)

- Use consistent response format: `{ success: boolean, data?: any, error?: string }`
- Include proper error handling and status codes
- Validate input data using Zod schemas

```typescript
// app/api/shipping/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ItemSchema = z.object({
	name: z.string().min(1),
	weight: z.number().positive(),
	dimensions: z.object({
		length: z.number().positive(),
		width: z.number().positive(),
		height: z.number().positive(),
	}),
});

export async function GET() {
	try {
		const items = await getItemsFromDatabase();
		return NextResponse.json({ success: true, data: items });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: "Failed to fetch items" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validatedData = ItemSchema.parse(body);
		const newItem = await createItem(validatedData);

		return NextResponse.json({ success: true, data: newItem }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ success: false, error: "Invalid input data" },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ success: false, error: "Failed to create item" },
			{ status: 500 }
		);
	}
}
```

## Authentication & Authorization

### Clerk Integration

- Use `useAuth()` hook for client-side authentication state
- Check `user.publicMetadata.isAdmin/isMaster` for role-based features
- Handle authentication errors gracefully

```typescript
// Client-side auth check
import { useAuth } from "@clerk/nextjs";

export default function AdminPanel() {
	const { user, isLoaded } = useAuth();

	if (!isLoaded) return <div>Loading...</div>;
	if (!user?.publicMetadata?.isAdmin) {
		return <div>Access denied</div>;
	}

	return <div>Admin content</div>;
}
```

### API Route Protection

- Use `auth()` from Clerk server-side for API protection
- Return appropriate HTTP status codes for auth failures

```typescript
// app/api/admin/users/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
	const { userId } = auth();

	if (!userId) {
		return NextResponse.json(
			{ success: false, error: "Unauthorized" },
			{ status: 401 }
		);
	}

	// Check admin permissions
	const user = await getUser(userId);
	if (!user?.publicMetadata?.isMaster) {
		return NextResponse.json(
			{ success: false, error: "Insufficient permissions" },
			{ status: 403 }
		);
	}

	const users = await getAllUsers();
	return NextResponse.json({ success: true, data: users });
}
```

## External API Integration

### Backend Service Calls

- Use `process.env.NEXT_PUBLIC_API_URL` for external backend
- Handle network errors and timeouts appropriately
- Implement retry logic for transient failures

```typescript
// API integration pattern
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function callBackendAPI(endpoint: string, options?: RequestInit) {
	const url = `${API_URL}${endpoint}`;

	try {
		const response = await fetch(url, {
			headers: {
				"Content-Type": "application/json",
				...options?.headers,
			},
			...options,
		});

		if (!response.ok) {
			throw new Error(`API call failed: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`API call to ${endpoint} failed:`, error);
		throw error;
	}
}
```

## Complex Workflows

### Invoice Processing

- Break PDF processing into chunked operations
- Update UI state at each step for responsiveness
- Handle partial failures gracefully

```typescript
// Chunked invoice processing
export async function processInvoice(
	file: File,
	onProgress: (step: string) => void
) {
	try {
		onProgress("Uploading file...");
		const uploadResult = await uploadFile(file);

		onProgress("Extracting text...");
		const textResult = await extractText(uploadResult.id);

		onProgress("Parsing items...");
		const items = await parseItems(textResult.text);

		onProgress("Saving to database...");
		await saveItems(items);

		onProgress("Complete!");
		return { success: true, items };
	} catch (error) {
		return { success: false, error: error.message };
	}
}
```

### AI Chat Streaming

- Handle streaming responses from OpenAI
- Update UI in real-time as chunks arrive
- Manage conversation state and persistence

```typescript
// Streaming chat response
export async function streamChatResponse(
	messages: ChatMessage[],
	onChunk: (chunk: string) => void
) {
	const response = await fetch("/api/chat", {
		method: "POST",
		body: JSON.stringify({ messages }),
	});

	const reader = response.body?.getReader();
	if (!reader) throw new Error("No response stream");

	const decoder = new TextDecoder();
	let fullResponse = "";

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		const chunk = decoder.decode(value);
		fullResponse += chunk;
		onChunk(chunk);
	}

	return fullResponse;
}
```

## State Management

### Optimistic Updates

- Update UI immediately, then sync with backend
- Handle conflicts and rollback on failure
- Provide user feedback for all states

```typescript
// Optimistic UI pattern
export function useOptimisticItemUpdate() {
	const [items, setItems] = useState([]);

	const updateItem = async (itemId: string, updates: Partial<Item>) => {
		// Optimistic update
		setItems((prev) =>
			prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
		);

		try {
			await apiUpdateItem(itemId, updates);
		} catch (error) {
			// Rollback on failure
			setItems((prev) =>
				prev.map((item) => (item.id === itemId ? originalItem : item))
			);
			throw error;
		}
	};

	return { items, updateItem };
}
```

## Error Handling

### User-Friendly Error Messages

- Translate technical errors to user-understandable messages
- Provide actionable recovery steps
- Log detailed errors for debugging

```typescript
// Error handling pattern
export function handleApiError(error: any): string {
	if (error.message?.includes("network")) {
		return "Connection failed. Please check your internet and try again.";
	}

	if (error.status === 401) {
		return "Please log in to continue.";
	}

	if (error.status === 403) {
		return "You don't have permission to perform this action.";
	}

	// Log technical details
	console.error("API Error:", error);

	return "Something went wrong. Please try again or contact support.";
}
```

## Testing App Components

### Mock External Dependencies

- Mock API calls and Clerk authentication
- Test loading states and error conditions
- Verify optimistic updates work correctly

````typescript
// Component testing with mocks
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockFetchOnce } from "@/test/testUtils";

jest.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ user: { id: "test-user" } }),
}));

describe("BoxShippingCalculatorPage", () => {
  it("loads and displays items", async () => {
    mockFetchOnce({ success: true, data: [{ id: 1, name: "Test Item" }] });

    render(<BoxShippingCalculatorPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Item")).toBeInTheDocument();
    });
  });
});
```</content>
<parameter name="filePath">c:\Users\Deej\Repos\cnc-tools\.github\instructions\app.instructions.md
````
