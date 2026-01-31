---
applyTo: "app/api/**/*.ts,app/api/**/*.js,utils/api.ts,utils/auth.ts"
---

# API Integration Instructions

This file provides guidance for implementing API integrations in the CNC Tools project.

## API Architecture

### Next.js API Routes

- Located in `app/api/` directory
- Follow RESTful conventions
- Use TypeScript for type safety
- Include proper error handling

```typescript
// app/api/shipping/items/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const items = await getItemsFromDatabase();

		return NextResponse.json({
			success: true,
			data: items,
		});
	} catch (error) {
		console.error("Failed to fetch items:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch items" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const newItem = await createItem(body);

		return NextResponse.json(
			{
				success: true,
				data: newItem,
			},
			{ status: 201 }
		);
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: "Failed to create item" },
			{ status: 400 }
		);
	}
}
```

## Client-Side API Calls

### Fetch Wrapper Pattern

```typescript
// utils/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}

export async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		});

		const data = await response.json();

		if (!response.ok) {
			return {
				success: false,
				error: data.error || `HTTP ${response.status}`,
			};
		}

		return {
			success: true,
			data,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Network error",
		};
	}
}
```

### Usage in Components

```typescript
// components/ItemList.tsx
import { useState, useEffect } from "react";
import { apiRequest } from "@/utils/api";

export default function ItemList() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadItems();
	}, []);

	const loadItems = async () => {
		setLoading(true);
		const response = await apiRequest("/api/shipping/items");

		if (response.success) {
			setItems(response.data);
			setError(null);
		} else {
			setError(response.error);
		}

		setLoading(false);
	};

	const addItem = async (itemData: any) => {
		const response = await apiRequest("/api/shipping/items", {
			method: "POST",
			body: JSON.stringify(itemData),
		});

		if (response.success) {
			await loadItems(); // Refresh list
		} else {
			setError(response.error);
		}
	};

	// Component JSX
}
```

## Authentication & Authorization

### Clerk Integration

```typescript
// app/api/protected-route/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
	const { userId } = auth();

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Proceed with authenticated request
	const data = await getUserData(userId);
	return NextResponse.json({ data });
}
```

### Client-Side Auth

```typescript
// utils/auth.ts
import { useAuth } from "@clerk/nextjs";

export function useAuthenticatedRequest() {
	const { getToken } = useAuth();

	return async (endpoint: string, options: RequestInit = {}) => {
		const token = await getToken();

		return apiRequest(endpoint, {
			...options,
			headers: {
				...options.headers,
				Authorization: `Bearer ${token}`,
			},
		});
	};
}
```

## Error Handling

### Consistent Error Responses

```typescript
// types/api.ts
export interface ApiError {
	code: string;
	message: string;
	details?: any;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: ApiError;
}

// API route error handling
export function handleApiError(error: unknown): NextResponse {
	console.error("API Error:", error);

	if (error instanceof ValidationError) {
		return NextResponse.json(
			{
				success: false,
				error: {
					code: "VALIDATION_ERROR",
					message: "Invalid input data",
					details: error.details,
				},
			},
			{ status: 400 }
		);
	}

	return NextResponse.json(
		{
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message: "An unexpected error occurred",
			},
		},
		{ status: 500 }
	);
}
```

### Client Error Handling

```typescript
// hooks/useApi.ts
import { useState } from "react";

export function useApi<T>() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<ApiError | null>(null);

	const execute = async (
		apiCall: () => Promise<ApiResponse<T>>
	): Promise<T | null> => {
		setLoading(true);
		setError(null);

		try {
			const response = await apiCall();

			if (!response.success) {
				setError(
					response.error || { code: "UNKNOWN", message: "Unknown error" }
				);
				return null;
			}

			return response.data || null;
		} catch (err) {
			setError({
				code: "NETWORK_ERROR",
				message: "Network request failed",
			});
			return null;
		} finally {
			setLoading(false);
		}
	};

	return { execute, loading, error };
}
```

## Data Validation

### Server-Side Validation

```typescript
// utils/validation.ts
import { z } from "zod";

const ItemSchema = z.object({
	name: z.string().min(1, "Name is required"),
	weight: z.number().positive("Weight must be positive"),
	dimensions: z.object({
		length: z.number().positive(),
		width: z.number().positive(),
		height: z.number().positive(),
	}),
});

export type ValidatedItem = z.infer<typeof ItemSchema>;

export function validateItem(data: unknown): ValidatedItem {
	return ItemSchema.parse(data);
}

// API route usage
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validatedItem = validateItem(body);

		// Proceed with validated data
		const result = await createItem(validatedItem);
		return NextResponse.json({ success: true, data: result });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					error: "Validation failed",
					details: error.errors,
				},
				{ status: 400 }
			);
		}

		return handleApiError(error);
	}
}
```

## File Upload Handling

### Multipart Form Data

```typescript
// app/api/upload/route.ts
export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json(
				{ success: false, error: "No file provided" },
				{ status: 400 }
			);
		}

		// Process file (save to disk, cloud storage, etc.)
		const result = await processFile(file);

		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (error) {
		return handleApiError(error);
	}
}
```

