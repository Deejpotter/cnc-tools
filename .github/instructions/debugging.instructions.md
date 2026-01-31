---
applyTo: "**/*.{ts,tsx,js,jsx}"
---

# Debugging Instructions

This file provides guidance for debugging issues in the CNC Tools application.

## Development Environment Setup

### Debug Configuration

```javascript
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "skipFiles": ["<node_internals>/**"],
      "serverReadyAction": {
        "pattern": "- Local:.+(https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

### Console Logging Setup

```typescript
// utils/logger.ts
type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
	private isDevelopment = process.env.NODE_ENV === "development";

	debug(message: string, ...args: any[]) {
		if (this.isDevelopment) {
			console.debug(`🐛 ${message}`, ...args);
		}
	}

	info(message: string, ...args: any[]) {
		console.info(`ℹ️ ${message}`, ...args);
	}

	warn(message: string, ...args: any[]) {
		console.warn(`⚠️ ${message}`, ...args);
	}

	error(message: string, ...args: any[]) {
		console.error(`❌ ${message}`, ...args);
	}

	// Structured logging for production
	log(level: LogLevel, message: string, context?: any) {
		const logEntry = {
			level,
			message,
			timestamp: new Date().toISOString(),
			context,
		};

		if (this.isDevelopment) {
			console[level](logEntry);
		} else {
			// Send to logging service (e.g., Sentry, LogRocket)
			this.sendToService(logEntry);
		}
	}

	private sendToService(logEntry: any) {
		// Implementation for external logging service
	}
}

export const logger = new Logger();
```

## Component Debugging

### React DevTools

```typescript
// Add debug info to components
import React from "react";

interface DebugInfoProps {
	component: string;
	props?: any;
	state?: any;
}

function DebugInfo({ component, props, state }: DebugInfoProps) {
	const [showDebug, setShowDebug] = React.useState(false);

	if (process.env.NODE_ENV === "production") return null;

	return (
		<div style={{ margin: "10px", padding: "10px", border: "1px solid #ccc" }}>
			<button onClick={() => setShowDebug(!showDebug)}>
				Debug {component}
			</button>
			{showDebug && (
				<pre style={{ fontSize: "12px", overflow: "auto" }}>
					{JSON.stringify({ props, state }, null, 2)}
				</pre>
			)}
		</div>
	);
}

// Usage in component
export default function MyComponent() {
	const [count, setCount] = React.useState(0);

	return (
		<div>
			<DebugInfo component="MyComponent" props={{}} state={{ count }} />
			{/* Component content */}
		</div>
	);
}
```

### State Debugging

```typescript
// hooks/useDebugState.ts
import { useState, useEffect } from "react";

export function useDebugState<T>(
	initialValue: T,
	label: string
): [T, React.Dispatch<React.SetStateAction<T>>] {
	const [state, setState] = useState(initialValue);

	useEffect(() => {
		if (process.env.NODE_ENV === "development") {
			console.log(`🔄 ${label} changed:`, state);
		}
	}, [state, label]);

	const debugSetState: React.Dispatch<React.SetStateAction<T>> = (value) => {
		if (process.env.NODE_ENV === "development") {
			console.log(`📝 ${label} will change from:`, state, "to:", value);
		}
		setState(value);
	};

	return [state, debugSetState];
}

// Usage
const [items, setItems] = useDebugState([], "items");
```

## API Debugging

### Request/Response Logging

```typescript
// utils/api.ts
export async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	const requestId = Math.random().toString(36).substr(2, 9);

	if (process.env.NODE_ENV === "development") {
		console.group(`🚀 API Request [${requestId}]`);
		console.log("Endpoint:", endpoint);
		console.log("Options:", options);
		console.groupEnd();
	}

	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
		const data = await response.json();

		if (process.env.NODE_ENV === "development") {
			console.group(`📥 API Response [${requestId}]`);
			console.log("Status:", response.status);
			console.log("Data:", data);
			console.groupEnd();
		}

		return {
			success: response.ok,
			data: response.ok ? data : null,
			error: response.ok ? null : data.error,
		};
	} catch (error) {
		if (process.env.NODE_ENV === "development") {
			console.group(`❌ API Error [${requestId}]`);
			console.error("Error:", error);
			console.groupEnd();
		}

		return {
			success: false,
			error: error instanceof Error ? error.message : "Network error",
		};
	}
}
```

### API Route Debugging

```typescript
// app/api/debug/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const debugInfo = {
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV,
		nodeVersion: process.version,
		headers: Object.fromEntries(request.headers.entries()),
		url: request.url,
		method: request.method,
	};

	// Log debug info
	console.log("🔍 Debug Info:", debugInfo);

	return NextResponse.json({
		success: true,
		debug: debugInfo,
	});
}

