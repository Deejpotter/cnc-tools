/**
 * Table and Enclosure Calculator Utilities
 * Updated: 17/05/2025
 * Author: Deej Potter
 * Description: Utility functions for the Table and Enclosure Calculator component.
 * These functions handle calculations for different parts of a table and enclosure.
 */

import { EXTRUSION_OPTIONS } from "./constants";

// Constants for hardware quantities
const DEFAULT_TABLE_HARDWARE = {
	IOCNR_60: 8,
	L_BRACKET_TRIPLE: 16,
	T_NUT_SLIDING: 144,
	CAP_HEAD_M5_8MM: 48,
	BUTTON_HEAD_M5_8MM: 96,
	LOW_PROFILE_M5_25MM: 16,
	FOOT_BRACKETS: 4,
	FEET: 4,
};

const DEFAULT_ENCLOSURE_HARDWARE = {
	IOCNR_20: 4,
	IOCNR_40: 4,
	IOCNR_60: 4,
	ANGLE_CORNER_90: 4,
	T_NUT_SLIDING: 56,
	CAP_HEAD_M5_8MM: 56,
	BUTTON_HEAD_M5_8MM: 8,
};

// Additional hardware for 1.5m sides
const EXTRA_HARDWARE_FOR_1_5M = {
	T_NUT_SLIDING: 8,
	CAP_HEAD_M5_8MM: 8,
};

// Hardware required for mounting enclosure to table
const TABLE_MOUNT_HARDWARE = {
	IOCNR_40: 4,
	T_NUT_SLIDING: 16,
	CAP_HEAD_M5_8MM: 16,
};

// Hardware required for door installation
const DOOR_HARDWARE = {
	HINGE: 2, // Per door
	HANDLE: 1, // Per door
	T_NUT_SLIDING: 8, // Per door
	BUTTON_HEAD_M5_8MM: 8, // Per door
	CORNER_BRACKET: 4, // Per door
	SPRING_LOADED_T_NUT: 15, // Per door (based on Maker Store documentation)
};

/**
 * Interface for dimensions of table or enclosure
 * Includes flag for specifying whether dimensions are inside or outside measurements.
 * For the enclosure and table, the height is always the OD, the length and width are the ID or OD depending on the isOutsideDimension flag.
 */
export interface Dimensions {
	length: number;
	width: number;
	height: number;
	isOutsideDimension: boolean;
}

/**
 * Calculate table materials based on dimensions
 * @param dimensions The table dimensions in mm (length, width, height)
 * @param isOutsideDimension Boolean indicating if the given dimensions are outside measurements
 * @returns Object containing extrusion lengths and hardware
 */
export const calculateTableMaterials = (
	dimensions: Omit<Dimensions, "isOutsideDimension">,
	isOutsideDimension: boolean
) => {
	// Find the 4040 and 2060 extrusion dimensions from the constants
	// For the table legs we use 4040 extrusions
	const extrusion4040 = EXTRUSION_OPTIONS.find((e) => e.id === "40x40-40") || {
		width: 40,
		height: 40,
	}; // Default to 40mm if not found

	// Adjust the dimensions based on extrusion width
	// We use 4040 legs so we need to account for their thickness in the rail lengths
	const adjustedLength = isOutsideDimension
		? dimensions.length - extrusion4040.width
		: dimensions.length;
	const adjustedWidth = isOutsideDimension
		? dimensions.width - extrusion4040.width
		: dimensions.width;

	// Extrusion lengths
	const rail2060Length = adjustedLength; // Length of 2060 extrusions for table length
	const rail2060Width = adjustedWidth; // Length of 2060 extrusions for table width
	const legExtrusions4040 = dimensions.height; // Length of 4040 extrusions for table legs

	// Calculate total quantities needed
	const qtyRail2060Width = 2; // 2 for width or X axis
	const qtyRail2060Length = 2; // 2 for length or Y axis
	const qtyRail4040Legs = 4; // 4 legs for the table or Z axis

	return {
		extrusions: {
			rail2060Length,
			rail2060Width,
			rail4040Legs: legExtrusions4040,
			qtyRail2060Length,
			qtyRail2060Width,
			qtyRail4040Legs,
		},
		hardware: DEFAULT_TABLE_HARDWARE,
		totalLengths: {
			rail2060:
				rail2060Length * qtyRail2060Length + rail2060Width * qtyRail2060Width,
			rail4040: legExtrusions4040 * qtyRail4040Legs,
		},
	};
};

