/**
 * Config panel component
 * Updated: 17/05/2025
 * Author: Daniel Potter
 * Description: This component handles the configuration of the table and enclosure calculator.
 * It holds the state and interfaces for the configuration options panel that controls most of the configurable options for the table and enclosure.
 * The sizes for the table and enclosure are passed in as props and they come from the table and enclosure panels.
 */

"use client";

import React from "react";
import type { ConfigPanelProps, DoorConfig } from "types/index";
import type { MaterialConfig } from "types/index";
import { DoorType, DoorTypeDisplayNames } from "types/index";

/**
 * Client component for configuration options
 */
export function ConfigPanel({
	config,
	tableDimensions,
	enclosureDimensions,
	materialConfig,
	handleConfigChange,
	handleTableDimensionChange,
	handleEnclosureDimensionChange,
	handlePanelConfigChange,
	handleMaterialTypeChange,
	handleDoorTypeChange,
	MATERIAL_TYPES,
	MATERIAL_THICKNESS,
}: ConfigPanelProps) {
	return (
		<>
			{/* Configuration Options */}
			<div className="card mb-4">
				<div className="card-header">
					<h2 className="h5 mb-0">Configuration</h2>
				</div>
				<div className="card-body">
					<div className="row g-3">
						<div className="col-md-4">
							<div className="form-check form-switch">
								<input
									className="form-check-input"
									type="checkbox"
									role="switch"
									id="includeTable"
									name="includeTable"
									checked={config.includeTable}
									onChange={handleConfigChange}
								/>
								<label className="form-check-label" htmlFor="includeTable">
									Include Table
								</label>
							</div>
						</div>
						<div className="col-md-4">
							<div className="form-check form-switch">
								<input
									className="form-check-input"
									type="checkbox"
									role="switch"
									id="includeEnclosure"
									name="includeEnclosure"
									checked={config.includeEnclosure}
									onChange={handleConfigChange}
								/>
								<label className="form-check-label" htmlFor="includeEnclosure">
									Include Enclosure
								</label>
							</div>
						</div>{" "}
						{/* Moved "Use Outside Dimensions" here */}
						<div className="col-md-4">
							<div className="form-check form-switch">
								<input
									className="form-check-input"
									type="checkbox"
									role="switch"
									id="isOutsideDimension"
									name="isOutsideDimension"
									checked={config.isOutsideDimension}
									onChange={handleConfigChange}
								/>
								<label
									className="form-check-label"
									htmlFor="isOutsideDimension"
								>
									Use Outside Dimensions
								</label>
							</div>
						</div>
						{config.includeTable && config.includeEnclosure && (
							<div className="col-md-4">
								<div className="form-check form-switch">
									<input
										className="form-check-input"
										type="checkbox"
										id="mountEnclosureToTable"
										name="mountEnclosureToTable" // Handled by handleConfigChange
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
								<div className="form-check form-switch">
									<input
										className="form-check-input"
										type="checkbox"
										id="includeDoors"
										name="includeDoors" // Handled by handleConfigChange
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
								<div className="col-md-4">
									<label htmlFor="doorType" className="form-label">
										Door Type
									</label>
									<select
										className="form-select"
										id="doorType"
										name="doorConfig.doorType" // Special handling in handleConfigChange or use handleDoorTypeChange
										value={config.doorConfig.doorType}
										onChange={handleDoorTypeChange}
									>
										{Object.values(DoorType).map((type) => (
											<option key={type} value={type}>
												{DoorTypeDisplayNames[type]}
											</option>
										))}
									</select>
								</div>
								<div className="col-12">
									<label className="form-label">Door Positions:</label>
									<div className="d-flex flex-wrap">
										{(Object.keys(config.doorConfig) as Array<keyof DoorConfig>)
											.filter((key) => key !== "doorType") // Exclude doorType from checkboxes
											.map((key) => {
												const keyStr = key as string;
												const pos = keyStr.replace("Door", ""); // e.g. frontDoor -> front
												const capitalizedPos =
													pos.charAt(0).toUpperCase() + pos.slice(1);
												return (
													<div className="form-check me-3" key={keyStr}>
														<input
															className="form-check-input"
															type="checkbox"
															id={`doorConfig${capitalizedPos}Door`}
															name={`doorConfig.${keyStr}`} // e.g., doorConfig.frontDoor
															checked={config.doorConfig[key] as boolean} // Assert as boolean
															onChange={handleConfigChange} // General handler should work for doorConfig.key
														/>
														<label
															className="form-check-label"
															htmlFor={`doorConfig${capitalizedPos}Door`}
														>
															{capitalizedPos} Door
														</label>
													</div>
												);
											})}
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
						<h2 className="h5 mb-0">Table Dimensions (mm)</h2>
					</div>
					<div className="card-body">
						{" "}
						<div className="row g-3">
							<div className="col-md-3 col-sm-6">
								<label htmlFor="tableLength" className="form-label">
									Length (mm)
								</label>
								<input
									type="number"
									className="form-control"
									id="tableLength"
									name="length"
									value={tableDimensions.length}
									onChange={handleTableDimensionChange}
									min="0"
								/>
							</div>

							<div className="col-md-3 col-sm-6">
								<label htmlFor="tableWidth" className="form-label">
									Width (mm)
								</label>
								<input
									type="number"
									className="form-control"
									id="tableWidth"
									name="width"
									value={tableDimensions.width}
									onChange={handleTableDimensionChange}
									min="0"
								/>
							</div>

							<div className="col-md-3 col-sm-6">
								<label htmlFor="tableHeight" className="form-label">
									Height (mm)
								</label>
								<input
									type="number"
									className="form-control"
									id="tableHeight"
									name="height"
									value={tableDimensions.height}
									onChange={handleTableDimensionChange}
									min="0"
								/>
							</div>
							{/* Removed individual isOutsideDimension checkbox for table */}
						</div>
					</div>
				</div>
			)}
			{/* Enclosure Dimensions */}
			{config.includeEnclosure && (
				<div className="card mb-4">
					<div className="card-header">
						<h2 className="h5 mb-0">Enclosure Dimensions (mm)</h2>
						{config.includeTable && (
							<small className="text-muted ms-2">
								(Length & Width auto-adjusted if table is included)
							</small>
						)}
					</div>
					<div className="card-body">
						<div className="row g-3">
							<div className="col-md-3 col-sm-6">
								<label htmlFor="enclosureLength" className="form-label">
									Length (mm)
								</label>
								<input
									type="number"
									className="form-control"
									id="enclosureLength"
									name="length"
									value={enclosureDimensions.length}
									onChange={handleEnclosureDimensionChange}
									min="0"
									disabled={config.includeTable} // Disabled if table dictates size
								/>
							</div>
							<div className="col-md-3 col-sm-6">
								<label htmlFor="enclosureWidth" className="form-label">
									Width (mm)
								</label>
								<input
									type="number"
									className="form-control"
									id="enclosureWidth"
									name="width"
									value={enclosureDimensions.width}
									onChange={handleEnclosureDimensionChange}
									min="0"
									disabled={config.includeTable} // Disabled if table dictates size
								/>
							</div>
							<div className="col-md-3 col-sm-6">
								<label htmlFor="enclosureHeight" className="form-label">
									Height (mm)
								</label>
								<input
									type="number"
									className="form-control"
									id="enclosureHeight"
									name="height"
									value={enclosureDimensions.height}
									onChange={handleEnclosureDimensionChange}
									min="0"
								/>
							</div>
							{/* Removed individual isOutsideDimension checkbox for enclosure */}
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
							<div className="col-md-6">
								<label htmlFor="materialType" className="form-label">
									Material Type (All {MATERIAL_THICKNESS}mm Thick)
								</label>
								<select
									className="form-select"
									id="materialType"
									value={materialConfig.type}
									onChange={handleMaterialTypeChange}
								>
									{MATERIAL_TYPES.map((type) => (
										<option key={type.id} value={type.id}>
											{type.name}
										</option>
									))}
								</select>
							</div>
							{/* Removed Material Thickness dropdown */}
						</div>

						{materialConfig.includePanels && (
							<div>
								<label className="form-label">Panel Positions:</label>
								<div className="d-flex flex-wrap">
									{(
										Object.keys(materialConfig.panelConfig) as Array<
											keyof MaterialConfig["panelConfig"]
										>
									).map((key) => {
										const keyStr = key as string;
										const pos =
											keyStr.charAt(0).toUpperCase() + keyStr.slice(1);
										return (
											<div className="form-check me-3" key={keyStr}>
												<input
													className="form-check-input"
													type="checkbox"
													id={`panelConfig${pos}`}
													name={keyStr} // e.g. top, bottom, left - handled by handlePanelConfigChange
													checked={materialConfig.panelConfig[key]}
													onChange={handlePanelConfigChange}
													// Disable front panel if front door is included
													disabled={
														keyStr === "front" &&
														config.includeDoors &&
														config.doorConfig.frontDoor
													}
												/>
												<label
													className="form-check-label"
													htmlFor={`panelConfig${pos}`}
												>
													{pos}
													{keyStr === "front" &&
														config.includeDoors &&
														config.doorConfig.frontDoor &&
														" (Door)"}
												</label>
											</div>
										);
									})}
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
