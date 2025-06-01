/**
 * Tests for StartupGcodeGeneratorSection Component
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import StartupGcodeGeneratorSection from "./StartupGcodeGeneratorSection";

describe("StartupGcodeGeneratorSection", () => {
	beforeEach(() => {
		// Mock Date to have consistent timestamp in generated gcode
		const mockDate = new Date("2023-01-01");
		jest.spyOn(global, "Date").mockImplementation(() => mockDate);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("renders the component with default values", () => {
		render(<StartupGcodeGeneratorSection />);

		// Check that component title is rendered
		expect(screen.getByText("Startup GCode Generator")).toBeInTheDocument();

		// Check that the description is present
		expect(
			screen.getByText(
				/The startup code generator creates startup GCode for your 3D Printer/
			)
		).toBeInTheDocument();

		// Check that input fields are rendered with correct default values
		expect(screen.getByLabelText("Bed Size X")).toHaveValue("300");
		expect(screen.getByLabelText("Bed Size Y")).toHaveValue("300");

		// Check that checkboxes have correct default states
		expect(screen.getByLabelText("Home Before Printing")).toBeChecked();
		expect(screen.getByLabelText("Add Z Auto-Align")).not.toBeChecked();
		expect(screen.getByLabelText("Enable Bed Levling")).not.toBeChecked();
		expect(screen.getByLabelText("Enable KISS Purge")).not.toBeChecked();
		expect(screen.getByLabelText("Enable Audio Feedback")).not.toBeChecked();
	});

	it("updates gcode when settings change", async () => {
		render(<StartupGcodeGeneratorSection />);

		// Get important elements
		const bedSizeXInput = screen.getByLabelText("Bed Size X");
		const bedSizeYInput = screen.getByLabelText("Bed Size Y");
		const homeCheckbox = screen.getByLabelText("Home Before Printing");
		const ablCheckbox = screen.getByLabelText("Enable Bed Levling");

		// Change some settings
		fireEvent.change(bedSizeXInput, { target: { value: "200" } });
		fireEvent.change(bedSizeYInput, { target: { value: "200" } });
		fireEvent.click(ablCheckbox);

		// Textarea where gcode is displayed
		const gcodeTextarea = screen.getByLabelText("Startup Code");

		// Wait for the gcode to update
		await waitFor(() => {
			expect(gcodeTextarea).toHaveValue(expect.stringContaining("G29")); // Bed leveling
			expect(gcodeTextarea).toHaveValue(expect.stringContaining("G28")); // Home the printer
		});

		// Now disable homing
		fireEvent.click(homeCheckbox);

		// Wait for the gcode to update again
		await waitFor(() => {
			expect(gcodeTextarea).not.toHaveValue(
				expect.stringContaining("G28 ; Home the printer")
			);
			expect(gcodeTextarea).toHaveValue(
				expect.stringContaining("G29 A1 ; Activate UBL")
			);
		});
	});

	it("shows KISS purge options when KISS purge is enabled", async () => {
		render(<StartupGcodeGeneratorSection />);

		// KISS purge options should be hidden initially
		expect(screen.queryByLabelText("Strip X Position")).not.toBeInTheDocument();

		// Enable KISS purge
		const kissPurgeCheckbox = screen.getByLabelText("Enable KISS Purge");
		fireEvent.click(kissPurgeCheckbox);

		// KISS purge options should now be visible
		expect(screen.getByLabelText("Strip X Position")).toBeInTheDocument();
		expect(screen.getByLabelText("Strip Y Position")).toBeInTheDocument();
		expect(screen.getByLabelText("Retraction After Purge")).toBeInTheDocument();

		// Change a KISS purge setting
		const stripXInput = screen.getByLabelText("Strip X Position");
		fireEvent.change(stripXInput, { target: { value: "150" } });

		// Check that the gcode contains the KISS purge with the updated value
		const gcodeTextarea = screen.getByLabelText("Startup Code");

		await waitFor(() => {
			expect(gcodeTextarea).toHaveValue(expect.stringContaining("G1 X150 Y0"));
		});
	});

	it("allows copying gcode to clipboard", async () => {
		// Mock clipboard API
		const clipboardWriteTextMock = jest.fn();
		Object.assign(navigator, {
			clipboard: {
				writeText: clipboardWriteTextMock,
			},
		});

		render(<StartupGcodeGeneratorSection />);

		// Get the copy button and click it
		const copyButton = screen.getByRole("button", { name: /copy/i });
		fireEvent.click(copyButton);

		// Check that clipboard.writeText was called
		expect(clipboardWriteTextMock).toHaveBeenCalled();

		// Reset the mock
		clipboardWriteTextMock.mockReset();
	});
});
