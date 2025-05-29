/**
 * CNC Tools - Centralized Type Definitions
 * Updated: 29/05/2025
 * Author: Deej Potter
 * Description: Main type index that exports all type definitions used across the CNC Tools application.
 * This serves as the single source of truth for importing types throughout the frontend and backend.
 * 
 * Organization:
 * - Table & Enclosure Calculator Types (lines ~20-180)
 * - Box Shipping Calculator Types (imported from ./box-shipping-calculator)
 * - Shared/Common Types (imported from ./shared)
 * - MongoDB Types (imported via box-shipping-calculator module)
 */

// =============================================================================
// TABLE & ENCLOSURE CALCULATOR TYPES
// =============================================================================

/**
 * Door types available for enclosures
 * Used in the table enclosure calculator for door configuration
 */
export enum DoorType {
	STANDARD = "STND",
	BIFOLD = "BFLD", 
	AWNING = "AWNG",
}

export interface MaterialType {
	id: string;
	name: string;
	sku: string;
	description?: string;
	price?: number;
	unit?: string;
}

export interface Dimensions {
	width: number;
	length: number;
	height: number;
}

export interface DoorConfig {
	frontDoor: boolean;
	backDoor: boolean;
	leftDoor: boolean;
	rightDoor: boolean;
	doorType: DoorType;
}

export interface TableConfig {
	includeTable: boolean;
	includeEnclosure: boolean;
	mountEnclosureToTable: boolean;
	includeDoors: boolean;
	isOutsideDimension: boolean;
	doorConfig: DoorConfig;
}

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
		front: boolean;
	};
}

// --- Results subtypes ---

/**
 * Table calculation results
 */
export interface TableResults {
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
}

export interface EnclosureResults {
	extrusions: {
		horizontal: {
			length: { type: string; size: number };
			width: { type: string; size: number };
		};
		vertical2020: { size: number; qty: number };
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
}

export interface MountingResults {
	hardware: {
		IOCNR_40: number;
		T_NUT_SLIDING: number;
		CAP_HEAD_M5_8MM: number;
	};
	instructions: string;
}

export interface DoorPanel {
	position: string;
	width: number;
	height: number;
	notes?: string;
}

export interface DoorResults {
	hardware: {
		HINGE: number;
		HANDLE: number;
		T_NUT_SLIDING: number;
		BUTTON_HEAD_M5_8MM: number;
		CORNER_BRACKET: number;
	};
	panels: DoorPanel[];
}

export interface PanelMaterial {
	type: string;
	thickness: number;
}

export interface PanelPanel {
	position: string;
	width?: number;
	height?: number;
	length?: number;
}

export interface PanelResults {
	material: PanelMaterial;
	panels: PanelPanel[];
	totalArea: number;
}

/**
 * Results for the Table and Enclosure Calculator
 */
export interface Results {
	table?: TableResults;
	enclosure?: EnclosureResults;
	mounting?: MountingResults;
	doors?: DoorResults;
	panels?: PanelResults;
}

export const DoorTypeDisplayNames: Record<DoorType, string> = {
	[DoorType.STANDARD]: "Standard Door",
	[DoorType.BIFOLD]: "Bifold Door",
	[DoorType.AWNING]: "Awning Door",
};

export interface ConfigPanelProps {
	config: TableConfig;
	tableDimensions: Omit<Dimensions, "isOutsideDimension">;
	enclosureDimensions: Omit<Dimensions, "isOutsideDimension">;
	materialConfig: MaterialConfig;
	handleConfigChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleTableDimensionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleEnclosureDimensionChange: (
		e: React.ChangeEvent<HTMLInputElement>
	) => void;
	handlePanelConfigChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleMaterialTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	handleDoorTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	MATERIAL_TYPES: Array<{ id: string; name: string }>;
	MATERIAL_THICKNESS: number;
}

// =============================================================================
// BOX SHIPPING CALCULATOR TYPES
// =============================================================================

/**
 * Re-export all box shipping calculator types from their dedicated module.
 * This includes both algorithm types (Point3D, PackedItem, etc.) and 
 * MongoDB database types (ShippingBox, ShippingItem).
 * 
 * For detailed documentation of each type, see:
 * - ./box-shipping-calculator/ (algorithm types)
 * - ./mongodb/box-shipping-calculator/ (database types)
 */
export type {
	// Database/MongoDB Types
	ShippingBox,
	ShippingItem,
	
	// Algorithm/Calculation Types  
	Point3D,
	PackedItem,
	PackingBox,
	BoxDimensions,
	BoxUtilizationMetrics,
	Shipment,
	MultiBoxPackingResult,
} from "./box-shipping-calculator";

// =============================================================================
// SHARED/COMMON TYPES
// =============================================================================

/**
 * Re-export shared types used across multiple modules.
 * These are common interfaces and types that don't belong to a specific calculator.
 */
export type { IRoute } from "./shared";
