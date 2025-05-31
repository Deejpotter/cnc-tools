"use client";
import React, { useState, useEffect } from "react";

/**
 * Props for the Alert component
 * @interface AlertProps
 * @property {React.ReactNode} children - The content of the alert
 * @property {string} [variant="info"] - The alert variant/color
 * @property {boolean} [dismissible=false] - Whether the alert can be dismissed
 * @property {number} [autoHideDelay] - Delay in ms after which the alert automatically hides
 * @property {string} [icon] - Custom icon to display in the alert
 * @property {string} [title] - Title for the alert
 * @property {string} [className] - Additional CSS classes
 * @property {() => void} [onClose] - Callback when alert is closed
 * @property {boolean} [show=true] - Whether the alert is visible
 * @property {boolean} [outline=false] - Whether to use the outlined style
 * @property {boolean} [animate=true] - Whether to animate the alert
 */
export interface AlertProps {
	children: React.ReactNode;
	variant?:
		| "primary"
		| "secondary"
		| "success"
		| "danger"
		| "warning"
		| "info"
		| "light"
		| "dark";
	dismissible?: boolean;
	autoHideDelay?: number;
	icon?: React.ReactNode;
	title?: string;
	className?: string;
	onClose?: () => void;
	show?: boolean;
	outline?: boolean;
	animate?: boolean;
}

/**
 * Generic Alert component with support for various variants, icons, animations
 *
 * @example
 * // Basic usage
 * <Alert variant="success">
 *   Operation was successful!
 * </Alert>
 *
 * @example
 * // Dismissible alert with auto-hide
 * <Alert
 *   variant="warning"
 *   dismissible
 *   autoHideDelay={5000}
 *   title="Warning!"
 *   icon={<i className="bi bi-exclamation-triangle-fill"></i>}
 * >
 *   This alert will disappear in 5 seconds.
 * </Alert>
 *
 * @param {AlertProps} props - The component props
 * @returns {JSX.Element | null} The rendered Alert component or null if hidden
 */
const Alert: React.FC<AlertProps> = ({
	children,
	variant = "info",
	dismissible = false,
	autoHideDelay,
	icon,
	title,
	className = "",
	onClose,
	show = true,
	outline = false,
	animate = true,
}) => {
	const [visible, setVisible] = useState(show);
	const [animationState, setAnimationState] = useState<
		"enter" | "exit" | "shown"
	>(show ? (animate ? "enter" : "shown") : "exit");

	// Handle visibility change from props
	useEffect(() => {
		if (show && !visible) {
			setVisible(true);
			setAnimationState(animate ? "enter" : "shown");
		} else if (!show && visible) {
			handleClose();
		}
	}, [show]);

	// Handle auto-hide
	useEffect(() => {
		if (autoHideDelay && visible) {
			const timer = setTimeout(() => {
				handleClose();
			}, autoHideDelay);

			return () => clearTimeout(timer);
		}
	}, [autoHideDelay, visible]);

	// Handle animation transitions
	useEffect(() => {
		if (animationState === "enter") {
			// After entering, mark as shown
			const timer = setTimeout(() => {
				setAnimationState("shown");
			}, 300); // match the CSS transition duration

			return () => clearTimeout(timer);
		}
	}, [animationState]);

	// Handle close button click
	const handleClose = () => {
		if (animate) {
			setAnimationState("exit");
			// Wait for animation to complete before hiding
			setTimeout(() => {
				setVisible(false);
				if (onClose) onClose();
			}, 300); // match the CSS transition duration
		} else {
			setVisible(false);
			if (onClose) onClose();
		}
	};

	// If not visible, don't render anything
	if (!visible) return null;

	// Get animation classes
	const getAnimationClass = () => {
		if (!animate) return "";

		switch (animationState) {
			case "enter":
				return "alert-enter";
			case "exit":
				return "alert-exit";
			default:
				return "";
		}
	};

	// Determine the correct alert classes
	const alertClasses = [
		"alert",
		outline ? `alert-outline-${variant}` : `alert-${variant}`,
		dismissible ? "alert-dismissible fade show" : "",
		getAnimationClass(),
		className,
	]
		.filter(Boolean)
		.join(" ");

	// Get default icon based on variant if no custom icon provided
	const getDefaultIcon = () => {
		if (icon) return icon;

		switch (variant) {
			case "success":
				return <i className="bi bi-check-circle-fill me-2"></i>;
			case "danger":
				return <i className="bi bi-x-circle-fill me-2"></i>;
			case "warning":
				return <i className="bi bi-exclamation-triangle-fill me-2"></i>;
			case "info":
				return <i className="bi bi-info-circle-fill me-2"></i>;
			default:
				return null;
		}
	};

	return (
		<div
			className={alertClasses}
			role="alert"
			style={{
				transition: animate ? "opacity 0.3s, transform 0.3s" : undefined,
			}}
		>
			{/* Alert content with optional icon and title */}
			<div className="d-flex align-items-start">
				{getDefaultIcon()}

				<div className="flex-grow-1">
					{title && <h5 className="alert-heading">{title}</h5>}
					{children}
				</div>
			</div>

			{/* Dismiss button */}
			{dismissible && (
				<button
					type="button"
					className="btn-close"
					aria-label="Close"
					onClick={handleClose}
				></button>
			)}

			{/* Add CSS for animations - this will be included once per component */}
			<style jsx>{`
				.alert-enter {
					opacity: 0;
					transform: translateY(-10px);
				}
				.alert-exit {
					opacity: 0;
					transform: translateY(10px);
				}
				.alert-outline-primary {
					color: var(--bs-primary);
					background-color: transparent;
					border-color: var(--bs-primary);
				}
				.alert-outline-secondary {
					color: var(--bs-secondary);
					background-color: transparent;
					border-color: var(--bs-secondary);
				}
				.alert-outline-success {
					color: var(--bs-success);
					background-color: transparent;
					border-color: var(--bs-success);
				}
				.alert-outline-danger {
					color: var(--bs-danger);
					background-color: transparent;
					border-color: var(--bs-danger);
				}
				.alert-outline-warning {
					color: var(--bs-warning);
					background-color: transparent;
					border-color: var(--bs-warning);
				}
				.alert-outline-info {
					color: var(--bs-info);
					background-color: transparent;
					border-color: var(--bs-info);
				}
				.alert-outline-light {
					color: var(--bs-light);
					background-color: transparent;
					border-color: var(--bs-light);
				}
				.alert-outline-dark {
					color: var(--bs-dark);
					background-color: transparent;
					border-color: var(--bs-dark);
				}
			`}</style>
		</div>
	);
};

export default Alert;
