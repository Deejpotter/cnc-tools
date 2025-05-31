"use client";
import React from "react";

/**
 * Props for the Container component
 * @interface ContainerProps
 * @property {React.ReactNode} children - The content to be rendered within the container
 * @property {string} [className] - Optional additional CSS classes
 * @property {boolean} [fluid=false] - Whether the container should be fluid (full width)
 * @property {boolean} [withRow=true] - Whether to wrap children in a Bootstrap row
 * @property {string} [columnClass="col"] - The Bootstrap column class to use
 * @property {string} [maxWidth] - Maximum width of the container (xs, sm, md, lg, xl)
 * @property {string} [background] - Background color class (e.g., "bg-light")
 * @property {string} [padding] - Padding class (e.g., "p-4")
 * @property {string} [margin] - Margin class (e.g., "my-4")
 * @property {boolean} [centered=false] - Whether to center the container content
 * @property {boolean} [shadow=false] - Whether to add a shadow to the container
 * @property {boolean} [border=false] - Whether to add a border to the container
 * @property {boolean} [rounded=false] - Whether to add rounded corners to the container
 */
interface ContainerProps {
	children: React.ReactNode;
	className?: string;
	fluid?: boolean;
	withRow?: boolean;
	columnClass?: string;
	maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
	background?: string;
	padding?: string;
	margin?: string;
	centered?: boolean;
	shadow?: boolean;
	border?: boolean;
	rounded?: boolean;
}

/**
 * A reusable container component for consistent layout
 *
 * This component provides a standard container for content with options
 * for fluid width, row wrapping, column configuration, and additional styling.
 * It's based on Bootstrap's grid system.
 *
 * @example
 * // Basic usage
 * <Container>
 *   <p>Content goes here</p>
 * </Container>
 *
 * @example
 * // With custom styling
 * <Container
 *   fluid
 *   maxWidth="lg"
 *   background="bg-light"
 *   padding="p-4"
 *   shadow
 *   rounded
 * >
 *   <p>Styled content</p>
 * </Container>
 *
 * @param {ContainerProps} props - The component props
 * @returns {JSX.Element} The rendered Container component
 */
const Container: React.FC<ContainerProps> = ({
	children,
	className = "",
	fluid = false,
	withRow = true,
	columnClass = "col",
	maxWidth,
	background,
	padding,
	margin,
	centered = false,
	shadow = false,
	border = false,
	rounded = false,
}) => {
	// Determine the container class based on the fluid prop
	const containerClass = fluid ? "container-fluid" : "container";

	// Build maxWidth class
	const maxWidthClass = maxWidth ? `container-${maxWidth}` : "";

	// Build additional classes
	const additionalClasses = [
		maxWidthClass,
		background || "",
		padding || "",
		margin || "",
		centered ? "text-center" : "",
		shadow ? "shadow" : "",
		border ? "border" : "",
		rounded ? "rounded" : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={`${containerClass} ${additionalClasses}`}>
			{withRow ? (
				<div className="row">
					<div className={columnClass}>{children}</div>
				</div>
			) : (
				children
			)}
		</div>
	);
};

export default Container;
