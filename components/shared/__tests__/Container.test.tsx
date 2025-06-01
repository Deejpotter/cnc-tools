import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Container from "../layout/Container";

describe("Container Component", () => {
	test("renders children correctly", () => {
		render(
			<Container>
				<p data-testid="child-element">Test Content</p>
			</Container>
		);

		expect(screen.getByTestId("child-element")).toBeInTheDocument();
		expect(screen.getByText("Test Content")).toBeInTheDocument();
	});

	test("renders with default container class", () => {
		const { container } = render(
			<Container>
				<p>Content</p>
			</Container>
		);

		const containerElement = container.firstChild;
		expect(containerElement).toHaveClass("container");
		expect(containerElement).not.toHaveClass("container-fluid");
	});

	test("renders fluid container when fluid prop is true", () => {
		const { container } = render(
			<Container fluid>
				<p>Content</p>
			</Container>
		);

		expect(container.firstChild).toHaveClass("container-fluid");
	});

	test("applies custom width classes", () => {
		const { container } = render(
			<Container maxWidth="lg">
				<p>Content</p>
			</Container>
		);

		expect(container.firstChild).toHaveClass("container-lg");
	});

	test("applies custom className", () => {
		const { container } = render(
			<Container className="custom-class">
				<p>Content</p>
			</Container>
		);

		expect(container.firstChild).toHaveClass("custom-class");
	});
});
