/**
 * Table calculator component
 * Updated: 17/05/2025
 * Author: Daniel Potter
 * Description: The TableCalculator component is responsible for rendering
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
	calculateTableMaterials,
	calculateEnclosureMaterials,
	calculateMountingMaterials,
	calculateDoorMaterials,
	calculatePanelMaterials,
	CONSTANTS,
} from "../calcUtils";
import type {
	Dimensions,
	DoorConfig,
	TableConfig,
	MaterialConfig,
	Results,
} from "../../../types/box-shipping-calculator/box-shipping-types";
import { DoorType } from "../../../types/box-shipping-calculator/box-shipping-types";
import { ConfigPanel } from "./ConfigPanel";
import { ResultsPanel } from "./ResultsPanel";

// Import constants from calcUtils
const {
	DEFAULT_TABLE_HARDWARE,
	DEFAULT_ENCLOSURE_HARDWARE,
	EXTRA_HARDWARE_FOR_1_5M,
	TABLE_MOUNT_HARDWARE,
	DOOR_HARDWARE,
} = CONSTANTS;

/**
 * TableCalculator component
 * This component handles the table and enclosure calculator logic,
 * including state management, calculations, and rendering.
 *
 * @param {Array} materialTypes - Array of material types for selection
 * @param {number} materialThickness - Fixed material thickness for calculations
 */
interface TableCalculatorProps {
	materialTypes: Array<{
		id: string;
		name: string;
	}>;
	materialThickness: number;
}

/**
 * The table calculator component.
 * @param param0 - Props for the TableCalculator component
 * @param materialTypes - Array of material types for selection
 */
