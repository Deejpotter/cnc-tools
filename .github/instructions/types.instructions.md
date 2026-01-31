---
applyTo: "types/**/*.ts,types/**/*.d.ts"
---

# TypeScript Types Instructions

This file provides guidance for creating and maintaining TypeScript type definitions in the CNC Tools application.

## Type Definition Patterns

### Interface Naming Conventions

- Use PascalCase for interface names
- Add "I" prefix for data model interfaces (e.g., `IShippingItem`)
- Use descriptive names that indicate purpose

```typescript
// types/box-shipping-calculator/ShippingItem.ts
export interface IShippingItem {
	_id?: string; // MongoDB ObjectId as string
	name: string;
	weight: number; // in grams
	dimensions: IDimensions;
	quantity: number;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IDimensions {
	length: number; // in mm
	width: number; // in mm
	height: number; // in mm
}
```

### Type Aliases vs Interfaces

- Use `interface` for object shapes that may be extended
- Use `type` for unions, primitives, and complex types
- Prefer interfaces for API response shapes

```typescript
// Union types for status
export type PackingStatus = "pending" | "processing" | "completed" | "failed";

// Complex type for API responses
export type ApiResponse<T> = {
	success: boolean;
	data?: T;
	error?: string;
	timestamp: Date;
};
```

## Domain-Specific Types

### Box Shipping Calculator Types

```typescript
// types/box-shipping-calculator/index.ts
export interface IBoxSpecification {
	name: string;
	internalDimensions: IDimensions;
	maxWeight: number; // in grams
	cost: number; // in currency units
}

export interface IPackingResult {
	box: IBoxSpecification;
	packedItems: ISelectedShippingItem[];
	utilization: number; // percentage 0-100
	totalWeight: number;
}

export interface ISelectedShippingItem extends IShippingItem {
	selectedQuantity: number;
}
```

### MongoDB Document Types

```typescript
// types/mongodb/index.ts
export interface IMongoDocument {
	_id: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface IUser extends IMongoDocument {
	clerkId: string;
	email: string;
	publicMetadata: {
		isAdmin?: boolean;
		isMaster?: boolean;
	};
}

export interface IConversation extends IMongoDocument {
	userId: string;
	messages: IChatMessage[];
	title?: string;
}
```

### Chat and AI Types

```typescript
// types/chat.ts
export interface IChatMessage {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: Date;
	attachments?: IFileAttachment[];
}

export interface IFileAttachment {
	id: string;
	name: string;
	type: string;
	size: number;
	url?: string;
}

export interface IStreamingResponse {
	content: string;
	isComplete: boolean;
	error?: string;
}
```

## Utility Types

### Common Patterns

```typescript
// types/common.ts
// Make all properties optional except specified ones
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Make specific properties required
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Extract nested property types
export type NestedProperty<T, K extends keyof T> = T[K] extends object
	? T[K]
	: never;

// API response wrapper
export type ApiResult<T> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			error: string;
	  };
```

### Form and UI Types

```typescript
// types/forms.ts
export interface IFormField<T = any> {
	name: string;
	label: string;
	type: "text" | "number" | "select" | "checkbox";
	value: T;
	error?: string;
	required?: boolean;
	options?: Array<{ label: string; value: T }>;
}

export interface IFormState<T> {
	values: T;
	errors: Partial<Record<keyof T, string>>;
	touched: Partial<Record<keyof T, boolean>>;
	isSubmitting: boolean;
	isValid: boolean;
}
```

## Validation Types

### Zod Schema Integration

```typescript
// types/validation.ts
import { z } from "zod";

// Runtime validation schemas that generate types
export const ShippingItemSchema = z.object({
	name: z.string().min(1, "Name is required"),
	weight: z.number().positive("Weight must be positive"),
	dimensions: z.object({
		length: z.number().positive(),
		width: z.number().positive(),
		height: z.number().positive(),
	}),
	quantity: z.number().int().min(1).default(1),
});

// Extract TypeScript type from Zod schema
export type IShippingItemInput = z.infer<typeof ShippingItemSchema>;

// Validation result type
export type ValidationResult<T> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			errors: z.ZodError["errors"];
	  };
```

## Component Prop Types

### Component Props Patterns

```typescript
// types/components.ts
export interface IBaseComponentProps {
	className?: string;
	children?: React.ReactNode;
	testId?: string;
}

export interface IListComponentProps<T> extends IBaseComponentProps {
	items: T[];
	renderItem: (item: T, index: number) => React.ReactNode;
	onItemSelect?: (item: T) => void;
	selectedItem?: T;
	loading?: boolean;
	error?: string;
}

export interface IFormComponentProps<T> extends IBaseComponentProps {
	initialValues: T;
	onSubmit: (values: T) => void | Promise<void>;
	validationSchema?: z.ZodSchema<T>;
	submitLabel?: string;
}
```

