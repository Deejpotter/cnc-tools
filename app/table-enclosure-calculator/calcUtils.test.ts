/**
 * Tests for Table and Enclosure Calculator Utilities
 * Updated: 14/05/2025
 * Author: Deej Potter
 * Description: Test suite for the calculation utility functions used by the Table and Enclosure Calculator component.
 * These tests focus on the pure calculation functions without UI dependencies.
 */

import {
	calculateTableMaterials,
	calculateEnclosureMaterials,
	calculateMountingMaterials,
	calculateDoorMaterials,
	calculatePanelMaterials,
	CONSTANTS,
	Dimensions,
} from "./calcUtils";

describe("Table Materials Calculations", () => {
	it("calculates adjusted dimensions correctly for outside dimensions", () => {
		const dimensions: Dimensions = {
			length: 1000,
			width: 800,
			height: 750,
			isOutsideDimension: true,
		};

		const result = calculateTableMaterials(dimensions);

		// For outside dimensions, subtract 40mm for adjustment (40mm for 4040 extrusion)
		expect(result.extrusions.rail2060Length).toBe(960); // 1000 - 40
		expect(result.extrusions.rail2060Width).toBe(760); // 800 - 40
		expect(result.extrusions.rail4040Legs).toBe(750); // Height is unchanged
	});

	it("uses dimensions as-is for inside dimensions", () => {
		const dimensions: Dimensions = {
			length: 1000,
			width: 800,
			height: 750,
			isOutsideDimension: false,
		};

		const result = calculateTableMaterials(dimensions);

		// For inside dimensions, no adjustment
		expect(result.extrusions.rail2060Length).toBe(1000);
		expect(result.extrusions.rail2060Width).toBe(800);
		expect(result.extrusions.rail4040Legs).toBe(750);
	});

	it("calculates total extrusion lengths correctly", () => {
		const dimensions: Dimensions = {
			length: 1000,
			width: 800,
			height: 750,
			isOutsideDimension: true,
		};

		const result = calculateTableMaterials(dimensions);

		// Total 2060 = (length extrusions * 4) + (width extrusions * 4)
		expect(result.totalLengths.rail2060).toBe(960 * 4 + 760 * 4);

		// Total 4040 = leg extrusions * 4
		expect(result.totalLengths.rail4040).toBe(750 * 4);
	});

	it("calculates extrusion quantities correctly", () => {
		const dimensions: Dimensions = {
			length: 1000,
			width: 800,
			height: 750,
			isOutsideDimension: true,
		};

		const result = calculateTableMaterials(dimensions);

		expect(result.extrusions.qtyRail2060Length).toBe(4);
		expect(result.extrusions.qtyRail2060Width).toBe(4);
		expect(result.extrusions.qtyRail4040Legs).toBe(4);
	});
});

describe("Enclosure Materials Calculations", () => {
	it("uses 2020 extrusions for standard dimensions", () => {
		const dimensions: Dimensions = {
			length: 1000,
			width: 800,
			height: 750,
			isOutsideDimension: true,
		};

		const result = calculateEnclosureMaterials(dimensions);

		expect(result.extrusions.horizontal.length.type).toBe("2020");
		expect(result.extrusions.horizontal.width.type).toBe("2020");
	});

	it("uses 2040 extrusions for dimensions >= 1500mm", () => {
		const dimensions: Dimensions = {
			length: 1500,
			width: 800,
			height: 750,
			isOutsideDimension: true,
		};

		const result = calculateEnclosureMaterials(dimensions);

		expect(result.extrusions.horizontal.length.type).toBe("2040");
		expect(result.extrusions.horizontal.width.type).toBe("2020");
	});

	it("adds extra hardware for large sides", () => {
		const standardDimensions: Dimensions = {
			length: 1000,
			width: 800,
			height: 750,
			isOutsideDimension: true,
		};

		const largeDimensions: Dimensions = {
			length: 1500,
			width: 800,
			height: 750,
			isOutsideDimension: true,
		};

		const standardResult = calculateEnclosureMaterials(standardDimensions);
		const largeResult = calculateEnclosureMaterials(largeDimensions);

		// Large dimensions should have extra T-nuts and bolts
		expect(largeResult.hardware.T_NUT_SLIDING).toBe(
			standardResult.hardware.T_NUT_SLIDING +
				CONSTANTS.EXTRA_HARDWARE_FOR_1_5M.T_NUT_SLIDING
		);

		expect(largeResult.hardware.CAP_HEAD_M5_8MM).toBe(
			standardResult.hardware.CAP_HEAD_M5_8MM +
				CONSTANTS.EXTRA_HARDWARE_FOR_1_5M.CAP_HEAD_M5_8MM
		);
	});

	it("calculates adjusted dimensions correctly for outside dimensions", () => {
		const dimensions: Dimensions = {
			length: 1000,
			width: 800,
			height: 750,
			isOutsideDimension: true,
		};

		const result = calculateEnclosureMaterials(dimensions);

		// For outside dimensions, subtract 20mm for adjustment (20mm for 2020 extrusion)
		expect(result.extrusions.horizontal.length.size).toBe(980); // 1000 - 20
		expect(result.extrusions.horizontal.width.size).toBe(780); // 800 - 20
		expect(result.extrusions.vertical2020.size).toBe(750); // Height is unchanged
	});
});

