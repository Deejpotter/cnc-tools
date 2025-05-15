"use client";
import React from "react";
import {
	TableConfig,
	MaterialConfig,
	DoorType,
	DoorPanelDimensions,
	DoorTypeDisplayNames,
} from "@/app/table-enclosure-calculator/types";
import { Dimensions } from "@/app/table-enclosure-calculator/calcUtils";

interface ConfigPanelProps {
	config: TableConfig;
	tableDimensions: Dimensions;
	enclosureDimensions: Dimensions;
	materialConfig: MaterialConfig;
	handleConfigChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleTableDimensionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleEnclosureDimensionChange: (
		e: React.ChangeEvent<HTMLInputElement>
	) => void;
	handlePanelConfigChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleMaterialTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	handleMaterialThicknessChange: (
		e: React.ChangeEvent<HTMLSelectElement>
	) => void;
	handleDoorTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	MATERIAL_TYPES: Array<{ id: string; name: string; defaultThickness: number }>;
	MATERIAL_THICKNESSES: number[];
}

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
	handleMaterialThicknessChange,
	handleDoorTypeChange,
	MATERIAL_TYPES,
	MATERIAL_THICKNESSES,
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
								<label className="form-check-label" htmlFor="includeEnclosure">
									Include Enclosure
								</label>
							</div>
						</div>{" "}
						{config.includeTable && config.includeEnclosure && (
							<>
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
								<div className="col-md-4">
									<div className="form-check">
										<input
											type="checkbox"
											className="form-check-input"
											id="autoSizeEnclosure"
											name="autoSizeEnclosure"
											checked={config.autoSizeEnclosure}
											onChange={handleConfigChange}
										/>
										<label
											className="form-check-label"
											htmlFor="autoSizeEnclosure"
										>
											<strong>Auto-Size Enclosure to Table</strong>
										</label>
										<div className="form-text">
											Automatically sets enclosure dimensions based on table
											size (height remains configurable)
										</div>
									</div>
								</div>
							</>
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
						)}{" "}
						{config.includeEnclosure && config.includeDoors && (
							<>
								{/* Door Type Selection */}
								<div className="col-md-12 mb-3">
									<label htmlFor="doorType" className="form-label">
										Door Type
									</label>
									<select
										className="form-select"
										id="doorType"
										name="doorType"
										value={config.doorConfig.doorType}
										onChange={handleDoorTypeChange}
									>
										{" "}
										<option value={DoorType.STANDARD}>
											{DoorTypeDisplayNames[DoorType.STANDARD]} Door
										</option>
										<option value={DoorType.BIFOLD}>
											{DoorTypeDisplayNames[DoorType.BIFOLD]} Door
										</option>
										<option value={DoorType.AWNING}>
											{DoorTypeDisplayNames[DoorType.AWNING]} Door
										</option>
									</select>
									<div className="form-text">
										{config.doorConfig.doorType === DoorType.STANDARD &&
											"Standard doors open from one side and are mounted on hinges."}
										{config.doorConfig.doorType === DoorType.BIFOLD &&
											"Bi-fold doors consist of two panels that fold in the middle."}
										{config.doorConfig.doorType === DoorType.AWNING &&
											"Awning doors open upward from the bottom."}
									</div>
								</div>

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
			)}{" "}
			{/* Enclosure Dimensions */}
			{config.includeEnclosure && (
				<div className="card mb-4">
					<div className="card-header">
						<h2 className="h5 mb-0">Enclosure Dimensions</h2>
						{config.includeTable && config.autoSizeEnclosure && (
							<small className="text-muted">
								Length and width will automatically adjust to fit your table
								with a margin
							</small>
						)}
					</div>
					<div className="card-body">
						<div className="row g-3">
							{/* Length input - show as disabled when auto-sizing */}
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
										disabled={config.includeTable && config.autoSizeEnclosure}
										// Add visual indicator for auto-sized values
										style={
											config.includeTable && config.autoSizeEnclosure
												? { backgroundColor: "#f0f8ff" }
												: {}
										}
									/>
									<label htmlFor="enclosureLength">Length (mm)</label>
								</div>
								{config.includeTable && config.autoSizeEnclosure && (
									<small className="text-muted">
										Auto-sized from table length
									</small>
								)}
							</div>

							{/* Width input - show as disabled when auto-sizing */}
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
										disabled={config.includeTable && config.autoSizeEnclosure}
										// Add visual indicator for auto-sized values
										style={
											config.includeTable && config.autoSizeEnclosure
												? { backgroundColor: "#f0f8ff" }
												: {}
										}
									/>
									<label htmlFor="enclosureWidth">Width (mm)</label>
								</div>
								{config.includeTable && config.autoSizeEnclosure && (
									<small className="text-muted">
										Auto-sized from table width
									</small>
								)}
							</div>

							{/* Height input - always enabled even with auto-sizing */}
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
										// Highlight this as it's still editable with auto-sizing
										style={
											config.includeTable && config.autoSizeEnclosure
												? { backgroundColor: "#ffffff", borderColor: "#6c757d" }
												: {}
										}
									/>
									<label htmlFor="enclosureHeight">Height (mm)</label>
								</div>
								{config.includeTable && config.autoSizeEnclosure && (
									<small className="text-info">
										<strong>Height remains configurable</strong>
									</small>
								)}
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
										<div className="form-text">Select panel material type</div>
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
											<label className="form-check-label" htmlFor="panelBottom">
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
											<label className="form-check-label" htmlFor="panelRight">
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
		</>
	);
}
