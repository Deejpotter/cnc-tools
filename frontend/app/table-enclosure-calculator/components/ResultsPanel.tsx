/**
 * Results panel component
 * Updated: 17/05/2025
 * Author: Daniel Potter
 * Description: This component displays the results of the table and enclosure calculator.
 * It should take the results and configuration as props and render them in a user-friendly format.
 */

"use client";
import React, { useRef, useCallback } from "react";
import { DoorType, DoorTypeDisplayNames } from "../../../../types";
import type {
	Results,
	TableConfig,
	MaterialConfig,
	Dimensions,
	MaterialType,
} from "../../../../types/index";

interface ResultsPanelProps {
	results: Results;
	config: TableConfig;
	materialConfig: MaterialConfig;
	tableDimensions: Dimensions;
	enclosureDimensions: Dimensions;
	materialTypesMap: Record<string, MaterialType>;
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
}: ResultsPanelProps) {
	const printRef = useRef<HTMLDivElement>(null);

	const handleShareURL = useCallback(() => {
		if (typeof window !== "undefined") {
			const shareableURL = window.location.href;
			navigator.clipboard
				.writeText(shareableURL)
				.then(() => {
					alert("URL copied to clipboard!");
				})
				.catch((error) => {
					console.error("Failed to copy URL:", error);
					alert("Failed to copy URL to clipboard");
				});
		}
	}, []);

	const handlePrintBOM = useCallback(() => {
		if (printRef.current) {
			window.print();
		}
	}, []);

	return (
		<div className="card mb-4" ref={printRef}>
			<div className="card-header d-flex justify-content-between align-items-center">
				<h2 className="h5 mb-0">Bill of Materials</h2>
				<div className="d-flex">
					<button
						className="btn btn-sm btn-outline-primary me-2"
						onClick={handleShareURL}
						disabled={!config.includeTable && !config.includeEnclosure}
						title="Create a shareable link with your current configuration"
					>
						<i className="bi bi-link-45deg me-1"></i> Share Config
					</button>
					<button
						className="btn btn-sm btn-outline-secondary"
						onClick={handlePrintBOM}
						disabled={!config.includeTable && !config.includeEnclosure}
						title="Print bill of materials"
					>
						<i className="bi bi-printer me-1"></i> Print BOM
					</button>
				</div>
			</div>
			<div className="card-body">
				{/* Quick Summary */}
				<div className="alert alert-primary mb-4">
					<h3 className="h6">Project Summary</h3>
					<div className="row">
						{" "}
						{config.includeTable && (
							<div className="col-md-4 mb-2">
								<strong>Table:</strong> {tableDimensions.length}mm ×{" "}
								{tableDimensions.width}mm × {tableDimensions.height}mm
								{config.isOutsideDimension ? " (OD)" : " (ID)"}
							</div>
						)}
						{config.includeEnclosure && (
							<div className="col-md-4 mb-2">
								<strong>Enclosure:</strong> {enclosureDimensions.length}mm ×{" "}
								{enclosureDimensions.width}mm × {enclosureDimensions.height}
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
				{/* Table Results */}
				{results.table &&
					typeof results.table === "object" &&
					"extrusions" in results.table && (
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
												4040 Linear Rail -{" "}
												{results.table.extrusions.rail4040Legs}
												mm (Legs)
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
				{results.enclosure &&
					typeof results.enclosure === "object" &&
					"hardware" in results.enclosure && (
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
				{results.mounting &&
					typeof results.mounting === "object" &&
					"hardware" in results.mounting && (
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
												<td className="small">{panel.notes || ""}</td>
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
			</div>
		</div>
	);
}
