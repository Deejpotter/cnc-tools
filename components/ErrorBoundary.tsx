import React from "react";

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in the child component tree.
 * This prevents the entire app from crashing due to a single component failure.
 *
 * Usage: Wrap this around your main layout or any component tree you want to protect.
 */
export class ErrorBoundary extends React.Component<
	{
		children: React.ReactNode;
	},
	{ hasError: boolean; error: any }
> {
	constructor(props: { children: React.ReactNode }) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: any) {
		// Update state so the next render shows the fallback UI.
		return { hasError: true, error };
	}

	componentDidCatch(error: any, errorInfo: any) {
		// You can log the error to an error reporting service here
		if (typeof window !== "undefined") {
			// Log to the browser console for now
			// In production, send to a remote logging service
			// eslint-disable-next-line no-console
			console.error("ErrorBoundary caught an error:", error, errorInfo);
		}
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return (
				<div style={{ padding: 32, textAlign: "center", color: "red" }}>
					<h1>Something went wrong.</h1>
					<pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
						{this.state.error?.toString()}
					</pre>
				</div>
			);
		}
		return this.props.children;
	}
}
