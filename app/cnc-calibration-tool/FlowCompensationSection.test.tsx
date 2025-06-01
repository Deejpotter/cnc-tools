/**
 * Tests for FlowCompensationSection Component
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import FlowCompensationSection from "./FlowCompensationSection";

describe("FlowCompensationSection", () => {
	it("renders the component with default values", () => {
		render(<FlowCompensationSection />);

		// Check that component title is rendered
		expect(screen.getByText("Flow Compensation")).toBeInTheDocument();

		// Check that the description is rendered
		expect(
			screen.getByText(
				/Flow compensation is used to compensate for the expansion of the filament/
			)
		).toBeInTheDocument();

		// Check that input fields are rendered with correct default values
		expect(screen.getByLabelText("Current Flow %")).toHaveValue("100");
		expect(screen.getByLabelText("Nozzle Width")).toHaveValue("0.4");

		// Check that all wall measurement inputs are empty
		expect(screen.getByPlaceholderText("Side 1")).toHaveValue("");
		expect(screen.getByPlaceholderText("Side 2")).toHaveValue("");
		expect(screen.getByPlaceholderText("Side 3")).toHaveValue("");
		expect(screen.getByPlaceholderText("Side 4")).toHaveValue("");

		// Check that the result is empty initially
		expect(screen.getByText("—")).toBeInTheDocument();
	});

	it("calculates new flow percentage when all inputs are provided", async () => {
		render(<FlowCompensationSection />);

		// Get input fields
		const currentFlowInput = screen.getByLabelText("Current Flow %");
		const nozzleWidthInput = screen.getByLabelText("Nozzle Width");
		const side1Input = screen.getByPlaceholderText("Side 1");
		const side2Input = screen.getByPlaceholderText("Side 2");
		const side3Input = screen.getByPlaceholderText("Side 3");
		const side4Input = screen.getByPlaceholderText("Side 4");

		// Enter values
		fireEvent.change(currentFlowInput, { target: { value: "100" } });
		fireEvent.change(nozzleWidthInput, { target: { value: "0.4" } });
		fireEvent.change(side1Input, { target: { value: "0.45" } });
		fireEvent.change(side2Input, { target: { value: "0.45" } });
		fireEvent.change(side3Input, { target: { value: "0.45" } });
		fireEvent.change(side4Input, { target: { value: "0.45" } });

		// Wait for the calculation effect to run
		await waitFor(() => {
			// Expected calculation: (100 * 0.4) / 0.45 = 88.89%
			expect(screen.getByText("88.89%", { exact: false })).toBeInTheDocument();
		});
	});

	it("handles non-numeric input by not calculating a result", async () => {
		render(<FlowCompensationSection />);

		// Get input fields
		const currentFlowInput = screen.getByLabelText("Current Flow %");
		const nozzleWidthInput = screen.getByLabelText("Nozzle Width");
		const side1Input = screen.getByPlaceholderText("Side 1");

		// Enter valid values for most fields
		fireEvent.change(currentFlowInput, { target: { value: "100" } });
		fireEvent.change(nozzleWidthInput, { target: { value: "0.4" } });
		fireEvent.change(side1Input, { target: { value: "abc" } }); // Invalid value

		// The result should still show placeholder
		await waitFor(() => {
			expect(screen.getByText("—")).toBeInTheDocument();
		});
	});

	it("recalculates when inputs change", async () => {
		render(<FlowCompensationSection />);

		// Set initial values
		const currentFlowInput = screen.getByLabelText("Current Flow %");
		const nozzleWidthInput = screen.getByLabelText("Nozzle Width");
		const side1Input = screen.getByPlaceholderText("Side 1");
		const side2Input = screen.getByPlaceholderText("Side 2");
		const side3Input = screen.getByPlaceholderText("Side 3");
		const side4Input = screen.getByPlaceholderText("Side 4");

		// Enter initial values
		fireEvent.change(currentFlowInput, { target: { value: "100" } });
		fireEvent.change(nozzleWidthInput, { target: { value: "0.4" } });
		fireEvent.change(side1Input, { target: { value: "0.45" } });
		fireEvent.change(side2Input, { target: { value: "0.45" } });
		fireEvent.change(side3Input, { target: { value: "0.45" } });
		fireEvent.change(side4Input, { target: { value: "0.45" } });

		// Wait for first calculation
		await waitFor(() => {
			expect(screen.getByText("88.89%", { exact: false })).toBeInTheDocument();
		});

		// Change a value
		fireEvent.change(side1Input, { target: { value: "0.5" } });
		fireEvent.change(side2Input, { target: { value: "0.5" } });
		fireEvent.change(side3Input, { target: { value: "0.5" } });
		fireEvent.change(side4Input, { target: { value: "0.5" } });

		// Wait for recalculation
		await waitFor(() => {
			// New expected calculation: (100 * 0.4) / 0.5 = 80.00%
			expect(screen.getByText("80.00%", { exact: false })).toBeInTheDocument();
		});
	});
});
