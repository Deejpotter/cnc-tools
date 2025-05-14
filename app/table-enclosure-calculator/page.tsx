"use client";
/**
 * Table and Enclosure Calculator
 * Updated: 14/05/2025
 * Author: Deej Potter
 * Description: Provides a calculator for determining extrusion lengths and hardware
 * needed for building machine tables and enclosures of various sizes.
 *
 * This component allows users to:
 * - Specify inside/outside dimensions for tables and enclosures
 * - Calculate required materials including hardware
 * - Support for mounting enclosures to tables
 * - Handles special cases like 1.5m sides requiring 2040 instead of 2020
 */

import LayoutContainer from "@/components/LayoutContainer";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	calculateTableMaterials,
	calculateEnclosureMaterials,
	calculateMountingMaterials,
	calculateDoorMaterials,
	calculatePanelMaterials,
	CONSTANTS,
} from "./calcUtils";

// Import constants from calcUtils
const {
	DEFAULT_TABLE_HARDWARE,
	DEFAULT_ENCLOSURE_HARDWARE,
	EXTRA_HARDWARE_FOR_1_5M,
	TABLE_MOUNT_HARDWARE,
	DOOR_HARDWARE,
} = CONSTANTS;

// Material types and their properties
const MATERIAL_TYPES = [
	{ id: "acrylic", name: "Acrylic", defaultThickness: 3 },
	{ id: "aluminum", name: "Aluminum", defaultThickness: 2 },
	{ id: "polycarbonate", name: "Polycarbonate", defaultThickness: 4 },
	{ id: "dibond", name: "Dibond", defaultThickness: 3 },
];

// Standard material thicknesses in mm
const MATERIAL_THICKNESSES = [2, 3, 4, 5, 6, 8, 10, 12];

