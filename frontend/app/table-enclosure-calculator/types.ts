/**
 * Type definitions for the Table and Enclosure Calculator
 */

/**
 * Door types available based on Maker Store documentation
 */
export enum DoorType {
	STANDARD = "STND",
	BIFOLD = "BFLD",
	AWNING = "AWNG",
}

/**
 * Door type display names for user-friendly interface
 */
export const DoorTypeDisplayNames = {
	[DoorType.STANDARD]: "Standard",
	[DoorType.BIFOLD]: "Bi-Fold",
	[DoorType.AWNING]: "Awning",
};

/**
 * Interface for dimensions of table or enclosure
 * Includes centralized control for dimension type (inside vs outside)
 */
export interface Dimensions {
	length: number;
	width: number;
	height: number;
	isOutsideDimension?: boolean; // Optional flag for backward compatibility
}

/**
 * Interface for door configuration options
 */
export interface DoorConfig {
	frontDoor: boolean;
	backDoor: boolean;
	leftDoor: boolean;
	rightDoor: boolean;
	doorType: DoorType;
}

/**
 * Interface for door panel dimensions
 */
export interface DoorPanelDimensions {
	position: string;
	width: number;
	height: number;
	notes?: string; // Optional notes field for door type specific information
}

/**
 * Interface for configuration options
 */
export interface TableConfig {
	includeTable: boolean;
	includeEnclosure: boolean;
	mountEnclosureToTable: boolean;
	includeDoors: boolean;
	doorConfig: DoorConfig;
	isOutsideDimension: boolean; // Added: Centralized control for dimension type
}

/**
 * Interface for material configuration
 */
export interface MaterialConfig {
	type: string;
	thickness: number;
	includePanels: boolean;
	panelConfig: {
		top: boolean;
		bottom: boolean;
		left: boolean;
		right: boolean;
		back: boolean;
		front?: boolean; // Optional: for front panel if no door or specific design
	};
}

/**
 * Interface for calculation results
 */
export interface Results {
	table?: {
		extrusions: {
			rail2060Length: number;
			rail2060Width: number;
			rail4040Legs: number;
			qtyRail2060Length: number;
			qtyRail2060Width: number;
			qtyRail4040Legs: number;
		};
		hardware: {
			IOCNR_60: number;
			L_BRACKET_TRIPLE: number;
			T_NUT_SLIDING: number;
			CAP_HEAD_M5_8MM: number;
			BUTTON_HEAD_M5_8MM: number;
			LOW_PROFILE_M5_25MM: number;
			FOOT_BRACKETS: number;
			FEET: number;
		};
		totalLengths: {
			rail2060: number;
			rail4040: number;
		};
	};
	enclosure?: {
		extrusions: {
			horizontal: {
				length: {
					type: string;
					size: number;
				};
				width: {
					type: string;
					size: number;
				};
			};
			vertical2020: {
				size: number;
				qty: number;
			};
		};
		hardware: {
			IOCNR_20: number;
			IOCNR_40: number;
			IOCNR_60: number;
			ANGLE_CORNER_90: number;
			T_NUT_SLIDING: number;
			CAP_HEAD_M5_8MM: number;
			BUTTON_HEAD_M5_8MM: number;
		};
		totalLengths: {
			rail2020: number;
			rail2040: number;
			railWidth2020: number;
			railWidth2040: number;
			verticalRail2020: number;
		};
	};
	mounting?: {
		hardware: {
			IOCNR_40: number;
			T_NUT_SLIDING: number;
			CAP_HEAD_M5_8MM: number;
		};
		instructions: string;
	};
	doors?: {
		hardware: {
			HINGE: number;
			HANDLE: number;
			T_NUT_SLIDING: number;
			BUTTON_HEAD_M5_8MM: number;
			CORNER_BRACKET: number;
		};
		panels: Array<{
			position: string;
			width: number;
			height: number;
		}>;
	};
	panels?: {
		material: {
			type: string;
			thickness: number;
		};
		panels: Array<{
			position: string;
			width?: number;
			height?: number;
			length?: number;
		}>;
		totalArea: number;
	};
}
