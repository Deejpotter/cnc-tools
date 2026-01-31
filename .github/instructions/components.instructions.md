---
applyTo: "components/**/*.tsx,components/**/*.ts"
---

# Component Creation Instructions

This file provides guidance for creating React components in the CNC Tools project.

## Component Types

### Page Components (`app/*/page.tsx`)

- Default export functional components
- Use Next.js App Router conventions
- Include proper metadata and SEO
- Handle loading and error states

```typescript
// app/box-shipping-calculator/page.tsx
export default function BoxShippingCalculatorPage() {
	return (
		<LayoutContainer>
			<div className="container">
				<h1>Box Shipping Calculator</h1>
				{/* Component content */}
			</div>
		</LayoutContainer>
	);
}
```

### Reusable Components (`components/`)

- Named exports for utilities
- Default exports for main components
- Include TypeScript interfaces
- Follow Bootstrap CSS classes

```typescript
// components/Tile.tsx
interface TileProps {
	title: string;
	description: string;
	href: string;
	icon?: React.ComponentType;
}

export default function Tile({
	title,
	description,
	href,
	icon: Icon,
}: TileProps) {
	return (
		<div className="card h-100 shadow-sm">{/* Component implementation */}</div>
	);
}
```

## Component Structure

### Basic Component Template

```typescript
/**
 * Component description
 * Updated: MM/DD/YY
 * Author: Your Name
 * Description: What this component does
 */

"use client";

import React, { useState, useEffect } from "react";
import type { ComponentProps } from "./types";

interface ComponentNameProps {
	// Define props interface
	requiredProp: string;
	optionalProp?: number;
	onAction: (data: any) => void;
}

export default function ComponentName({
	requiredProp,
	optionalProp = 0,
	onAction,
}: ComponentNameProps) {
	// State management
	const [state, setState] = useState(initialState);

	// Effects
	useEffect(() => {
		// Side effects
	}, [dependencies]);

	// Event handlers
	const handleAction = () => {
		onAction(someData);
	};

	return <div className="component-container">{/* JSX content */}</div>;
}
```

## State Management

### Local State

```typescript
const [items, setItems] = useState<ShippingItem[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Context Usage

```typescript
import { useContext } from "react";
import { ItemContext } from "@/contexts/ItemContext";

export default function ItemList() {
	const { items, addItem, removeItem } = useContext(ItemContext);

	// Use context methods
}
```

## Props and TypeScript

### Props Interface Pattern

```typescript
interface CalculatorFormProps {
	availableItems: ShippingItem[];
	selectedItems: SelectedShippingItem[];
	onSelectionChange: (items: SelectedShippingItem[]) => void;
	onCalculate: (items: SelectedShippingItem[]) => void;
	isLoading?: boolean;
}

export default function CalculatorForm({
	availableItems,
	selectedItems,
	onSelectionChange,
	onCalculate,
	isLoading = false,
}: CalculatorFormProps) {
	// Component implementation
}
```

### Children Props

```typescript
interface LayoutProps {
	children: React.ReactNode;
	title?: string;
	className?: string;
}

export default function LayoutContainer({
	children,
	title,
	className = "",
}: LayoutProps) {
	return (
		<div className={`layout-container ${className}`}>
			{title && <h1>{title}</h1>}
			{children}
		</div>
	);
}
```

## Event Handling

### Form Events

```typescript
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
	event.preventDefault();

	// Form validation
	if (!isValid) return;

	// Submit logic
	onSubmit(formData);
};

const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
	const { name, value } = event.target;
	setFormData((prev) => ({ ...prev, [name]: value }));
};
```

### Button Events

```typescript
const handleCalculate = () => {
	if (selectedItems.length === 0) return;

	setLoading(true);
	onCalculate(selectedItems).finally(() => setLoading(false));
};
```

## Styling Patterns

### Bootstrap Classes

```typescript
// Card layout
<div className="card h-100 shadow bg-light">
  <div className="card-body">
    <h2 className="card-title mb-3">Title</h2>
    {/* Content */}
  </div>
</div>

// Form styling
<div className="mb-3">
  <label htmlFor="inputId" className="form-label">Label</label>
  <input
    type="text"
    className="form-control"
    id="inputId"
    value={value}
    onChange={handleChange}
  />
</div>

// Button variants
<button
  className="btn btn-primary"
  onClick={handleClick}
  disabled={loading}
>
  {loading ? "Loading..." : "Submit"}
</button>
```

### Custom SCSS (when needed)

```scss
// styles/ComponentName.scss
.component-name {
	.special-element {
		// Custom styles
	}
}
```

## Error Handling

### Error Boundaries

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
	constructor(props: any) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Component error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return <div>Something went wrong.</div>;
		}

		return this.props.children;
	}
}
```

### User-Friendly Errors

```typescript
const [error, setError] = useState<string | null>(null);

const handleAsyncOperation = async () => {
	try {
		setError(null);
		await riskyOperation();
	} catch (err) {
		setError(err instanceof Error ? err.message : "An error occurred");
	}
};

return (
	<div>
		{error && (
			<div className="alert alert-danger" role="alert">
				{error}
			</div>
		)}
		{/* Component content */}
	</div>
);
```

## Performance Considerations

### Memoization

```typescript
import { useMemo, useCallback } from "react";

const expensiveCalculation = useMemo(() => {
	return items.reduce((total, item) => total + item.value, 0);
}, [items]);

const handleItemClick = useCallback(
	(itemId: string) => {
		onItemSelect(itemId);
	},
	[onItemSelect]
);
```

### Conditional Rendering

```typescript
// Avoid unnecessary renders
if (!data) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;

return <div>{/* Main content */}</div>;
```

## Testing Components

### Component Test Structure

```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ComponentName from "./ComponentName";

describe("ComponentName", () => {
	it("should render correctly", () => {
		render(<ComponentName requiredProp="test" onAction={jest.fn()} />);

		expect(screen.getByText("Expected text")).toBeInTheDocument();
	});

	it("should handle user interactions", () => {
		const mockAction = jest.fn();
		render(<ComponentName requiredProp="test" onAction={mockAction} />);

		fireEvent.click(screen.getByRole("button"));

		expect(mockAction).toHaveBeenCalled();
	});
});
```

## Accessibility

### ARIA Labels

```typescript
<button aria-label="Calculate shipping cost" onClick={handleCalculate}>
	Calculate
</button>
```

### Semantic HTML

```typescript
// Use semantic elements
<main role="main">
	<section aria-labelledby="calculator-section">
		<h2 id="calculator-section">Shipping Calculator</h2>
		{/* Form content */}
	</section>
</main>
```

### Keyboard Navigation

```typescript
// Ensure interactive elements are keyboard accessible
const handleKeyDown = (event: React.KeyboardEvent) => {
	if (event.key === "Enter" || event.key === " ") {
		handleAction();
	}
};

<div
	role="button"
	tabIndex={0}
	onClick={handleAction}
	onKeyDown={handleKeyDown}
>
	Clickable area
</div>;
```

## Common Patterns

### Data Fetching Components

```typescript
export default function DataComponent() {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchData()
			.then(setData)
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <div>Loading...</div>;
	if (!data) return <div>No data found</div>;

	return <div>{/* Render data */}</div>;
}
```

### Form Components

````typescript
export default function ItemForm({ onSubmit }: { onSubmit: (item: Item) => void }) {
  const [formData, setFormData] = useState({ name: '', weight: 0 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', weight: 0 }); // Reset form
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```</content>
<parameter name="filePath">c:\Users\Deej\Repos\cnc-tools\.github\instructions\components.instructions.md
````