## API and Service Types

### HTTP Client Types

```typescript
// types/api.ts
export interface IApiConfig {
	baseURL: string;
	timeout?: number;
	headers?: Record<string, string>;
}

export interface IApiRequest {
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	url: string;
	data?: any;
	params?: Record<string, any>;
	headers?: Record<string, string>;
}

export interface IApiResponse<T = any> {
	data: T;
	status: number;
	statusText: string;
	headers: Record<string, string>;
}

export interface IApiError {
	message: string;
	status?: number;
	code?: string;
	details?: any;
}
```

### Service Layer Types

```typescript
// types/services.ts
export interface ICrudService<
	T,
	TCreate = Omit<T, "_id" | "createdAt" | "updatedAt">
> {
	findAll(): Promise<T[]>;
	findById(id: string): Promise<T | null>;
	create(data: TCreate): Promise<T>;
	update(id: string, data: Partial<TCreate>): Promise<T>;
	delete(id: string): Promise<void>;
}

export interface IShippingService extends ICrudService<IShippingItem> {
	calculatePacking(items: ISelectedShippingItem[]): Promise<IPackingResult[]>;
	getAvailableBoxes(): Promise<IBoxSpecification[]>;
}
```

## Declaration Files

### Global Type Declarations

```typescript
// types/global.d.ts
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			MONGODB_URI: string;
			NEXT_PUBLIC_API_URL: string;
			NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
			CLERK_SECRET_KEY: string;
			OPENAI_API_KEY: string;
		}
	}
}

// Module declarations for custom modules
declare module "*.scss" {
	const content: { [className: string]: string };
	export default content;
}

declare module "*.md" {
	const content: string;
	export default content;
}
```

### Third-Party Library Extensions

```typescript
// types/vendor.d.ts
import "react";

declare module "react" {
	interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
		"data-testid"?: string;
	}
}

// Extend Express types if using custom middleware
declare global {
	namespace Express {
		interface Request {
			user?: IUser;
		}
	}
}
```

## Type Guards and Utilities

### Runtime Type Checking

```typescript
// types/guards.ts
export function isShippingItem(obj: any): obj is IShippingItem {
	return (
		typeof obj === "object" &&
		obj !== null &&
		typeof obj.name === "string" &&
		typeof obj.weight === "number" &&
		typeof obj.dimensions === "object" &&
		typeof obj.dimensions.length === "number" &&
		typeof obj.dimensions.width === "number" &&
		typeof obj.dimensions.height === "number"
	);
}

export function isApiError(obj: any): obj is IApiError {
	return (
		typeof obj === "object" &&
		obj !== null &&
		typeof obj.message === "string" &&
		(typeof obj.status === "number" || obj.status === undefined)
	);
}
```

## Testing Types

### Test Utility Types

```typescript
// types/testing.ts
export interface IMockApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
}

export interface ITestContext {
	user?: Partial<IUser>;
	items?: IShippingItem[];
	conversations?: IConversation[];
}

// Mock factory functions
export type MockFactory<T> = (overrides?: Partial<T>) => T;

export const createMockShippingItem: MockFactory<IShippingItem> = (
	overrides = {}
) => ({
	_id: "mock-id",
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
});
```

## Best Practices

### Type Organization

- Group related types in feature-specific directories
- Use barrel exports (`index.ts`) for clean imports
- Avoid circular dependencies between type files

### Naming Conventions

- Use consistent prefixes (I for interfaces, T for types)
- Use descriptive names that indicate the domain
- Avoid generic names like `Data` or `Info`

### Documentation

- Add JSDoc comments to complex types
- Document optional properties and their default values
- Include examples for complex type usage

````typescript
/**
 * Represents a shipping item in the system
 * @property _id - MongoDB ObjectId as string (optional for new items)
 * @property name - Human-readable name of the item
 * @property weight - Weight in grams
 * @property dimensions - Physical dimensions in millimeters
 * @example
 * const item: IShippingItem = {
 *   name: "Widget Box",
 *   weight: 500,
 *   dimensions: { length: 100, width: 80, height: 50 }
 * };
 */
export interface IShippingItem {
  _id?: string;
  name: string;
  weight: number;
  dimensions: IDimensions;
  quantity?: number;
}
```</content>
<parameter name="filePath">c:\Users\Deej\Repos\cnc-tools\.github\instructions\types.instructions.md
````
