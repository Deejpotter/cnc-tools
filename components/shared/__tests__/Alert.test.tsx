import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Alert from "../display/Alert";

// Mock timer functions
jest.useFakeTimers();

describe("Alert Component", () => {
	test("renders with default props", () => {
		render(<Alert>Test alert message</Alert>);

		expect(screen.getByText("Test alert message")).toBeInTheDocument();
	});

	test("renders with custom variant", () => {
		const { container } = render(
			<Alert variant="success">Success message</Alert>
		);

		expect(container.firstChild).toHaveClass("alert-success");
	});

	test("renders with title when provided", () => {
		render(<Alert title="Alert Title">Alert content</Alert>);

		expect(screen.getByText("Alert Title")).toBeInTheDocument();
		expect(screen.getByText("Alert content")).toBeInTheDocument();
	});

	test("applies outline style when outline prop is true", () => {
		const { container } = render(
			<Alert variant="warning" outline>
				Outlined alert
			</Alert>
		);

		expect(container.firstChild).toHaveClass("alert-outline-warning");
		expect(container.firstChild).not.toHaveClass("alert-warning");
	});

	test("applies custom className", () => {
		const { container } = render(
			<Alert className="custom-alert-class">Alert with custom class</Alert>
		);

		expect(container.firstChild).toHaveClass("custom-alert-class");
	});

	test("does not render when show is false", () => {
		const { container } = render(
			<Alert show={false}>This should not be visible</Alert>
		);

		expect(container.firstChild).toBeNull();
	});
});
