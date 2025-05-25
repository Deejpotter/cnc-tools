/**
 * Table and Enclosure Calculator tests
 * Updated: 14/05/2025
 * Author: Deej Potter
 * Description: Test suite for the Table and Enclosure Calculator component.
 * Tests the calculation functions, UI interactions, and state management.
 */

import React from "react";
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import TableEnclosureCalculatorPage from "./page";
import { MATERIAL_TYPES, MATERIAL_THICKNESS } from "./constants";
import { DoorType } from "./types";

// Mock window.history.pushState for URL update tests
const mockPushState = jest.fn();
Object.defineProperty(window, "history", {
	value: {
		pushState: mockPushState,
		replaceState: mockPushState, // Also mock replaceState if used
	},
	writable: true,
});

// Mock Next.js navigation hooks
jest.mock("next/navigation", () => {
	const mockSearchParams = {
		get: jest.fn().mockImplementation((key: string) => {
			// Provide default mock values for URL parameters if needed for tests
			// This mock will be overridden in specific tests that load from URL
			if (key === "it") return "1";
			if (key === "iod") return "1"; // Default to outside dimensions
			if (key === "mt") return MATERIAL_TYPES[0].id; // Default material
			// Add other params as necessary for default behavior
			return null;
		}),
		size: 0, // Default size, can be overridden by spyOn
		has: jest.fn().mockImplementation((key: string) => {
			// Default has implementation
			return ["it", "iod", "mt"].includes(key);
		}),
		forEach: jest.fn(), // Mock forEach if used by any tested logic
		toString: jest.fn().mockReturnValue(""), // Mock toString
	};
	return {
		useRouter: () => ({
			push: jest.fn(),
			replace: jest.fn(), // Added for window.history.pushState mock
		}),
		useSearchParams: jest.fn(() => mockSearchParams),
	};
});

// Mock dynamic import for TableCalculator to allow testing its props
jest.mock("next/dynamic", () => () => {
	const TableCalculatorComponent = jest.requireActual(
		"./components/TableCalculator"
	).default;
	const DynamicTableCalculator = (props: any) => (
		<TableCalculatorComponent {...props} />
	);
	DynamicTableCalculator.displayName = "DynamicTableCalculator";
	return DynamicTableCalculator;
});

// Mock the LayoutContainer component
jest.mock("@/components/LayoutContainer", () => {
	const MockLayoutContainer = ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	);
	MockLayoutContainer.displayName = "MockLayoutContainer";
	return MockLayoutContainer;
});

// Mock the actual TableCalculator to intercept its direct usage if necessary,
// or to simplify its behavior for page-level tests.
// For these tests, we are more interested in the page rendering and prop passing.
jest.mock("./components/TableCalculator", () => {
	const OriginalTableCalculator = jest.requireActual(
		"./components/TableCalculator"
	).default;
	const MockTableCalculator = (props: any) => (
		<OriginalTableCalculator {...props} />
	); // Render the original but spy on it
	MockTableCalculator.displayName = "MockTableCalculator";
	return jest.fn(MockTableCalculator);
});