describe("Door Materials Calculations", () => {
	it("calculates hardware quantities based on number of doors", () => {
		const dimensions: Dimensions = {
			length: 1000,
			width: 800,
			height: 750,
			isOutsideDimension: true,
		};

		const noDoors = {
			frontDoor: false,
			backDoor: false,
			leftDoor: false,
			rightDoor: false,
		};

		const twoDoors = {
			frontDoor: true,
			backDoor: false,
			leftDoor: true,
			rightDoor: false,
		};

		const fourDoors = {
			frontDoor: true,
			backDoor: true,
			leftDoor: true,
			rightDoor: true,
		};

		const noDoorsResult = calculateDoorMaterials(dimensions, noDoors);
		const twoDoorsResult = calculateDoorMaterials(dimensions, twoDoors);
		const fourDoorsResult = calculateDoorMaterials(dimensions, fourDoors);

		// No doors should have empty panels array
		expect(noDoorsResult.panels).toHaveLength(0);

		// Two doors should have two panel entries and hardware for two doors
		expect(twoDoorsResult.panels).toHaveLength(2);
		expect(twoDoorsResult.hardware.HINGE).toBe(
			CONSTANTS.DOOR_HARDWARE.HINGE * 2
		);

		// Four doors should have four panel entries and hardware for four doors
		expect(fourDoorsResult.panels).toHaveLength(4);
		expect(fourDoorsResult.hardware.HINGE).toBe(
			CONSTANTS.DOOR_HARDWARE.HINGE * 4
		);
	});

	it("calculates door panel dimensions correctly", () => {
		const dimensions: Dimensions = {
			length: 1000,
			width: 800,
			height: 750,
			isOutsideDimension: true,
		};

		const doors = {
			frontDoor: true,
			backDoor: true,
			leftDoor: true,
			rightDoor: true,
		};

		const result = calculateDoorMaterials(dimensions, doors);

		// Door panel dimensions should be adjusted based on enclosure dimensions
		// For outside dimensions with 2020 extrusions:
		// - Adjusted length = 1000 - 20 = 980
		// - Adjusted width = 800 - 20 = 780
		// - Panel adjustment = +12mm (as specified)

		// Check front and back door width (should be width + panel adjustment)
		const frontDoor = result.panels.find((p) => p.position === "Front");
		expect(frontDoor?.width).toBe(780 + 12); // 792
		expect(frontDoor?.height).toBe(750 - 20 + 12); // 742

		// Check side door width (should be length + panel adjustment)
		const leftDoor = result.panels.find((p) => p.position === "Left");
		expect(leftDoor?.width).toBe(980 + 12); // 992
		expect(leftDoor?.height).toBe(750 - 20 + 12); // 742
	});
});

describe("Panel Materials Calculations", () => {
	it("calculates panel dimensions correctly", () => {
		const dimensions: Dimensions = {
			length: 1000,
			width: 800,
			height: 750,
			isOutsideDimension: true,
		};

		const materialConfig = {
			type: "acrylic",
			thickness: 3,
			panelConfig: {
				top: true,
				bottom: true,
				left: true,
				right: true,
				back: true,
			},
		};

		const result = calculatePanelMaterials(dimensions, materialConfig);

		// Should have 5 panels (all sides)
		expect(result.panels).toHaveLength(5);

		// Check material properties
		expect(result.material.type).toBe("acrylic");
		expect(result.material.thickness).toBe(3);

		// Panel dimensions should be adjusted based on enclosure dimensions
		// For outside dimensions with 2020 extrusions:
		// - Adjusted length = 1000 - 20 = 980
		// - Adjusted width = 800 - 20 = 780
		// - Panel adjustment = +12mm (as specified)

		// Check top/bottom panel dimensions
		const topPanel = result.panels.find((p) => p.position === "Top");
		expect(topPanel?.width).toBe(780 + 12); // 792
		expect(topPanel?.length).toBe(980 + 12); // 992

		// Check side panel dimensions
		const leftPanel = result.panels.find((p) => p.position === "Left");
		expect(leftPanel?.width).toBe(980 + 12); // 992
		expect(leftPanel?.height).toBe(750 - 20 + 12); // 742
	});

	it("calculates total panel area correctly", () => {
		const dimensions: Dimensions = {
			length: 1000,
			width: 800,
			height: 750,
			isOutsideDimension: true,
		};

		// Only include top and left panels
		const materialConfig = {
			type: "acrylic",
			thickness: 3,
			panelConfig: {
				top: true,
				bottom: false,
				left: true,
				right: false,
				back: false,
			},
		};

		const result = calculatePanelMaterials(dimensions, materialConfig);

		// Should have 2 panels (top and left)
		expect(result.panels).toHaveLength(2);

		// Calculate expected areas
		// Top: (780 + 12) * (980 + 12) = 792 * 992 = 785,664
		// Left: (980 + 12) * (750 - 20 + 12) = 992 * 742 = 736,064
		// Total: 1,521,728
		const expectedArea = 792 * 992 + 992 * 742;
		expect(result.totalArea).toBe(expectedArea);
	});
});

