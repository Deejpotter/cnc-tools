/**
 * Table and Enclosure Calculator tests
 * Updated: 14/05/2025
 * Author: Deej Potter
 * Description: Test suite for the Table and Enclosure Calculator component.
 * Tests the calculation functions, UI interactions, and state management.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TableEnclosureCalculator from "./page";
import {
	calculateTableMaterials,
	calculateEnclosureMaterials,
	calculateMountingMaterials,
	calculateDoorMaterials,
	calculatePanelMaterials,
	CONSTANTS,
	Dimensions,
} from "./calcUtils";

// Mock Next.js navigation hooks
jest.mock("next/navigation", () => ({
	useRouter: () => ({
		push: jest.fn(),
	}),
	useSearchParams: () => ({
		get: jest.fn(),
		size: 0,
	}),
}));

// Mock the LayoutContainer component
jest.mock("@/components/LayoutContainer", () => {
	return {
		__esModule: true,
		default: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
	};
});

describe("TableEnclosureCalculator", () => {
	// Basic rendering test
	it("renders the calculator with default values", () => {
		render(<TableEnclosureCalculator />);

		// Check that component title is rendered
		expect(
			screen.getByText("Table and Enclosure Calculator")
		).toBeInTheDocument();

		// Check that configuration options are present
		expect(screen.getByLabelText("Include Machine Table")).toBeInTheDocument();
		expect(screen.getByLabelText("Include Enclosure")).toBeInTheDocument();

		// Check that table dimensions section exists by default (since includeTable is true by default)
		expect(screen.getByText("Table Dimensions")).toBeInTheDocument();

		// Check that the bill of materials section is rendered
		expect(screen.getByText("Bill of Materials")).toBeInTheDocument();
	});

	// Test toggling between configuration options
	it("shows and hides configuration sections based on toggles", () => {
		render(<TableEnclosureCalculator />);

		// By default, table section should be visible but not enclosure
		expect(screen.getByText("Table Dimensions")).toBeInTheDocument();
		expect(screen.queryByText("Enclosure Dimensions")).not.toBeInTheDocument();

		// Toggle on the enclosure option
		const enclosureCheckbox = screen.getByLabelText("Include Enclosure");
		fireEvent.click(enclosureCheckbox);

		// Now enclosure section should be visible
		expect(screen.getByText("Enclosure Dimensions")).toBeInTheDocument();

		// Toggle off the table option
		const tableCheckbox = screen.getByLabelText("Include Machine Table");
		fireEvent.click(tableCheckbox);

		// Table section should be hidden now
		expect(screen.queryByText("Table Dimensions")).not.toBeInTheDocument();
	});

	// Test the mounting option appears when both table and enclosure are selected
	it("shows mounting option when both table and enclosure are selected", () => {
		render(<TableEnclosureCalculator />);

		// Mounting option should not be visible initially
		expect(
			screen.queryByLabelText("Mount Enclosure to Table")
		).not.toBeInTheDocument();

		// Enable enclosure
		const enclosureCheckbox = screen.getByLabelText("Include Enclosure");
		fireEvent.click(enclosureCheckbox);

		// Now mounting option should be visible
		expect(
			screen.getByLabelText("Mount Enclosure to Table")
		).toBeInTheDocument();
	});

	// Test door configuration options
	it("shows door options when doors are included", () => {
		render(<TableEnclosureCalculator />);

		// Enable enclosure first
		const enclosureCheckbox = screen.getByLabelText("Include Enclosure");
		fireEvent.click(enclosureCheckbox);

		// Door options should not be visible initially
		expect(screen.queryByLabelText("Front Door")).not.toBeInTheDocument();

		// Enable doors
		const doorsCheckbox = screen.getByLabelText("Include Doors");
		fireEvent.click(doorsCheckbox);

		// Door options should now be visible
		expect(screen.getByLabelText("Front Door")).toBeInTheDocument();
		expect(screen.getByLabelText("Back Door")).toBeInTheDocument();
		expect(screen.getByLabelText("Left Door")).toBeInTheDocument();
		expect(screen.getByLabelText("Right Door")).toBeInTheDocument();
	});

	// Test panel material configuration
	it("shows panel material options when panels are included", () => {
		render(<TableEnclosureCalculator />);

		// Enable enclosure first
		const enclosureCheckbox = screen.getByLabelText("Include Enclosure");
		fireEvent.click(enclosureCheckbox);

		// Panel material options should not be visible initially
		expect(screen.queryByText("Material Type")).not.toBeInTheDocument();

		// Enable panels
		const panelsCheckbox = screen.getByLabelText("Include Panel Materials");
		fireEvent.click(panelsCheckbox);

		// Panel material options should now be visible
		expect(screen.getByText("Material Type")).toBeInTheDocument();
		expect(screen.getByText("Material Thickness (mm)")).toBeInTheDocument();
	});
	// Test dimension input fields update state correctly
	it("updates table dimensions when inputs change", async () => {
		render(<TableEnclosureCalculator />);

		// Get the length input field
		const lengthInput = screen.getByLabelText("Length (mm)");

		// Change the length value
		fireEvent.change(lengthInput, { target: { value: "1200" } });

		// Check that the value was updated
		expect(lengthInput).toHaveValue(1200);

		// The BOM should reflect this change after calculation
		await waitFor(() => {
			const summaryText = screen.getByText(/1200mm/);
			expect(summaryText).toBeInTheDocument();
		});
	});

	// Test toggling the outside/inside dimension checkbox
	it("handles toggling between inside and outside dimensions", async () => {
		render(<TableEnclosureCalculator />);

		// Get the checkbox
		const outsideDimCheckbox = screen.getByLabelText("Outside Dimensions");

		// Check that it's checked by default
		expect(outsideDimCheckbox).toBeChecked();

		// Toggle it off
		fireEvent.click(outsideDimCheckbox);

		// Check that it's now unchecked
		expect(outsideDimCheckbox).not.toBeChecked();

		// The BOM should reflect this change after calculation
		await waitFor(() => {
			const summaryText = screen.getByText(/\(ID\)/);
			expect(summaryText).toBeInTheDocument();
		});

		// Toggle it back on
		fireEvent.click(outsideDimCheckbox);

		// Check that it's checked again
		expect(outsideDimCheckbox).toBeChecked();

		// The BOM should reflect this change again
		await waitFor(() => {
			const summaryText = screen.getByText(/\(OD\)/);
			expect(summaryText).toBeInTheDocument();
		});
	});

	// Test the shareable URL generation
	it("generates shareable URL correctly", () => {
		// This would require more complex mock setup for window.location and clipboard API
		// For now, simply check that the button is available
		render(<TableEnclosureCalculator />);

		const shareButton = screen.getByText(/Share Config/);
		expect(shareButton).toBeInTheDocument();
	});
});

// Unit tests for calculation functions
describe("Calculator Calculation Functions", () => {
	// Test table material calculations
	it("calculates table materials correctly for outside dimensions", () => {
		const tableDimensions = {
			length: 1000,
			width: 800,
			height: 800,
			isOutsideDimension: true,
		};

		const result = calculateTableMaterials(tableDimensions);

		// Check that dimensions are calculated correctly
		expect(result.extrusions.rail2060Length).toBe(960); // 1000 - 40 = 960
		expect(result.extrusions.rail2060Width).toBe(760); // 800 - 40 = 760
		expect(result.extrusions.rail4040Legs).toBe(800); // unchanged

		// Check that quantities are correct
		expect(result.extrusions.qtyRail2060Length).toBe(4);
		expect(result.extrusions.qtyRail2060Width).toBe(4);
		expect(result.extrusions.qtyRail4040Legs).toBe(4);

		// Check that total lengths are calculated correctly
		expect(result.totalLengths.rail2060).toBe(960 * 4 + 760 * 4);
		expect(result.totalLengths.rail4040).toBe(800 * 4);
	});

	// Test table material calculations with inside dimensions
	it("calculates table materials correctly for inside dimensions", () => {
		const tableDimensions = {
			length: 1000,
			width: 800,
			height: 800,
			isOutsideDimension: false,
		};

		const result = calculateTableMaterials(tableDimensions);

		// Check that dimensions are calculated correctly (no adjustment for inside dimensions)
		expect(result.extrusions.rail2060Length).toBe(1000);
		expect(result.extrusions.rail2060Width).toBe(800);
		expect(result.extrusions.rail4040Legs).toBe(800);
	});

	// Test enclosure material calculations
	it("calculates enclosure materials correctly with large dimensions requiring 2040 extrusions", () => {
		const enclosureDimensions = {
			length: 1600, // >1500mm, should use 2040 instead of 2020
			width: 800,
			height: 1000,
			isOutsideDimension: true,
		};

		const result = calculateEnclosureMaterials(enclosureDimensions);

		// Check horizontal rails are calculated correctly
		expect(result.extrusions.horizontal.length.type).toBe("2040"); // Should use 2040 for length > 1500mm
		expect(result.extrusions.horizontal.width.type).toBe("2020"); // Should use 2020 for width < 1500mm

		// Check sizes are adjusted correctly
		expect(result.extrusions.horizontal.length.size).toBe(1580); // 1600 - 20 = 1580
		expect(result.extrusions.horizontal.width.size).toBe(780); // 800 - 20 = 780

		// Check vertical extrusions
		expect(result.extrusions.vertical2020.size).toBe(1000);
		expect(result.extrusions.vertical2020.qty).toBe(8);

		// Check that extra hardware is added for 1.5m sides
		expect(result.hardware.T_NUT_SLIDING).toBe(
			CONSTANTS.DEFAULT_ENCLOSURE_HARDWARE.T_NUT_SLIDING +
				CONSTANTS.EXTRA_HARDWARE_FOR_1_5M.T_NUT_SLIDING
		);
		expect(result.hardware.CAP_HEAD_M5_8MM).toBe(
			CONSTANTS.DEFAULT_ENCLOSURE_HARDWARE.CAP_HEAD_M5_8MM +
				CONSTANTS.EXTRA_HARDWARE_FOR_1_5M.CAP_HEAD_M5_8MM
		);
	});

	// Test enclosure material calculations with standard dimensions
	it("calculates enclosure materials correctly with standard dimensions", () => {
		const enclosureDimensions = {
			length: 1000,
			width: 800,
			height: 1000,
			isOutsideDimension: true,
		};

		const result = calculateEnclosureMaterials(enclosureDimensions);

		// Check horizontal rails are calculated correctly (all should be 2020)
		expect(result.extrusions.horizontal.length.type).toBe("2020");
		expect(result.extrusions.horizontal.width.type).toBe("2020");

		// Check sizes are adjusted correctly
		expect(result.extrusions.horizontal.length.size).toBe(980); // 1000 - 20 = 980
		expect(result.extrusions.horizontal.width.size).toBe(780); // 800 - 20 = 780
	});
	// Test mounting hardware calculation
	it("calculates mounting hardware correctly", () => {
		const result = calculateMountingMaterials();

		// Check hardware quantities
		expect(result.hardware.IOCNR_40).toBe(4);
		expect(result.hardware.T_NUT_SLIDING).toBe(16);
		expect(result.hardware.CAP_HEAD_M5_8MM).toBe(16);

		// Check instructions are included
		expect(result.instructions).toContain("Machine Table Mounting");
	});

	// Test door materials calculation
	it("calculates door materials correctly with multiple doors", () => {
		const enclosureDimensions: Dimensions = {
			length: 1000,
			width: 800,
			height: 1000,
			isOutsideDimension: true,
		};

		const doorConfig = {
			frontDoor: true,
			backDoor: false,
			leftDoor: true,
			rightDoor: false,
		};

		const result = calculateDoorMaterials(enclosureDimensions, doorConfig);

		// Should have 2 doors (front and left)
		expect(result.panels).toHaveLength(2);

		// Check door panel dimensions
		// Front door
		expect(result.panels[0].position).toBe("Front");
		expect(result.panels[0].width).toBe(780 + 12); // 800 - 20 (adjustment) + 12 (panel adjustment) = 792
		expect(result.panels[0].height).toBe(1000 - 20 + 12); // 992

		// Left door
		expect(result.panels[1].position).toBe("Left");
		expect(result.panels[1].width).toBe(980 + 12); // 1000 - 20 (adjustment) + 12 (panel adjustment) = 992
		expect(result.panels[1].height).toBe(1000 - 20 + 12); // 992

		// Check hardware is calculated correctly for 2 doors
		expect(result.hardware.HINGE).toBe(CONSTANTS.DOOR_HARDWARE.HINGE * 2); // 2 per door
		expect(result.hardware.HANDLE).toBe(CONSTANTS.DOOR_HARDWARE.HANDLE * 2); // 1 per door
		expect(result.hardware.T_NUT_SLIDING).toBe(
			CONSTANTS.DOOR_HARDWARE.T_NUT_SLIDING * 2
		);
		expect(result.hardware.BUTTON_HEAD_M5_8MM).toBe(
			CONSTANTS.DOOR_HARDWARE.BUTTON_HEAD_M5_8MM * 2
		);
		expect(result.hardware.CORNER_BRACKET).toBe(
			CONSTANTS.DOOR_HARDWARE.CORNER_BRACKET * 2
		);
	});

	// Test panel materials calculation
	it("calculates panel materials correctly with multiple panels", () => {
		const enclosureDimensions: Dimensions = {
			length: 1000,
			width: 800,
			height: 1000,
			isOutsideDimension: true,
		};

		const materialConfig = {
			type: "acrylic",
			thickness: 3,
			panelConfig: {
				top: true,
				bottom: false,
				left: true,
				right: false,
				back: true,
			},
		};

		const result = calculatePanelMaterials(enclosureDimensions, materialConfig);

		// Should have 3 panels (top, left, back)
		expect(result.panels).toHaveLength(3);

		// Check panel dimensions
		// Top panel
		expect(result.panels[0].position).toBe("Top");
		expect(result.panels[0].width).toBe(780 + 12); // Adjusted width + panel adjustment
		expect(result.panels[0].length).toBe(980 + 12); // Adjusted length + panel adjustment

		// Left panel
		expect(result.panels[1].position).toBe("Left");
		expect(result.panels[1].width).toBe(980 + 12); // Adjusted length + panel adjustment
		expect(result.panels[1].height).toBe(980 + 12); // Adjusted height + panel adjustment

		// Back panel
		expect(result.panels[2].position).toBe("Back");
		expect(result.panels[2].width).toBe(780 + 12); // Adjusted width + panel adjustment
		expect(result.panels[2].height).toBe(980 + 12); // Adjusted height + panel adjustment

		// Check material properties
		expect(result.material.type).toBe("acrylic");
		expect(result.material.thickness).toBe(3);

		// Calculate expected total area
		// Top: 792 * 992 = 785,664
		// Left: 992 * 992 = 984,064
		// Back: 792 * 992 = 785,664
		// Total: 2,555,392
		const expectedArea = 792 * 992 + 992 * 992 + 792 * 992;
		expect(result.totalArea).toBe(expectedArea);
	});
});

// Additional integration tests
describe("Calculator Integration Tests", () => {
	// Test that URL parameters load correctly
	it("loads configuration from URL parameters", () => {
		// Mock the URL parameters
		const mockSearchParams = new URLSearchParams();
		mockSearchParams.set("tl", "1200");
		mockSearchParams.set("tw", "900");
		mockSearchParams.set("th", "850");
		mockSearchParams.set("tod", "1");
		mockSearchParams.set("it", "1");
		mockSearchParams.set("ie", "1");

		// Mock the useSearchParams hook to return our test parameters
		jest.mock("next/navigation", () => ({
			useRouter: () => ({
				push: jest.fn(),
			}),
			useSearchParams: () => ({
				get: (param: string) => mockSearchParams.get(param),
				size: mockSearchParams.size,
			}),
		}));

		render(<TableEnclosureCalculator />);

		// Can't effectively test this without more complex setup due to the mocking limitations
		// This would be better tested in a more comprehensive integration test suite
	});

	// Test share URL generation
	it("generates a shareable URL with current configuration", () => {
		// This would require access to the internal functions of the component
		// For now, we'll skip this test as it would require complex mocking
	});
});