export default function TableEnclosureCalculator() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const printRef = useRef<HTMLDivElement>(null);

	// Link to examples section for quick access to common quote configurations

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
	const [materialConfig, setMaterialConfig] = useState({
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
	});

	// Configuration options
	const [config, setConfig] = useState({
		includeTable: true,
		includeEnclosure: false,
		mountEnclosureToTable: false,
		includeDoors: false,
		doorConfig: {
			frontDoor: false,
			backDoor: false,
			leftDoor: false,
			rightDoor: false,
		},
	});

	// Calculation results
	const [results, setResults] = useState<Results>({});

	/**
	 * Handle table dimension changes
	 * Converts mm inputs to numeric values
	 */
	const handleTableDimensionChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value, type, checked } = e.target;

		setTableDimensions({
			...tableDimensions,
			[name]: type === "checkbox" ? checked : parseFloat(value),
		});
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
	 * Handle configuration changes for component inclusion and mounting
	 */
	const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;

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
		} else {
			setConfig({
				...config,
				[name]: checked,
			});
		}
	};
	/**
	 * Handle material type and thickness changes
	 */
	const handleMaterialTypeChange = (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setMaterialConfig({
			...materialConfig,
			[name]: value,
		});
	};

	/**
	 * Handle material thickness changes
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
	 * Handle panel configuration changes
	 */
	const handlePanelConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;

		if (name === "includePanels") {
			setMaterialConfig({
				...materialConfig,
				includePanels: checked,
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
	}, [tableDimensions, enclosureDimensions, config, materialConfig]); // Memoized material types lookup for optimization
	const materialTypesMap = React.useMemo(() => {
		return MATERIAL_TYPES.reduce((acc, material) => {
			acc[material.id] = material;
			return acc;
		}, {} as Record<string, (typeof MATERIAL_TYPES)[0]>);
	}, []);

	// Recalculate when inputs change or configuration changes
	useEffect(() => {
		calculateMaterials();
	}, [calculateMaterials]);
	// The calculation functions are now imported from calcUtils.ts

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
		if (!searchParams || searchParams.size === 0) return;

		try {
			// Table configuration
			const includeTable = searchParams.get("it") === "1";

			if (includeTable) {
				const tLength = searchParams.get("tl");
				const tWidth = searchParams.get("tw");
				const tHeight = searchParams.get("th");
				const tOutsideDim = searchParams.get("tod") === "1";

				if (tLength && tWidth && tHeight) {
					setTableDimensions({
						length: parseFloat(tLength),
						width: parseFloat(tWidth),
						height: parseFloat(tHeight),
						isOutsideDimension: tOutsideDim,
					});
				}
			}

			// Enclosure configuration
			const includeEnclosure = searchParams.get("ie") === "1";

			if (includeEnclosure) {
				const eLength = searchParams.get("el");
				const eWidth = searchParams.get("ew");
				const eHeight = searchParams.get("eh");
				const eOutsideDim = searchParams.get("eod") === "1";

				if (eLength && eWidth && eHeight) {
					setEnclosureDimensions({
						length: parseFloat(eLength),
						width: parseFloat(eWidth),
						height: parseFloat(eHeight),
						isOutsideDimension: eOutsideDim,
					});
				}

				// Door configuration
				const includeDoors = searchParams.get("id") === "1";

				if (includeDoors) {
					const frontDoor = searchParams.get("fd") === "1";
					const backDoor = searchParams.get("bd") === "1";
					const leftDoor = searchParams.get("ld") === "1";
					const rightDoor = searchParams.get("rd") === "1";

					setConfig((prev) => ({
						...prev,
						includeDoors,
						doorConfig: {
							frontDoor,
							backDoor,
							leftDoor,
							rightDoor,
						},
					}));
				}

				// Panel configuration
				const includePanels = searchParams.get("ip") === "1";

				if (includePanels) {
					const materialType = searchParams.get("mt") || "acrylic";
					const materialThickness = searchParams.get("mth")
						? parseInt(searchParams.get("mth")!)
						: 3;
					const topPanel = searchParams.get("pt") === "1";
					const bottomPanel = searchParams.get("pb") === "1";
					const leftPanel = searchParams.get("pl") === "1";
					const rightPanel = searchParams.get("pr") === "1";
					const backPanel = searchParams.get("pbk") === "1";

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
				const mountEnclosureToTable = searchParams.get("met") === "1";

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
	}, [searchParams]);
	return (
		<LayoutContainer>
			<div className="table-enclosure-calculator">
				<h1 className="mb-4">Table and Enclosure Calculator</h1>
				{/* Quick Access to Common Quote Configurations */}
				<div className="card mb-4">
					<div className="card-header bg-info text-white">
						<h2 className="h5 mb-0">Quick Examples</h2>
					</div>
					<div className="card-body">
						<div className="row">
							<div className="col-md-12">
								<p>
									Need a quick quote for one of these common configurations?
								</p>
								<div className="d-grid gap-2 d-md-flex">
									<a
										href="/table-enclosure-calculator/examples/half-enclosure-quote-example"
										className="btn btn-outline-primary"
									>
										1200×1200 Table with 200mm Half Enclosure
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
				{/* Configuration Options */}
				<div className="card mb-4">
					<div className="card-header">
						<h2 className="h5 mb-0">Configuration</h2>
					</div>
					<div className="card-body">
						<div className="row g-3">
							<div className="col-md-4">
								<div className="form-check">
									<input
										type="checkbox"
										className="form-check-input"
										id="includeTable"
										name="includeTable"
										checked={config.includeTable}
										onChange={handleConfigChange}
									/>
									<label className="form-check-label" htmlFor="includeTable">
										Include Machine Table
									</label>
								</div>
							</div>

							<div className="col-md-4">
								<div className="form-check">
									<input
										type="checkbox"
										className="form-check-input"
										id="includeEnclosure"
										name="includeEnclosure"
										checked={config.includeEnclosure}
										onChange={handleConfigChange}
									/>
									<label
										className="form-check-label"
										htmlFor="includeEnclosure"
									>
										Include Enclosure
									</label>
								</div>
							</div>

							{config.includeTable && config.includeEnclosure && (
								<div className="col-md-4">
									<div className="form-check">
										<input
											type="checkbox"
											className="form-check-input"
											id="mountEnclosureToTable"
											name="mountEnclosureToTable"
											checked={config.mountEnclosureToTable}
											onChange={handleConfigChange}
										/>
										<label
											className="form-check-label"
											htmlFor="mountEnclosureToTable"
										>
											Mount Enclosure to Table
										</label>
									</div>
								</div>
							)}

							{config.includeEnclosure && (
								<div className="col-md-4">
									<div className="form-check">
										<input
											type="checkbox"
											className="form-check-input"
											id="includeDoors"
											name="includeDoors"
											checked={config.includeDoors}
											onChange={handleConfigChange}
										/>
										<label className="form-check-label" htmlFor="includeDoors">
											Include Doors
										</label>
									</div>
								</div>
							)}

							{config.includeEnclosure && config.includeDoors && (
								<>
									<div className="col-md-3">
										<div className="form-check">
											<input
												type="checkbox"
												className="form-check-input"
												id="frontDoor"
												name="frontDoor"
												checked={config.doorConfig.frontDoor}
												onChange={handleConfigChange}
											/>
											<label className="form-check-label" htmlFor="frontDoor">
												Front Door
											</label>
										</div>
									</div>

									<div className="col-md-3">
										<div className="form-check">
											<input
												type="checkbox"
												className="form-check-input"
												id="backDoor"
												name="backDoor"
												checked={config.doorConfig.backDoor}
												onChange={handleConfigChange}
											/>
											<label className="form-check-label" htmlFor="backDoor">
												Back Door
											</label>
										</div>
									</div>

									<div className="col-md-3">
										<div className="form-check">
											<input
												type="checkbox"
												className="form-check-input"
												id="leftDoor"
												name="leftDoor"
												checked={config.doorConfig.leftDoor}
												onChange={handleConfigChange}
											/>
											<label className="form-check-label" htmlFor="leftDoor">
												Left Door
											</label>
										</div>
									</div>

									<div className="col-md-3">
										<div className="form-check">
											<input
												type="checkbox"
												className="form-check-input"
												id="rightDoor"
												name="rightDoor"
												checked={config.doorConfig.rightDoor}
												onChange={handleConfigChange}
											/>
											<label className="form-check-label" htmlFor="rightDoor">
												Right Door
											</label>
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
				{/* Table Dimensions */}
				{config.includeTable && (
					<div className="card mb-4">
						<div className="card-header">
							<h2 className="h5 mb-0">Table Dimensions</h2>
						</div>
						<div className="card-body">
							{" "}
							<div className="row g-3">
								<div className="col-md-3 col-sm-6">
									<div className="form-floating">
										<input
											type="number"
											className="form-control"
											id="tableLength"
											name="length"
											value={tableDimensions.length}
											onChange={handleTableDimensionChange}
											placeholder="Length (mm)"
										/>
										<label htmlFor="tableLength">Length (mm)</label>
									</div>
								</div>

								<div className="col-md-3 col-sm-6">
									<div className="form-floating">
										<input
											type="number"
											className="form-control"
											id="tableWidth"
											name="width"
											value={tableDimensions.width}
											onChange={handleTableDimensionChange}
											placeholder="Width (mm)"
										/>
										<label htmlFor="tableWidth">Width (mm)</label>
									</div>
								</div>

								<div className="col-md-3 col-sm-6">
									<div className="form-floating">
										<input
											type="number"
											className="form-control"
											id="tableHeight"
											name="height"
											value={tableDimensions.height}
											onChange={handleTableDimensionChange}
											placeholder="Height (mm)"
										/>
										<label htmlFor="tableHeight">Height (mm)</label>
									</div>
								</div>

								<div className="col-md-3 col-sm-6">
									<div className="form-check mt-3">
										<input
											type="checkbox"
											className="form-check-input"
											id="tableIsOutsideDimension"
											name="isOutsideDimension"
											checked={tableDimensions.isOutsideDimension}
											onChange={handleTableDimensionChange}
										/>
										<label
											className="form-check-label"
											htmlFor="tableIsOutsideDimension"
										>
											Outside Dimensions
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
				{/* Enclosure Dimensions */}
				{config.includeEnclosure && (
					<div className="card mb-4">
						<div className="card-header">
							<h2 className="h5 mb-0">Enclosure Dimensions</h2>
						</div>
						<div className="card-body">
							{" "}
							<div className="row g-3">
								<div className="col-md-3 col-sm-6">
									<div className="form-floating">
										<input
											type="number"
											className="form-control"
											id="enclosureLength"
											name="length"
											value={enclosureDimensions.length}
											onChange={handleEnclosureDimensionChange}
											placeholder="Length (mm)"
										/>
										<label htmlFor="enclosureLength">Length (mm)</label>
									</div>
								</div>

								<div className="col-md-3 col-sm-6">
									<div className="form-floating">
										<input
											type="number"
											className="form-control"
											id="enclosureWidth"
											name="width"
											value={enclosureDimensions.width}
											onChange={handleEnclosureDimensionChange}
											placeholder="Width (mm)"
										/>
										<label htmlFor="enclosureWidth">Width (mm)</label>
									</div>
								</div>

								<div className="col-md-3 col-sm-6">
									<div className="form-floating">
										<input
											type="number"
											className="form-control"
											id="enclosureHeight"
											name="height"
											value={enclosureDimensions.height}
											onChange={handleEnclosureDimensionChange}
											placeholder="Height (mm)"
										/>
										<label htmlFor="enclosureHeight">Height (mm)</label>
									</div>
								</div>

								<div className="col-md-3 col-sm-6">
									<div className="form-check mt-3">
										<input
											type="checkbox"
											className="form-check-input"
											id="enclosureIsOutsideDimension"
											name="isOutsideDimension"
											checked={enclosureDimensions.isOutsideDimension}
											onChange={handleEnclosureDimensionChange}
										/>
										<label
											className="form-check-label"
											htmlFor="enclosureIsOutsideDimension"
										>
											Outside Dimensions
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
				{/* Material Configuration */}
				{config.includeEnclosure && (
					<div className="card mb-4">
						<div className="card-header">
							<h2 className="h5 mb-0">Panel Materials</h2>
						</div>
						<div className="card-body">
							<div className="row mb-3">
								<div className="col-md-4">
									<div className="form-check">
										<input
											type="checkbox"
											className="form-check-input"
											id="includePanels"
											name="includePanels"
											checked={materialConfig.includePanels}
											onChange={handlePanelConfigChange}
										/>
										<label className="form-check-label" htmlFor="includePanels">
											Include Panel Materials
										</label>
									</div>
								</div>
							</div>

							{materialConfig.includePanels && (
								<>
									{" "}
									<div className="row mb-3">
										<div className="col-md-6 col-sm-12 mb-3 mb-md-0">
											<label htmlFor="materialType" className="form-label">
												Material Type
											</label>
											<select
												className="form-select"
												id="materialType"
												name="type"
												value={materialConfig.type}
												onChange={handleMaterialTypeChange}
											>
												{MATERIAL_TYPES.map((material) => (
													<option key={material.id} value={material.id}>
														{material.name}
													</option>
												))}
											</select>
											<div className="form-text">
												Select panel material type
											</div>
										</div>

										<div className="col-md-6 col-sm-12">
											<label htmlFor="materialThickness" className="form-label">
												Material Thickness (mm)
											</label>
											<select
												className="form-select"
												id="materialThickness"
												name="thickness"
												value={materialConfig.thickness}
												onChange={handleMaterialThicknessChange}
											>
												{MATERIAL_THICKNESSES.map((thickness) => (
													<option key={thickness} value={thickness}>
														{thickness}mm
													</option>
												))}
											</select>
											<div className="form-text">Select material thickness</div>
										</div>
									</div>
									<div className="row">
										<div className="col-12">
											<label className="form-label">Panel Configuration</label>
										</div>
										<div className="col-md-2">
											<div className="form-check">
												<input
													type="checkbox"
													className="form-check-input"
													id="panelTop"
													name="top"
													checked={materialConfig.panelConfig.top}
													onChange={handlePanelConfigChange}
												/>
												<label className="form-check-label" htmlFor="panelTop">
													Top
												</label>
											</div>
										</div>
										<div className="col-md-2">
											<div className="form-check">
												<input
													type="checkbox"
													className="form-check-input"
													id="panelBottom"
													name="bottom"
													checked={materialConfig.panelConfig.bottom}
													onChange={handlePanelConfigChange}
												/>
												<label
													className="form-check-label"
													htmlFor="panelBottom"
												>
													Bottom
												</label>
											</div>
										</div>
										<div className="col-md-2">
											<div className="form-check">
												<input
													type="checkbox"
													className="form-check-input"
													id="panelLeft"
													name="left"
													checked={materialConfig.panelConfig.left}
													onChange={handlePanelConfigChange}
												/>
												<label className="form-check-label" htmlFor="panelLeft">
													Left
												</label>
											</div>
										</div>
										<div className="col-md-2">
											<div className="form-check">
												<input
													type="checkbox"
													className="form-check-input"
													id="panelRight"
													name="right"
													checked={materialConfig.panelConfig.right}
													onChange={handlePanelConfigChange}
												/>
												<label
													className="form-check-label"
													htmlFor="panelRight"
												>
													Right
												</label>
											</div>
										</div>
										<div className="col-md-2">
											<div className="form-check">
												<input
													type="checkbox"
													className="form-check-input"
													id="panelBack"
													name="back"
													checked={materialConfig.panelConfig.back}
													onChange={handlePanelConfigChange}
												/>
												<label className="form-check-label" htmlFor="panelBack">
													Back
												</label>
											</div>
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				)}
				{/* Results Section */}{" "}
				<div className="card mb-4">
					<div className="card-header d-flex justify-content-between align-items-center">
						<h2 className="h5 mb-0">Bill of Materials</h2>
						<div className="d-flex">
							<button
								className="btn btn-sm btn-outline-primary me-2"
								onClick={copyShareableURL}
								disabled={!config.includeTable && !config.includeEnclosure}
								title="Create a shareable link with your current configuration"
							>
								<i className="bi bi-link-45deg me-1"></i> Share Config
							</button>
							<button
								className="btn btn-sm btn-outline-secondary"
								onClick={printBOM}
								disabled={!config.includeTable && !config.includeEnclosure}
								title="Print bill of materials"
							>
								<i className="bi bi-printer me-1"></i> Print BOM
							</button>
						</div>
					</div>
					<div className="card-body" ref={printRef}>
						{/* Quick Summary */}
						<div className="alert alert-primary mb-4">
							<h3 className="h6">Project Summary</h3>
							<div className="row">
								{config.includeTable && (
									<div className="col-md-4 mb-2">
										<strong>Table:</strong> {tableDimensions.length}mm ×{" "}
										{tableDimensions.width}mm × {tableDimensions.height}mm
										{tableDimensions.isOutsideDimension ? " (OD)" : " (ID)"}
									</div>
								)}
								{config.includeEnclosure && (
									<div className="col-md-4 mb-2">
										<strong>Enclosure:</strong> {enclosureDimensions.length}mm ×{" "}
										{enclosureDimensions.width}mm × {enclosureDimensions.height}
										mm
										{enclosureDimensions.isOutsideDimension ? " (OD)" : " (ID)"}
									</div>
								)}
								{config.includeDoors && (
									<div className="col-md-4 mb-2">
										<strong>Doors:</strong>{" "}
										{Object.values(config.doorConfig).filter(Boolean).length}
										{Object.entries(config.doorConfig)
											.filter(([_, enabled]) => enabled)
											.map(([pos]) => " " + pos.replace("Door", ""))
											.join(", ")}
									</div>
								)}
								{materialConfig.includePanels && (
									<div className="col-md-4 mb-2">
										<strong>Panels:</strong>{" "}
										{
											Object.values(materialConfig.panelConfig).filter(Boolean)
												.length
										}{" "}
										({materialTypesMap[materialConfig.type]?.name},{" "}
										{materialConfig.thickness}mm)
									</div>
								)}
							</div>
						</div>
						{/* Table Results */}
						{results.table && (
							<div className="mb-4">
								<h3 className="h6 mb-3">Machine Table Components</h3>
								<div className="table-responsive">
									<table className="table table-striped table-bordered">
										<thead>
											<tr>
												<th>Item</th>
												<th>Description</th>
												<th>SKU</th>
												<th>QTY</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>1</td>
												<td>
													2060 Linear Rail -{" "}
													{results.table.extrusions.rail2060Length}mm (Length)
												</td>
												<td>
													LR-2060-{results.table.extrusions.rail2060Length}
												</td>
												<td>{results.table.extrusions.qtyRail2060Length}</td>
											</tr>
											<tr>
												<td>2</td>
												<td>
													2060 Linear Rail -{" "}
													{results.table.extrusions.rail2060Width}mm (Width)
												</td>
												<td>
													LR-2060-{results.table.extrusions.rail2060Width}
												</td>
												<td>{results.table.extrusions.qtyRail2060Width}</td>
											</tr>
											<tr>
												<td>3</td>
												<td>
													4040 Linear Rail -{" "}
													{results.table.extrusions.rail4040Legs}mm (Legs)
												</td>
												<td>LR-4040-{results.table.extrusions.rail4040Legs}</td>
												<td>{results.table.extrusions.qtyRail4040Legs}</td>
											</tr>
											<tr>
												<td>4</td>
												<td>In-Out Corner Bracket – 60mm</td>
												<td>BRAC-IOCNR-60</td>
												<td>{results.table.hardware.IOCNR_60}</td>
											</tr>
											<tr>
												<td>5</td>
												<td>Universal L Brackets – Triple</td>
												<td>BRAC-L3</td>
												<td>{results.table.hardware.L_BRACKET_TRIPLE}</td>
											</tr>
											<tr>
												<td>6</td>
												<td>Sliding T-Nut</td>
												<td>HARD-TNUT-SLIDING-M5</td>
												<td>{results.table.hardware.T_NUT_SLIDING}</td>
											</tr>
											<tr>
												<td>7</td>
												<td>M5 Cap Head Bolts – 8MM</td>
												<td>BOLT-M5-CAP-008-1PC</td>
												<td>{results.table.hardware.CAP_HEAD_M5_8MM}</td>
											</tr>
											<tr>
												<td>8</td>
												<td>M5 Button Head Screws – 8MM</td>
												<td>SCREWS-M5-BH-8-1</td>
												<td>{results.table.hardware.BUTTON_HEAD_M5_8MM}</td>
											</tr>
											<tr>
												<td>9</td>
												<td>M5 Low Profile Screws – 25MM</td>
												<td>SCREWS-M5-LP-25-1</td>
												<td>{results.table.hardware.LOW_PROFILE_M5_25MM}</td>
											</tr>
											<tr>
												<td>10</td>
												<td>Foot Mounting Brackets</td>
												<td>BRAC-FOOT</td>
												<td>{results.table.hardware.FOOT_BRACKETS}</td>
											</tr>
											<tr>
												<td>11</td>
												<td>Wheels or Adjustable Feet</td>
												<td>BUN-FOOT</td>
												<td>{results.table.hardware.FEET}</td>
											</tr>
										</tbody>
									</table>
								</div>
								<p className="text-muted small">
									Total 2060 Extrusion: {results.table.totalLengths.rail2060}mm
									<br />
									Total 4040 Extrusion: {results.table.totalLengths.rail4040}mm
								</p>
							</div>
						)}
						{/* Enclosure Results */}
						{results.enclosure && (
							<div className="mb-4">
								<h3 className="h6 mb-3">Enclosure Components</h3>
								<div className="table-responsive">
									<table className="table table-striped table-bordered">
										<thead>
											<tr>
												<th>Item</th>
												<th>Description</th>
												<th>SKU</th>
												<th>QTY</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>1</td>
												<td>In-Out Corner Bracket – 20mm</td>
												<td>BRAC-IOCNR-20</td>
												<td>{results.enclosure.hardware.IOCNR_20}</td>
											</tr>
											<tr>
												<td>2</td>
												<td>In-Out Corner Bracket – 40mm</td>
												<td>BRAC-IOCNR-40</td>
												<td>{results.enclosure.hardware.IOCNR_40}</td>
											</tr>
											<tr>
												<td>3</td>
												<td>In-Out Corner Bracket – 60mm</td>
												<td>BRAC-IOCNR-60</td>
												<td>{results.enclosure.hardware.IOCNR_60}</td>
											</tr>
											<tr>
												<td>4</td>
												<td>90 degree Angle Corner Connector (V-Slot)</td>
												<td>BRAC-90ANG</td>
												<td>{results.enclosure.hardware.ANGLE_CORNER_90}</td>
											</tr>
											<tr>
												<td>5</td>
												<td>Sliding T-Nut</td>
												<td>HARD-TNUT-SLIDING-M5</td>
												<td>{results.enclosure.hardware.T_NUT_SLIDING}</td>
											</tr>
											<tr>
												<td>6</td>
												<td>M5 Cap Head Bolts – 8MM</td>
												<td>BOLT-M5-CAP-008-1PC</td>
												<td>{results.enclosure.hardware.CAP_HEAD_M5_8MM}</td>
											</tr>
											<tr>
												<td>7</td>
												<td>
													{results.enclosure.extrusions.horizontal.length.type}{" "}
													Linear Rail -{" "}
													{results.enclosure.extrusions.horizontal.length.size}
													mm (Length)
												</td>
												<td>
													LR-
													{results.enclosure.extrusions.horizontal.length.type}-
													{results.enclosure.extrusions.horizontal.length.size}
												</td>
												<td>4</td>
											</tr>
											<tr>
												<td>8</td>
												<td>
													{results.enclosure.extrusions.horizontal.width.type}{" "}
													Linear Rail -{" "}
													{results.enclosure.extrusions.horizontal.width.size}mm
													(Width)
												</td>
												<td>
													LR-
													{results.enclosure.extrusions.horizontal.width.type}-
													{results.enclosure.extrusions.horizontal.width.size}
												</td>
												<td>4</td>
											</tr>
											<tr>
												<td>9</td>
												<td>
													2020 Linear Rail -{" "}
													{results.enclosure.extrusions.vertical2020.size}mm
													(Height)
												</td>
												<td>
													LR-2020-
													{results.enclosure.extrusions.vertical2020.size}
												</td>
												<td>{results.enclosure.extrusions.vertical2020.qty}</td>
											</tr>
											<tr>
												<td>10</td>
												<td>M5 Button Head Bolts – 8MM</td>
												<td>SCREWS-M5-BH-008-1</td>
												<td>{results.enclosure.hardware.BUTTON_HEAD_M5_8MM}</td>
											</tr>
										</tbody>
									</table>
								</div>{" "}
								<p className="text-muted small">
									{results.enclosure.totalLengths.rail2020 > 0 && (
										<>
											Total 2020 Extrusion (Length):{" "}
											{results.enclosure.totalLengths.rail2020}mm
											<br />
										</>
									)}
									{results.enclosure.totalLengths.rail2040 > 0 && (
										<>
											Total 2040 Extrusion (Length):{" "}
											{results.enclosure.totalLengths.rail2040}mm
											<br />
										</>
									)}
									{results.enclosure.totalLengths.railWidth2020 > 0 && (
										<>
											Total 2020 Extrusion (Width):{" "}
											{results.enclosure.totalLengths.railWidth2020}mm
											<br />
										</>
									)}
									{results.enclosure.totalLengths.railWidth2040 > 0 && (
										<>
											Total 2040 Extrusion (Width):{" "}
											{results.enclosure.totalLengths.railWidth2040}mm
											<br />
										</>
									)}
									Total 2020 Extrusion (Vertical):{" "}
									{results.enclosure.totalLengths.verticalRail2020}mm
								</p>
							</div>
						)}
						{/* Mounting Hardware */}
						{results.mounting && (
							<div className="mb-4">
								<h3 className="h6 mb-3">Enclosure Mounting Hardware</h3>
								<div className="alert alert-info">
									<p className="mb-0 small">
										<strong>Note:</strong> {results.mounting.instructions}
									</p>
								</div>
								<div className="table-responsive">
									<table className="table table-striped table-bordered">
										<thead>
											<tr>
												<th>Item</th>
												<th>Description</th>
												<th>SKU</th>
												<th>QTY</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>1</td>
												<td>In-Out Corner Bracket – 40mm</td>
												<td>BRAC-IOCNR-40</td>
												<td>{results.mounting.hardware.IOCNR_40}</td>
											</tr>
											<tr>
												<td>2</td>
												<td>Sliding T-Nut</td>
												<td>HARD-TNUT-SLIDING-M5</td>
												<td>{results.mounting.hardware.T_NUT_SLIDING}</td>
											</tr>
											<tr>
												<td>3</td>
												<td>M5 Cap Head Bolts – 8MM</td>
												<td>BOLT-M5-CAP-008-1PC</td>
												<td>{results.mounting.hardware.CAP_HEAD_M5_8MM}</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						)}{" "}
						{/* Door Components */}
						{results.doors &&
							results.doors.panels &&
							results.doors.panels.length > 0 && (
								<div className="mb-4">
									<h3 className="h6 mb-3">Door Components</h3>
									<div className="table-responsive">
										<table className="table table-striped table-bordered">
											<thead>
												<tr>
													<th>Item</th>
													<th>Description</th>
													<th>SKU</th>
													<th>QTY</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td>1</td>
													<td>Door Hinges</td>
													<td>DOOR-HINGE</td>
													<td>{results.doors.hardware.HINGE}</td>
												</tr>
												<tr>
													<td>2</td>
													<td>Door Handles</td>
													<td>DOOR-HANDLE</td>
													<td>{results.doors.hardware.HANDLE}</td>
												</tr>
												<tr>
													<td>3</td>
													<td>Sliding T-Nut</td>
													<td>HARD-TNUT-SLIDING-M5</td>
													<td>{results.doors.hardware.T_NUT_SLIDING}</td>
												</tr>
												<tr>
													<td>4</td>
													<td>M5 Button Head Bolts – 8MM</td>
													<td>SCREWS-M5-BH-008-1</td>
													<td>{results.doors.hardware.BUTTON_HEAD_M5_8MM}</td>
												</tr>
												<tr>
													<td>5</td>
													<td>Corner Brackets</td>
													<td>BRAC-CORNER</td>
													<td>{results.doors.hardware.CORNER_BRACKET}</td>
												</tr>
											</tbody>
										</table>
									</div>

									<h4 className="h6 mt-4 mb-2">Door Panels</h4>
									<div className="table-responsive">
										<table className="table table-striped table-bordered">
											<thead>
												<tr>
													<th>Position</th>
													<th>Width</th>
													<th>Height</th>
													<th>Area</th>
												</tr>
											</thead>
											<tbody>
												{results.doors.panels.map((panel, index) => (
													<tr key={index}>
														<td>{panel.position}</td>
														<td>{panel.width}mm</td>
														<td>{panel.height}mm</td>
														<td>
															{(panel.width * panel.height).toLocaleString()}{" "}
															mm² (
															{((panel.width * panel.height) / 1000000).toFixed(
																3
															)}{" "}
															m²)
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							)}{" "}
						{/* Panel Materials */}
						{results.panels &&
							results.panels.panels &&
							results.panels.panels.length > 0 && (
								<div className="mb-4">
									<h3 className="h6 mb-3">Panel Materials</h3>
									<div className="alert alert-info">
										<p className="mb-0 small">
											{" "}
											<strong>Material:</strong>{" "}
											{materialTypesMap[results.panels?.material.type]?.name ||
												results.panels?.material.type}{" "}
											| <strong>Thickness:</strong>{" "}
											{results.panels?.material.thickness}mm |
											<strong> Total Area:</strong>{" "}
											{Math.ceil(
												results.panels?.totalArea || 0
											).toLocaleString()}{" "}
											mm² (
											{((results.panels?.totalArea || 0) / 1000000).toFixed(2)}{" "}
											m²)
										</p>
									</div>

									<div className="table-responsive">
										<table className="table table-striped table-bordered">
											<thead>
												<tr>
													<th>Panel</th>
													<th>Dimensions</th>
													<th>Area</th>
													<th>Material</th>
												</tr>
											</thead>
											<tbody>
												{results.panels.panels.map((panel, index) => (
													<tr key={index}>
														<td>{panel.position}</td>{" "}
														<td>
															{panel.position === "Top" ||
															panel.position === "Bottom"
																? `${panel.width}mm × ${panel.length}mm`
																: `${panel.width}mm × ${panel.height}mm`}
														</td>
														<td>
															{panel.position === "Top" ||
															panel.position === "Bottom"
																? `${
																		panel.width && panel.length
																			? (
																					panel.width * panel.length
																			  ).toLocaleString()
																			: 0
																  } mm² (${
																		panel.width && panel.length
																			? (
																					(panel.width * panel.length) /
																					1000000
																			  ).toFixed(3)
																			: 0
																  } m²)`
																: `${
																		panel.width && panel.height
																			? (
																					panel.width * panel.height
																			  ).toLocaleString()
																			: 0
																  } mm² (${
																		panel.width && panel.height
																			? (
																					(panel.width * panel.height) /
																					1000000
																			  ).toFixed(3)
																			: 0
																  } m²)`}
														</td>
														<td>
															{" "}
															{materialTypesMap[results.panels?.material.type]
																?.name || results.panels?.material.type}{" "}
															({results.panels?.material.thickness}mm)
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>

									<h4 className="h6 mt-4 mb-2">Ordering Information</h4>
									<div className="alert alert-warning">
										<p className="mb-0 small">
											<strong>Note:</strong> When ordering materials, add some
											extra margin for cutting errors and waste. Recommended:
											order at least 10% more than the calculated area.
										</p>
									</div>
									<div className="table-responsive">
										<table className="table table-striped table-bordered">
											<thead>
												<tr>
													<th>Material</th>
													<th>Thickness</th>
													<th>Total Area Required</th>
													<th>Recommended Order (+10%)</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td>
														{" "}
														{materialTypesMap[results.panels?.material.type]
															?.name || results.panels?.material.type}
													</td>
													<td>{results.panels?.material.thickness}mm</td>
													<td>
														{(results.panels?.totalArea || 0).toLocaleString()}{" "}
														mm² (
														{(
															(results.panels?.totalArea || 0) / 1000000
														).toFixed(3)}{" "}
														m²)
													</td>
													<td>
														{Math.ceil(
															(results.panels?.totalArea || 0) * 1.1
														).toLocaleString()}{" "}
														mm² (
														{(
															((results.panels?.totalArea || 0) * 1.1) /
															1000000
														).toFixed(3)}{" "}
														m²)
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							)}
						{/* No Results Message */}
						{!results.table && !results.enclosure && (
							<div className="alert alert-info">
								Please select at least one component (Table or Enclosure) and
								specify dimensions.
							</div>
						)}
					</div>
				</div>
			</div>
		</LayoutContainer>
	);
}

/**
 * Interface for dimensions of table or enclosure
 * Includes flag for specifying whether dimensions are inside or outside measurements
 */
interface Dimensions {
	length: number;
	width: number;
	height: number;
	isOutsideDimension?: boolean;
}

/**
 * Interface for door configuration options
 */
interface DoorConfig {
	frontDoor?: boolean;
	backDoor?: boolean;
	leftDoor?: boolean;
	rightDoor?: boolean;
}

/**
 * Interface for calculation results
 */
interface Results {
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

// Export calculation functions for testing
// This is only used in tests and doesn't affect production code
TableEnclosureCalculator.calculationFunctions = {
	calculateTableMaterials,
	calculateEnclosureMaterials,
	calculateMountingMaterials,
	calculateDoorMaterials: (dimensions: Dimensions) => {
		// Internal function implementation details...
	},
	calculatePanelMaterials: (dimensions: Dimensions) => {
		// Internal function implementation details...
	},
};