// Test endpoint: GET /api/debug
```

## Database Debugging

### Query Logging

```typescript
// utils/database.ts
import { MongoClient, Db } from "mongodb";

class DatabaseDebugger {
	private client: MongoClient;

	constructor(uri: string) {
		this.client = new MongoClient(uri, {
			monitorCommands: process.env.NODE_ENV === "development",
		});

		if (process.env.NODE_ENV === "development") {
			this.client.on("commandStarted", (event) => {
				console.log("📊 MongoDB Command Started:", {
					command: event.commandName,
					collection: event.command?.[event.commandName]?.collection,
					filter: event.command?.[event.commandName]?.filter,
				});
			});

			this.client.on("commandSucceeded", (event) => {
				console.log("✅ MongoDB Command Succeeded:", {
					command: event.commandName,
					duration: `${event.duration}ms`,
				});
			});

			this.client.on("commandFailed", (event) => {
				console.error("❌ MongoDB Command Failed:", {
					command: event.commandName,
					error: event.failure,
					duration: `${event.duration}ms`,
				});
			});
		}
	}

	async connect(): Promise<Db> {
		await this.client.connect();
		return this.client.db();
	}
}

export const dbDebugger = new DatabaseDebugger(process.env.MONGODB_URI!);
```

### Connection Pool Monitoring

```typescript
// utils/dbMonitor.ts
export function monitorDatabaseHealth() {
	const checkInterval = setInterval(async () => {
		try {
			const start = Date.now();
			await client.db().admin().ping();
			const latency = Date.now() - start;

			if (latency > 1000) {
				console.warn(`🐌 Database latency high: ${latency}ms`);
			} else {
				console.log(`💚 Database healthy: ${latency}ms`);
			}
		} catch (error) {
			console.error("💔 Database connection failed:", error);
		}
	}, 30000); // Check every 30 seconds

	// Cleanup on app shutdown
	process.on("SIGINT", () => {
		clearInterval(checkInterval);
		client.close();
	});
}
```

## Performance Debugging

### Performance Monitoring

```typescript
// utils/performance.ts
export function measurePerformance<T>(
	label: string,
	fn: () => T | Promise<T>
): T | Promise<T> {
	const start = performance.now();

	try {
		const result = fn();

		if (result instanceof Promise) {
			return result.finally(() => {
				const end = performance.now();
				console.log(`⏱️ ${label} took ${end - start}ms`);
			});
		} else {
			const end = performance.now();
			console.log(`⏱️ ${label} took ${end - start}ms`);
			return result;
		}
	} catch (error) {
		const end = performance.now();
		console.error(`⏱️ ${label} failed after ${end - start}ms:`, error);
		throw error;
	}
}

// Usage
const data = await measurePerformance("API call", () =>
	apiRequest("/api/items")
);
```

### Memory Leak Detection

```typescript
// utils/memoryMonitor.ts
export function monitorMemoryUsage() {
	if (typeof window === "undefined") return; // Server-side only

	let lastMemoryUsage = 0;

	setInterval(() => {
		if ("memory" in performance) {
			const memInfo = (performance as any).memory;
			const currentUsage = memInfo.usedJSHeapSize;

			if (lastMemoryUsage > 0) {
				const diff = currentUsage - lastMemoryUsage;
				if (Math.abs(diff) > 1024 * 1024) {
					// 1MB change
					console.log(
						`🧠 Memory ${diff > 0 ? "increased" : "decreased"}: ${(
							diff /
							1024 /
							1024
						).toFixed(2)}MB`
					);
				}
			}

			lastMemoryUsage = currentUsage;

			if (currentUsage > 50 * 1024 * 1024) {
				// 50MB
				console.warn(
					"⚠️ High memory usage detected:",
					(currentUsage / 1024 / 1024).toFixed(2),
					"MB"
				);
			}
		}
	}, 10000); // Check every 10 seconds
}
```

## Error Boundary Debugging

### Enhanced Error Boundary

```typescript
// components/ErrorBoundary.tsx
import React from "react";
import * as Sentry from "@sentry/nextjs";

