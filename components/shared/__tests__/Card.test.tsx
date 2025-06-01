import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Card from "../display/Card";

describe("Card Component", () => {
	test("renders children correctly", () => {
		render(
			<Card>
				<p data-testid="card-content">Test Content</p>
			</Card>
		);

		expect(screen.getByTestId("card-content")).toBeInTheDocument();
	});

	test("renders title when provided", () => {
		render(<Card title="Card Title">Card content</Card>);

		expect(screen.getByText("Card Title")).toBeInTheDocument();
	});

	test("renders subtitle when provided", () => {
		render(<Card subtitle="Card Subtitle">Card content</Card>);

		expect(screen.getByText("Card Subtitle")).toBeInTheDocument();
	});

	test("applies custom className", () => {
		const { container } = render(
			<Card className="custom-card-class">Card content</Card>
		);

		expect(container.firstChild).toHaveClass("custom-card-class");
	});

	test("applies body className", () => {
		render(
			<Card bodyClassName="custom-body-class">
				<p data-testid="card-content">Content</p>
			</Card>
		);

		const cardBody = screen.getByTestId("card-content").parentElement;
		expect(cardBody).toHaveClass("custom-body-class");
	});

	test("renders with shadow when shadow prop is true", () => {
		const { container } = render(<Card shadow>Card with shadow</Card>);

		expect(container.firstChild).toHaveClass("shadow");
	});

	test("renders without border when border prop is false", () => {
		const { container } = render(
			<Card border={false}>Card without border</Card>
		);

		expect(container.firstChild).not.toHaveClass("border");
	});

	test("applies theme classes", () => {
		const { container, rerender } = render(
			<Card theme="primary">Themed card</Card>
		);

		expect(container.firstChild).toHaveClass("bg-primary");

		rerender(<Card theme="dark">Dark themed card</Card>);

		expect(container.firstChild).toHaveClass("bg-dark");
		expect(container.firstChild).toHaveClass("text-light");
	});
});
