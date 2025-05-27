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
import { DoorType, DoorTypeDisplayNames } from "../types";
import type {
	TableConfig,
	Results,
	Dimensions,
	MaterialConfig,
	DoorConfig,
} from "../types";

// Define MaterialType interface for this component
interface MaterialType {
	id: string;
	name: string;
	sku: string;
	// Optional fields
	description?: string;
	price?: number;
	unit?: string;
}
import { ConfigPanel } from "./ConfigPanel";
import { ResultsPanel } from "./ResultsPanel";
import { useSearchParams, useRouter } from "next/navigation";

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
	materialTypes: MaterialType[];
	materialThickness: number;
}

/**
 * The table calculator component.
 */
export default function TableCalculator({
	materialTypes,
	materialThickness,
}: TableCalculatorProps) {
	const printRef = useRef<HTMLDivElement>(null);

	// State for table dimensions
	const [tableDimensions, setTableDimensions] = useState<Dimensions>({
		length: 1000,
		width: 1000,
		height: 800,
	});

	// State for enclosure dimensions
	const [enclosureDimensions, setEnclosureDimensions] = useState<Dimensions>({
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
	}, {} as Record<string, MaterialType>);

	const getRecommendedEnclosureSize = useCallback(
		(
			tableDim: Omit<Dimensions, "isOutsideDimension">,
			enclosureHeight: number,
			isOutsideDim: boolean
		): Omit<Dimensions, "isOutsideDimension"> => {
			// Logic to calculate recommended size, potentially using isOutsideDim
			// For example, if tableDim is outside, enclosure might need to be slightly larger
			// If tableDim is inside, enclosure might match or be slightly larger depending on wall thickness assumptions
			const adjustment = isOutsideDim ? 20 : 0; // Example adjustment
			return {
				length: tableDim.length + adjustment,
				width: tableDim.width + adjustment,
				height: enclosureHeight,
			};
		},
		[]
	);

	/**
	 * Updates enclosure dimensions based on table dimensions if a table is included.
	 * Maintains the height from the current enclosure settings.
	 */
	const updateEnclosureDimensionsFromTable = useCallback(
		(
			tableDims: Omit<Dimensions, "isOutsideDimension">,
			currentEnclosureHeight: number,
			isOutsideDim: boolean
		) => {
			if (config.includeTable) {
				const recommended = getRecommendedEnclosureSize(
					tableDims,
					currentEnclosureHeight,
					isOutsideDim
				);
				setEnclosureDimensions(recommended);
			}
		},
		[config.includeTable, getRecommendedEnclosureSize] // Added isOutsideDim to dependency if it changes config
	);
	// Initialize hooks for routing and URL parameters
	const router = useRouter();
	const searchParams = useSearchParams();
	// Effect to load configuration from URL search parameters
	useEffect(() => {
		if (searchParams && searchParams.size > 0) {
			const newConfig: Partial<TableConfig> = {};
			const newTableDimensions: Partial<
				Omit<Dimensions, "isOutsideDimension">
			> = {};
			const newEnclosureDimensions: Partial<
				Omit<Dimensions, "isOutsideDimension">
			> = {};
			const newMaterialConfig: Partial<MaterialConfig> = {};

			if (searchParams.has("it"))
				newConfig.includeTable = searchParams.get("it") === "1";
			if (searchParams.has("ie"))
				newConfig.includeEnclosure = searchParams.get("ie") === "1";
			if (searchParams.has("iod"))
				newConfig.isOutsideDimension = searchParams.get("iod") !== "0"; // Updated for central config
			if (searchParams.has("me"))
				newConfig.mountEnclosureToTable = searchParams.get("me") === "1";
			if (searchParams.has("id"))
				newConfig.includeDoors = searchParams.get("id") === "1";

			const doorConfigUpdate: Partial<DoorConfig> = {};
			if (searchParams.has("dcf"))
				doorConfigUpdate.frontDoor = searchParams.get("dcf") === "1";
			if (searchParams.has("dcb"))
				doorConfigUpdate.backDoor = searchParams.get("dcb") === "1";
			if (searchParams.has("dcl"))
				doorConfigUpdate.leftDoor = searchParams.get("dcl") === "1";
			if (searchParams.has("dcr"))
				doorConfigUpdate.rightDoor = searchParams.get("dcr") === "1";
			if (searchParams.has("dct"))
				doorConfigUpdate.doorType = searchParams.get("dct") as DoorType;
			if (Object.keys(doorConfigUpdate).length > 0) {
				newConfig.doorConfig = { ...config.doorConfig, ...doorConfigUpdate };
			}

			if (searchParams.has("tl"))
				newTableDimensions.length = parseInt(searchParams.get("tl") || "0");
			if (searchParams.has("tw"))
				newTableDimensions.width = parseInt(searchParams.get("tw") || "0");
			if (searchParams.has("th"))
				newTableDimensions.height = parseInt(searchParams.get("th") || "0");

			if (searchParams.has("el"))
				newEnclosureDimensions.length = parseInt(searchParams.get("el") || "0");
			if (searchParams.has("ew"))
				newEnclosureDimensions.width = parseInt(searchParams.get("ew") || "0");
			if (searchParams.has("eh"))
				newEnclosureDimensions.height = parseInt(searchParams.get("eh") || "0");

			if (searchParams.has("mt"))
				newMaterialConfig.type = searchParams.get("mt") || materialTypes[0].id;
			// Thickness is now fixed, so no need to load it from URL params. It's set from props.
			// if (searchParams.has("mth")) newMaterialConfig.thickness = parseInt(searchParams.get("mth") || "0");
			if (searchParams.has("mip"))
				newMaterialConfig.includePanels = searchParams.get("mip") === "1";

			const panelConfigUpdate: Partial<MaterialConfig["panelConfig"]> = {};
			if (searchParams.has("pc_t"))
				panelConfigUpdate.top = searchParams.get("pc_t") === "1";
			if (searchParams.has("pc_b"))
				panelConfigUpdate.bottom = searchParams.get("pc_b") === "1";
			if (searchParams.has("pc_l"))
				panelConfigUpdate.left = searchParams.get("pc_l") === "1";
			if (searchParams.has("pc_r"))
				panelConfigUpdate.right = searchParams.get("pc_r") === "1";
			if (searchParams.has("pc_bk"))
				panelConfigUpdate.back = searchParams.get("pc_bk") === "1";
			if (searchParams.has("pc_f"))
				panelConfigUpdate.front = searchParams.get("pc_f") === "1";
			if (Object.keys(panelConfigUpdate).length > 0) {
				newMaterialConfig.panelConfig = {
					...materialConfig.panelConfig,
					...panelConfigUpdate,
				};
			}

			setConfig((prev) => ({ ...prev, ...newConfig }));
			setTableDimensions((prev) => ({ ...prev, ...newTableDimensions }));
			setEnclosureDimensions((prev) => ({
				...prev,
				...newEnclosureDimensions,
			}));
			setMaterialConfig((prev) => ({
				...prev,
				...newMaterialConfig,
				thickness: materialThickness,
			})); // Ensure fixed thickness

			// Auto-adjust enclosure if table is included and dimensions were loaded
			if (
				newConfig.includeTable &&
				(newTableDimensions.length || newTableDimensions.width)
			) {
				const currentEnclosureHeight =
					newEnclosureDimensions.height || enclosureDimensions.height;
				const currentIsOutside =
					newConfig.isOutsideDimension !== undefined
						? newConfig.isOutsideDimension
						: config.isOutsideDimension;
				updateEnclosureDimensionsFromTable(
					{
						length: newTableDimensions.length || tableDimensions.length,
						width: newTableDimensions.width || tableDimensions.width,
						height: newTableDimensions.height || tableDimensions.height, // table height is not directly used for enclosure L/W
					},
					currentEnclosureHeight,
					currentIsOutside
				);
			}
		}
	}, [
		materialTypes,
		materialThickness,
		updateEnclosureDimensionsFromTable,
		searchParams,
		config.doorConfig,
		config.isOutsideDimension,
		enclosureDimensions.height,
		materialConfig.panelConfig,
		tableDimensions.height,
		tableDimensions.length,
		tableDimensions.width,
	]);

	// Effect to update URL when config or dimensions change
	useEffect(() => {
		const params = new URLSearchParams();
		params.set("it", config.includeTable ? "1" : "0");
		params.set("ie", config.includeEnclosure ? "1" : "0");
		params.set("iod", config.isOutsideDimension ? "1" : "0"); // Save centralized value
		params.set("me", config.mountEnclosureToTable ? "1" : "0");
		params.set("id", config.includeDoors ? "1" : "0");

		params.set("dcf", config.doorConfig.frontDoor ? "1" : "0");
		params.set("dcb", config.doorConfig.backDoor ? "1" : "0");
		params.set("dcl", config.doorConfig.leftDoor ? "1" : "0");
		params.set("dcr", config.doorConfig.rightDoor ? "1" : "0");
		params.set("dct", config.doorConfig.doorType);

		params.set("tl", tableDimensions.length.toString());
		params.set("tw", tableDimensions.width.toString());
		params.set("th", tableDimensions.height.toString());

		params.set("el", enclosureDimensions.length.toString());
		params.set("ew", enclosureDimensions.width.toString());
		params.set("eh", enclosureDimensions.height.toString());

		params.set("mt", materialConfig.type);
		// Thickness is fixed, no longer part of URL params for material config
		// params.set("mth", materialConfig.thickness.toString());
		params.set("mip", materialConfig.includePanels ? "1" : "0");

		if (materialConfig.includePanels) {
			params.set("pc_t", materialConfig.panelConfig.top ? "1" : "0");
			params.set("pc_b", materialConfig.panelConfig.bottom ? "1" : "0");
			params.set("pc_l", materialConfig.panelConfig.left ? "1" : "0");
			params.set("pc_r", materialConfig.panelConfig.right ? "1" : "0");
			params.set("pc_bk", materialConfig.panelConfig.back ? "1" : "0");
			if (materialConfig.panelConfig.front !== undefined) {
				params.set("pc_f", materialConfig.panelConfig.front ? "1" : "0");
			}
		}

		// Update URL without page reload
		window.history.pushState(null, "", `?${params.toString()}`);
	}, [config, tableDimensions, enclosureDimensions, materialConfig]);

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

	const copyShareableURL = () => {
		const params = new URLSearchParams();
		params.append("tl", tableDimensions.length.toString());
		params.append("tw", tableDimensions.width.toString());
		params.append("th", tableDimensions.height.toString());
		params.append("el", enclosureDimensions.length.toString());
		params.append("ew", enclosureDimensions.width.toString());
		params.append("eh", enclosureDimensions.height.toString());
		params.append("it", config.includeTable ? "1" : "0");
		params.append("ie", config.includeEnclosure ? "1" : "0");
		params.append("met", config.mountEnclosureToTable ? "1" : "0");
		params.append("id", config.includeDoors ? "1" : "0");
		params.append("iod", config.isOutsideDimension ? "1" : "0");
		params.append("dcf", config.doorConfig.frontDoor ? "1" : "0");
		params.append("dcb", config.doorConfig.backDoor ? "1" : "0");
		params.append("dcl", config.doorConfig.leftDoor ? "1" : "0");
		params.append("dcr", config.doorConfig.rightDoor ? "1" : "0");
		params.append("dct", config.doorConfig.doorType);
		params.append("mct", materialConfig.type);
		params.append("mip", materialConfig.includePanels ? "1" : "0");
		params.append("pcpT", materialConfig.panelConfig.top ? "1" : "0");
		params.append("pcpB", materialConfig.panelConfig.bottom ? "1" : "0");
		params.append("pcpL", materialConfig.panelConfig.left ? "1" : "0");
		params.append("pcpR", materialConfig.panelConfig.right ? "1" : "0");
		params.append("pcpK", materialConfig.panelConfig.back ? "1" : "0");
		params.append("pcpF", materialConfig.panelConfig.front ? "1" : "0");

		const shareUrl = `${window.location.pathname}?${params.toString()}`;
		navigator.clipboard
			.writeText(window.location.origin + shareUrl)
			.then(() => alert("Shareable URL copied to clipboard!"))
			.catch((err) => console.error("Failed to copy URL: ", err));
		router.push(shareUrl, { scroll: false });
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
	 */
	const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked, type, value } = e.target;

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
			setConfig((prev) => ({
				...prev,
				[name]: type === "checkbox" ? checked : value,
			}));
		}

		// Special handling for enclosure dimension adjustments when toggling table/enclosure inclusion
		if (name === "includeTable" || name === "includeEnclosure") {
			if (name === "includeTable" && checked && config.includeEnclosure) {
				// If enabling table and enclosure exists, update enclosure dimensions
				updateEnclosureDimensionsFromTable(
					tableDimensions,
					enclosureDimensions.height,
					config.isOutsideDimension
				);
			}
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
			/>{" "}
			<ResultsPanel
				results={results}
				config={config}
				materialConfig={materialConfig}
				tableDimensions={tableDimensions}
				enclosureDimensions={enclosureDimensions}
				materialTypesMap={materialTypesMap}
			/>
		</div>
	);
}