interface ErrorInfo {
	componentStack: string;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<
	React.PropsWithChildren<{}>,
	ErrorBoundaryState
> {
	constructor(props: React.PropsWithChildren<{}>) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.setState({ errorInfo });

		// Log to console in development
		if (process.env.NODE_ENV === "development") {
			console.group("💥 Error Boundary Caught Error");
			console.error("Error:", error);
			console.error("Error Info:", errorInfo);
			console.groupEnd();
		}

		// Send to error tracking service
		Sentry.captureException(error, {
			contexts: {
				react: {
					componentStack: errorInfo.componentStack,
				},
			},
		});
	}

	render() {
		if (this.state.hasError) {
			return (
				<div
					style={{ padding: "20px", border: "1px solid red", margin: "20px" }}
				>
					<h2>Something went wrong</h2>
					{process.env.NODE_ENV === "development" && (
						<details style={{ whiteSpace: "pre-wrap" }}>
							<summary>Error Details (Development Only)</summary>
							<pre>{this.state.error?.toString()}</pre>
							<pre>{this.state.errorInfo?.componentStack}</pre>
						</details>
					)}
					<button onClick={() => window.location.reload()}>Reload Page</button>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
```

## Testing Debugging

### Debug Test Helpers

```typescript
// test/testUtils.ts
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Debug helper for tests
export function debugComponent(component: React.ReactElement) {
	const { container } = render(component);
	screen.debug(); // Print DOM to console
	return container;
}

// Enhanced render with debugging
export function renderWithDebug(ui: React.ReactElement, options = {}) {
	const result = render(ui, options);

	// Add debug method to result
	(result as any).debug = () => {
		screen.debug();
		console.log("Component tree:", result.container.innerHTML);
	};

	return result;
}

// Mock console methods for cleaner test output
export function mockConsole() {
	const originalConsole = { ...console };

	beforeEach(() => {
		console.log = jest.fn();
		console.error = jest.fn();
		console.warn = jest.fn();
	});

	afterEach(() => {
		Object.assign(console, originalConsole);
	});
}

// Usage in tests
describe("MyComponent", () => {
	mockConsole();

	it("should render correctly", () => {
		const { debug } = renderWithDebug(<MyComponent />);
		debug(); // Print debug info if test fails
		expect(screen.getByText("Hello")).toBeInTheDocument();
	});
});
```

### Test Debugging Scripts

```javascript
// debug-test.js
const { execSync } = require("child_process");

// Run specific test with debug output
function debugTest(testPattern) {
	try {
		execSync(`npm test -- --testNamePattern="${testPattern}" --verbose`, {
			stdio: "inherit",
		});
	} catch (error) {
		console.log("Test failed, running with --detectOpenHandles");
		execSync(
			`npm test -- --testNamePattern="${testPattern}" --detectOpenHandles --forceExit`,
			{
				stdio: "inherit",
			}
		);
	}
}

// Debug memory leaks in tests
function debugMemoryLeaks() {
	execSync("npm test -- --detectOpenHandles --forceExit --logHeapUsage", {
		stdio: "inherit",
	});
}

module.exports = { debugTest, debugMemoryLeaks };
```

## Browser Debugging

### Browser DevTools Snippets

```javascript
// Add to browser console for debugging

// Monitor all API calls
(function () {
	const originalFetch = window.fetch;
	window.fetch = function (...args) {
		console.log("🚀 Fetch:", args[0], args[1]);
		return originalFetch
			.apply(this, args)
			.then((response) => {
				console.log("📥 Response:", response.status, response.url);
				return response;
			})
			.catch((error) => {
				console.error("❌ Fetch Error:", error);
				throw error;
			});
	};
})();

// Monitor React component updates
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
	window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = (function (
		onCommitFiberRoot
	) {
		return function (...args) {
			console.log("🔄 React Update");
			return onCommitFiberRoot.apply(this, args);
		};
	})(window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot);
}

// Performance monitoring
(function () {
	let lastTime = performance.now();
	setInterval(() => {
		const currentTime = performance.now();
		const fps = Math.round(1000 / (currentTime - lastTime));
		lastTime = currentTime;
		console.log(`FPS: ${fps}`);
	}, 1000);
})();
```

## Production Debugging

### Remote Debugging Setup

```typescript
// utils/remoteDebug.ts
export function enableRemoteDebugging() {
	if (process.env.NODE_ENV !== "production") return;

	// Enable source maps
	if (typeof window !== "undefined") {
		// @ts-ignore
		window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ =
			window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ || {};
	}

	// Log errors to external service
	window.addEventListener("error", (event) => {
		logger.error("JavaScript Error", {
			message: event.message,
			filename: event.filename,
			lineno: event.lineno,
			colno: event.colno,
			stack: event.error?.stack,
		});
	});

	window.addEventListener("unhandledrejection", (event) => {
		logger.error("Unhandled Promise Rejection", {
			reason: event.reason,
			promise: event.promise,
		});
	});
}
```

### Log Analysis

```bash
# Search for errors in logs
grep -r "ERROR" logs/ | tail -20

# Monitor error rate
tail -f logs/app.log | grep -c "ERROR" | awk '{ sum += $1 } END { print "Errors per minute:", sum/60 }'

# Find most common errors
grep "ERROR" logs/app.log | sed 's/.*ERROR //' | sort | uniq -c | sort -nr | head -10
```

## Common Debugging Scenarios

### 1. Component Not Re-rendering

```typescript
// Check if state is actually changing
const [state, setState] = useState(initialValue);

// Add this for debugging
console.log("State before:", state);
setState(newValue);
console.log("State after setState:", state); // This will still show old value

// Use useEffect to check state changes
useEffect(() => {
	console.log("State changed to:", state);
}, [state]);
```

### 2. API Call Not Working

```typescript
// Check network tab in browser devtools
// Verify endpoint URL
console.log("Full URL:", `${API_BASE_URL}${endpoint}`);

// Check request headers
console.log("Request headers:", options.headers);

// Check response
const response = await fetch(url, options);
console.log("Response status:", response.status);
console.log(
	"Response headers:",
	Object.fromEntries(response.headers.entries())
);
```

### 3. Database Query Issues

```typescript
// Log the actual query being executed
console.log("Query:", JSON.stringify(query, null, 2));

// Check connection
const isConnected = await client.db().admin().ping();
console.log("Database connected:", isConnected);

// Time the query
const start = Date.now();
const result = await collection.find(query).toArray();
console.log(
	`Query took ${Date.now() - start}ms, returned ${result.length} documents`
);
```

### 4. Memory Leaks

```typescript
// Use Chrome DevTools Memory tab
// Take heap snapshots before and after actions
// Look for detached DOM nodes or growing object counts

// In code, check for proper cleanup
useEffect(() => {
	const interval = setInterval(() => {
		// Do something
	}, 1000);

	return () => clearInterval(interval); // Cleanup!
}, []);
```

### 5. Performance Issues

```typescript
// Use React DevTools Profiler
// Identify slow components
const SlowComponent = React.memo(function SlowComponent({ data }) {
	// Only re-render when data actually changes
	return <div>{/* expensive operations */}</div>;
});

// Use useMemo for expensive calculations
const expensiveResult = useMemo(() => {
	return expensiveCalculation(inputs);
}, [inputs]);
```

## Debug Checklist

- [ ] Check browser console for errors
- [ ] Verify network requests in devtools
- [ ] Check component state with React DevTools
- [ ] Test API endpoints directly
- [ ] Verify database connections and queries
- [ ] Check environment variables
- [ ] Review recent code changes
- [ ] Test on different browsers/devices
- [ ] Check for race conditions in async code
- [ ] Verify dependencies are up to date
- [ ] Check for memory leaks with heap snapshots</content>
      <parameter name="filePath">c:\Users\Deej\Repos\cnc-tools\.github\instructions\debugging.instructions.md
