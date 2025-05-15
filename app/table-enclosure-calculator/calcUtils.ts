/**
 * Table and Enclosure Calculator Utilities
 * Updated: 14/05/2025
 * Author: Deej Potter
 * Description: Utility functions for the Table and Enclosure Calculator component.
 * These functions handle calculations for different parts of a table and enclosure.
 */

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
 * Includes flag for specifying whether dimensions are inside or outside measurements
 */
export interface Dimensions {
	length: number;
	width: number;
	height: number;
	isOutsideDimension: boolean;
}

/**
 * Calculate table materials based on dimensions
 * @param dimensions The table dimensions in mm
 * @returns Object containing extrusion lengths and hardware
 */
export const calculateTableMaterials = (dimensions: Dimensions) => {
	const { length, width, height, isOutsideDimension } = dimensions;

	// Adjust dimensions based on whether they're inside or outside measurements
	// For outside dimensions, we need to subtract the extrusion width for internal lengths
	const adjustmentFactor = isOutsideDimension ? 40 : 0; // 40mm for 4040 extrusion

	// Calculate adjusted lengths for the table frame
	const adjustedLength = length - adjustmentFactor;
	const adjustedWidth = width - adjustmentFactor;

	// Calculate extrusion lengths
	const lengthExtrusions2060 = adjustedLength;
	const widthExtrusions2060 = adjustedWidth;
	const legExtrusions4040 = height;

	return {
		extrusions: {
			rail2060Length: lengthExtrusions2060,
			rail2060Width: widthExtrusions2060,
			rail4040Legs: legExtrusions4040,
			// Calculate total quantities needed
			qtyRail2060Length: 4,
			qtyRail2060Width: 4,
			qtyRail4040Legs: 4,
		},
		hardware: DEFAULT_TABLE_HARDWARE,
		totalLengths: {
			rail2060: lengthExtrusions2060 * 4 + widthExtrusions2060 * 4,
			rail4040: legExtrusions4040 * 4,
		},
	};
};

/**
 * Calculate enclosure materials based on dimensions
 * @param dimensions The enclosure dimensions in mm
 * @returns Object containing extrusion lengths and hardware
 */
