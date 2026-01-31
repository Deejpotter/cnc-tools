---
applyTo: "**/*.test.ts,**/*.test.tsx,**/*.test.js,**/*.spec.ts,**/*.spec.tsx,test/**/*.ts,test/**/*.js"
---

# Testing Instructions

This file provides specific guidance for writing and debugging tests in the CNC Tools project.

## Test Structure

### File Naming

- Unit tests: `ComponentName.test.tsx` or `utilityFunction.test.ts`
- Integration tests: `page.test.tsx` for page-level integration
- Test utilities: `testUtils.ts` in the `test/` directory

### Test Organization

```typescript
describe("ComponentName", () => {
	describe("functionality group", () => {
		it("should do something specific", () => {
			// Test implementation
		});
	});
});
```

## Common Testing Patterns

### Component Testing with React Testing Library

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

it("should render and respond to user interaction", () => {
	render(<MyComponent />);

	// Find elements
	const button = screen.getByRole("button", { name: /calculate/i });

	// Interact
	fireEvent.click(button);

	// Assert
	await waitFor(() => {
		expect(screen.getByText("Result: 42")).toBeInTheDocument();
	});
});
```

### Mocking External Dependencies

```typescript
// Mock fetch API
global.fetch = jest.fn();

// Mock specific responses
(global.fetch as jest.Mock).mockResolvedValueOnce({
	ok: true,
	json: () => Promise.resolve({ success: true, data: mockData }),
});

// Mock components
jest.mock("./ChildComponent", () => () => <div data-testid="mocked">Mock</div>);

// Mock Clerk authentication
jest.mock("@clerk/nextjs", () => ({
	useUser: () => ({ user: { id: "test-user" } }),
	useAuth: () => ({ getToken: jest.fn().mockResolvedValue("fake-token") }),
}));
```

### Algorithm Testing

```typescript
describe("calculateBoxUtilization", () => {
	it("should calculate volume utilization correctly", () => {
		const box = { length: 10, width: 10, height: 10, maxWeight: 100 };
		const items = [{ length: 5, width: 5, height: 5, weight: 10, quantity: 1 }];

		const result = calculateBoxUtilization(box, items);

		expect(result.volumePercentage).toBeCloseTo(12.5, 1); // 5*5*5 / 10*10*10 * 100
		expect(result.weightPercentage).toBe(10); // 10 / 100 * 100
	});
});
```

## Debugging Test Failures

### Common Issues and Solutions

#### 1. Async Operations

```typescript
// Wrong - doesn't wait for async operations
it("should load data", () => {
	render(<DataComponent />);
	expect(screen.getByText("Loading...")).toBeInTheDocument(); // May fail if data loads quickly
});

// Right - use waitFor for async assertions
it("should load data", async () => {
	render(<DataComponent />);

	await waitFor(() => {
		expect(screen.getByText("Data loaded")).toBeInTheDocument();
	});
});
```

#### 2. Mock Cleanup

```typescript
// Reset mocks between tests
beforeEach(() => {
	jest.clearAllMocks();
	global.fetch = jest.fn();
});
```

#### 3. Component State Testing

```typescript
// Test state changes by triggering events
it("should update on input change", () => {
	render(<InputComponent />);

	const input = screen.getByRole("textbox");
	fireEvent.change(input, { target: { value: "new value" } });

	expect(input).toHaveValue("new value");
});
```

#### 4. Custom Hooks Testing

```typescript
// Test custom hooks using @testing-library/react-hooks
import { renderHook, act } from "@testing-library/react-hooks";

it("should manage state correctly", () => {
	const { result } = renderHook(() => useCustomHook());

	act(() => {
		result.current.increment();
	});

	expect(result.current.count).toBe(1);
});
```

## Test Categories

### Unit Tests

- Pure functions and utilities
- Individual React components (shallow rendering)
- Custom hooks
- Focus: Logic correctness, edge cases

### Integration Tests

- Component interactions
- API calls and responses
- Page-level user flows
- Focus: End-to-end behavior within components

### Snapshot Tests

- UI regression prevention
- Component rendering output
- Focus: Visual consistency

## Best Practices

### Test Coverage Goals

- **Business Logic**: 100% coverage (algorithms, calculations)
- **Components**: 80%+ coverage (user interactions, rendering)
- **Utilities**: 90%+ coverage (error handling, edge cases)

### Test Quality Checklist

- [ ] Tests are descriptive and explain intent
- [ ] Edge cases are covered (empty data, errors, boundaries)
- [ ] Mocks are minimal and focused
- [ ] Tests run independently (no shared state)
- [ ] Async operations are properly awaited
- [ ] Accessibility is considered in UI tests

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- --testPathPattern=BoxCalculations.test.ts

# Debug hanging tests
npm test -- --detectOpenHandles --verbose
```

## Common Mock Patterns

### API Response Mocking

```typescript
// test/testUtils.ts
export const mockFetchOnce = (response: any) => {
	return jest.fn().mockResolvedValueOnce({
		ok: true,
		json: () => Promise.resolve(response),
	});
};

// Usage in tests
(global.fetch as jest.Mock).mockImplementation(
	mockFetchOnce({
		success: true,
		data: { boxes: [] },
	})
);
```

### Router Mocking

```typescript
jest.mock("next/navigation", () => ({
	usePathname: () => "/",
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
	}),
}));
```

### Context Provider Mocking

````typescript
const mockContextValue = { user: null, loading: false };

jest.mock("./AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => mockContextValue
}));
```</content>
<parameter name="filePath">c:\Users\Deej\Repos\cnc-tools\.github\instructions\testing.instructions.md
````
