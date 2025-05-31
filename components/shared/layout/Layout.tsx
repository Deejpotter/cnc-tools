"use client";
import React from "react";
import Container from "./Container";
import Navbar from "./Navbar";
import Footer from "./Footer";
import type { NavbarProps } from "./Navbar";
import type { FooterProps } from "./Footer";

/**
 * Props for the Layout component
 * @interface LayoutProps
 * @property {React.ReactNode} children - Child components to render within the layout
 * @property {boolean} [showNavbar=true] - Whether to show the navbar
 * @property {boolean} [showFooter=true] - Whether to show the footer
 * @property {React.ComponentProps<typeof Navbar>} [navbarProps] - Props to pass to the Navbar component
 * @property {React.ComponentProps<typeof Footer>} [footerProps] - Props to pass to the Footer component
 * @property {React.ComponentProps<typeof Container>} [containerProps] - Props to pass to the Container component
 * @property {boolean} [fullWidth=false] - Whether the container should be full width
 * @property {string} [className] - Additional CSS classes for the main content area
 * @property {string} [mainPadding="py-5"] - Padding for the main content area
 */
interface LayoutProps {
	children: React.ReactNode;
	showNavbar?: boolean;
	showFooter?: boolean;
	navbarProps?: NavbarProps;
	footerProps?: FooterProps;
	containerProps?: React.ComponentProps<typeof Container>;
	fullWidth?: boolean;
	className?: string;
	mainPadding?: string;
}

/**
 * A standard layout component that includes navbar, main content, and footer
 *
 * @example
 * // Basic usage
 * <Layout>
 *   <h1>Page Content</h1>
 * </Layout>
 *
 * @example
 * // With customization
 * <Layout
 *   showNavbar={true}
 *   showFooter={true}
 *   fullWidth={false}
 *   navbarProps={{ brand: "My App", navItems: [...] }}
 *   containerProps={{
 *     maxWidth: "lg",
 *     padding: "p-4",
 *     background: "bg-light"
 *   }}
 * >
 *   <h1>Custom Layout Content</h1>
 * </Layout>
 *
 * @param {LayoutProps} props - The component props
 * @returns {JSX.Element} The rendered Layout component
 */
const Layout: React.FC<LayoutProps> = ({
	children,
	showNavbar = true,
	showFooter = true,
	navbarProps,
	footerProps,
	containerProps,
	fullWidth = false,
	className = "",
	mainPadding = "py-5",
}) => {
	// Calculate the top padding based on whether navbar is shown
	const contentPadding = showNavbar ? "pt-5 mt-5" : "";

	return (
		<div className="d-flex flex-column min-vh-100">
			{showNavbar && <Navbar {...navbarProps} />}

			<main
				className={`flex-grow-1 ${contentPadding} ${mainPadding} ${className}`}
			>
				<Container fluid={fullWidth} {...containerProps}>
					{children}
				</Container>
			</main>

			{showFooter && <Footer {...footerProps} />}
		</div>
	);
};

export default Layout;
