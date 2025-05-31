"use client";
import React from "react";
// NOTE: All internal navigation uses Next.js's Link component for optimal routing and prefetching.
// If you use this component outside Next.js, replace Link with your router's link component.
import Link from "next/link";

/**
 * Interface representing a link item in the footer
 * @interface FooterLink
 * @property {string} label - The text to display for the link
 * @property {string} href - The URL that the link should navigate to
 * @property {boolean} [external=false] - Whether the link is external (opens in new tab)
 */
export interface FooterLink {
	label: string;
	href: string;
	external?: boolean;
}

/**
 * Interface representing a column of links in the footer
 * @interface FooterColumn
 * @property {string} title - The title of the column
 * @property {FooterLink[]} links - The links to display in the column
 */
export interface FooterColumn {
	title: string;
	links: FooterLink[];
}

/**
 * Props for the Footer component
 * @interface FooterProps
 * @property {string} [siteName="CNC Tools"] - The name of the site
 * @property {string} [siteDescription] - A short description of the site
 * @property {FooterColumn[]} [columns] - The columns of links to display
 * @property {boolean} [showCopyright=true] - Whether to show the copyright notice
 * @property {string} [copyrightText] - Custom copyright text
 * @property {string} [className] - Additional CSS classes
 * @property {string} [theme="light"] - The theme of the footer (light or dark)
 * @property {boolean} [sticky=false] - Whether the footer should stick to the bottom
 */
export interface FooterProps {
	siteName?: string;
	siteDescription?: string;
	columns?: FooterColumn[];
	showCopyright?: boolean;
	copyrightText?: string;
	className?: string;
	theme?: "light" | "dark";
	sticky?: boolean;
}

/**
 * Generic Footer component that can be customized with different columns, links, and styling
 *
 * @example
 * // Basic usage
 * <Footer />
 *
 * @example
 * // Customized footer
 * <Footer
 *   siteName="My App"
 *   siteDescription="A description of my application"
 *   columns={[
 *     {
 *       title: "Resources",
 *       links: [
 *         { label: "Home", href: "/" },
 *         { label: "Documentation", href: "/docs" },
 *         { label: "GitHub", href: "https://github.com/user/repo", external: true }
 *       ]
 *     },
 *     {
 *       title: "Legal",
 *       links: [
 *         { label: "Privacy Policy", href: "/privacy" },
 *         { label: "Terms of Service", href: "/terms" }
 *       ]
 *     }
 *   ]}
 *   theme="dark"
 *   sticky={true}
 * />
 *
 * @param {FooterProps} props - The component props
 * @returns {JSX.Element} The rendered Footer component
 */
const Footer: React.FC<FooterProps> = ({
	siteName = "CNC Tools",
	siteDescription = "A collection of mini-applications for CNC machining, 3D printing, and related tasks.",
	columns = [],
	showCopyright = true,
	copyrightText,
	className = "",
	theme = "light",
	sticky = false,
}) => {
	const currentYear = new Date().getFullYear();

	// Default columns if none provided
	const defaultColumns: FooterColumn[] = [
		{
			title: "Tools",
			links: [
				{ label: "CNC Calibration Tool", href: "/cnc-calibration-tool" },
				{ label: "Box Shipping Calculator", href: "/box-shipping-calculator" },
				{ label: "CNC Technical AI", href: "/cnc-technical-ai" },
				{ label: "Enclosure Calculator", href: "/enclosure-calculator" },
				{
					label: "Table & Enclosure Calculator",
					href: "/table-enclosure-calculator",
				},
			],
		},
		{
			title: "Resources",
			links: [
				{ label: "Home", href: "/" },
				{ label: "Documentation", href: "/docs" },
				{
					label: "GitHub",
					href: "https://github.com/deejpotter/cnc-tools",
					external: true,
				},
			],
		},
	];

	// Use provided columns or fallback to defaults
	const footerColumns = columns.length > 0 ? columns : defaultColumns;

	// Generate theme-specific classes
	const themeClasses =
		theme === "dark" ? "bg-dark text-light" : "bg-light text-dark";

	// Generate sticky classes if needed
	const stickyClasses = sticky ? "footer mt-auto py-3" : "";

	return (
		<footer
			className={`py-4 mt-5 border-top ${themeClasses} ${stickyClasses} ${className}`}
		>
			<div className="container">
				<div className="row">
					{/* Copyright and site info */}
					<div className="col-md-6 mb-3 mb-md-0">
						<h5>{siteName}</h5>
						{siteDescription && (
							<p
								className={`${
									theme === "dark" ? "text-light opacity-75" : "text-muted"
								} mb-2`}
							>
								{siteDescription}
							</p>
						)}
						{showCopyright && (
							<p
								className={`${
									theme === "dark" ? "text-light opacity-75" : "text-muted"
								} small`}
							>
								{copyrightText ||
									`© ${currentYear} ${siteName}. All rights reserved.`}
							</p>
						)}
					</div>

					{/* Dynamic columns */}
					{footerColumns.map((column, index) => (
						<div
							key={index}
							className={`col-md-${
								12 / (footerColumns.length + 1)
							} mb-3 mb-md-0`}
						>
							<h6>{column.title}</h6>
							<ul className="list-unstyled">
								{column.links.map((link, linkIndex) => (
									<li key={linkIndex}>
										{link.external ? (
											<a
												href={link.href}
												target="_blank"
												rel="noreferrer"
												className={`text-decoration-none ${
													theme === "dark" ? "text-light" : ""
												}`}
											>
												{link.label}
											</a>
										) : (
											<Link href={link.href}>
												<span
													className={`text-decoration-none ${
														theme === "dark" ? "text-light" : ""
													}`}
												>
													{link.label}
												</span>
											</Link>
										)}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>
		</footer>
	);
};

export default Footer;