/**
 * Calculate enclosure materials based on dimensions
 * @param dimensions The enclosure dimensions in mm (length, width, height)
 * @param isOutsideDimension Boolean indicating if the given dimensions are outside measurements
 * @returns Object containing extrusion lengths and hardware
 */
export const calculateEnclosureMaterials = (
	// Omitting isOutsideDimension from dimensions for clarity
	dimensions: Omit<Dimensions, "isOutsideDimension">,
	isOutsideDimension: boolean
) => {
	const enclosureLength = dimensions.length;
	const enclosureWidth = dimensions.width;
	const enclosureHeight = dimensions.height;

	/**
	 * Determine extrusion types based on dimensions:
	 * - For enclosures 1500mm or larger: Top extrusions use 2040, Bottom always uses 2020
	 * - For smaller enclosures: All extrusions use 2020
	 * - Vertical extrusions always use 2020
	 */
	const isLargeEnclosure = enclosureLength >= 1500 || enclosureWidth >= 1500;

	// Get extrusion info from constants
	const extrusion2020 = EXTRUSION_OPTIONS.find((e) => e.id === "20x20-20");

	const extrusion2040 = EXTRUSION_OPTIONS.find((e) => e.id === "20x40-20");

	// Top extrusion types (for length and width rails)
	const topExtrusionType = isLargeEnclosure ? "2040" : "2020";
	const topExtrusionHeight = isLargeEnclosure
		? extrusion2040.height
		: extrusion2020.height;

	// Bottom extrusion types (always 2020)
	const bottomExtrusionType = "2020";
	const bottomExtrusionHeight = extrusion2020.height;

	// Vertical extrusion type (always 2020)
	const verticalExtrusionType = "2020";
	const verticalExtrusionWidth = extrusion2020.width;

	// Adjust dimensions if they are outside measurements
	// If it's outside dimension, the internal space is smaller.
	// The frame itself will be `dimensions.length` and `dimensions.width` on the outside.
	// So, the lengths of the extrusions forming the outer frame are `dimensions.length` and `dimensions.width`.
	// If it's *inside* dimension, the extrusions are `dimensions.length` and `dimensions.width` plus wall thickness.
	// The current logic in `calculateTableMaterials` subtracts when `isOutsideDimension` is true to get internal working space for table top.
	// For enclosure, if `dimensions` are "outside", the extrusion lengths are `dimensions.length`.
	// If `dimensions` are "inside", the extrusion lengths are `dimensions.length + (2 * extrusion_profile_width)`.
	// Let's assume `dimensions` always refers to the desired *outer* size of the enclosure frame for simplicity here,
	// or the *inner* clear space. The prompt implies `isOutsideDimension` refers to the input `dimensions`.

	let horizontalLength = dimensions.length;
	let horizontalWidth = dimensions.width;

	if (!isOutsideDimension) {
		// If dimensions are INSIDE, the extrusions need to be longer to achieve that internal space.
		// Add the width of the vertical extrusions to both ends
		horizontalLength += verticalExtrusionWidth * 2;
		horizontalWidth += verticalExtrusionWidth * 2;
	}

	const effectiveLength = isOutsideDimension
		? dimensions.length - verticalExtrusionWidth
		: dimensions.length;
	const effectiveWidth = isOutsideDimension
		? dimensions.width - verticalExtrusionWidth
		: dimensions.width;

	/**
	 * For vertical extrusions, we need to account for the top and bottom horizontal extrusions.
	 * The vertical extrusion height is the enclosure height minus the height of the horizontal extrusions.
	 * For example:
	 * - With 2020 top and bottom: height - (20mm top + 20mm bottom) = height - 40mm
	 * - With 2040 top and 2020 bottom: height - (40mm top + 20mm bottom) = height - 60mm
	 */ const effectiveHeight =
		dimensions.height - (topExtrusionHeight + bottomExtrusionHeight);
	/**
	 * Structure the extrusions to match the expected interface in types.ts
	 * For the enclosure frame:
	 * - Top: 2x length extrusions and 2x width extrusions (using topExtrusionType)
	 * - Bottom: 2x length extrusions and 2x width extrusions (using bottomExtrusionType/2020)
	 * - Vertical: 4x corner extrusions (always 2020)
	 *
	 * The types.ts file expects a specific structure where horizontal contains
	 * length and width properties, each with a type and size.
	 */
	const extrusions = {
		horizontal: {
			length: {
				// Using top extrusion type which could be 2020 or 2040 based on size
				type: topExtrusionType,
				size: effectiveLength,
			},
			width: {
				// Using top extrusion type which could be 2020 or 2040 based on size
				type: topExtrusionType,
				size: effectiveWidth,
			},
		},
		vertical2020: {
			// Vertical extrusions are always 2020 for standard enclosure
			size: effectiveHeight,
			qty: 4, // 4x for vertical corners
		},
	};

	// Add extra hardware for large dimensions (>=1500mm) for the additional IO bracket connections.
	let hardware = { ...DEFAULT_ENCLOSURE_HARDWARE };
	if (dimensions.length >= 1500 || dimensions.width >= 1500) {
		hardware = {
			...hardware,
			T_NUT_SLIDING:
				hardware.T_NUT_SLIDING + EXTRA_HARDWARE_FOR_1_5M.T_NUT_SLIDING,
			CAP_HEAD_M5_8MM:
				hardware.CAP_HEAD_M5_8MM + EXTRA_HARDWARE_FOR_1_5M.CAP_HEAD_M5_8MM,
		};
	}

	// Calculate the total lengths for each extrusion type
	const topLength2020 = topExtrusionType === "2020" ? effectiveLength * 2 : 0; // 2 for top length
	const topWidth2020 = topExtrusionType === "2020" ? effectiveWidth * 2 : 0; // 2 for top width
	const topLength2040 = topExtrusionType === "2040" ? effectiveLength * 2 : 0; // 2 for top length
	const topWidth2040 = topExtrusionType === "2040" ? effectiveWidth * 2 : 0; // 2 for top width

	const bottomLength2020 = effectiveLength * 2; // Always 2020 for bottom length
	const bottomWidth2020 = effectiveWidth * 2; // Always 2020 for bottom width

	return {
		extrusions,
		hardware,
		totalLengths: {
			// Total length of 2020 extrusions (top + bottom if applicable)
			rail2020: topLength2020 + bottomLength2020,
			// Total length of 2040 extrusions (top only if applicable)
			rail2040: topLength2040,
			// Total width of 2020 extrusions (top + bottom if applicable)
			railWidth2020: topWidth2020 + bottomWidth2020,
			// Total width of 2040 extrusions (top only if applicable)
			railWidth2040: topWidth2040,
			// Total vertical 2020 extrusion length
			verticalRail2020: effectiveHeight * 8, // 2 for each frame side.
		},
	};
};

