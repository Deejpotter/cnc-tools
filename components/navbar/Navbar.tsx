"use client";
// NOTE: All internal navigation uses Next.js's Link component for optimal routing and prefetching.
// Replace with a relevant link for other react projects.
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Auth from "./Auth";

/**
 * Generic navigation item type for portability.
 * Supports dropdowns via optional 'items' array.
 */
export interface NavItem {
	name: string; // Display name
	path?: string; // URL path (for links)
	items?: NavItem[]; // Dropdown items (optional)
}

/**
 * NavbarProps defines the props required for the Navbar component.
 * - brand: Branding text or element for the navbar.
 * - navItems: Array of navigation items (links, dropdowns, etc.).
 * - authProps: Props to pass to the Auth component (optional).
 * - showAuth: Whether to show the Auth section (default: true if authProps provided)
 */
export interface NavbarProps {
	brand: React.ReactNode;
	navItems: NavItem[];
	authProps?: React.ComponentProps<typeof Auth>;
	showAuth?: boolean;
}

/**
 * Navbar component - a reusable, transportable navigation bar.
 * Accepts navigation structure and branding as props, so it can be dropped into any project.
 * Handles dropdowns, active link highlighting, and mobile collapse.
 *
 * To use in a non-Next.js project, replace 'Link' with your router's link component.
 */
const Navbar = ({
	brand,
	navItems,
	authProps,
	showAuth = true,
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
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Check if the given path is active (current page)
	const isActive = (path?: string) => path && pathname === path;

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
						{item.name}
					</span>
					<ul
						className={`dropdown-menu ${
							openDropdown === item.name ? "show" : ""
						}`}
					>
						{item.items.map((sub) => (
							<li key={sub.name}>
								{sub.path ? (
									<Link href={sub.path} onClick={handleLinkClick}>
										<span className="dropdown-item">{sub.name}</span>
									</Link>
								) : (
									<span className="dropdown-item">{sub.name}</span>
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
				{item.path ? (
					<Link href={item.path} onClick={handleLinkClick}>
						<span
							className={`nav-link px-1 py-1 mx-1 ${
								isActive(item.path) ? "active-link" : ""
							}`}
						>
							{item.name}
						</span>
					</Link>
				) : (
					<span className="nav-link px-3 py-2 mx-1">{item.name}</span>
				)}
			</li>
		);
	};

	return (
		// Bootstrap's navbar component with fixed-top class to make it sticky
		// Add shadow when scrolled, and adjust padding/background
		<nav
			className={`navbar navbar-expand-lg navbar-light fixed-top ${
				isScrolled ? "shadow-sm bg-white py-2" : "bg-light py-3"
			} transition-all`}
		>
			<div className="container-fluid">
				{/* Navbar brand (customizable) */}
				<Link href="/" onClick={handleLinkClick}>
					<span
						className={`navbar-brand ${isScrolled ? "fs-5" : "fs-4"} fw-bold`}
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
				{/* To customize Auth, pass props here if your Auth component supports them. Replace or remove as needed for your project. */}
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
