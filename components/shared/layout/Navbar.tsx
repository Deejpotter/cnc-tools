"use client";
// NOTE: All internal navigation uses Next.js's Link component for optimal routing and prefetching.
// Replace with a relevant link for other react projects.
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import Auth component if it exists
const Auth = dynamic(() => import("../../navbar/Auth"), {
	ssr: false,
	loading: () => null,
});

/**
 * Generic navigation item type for portability.
 * Supports dropdowns via optional 'items' array.
 */
export interface NavItem {
	name: string; // Display name
	path?: string; // URL path (for links)
	items?: NavItem[]; // Dropdown items (optional)
	icon?: React.ReactNode; // Optional icon
	external?: boolean; // Whether link should open in a new tab
}

/**
 * NavbarProps defines the props required for the Navbar component.
 * @interface NavbarProps
 * @property {React.ReactNode} brand - Branding text or element for the navbar.
 * @property {NavItem[]} navItems - Array of navigation items (links, dropdowns, etc.).
 * @property {any} [authProps] - Props to pass to the Auth component (optional).
 * @property {boolean} [showAuth=true] - Whether to show the Auth section
 * @property {string} [position="fixed-top"] - Position of the navbar (fixed-top, sticky-top, etc.)
 * @property {string} [theme="light"] - Theme of the navbar (light or dark)
 * @property {string} [bgColor] - Background color class (e.g., "bg-primary")
 * @property {string} [textColor] - Text color class (e.g., "text-white")
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [changeOnScroll=true] - Whether to change appearance on scroll
 * @property {string} [expandBreakpoint="lg"] - Breakpoint for navbar collapse (sm, md, lg, xl)
 */
export interface NavbarProps {
	brand: React.ReactNode;
	navItems: NavItem[];
	authProps?: any;
	showAuth?: boolean;
	position?: "fixed-top" | "sticky-top" | "static" | "absolute";
	theme?: "light" | "dark";
	bgColor?: string;
	textColor?: string;
	className?: string;
	changeOnScroll?: boolean;
	expandBreakpoint?: "sm" | "md" | "lg" | "xl";
}

/**
 * Enhanced Navbar component - a reusable, transportable navigation bar.
 * Accepts navigation structure and branding as props, so it can be dropped into any project.
 * Handles dropdowns, active link highlighting, and mobile collapse.
 *
 * @example
 * // Basic usage
 * <Navbar
 *   brand="My App"
 *   navItems={[
 *     { name: "Home", path: "/" },
 *     { name: "About", path: "/about" },
 *     {
 *       name: "Services",
 *       items: [
 *         { name: "Consulting", path: "/services/consulting" },
 *         { name: "Development", path: "/services/development" }
 *       ]
 *     }
 *   ]}
 * />
 *
 * @example
 * // Customized navbar
 * <Navbar
 *   brand={<img src="/logo.png" alt="Logo" height="30" />}
 *   navItems={[...]}
 *   theme="dark"
 *   bgColor="bg-primary"
 *   textColor="text-white"
 *   position="sticky-top"
 *   expandBreakpoint="md"
 * />
 *
 * @param {NavbarProps} props - The component props
 * @returns {JSX.Element} The rendered Navbar component
 */