### Client-Side Upload

```typescript
// components/FileUpload.tsx
export default function FileUpload({
	onUpload,
}: {
	onUpload: (result: any) => void;
}) {
	const [uploading, setUploading] = useState(false);

	const handleFileSelect = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setUploading(true);
		const formData = new FormData();
		formData.append("file", file);

		const response = await apiRequest("/api/upload", {
			method: "POST",
			body: formData,
			// Don't set Content-Type header - let browser set it with boundary
		});

		setUploading(false);

		if (response.success) {
			onUpload(response.data);
		} else {
			// Handle error
		}
	};

	return (
		<input
			type="file"
			onChange={handleFileSelect}
			disabled={uploading}
			accept=".pdf,.txt"
		/>
	);
}
```

## Caching & Performance

### Response Caching

```typescript
// app/api/items/route.ts
export async function GET() {
	const items = await getItemsFromCacheOrDatabase();

	return NextResponse.json(
		{ success: true, data: items },
		{
			headers: {
				"Cache-Control": "public, s-maxage=300", // Cache for 5 minutes
			},
		}
	);
}
```

### Client-Side Caching

```typescript
// hooks/useItems.ts
import { useState, useEffect } from "react";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useItems() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const cached = localStorage.getItem("items_cache");
		const cacheTime = localStorage.getItem("items_cache_time");

		if (cached && cacheTime) {
			const age = Date.now() - parseInt(cacheTime);
			if (age < CACHE_DURATION) {
				setItems(JSON.parse(cached));
				setLoading(false);
				return;
			}
		}

		// Fetch fresh data
		loadItems();
	}, []);

	const loadItems = async () => {
		const response = await apiRequest("/api/items");
		if (response.success) {
			setItems(response.data);
			localStorage.setItem("items_cache", JSON.stringify(response.data));
			localStorage.setItem("items_cache_time", Date.now().toString());
		}
		setLoading(false);
	};

	return { items, loading, refetch: loadItems };
}
```

## Testing API Integrations

### Mocking API Calls

```typescript
// __mocks__/api.ts
export const mockApiRequest = jest.fn();

jest.mock("@/utils/api", () => ({
	apiRequest: mockApiRequest,
}));

// Test usage
import { apiRequest } from "@/utils/api";

describe("ItemList", () => {
	it("should load items on mount", async () => {
		mockApiRequest.mockResolvedValueOnce({
			success: true,
			data: [{ id: 1, name: "Test Item" }],
		});

		render(<ItemList />);

		await waitFor(() => {
			expect(screen.getByText("Test Item")).toBeInTheDocument();
		});

		expect(mockApiRequest).toHaveBeenCalledWith("/api/items");
	});
});
```

### API Route Testing

```typescript
// app/api/items/route.test.ts
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

describe("/api/items", () => {
	it("should return items on GET", async () => {
		const request = new NextRequest("http://localhost/api/items");
		const response = await GET(request);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.success).toBe(true);
		expect(Array.isArray(data.data)).toBe(true);
	});

	it("should create item on POST", async () => {
		const request = new NextRequest("http://localhost/api/items", {
			method: "POST",
			body: JSON.stringify({ name: "New Item", weight: 100 }),
		});

		const response = await POST(request);

		expect(response.status).toBe(201);
		const data = await response.json();
		expect(data.success).toBe(true);
	});
});
```

## Rate Limiting & Security

### Basic Rate Limiting

```typescript
// utils/rateLimit.ts
const requests = new Map<string, number[]>();

export function checkRateLimit(
	identifier: string,
	limit = 100,
	windowMs = 60000
): boolean {
	const now = Date.now();
	const windowStart = now - windowMs;

	if (!requests.has(identifier)) {
		requests.set(identifier, [now]);
		return true;
	}

	const userRequests = requests.get(identifier)!;
	const recentRequests = userRequests.filter((time) => time > windowStart);

	if (recentRequests.length >= limit) {
		return false;
	}

	recentRequests.push(now);
	requests.set(identifier, recentRequests);
	return true;
}

// API route usage
export async function POST(request: NextRequest) {
	const clientIP = request.headers.get("x-forwarded-for") || "unknown";

	if (!checkRateLimit(clientIP)) {
		return NextResponse.json(
			{ success: false, error: "Rate limit exceeded" },
			{ status: 429 }
		);
	}

	// Proceed with request
}
```

### Input Sanitization

````typescript
// utils/sanitize.ts
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurifyInstance = DOMPurify(window as any);

export function sanitizeInput(input: string): string {
  return DOMPurifyInstance.sanitize(input, { ALLOWED_TAGS: [] });
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// API usage
export async function POST(request: NextRequest) {
  const body = await request.json();
  const sanitizedName = sanitizeInput(body.name);

  if (!validateEmail(body.email)) {
    return NextResponse.json(
      { success: false, error: 'Invalid email' },
      { status: 400 }
    );
  }

  // Proceed with sanitized data
}
```</content>
<parameter name="filePath">c:\Users\Deej\Repos\cnc-tools\.github\instructions\api.instructions.md
````