export default function TableCalculator({
	materialTypes,
	materialThickness,
}: TableCalculatorProps) {
	const printRef = useRef<HTMLDivElement>(null);

	// State for table dimensions
	const [tableDimensions, setTableDimensions] = useState<
		Omit<Dimensions, "isOutsideDimension">
	>({
		length: 1000,
		width: 1000,
		height: 800,
	});

	// State for enclosure dimensions
	const [enclosureDimensions, setEnclosureDimensions] = useState<
		Omit<Dimensions, "isOutsideDimension">
	>({
		length: 1000,
		width: 1000,
		height: 1000,
	});
	// Material configuration for panels and doors
	const [materialConfig, setMaterialConfig] = useState<MaterialConfig>({
		type: materialTypes[0].id,
		thickness: materialThickness,
		includePanels: false,
		panelConfig: {
			top: false,
			bottom: false,
			left: false,
			right: false,
			back: false,
			front: false, // ensure front is part of the initial state
		},
	});

	const [config, setConfig] = useState<TableConfig>({
		includeTable: true,
		includeEnclosure: false,
		mountEnclosureToTable: false,
		includeDoors: false,
		isOutsideDimension: true, // Centralized control for dimension type
		doorConfig: {
			frontDoor: false,
			backDoor: false,
			leftDoor: false,
			rightDoor: false,
			doorType: DoorType.STANDARD,
		},
	});

	// Calculation results
	const [results, setResults] = useState<Results>({});

	const materialTypesMap = materialTypes.reduce((acc, curr) => {
		acc[curr.id] = curr;
		return acc;
	}, {} as Record<string, any>);
	const getRecommendedEnclosureSize = useCallback(
		(
			tableDim: Omit<Dimensions, "isOutsideDimension">,
			enclosureHeight: number,
			isOutsideDim: boolean
		): Omit<Dimensions, "isOutsideDimension"> => {
			/**
			 * Logic to calculate recommended enclosure size based on table dimensions
			 * The length and width of the enclosure should be slightly larger than the table
			 * When isOutsideDim is true (outside dimensions), we add a 20mm margin around the table
			 * This provides a clean alignment with the table's outside edge while ensuring proper fit
			 */
			const adjustment = isOutsideDim ? 20 : 0; // Adjustment for length/width based on dimension type

			/**
			 * Height adjustment for enclosure when mounted on a table
			 * For a 200mm enclosure height mounted on a 700mm table, the total height would be 900mm
			 * However, with 20mm horizontal rails at top and bottom (40mm total), this would add to 940mm
			 * By subtracting 40mm from the user-specified enclosure height, we get rails of 160mm length
			 * When the 40mm horizontal rail height is added, the final enclosure height becomes 200mm as specified
			 */
			const adjustedHeight = enclosureHeight - 40; // Subtract 40mm for horizontal rails (20mm top + 20mm bottom)

			return {
				length: tableDim.length + adjustment,
				width: tableDim.width + adjustment,
				height: adjustedHeight > 0 ? adjustedHeight : enclosureHeight, // Safety check to avoid negative height
			};
		},
		[]
	);

	/**
	 * Updates enclosure dimensions based on table dimensions if a table is included.
	 * Maintains the height from the current enclosure settings.
	 */ const updateEnclosureDimensionsFromTable = useCallback(
		(
			tableDims: Omit<Dimensions, "isOutsideDimension">,
			currentEnclosureHeight: number,
			isOutsideDim: boolean
		) => {
			// Only update if we're actually including a table
			// This check is now done with the parameter, not the state
			const recommended = getRecommendedEnclosureSize(
				tableDims,
				currentEnclosureHeight,
				isOutsideDim
			);
			setEnclosureDimensions(recommended);
		},
		[getRecommendedEnclosureSize]
	);

	/**
	 * Handle table dimension changes
	 * Converts mm inputs to numeric values
	 * If a table and enclosure are included, also updates enclosure dimensions
	 */
	const handleTableDimensionChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value, type, checked } = e.target;
		const val = type === "checkbox" ? checked : parseInt(value) || 0;

		setTableDimensions((prev) => {
			const newDims = { ...prev, [name]: val };
			// If table and enclosure are included, update enclosure dimensions
			if (config.includeTable && config.includeEnclosure) {
				updateEnclosureDimensionsFromTable(
					newDims,
					enclosureDimensions.height,
					config.isOutsideDimension
				);
			}
			return newDims;
		});
	};

	/**
	 * Handle enclosure dimension changes
	 * Converts mm inputs to numeric values
	 * This is primarily for height, as L/W are auto-adjusted if a table is present.
	 */
	const handleEnclosureDimensionChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value, type, checked } = e.target;
		const val = type === "checkbox" ? checked : parseInt(value) || 0;

		setEnclosureDimensions((prev) => ({ ...prev, [name]: val }));
		// If table is not included, L/W changes are manual. If table IS included, L/W are derived.
		// Height is always manual for enclosure.
	};

	/**
	 * Handle material type change
	 */
	const handleMaterialTypeChange = (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		setMaterialConfig((prev) => ({
			...prev,
			type: e.target.value,
		}));
	};

	// Removed handleMaterialThicknessChange as thickness is fixed

	/**
	 * Handle panel configuration changes (e.g., which panels to include)
	 */
	const handlePanelConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;
		setMaterialConfig((prevConfig) => ({
			...prevConfig,
			panelConfig: {
				...prevConfig.panelConfig,
				[name]: checked,
			},
		}));
	};

	const handleDoorTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { value } = e.target;
		setConfig((prevConfig) => ({
			...prevConfig,
			doorConfig: {
				...prevConfig.doorConfig,
				doorType: value as DoorType,
			},
		}));
	};
	/**
	 * This function would enable sharing configurations via URL
	 * Currently disabled to simplify the code
	 */
	const copyShareableURL = () => {
		alert(
			"Sharing functionality has been simplified in this version.\nYou can print your configuration instead."
		);
	};

	const printBOM = () => {
		const printContents = printRef.current?.innerHTML;
		const originalContents = document.body.innerHTML;
		if (printContents) {
			document.body.innerHTML = printContents;
			window.print();
			document.body.innerHTML = originalContents;
			window.location.reload();
		}
	};
	// Removed duplicated useEffect for handling searchParams
	// We already have the parameters loading in the first useEffect
	useEffect(() => {
		// Calculate all results based on current dimensions and config
		const tableResults = config.includeTable
			? calculateTableMaterials(tableDimensions, config.isOutsideDimension)
			: undefined;

		const enclosureResults = config.includeEnclosure
			? calculateEnclosureMaterials(
					enclosureDimensions,
					config.isOutsideDimension
			  )
			: undefined;

		const mountingResults =
			config.includeTable &&
			config.includeEnclosure &&
			config.mountEnclosureToTable
				? calculateMountingMaterials()
				: undefined;
		const doorResults =
			config.includeEnclosure && config.includeDoors
				? calculateDoorMaterials(
						enclosureDimensions,
						config.isOutsideDimension,
						config.doorConfig
				  )
				: undefined;

		const panelResults =
			config.includeEnclosure && materialConfig.includePanels
				? calculatePanelMaterials(
						enclosureDimensions,
						config.isOutsideDimension,
						materialConfig
				  )
				: undefined;

		setResults({
			table: tableResults,
			enclosure: enclosureResults,
			mounting: mountingResults,
			doors: doorResults,
			panels: panelResults,
		});
	}, [config, tableDimensions, enclosureDimensions, materialConfig]);
	/**
	 * Handle general configuration changes for table and enclosure options
	 */ const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked, type, value } = e.target;

		// First update the state without any additional effects
		if (name.includes(".")) {
			// Handle nested properties like doorConfig.frontDoor
			const [parent, child] = name.split(".");

			// Type-safe handling for doorConfig
			if (parent === "doorConfig") {
				setConfig((prev) => ({
					...prev,
					doorConfig: {
						...prev.doorConfig,
						[child]: type === "checkbox" ? checked : value,
					},
				}));
			}
			// Add other nested config objects if needed
		} else {
			// Handle top-level properties
			setConfig((prev) => {
				const newConfig = {
					...prev,
					[name]: type === "checkbox" ? checked : value,
				};

				// Special handling for enclosure dimension adjustments when toggling table/enclosure inclusion
				// Do this after the state update to avoid infinite loops
				if (
					(name === "includeTable" && checked && prev.includeEnclosure) ||
					(name === "includeEnclosure" && checked && prev.includeTable)
				) {
					// Use setTimeout to ensure this runs after the state update is complete
					setTimeout(() => {
						updateEnclosureDimensionsFromTable(
							tableDimensions,
							enclosureDimensions.height,
							prev.isOutsideDimension
						);
					}, 0);
				}

				return newConfig;
			});
		}
	};

	return (
		<div className="container mt-0">
			<ConfigPanel
				config={config}
				tableDimensions={tableDimensions}
				enclosureDimensions={enclosureDimensions}
				materialConfig={materialConfig}
				handleConfigChange={handleConfigChange}
				handleTableDimensionChange={handleTableDimensionChange}
				handleEnclosureDimensionChange={handleEnclosureDimensionChange}
				handlePanelConfigChange={handlePanelConfigChange}
				handleMaterialTypeChange={handleMaterialTypeChange}
				// handleMaterialThicknessChange removed
				handleDoorTypeChange={handleDoorTypeChange}
				MATERIAL_TYPES={materialTypes}
				MATERIAL_THICKNESS={materialThickness} // Changed from MATERIAL_THICKNESSES
			/>
			<ResultsPanel
				results={results}
				config={config}
				materialConfig={materialConfig}
				tableDimensions={tableDimensions}
				enclosureDimensions={enclosureDimensions}
				copyShareableURL={copyShareableURL}
				printBOM={printBOM}
				materialTypesMap={materialTypesMap}
			/>
		</div>
	);
}
