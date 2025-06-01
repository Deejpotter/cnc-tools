/**
 * Tests for ItemAddForm Component
 * Updated: June 1, 2025
 * Author: Test Suite
 * Description: Comprehensive tests for the ItemAddForm component covering
 * form validation, submission, preset functionality, and user interactions.
 * Updated to match current ShippingItem interface structure.
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ItemAddForm from "../ItemAddForm";
import ShippingItem from "@/types/box-shipping-calculator/ShippingItem";

describe("ItemAddForm", () => {
	// Mock the onAddItem function
	const mockOnAddItem = jest.fn();

	beforeEach(() => {
		// Clear mock before each test
		mockOnAddItem.mockClear();
	});

	it("renders the form with all required fields", () => {
		render(<ItemAddForm onAddItem={mockOnAddItem} />);

		// Check for form title
		expect(screen.getByText("Add New Item")).toBeInTheDocument();

		// Check for input fields
		expect(screen.getByLabelText(/Item Name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/SKU/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Length/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Width/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Height/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument();

		// Check for buttons
		expect(
			screen.getByRole("button", { name: /Add Item/i })
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Reset/i })).toBeInTheDocument();
	});
	it("validates required fields when submitting", async () => {
		render(<ItemAddForm onAddItem={mockOnAddItem} />);

		// Submit form without filling any fields
		fireEvent.click(screen.getByRole("button", { name: /Add Item/i }));

		// Check that form was marked as validated but onAddItem was not called
		// (HTML5 validation prevents submission)
		expect(mockOnAddItem).not.toHaveBeenCalled();
	});
	it("submits the form with valid data", async () => {
		render(<ItemAddForm onAddItem={mockOnAddItem} />);

		// Fill form with valid data
		fireEvent.change(screen.getByLabelText(/Item Name/i), {
			target: { value: "Test Item" },
		});
		fireEvent.change(screen.getByLabelText(/SKU/i), {
			target: { value: "TEST123" },
		});
		fireEvent.change(screen.getByLabelText(/Length/i), {
			target: { value: "100" },
		});
		fireEvent.change(screen.getByLabelText(/Width/i), {
			target: { value: "80" },
		});
		fireEvent.change(screen.getByLabelText(/Height/i), {
			target: { value: "30" },
		});
		fireEvent.change(screen.getByLabelText(/Weight/i), {
			target: { value: "250" },
		});

		// Submit form
		fireEvent.click(screen.getByRole("button", { name: /Add Item/i }));

		// Check that onAddItem was called with correct data structure
		await waitFor(
			() => {
				expect(mockOnAddItem).toHaveBeenCalledWith({
					_id: null,
					name: "Test Item",
					sku: "TEST123",
					length: 100,
					width: 80,
					height: 30,
					weight: 250,
					deletedAt: null,
					updatedAt: expect.any(Date),
					quantity: 1,
				});
			},
			{ timeout: 1000 }
		);
	});

	it("applies dimension presets when clicked", () => {
		render(<ItemAddForm onAddItem={mockOnAddItem} />);

		// Click on small preset
		fireEvent.click(screen.getByText(/Small/i));

		// Check that dimensions were applied
		expect(screen.getByLabelText(/Length/i)).toHaveValue("100");
		expect(screen.getByLabelText(/Width/i)).toHaveValue("80");
		expect(screen.getByLabelText(/Height/i)).toHaveValue("30");
		expect(screen.getByLabelText(/Weight/i)).toHaveValue("250");

		// Click on medium preset
		fireEvent.click(screen.getByText(/Medium/i));

		// Check that dimensions were updated
		expect(screen.getByLabelText(/Length/i)).toHaveValue("200");
		expect(screen.getByLabelText(/Width/i)).toHaveValue("150");
		expect(screen.getByLabelText(/Height/i)).toHaveValue("50");
		expect(screen.getByLabelText(/Weight/i)).toHaveValue("500");

		// Click on large preset
		fireEvent.click(screen.getByText(/Large/i));

		// Check that dimensions were updated
		expect(screen.getByLabelText(/Length/i)).toHaveValue("300");
		expect(screen.getByLabelText(/Width/i)).toHaveValue("200");
		expect(screen.getByLabelText(/Height/i)).toHaveValue("100");
		expect(screen.getByLabelText(/Weight/i)).toHaveValue("1000");
	});

	it("resets the form when reset button is clicked", () => {
		render(<ItemAddForm onAddItem={mockOnAddItem} />);

		// Fill form with data
		fireEvent.change(screen.getByLabelText(/Item Name/i), {
			target: { value: "Test Item" },
		});
		fireEvent.change(screen.getByLabelText(/Length/i), {
			target: { value: "100" },
		});

		// Click reset button
		fireEvent.click(screen.getByRole("button", { name: /Reset/i }));

		// Check that form was reset
		expect(screen.getByLabelText(/Item Name/i)).toHaveValue("");
		expect(screen.getByLabelText(/Length/i)).toHaveValue("");
	});

	it("submits form with empty SKU when not provided", async () => {
		render(<ItemAddForm onAddItem={mockOnAddItem} />);

		// Fill form with valid data but leave SKU empty
		fireEvent.change(screen.getByLabelText(/Item Name/i), {
			target: { value: "Test Item No SKU" },
		});
		fireEvent.change(screen.getByLabelText(/Length/i), {
			target: { value: "150" },
		});
		fireEvent.change(screen.getByLabelText(/Width/i), {
			target: { value: "100" },
		});
		fireEvent.change(screen.getByLabelText(/Height/i), {
			target: { value: "50" },
		});
		fireEvent.change(screen.getByLabelText(/Weight/i), {
			target: { value: "500" },
		});

		// Submit form
		fireEvent.click(screen.getByRole("button", { name: /Add Item/i }));

		// Check that onAddItem was called with empty SKU
		await waitFor(
			() => {
				expect(mockOnAddItem).toHaveBeenCalledWith({
					_id: null,
					name: "Test Item No SKU",
					sku: "",
					length: 150,
					width: 100,
					height: 50,
					weight: 500,
					deletedAt: null,
					updatedAt: expect.any(Date),
					quantity: 1,
				});
			},
			{ timeout: 1000 }
		);
	});

	it("rounds decimal values when submitting", async () => {
		render(<ItemAddForm onAddItem={mockOnAddItem} />);

		// Fill form with decimal values
		fireEvent.change(screen.getByLabelText(/Item Name/i), {
			target: { value: "Decimal Test Item" },
		});
		fireEvent.change(screen.getByLabelText(/Length/i), {
			target: { value: "100.7" },
		});
		fireEvent.change(screen.getByLabelText(/Width/i), {
			target: { value: "80.3" },
		});
		fireEvent.change(screen.getByLabelText(/Height/i), {
			target: { value: "30.9" },
		});
		fireEvent.change(screen.getByLabelText(/Weight/i), {
			target: { value: "250.2" },
		});

		// Submit form
		fireEvent.click(screen.getByRole("button", { name: /Add Item/i }));

		// Check that values are rounded correctly
		await waitFor(
			() => {
				expect(mockOnAddItem).toHaveBeenCalledWith({
					_id: null,
					name: "Decimal Test Item",
					sku: "",
					length: 101, // 100.7 rounded to 101
					width: 80, // 80.3 rounded to 80
					height: 31, // 30.9 rounded to 31
					weight: 250, // 250.2 rounded to 250
					deletedAt: null,
					updatedAt: expect.any(Date),
					quantity: 1,
				});
			},
			{ timeout: 1000 }
		);
	});

	it("resets form after successful submission", async () => {
		render(<ItemAddForm onAddItem={mockOnAddItem} />);

		// Fill form with valid data
		fireEvent.change(screen.getByLabelText(/Item Name/i), {
			target: { value: "Reset Test Item" },
		});
		fireEvent.change(screen.getByLabelText(/SKU/i), {
			target: { value: "RESET123" },
		});
		fireEvent.change(screen.getByLabelText(/Length/i), {
			target: { value: "200" },
		});
		fireEvent.change(screen.getByLabelText(/Width/i), {
			target: { value: "150" },
		});
		fireEvent.change(screen.getByLabelText(/Height/i), {
			target: { value: "75" },
		});
		fireEvent.change(screen.getByLabelText(/Weight/i), {
			target: { value: "800" },
		});

		// Submit form
		fireEvent.click(screen.getByRole("button", { name: /Add Item/i }));

		// Wait for form to reset after submission delay
		await waitFor(
			() => {
				expect(screen.getByLabelText(/Item Name/i)).toHaveValue("");
				expect(screen.getByLabelText(/SKU/i)).toHaveValue("");
				expect(screen.getByLabelText(/Length/i)).toHaveValue("");
				expect(screen.getByLabelText(/Width/i)).toHaveValue("");
				expect(screen.getByLabelText(/Height/i)).toHaveValue("");
				expect(screen.getByLabelText(/Weight/i)).toHaveValue("");
			},
			{ timeout: 1000 }
		);
	});

	it("shows form validation state after submission attempt", () => {
		render(<ItemAddForm onAddItem={mockOnAddItem} />);

		// Try to submit without filling fields
		fireEvent.click(screen.getByRole("button", { name: /Add Item/i }));

		// Check that form has validation class applied
		const form = screen
			.getByRole("button", { name: /Add Item/i })
			.closest("form");
		expect(form).toHaveClass("was-validated");
	});

	it("handles input field changes correctly", () => {
		render(<ItemAddForm onAddItem={mockOnAddItem} />);

		// Test all input fields
		const nameInput = screen.getByLabelText(/Item Name/i);
		const skuInput = screen.getByLabelText(/SKU/i);
		const lengthInput = screen.getByLabelText(/Length/i);
		const widthInput = screen.getByLabelText(/Width/i);
		const heightInput = screen.getByLabelText(/Height/i);
		const weightInput = screen.getByLabelText(/Weight/i);

		// Change all field values
		fireEvent.change(nameInput, { target: { value: "Test Input Item" } });
		fireEvent.change(skuInput, { target: { value: "INPUT123" } });
		fireEvent.change(lengthInput, { target: { value: "123" } });
		fireEvent.change(widthInput, { target: { value: "456" } });
		fireEvent.change(heightInput, { target: { value: "789" } });
		fireEvent.change(weightInput, { target: { value: "999" } });

		// Verify all values are set correctly
		expect(nameInput).toHaveValue("Test Input Item");
		expect(skuInput).toHaveValue("INPUT123");
		expect(lengthInput).toHaveValue("123");
		expect(widthInput).toHaveValue("456");
		expect(heightInput).toHaveValue("789");
		expect(weightInput).toHaveValue("999");
	});
});
