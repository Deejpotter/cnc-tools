import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Form from "../forms/Form";

describe("Form Component", () => {
	const mockSubmit = jest.fn();

	beforeEach(() => {
		mockSubmit.mockClear();
	});

	test("renders form fields correctly", () => {
		const fields = [
			{ name: "name", label: "Name", type: "text" },
			{ name: "email", label: "Email", type: "email" },
			{ name: "message", label: "Message", type: "textarea" },
		];

		render(<Form fields={fields} onSubmit={mockSubmit} />);

		expect(screen.getByLabelText("Name")).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByLabelText("Message")).toBeInTheDocument();
	});

	test("renders required fields with asterisk", () => {
		const fields = [
			{ name: "name", label: "Name", type: "text", required: true },
		];

		render(<Form fields={fields} onSubmit={mockSubmit} />);

		expect(screen.getByText("*")).toBeInTheDocument();
	});

	test("renders submit button with custom text", () => {
		const fields = [{ name: "name", label: "Name", type: "text" }];

		render(
			<Form fields={fields} onSubmit={mockSubmit} submitText="Send Message" />
		);

		expect(screen.getByText("Send Message")).toBeInTheDocument();
	});

	test("applies custom className", () => {
		const fields = [{ name: "name", label: "Name", type: "text" }];

		const { container } = render(
			<Form fields={fields} onSubmit={mockSubmit} className="custom-form" />
		);

		expect(container.firstChild).toHaveClass("custom-form");
	});

	test("renders form with initial values", () => {
		const fields = [
			{ name: "name", label: "Name", type: "text" },
			{ name: "email", label: "Email", type: "email" },
		];

		const initialValues = {
			name: "John Doe",
			email: "john@example.com",
		};

		render(
			<Form
				fields={fields}
				initialValues={initialValues}
				onSubmit={mockSubmit}
			/>
		);

		expect(screen.getByLabelText("Name")).toHaveValue("John Doe");
		expect(screen.getByLabelText("Email")).toHaveValue("john@example.com");
	});
});
