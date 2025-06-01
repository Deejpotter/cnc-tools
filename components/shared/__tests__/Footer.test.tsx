import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Footer from "../layout/Footer";

describe("Footer Component", () => {
	test("renders copyright text correctly", () => {
		const currentYear = new Date().getFullYear();
		render(<Footer copyright="© Test Company" />);

		expect(
			screen.getByText(`© Test Company ${currentYear}`)
		).toBeInTheDocument();
	});

	test("renders columns and links", () => {
		const columns = [
			{
				title: "Company",
				links: [
					{ label: "About Us", href: "/about" },
					{ label: "Contact", href: "/contact" },
				],
			},
			{
				title: "Products",
				links: [
					{ label: "Product 1", href: "/product1" },
					{ label: "Product 2", href: "/product2" },
				],
			},
		];

		render(<Footer copyright="© Test Company" columns={columns} />);

		expect(screen.getByText("Company")).toBeInTheDocument();
		expect(screen.getByText("Products")).toBeInTheDocument();
		expect(screen.getByText("About Us")).toBeInTheDocument();
		expect(screen.getByText("Contact")).toBeInTheDocument();
		expect(screen.getByText("Product 1")).toBeInTheDocument();
		expect(screen.getByText("Product 2")).toBeInTheDocument();
	});

	test("renders social media links", () => {
		const socialLinks = [
			{ icon: "facebook", href: "https://facebook.com" },
			{ icon: "twitter", href: "https://twitter.com" },
		];

		render(<Footer copyright="© Test Company" socialLinks={socialLinks} />);

		// Check for social media links (this assumes there's some icon class or text)
		const links = screen.getAllByRole("link");
		expect(
			links.some((link) => link.getAttribute("href") === "https://facebook.com")
		).toBe(true);
		expect(
			links.some((link) => link.getAttribute("href") === "https://twitter.com")
		).toBe(true);
	});

	test("applies custom theme", () => {
		const { container } = render(
			<Footer copyright="© Test Company" theme="dark" />
		);

		expect(container.firstChild).toHaveClass("bg-dark");
		expect(container.firstChild).toHaveClass("text-light");
	});

	test("applies custom className", () => {
		const { container } = render(
			<Footer copyright="© Test Company" className="custom-footer" />
		);

		expect(container.firstChild).toHaveClass("custom-footer");
	});
});
