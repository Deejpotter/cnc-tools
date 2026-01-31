---
applyTo: "utils/**/*.ts,utils/**/*.js"
---

# Utility Functions Instructions

This file provides guidance for creating and maintaining utility functions in the CNC Tools application.

## Utility Function Patterns

### Function Organization

- Group related utilities in feature-specific files
- Use descriptive function names with verb prefixes
- Include JSDoc comments for complex functions

```typescript
// utils/formatters.ts
/**
 * Format a number as currency with appropriate locale
 * @param amount - The amount to format
 * @param currency - ISO 4217 currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = "USD"): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
	}).format(amount);
}

/**
 * Format dimensions as a readable string
 * @param dimensions - Object with length, width, height properties
 * @returns Formatted dimensions string (e.g., "100 × 50 × 25 mm")
 */
export function formatDimensions(dimensions: {
	length: number;
	width: number;
	height: number;
}): string {
	return `${dimensions.length} × ${dimensions.width} × ${dimensions.height} mm`;
}
```

### Error Handling Utilities

```typescript
// utils/errorHandling.ts
export class AppError extends Error {
	constructor(
		message: string,
		public code: string,
		public statusCode: number = 500
	) {
		super(message);
		this.name = "AppError";
	}
}

export function handleApiError(error: unknown): string {
	if (error instanceof AppError) {
		return error.message;
	}

	if (error instanceof Error) {
		// Log technical error for debugging
		console.error("Unexpected error:", error);
		return "An unexpected error occurred. Please try again.";
	}

	return "Something went wrong.";
}

export function isNetworkError(error: unknown): boolean {
	return (
		error instanceof Error &&
		(error.message.includes("fetch") || error.message.includes("network"))
	);
}
```

## API Integration Utilities

### HTTP Client Wrapper

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

### Authentication Helpers

```typescript
// utils/auth.ts
import { auth } from "@clerk/nextjs/server";

export async function requireAuth() {
	const { userId } = auth();

	if (!userId) {
		throw new AppError("Authentication required", "AUTH_REQUIRED", 401);
	}

	return userId;
}

export async function requireAdmin(userId?: string) {
	const id = userId || (await requireAuth());
	const user = await getUser(id);

	if (!user?.publicMetadata?.isAdmin) {
		throw new AppError("Admin access required", "ADMIN_REQUIRED", 403);
	}

	return user;
}

export async function requireMasterAdmin(userId?: string) {
	const user = await requireAdmin(userId);

	if (!user.publicMetadata?.isMaster) {
		throw new AppError(
			"Master admin access required",
			"MASTER_ADMIN_REQUIRED",
			403
		);
	}

	return user;
}
```

## Data Transformation Utilities

### Array and Object Helpers

```typescript
// utils/dataTransform.ts
export function groupBy<T, K extends string | number>(
	array: T[],
	keyFn: (item: T) => K
): Record<K, T[]> {
	return array.reduce((groups, item) => {
		const key = keyFn(item);
		if (!groups[key]) {
			groups[key] = [];
		}
		groups[key].push(item);
		return groups;
	}, {} as Record<K, T[]>);
}

export function sortBy<T>(
	array: T[],
	keyFn: (item: T) => string | number,
	direction: "asc" | "desc" = "asc"
): T[] {
	return [...array].sort((a, b) => {
		const aVal = keyFn(a);
		const bVal = keyFn(b);

		if (aVal < bVal) return direction === "asc" ? -1 : 1;
		if (aVal > bVal) return direction === "asc" ? 1 : -1;
		return 0;
	});
}

export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
	const seen = new Set<K>();
	return array.filter((item) => {
		const key = keyFn(item);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
```

### Validation Helpers

```typescript
// utils/validation.ts
import { z } from "zod";

export function validateData<T>(
	schema: z.ZodSchema<T>,
	data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
	const result = schema.safeParse(data);

	if (result.success) {
		return { success: true, data: result.data };
	}

	return {
		success: false,
		errors: result.error.errors.map((err) => err.message),
	};
}

export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function isValidDimensions(dimensions: {
	length: number;
	width: number;
	height: number;
}): boolean {
	return (
		dimensions.length > 0 &&
		dimensions.width > 0 &&
		dimensions.height > 0 &&
		dimensions.length <= 1000 && // reasonable max
		dimensions.width <= 1000 &&
		dimensions.height <= 1000
	);
}
```

## Calculation Utilities

### 3D Packing Algorithms

