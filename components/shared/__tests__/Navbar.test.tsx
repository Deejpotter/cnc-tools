import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Navbar from "../layout/Navbar";

// Mock useRouter
jest.mock("next/navigation", () => ({
	useRouter: jest.fn(() => ({
		push: jest.fn(),
		pathname: "/",
	})),
	usePathname: jest.fn(() => "/"),
}));

describe("Navbar Component", () => {
	test("renders brand name correctly", () => {
		render(<Navbar brand="Test Brand" items={[]} />);

		expect(screen.getByText("Test Brand")).toBeInTheDocument();
	});

	test("renders navigation items", () => {
		const navItems = [
			{ label: "Home", href: "/" },
			{ label: "About", href: "/about" },
			{ label: "Contact", href: "/contact" },
		];

		render(<Navbar brand="Test Brand" items={navItems} />);

		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByText("About")).toBeInTheDocument();
		expect(screen.getByText("Contact")).toBeInTheDocument();
	});

	test("renders dropdown menu items", () => {
		const navItems = [
			{
				label: "Products",
				href: "#",
				dropdown: [
					{ label: "Product 1", href: "/product1" },
					{ label: "Product 2", href: "/product2" },
				],
			},
		];

		render(<Navbar brand="Test Brand" items={navItems} />);

		expect(screen.getByText("Products")).toBeInTheDocument();
		expect(screen.getByText("Product 1")).toBeInTheDocument();
		expect(screen.getByText("Product 2")).toBeInTheDocument();
	});

	test("applies custom theme", () => {
		const { container } = render(
			<Navbar brand="Test Brand" items={[]} theme="dark" />
		);

		expect(container.firstChild).toHaveClass("navbar-dark");
		expect(container.firstChild).toHaveClass("bg-dark");
	});

	test("applies custom className", () => {
		const { container } = render(
			<Navbar brand="Test Brand" items={[]} className="custom-navbar" />
		);

		expect(container.firstChild).toHaveClass("custom-navbar");
	});
});
