import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Layout from "../layout/Layout";

// Mock the Navbar and Footer components
jest.mock("../layout/Navbar", () => {
	return function MockNavbar(props) {
		return (
			<div data-testid="navbar" {...props}>
				Navbar Component
			</div>
		);
	};
});

jest.mock("../layout/Footer", () => {
	return function MockFooter(props) {
		return (
			<div data-testid="footer" {...props}>
				Footer Component
			</div>
		);
	};
});

describe("Layout Component", () => {
	test("renders children correctly", () => {
		render(
			<Layout>
				<div data-testid="content">Test Content</div>
			</Layout>
		);

		expect(screen.getByTestId("content")).toBeInTheDocument();
		expect(screen.getByText("Test Content")).toBeInTheDocument();
	});

	test("renders navbar and footer by default", () => {
		render(
			<Layout>
				<div>Content</div>
			</Layout>
		);

		expect(screen.getByTestId("navbar")).toBeInTheDocument();
		expect(screen.getByTestId("footer")).toBeInTheDocument();
	});

	test("does not render navbar when withNavbar is false", () => {
		render(
			<Layout withNavbar={false}>
				<div>Content</div>
			</Layout>
		);

		expect(screen.queryByTestId("navbar")).not.toBeInTheDocument();
		expect(screen.getByTestId("footer")).toBeInTheDocument();
	});

	test("does not render footer when withFooter is false", () => {
		render(
			<Layout withFooter={false}>
				<div>Content</div>
			</Layout>
		);

		expect(screen.getByTestId("navbar")).toBeInTheDocument();
		expect(screen.queryByTestId("footer")).not.toBeInTheDocument();
	});

	test("passes props to navbar and footer", () => {
		const navbarProps = {
			brand: "Test Brand",
			items: [{ label: "Home", href: "/" }],
		};

		const footerProps = {
			copyright: "Test Copyright",
		};

		render(
			<Layout navbarProps={navbarProps} footerProps={footerProps}>
				<div>Content</div>
			</Layout>
		);

		expect(screen.getByTestId("navbar")).toHaveAttribute("brand", "Test Brand");
		expect(screen.getByTestId("footer")).toHaveAttribute(
			"copyright",
			"Test Copyright"
		);
	});
});