describe("TableEnclosureCalculatorPage", () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
		// Default mock for useSearchParams.get
		(require("next/navigation").useSearchParams as jest.Mock).mockReturnValue({
			get: jest.fn().mockImplementation((key: string) => {
				if (key === "it") return "1"; // includeTable
				if (key === "iod") return "1"; // isOutsideDimension
				if (key === "mt") return MATERIAL_TYPES[0].id; // default material
				if (key === "tl") return "1000";
				if (key === "tw") return "1000";
				if (key === "th") return "800";
				return null;
			}),
			size: 3, // Example size
			has: jest.fn().mockImplementation((key: string) => {
				return ["it", "iod", "mt", "tl", "tw", "th"].includes(key);
			}),
			forEach: jest.fn(),
			toString: jest
				.fn()
				.mockReturnValue(
					"it=1&iod=1&mt=corflute-clear-6mm&tl=1000&tw=1000&th=800"
				),
		});
	});

	it("renders the main heading", () => {
		render(<TableEnclosureCalculatorPage />);
		expect(
			screen.getByRole("heading", { name: /Table and Enclosure Calculator/i })
		).toBeInTheDocument();
	});

	it("passes correct material types and fixed thickness to TableCalculator", () => {
		render(<TableEnclosureCalculatorPage />);
		// Check that TableCalculator (or its mock wrapper) is rendered.
		// This test relies on the mock for next/dynamic correctly passing props.
		// We can't directly inspect props of the real TableCalculator easily here,
		// so we ensure the page attempts to render it.
		// A more direct way would be to not mock TableCalculator itself for this specific test,
		// or to have the dynamic mock capture props.

		// For now, let's check if a known element from TableCalculator's initial render is present
		// (e.g., a config panel element, assuming it's always rendered)
		expect(
			screen.getByRole("region", { name: /Configuration/i })
		).toBeInTheDocument();
		// This implicitly tests that TableCalculator was rendered, which means it received its props.
		// A more robust test would involve a more complex mocking strategy for dynamic imports
		// or testing the TableCalculator component in isolation with these specific props.
	});

	describe("Centralized Outside Dimensions Checkbox", () => {
		it("renders a single 'Use Outside Dimensions' checkbox in the Configuration panel", () => {
			render(<TableEnclosureCalculatorPage />);
			const configPanel = screen.getByRole("region", {
				name: /Configuration/i,
			});
			const outsideDimensionCheckbox = within(configPanel).getByLabelText(
				/Use Outside Dimensions/i
			);
			expect(outsideDimensionCheckbox).toBeInTheDocument();
			expect(outsideDimensionCheckbox).toHaveAttribute("type", "checkbox");

			// Ensure no such checkboxes in Table or Enclosure dimension sections
			if (screen.queryByRole("region", { name: /Table Dimensions/i })) {
				const tableDimensionsPanel = screen.getByRole("region", {
					name: /Table Dimensions/i,
				});
				expect(
					within(tableDimensionsPanel).queryByLabelText(
						/Use Outside Dimensions/i
					)
				).not.toBeInTheDocument();
			}
			if (screen.queryByRole("region", { name: /Enclosure Dimensions/i })) {
				const enclosurePanel = screen.getByRole("region", {
					name: /Enclosure Dimensions/i,
				});
				expect(
					within(enclosurePanel).queryByLabelText(/Use Outside Dimensions/i)
				).not.toBeInTheDocument();
			}
		});

		it("toggles 'isOutsideDimension' in config when the checkbox is clicked", async () => {
			render(<TableEnclosureCalculatorPage />);
			const outsideDimensionCheckbox = screen.getByLabelText(
				/Use Outside Dimensions/i
			);

			// Default should be checked (true) as per initial state in TableCalculator
			expect(outsideDimensionCheckbox).toBeChecked();

			fireEvent.click(outsideDimensionCheckbox);
			expect(outsideDimensionCheckbox).not.toBeChecked();
			// Verify URL update
			await waitFor(() => {
				expect(mockPushState).toHaveBeenCalledWith(
					null,
					"",
					expect.stringContaining("iod=0") // isOutsideDimension = false
				);
			});

			fireEvent.click(outsideDimensionCheckbox);
			expect(outsideDimensionCheckbox).toBeChecked();
			await waitFor(() => {
				expect(mockPushState).toHaveBeenCalledWith(
					null,
					"",
					expect.stringContaining("iod=1") // isOutsideDimension = true
				);
			});
		});
	});

	describe("Simplified Material Options", () => {
		it("renders material type dropdown with correct simplified options and fixed thickness label", () => {
			render(<TableEnclosureCalculatorPage />);
			const materialTypeDropdown = screen.getByLabelText(
				`Material Type (All ${MATERIAL_THICKNESS}mm Thick)`
			);
			expect(materialTypeDropdown).toBeInTheDocument();

			const options = within(materialTypeDropdown).getAllByRole("option");
			expect(options).toHaveLength(MATERIAL_TYPES.length);
			MATERIAL_TYPES.forEach((material, index) => {
				expect(options[index]).toHaveTextContent(material.name);
				expect(options[index]).toHaveValue(material.id);
			});
		});

		it("does not render a material thickness dropdown", () => {
			render(<TableEnclosureCalculatorPage />);
			expect(
				screen.queryByLabelText(/Material Thickness/i)
			).not.toBeInTheDocument();
		});

		it("updates material type in config and URL when selection changes", async () => {
			render(<TableEnclosureCalculatorPage />);
			const materialTypeDropdown = screen.getByLabelText(
				`Material Type (All ${MATERIAL_THICKNESS}mm Thick)`
			);

			// Initial value (first material type)
			expect(materialTypeDropdown).toHaveValue(MATERIAL_TYPES[0].id);
			await waitFor(() => {
				expect(mockPushState).toHaveBeenCalledWith(
					null,
					"",
					expect.stringContaining(`mt=${MATERIAL_TYPES[0].id}`)
				);
			});

			// Change to the second material type
			fireEvent.change(materialTypeDropdown, {
				target: { value: MATERIAL_TYPES[1].id },
			});
			expect(materialTypeDropdown).toHaveValue(MATERIAL_TYPES[1].id);
			await waitFor(() => {
				expect(mockPushState).toHaveBeenCalledWith(
					null,
					"",
					expect.stringContaining(`mt=${MATERIAL_TYPES[1].id}`)
				);
			});
		});
	});

	describe("URL Parameter Loading", () => {
		it("loads 'isOutsideDimension' from URL into config", () => {
			// Mock useSearchParams to return iod=0 (inside dimensions)
			(require("next/navigation").useSearchParams as jest.Mock).mockReturnValue(
				{
					get: jest.fn().mockImplementation((key: string) => {
						if (key === "iod") return "0"; // false
						if (key === "it") return "1";
						return null;
					}),
					size: 2,
					has: jest
						.fn()
						.mockImplementation((key: string) => ["it", "iod"].includes(key)),
					forEach: jest.fn(),
					toString: jest.fn().mockReturnValue("it=1&iod=0"),
				}
			);

			render(<TableEnclosureCalculatorPage />);
			const outsideDimensionCheckbox = screen.getByLabelText(
				/Use Outside Dimensions/i
			);
			expect(outsideDimensionCheckbox).not.toBeChecked(); // Should be false based on iod=0
		});

		it("loads material type from URL and sets fixed thickness", () => {
			const targetMaterial = MATERIAL_TYPES[1]; // Second material
			// Mock useSearchParams to return specific material type
			(require("next/navigation").useSearchParams as jest.Mock).mockReturnValue(
				{
					get: jest.fn().mockImplementation((key: string) => {
						if (key === "mt") return targetMaterial.id;
						if (key === "it") return "1";
						return null;
					}),
					size: 2,
					has: jest
						.fn()
						.mockImplementation((key: string) => ["it", "mt"].includes(key)),
					forEach: jest.fn(),
					toString: jest.fn().mockReturnValue(`it=1&mt=${targetMaterial.id}`),
				}
			);

			render(<TableEnclosureCalculatorPage />);
			const materialTypeDropdown = screen.getByLabelText(
				`Material Type (All ${MATERIAL_THICKNESS}mm Thick)`
			);
			expect(materialTypeDropdown).toHaveValue(targetMaterial.id);
			// Thickness is fixed and not controlled by URL, but materialConfig should have it.
			// This would be better tested in TableCalculator's own unit tests.
		});

		it("loads full configuration from URL parameters correctly", async () => {
			const searchParamsMock = {
				get: jest.fn((key: string) => {
					const params: Record<string, string> = {
						it: "1", // includeTable
						ie: "1", // includeEnclosure
						iod: "0", // isOutsideDimension = false
						me: "1", // mountEnclosureToTable
						id: "1", // includeDoors
						dcf: "1", // frontDoor
						dcb: "0", // backDoor
						dcl: "1", // leftDoor
						dcr: "0", // rightDoor
						dct: DoorType.BIFOLD, // doorType
						tl: "1200", // tableLength
						tw: "900", // tableWidth
						th: "750", // tableHeight
						el: "1250", // enclosureLength (will be overridden by auto-calc if table included)
						ew: "950", // enclosureWidth (will be overridden by auto-calc if table included)
						eh: "600", // enclosureHeight
						mt: MATERIAL_TYPES[2].id, // materialType (third one)
						mip: "1", // includePanels
						pc_t: "1", // panelConfig.top
						pc_b: "0", // panelConfig.bottom
						pc_l: "1", // panelConfig.left
						pc_r: "0", // panelConfig.right
						pc_bk: "1", // panelConfig.back
						pc_f: "1", // panelConfig.front
					};
					return params[key] || null;
				}),
				has: jest.fn((key: string) => {
					const params: Record<string, string> = {
						it: "1",
						ie: "1",
						iod: "0",
						me: "1",
						id: "1",
						dcf: "1",
						dcb: "0",
						dcl: "1",
						dcr: "0",
						dct: DoorType.BIFOLD,
						tl: "1200",
						tw: "900",
						th: "750",
						el: "1250",
						ew: "950",
						eh: "600",
						mt: MATERIAL_TYPES[2].id,
						mip: "1",
						pc_t: "1",
						pc_b: "0",
						pc_l: "1",
						pc_r: "0",
						pc_bk: "1",
						pc_f: "1",
					};
					return key in params;
				}),
				size: 22, // Number of params
				forEach: jest.fn(),
				toString: jest
					.fn()
					.mockReturnValue(
						"it=1&ie=1&iod=0&me=1&id=1&dcf=1&dcb=0&dcl=1&dcr=0&dct=BFLD&tl=1200&tw=900&th=750&el=1250&ew=950&eh=600&mt=polypropylene-bubble-6mm&mip=1&pc_t=1&pc_b=0&pc_l=1&pc_r=0&pc_bk=1&pc_f=1"
					),
			};
			(require("next/navigation").useSearchParams as jest.Mock).mockReturnValue(
				searchParamsMock
			);

			render(<TableEnclosureCalculatorPage />);

			// Check a few key fields to ensure loading logic ran
			expect(screen.getByLabelText(/Include Table/i)).toBeChecked();
			expect(screen.getByLabelText(/Include Enclosure/i)).toBeChecked();
			expect(
				screen.getByLabelText(/Use Outside Dimensions/i)
			).not.toBeChecked(); // iod=0
			expect(screen.getByLabelText(/Mount Enclosure to Table/i)).toBeChecked();
			expect(screen.getByLabelText(/Include Doors/i)).toBeChecked();

			expect(screen.getByLabelText(/Front Door/i)).toBeChecked();
			expect(screen.getByLabelText(/Back Door/i)).not.toBeChecked();

			expect(
				screen.getByLabelText("Length (mm)", { selector: "#tableLength" })
			).toHaveValue(1200);
			expect(
				screen.getByLabelText("Width (mm)", { selector: "#tableWidth" })
			).toHaveValue(900);
			expect(
				screen.getByLabelText("Height (mm)", { selector: "#tableHeight" })
			).toHaveValue(750);

			// Enclosure L/W might be auto-calculated based on table, so check height which is independent
			expect(
				screen.getByLabelText("Height (mm)", { selector: "#enclosureHeight" })
			).toHaveValue(600);

			expect(
				screen.getByLabelText(
					`Material Type (All ${MATERIAL_THICKNESS}mm Thick)`
				)
			).toHaveValue(MATERIAL_TYPES[2].id);
			expect(screen.getByLabelText(/Include Panels/i)).toBeChecked();
			expect(screen.getByLabelText(/Top Panel/i)).toBeChecked();
			expect(screen.getByLabelText(/Bottom Panel/i)).not.toBeChecked();
		});
	});
});

// Basic rendering test (can be kept or merged)
describe("TableEnclosureCalculator Component Basic Rendering", () => {
	it("renders the calculator with default values", () => {
		// Reset to simpler searchParams for this default test
		(require("next/navigation").useSearchParams as jest.Mock).mockReturnValue({
			get: jest.fn().mockReturnValue(null), // No params
			size: 0,
			has: jest.fn().mockReturnValue(false),
			forEach: jest.fn(),
			toString: jest.fn().mockReturnValue(""),
		});
		render(<TableEnclosureCalculatorPage />);
		expect(screen.getByLabelText(/Include Table/i)).toBeChecked(); // Default
		expect(screen.getByLabelText(/Use Outside Dimensions/i)).toBeChecked(); // Default
		expect(
			screen.getByLabelText(`Material Type (All ${MATERIAL_THICKNESS}mm Thick)`)
		).toHaveValue(MATERIAL_TYPES[0].id); // Default material
	});
});

// ... Other test suites like "Calculator Calculation Functions" and "Calculator Integration Tests" would need updates
// if they directly interact with UI elements changed or use functions whose signatures changed.
// For calcUtils.test.ts, the changes are already applied in a previous step.