/**
 * Calculate materials needed for mounting an enclosure to a table
 * @returns Object containing hardware requirements for mounting
 */
export const calculateMountingMaterials = () => {
	return {
		hardware: TABLE_MOUNT_HARDWARE,
		instructions:
			"See section 3.3.2 - Machine Table Mounting in the assembly guide",
	};
};

/**
 * Calculate door materials based on enclosure dimensions
 * @param dimensions The enclosure dimensions
 * @param doorConfig The door configuration (which doors are included and type)
 * @returns Door material requirements
 */
export const calculateDoorMaterials = (
	dimensions: Omit<Dimensions, "isOutsideDimension">, // Dimensions of the enclosure
	isOutsideDimension: boolean, // Whether enclosure dimensions were outside
	doorConfig: {
		frontDoor: boolean;
		backDoor: boolean;
		leftDoor: boolean;
		rightDoor: boolean;
		doorType: string;
	}
) => {
	const { length, width, height } = dimensions; // Corrected destructuring
	const { doorType } = doorConfig;

	/**
	 *  Panels sit inside the slot of the extrusion, so we need to increase the dimensions by the relevant slot depth.
	 * Panels sit inside, so the total size will be the OD of the frame or panel minus the height of the top and bottom extrusions and the width of the side extrusions.
	 * For the 20 series V-slot, the depth is 6mm so for an enclosure panel of 100x100mm made from 20x20mm extrusion, the panel size is:
	 * (panelWidth - extrusionWidth + slotDepth) * (panelHeight - extrusionHeight + slotDepth)
	 * or (100 - 20 + 6) * (100 - 20 + 6) = 86 * 86 = 7396mm^2
	 */

	// Get slot depth information from EXTRUSION_OPTIONS
	const extrusion20Series = EXTRUSION_OPTIONS.find((e) =>
		e.id.includes("20x20-20")
	);
	const slotDepth = extrusion20Series ? extrusion20Series.slotDepth : 6; // Default to 6mm if not found
	const PANEL_CALCULATION = (20 - slotDepth) * 2; // Calculation based on extrusion width and slot depth

	// Adjust dimensions based on whether they're inside or outside measurements
	// For outside dimensions, we need to subtract the extrusion width (20mm for 2020) to get the internal frame dimension.
	const extrusionWidth = 20; // Assuming 2020 extrusion for door panels as well
	const internalLength = isOutsideDimension
		? length - extrusionWidth * 2
		: length;
	const internalWidth = isOutsideDimension ? width - extrusionWidth * 2 : width;
	const internalHeight = isOutsideDimension
		? height - extrusionWidth * 2
		: height;

	// Calculate door panel dimensions, accounting for V-slot reduction
	const doorPanelHeight = internalHeight - PANEL_CALCULATION;
	const doorPanelFrontBackWidth = internalWidth - PANEL_CALCULATION;
	const doorPanelSideWidth = internalLength - PANEL_CALCULATION;

	// Count active doors (excluding the doorType property)
	const doorCount = [
		doorConfig.frontDoor,
		doorConfig.backDoor,
		doorConfig.leftDoor,
		doorConfig.rightDoor,
	].filter(Boolean).length;

	// Calculate total hardware needed based on number of doors and door type
	let hingeCount = DOOR_HARDWARE.HINGE * doorCount;
	let handleCount = DOOR_HARDWARE.HANDLE * doorCount;
	let tnutCount = DOOR_HARDWARE.T_NUT_SLIDING * doorCount;
	let buttonHeadCount = DOOR_HARDWARE.BUTTON_HEAD_M5_8MM * doorCount;
	let cornerBracketCount = DOOR_HARDWARE.CORNER_BRACKET * doorCount;

	// Adjust hardware counts based on door type
	if (doorConfig.doorType === "BFLD") {
		// Bi-fold doors need extra hinges for the fold and hardware to join panels
		hingeCount += doorCount; // Extra hinges for fold joints
		handleCount = doorCount; // One handle per door (not per panel)
		tnutCount = Math.ceil(tnutCount * 1.5); // More t-nuts for connecting panels
		buttonHeadCount = Math.ceil(buttonHeadCount * 1.5);
	} else if (doorConfig.doorType === "AWNG") {
		// Awning doors mount to top, so need slightly different hardware
		hingeCount = doorCount * 2; // Fewer hinges for awning type
		tnutCount = Math.ceil(tnutCount * 0.8); // Slightly fewer t-nuts
	}

	const doorHardware = {
		HINGE: hingeCount,
		HANDLE: handleCount,
		T_NUT_SLIDING: tnutCount,
		BUTTON_HEAD_M5_8MM: buttonHeadCount,
		CORNER_BRACKET: cornerBracketCount,
		SPRING_LOADED_T_NUT: Math.ceil(doorCount * 15), // From documentation: 15 per door
	};
	// Calculate door panel sizes based on configuration and door type
	const doorPanels = [];

	/**
	 * Helper function to get door panel dimensions based on door type
	 * Values are based on Maker Store door panel cut size specifications
	 */
	const getDoorPanelDimensions = (
		position: string,
		baseWidth: number, // This will be doorPanelFrontBackWidth or doorPanelSideWidth
		baseHeight: number // This will be doorPanelHeight
	) => {
		// For standard doors, use the V-slot adjusted dimensions
		if (doorConfig.doorType === "STND") {
			return [
				{
					position,
					width: baseWidth,
					height: baseHeight,
					notes: "Standard Door Panel (fits in V-slot)",
				},
			];
		}

		// For awning doors, specific adjustments might be needed on top of V-slot
		// The original code had width - 4, height + 4. We need to see how this interacts with V-slot.
		// For now, let's assume these are final adjustments *after* V-slot sizing.
		if (doorConfig.doorType === "AWNG") {
			return [
				{
					position,
					width: baseWidth - 4, // Further adjust from V-slot sized width
					height: baseHeight + 4, // Further adjust from V-slot sized height
					notes:
						"Awning Door Panel (fits in V-slot, specific adjustments applied)",
				},
			];
		}

		// For bi-fold doors, split the V-slot adjusted width
		if (doorConfig.doorType === "BFLD") {
			const halfWidth = Math.round(baseWidth / 2) - 2; // Split V-slot width, then apply 2mm gap
			return [
				{
					position: `${position} (Left)`,
					width: halfWidth,
					height: baseHeight,
					notes: "Bi-Fold Door - left panel (fits in V-slot)",
				},
				{
					position: `${position} (Right)`,
					width: halfWidth,
					height: baseHeight,
					notes: "Bi-Fold Door - right panel (fits in V-slot)",
				},
			];
		}
		// Fallback to V-slot adjusted dimensions if type is unknown
		return [
			{
				position,
				width: baseWidth,
				height: baseHeight,
				notes: "Door Panel (fits in V-slot)",
			},
		];
	};

	if (doorConfig.frontDoor) {
		doorPanels.push(
			...getDoorPanelDimensions(
				"Front",
				doorPanelFrontBackWidth,
				doorPanelHeight
			)
		);
	}

	if (doorConfig.backDoor) {
		doorPanels.push(
			...getDoorPanelDimensions(
				"Back",
				doorPanelFrontBackWidth,
				doorPanelHeight
			)
		);
	}

	if (doorConfig.leftDoor) {
		doorPanels.push(
			...getDoorPanelDimensions("Left", doorPanelSideWidth, doorPanelHeight)
		);
	}

	if (doorConfig.rightDoor) {
		doorPanels.push(
			...getDoorPanelDimensions("Right", doorPanelSideWidth, doorPanelHeight)
		);
	}

	return {
		hardware: doorHardware,
		panels: doorPanels,
	};
};