describe("Mounting Materials Calculations", () => {
	it("returns the correct hardware quantities", () => {
		const result = calculateMountingMaterials();

		expect(result.hardware.IOCNR_40).toBe(4);
		expect(result.hardware.T_NUT_SLIDING).toBe(16);
		expect(result.hardware.CAP_HEAD_M5_8MM).toBe(16);
	});

	it("includes assembly instructions", () => {
		const result = calculateMountingMaterials();

		expect(result.instructions).toContain("Machine Table Mounting");
		expect(result.instructions).toContain("assembly guide");
	});
});

/**
 * Customer Quote Test Case
 * This test verifies calculations for a real customer request:
 * - 1200mm × 1200mm working area with 950mm total height (including 200mm half enclosure)
 * - 200mm height enclosure around perimeter
 * - Corflute panels
 * - M8 caster wheels
 */
describe("Customer Quote - Table with Half Enclosure", () => {
	it("calculates materials for 1200×1200 table with 200mm half enclosure", () => {
		// Table dimensions (1200×1200 working area, 750mm table height)
		const tableDimensions: Dimensions = {
			length: 1200, // 1200mm working area
			width: 1200, // 1200mm working area
			height: 750, // Total height minus enclosure height (950-200)
			isOutsideDimension: false, // These are inside dimensions (working area)
		};

		// Half enclosure dimensions (200mm height)
		const enclosureDimensions: Dimensions = {
			length: 1240, // Working area + 40mm for 2060 extrusions
			width: 1240, // Working area + 40mm for 2060 extrusions
			height: 200, // 200mm half enclosure
			isOutsideDimension: false, // These are inside dimensions
		};

		// Calculate materials
		const tableResult = calculateTableMaterials(tableDimensions);
		const enclosureResult = calculateEnclosureMaterials(enclosureDimensions);
		const mountingResult = calculateMountingMaterials();

		// Panel configuration for half enclosure (no top or bottom)
		const panelConfig = {
			type: "corflute",
			thickness: 5, // Standard corflute thickness
			panelConfig: {
				top: false,
				bottom: false,
				left: true,
				right: true,
				back: true,
			},
		};

		const panelResult = calculatePanelMaterials(
			enclosureDimensions,
			panelConfig
		);

		// Test table calculations
		expect(tableResult.extrusions.rail2060Length).toBe(1200);
		expect(tableResult.extrusions.rail2060Width).toBe(1200);
		expect(tableResult.extrusions.rail4040Legs).toBe(750);

		// Verify table includes M8 caster wheel mounts
		expect(tableResult.hardware.FOOT_BRACKETS).toBe(4);
		expect(tableResult.hardware.FEET).toBe(4);

		// Test enclosure calculations
		expect(enclosureResult.extrusions.horizontal.length.size).toBe(1240);
		expect(enclosureResult.extrusions.horizontal.width.size).toBe(1240);
		expect(enclosureResult.extrusions.vertical2020.size).toBe(200);

		// Test panel calculations for half enclosure
		expect(panelResult.material.type).toBe("corflute");

		// We expect 3 panels (left, right, back)
		expect(panelResult.panels).toHaveLength(3);

		// Verify panel dimensions (should be adjusted for 2020 extrusions)
		// Panel dimensions = internal dimension + 12mm adjustment
		const backPanel = panelResult.panels.find((p) => p.position === "Back");
		expect(backPanel?.width).toBe(1240 + 12); // 1252mm
		expect(backPanel?.height).toBe(200 + 12); // 212mm

		// Test mounting hardware
		expect(mountingResult.hardware.IOCNR_40).toBe(4);
		expect(mountingResult.hardware.T_NUT_SLIDING).toBe(16);
	});
});
