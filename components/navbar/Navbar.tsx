"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Auth from "./Auth";

const Navbar = () => {
	// State for managing the collapsed state of the navbar. Initially set to true (collapsed).
	const [isNavCollapsed, setIsNavCollapsed] = useState(true);

	// State for managing the visibility of the dropdown menu. Initially set to false (hidden).
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	// State for managing the scrolled state of the navbar
	const [isScrolled, setIsScrolled] = useState(false);

	// Get current pathname to highlight active links
	const pathname = usePathname();

	// Function to toggle the collapsed state of the navbar.
	// This will be triggered when the navbar toggler button is clicked.
	const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

	// Function to toggle the visibility of the dropdown menu.
	// This will be triggered when the dropdown menu is clicked.
	const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

	// Function to close the dropdown menu
	const closeDropdown = () => setIsDropdownOpen(false);

	// Function to close both dropdown and mobile navbar
	const handleLinkClick = () => {
		// Close the dropdown menu if it's open
		setIsDropdownOpen(false);
		// Collapse the mobile navbar if it's expanded
		setIsNavCollapsed(true);
	};

	// Effect to listen for scrolling and update isScrolled state
	useEffect(() => {
		const handleScroll = () => {
			// Set isScrolled to true when page is scrolled more than 10px
			if (window.scrollY > 10) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		// Add scroll event listener
		window.addEventListener("scroll", handleScroll);

		// Clean up event listener on unmount
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	// Check if the given path is active (current page)
	const isActive = (path: string) => {
		return pathname === path;
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
				{/* Next.js Link for client-side routing. The navbar brand is wrapped inside the Link. */}
				<Link href="/" onClick={handleLinkClick}>
					<span
						className={`navbar-brand ${isScrolled ? "fs-5" : "fs-4"} fw-bold`}
					>
						CNC Calculations
					</span>
				</Link>

				{/* Button to toggle the navbar on mobile devices. */}
				<button
					className="navbar-toggler"
					type="button"
					onClick={handleNavCollapse} // Set to call handleNavCollapse on click
					aria-expanded={!isNavCollapsed} // Accessibility attribute
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>{" "}
					{/* Hamburger icon from Bootstrap */}
				</button>

				{/* Collapsible part of the navbar. Its visibility is controlled by isNavCollapsed state. */}
				<div
					className={`${isNavCollapsed ? "collapse" : ""} navbar-collapse`}
					id="navbarNav"
				>
					<ul className="navbar-nav">
						{/* Navigation items, each wrapped in a Next.js Link for client-side routing */}
						<li className="nav-item">
							<Link href="/cnc-technical-ai" onClick={handleLinkClick}>
								<span
									className={`nav-link px-3 py-2 mx-1 ${
										isActive("/cnc-technical-ai") ? "active-link" : ""
									}`}
								>
									CNC Technical AI
								</span>
							</Link>
						</li>
						<li className="nav-item">
							<Link href="/cnc-calibration-tool" onClick={handleLinkClick}>
								<span
									className={`nav-link px-3 py-2 mx-1 ${
										isActive("/cnc-calibration-tool") ? "active-link" : ""
									}`}
								>
									CNC Calibration Tool
								</span>
							</Link>
						</li>

						{/* Dropdown Menu - uses onClick to toggle dropdown visibility */}
						<li
							className={`nav-item dropdown`}
							onMouseEnter={() => setIsDropdownOpen(true)}
							onMouseLeave={() => setIsDropdownOpen(false)}
						>
							<span
								className="nav-link dropdown-toggle px-3 py-2 mx-1"
								role="button"
								aria-expanded={isDropdownOpen}
								onClick={toggleDropdown}
							>
								Other Tools
							</span>
							<ul className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}>
								<li>
									<Link
										href="/box-shipping-calculator"
										onClick={handleLinkClick}
									>
										<span className="dropdown-item">
											Box Shipping Calculator
										</span>
									</Link>
								</li>{" "}
								<li>
									<Link href="/enclosure-calculator" onClick={handleLinkClick}>
										<span className="dropdown-item">Enclosure Calculator</span>
									</Link>
								</li>
								<li>
									<Link
										href="/table-enclosure-calculator"
										onClick={handleLinkClick}
									>
										<span className="dropdown-item">
											Table & Enclosure Calculator
										</span>
									</Link>
								</li>
								<li>
									<Link href="/40-series-extrusions" onClick={handleLinkClick}>
										<span className="dropdown-item">40 Series Extrusions</span>
									</Link>
								</li>
								<li>
									<Link href="/20-series-extrusions" onClick={handleLinkClick}>
										<span className="dropdown-item">20 Series Extrusions</span>
									</Link>
								</li>
								{/* Add more dropdown items as needed */}
							</ul>
						</li>
						{/* Add more nav-items as needed */}
					</ul>
				</div>
				<Auth />
			</div>
		</nav>
	);
};

export default Navbar;