const Navbar = ({
	brand,
	navItems,
	authProps,
	showAuth = true,
	position = "fixed-top",
	theme = "light",
	bgColor,
	textColor,
	className = "",
	changeOnScroll = true,
	expandBreakpoint = "lg",
}: NavbarProps) => {
	// State for managing the collapsed state of the navbar. Initially set to true (collapsed).
	const [isNavCollapsed, setIsNavCollapsed] = useState(true);
	// State for managing the visibility of the dropdown menu. Initially set to false (hidden).
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);
	// State for managing the scrolled state of the navbar
	const [isScrolled, setIsScrolled] = useState(false);
	// Get current pathname to highlight active links (Next.js only)
	const pathname = usePathname();

	// Toggle the collapsed state of the navbar (for mobile)
	const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

	// Toggle dropdown by name
	const toggleDropdown = (name: string) => {
		setOpenDropdown((prev) => (prev === name ? null : name));
	};

	// Close all dropdowns
	const closeDropdown = () => setOpenDropdown(null);

	// Close both dropdown and mobile navbar
	const handleLinkClick = () => {
		closeDropdown();
		setIsNavCollapsed(true);
	};

	// Listen for scrolling to update isScrolled state
	useEffect(() => {
		if (!changeOnScroll) return;

		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [changeOnScroll]);

	// Check if the given path is active (current page)
	const isActive = (path?: string) => path && pathname === path;

	// Build theme-specific classes
	const getThemeClasses = () => {
		const baseTheme = `navbar-${theme}`;

		if (bgColor) return baseTheme;

		return theme === "dark" ? "navbar-dark bg-dark" : "navbar-light bg-light";
	};

	// Build background color classes
	const getBgColorClasses = () => {
		if (bgColor) return bgColor;

		if (changeOnScroll && isScrolled) {
			return theme === "dark" ? "bg-dark" : "bg-white";
		}

		return theme === "dark" ? "bg-dark" : "bg-light";
	};

	// Render a single nav item (link or dropdown)
	const renderNavItem = (item: NavItem) => {
		if (item.items && item.items.length > 0) {
			// Dropdown menu
			return (
				<li
					key={item.name}
					className="nav-item dropdown"
					onMouseEnter={() => setOpenDropdown(item.name)}
					onMouseLeave={closeDropdown}
				>
					<span
						className="nav-link dropdown-toggle px-3 py-2 mx-1"
						role="button"
						aria-expanded={openDropdown === item.name}
						onClick={() => toggleDropdown(item.name)}
					>
						{item.icon && <span className="me-1">{item.icon}</span>}
						{item.name}
					</span>
					<ul
						className={`dropdown-menu ${
							openDropdown === item.name ? "show" : ""
						}`}
					>
						{item.items.map((sub) => (
							<li key={sub.name}>
								{sub.external ? (
									<a
										href={sub.path}
										className="dropdown-item"
										target="_blank"
										rel="noopener noreferrer"
									>
										{sub.icon && <span className="me-1">{sub.icon}</span>}
										{sub.name}
									</a>
								) : sub.path ? (
									<Link href={sub.path} onClick={handleLinkClick}>
										<span className="dropdown-item">
											{sub.icon && <span className="me-1">{sub.icon}</span>}
											{sub.name}
										</span>
									</Link>
								) : (
									<span className="dropdown-item">
										{sub.icon && <span className="me-1">{sub.icon}</span>}
										{sub.name}
									</span>
								)}
							</li>
						))}
					</ul>
				</li>
			);
		}

		// Regular nav link
		return (
			<li className="nav-item" key={item.name}>
				{item.external ? (
					<a
						href={item.path}
						className={`nav-link px-3 py-2 mx-1 ${textColor || ""}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						{item.icon && <span className="me-1">{item.icon}</span>}
						{item.name}
					</a>
				) : item.path ? (
					<Link href={item.path} onClick={handleLinkClick}>
						<span
							className={`nav-link px-3 py-2 mx-1 ${
								isActive(item.path) ? "active-link" : ""
							} ${textColor || ""}`}
						>
							{item.icon && <span className="me-1">{item.icon}</span>}
							{item.name}
						</span>
					</Link>
				) : (
					<span className={`nav-link px-3 py-2 mx-1 ${textColor || ""}`}>
						{item.icon && <span className="me-1">{item.icon}</span>}
						{item.name}
					</span>
				)}
			</li>
		);
	};

	return (
		<nav
			className={`navbar navbar-expand-${expandBreakpoint} ${getThemeClasses()} ${position} ${
				changeOnScroll && isScrolled ? "shadow-sm py-2" : "py-3"
			} ${getBgColorClasses()} transition-all ${className}`}
		>
			<div className="container-fluid">
				{/* Navbar brand (customizable) */}
				<Link href="/" onClick={handleLinkClick}>
					<span
						className={`navbar-brand ${
							changeOnScroll && isScrolled ? "fs-5" : "fs-4"
						} fw-bold ${textColor || ""}`}
					>
						{brand}
					</span>
				</Link>

				{/* Button to toggle the navbar on mobile devices. */}
				<button
					className="navbar-toggler"
					type="button"
					onClick={handleNavCollapse}
					aria-expanded={!isNavCollapsed}
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>
				</button>

				{/* Collapsible part of the navbar. Its visibility is controlled by isNavCollapsed state. */}
				<div
					className={`${isNavCollapsed ? "collapse" : ""} navbar-collapse`}
					id="navbarNav"
				>
					<ul className="navbar-nav">{navItems.map(renderNavItem)}</ul>
				</div>

				{/* Auth section (optional, customizable) */}
				{showAuth &&
					(authProps && typeof authProps === "object" ? (
						<Auth {...authProps} />
					) : (
						<Auth />
					))}
			</div>
		</nav>
	);
};

export default Navbar;