export const calculateEnclosureMaterials = (dimensions: Dimensions) => {
	const { length, width, height, isOutsideDimension } = dimensions;

	// Adjust dimensions based on whether they're inside or outside measurements
	// For outside dimensions, we need to subtract the extrusion width for internal lengths
	const adjustmentFactor = isOutsideDimension ? 20 : 0; // 20mm for 2020 extrusion

	// Calculate adjusted lengths for the enclosure frame
	const adjustedLength = length - adjustmentFactor;
	const adjustedWidth = width - adjustmentFactor;
	// Determine if any dimension is 1500mm or greater (1.5m)
	const has1500mmSide = length >= 1500 || width >= 1500;

	// For 1.5m+ sides, we use 2040 instead of 2020
	let hardware = { ...DEFAULT_ENCLOSURE_HARDWARE };
	let horizontalRails = {
		length: {
			type: length >= 1500 ? "2040" : "2020",
			size: adjustedLength,
		},
		width: {
			type: width >= 1500 ? "2040" : "2020",
			size: adjustedWidth,
		},
	};

	// Add extra hardware for 1.5m sides
	if (has1500mmSide) {
		hardware.T_NUT_SLIDING += EXTRA_HARDWARE_FOR_1_5M.T_NUT_SLIDING;
		hardware.CAP_HEAD_M5_8MM += EXTRA_HARDWARE_FOR_1_5M.CAP_HEAD_M5_8MM;
	}

	return {
		extrusions: {
			horizontal: horizontalRails,
			vertical2020: {
				size: height,
				qty: 8,
			},
		},
		hardware: hardware,
		totalLengths: {
			rail2020: horizontalRails.length.type === "2020" ? adjustedLength * 4 : 0,
			rail2040: horizontalRails.length.type === "2040" ? adjustedLength * 2 : 0,
			railWidth2020:
				horizontalRails.width.type === "2020" ? adjustedWidth * 4 : 0,
			railWidth2040:
				horizontalRails.width.type === "2040" ? adjustedWidth * 2 : 0,
			verticalRail2020: height * 8,
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
	dimensions: Dimensions,
	doorConfig: {
		frontDoor: boolean;
		backDoor: boolean;
		leftDoor: boolean;
		rightDoor: boolean;
		doorType: string;
	}
) => {
	const { length, width, height, isOutsideDimension } = dimensions;
	const { doorType } = doorConfig;

	// Adjustment factor for panel dimensions based on door type
	let panelAdjustment = 12; // Default for standard doors

	// Different adjustment factors based on door type
	// These values come from Maker Store door panel cut size specifications
	if (doorType === "AWNG") {
		panelAdjustment = 16; // Awning doors have different panel sizes
	} else if (doorType === "BFLD") {
		panelAdjustment = 12; // Bi-fold doors have same adjustment but different panel layout
	}

	// Adjust dimensions based on whether they're inside or outside measurements
	const adjustmentFactor = isOutsideDimension ? 20 : 0; // 20mm for 2020 extrusion

	// Calculate adjusted lengths for the enclosure frame
	const adjustedLength = length - adjustmentFactor;
	const adjustedWidth = width - adjustmentFactor;

	// Calculate door dimensions (add adjustment to ID as specified)
	const doorHeight = height - adjustmentFactor + panelAdjustment;
	const doorFrontBackWidth = adjustedWidth + panelAdjustment;
	const doorSideWidth = adjustedLength + panelAdjustment;
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
		width: number,
		height: number
	) => {
		// Base dimensions for all doors
		const baseDimensions = { position, width, height };

		// For standard doors, just use the standard dimensions
		if (doorConfig.doorType === "STND") {
			return [baseDimensions];
		}

		// For awning doors, adjust the panel dimensions slightly
		if (doorConfig.doorType === "AWNG") {
			return [
				{
					...baseDimensions,
					width: width - 4, // Awning doors have 4mm less width
					height: height + 4, // Awning doors have 4mm more height
					notes: "Awning Door - panel mounts to top frame",
				},
			];
		}

		// For bi-fold doors, create two panel dimensions per door
		if (doorConfig.doorType === "BFLD") {
			const halfWidth = Math.round(width / 2) - 2; // Split into two panels with 2mm gap
			return [
				{
					position: `${position} (Left)`,
					width: halfWidth,
					height: height,
					notes: "Bi-Fold Door - left panel",
				},
				{
					position: `${position} (Right)`,
					width: halfWidth,
					height: height,
					notes: "Bi-Fold Door - right panel",
				},
			];
		}

		// Fallback to standard dimensions
		return [baseDimensions];
	};

	if (doorConfig.frontDoor) {
		doorPanels.push(
			...getDoorPanelDimensions("Front", doorFrontBackWidth, doorHeight)
		);
	}

	if (doorConfig.backDoor) {
		doorPanels.push(
			...getDoorPanelDimensions("Back", doorFrontBackWidth, doorHeight)
		);
	}

	if (doorConfig.leftDoor) {
		doorPanels.push(
			...getDoorPanelDimensions("Left", doorSideWidth, doorHeight)
		);
	}

	if (doorConfig.rightDoor) {
		doorPanels.push(
			...getDoorPanelDimensions("Right", doorSideWidth, doorHeight)
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
	dimensions: Dimensions,
	materialConfig: {
		type: string;
		thickness: number;
		panelConfig: {
			top: boolean;
			bottom: boolean;
			left: boolean;
			right: boolean;
			back: boolean;
		};
	}
) => {
	const { length, width, height, isOutsideDimension } = dimensions;

	// Adjustment factor for panel dimensions (12mm wider than ID as specified)
	const panelAdjustment = 12;

	// Adjust dimensions based on whether they're inside or outside measurements
	const adjustmentFactor = isOutsideDimension ? 20 : 0; // 20mm for 2020 extrusion

	// Calculate adjusted lengths for the enclosure frame
	const adjustedLength = length - adjustmentFactor;
	const adjustedWidth = width - adjustmentFactor;

	// Calculate panel dimensions (add 12mm to ID as specified)
	const panelHeight = height - adjustmentFactor + panelAdjustment;
	const panelLength = adjustedLength + panelAdjustment;
	const panelWidth = adjustedWidth + panelAdjustment;

	// Initialize panels array
	const panels = [];

	// Add panels based on configuration
	if (materialConfig.panelConfig.top) {
		panels.push({
			position: "Top",
			width: panelWidth,
			length: panelLength,
		});
	}

	if (materialConfig.panelConfig.bottom) {
		panels.push({
			position: "Bottom",
			width: panelWidth,
			length: panelLength,
		});
	}

	if (materialConfig.panelConfig.left) {
		panels.push({
			position: "Left",
			width: panelLength,
			height: panelHeight,
		});
	}

	if (materialConfig.panelConfig.right) {
		panels.push({
			position: "Right",
			width: panelLength,
			height: panelHeight,
		});
	}

	if (materialConfig.panelConfig.back) {
		panels.push({
			position: "Back",
			width: panelWidth,
			height: panelHeight,
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
