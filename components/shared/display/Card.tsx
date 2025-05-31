"use client";
import React from "react";

/**
 * Props for the Card component
 * @interface CardProps
 * @property {React.ReactNode} children - The content to be rendered within the card body
 * @property {string|React.ReactNode} [title] - Optional card title
 * @property {React.ReactNode} [subtitle] - Card subtitle
 * @property {string|React.ReactNode} [image] - Card image (URL or element)
 * @property {string} [imageAlt] - Alt text for the image
 * @property {React.ReactNode} [header] - Optional custom header content
 * @property {React.ReactNode} [footer] - Optional footer content
 * @property {string} [className] - Additional CSS classes for the card
 * @property {string} [bodyClassName] - Additional CSS classes for the card body
 * @property {string} [headerClassName] - Additional CSS classes for the card header
 * @property {string} [footerClassName] - Additional CSS classes for the card footer
 * @property {React.CSSProperties} [style] - Inline styles
 * @property {boolean} [shadow=false] - Whether to add shadow
 * @property {boolean} [border=true] - Whether to add border
 * @property {string} [width] - Card width
 * @property {React.ReactNode} [actions] - Action buttons/links
 * @property {() => void} [onClick] - Click handler
 * @property {boolean} [clickable=false] - Whether the card is clickable
 * @property {string} [imagePosition="top"] - Position of the image
 * @property {string} [theme="light"] - Card theme
 */
interface CardProps {
	children: React.ReactNode;
	title?: string | React.ReactNode;
	subtitle?: React.ReactNode;
	image?: string | React.ReactNode;
	imageAlt?: string;
	header?: React.ReactNode;
	footer?: React.ReactNode;
	className?: string;
	bodyClassName?: string;
	headerClassName?: string;
	footerClassName?: string;
	style?: React.CSSProperties;
	shadow?: boolean;
	border?: boolean;
	width?: string;
	actions?: React.ReactNode;
	onClick?: () => void;
	clickable?: boolean;
	imagePosition?: "top" | "bottom" | "overlay";
	theme?:
		| "light"
		| "dark"
		| "primary"
		| "secondary"
		| "success"
		| "danger"
		| "warning"
		| "info";
}

/**
 * A reusable card component with extensive customization options
 *
 * This component provides a standard card layout based on Bootstrap's card component.
 * It supports custom headers, footers, images, actions, themes, and additional styling options.
 *
 * @example
 * // Basic usage
 * <Card title="Card Title">
 *   <p>This is the card content</p>
 * </Card>
 *
 * @example
 * // With image and actions
 * <Card
 *   title="Featured"
 *   subtitle="Card subtitle"
 *   image="/path/to/image.jpg"
 *   imageAlt="Card image"
 *   shadow
 *   actions={
 *     <>
 *       <button className="btn btn-primary">Action</button>
 *       <button className="btn btn-secondary">Another action</button>
 *     </>
 *   }
 * >
 *   <p>Some quick example text to build on the card title.</p>
 * </Card>
 *
 * @param {CardProps} props - The component props
 * @returns {JSX.Element} The rendered Card component
 */
const Card: React.FC<CardProps> = ({
	children,
	title,
	subtitle,
	image,
	imageAlt = "Card image",
	header,
	footer,
	className = "",
	bodyClassName = "",
	headerClassName = "",
	footerClassName = "",
	style,
	shadow = false,
	border = true,
	width,
	actions,
	onClick,
	clickable = false,
	imagePosition = "top",
	theme = "light",
}) => {
	// Generate theme-specific classes
	const getThemeClasses = () => {
		if (theme === "light") return "";

		if (theme === "dark") return "bg-dark text-white";

		return `bg-${theme} ${
			["primary", "dark", "danger", "success"].includes(theme)
				? "text-white"
				: ""
		}`;
	};

	// Build card classes
	const cardClasses = [
		"card",
		"mb-4",
		shadow ? "shadow" : "",
		!border ? "border-0" : "",
		clickable || onClick ? "cursor-pointer" : "",
		getThemeClasses(),
		className,
	]
		.filter(Boolean)
		.join(" ");

	// Calculate the custom width style
	const cardStyle = {
		...style,
		width: width || style?.width || "",
		cursor: clickable || onClick ? "pointer" : undefined,
	};

	// Render card image based on position
	const renderImage = () => {
		if (!image) return null;

		if (typeof image === "string") {
			const imgClasses =
				imagePosition === "overlay" ? "card-img" : `card-img-${imagePosition}`;

			return <img src={image} className={imgClasses} alt={imageAlt} />;
		}

		// If image is a React node, just render it
		return image;
	};

	return (
		<div className={cardClasses} style={cardStyle} onClick={onClick}>
			{/* Card header (if provided) */}
			{(header || title) && imagePosition !== "overlay" && (
				<div className={`card-header ${headerClassName}`}>
					{header ||
						(typeof title === "string" ? (
							<h5 className="mb-0">{title}</h5>
						) : (
							title
						))}
				</div>
			)}

			{/* Card image if position is top */}
			{image && imagePosition === "top" && renderImage()}

			{/* Overlay content if image position is overlay */}
			{image && imagePosition === "overlay" && (
				<>
					{renderImage()}
					<div className="card-img-overlay">
						{title &&
							(typeof title === "string" ? (
								<h5 className="card-title">{title}</h5>
							) : (
								title
							))}
						{subtitle && (
							<h6 className="card-subtitle mb-2 text-muted">{subtitle}</h6>
						)}
						<div className="card-text">{children}</div>
						{actions && <div className="mt-3 d-flex gap-2">{actions}</div>}
					</div>
				</>
			)}

			{/* Regular card body if not an overlay */}
			{imagePosition !== "overlay" && (
				<div className={`card-body ${bodyClassName}`}>
					{!header &&
						title &&
						imagePosition !== "top" &&
						(typeof title === "string" ? (
							<h5 className="card-title">{title}</h5>
						) : (
							title
						))}
					{subtitle && (
						<h6 className="card-subtitle mb-2 text-muted">{subtitle}</h6>
					)}

					{/* Card content */}
					{children}

					{/* Card actions */}
					{actions && <div className="mt-3 d-flex gap-2">{actions}</div>}
				</div>
			)}

			{/* Card image if position is bottom */}
			{image && imagePosition === "bottom" && renderImage()}

			{/* Card footer */}
			{footer && (
				<div className={`card-footer ${footerClassName}`}>{footer}</div>
			)}
		</div>
	);
};

export default Card;
