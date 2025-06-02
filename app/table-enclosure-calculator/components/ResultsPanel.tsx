/**
 * Results panel component
 * Updated: 17/05/2025
 * Author: Daniel Potter
 * Description: This component displays the results of the table and enclosure calculator.
 * It should take the results and configuration as props and render them in a user-friendly format.
 */

"use client";
import React, { useRef } from "react";
import {
	Results,
	TableConfig,
	MaterialConfig,
	DoorType,
	DoorTypeDisplayNames,
} from "@/types/box-shipping-calculator/box-shipping-types";

interface ResultsPanelProps {
	results: Results;
	config: TableConfig;
	materialConfig: MaterialConfig;
	tableDimensions: any;
	enclosureDimensions: any;
	materialTypesMap: Record<string, any>;
	isCalculating?: boolean;
}

/**
 * Client component for displaying results
 */
export function ResultsPanel({
	results,
	config,
	materialConfig,
	tableDimensions,
	enclosureDimensions,
	materialTypesMap,
	isCalculating,
}: ResultsPanelProps) {
	const printRef = useRef<HTMLDivElement>(null);

	/**
	 * Export BOM to CSV format
	 */
	const exportToCSV = () => {
		const bomData = generateBOMData();
		const csvContent = convertToCSV(bomData);
		downloadFile(csvContent, `BOM_${generateFilename()}.csv`, "text/csv");
	};

	/**
	 * Export BOM to Excel-compatible CSV format
	 */
	const exportToExcel = () => {
		const bomData = generateBOMData();
		const csvContent = convertToExcelCSV(bomData);
		downloadFile(csvContent, `BOM_${generateFilename()}.csv`, "text/csv");
	};

	/**
	 * Print BOM functionality
	 */
	const printBOM = () => {
		const printWindow = window.open("", "_blank");
		if (printWindow && printRef.current) {
			printWindow.document.write(`
				<html>
					<head>
						<title>Bill of Materials</title>
						<style>
							body { font-family: Arial, sans-serif; margin: 20px; }
							table { border-collapse: collapse; width: 100%; margin: 10px 0; }
							th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
							th { background-color: #f5f5f5; }
							.alert { padding: 15px; margin: 10px 0; border-radius: 4px; background-color: #d1ecf1; }
							@media print { button { display: none; } }
						</style>
					</head>
					<body>
						${printRef.current.innerHTML}
					</body>
				</html>
			`);
			printWindow.document.close();
			printWindow.print();
		}
	};

	/**
	 * Generate comprehensive BOM data for export
	 */
	const generateBOMData = () => {
		const bomItems: any[] = [];
		const materialCostPerSqM = getMaterialCostPerSqM(materialConfig.type);

		// Add table materials
		if (results.table) {
			bomItems.push({
				category: "Table Frame",
				item: "Aluminum Extrusion 20x60mm (Length)",
				quantity: results.table.extrusions.qtyRail2060Length,
				unit: "pcs",
				length: `${results.table.extrusions.rail2060Length}mm`,
				description: "Horizontal frame members (length)",
				estimatedCost: (
					(results.table.extrusions.qtyRail2060Length *
						results.table.extrusions.rail2060Length *
						0.15) /
					1000
				).toFixed(2),
			});

			bomItems.push({
				category: "Table Frame",
				item: "Aluminum Extrusion 20x60mm (Width)",
				quantity: results.table.extrusions.qtyRail2060Width,
				unit: "pcs",
				length: `${results.table.extrusions.rail2060Width}mm`,
				description: "Horizontal frame members (width)",
				estimatedCost: (
					(results.table.extrusions.qtyRail2060Width *
						results.table.extrusions.rail2060Width *
						0.15) /
					1000
				).toFixed(2),
			});

			bomItems.push({
				category: "Table Frame",
				item: "Aluminum Extrusion 40x40mm",
				quantity: results.table.extrusions.qtyRail4040Legs,
				unit: "pcs",
				length: `${results.table.extrusions.rail4040Legs}mm`,
				description: "Table legs",
				estimatedCost: (
					(results.table.extrusions.qtyRail4040Legs *
						results.table.extrusions.rail4040Legs *
						0.2) /
					1000
				).toFixed(2),
			});
		}

		// Add enclosure materials
		if (results.enclosure) {
			bomItems.push({
				category: "Enclosure Frame",
				item: `Aluminum Extrusion ${results.enclosure.extrusions.horizontal.length.type}`,
				quantity: 2,
				unit: "pcs",
				length: `${results.enclosure.extrusions.horizontal.length.size}mm`,
				description: "Horizontal frame members (length)",
				estimatedCost: (
					(2 * results.enclosure.extrusions.horizontal.length.size * 0.08) /
					1000
				).toFixed(2),
			});

			bomItems.push({
				category: "Enclosure Frame",
				item: `Aluminum Extrusion ${results.enclosure.extrusions.horizontal.width.type}`,
				quantity: 2,
				unit: "pcs",
				length: `${results.enclosure.extrusions.horizontal.width.size}mm`,
				description: "Horizontal frame members (width)",
				estimatedCost: (
					(2 * results.enclosure.extrusions.horizontal.width.size * 0.08) /
					1000
				).toFixed(2),
			});

			bomItems.push({
				category: "Enclosure Frame",
				item: "Aluminum Extrusion 20x20mm",
				quantity: results.enclosure.extrusions.vertical2020.qty,
				unit: "pcs",
				length: `${results.enclosure.extrusions.vertical2020.size}mm`,
				description: "Vertical frame members",
				estimatedCost: (
					(results.enclosure.extrusions.vertical2020.qty *
						results.enclosure.extrusions.vertical2020.size *
						0.08) /
					1000
				).toFixed(2),
			});
		}

		// Add panel materials
		if (results.panels && materialConfig.includePanels) {
			results.panels.panels.forEach((panel: any) => {
				if (panel) {
					const panelArea =
						panel.width && panel.height
							? panel.width * panel.height
							: panel.width && panel.length
							? panel.width * panel.length
							: 0;
					bomItems.push({
						category: "Panels",
						item: `${materialConfig.type} Panel`,
						quantity: 1,
						unit: "sheet",
						length:
							panel.width && panel.height
								? `${panel.width}x${panel.height}mm`
								: panel.width && panel.length
								? `${panel.width}x${panel.length}mm`
								: "Custom",
						description: `${panel.position} panel`,
						estimatedCost: ((panelArea / 1000000) * materialCostPerSqM).toFixed(
							2
						),
					});
				}
			});
		}

		// Add door materials
		if (results.doors && config.includeDoors) {
			results.doors.panels?.forEach((door: any, index: number) => {
				if (door) {
					const doorArea = door.width * door.height;
					bomItems.push({
						category: "Doors",
						item: `Door Panel #${index + 1}`,
						quantity: 1,
						unit: "sheet",
						length: `${door.width}x${door.height}mm`,
						description: `${door.position} door panel`,
						estimatedCost: (
							(doorArea / 1000000) * materialCostPerSqM +
							15
						).toFixed(2), // Material + hardware
					});
				}
			});
		}

		// Add mounting hardware
		if (results.mounting) {
			bomItems.push({
				category: "Mounting Hardware",
				item: "Mounting Brackets",
				quantity: results.mounting.hardware.IOCNR_40,
				unit: "pcs",
				length: "-",
				description: "Table-to-enclosure mounting brackets",
				estimatedCost: (results.mounting.hardware.IOCNR_40 * 3.5).toFixed(2),
			});
		}

		return bomItems;
	};

	/**
	 * Get estimated material cost per square meter
	 */
	const getMaterialCostPerSqM = (materialType: string): number => {
		const costs: Record<string, number> = {
			plywood: 25,
			mdf: 20,
			acrylic: 45,
			polycarbonate: 55,
			aluminum: 85,
		};
		return costs[materialType] || 30;
	};

	/**
	 * Calculate extrusion cost based on total lengths
	 */
	const calculateExtrusionCost = (component: any): number => {
		if (!component.totalLengths) return 0;

		let cost = 0;
		// 2020 extrusion cost: $0.08/mm
		if (component.totalLengths.rail2020) {
			cost += (component.totalLengths.rail2020 * 0.08) / 1000;
		}
		// 2040 extrusion cost: $0.12/mm
		if (component.totalLengths.rail2040) {
			cost += (component.totalLengths.rail2040 * 0.12) / 1000;
		}
		// Width rails
		if (component.totalLengths.railWidth2020) {
			cost += (component.totalLengths.railWidth2020 * 0.08) / 1000;
		}
		if (component.totalLengths.railWidth2040) {
			cost += (component.totalLengths.railWidth2040 * 0.12) / 1000;
		}
		// Vertical rails
		if (component.totalLengths.verticalRail2020) {
			cost += (component.totalLengths.verticalRail2020 * 0.08) / 1000;
		}
		// 4040 extrusion cost: $0.20/mm
		if (component.totalLengths.rail4040) {
			cost += (component.totalLengths.rail4040 * 0.2) / 1000;
		}

		return cost;
	};

	/**
	 * Calculate hardware cost
	 */
	const calculateHardwareCost = (hardware: any): number => {
		if (!hardware) return 0;

		let cost = 0;
		// Standard hardware costs
		const hardwareCosts: Record<string, number> = {
			IOCNR_20: 2.5,
			IOCNR_40: 3.5,
			IOCNR_60: 4.5,
			L_BRACKET_TRIPLE: 5.0,
			ANGLE_CORNER_90: 3.0,
			T_NUT_SLIDING: 0.25,
			CAP_HEAD_M5_8MM: 0.15,
			BUTTON_HEAD_M5_8MM: 0.15,
			LOW_PROFILE_M5_25MM: 0.2,
			FOOT_BRACKETS: 4.0,
			FEET: 8.0,
			HINGE: 12.0,
			HANDLE: 15.0,
			CORNER_BRACKET: 2.5,
			SPRING_LOADED_T_NUT: 0.3,
		};

		Object.entries(hardware).forEach(([key, value]) => {
			if (typeof value === "number" && hardwareCosts[key]) {
				cost += value * hardwareCosts[key];
			}
		});

		return cost;
	};

	/**
	 * Calculate total estimated project cost
	 */
	const calculateTotalProjectCost = (
		results: Results,
		materialConfig: MaterialConfig
	): number => {
		let total = 0;

		// Panel material costs
		if (results.panels && materialConfig.includePanels) {
			total +=
				(results.panels.totalArea / 1000000) *
				getMaterialCostPerSqM(materialConfig.type);
		}

		// Extrusion costs
		if (results.table) {
			total += calculateExtrusionCost(results.table);
		}
		if (results.enclosure) {
			total += calculateExtrusionCost(results.enclosure);
		}

		// Hardware costs
		if (results.table) {
			total += calculateHardwareCost(results.table.hardware);
		}
		if (results.enclosure) {
			total += calculateHardwareCost(results.enclosure.hardware);
		}
		if (results.doors) {
			total += calculateHardwareCost(results.doors.hardware);
		}
		if (results.mounting) {
			total += calculateHardwareCost(results.mounting.hardware);
		}

		return total;
	};

	/**
	 * Convert BOM data to CSV format
	 */
	const convertToCSV = (data: any[]): string => {
		const headers = [
			"Category",
			"Item",
			"Quantity",
			"Unit",
			"Length/Size",
			"Description",
			"Est. Cost (USD)",
		];
		const csvRows = [headers.join(",")];

		data.forEach((item) => {
			const row = [
				`"${item.category}"`,
				`"${item.item}"`,
				item.quantity,
				`"${item.unit}"`,
				`"${item.length}"`,
				`"${item.description}"`,
				item.estimatedCost,
			];
			csvRows.push(row.join(","));
		});

		// Add total cost row
		const totalCost = data.reduce(
			(sum, item) => sum + parseFloat(item.estimatedCost),
			0
		);
		csvRows.push("");
		csvRows.push(
			`"Total Estimated Cost","","","","","","${totalCost.toFixed(2)}"`
		);

		return csvRows.join("\n");
	};

	/**
	 * Convert BOM data to Excel-compatible CSV format
	 */
	const convertToExcelCSV = (data: any[]): string => {
		// Add BOM (Byte Order Mark) for Excel UTF-8 recognition
		const BOM = "\uFEFF";
		return BOM + convertToCSV(data);
	};

	/**
	 * Generate filename with timestamp
	 */
	const generateFilename = (): string => {
		const now = new Date();
		const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, "");
		const components = [];
		if (config.includeTable) components.push("Table");
		if (config.includeEnclosure) components.push("Enclosure");
		return `${components.join("_")}_${timestamp}`;
	};

	/**
	 * Download file helper
	 */
	const downloadFile = (
		content: string,
		filename: string,
		mimeType: string
	) => {
		const blob = new Blob([content], { type: mimeType });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	};

	/**
	 * Calculate total estimated project cost
	 */
	const calculateTotalCost = (): number => {
		const bomData = generateBOMData();
		return bomData.reduce(
			(sum, item) => sum + parseFloat(item.estimatedCost),
			0
		);
	};

	return (
		<div className="card mb-4">
			<div className="card-header d-flex justify-content-between align-items-center">
				<div>
					<h2 className="h5 mb-0">Bill of Materials</h2>
					{!isCalculating &&
						(config.includeTable || config.includeEnclosure) && (
							<small className="text-muted">
								Estimated Total Cost:{" "}
								<strong>${calculateTotalCost().toFixed(2)} USD</strong>
							</small>
						)}
				</div>
				<div className="btn-group">
					<button
						className="btn btn-sm btn-outline-success"
						onClick={exportToCSV}
						disabled={
							isCalculating ||
							(!config.includeTable && !config.includeEnclosure)
						}
						title="Export to CSV"
					>
						<i className="bi bi-filetype-csv me-1"></i> CSV
					</button>
					<button
						className="btn btn-sm btn-outline-success"
						onClick={exportToExcel}
						disabled={
							isCalculating ||
							(!config.includeTable && !config.includeEnclosure)
						}
						title="Export to Excel"
					>
						<i className="bi bi-file-excel me-1"></i> Excel
					</button>
					<button
						className="btn btn-sm btn-outline-secondary"
						onClick={printBOM}
						disabled={
							isCalculating ||
							(!config.includeTable && !config.includeEnclosure)
						}
						title="Print bill of materials"
					>
						<i className="bi bi-printer me-1"></i> Print
					</button>
				</div>
			</div>
			<div className="card-body" ref={printRef}>
				{" "}
				{/* Quick Summary */}
				<div className="alert alert-primary mb-4">
					<h3 className="h6">Project Summary</h3>
					<div className="row">
						{config.includeTable && (
							<div className="col-md-4 mb-2">
								<strong>Table:</strong> {tableDimensions.length}mm x{" "}
								{tableDimensions.width}mm x {tableDimensions.height}mm
								{config.isOutsideDimension ? " (OD)" : " (ID)"}
							</div>
						)}
						{config.includeEnclosure && (
							<div className="col-md-4 mb-2">
								<strong>Enclosure:</strong> {enclosureDimensions.length}mm x{" "}
								{enclosureDimensions.width}mm x {enclosureDimensions.height}
								mm
								{config.isOutsideDimension ? " (OD)" : " (ID)"}
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
				{/* Simplified Cost Summary */}
				{(results.table || results.enclosure) && (
					<div className="mt-8 p-6 bg-blue-50 rounded-lg">
						<h3 className="text-lg font-semibold text-blue-900 mb-4">
							💰 Cost Summary
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Material Costs */}
							<div className="p-4 bg-white rounded border">
								<h4 className="font-medium text-gray-900 mb-3">
									Material Costs
								</h4>
								<div className="space-y-2 text-sm">
									{results.panels && (
										<div className="flex justify-between">
											<span className="text-gray-600">
												Panel Material ({results.panels.totalArea.toFixed(3)}{" "}
												m²):
											</span>
											<span className="font-medium">
												$
												{(
													results.panels.totalArea *
													getMaterialCostPerSqM(materialConfig.type)
												).toFixed(2)}
											</span>
										</div>
									)}

									{/* Extrusion Costs */}
									{results.table && (
										<div className="flex justify-between">
											<span className="text-gray-600">Table Extrusions:</span>
											<span className="font-medium">
												${calculateExtrusionCost(results.table).toFixed(2)}
											</span>
										</div>
									)}

									{results.enclosure && (
										<div className="flex justify-between">
											<span className="text-gray-600">
												Enclosure Extrusions:
											</span>
											<span className="font-medium">
												${calculateExtrusionCost(results.enclosure).toFixed(2)}
											</span>
										</div>
									)}
								</div>
							</div>

							{/* Hardware Costs */}
							<div className="p-4 bg-white rounded border">
								<h4 className="font-medium text-gray-900 mb-3">
									Hardware Costs
								</h4>
								<div className="space-y-2 text-sm">
									{results.table && (
										<div className="flex justify-between">
											<span className="text-gray-600">Table Hardware:</span>
											<span className="font-medium">
												$
												{calculateHardwareCost(results.table.hardware).toFixed(
													2
												)}
											</span>
										</div>
									)}

									{results.enclosure && (
										<div className="flex justify-between">
											<span className="text-gray-600">Enclosure Hardware:</span>
											<span className="font-medium">
												$
												{calculateHardwareCost(
													results.enclosure.hardware
												).toFixed(2)}
											</span>
										</div>
									)}

									{results.doors && (
										<div className="flex justify-between">
											<span className="text-gray-600">Door Hardware:</span>
											<span className="font-medium">
												$
												{calculateHardwareCost(results.doors.hardware).toFixed(
													2
												)}
											</span>
										</div>
									)}

									{results.mounting && (
										<div className="flex justify-between">
											<span className="text-gray-600">Mounting Hardware:</span>
											<span className="font-medium">
												$
												{calculateHardwareCost(
													results.mounting.hardware
												).toFixed(2)}
											</span>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Total Cost */}
						<div className="mt-4 pt-4 border-t border-blue-200">
							<div className="flex justify-between items-center">
								<span className="text-lg font-semibold text-blue-900">
									Estimated Total Cost:
								</span>
								<span className="text-2xl font-bold text-green-600">
									$
									{calculateTotalProjectCost(results, materialConfig).toFixed(
										2
									)}
								</span>
							</div>
							<p className="text-sm text-gray-600 mt-2">
								* Estimate includes materials and standard hardware. Does not
								include tools, finishing, or labor costs.
							</p>
						</div>
					</div>
				)}
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
										<td>LR-2060-{results.table.extrusions.rail2060Length}</td>
										<td>{results.table.extrusions.qtyRail2060Length}</td>
									</tr>
									<tr>
										<td>2</td>
										<td>
											2060 Linear Rail -{" "}
											{results.table.extrusions.rail2060Width}mm (Width)
										</td>
										<td>LR-2060-{results.table.extrusions.rail2060Width}</td>
										<td>{results.table.extrusions.qtyRail2060Width}</td>
									</tr>
									<tr>
										<td>3</td>
										<td>
											4040 Linear Rail - {results.table.extrusions.rail4040Legs}
											mm (Legs)
										</td>
										<td>LR-4040-{results.table.extrusions.rail4040Legs}</td>
										<td>{results.table.extrusions.qtyRail4040Legs}</td>
									</tr>
									<tr>
										<td>4</td>
										<td>In-Out Corner Bracket - 60mm</td>
										<td>BRAC-IOCNR-60</td>
										<td>{results.table.hardware.IOCNR_60}</td>
									</tr>
									<tr>
										<td>5</td>
										<td>Universal L Brackets - Triple</td>
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
										<td>M5 Cap Head Bolts - 8MM</td>
										<td>BOLT-M5-CAP-008-1PC</td>
										<td>{results.table.hardware.CAP_HEAD_M5_8MM}</td>
									</tr>
									<tr>
										<td>8</td>
										<td>M5 Button Head Screws - 8MM</td>
										<td>SCREWS-M5-BH-8-1</td>
										<td>{results.table.hardware.BUTTON_HEAD_M5_8MM}</td>
									</tr>
									<tr>
										<td>9</td>
										<td>M5 Low Profile Screws - 25MM</td>
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
										<td>In-Out Corner Bracket - 20mm</td>
										<td>BRAC-IOCNR-20</td>
										<td>{results.enclosure.hardware.IOCNR_20}</td>
									</tr>
									<tr>
										<td>2</td>
										<td>In-Out Corner Bracket - 40mm</td>
										<td>BRAC-IOCNR-40</td>
										<td>{results.enclosure.hardware.IOCNR_40}</td>
									</tr>
									<tr>
										<td>3</td>
										<td>In-Out Corner Bracket - 60mm</td>
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
										<td>M5 Cap Head Bolts - 8MM</td>
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
										<td>M5 Button Head Bolts - 8MM</td>
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
										<td>In-Out Corner Bracket - 40mm</td>
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
										<td>M5 Cap Head Bolts - 8MM</td>
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
											<td>M5 Button Head Bolts - 8MM</td>
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
							</div>{" "}
							<h4 className="h6 mt-4 mb-2">
								Door Panels
								<span className="text-muted small ms-2">
									(
									{DoorTypeDisplayNames[config.doorConfig.doorType as DoorType]}{" "}
									Type)
								</span>
							</h4>{" "}
							<div className="alert alert-info small">
								<strong>Door Type Info:</strong>{" "}
								{config.doorConfig.doorType === DoorType.STANDARD &&
									"Standard doors have panels that fit within the frame."}
								{config.doorConfig.doorType === DoorType.BIFOLD &&
									"Bi-Fold doors consist of two panels that fold together."}
								{config.doorConfig.doorType === DoorType.AWNING &&
									"Awning doors mount to the top frame and swing upward."}{" "}
								See the Maker Store documentation for detailed assembly
								instructions.
							</div>
							<div className="table-responsive">
								<table className="table table-striped table-bordered">
									<thead>
										<tr>
											<th>Position</th>
											<th>Width</th>
											<th>Height</th>
											<th>Area</th>
											<th>Notes</th>
										</tr>
									</thead>
									<tbody>
										{results.doors.panels.map((panel, index) => (
											<tr key={index}>
												<td>{panel.position}</td>
												<td>{panel.width}mm</td>
												<td>{panel.height}mm</td>
												<td>
													{(panel.width * panel.height).toLocaleString()} mm² (
													{((panel.width * panel.height) / 1000000).toFixed(3)}{" "}
													m²)
												</td>
												<td className="small">{(panel as any).notes || ""}</td>
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
									{Math.ceil(results.panels?.totalArea || 0).toLocaleString()}{" "}
									mm² ({((results.panels?.totalArea || 0) / 1000000).toFixed(2)}{" "}
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
												{" "}
												<td>{panel.position}</td>
												<td>
													{panel.position === "Top" ||
													panel.position === "Bottom"
														? `${panel.width}mm x ${panel.length}mm`
														: `${panel.width}mm x ${panel.height}mm`}
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
									<strong>Note:</strong> When ordering materials, add some extra
									margin for cutting errors and waste. Recommended: order at
									least 10% more than the calculated area.
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
												{(results.panels?.totalArea || 0).toLocaleString()} mm²
												(
												{((results.panels?.totalArea || 0) / 1000000).toFixed(
													3
												)}{" "}
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
				{/* Enhanced Project Summary with Cost Breakdown */}
				{(results.table || results.enclosure) && (
					<div className="card mt-4">
						<div className="card-header">
							<h3 className="h5 mb-0">Project Summary & Cost Breakdown</h3>
						</div>
						<div className="card-body">
							{/* Configuration Summary */}
							<div className="row mb-4">
								<div className="col-md-6">
									<h4 className="h6 mb-3">Configuration Details</h4>
									<ul className="list-unstyled">
										{config.includeTable && (
											<li className="mb-1">
												<i className="text-success">✓</i> Table:{" "}
												{tableDimensions.length}×{tableDimensions.width}×
												{tableDimensions.height}mm
											</li>
										)}
										{config.includeEnclosure && (
											<li className="mb-1">
												<i className="text-success">✓</i> Enclosure:{" "}
												{enclosureDimensions.length}×{enclosureDimensions.width}
												×{enclosureDimensions.height}mm
											</li>
										)}
										{config.mountEnclosureToTable && (
											<li className="mb-1">
												<i className="text-info">🔗</i> Enclosure mounted to
												table
											</li>
										)}
										{config.includeDoors && (
											<li className="mb-1">
												<i className="text-info">🚪</i> Doors included (
												{getDoorCount()} door{getDoorCount() !== 1 ? "s" : ""})
											</li>
										)}
										{materialConfig.includePanels && (
											<li className="mb-1">
												<i className="text-info">📋</i> Dust panels included (
												{getPanelCount()} panel
												{getPanelCount() !== 1 ? "s" : ""})
											</li>
										)}
									</ul>
								</div>
								<div className="col-md-6">
									<h4 className="h6 mb-3">Material Specifications</h4>
									<ul className="list-unstyled">
										<li className="mb-1">
											<strong>Type:</strong>{" "}
											{materialTypesMap[materialConfig.type]?.name ||
												materialConfig.type}
										</li>
										<li className="mb-1">
											<strong>Thickness:</strong> {materialConfig.thickness}mm
										</li>
										<li className="mb-1">
											<strong>Dimension Type:</strong>{" "}
											{config.isOutsideDimension ? "Outside" : "Inside"}{" "}
											dimensions
										</li>
										<li className="mb-1">
											<strong>Total Area Required:</strong>{" "}
											{getTotalMaterialArea().toFixed(3)} m²
										</li>
									</ul>
								</div>
							</div>{" "}
							{/* Detailed Cost Breakdown */}
							<div className="row">
								<div className="col-12">
									<h4 className="h6 mb-3">Detailed Cost Breakdown</h4>
									<div className="table-responsive">
										<table className="table table-sm table-bordered">
											<thead className="table-light">
												<tr>
													<th>Component</th>
													<th>Quantity</th>
													<th>Unit Cost</th>
													<th>Subtotal</th>
													<th>Notes</th>
												</tr>
											</thead>
											<tbody>
												{/* Table Components */}
												{results.table && (
													<>
														<tr className="table-success">
															<td colSpan={5}>
																<strong>Table Components</strong>
															</td>
														</tr>
														<tr>
															<td>2060 Extrusions (Length)</td>
															<td>
																{results.table.extrusions.qtyRail2060Length} ×{" "}
																{results.table.extrusions.rail2060Length}mm
															</td>
															<td>$0.15/mm</td>
															<td>
																$
																{(
																	(results.table.extrusions.qtyRail2060Length *
																		results.table.extrusions.rail2060Length *
																		0.15) /
																	1000
																).toFixed(2)}
															</td>
															<td>Horizontal frame members</td>
														</tr>
														<tr>
															<td>2060 Extrusions (Width)</td>
															<td>
																{results.table.extrusions.qtyRail2060Width} ×{" "}
																{results.table.extrusions.rail2060Width}mm
															</td>
															<td>$0.15/mm</td>
															<td>
																$
																{(
																	(results.table.extrusions.qtyRail2060Width *
																		results.table.extrusions.rail2060Width *
																		0.15) /
																	1000
																).toFixed(2)}
															</td>
															<td>Horizontal frame members</td>
														</tr>
														<tr>
															<td>4040 Extrusions (Legs)</td>
															<td>
																{results.table.extrusions.qtyRail4040Legs} ×{" "}
																{results.table.extrusions.rail4040Legs}mm
															</td>
															<td>$0.20/mm</td>
															<td>
																$
																{(
																	(results.table.extrusions.qtyRail4040Legs *
																		results.table.extrusions.rail4040Legs *
																		0.2) /
																	1000
																).toFixed(2)}
															</td>
															<td>Table legs</td>
														</tr>
														<tr>
															<td>Table Hardware</td>
															<td>
																{Object.values(results.table.hardware).reduce(
																	(a, b) => a + b,
																	0
																)}{" "}
																pieces
															</td>
															<td>Various</td>
															<td>
																$
																{calculateHardwareCost(
																	results.table.hardware
																).toFixed(2)}
															</td>
															<td>Brackets, screws, fasteners</td>
														</tr>
													</>
												)}

												{/* Enclosure Components */}
												{results.enclosure && (
													<>
														<tr className="table-info">
															<td colSpan={5}>
																<strong>Enclosure Components</strong>
															</td>
														</tr>
														<tr>
															<td>Horizontal Extrusions</td>
															<td>
																4 ×{" "}
																{
																	results.enclosure.extrusions.horizontal.length
																		.size
																}
																mm + 4 ×{" "}
																{
																	results.enclosure.extrusions.horizontal.width
																		.size
																}
																mm
															</td>
															<td>$0.08/mm</td>
															<td>
																$
																{(
																	((4 *
																		results.enclosure.extrusions.horizontal
																			.length.size +
																		4 *
																			results.enclosure.extrusions.horizontal
																				.width.size) *
																		0.08) /
																	1000
																).toFixed(2)}
															</td>
															<td>Frame members</td>
														</tr>
														<tr>
															<td>Vertical Extrusions (2020)</td>
															<td>
																{results.enclosure.extrusions.vertical2020.qty}{" "}
																×{" "}
																{results.enclosure.extrusions.vertical2020.size}
																mm
															</td>
															<td>$0.08/mm</td>
															<td>
																$
																{(
																	(results.enclosure.extrusions.vertical2020
																		.qty *
																		results.enclosure.extrusions.vertical2020
																			.size *
																		0.08) /
																	1000
																).toFixed(2)}
															</td>
															<td>Vertical supports</td>
														</tr>
														<tr>
															<td>Enclosure Hardware</td>
															<td>
																{Object.values(
																	results.enclosure.hardware
																).reduce((a, b) => a + b, 0)}{" "}
																pieces
															</td>
															<td>Various</td>
															<td>
																$
																{calculateHardwareCost(
																	results.enclosure.hardware
																).toFixed(2)}
															</td>
															<td>Corners, brackets, screws</td>
														</tr>
													</>
												)}

												{/* Door Components */}
												{results.doors && (
													<>
														<tr className="table-warning">
															<td colSpan={5}>
																<strong>Door Components</strong>
															</td>
														</tr>
														{results.doors.panels?.map((door, index) => (
															<tr key={`door-${index}`}>
																<td>
																	Door Panel #{index + 1} ({door.position})
																</td>
																<td>
																	{door.width}mm × {door.height}mm
																</td>
																<td>
																	$
																	{getMaterialCostPerSqM(
																		materialConfig.type
																	).toFixed(2)}
																	/m²
																</td>
																<td>
																	$
																	{(
																		((door.width * door.height) / 1000000) *
																		getMaterialCostPerSqM(materialConfig.type)
																	).toFixed(2)}
																</td>
																<td>Access door panel</td>
															</tr>
														))}
														<tr>
															<td>Door Hardware</td>
															<td>{getDoorCount()} sets</td>
															<td>$25.00/set</td>
															<td>${(getDoorCount() * 25).toFixed(2)}</td>
															<td>Hinges, handles, locks</td>
														</tr>
													</>
												)}

												{/* Dust Panels */}
												{results.panels && (
													<>
														<tr className="table-secondary">
															<td colSpan={5}>
																<strong>Dust Containment Panels</strong>
															</td>
														</tr>
														{results.panels.panels?.map((panel, index) => (
															<tr key={`dust-panel-${index}`}>
																<td>
																	Dust Panel #{index + 1} ({panel.position})
																</td>
																<td>
																	{panel.position === "Top" ||
																	panel.position === "Bottom"
																		? `${panel.width}mm × ${panel.length}mm`
																		: `${panel.width}mm × ${panel.height}mm`}
																</td>
																<td>
																	$
																	{getMaterialCostPerSqM(
																		materialConfig.type
																	).toFixed(2)}
																	/m²
																</td>
																<td>
																	$
																	{panel.position === "Top" ||
																	panel.position === "Bottom"
																		? (
																				((panel.width! * panel.length!) /
																					1000000) *
																				getMaterialCostPerSqM(
																					materialConfig.type
																				)
																		  ).toFixed(2)
																		: (
																				((panel.width! * panel.height!) /
																					1000000) *
																				getMaterialCostPerSqM(
																					materialConfig.type
																				)
																		  ).toFixed(2)}
																</td>
																<td>Dust containment panel</td>
															</tr>
														))}
													</>
												)}

												{/* Mounting Hardware */}
												{results.mounting && (
													<>
														<tr className="table-primary">
															<td colSpan={5}>
																<strong>Mounting Hardware</strong>
															</td>
														</tr>
														<tr>
															<td>Table Mount Hardware</td>
															<td>
																{Object.values(
																	results.mounting.hardware
																).reduce((a, b) => a + b, 0)}{" "}
																pieces
															</td>
															<td>Various</td>
															<td>
																$
																{calculateHardwareCost(
																	results.mounting.hardware
																).toFixed(2)}
															</td>
															<td>Enclosure mounting brackets</td>
														</tr>
													</>
												)}

												{/* Totals */}
												<tr className="table-dark">
													<td colSpan={3}>
														<strong>Material Subtotal</strong>
													</td>
													<td>
														<strong>${getMaterialSubtotal().toFixed(2)}</strong>
													</td>
													<td>All materials</td>
												</tr>
												<tr className="table-dark">
													<td colSpan={3}>
														<strong>Hardware Subtotal</strong>
													</td>
													<td>
														<strong>${getHardwareSubtotal().toFixed(2)}</strong>
													</td>
													<td>All hardware</td>
												</tr>
												<tr className="table-dark">
													<td colSpan={3}>
														<strong>Estimated Tax (8%)</strong>
													</td>
													<td>
														<strong>
															${(calculateTotalCost() * 0.08).toFixed(2)}
														</strong>
													</td>
													<td>Estimated sales tax</td>
												</tr>
												<tr className="table-success">
													<td colSpan={3}>
														<strong>ESTIMATED TOTAL</strong>
													</td>
													<td>
														<strong>
															${(calculateTotalCost() * 1.08).toFixed(2)}
														</strong>
													</td>
													<td>Including tax</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>
							{/* Cost Saving Tips */}
							<div className="row mt-4">
								<div className="col-12">
									<div className="alert alert-info">
										<h5 className="alert-heading h6">💡 Cost Saving Tips</h5>
										<ul className="mb-0 small">
											<li>
												Consider buying materials in standard sheet sizes
												(1220×2440mm) to minimize waste
											</li>
											<li>
												Check local suppliers for bulk discounts on materials
											</li>
											<li>Reuse hardware from other projects where possible</li>
											<li>
												Consider alternative materials - MDF is typically
												cheaper than plywood
											</li>
											<li>
												Plan your cuts efficiently to maximize material usage
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);

	/**
	 * Helper functions for cost breakdown calculations
	 */
	function getDoorCount(): number {
		let count = 0;
		if (config.doorConfig.frontDoor) count++;
		if (config.doorConfig.backDoor) count++;
		if (config.doorConfig.leftDoor) count++;
		if (config.doorConfig.rightDoor) count++;
		return count;
	}

	function getPanelCount(): number {
		let count = 0;
		if (materialConfig.panelConfig.top) count++;
		if (materialConfig.panelConfig.bottom) count++;
		if (materialConfig.panelConfig.left) count++;
		if (materialConfig.panelConfig.right) count++;
		if (materialConfig.panelConfig.back) count++;
		if (materialConfig.panelConfig.front) count++;
		return count;
	}
	function getTotalMaterialArea(): number {
		let total = 0;

		// Calculate area from panel materials only (since extrusions don't have totalArea)
		if (results.panels?.totalArea) {
			total += results.panels.totalArea;
		}

		// Calculate door panel areas
		if (results.doors?.panels) {
			results.doors.panels.forEach((door) => {
				total += door.width * door.height;
			});
		}

		return total / 1000000; // Convert to m²
	}

	function getMaterialSubtotal(): number {
		return getTotalMaterialArea() * getMaterialCostPerSqM(materialConfig.type);
	}
	function getHardwareSubtotal(): number {
		let total = 0;

		// Table hardware
		if (results.table?.hardware) {
			total += calculateHardwareCost(results.table.hardware);
		}

		// Enclosure hardware
		if (results.enclosure?.hardware) {
			total += calculateHardwareCost(results.enclosure.hardware);
		}

		// Door hardware
		total += getDoorCount() * 25;

		// Mounting hardware
		if (results.mounting?.hardware) {
			total += calculateHardwareCost(results.mounting.hardware);
		}

		return total;
	}
}