/**
 * Calculate panel materials based on enclosure dimensions
 * @param dimensions The enclosure dimensions
 * @param materialConfig The material configuration (which panels are included)
 * @returns Panel material requirements
 */
export const calculatePanelMaterials = (
	dimensions: Omit<Dimensions, "isOutsideDimension">, // Dimensions of the enclosure
	isOutsideDimension: boolean, // Whether enclosure dimensions were outside
	materialConfig: {
		type: string;
		thickness: number; // This will now always be 6mm from the fixed value
		panelConfig: {
			top: boolean;
			bottom: boolean;
			left: boolean;
			right: boolean;
			back: boolean;
			front?: boolean; // Added front panel option
		};
	}
) => {
	const { length, width, height } = dimensions; // Corrected destructuring

	/**
	 *  Panels sit inside the slot of the extrusion, so we need to increase the dimensions by the relevant slot depth.
	 * Panels sit inside, so the total size will be the OD of the frame or panel minus the height of the top and bottom extrusions and the width of the side extrusions.
	 * For the 20 series V-slot, the depth is 6mm so for an enclosure panel of 100x100mm made from 20x20mm extrusion, the panel size is:
	 * (panelWidth - extrusionWidth + slotDepth) * (panelHeight - extrusionHeight + slotDepth)
	 * or (100 - 20 + 6) * (100 - 20 + 6) = 86 * 86 = 7396mm^2
	 */
	// Get slot depth information from EXTRUSION_OPTIONS
	const extrusionInfo = EXTRUSION_OPTIONS.find((e) =>
		e.id.includes("20x20-20")
	);
	const slotDepth = extrusionInfo ? extrusionInfo.slotDepth : 6; // Default to 6mm if not found
	const extrusionWidth = extrusionInfo ? extrusionInfo.width : 20; // Default to 20mm if not found
	const PANEL_REDUCTION = (extrusionWidth - slotDepth) * 2; // Calculation based on extrusion width and slot depth

	// Adjust dimensions based on whether they're inside or outside measurements
	// For outside dimensions, we need to subtract the extrusion width (20mm for 2020) to get the internal frame dimension.
	const internalLength = isOutsideDimension
		? length - extrusionWidth * 2
		: length;
	const internalWidth = isOutsideDimension ? width - extrusionWidth * 2 : width;
	const internalHeight = isOutsideDimension
		? height - extrusionWidth * 2
		: height; // Assuming panels go up to the top/bottom of vertical extrusions

	// Calculate panel dimensions, accounting for V-slot reduction
	const panelTopBottomWidth = internalWidth - PANEL_REDUCTION;
	const panelTopBottomLength = internalLength - PANEL_REDUCTION;

	const panelSideHeight = internalHeight - PANEL_REDUCTION;
	const panelFrontBackHeight = internalHeight - PANEL_REDUCTION; // Same as side height

	const panelSideWidth = internalLength - PANEL_REDUCTION; // Left/Right panels use enclosure length
	const panelFrontBackWidth = internalWidth - PANEL_REDUCTION; // Front/Back panels use enclosure width

	// Initialize panels array
	const panels = [];

	// Add panels based on configuration
	if (materialConfig.panelConfig.top) {
		panels.push({
			position: "Top",
			width: panelTopBottomWidth,
			length: panelTopBottomLength,
			notes: "Top panel",
		});
	}

	if (materialConfig.panelConfig.bottom) {
		panels.push({
			position: "Bottom",
			width: panelTopBottomWidth,
			length: panelTopBottomLength,
			notes: "Bottom panel",
		});
	}

	if (materialConfig.panelConfig.left) {
		panels.push({
			position: "Left",
			width: panelSideWidth, // This was panelLength, should be based on internalLength
			height: panelSideHeight,
		});
	}

	if (materialConfig.panelConfig.right) {
		panels.push({
			position: "Right",
			width: panelSideWidth, // This was panelLength, should be based on internalLength
			height: panelSideHeight,
		});
	}

	if (materialConfig.panelConfig.back) {
		panels.push({
			position: "Back",
			width: panelFrontBackWidth, // This was panelWidth, should be based on internalWidth
			height: panelFrontBackHeight,
		});
	}

	// Add front panel if configured
	if (materialConfig.panelConfig.front) {
		panels.push({
			position: "Front",
			width: panelFrontBackWidth, // Similar to back panel
			height: panelFrontBackHeight,
		});
	}

	// Calculate total area for material estimation
	const totalArea = panels.reduce((sum, panel) => {
		// For top/bottom panels
		if (panel.position === "Top" || panel.position === "Bottom") {
			return sum + (panel.width || 0) * (panel.length || 0);
		}
		// For side panels
		return sum + (panel.width || 0) * (panel.height || 0);
	}, 0);

	return {
		material: {
			type: materialConfig.type,
			thickness: materialConfig.thickness,
		},
		panels,
		totalArea,
	};
};

// Export constants for testing
export const CONSTANTS = {
	DEFAULT_TABLE_HARDWARE,
	DEFAULT_ENCLOSURE_HARDWARE,
	EXTRA_HARDWARE_FOR_1_5M,
	TABLE_MOUNT_HARDWARE,
	DOOR_HARDWARE,
};
