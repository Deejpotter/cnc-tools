"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
	TableConfig,
	MaterialConfig,
	Results,
	DoorType,
	DoorPanelDimensions,
} from "../types";
import { ConfigPanel } from "./ConfigPanel";
import { ResultsPanel } from "./ResultsPanel";
import {
	calculateTableMaterials,
	calculateEnclosureMaterials,
	calculateMountingMaterials,
	calculateDoorMaterials,
	calculatePanelMaterials,
	CONSTANTS,
	Dimensions,
} from "../calcUtils";

// Import constants from calcUtils
const {
	DEFAULT_TABLE_HARDWARE,
	DEFAULT_ENCLOSURE_HARDWARE,
	EXTRA_HARDWARE_FOR_1_5M,
	TABLE_MOUNT_HARDWARE,
	DOOR_HARDWARE,
} = CONSTANTS;

interface TableCalculatorProps {
	materialTypes: Array<{
		id: string;
		name: string;
		defaultThickness: number;
	}>;
	materialThicknesses: number[];
}

export default function TableCalculator({
	materialTypes,
	materialThicknesses,
}: TableCalculatorProps) {
	const printRef = useRef<HTMLDivElement>(null);

	// State for table dimensions
	const [tableDimensions, setTableDimensions] = useState<Dimensions>({
		length: 1000,
		width: 1000,
		height: 800,
		isOutsideDimension: true,
	});

	// State for enclosure dimensions
	const [enclosureDimensions, setEnclosureDimensions] = useState<Dimensions>({
		length: 1000,
		width: 1000,
		height: 1000,
		isOutsideDimension: true,
	});
	// Material configuration for panels and doors
	const [materialConfig, setMaterialConfig] = useState<MaterialConfig>({
		type: "acrylic",
		thickness: 3, // mm
		includePanels: false,
		panelConfig: {
			top: false,
			bottom: false,
			left: false,
			right: false,
			back: false,
		},
	}); // Configuration options
	const [config, setConfig] = useState<TableConfig>({
		includeTable: true,
		includeEnclosure: false,
		mountEnclosureToTable: false,
		includeDoors: false,
		autoSizeEnclosure: true, // Default to auto-sizing enabled
		doorConfig: {
			frontDoor: false,
			backDoor: false,
			leftDoor: false,
			rightDoor: false,
			doorType: DoorType.STANDARD, // Default to standard door type
		},
	});

	// Calculation results
	const [results, setResults] = useState<Results>({});

	/**
	 * Updates enclosure dimensions based on table dimensions
	 * Maintains the height from the current enclosure settings
	 * Adds a margin around the table for the enclosure
	 */
	const updateEnclosureDimensionsFromTable = (tableDims: Dimensions) => {
		// Calculate enclosure dimensions based on table dimensions
		// For inside dimensions, use table dimensions directly
		// For outside dimensions, add 40mm margin all around (assuming 20mm extrusion width)
		let enclosureLength, enclosureWidth;

		if (tableDims.isOutsideDimension) {
			// If table uses outside dimensions, enclosure should surround the table with margin
			enclosureLength = tableDims.length + 80; // 40mm margin on each side
			enclosureWidth = tableDims.width + 80;
		} else {
			// If table uses inside dimensions, enclosure should be the inside plus extrusion width
			enclosureLength = tableDims.length + 40;
			enclosureWidth = tableDims.width + 40;
		}

		setEnclosureDimensions({
			...enclosureDimensions,
			length: enclosureLength,
			width: enclosureWidth,
			// Height and isOutsideDimension settings remain unchanged
		});
	};
	/**
	 * Calculate recommended enclosure dimensions based on table dimensions
	 * This will make the enclosure slightly larger than the table to allow proper fitting
	 * Used by the existing updateEnclosureDimensionsFromTable function
	 */
	const getRecommendedEnclosureSize = useCallback(
		(tableDim: Dimensions, enclosureHeight: number): Dimensions => {
			// Add margin around the table (100mm on each side)
			const margin = 100;

			// For a good fit, make the enclosure larger than the table
			return {
				length: tableDim.length + margin * 2,
				width: tableDim.width + margin * 2,
				height: enclosureHeight, // Use the specified height
				isOutsideDimension: true,
			};
		},
		[]
	);

	/**
	 * Handle table dimension changes
	 * Converts mm inputs to numeric values
	 * If auto-size is enabled, also updates enclosure dimensions
	 */
	const handleTableDimensionChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value, type, checked } = e.target;

		const newTableDimensions = {
			...tableDimensions,
			[name]: type === "checkbox" ? checked : parseFloat(value),
		};

		setTableDimensions(newTableDimensions);

		// If auto-size enclosure is enabled, update enclosure dimensions
		if (
			config.autoSizeEnclosure &&
			config.includeTable &&
			config.includeEnclosure
		) {
			updateEnclosureDimensionsFromTable(newTableDimensions);
		}
	};
	/**
	 * Handle enclosure dimension changes
	 * Converts mm inputs to numeric values
	 */
	const handleEnclosureDimensionChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value, type, checked } = e.target;

		setEnclosureDimensions({
			...enclosureDimensions,
			[name]: type === "checkbox" ? checked : parseFloat(value),
		});
	};

	/**
	 * Handle configuration changes
	 * Includes special handling for doorConfig which is a nested object
	 */
	const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;

		// Handle door configuration changes
		if (
			name === "frontDoor" ||
			name === "backDoor" ||
			name === "leftDoor" ||
			name === "rightDoor"
		) {
			setConfig({
				...config,
				doorConfig: {
					...config.doorConfig,
					[name]: checked,
				},
			});
		} else if (name === "autoSizeEnclosure") {
			// When auto-size is enabled, immediately update enclosure dimensions
			const newConfig = {
				...config,
				autoSizeEnclosure: checked,
			};
			setConfig(newConfig);
			// If auto-size is now enabled and we have a table and enclosure, update dimensions
			if (checked && config.includeTable && config.includeEnclosure) {
				updateEnclosureDimensionsFromTable(tableDimensions);
			}
		} else if (name === "includeTable" || name === "includeEnclosure") {
			// When table or enclosure options change
			const newConfig = {
				...config,
				[name]: checked,
			};

			setConfig(newConfig);
			// If including both table and enclosure and auto-size is enabled, update enclosure dimensions
			if (
				name === "includeEnclosure" &&
				checked &&
				config.includeTable &&
				config.autoSizeEnclosure
			) {
				updateEnclosureDimensionsFromTable(tableDimensions);
			}
		} else {
			// Update the config with the new value
			const newConfig = {
				...config,
				[name]: checked,
			};

			setConfig(newConfig);

			// If autoSizeEnclosure is toggled on and we have both components
			if (
				name === "autoSizeEnclosure" &&
				checked &&
				newConfig.includeTable &&
				newConfig.includeEnclosure
			) {
				// Update enclosure sizes based on table dimensions
				updateEnclosureDimensionsFromTable(tableDimensions);
			}

			// If enabling the enclosure and auto-size is on, set dimensions based on table
			if (
				name === "includeEnclosure" &&
				checked &&
				newConfig.autoSizeEnclosure &&
				newConfig.includeTable
			) {
				updateEnclosureDimensionsFromTable(tableDimensions);
			}
		}
	};

	/**
	 * Handle panel configuration changes
	 * Processes include/exclude panel toggle and panel configuration
	 */
	const handlePanelConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;

		if (name === "includePanels") {
			setMaterialConfig({
				...materialConfig,
				[name]: checked,
			});
		} else {
			setMaterialConfig({
				...materialConfig,
				panelConfig: {
					...materialConfig.panelConfig,
					[name]: checked,
				},
			});
		}
	};

	/**
	 * Handle material type change
	 */
	const handleMaterialTypeChange = (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		const selectedMaterial = materialTypes.find((m) => m.id === value);

		setMaterialConfig({
			...materialConfig,
			[name]: value,
			thickness: selectedMaterial?.defaultThickness || 3,
		});
	};

	/**
	 * Handle material thickness change
	 */
	const handleMaterialThicknessChange = (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		const { name, value } = e.target;

		setMaterialConfig({
			...materialConfig,
			[name]: parseInt(value),
		});
	};

	/**
	 * Handle door type changes
	 * Updates the door configuration when user selects a different door type
	 */
	const handleDoorTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { value } = e.target;

		setConfig({
			...config,
			doorConfig: {
				...config.doorConfig,
				doorType: value as DoorType,
			},
		});
	};

	/**
	 * Calculate the required materials based on dimensions and configuration
	 * This function sets the results state with the calculated materials
	 */
	const calculateMaterials = useCallback(() => {
		let calculatedResults: Results = {};

		// Calculate table materials if needed
		if (config.includeTable) {
			calculatedResults.table = calculateTableMaterials(tableDimensions);
		}

		// Calculate enclosure materials if needed
		if (config.includeEnclosure) {
			calculatedResults.enclosure =
				calculateEnclosureMaterials(enclosureDimensions);

			// Calculate door materials if doors are included
			if (
				config.includeDoors &&
				Object.values(config.doorConfig).some(Boolean)
			) {
				calculatedResults.doors = calculateDoorMaterials(
					enclosureDimensions,
					config.doorConfig
				);
			}

			// Calculate panel materials if panels are included
			if (
				materialConfig.includePanels &&
				Object.values(materialConfig.panelConfig).some(Boolean)
			) {
				calculatedResults.panels = calculatePanelMaterials(
					enclosureDimensions,
					materialConfig
				);
			}
		}

		// Add mounting hardware if both components are included and mounting is enabled
		if (
			config.includeTable &&
			config.includeEnclosure &&
			config.mountEnclosureToTable
		) {
			calculatedResults.mounting = calculateMountingMaterials();
		}

		setResults(calculatedResults);
	}, [tableDimensions, enclosureDimensions, config, materialConfig]);

	// Memoized material types lookup for optimization
	const materialTypesMap = React.useMemo(() => {
		return materialTypes.reduce((acc, material) => {
			acc[material.id] = material;
			return acc;
		}, {} as Record<string, (typeof materialTypes)[0]>);
	}, [materialTypes]);

	// Recalculate when inputs change or configuration changes
	useEffect(() => {
		calculateMaterials();
	}, [calculateMaterials]);

	/**
	 * Generates a shareable URL with the current configuration
	 */
	const generateShareableURL = () => {
		const params = new URLSearchParams();

		// Table dimensions
		if (config.includeTable) {
			params.set("tl", tableDimensions.length.toString());
			params.set("tw", tableDimensions.width.toString());
			params.set("th", tableDimensions.height.toString());
			params.set("tod", tableDimensions.isOutsideDimension ? "1" : "0");
		}

		// Enclosure dimensions
		if (config.includeEnclosure) {
			params.set("el", enclosureDimensions.length.toString());
			params.set("ew", enclosureDimensions.width.toString());
			params.set("eh", enclosureDimensions.height.toString());
			params.set("eod", enclosureDimensions.isOutsideDimension ? "1" : "0");
		}

		// Configuration options
		params.set("it", config.includeTable ? "1" : "0");
		params.set("ie", config.includeEnclosure ? "1" : "0");
		params.set("met", config.mountEnclosureToTable ? "1" : "0");
		params.set("id", config.includeDoors ? "1" : "0");
		// Door configuration
		if (config.includeDoors) {
			params.set("fd", config.doorConfig.frontDoor ? "1" : "0");
			params.set("bd", config.doorConfig.backDoor ? "1" : "0");
			params.set("ld", config.doorConfig.leftDoor ? "1" : "0");
			params.set("rd", config.doorConfig.rightDoor ? "1" : "0");
			params.set("dt", config.doorConfig.doorType.toString());
		}

		// Material configuration
		if (config.includeEnclosure) {
			params.set("ip", materialConfig.includePanels ? "1" : "0");

			if (materialConfig.includePanels) {
				params.set("mt", materialConfig.type);
				params.set("mth", materialConfig.thickness.toString());
				params.set("pt", materialConfig.panelConfig.top ? "1" : "0");
				params.set("pb", materialConfig.panelConfig.bottom ? "1" : "0");
				params.set("pl", materialConfig.panelConfig.left ? "1" : "0");
				params.set("pr", materialConfig.panelConfig.right ? "1" : "0");
				params.set("pbk", materialConfig.panelConfig.back ? "1" : "0");
			}
		}

		// Get the base URL
		const baseUrl = window.location.origin + window.location.pathname;
		const shareableUrl = `${baseUrl}?${params.toString()}`;

		return shareableUrl;
	};

	/**
	 * Copy the shareable URL to the clipboard
	 */
	const copyShareableURL = () => {
		const url = generateShareableURL();
		navigator.clipboard
			.writeText(url)
			.then(() => {
				alert("Shareable URL copied to clipboard!");
			})
			.catch((err) => {
				console.error("Failed to copy URL: ", err);
				alert("Failed to copy URL. Please try again.");
			});
	};

	/**
	 * Print the bill of materials
	 */
	const printBOM = () => {
		if (printRef.current) {
			const content = printRef.current;
			const printWindow = window.open("", "_blank");

			if (printWindow) {
				printWindow.document.write(`
					<!DOCTYPE html>
					<html>
					<head>
						<title>Table and Enclosure Bill of Materials</title>
						<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
						<style>
							body { padding: 20px; }
							.print-header { margin-bottom: 20px; }
							@media print {
								.no-print { display: none; }
							}
						</style>
					</head>
					<body>
						<div class="container">
							<div class="print-header">
								<h1>Table and Enclosure Bill of Materials</h1>
								<p>Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
							</div>
							${content.innerHTML}
							<div class="text-center mt-5 no-print">
								<button onclick="window.print()" class="btn btn-primary">Print</button>
								<button onclick="window.close()" class="btn btn-secondary ms-2">Close</button>
							</div>
						</div>
					</body>
					</html>
				`);
				printWindow.document.close();
			}
		}
	};
	/**
	 * Load configuration from URL parameters
	 */
	useEffect(() => {
		// Get searchParams as a snapshot to avoid the React Hook dependency warning
		const params = new URLSearchParams(window.location.search);
		if (params.size === 0) return;

		try {
			// Table configuration
			const includeTable = params.get("it") === "1";

			if (includeTable) {
				const tLength = params.get("tl");
				const tWidth = params.get("tw");
				const tHeight = params.get("th");
				const tOutsideDim = params.get("tod") === "1";

				if (tLength && tWidth && tHeight) {
					setTableDimensions({
						length: parseFloat(tLength),
						width: parseFloat(tWidth),
						height: parseFloat(tHeight),
						isOutsideDimension: tOutsideDim,
					});
				}
			} // Enclosure configuration
			const includeEnclosure = params.get("ie") === "1";

			if (includeEnclosure) {
				const eLength = params.get("el");
				const eWidth = params.get("ew");
				const eHeight = params.get("eh");
				const eOutsideDim = params.get("eod") === "1";

				if (eLength && eWidth && eHeight) {
					setEnclosureDimensions({
						length: parseFloat(eLength),
						width: parseFloat(eWidth),
						height: parseFloat(eHeight),
						isOutsideDimension: eOutsideDim,
					});
				}

				// Door configuration
				const includeDoors = params.get("id") === "1";

				if (includeDoors) {
					const frontDoor = params.get("fd") === "1";
					const backDoor = params.get("bd") === "1";
					const leftDoor = params.get("ld") === "1";
					const rightDoor = params.get("rd") === "1";
					const doorTypeParam = params.get("dt") || DoorType.STANDARD;

					setConfig((prev) => ({
						...prev,
						includeDoors,
						doorConfig: {
							frontDoor,
							backDoor,
							leftDoor,
							rightDoor,
							doorType: doorTypeParam as DoorType,
						},
					}));
				}

				// Panel configuration
				const includePanels = params.get("ip") === "1";
				if (includePanels) {
					const materialType = params.get("mt") || "acrylic";
					const materialThickness = params.get("mth")
						? parseInt(params.get("mth")!)
						: 3;
					const topPanel = params.get("pt") === "1";
					const bottomPanel = params.get("pb") === "1";
					const leftPanel = params.get("pl") === "1";
					const rightPanel = params.get("pr") === "1";
					const backPanel = params.get("pbk") === "1";

					setMaterialConfig({
						type: materialType,
						thickness: materialThickness,
						includePanels,
						panelConfig: {
							top: topPanel,
							bottom: bottomPanel,
							left: leftPanel,
							right: rightPanel,
							back: backPanel,
						},
					});
				}

				// Set overall config last
				const mountEnclosureToTable = params.get("met") === "1";

				setConfig((prev) => ({
					...prev,
					includeTable,
					includeEnclosure,
					mountEnclosureToTable,
				}));
			}
		} catch (error) {
			console.error("Error loading configuration from URL:", error);
			// Keep default config if error
		}
	}, []);

	return (
		<>
			{" "}
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
				handleMaterialThicknessChange={handleMaterialThicknessChange}
				handleDoorTypeChange={handleDoorTypeChange}
				MATERIAL_TYPES={materialTypes}
				MATERIAL_THICKNESSES={materialThicknesses}
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
		</>
	);
}
