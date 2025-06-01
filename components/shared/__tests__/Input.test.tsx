import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Input from "../forms/Input";

describe("Input Component", () => {
	test("renders text input correctly", () => {
		render(<Input name="testInput" label="Test Input" type="text" />);

		expect(screen.getByLabelText("Test Input")).toBeInTheDocument();
		expect(screen.getByLabelText("Test Input")).toHaveAttribute("type", "text");
	});

	test("renders textarea when type is textarea", () => {
		render(<Input name="testTextarea" label="Test Textarea" type="textarea" />);

		const textarea = screen.getByLabelText("Test Textarea");
		expect(textarea.tagName).toBe("TEXTAREA");
	});

	test("renders select input with options", () => {
		const options = [
			{ value: "option1", label: "Option 1" },
			{ value: "option2", label: "Option 2" },
		];

		render(
			<Input
				name="testSelect"
				label="Test Select"
				type="select"
				options={options}
			/>
		);

		expect(screen.getByLabelText("Test Select")).toBeInTheDocument();
		expect(screen.getByText("Option 1")).toBeInTheDocument();
		expect(screen.getByText("Option 2")).toBeInTheDocument();
	});

	test("renders checkbox input", () => {
		render(<Input name="testCheckbox" label="Test Checkbox" type="checkbox" />);

		const checkbox = screen.getByLabelText("Test Checkbox");
		expect(checkbox).toBeInTheDocument();
		expect(checkbox).toHaveAttribute("type", "checkbox");
	});

	test("calls onChange when input value changes", () => {
		const handleChange = jest.fn();

		render(
			<Input
				name="testInput"
				label="Test Input"
				type="text"
				onChange={handleChange}
			/>
		);

		const input = screen.getByLabelText("Test Input");
		fireEvent.change(input, { target: { value: "test value" } });

		expect(handleChange).toHaveBeenCalled();
	});

	test("applies value to input", () => {
		render(
			<Input
				name="testInput"
				label="Test Input"
				type="text"
				value="Initial Value"
			/>
		);

		expect(screen.getByLabelText("Test Input")).toHaveValue("Initial Value");
	});

	test("renders helper text when provided", () => {
		render(
			<Input
				name="testInput"
				label="Test Input"
				type="text"
				helperText="This is helper text"
			/>
		);

		expect(screen.getByText("This is helper text")).toBeInTheDocument();
	});

	test("shows error message when provided", () => {
		render(
			<Input
				name="testInput"
				label="Test Input"
				type="text"
				error="This field is required"
			/>
		);

		expect(screen.getByText("This field is required")).toBeInTheDocument();
	});
});
