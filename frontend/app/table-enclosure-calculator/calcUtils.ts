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
 * @param dimensions The table dimensions in mm (length, width, height)
 * @param isOutsideDimension Boolean indicating if the given dimensions are outside measurements
 * @returns Object containing extrusion lengths and hardware
 */
export const calculateTableMaterials = (
	dimensions: Omit<Dimensions, "isOutsideDimension">,
	isOutsideDimension: boolean
) => {
	const adjustedLength = isOutsideDimension
		? dimensions.length - 40
		: dimensions.length;
	const adjustedWidth = isOutsideDimension
		? dimensions.width - 40
		: dimensions.width;

	// Extrusion lengths
	const rail2060Length = adjustedLength; // Length of 2060 extrusions for table length
	const rail2060Width = adjustedWidth; // Length of 2060 extrusions for table width
	const legExtrusions4040 = dimensions.height; // Length of 4040 extrusions for table legs

	return {
		extrusions: {
			rail2060Length,
			rail2060Width,
			rail4040Legs: legExtrusions4040,
			// Calculate total quantities needed
			qtyRail2060Length: 4,
			qtyRail2060Width: 4,
			qtyRail4040Legs: 4,
		},
		hardware: DEFAULT_TABLE_HARDWARE,
		totalLengths: {
			rail2060: rail2060Length * 4 + rail2060Width * 4,
			rail4040: legExtrusions4040 * 4,
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
	dimensions: Omit<Dimensions, "isOutsideDimension">,
	isOutsideDimension: boolean
) => {
	const enclosureLength = dimensions.length;
	const enclosureWidth = dimensions.width;
	const enclosureHeight = dimensions.height;

	// Determine extrusion type based on dimensions
	const lengthExtrusionType = enclosureLength >= 1500 ? "2040" : "2020";
	const widthExtrusionType = enclosureWidth >= 1500 ? "2040" : "2020";

	// Adjust dimensions if they are outside measurements
	// Assuming a 20mm extrusion wall thickness for adjustment.
	// This might need to be more sophisticated if extrusion types (2020 vs 2040) affect the offset.
	const adjustment = 20; // Half of 40mm for 20-series, or full 20mm for one side.
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
		// Assuming 20mm profile for simplicity of adjustment here.
		// This is a common source of confusion, ensure it matches user expectation.
		// For now, let's assume if it's NOT outside, it's inside, so we add extrusion thickness.
		// If lengthExtrusionType is 2040, width is 40. If 2020, width is 20.
		horizontalLength += (lengthExtrusionType === "2040" ? 40 : 20) * 2; // Simplified: assuming this means adding to each end.
		horizontalWidth += (widthExtrusionType === "2040" ? 40 : 20) * 2; // This logic might need refinement based on exact frame construction.
	}
	// However, typically, if a user provides "outside dimensions", those are the literal lengths of the outermost extrusions.
	// If they provide "inside dimensions", those are the clear internal space, and the extrusions must be longer.
	// The existing table logic: if outside, `dim - 40`. If inside, `dim`. This implies `dimensions` are the target overall size.
	// Let's stick to: if `isOutsideDimension` is true, `horizontalLength = dimensions.length`.
	// If `isOutsideDimension` is false (meaning inputs are *inside* dimensions), then
	// `horizontalLength = dimensions.length + thickness_of_walls_made_by_extrusions`.
	// For an enclosure made of 2020, the wall is 20mm. So, `dimensions.length + 2*20`.

	// Re-evaluating based on common interpretation:
	// If `isOutsideDimension` is TRUE: the given L/W/H are the outermost points.
	//   - Horizontal extrusions are `dimensions.length` and `dimensions.width`.
	//   - Vertical extrusions are `dimensions.height`.
	// If `isOutsideDimension` is FALSE: the given L/W/H are the inner clear space.
	//   - Horizontal extrusions are `dimensions.length + 2 * profile_width_of_vertical_member` (e.g., + 2*20 for 2020 vertical)
	//   - Vertical extrusions are `dimensions.height + 2 * profile_width_of_horizontal_member_top_and_bottom` (e.g. + 2*20 for 2020 top/bottom rails)

	// Let's simplify and assume the `dimensions` are for the main box frame.
	// And `isOutsideDimension` means the L/W/H are the final outer footprint/height.
	// The current table calculation subtracts 40mm (for 4040 legs) when `isOutsideDimension` is true,
	// to get the length of rails that fit *between* the legs.
	// This is different. For an enclosure frame, if L is outside, then the extrusion is L.

	// Let's assume `dimensions` refers to the overall size and `isOutsideDimension` clarifies this.
	// For enclosure:
	// Length rails (x4): `dimensions.length` if outside, or `dimensions.length + 2*thickness_of_side_vertical_extrusion` if inside.
	// Width rails (x4): `dimensions.width` if outside, or `dimensions.width + 2*thickness_of_front/back_vertical_extrusion` if inside.
	// Vertical rails (x4): `dimensions.height` if outside, or `dimensions.height` if inside (assuming panels sit inside frame).
	// This gets complex quickly. A common approach: if "outside dimensions", those are the literal lengths of the main frame components.

	// Sticking to a simpler model for now: the adjustment for outside/inside affects the panel sizes more than extrusion lengths,
	// if we assume the provided dimensions are for the extrusion frame itself.
	// If `isOutsideDimension` is true, `dimensions.length` is the length of the long horizontal extrusions.
	// If `isOutsideDimension` is false (meaning it's an *internal* dimension target), then the extrusions must be longer.
	// Let's assume the provided dimensions are for the *centerlines* or *effective structural size* and adjust panels later.
	// For now, let extrusion lengths be based directly on `dimensions` and `isOutsideDimension` will primarily affect panel calculations.
	// This is a common simplification unless very detailed corner constructions are modeled.

	// Let's use the same logic as table for adjustment for now, assuming `dimensions` are overall targets.
	// If outside, actual extrusion is slightly less to fit within that. If inside, extrusion is that length.
	// This is consistent with how `calculateTableMaterials` was structured.
	const effectiveLength = isOutsideDimension
		? dimensions.length - (lengthExtrusionType === "2040" ? 40 : 20)
		: dimensions.length;
	const effectiveWidth = isOutsideDimension
		? dimensions.width - (widthExtrusionType === "2040" ? 40 : 20)
		: dimensions.width;
	const effectiveHeight = dimensions.height; // Usually, height is direct.

	const extrusions = {
		horizontal: {
			length: {
				type: lengthExtrusionType,
				size: effectiveLength, // 4x for top/bottom length
			},
			width: {
				type: widthExtrusionType,
				size: effectiveWidth, // 4x for top/bottom width
			},
		},
		vertical2020: {
			// Assuming vertical are always 2020 for standard enclosure, unless specified otherwise
			size: effectiveHeight, // 4x for corners
			qty: 4,
		},
	};
	// Add extra hardware for large dimensions (>=1500mm)
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

	return {
		extrusions,
		hardware,
		totalLengths: {
			rail2020:
				extrusions.horizontal.length.type === "2020" ? effectiveLength * 4 : 0,
			rail2040:
				extrusions.horizontal.length.type === "2040" ? effectiveLength * 2 : 0,
			railWidth2020:
				extrusions.horizontal.width.type === "2020" ? effectiveWidth * 4 : 0,
			railWidth2040:
				extrusions.horizontal.width.type === "2040" ? effectiveWidth * 2 : 0,
			verticalRail2020: effectiveHeight * 4,
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

	// V-slot depth is 6mm. Panels sit inside, so reduce each dimension by 2 * 6mm = 12mm.
	const V_SLOT_PANEL_REDUCTION = 12;

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
	const doorPanelHeight = internalHeight - V_SLOT_PANEL_REDUCTION;
	const doorPanelFrontBackWidth = internalWidth - V_SLOT_PANEL_REDUCTION;
	const doorPanelSideWidth = internalLength - V_SLOT_PANEL_REDUCTION;

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

	// V-slot depth is 6mm. Panels sit inside, so reduce each dimension by 2 * 6mm = 12mm.
	const V_SLOT_PANEL_REDUCTION = 12;

	// Adjust dimensions based on whether they're inside or outside measurements
	// For outside dimensions, we need to subtract the extrusion width (20mm for 2020) to get the internal frame dimension.
	const extrusionWidth = 20; // Assuming 2020 extrusion for enclosure panels
	const internalLength = isOutsideDimension
		? length - extrusionWidth * 2
		: length;
	const internalWidth = isOutsideDimension ? width - extrusionWidth * 2 : width;
	const internalHeight = isOutsideDimension
		? height - extrusionWidth * 2
		: height; // Assuming panels go up to the top/bottom of vertical extrusions

	// Calculate panel dimensions, accounting for V-slot reduction
	const panelTopBottomWidth = internalWidth - V_SLOT_PANEL_REDUCTION;
	const panelTopBottomLength = internalLength - V_SLOT_PANEL_REDUCTION;

	const panelSideHeight = internalHeight - V_SLOT_PANEL_REDUCTION;
	const panelFrontBackHeight = internalHeight - V_SLOT_PANEL_REDUCTION; // Same as side height

	const panelSideWidth = internalLength - V_SLOT_PANEL_REDUCTION; // Left/Right panels use enclosure length
	const panelFrontBackWidth = internalWidth - V_SLOT_PANEL_REDUCTION; // Front/Back panels use enclosure width

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
