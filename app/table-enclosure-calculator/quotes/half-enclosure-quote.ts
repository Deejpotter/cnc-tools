/**
 * Half Enclosure Quote Calculator
 * Updated: 15/05/2025
 * Author: Deej Potter
 * Description: Helper functions for generating quotes for tables with half enclosures.
 *
 * This module contains functions for calculating materials for a specific type of quote:
 * Tables with half enclosures around the perimeter.
 */

import {
	calculateTableMaterials,
	calculateEnclosureMaterials,
	calculateMountingMaterials,
	calculatePanelMaterials,
	Dimensions,
} from "../calcUtils";

interface HalfEnclosureConfig {
	workingAreaLength: number;
	workingAreaWidth: number;
	tableHeight: number;
	enclosureHeight: number;
	panelMaterial: string;
	panelThickness: number;
	includeCasterWheels: boolean;
}

interface QuoteResult {
	tableMaterials: ReturnType<typeof calculateTableMaterials>;
	enclosureMaterials: ReturnType<typeof calculateEnclosureMaterials>;
	mountingMaterials: ReturnType<typeof calculateMountingMaterials>;
	panelMaterials: ReturnType<typeof calculatePanelMaterials>;
	url: string;
}

/**
 * Calculate materials for a table with half enclosure
 *
 * @param config Configuration for the table and half enclosure
 * @returns Materials required for the quote
 */
export function calculateHalfEnclosureQuote(
	config: HalfEnclosureConfig
): QuoteResult {
	// Table dimensions (inside dimensions = working area)
	const tableDimensions: Dimensions = {
		length: config.workingAreaLength,
		width: config.workingAreaWidth,
		height: config.tableHeight,
		isOutsideDimension: false, // These are inside dimensions (working area)
	};

	// Calculate the enclosure dimensions based on table dimensions
	// The enclosure should be the working area + 40mm for the table extrusions
	const enclosureDimensions: Dimensions = {
		length: config.workingAreaLength + 40,
		width: config.workingAreaWidth + 40,
		height: config.enclosureHeight,
		isOutsideDimension: false, // These are inside dimensions
	};

	// Panel configuration for half enclosure (no top or bottom)
	const panelConfig = {
		type: config.panelMaterial,
		thickness: config.panelThickness,
		panelConfig: {
			top: false,
			bottom: false,
			left: true,
			right: true,
			back: true,
		},
	};

	// Calculate materials
	const tableMaterials = calculateTableMaterials(tableDimensions);
	const enclosureMaterials = calculateEnclosureMaterials(enclosureDimensions);
	const mountingMaterials = calculateMountingMaterials();
	const panelMaterials = calculatePanelMaterials(
		enclosureDimensions,
		panelConfig
	);

	// Generate URL for configuration
	const url = generateConfigUrl({
		tableIncluded: true,
		enclosureIncluded: true,
		tableLength: config.workingAreaLength,
		tableWidth: config.workingAreaWidth,
		tableHeight: config.tableHeight,
		tableOutsideDimensions: false,
		enclosureLength: config.workingAreaLength + 40,
		enclosureWidth: config.workingAreaWidth + 40,
		enclosureHeight: config.enclosureHeight,
		enclosureOutsideDimensions: false,
		mountEnclosureToTable: true,
		includePanels: true,
		panelType: config.panelMaterial,
		panelThickness: config.panelThickness,
		includePanelTop: false,
		includePanelBottom: false,
		includePanelLeft: true,
		includePanelRight: true,
		includePanelBack: true,
	});

	return {
		tableMaterials,
		enclosureMaterials,
		mountingMaterials,
		panelMaterials,
		url,
	};
}

/**
 * Generate a shareable URL for the table enclosure configuration
 */
function generateConfigUrl(params: Record<string, any>): string {
	const baseUrl = "/table-enclosure-calculator";
	const searchParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		// Skip undefined values
		if (value !== undefined) {
			// Convert boolean to string
			if (typeof value === "boolean") {
				searchParams.append(key, value ? "true" : "false");
			} else {
				searchParams.append(key, String(value));
			}
		}
	});

	return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * Generate a quote for the specific customer requirements:
 * 1200×1200 working area with 950mm total height (200mm half enclosure),
 * corflute panels, and M8 caster wheels
 */
export function generateSpecificCustomerQuote(): QuoteResult {
	return calculateHalfEnclosureQuote({
		workingAreaLength: 1200,
		workingAreaWidth: 1200,
		tableHeight: 750, // 950mm total - 200mm enclosure
		enclosureHeight: 200,
		panelMaterial: "corflute",
		panelThickness: 5,
		includeCasterWheels: true,
	});
}
