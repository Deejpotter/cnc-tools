"use client";
import Link from "next/link"; 
import { useState } from "react"; 
import Auth from "./Auth"; 
const Navbar = () => {
	// State for managing the collapsed state of the navbar. Initially set to true (collapsed).
	const [isNavCollapsed, setIsNavCollapsed] = useState(true);

	// State for managing the visibility of the dropdown menu. Initially set to false (hidden).
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	// Function to toggle the collapsed state of the navbar.
	// This will be triggered when the navbar toggler button is clicked.
	const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

	// Function to toggle the visibility of the dropdown menu.
	// This will be triggered when the dropdown menu is clicked.
	const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

	return (
		// Bootstrap's navbar component
		<nav className="navbar navbar-expand-lg navbar-light bg-light">
			<div className="container-fluid">
				{/* Next.js Link for client-side routing. The navbar brand is wrapped inside the Link. */}
				<Link href="/">
					<span className="navbar-brand">CNC Calculations</span>
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
							<Link href="/cnc-technical-ai">
								<span className="nav-link">CNC Technical AI</span>
							</Link>
						</li>
						<li className="nav-item">
							<Link href="/cnc-calibration-tool">
								<span className="nav-link">CNC Calibration Tool</span>
							</Link>
						</li>

						{/* Dropdown Menu */}
						<li className={`nav-item dropdown`} onClick={toggleDropdown}>
							<span
								className="nav-link dropdown-toggle"
								role="button"
								aria-expanded={isDropdownOpen}
							>
								Other Tools
							</span>
							<ul className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}>
								<li>
									<Link href="/box-shipping-calculator">
										<span className="dropdown-item">
											Box Shipping Calculator
										</span>
									</Link>
								</li>
								<li>
									<Link href="/enclosure-calculator">
										<span className="dropdown-item">Enclosure Calculator</span>
									</Link>
								</li>
								<li>
									<Link href="/40-series-extrusions">
										<span className="dropdown-item">40 Series Extrusions</span>
									</Link>
								</li>
								<li>
									<Link href="/20-series-extrusions">
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