```typescript
// utils/packingCalculations.ts
export interface Point3D {
	x: number;
	y: number;
	z: number;
}

export interface PackingResult {
	position: Point3D;
	rotation: number; // 0-5 for 6 possible orientations
	fits: boolean;
}

/**
 * Check if an item fits at a specific position with given rotation
 */
export function canPlaceItem(
	item: { dimensions: { length: number; width: number; height: number } },
	position: Point3D,
	rotation: number,
	container: { dimensions: { length: number; width: number; height: number } }
): boolean {
	const rotatedDims = rotateDimensions(item.dimensions, rotation);

	return (
		position.x + rotatedDims.length <= container.dimensions.length &&
		position.y + rotatedDims.width <= container.dimensions.width &&
		position.z + rotatedDims.height <= container.dimensions.height
	);
}

/**
 * Rotate item dimensions (6 possible orientations)
 */
function rotateDimensions(
	dims: { length: number; width: number; height: number },
	rotation: number
): { length: number; width: number; height: number } {
	const rotations = [
		[dims.length, dims.width, dims.height], // 0: L×W×H
		[dims.length, dims.height, dims.width], // 1: L×H×W
		[dims.width, dims.length, dims.height], // 2: W×L×H
		[dims.width, dims.height, dims.length], // 3: W×H×L
		[dims.height, dims.length, dims.width], // 4: H×L×W
		[dims.height, dims.width, dims.length], // 5: H×W×L
	];

	const [length, width, height] = rotations[rotation % 6];
	return { length, width, height };
}
```

## Navigation and Routing Utilities

### Route Helpers

```typescript
// utils/navigation.ts
import { redirect } from "next/navigation";

export function redirectToLogin() {
	redirect("/sign-in");
}

export function redirectToDashboard() {
	redirect("/dashboard");
}

export function buildUrl(
	path: string,
	params?: Record<string, string>
): string {
	const url = new URL(
		path,
		typeof window !== "undefined"
			? window.location.origin
			: "http://localhost:3000"
	);

	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			url.searchParams.set(key, value);
		});
	}

	return url.toString();
}

export function isActivePath(currentPath: string, targetPath: string): boolean {
	return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}
```

## File and Upload Utilities

### File Processing Helpers

```typescript
// utils/fileProcessing.ts
export interface ProcessedFile {
	name: string;
	type: string;
	size: number;
	content?: string;
	error?: string;
}

export function validateFile(
	file: File,
	options: {
		maxSize?: number; // in bytes
		allowedTypes?: string[];
	} = {}
): { valid: boolean; error?: string } {
	const { maxSize = 10 * 1024 * 1024, allowedTypes = [] } = options; // 10MB default

	if (file.size > maxSize) {
		return {
			valid: false,
			error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
		};
	}

	if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
		return {
			valid: false,
			error: `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`,
		};
	}

	return { valid: true };
}

export async function readFileAsText(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsText(file);
	});
}

export function formatFileSize(bytes: number): string {
	const units = ["B", "KB", "MB", "GB"];
	let size = bytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(1)} ${units[unitIndex]}`;
}
```

## Date and Time Utilities

### Date Formatting and Manipulation

```typescript
// utils/dateUtils.ts
export function formatDate(
	date: Date,
	options: Intl.DateTimeFormatOptions = {}
): string {
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		...options,
	}).format(date);
}

export function formatRelativeTime(date: Date): string {
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) return "just now";
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
	if (diffInSeconds < 604800)
		return `${Math.floor(diffInSeconds / 86400)}d ago`;

	return formatDate(date);
}

export function isToday(date: Date): boolean {
	const today = new Date();
	return date.toDateString() === today.toDateString();
}

export function isYesterday(date: Date): boolean {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return date.toDateString() === yesterday.toDateString();
}
```

## Testing Utilities

### Mock Data Generators

```typescript
// utils/testHelpers.ts
export function createMockShippingItem(overrides = {}) {
	return {
		_id: "mock-id-" + Math.random().toString(36).substr(2, 9),
		name: "Mock Item",
		weight: 1000,
		dimensions: {
			length: 100,
			width: 50,
			height: 25,
		},
		quantity: 1,
		createdAt: new Date(),
		updatedAt: new Date(),
		...overrides,
	};
}

export function createMockApiResponse(data = null, success = true) {
	return {
		success,
		data: success ? data : undefined,
		error: success ? undefined : "Mock error",
	};
}

// Custom Jest matchers
expect.extend({
	toBeValidShippingItem(received) {
		const pass =
			received &&
			typeof received.name === "string" &&
			typeof received.weight === "number" &&
			received.weight > 0 &&
			received.dimensions &&
			typeof received.dimensions.length === "number";

		return {
			message: () => `expected ${received} to be a valid shipping item`,
			pass,
		};
	},
});
```

## Performance Utilities

### Debounce and Throttle

```typescript
// utils/performance.ts
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;

	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle: boolean;

	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
}
```

## Constants and Configuration

### Application Constants

````typescript
// utils/constants.ts
export const BOX_DIMENSIONS = {
  SMALL: { length: 200, width: 150, height: 100 },
  MEDIUM: { length: 300, width: 200, height: 150 },
  LARGE: { length: 400, width: 300, height: 200 },
} as const;

export const API_ENDPOINTS = {
  ITEMS: '/api/shipping/items',
  CALCULATE: '/api/shipping/calculate',
  UPLOAD: '/api/upload',
  CHAT: '/api/chat',
} as const;

export const VALIDATION_RULES = {
  MAX_ITEM_NAME_LENGTH: 100,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['application/pdf', 'text/plain', 'image/jpeg'],
} as const;
```</content>
<parameter name="filePath">c:\Users\Deej\Repos\cnc-tools\.github\instructions\utils.instructions.md
````
