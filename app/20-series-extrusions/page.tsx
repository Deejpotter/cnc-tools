"use client";
import React, { useState } from "react";
import { calculateOptimalCuts } from "@/utils/20-series-extrusions/cutting-algorithms";
import ExtrusionConfigPanel from "@/components/extrusions/ExtrusionConfigPanel";
import CuttingListTable from "@/components/extrusions/CuttingListTable";
import PriceCalculator from "@/components/extrusions/PriceCalculator";
import ImportParts from "@/components/extrusions/ImportParts";
import { Container } from "@/components/shared";
import type {
	Part,
	Profile,
	Color,
	CutList,
	CuttingResult,
} from "@/types/20-series-extrusions/cutting-types";

const CuttingCalculator = () => {
	const [parts, setParts] = useState<Part[]>([]);
	const [cuttingResult, setCuttingResult] = useState<CuttingResult | null>(
		null
	);
	const [color, setColor] = useState<Color>("S"); // Default color silver
	const [profile, setProfile] = useState<Profile>("20x20"); // Default profile
	const [algorithm, setAlgorithm] = useState<"linear" | "binPacking">("linear");

	// Standard stock lengths for 20 Series Extrusions
	const standardStockLengths = [500, 1000, 1500, 3000];

	// Adds a new part requirement
	const addPart = () => {
		setParts([...parts, { length: 0, quantity: 1 }]);
	};

	// Updates part requirement details
	const updatePart = (index: number, field: keyof Part, value: number) => {
		const updatedParts = parts.map((part, i) =>
			i === index ? { ...part, [field]: value } : part
		);
		setParts(updatedParts);
	};

	// Deletes a part from the list
	const deletePart = (index: number) => {
		setParts(parts.filter((_, i) => i !== index));
	};

	/**
	 * Calculates the optimal cutting pattern
	 */ /**
	 * Calculates the optimal cutting pattern and updates the result
	 */
	const calculateCutList = () => {
		if (parts.length === 0) return;

		try {
			const pricingConfig = {
				basePrice: basePrice[profile],
				customLengthFee: 3, // $3 per custom length
				cutFee: 2, // $2 per cut
				profile,
				color,
			};

			const result = calculateOptimalCuts(
				parts,
				standardStockLengths,
				algorithm,
				pricingConfig
			);
			setCuttingResult(result);
		} catch (error) {
			alert(error instanceof Error ? error.message : "An error occurred");
		}
	};

	// Price per meter for each profile
	const basePrice: { [key in Profile]: number } = {
		"20x20": 19.8,
		"20x40": 28.6,
		"20x60": 37.4,
		"20x80": 46.2,
		"C-beam": 24.2,
		"C-beam HEAVY": 35.2,
	};
	// UI Rendering
	return (
		<Container maxWidth="xl" className="my-4">
			<h2 className="mb-4">20 Series Extrusion Cutting Calculator</h2>
			{/* Configuration Section */}{" "}
			<ExtrusionConfigPanel
				profile={profile}
				color={color}
				onProfileChange={(value) => setProfile(value as Profile)}
				onColorChange={(value) => setColor(value as Color)}
				profiles={[
					{ value: "20x20", label: "20x20" },
					{ value: "20x40", label: "20x40" },
					{ value: "20x60", label: "20x60" },
					{ value: "20x80", label: "20x80" },
					{ value: "C-beam", label: "C-beam" },
					{ value: "C-beam HEAVY", label: "C-beam HEAVY" },
				]}
				colors={[
					{ value: "S", label: "Silver" },
					{ value: "B", label: "Black" },
				]}
			/>
			{/* Import from Invoice */}
			<ImportParts
				onPartsImported={(items) => {
					// Update profile and color from first item if available
					if (items.length > 0) {
						setProfile(items[0].profile as Profile);
						setColor(items[0].color as Color);
					}

					// Convert invoice items to parts
					const newParts = items.map((item) => ({
						length: item.length,
						quantity: item.quantity,
					}));

					setParts(newParts);
				}}
			/>
			{/* Algorithm Selection */}
			<div className="card mb-4">
				<div className="card-body">
					<label className="form-label">Cutting Algorithm</label>
					<select
						className="form-select"
						value={algorithm}
						onChange={(e) =>
							setAlgorithm(e.target.value as "linear" | "binPacking")
						}
					>
						<option value="linear">Linear Cutting</option>
						<option value="binPacking">Bin Packing (Beta)</option>
					</select>
					<small className="form-text text-muted">
						Linear cutting optimizes for minimum waste. Bin packing tries to use
						the least number of stock lengths.
					</small>
				</div>
			</div>
			{/* Parts List */}
			<div className="card mb-4">
				<div className="card-body">
					<h5 className="card-title mb-3">Parts List</h5>
					{parts.map((part, index) => (
						<div key={index} className="row g-3 mb-3 align-items-center">
							<div className="col-md-5">
								<label className="form-label">Length (mm)</label>
								<input
									type="number"
									className="form-control"
									value={part.length || ""}
									onChange={(e) =>
										updatePart(index, "length", parseInt(e.target.value))
									}
									min="1"
								/>
							</div>
							<div className="col-md-5">
								<label className="form-label">Quantity</label>
								<input
									type="number"
									className="form-control"
									value={part.quantity}
									onChange={(e) =>
										updatePart(index, "quantity", parseInt(e.target.value))
									}
									min="1"
								/>
							</div>
							<div className="col-md-2">
								<button
									className="btn btn-danger mt-4"
									onClick={() => deletePart(index)}
								>
									Remove
								</button>
							</div>
						</div>
					))}
					<button className="btn btn-secondary" onClick={addPart}>
						Add Part
					</button>
				</div>
			</div>
			<button
				className="btn btn-primary mb-4"
				onClick={calculateCutList}
				disabled={parts.length === 0}
			>
				Calculate Cuts
			</button>
			{/* Results Section */}
			{cuttingResult && (
				<>
					{/* Summary */}
					<div className="alert alert-info mb-4">
						<strong>Summary:</strong>
						<ul className="mb-0">
							{cuttingResult.sku && (
								<li>
									<strong>SKU:</strong> {cuttingResult.sku}
								</li>
							)}
							<li>Total Length Required: {cuttingResult.totalLength}mm</li>
							<li>
								Total Waste: {cuttingResult.totalWaste}mm (
								{(
									(cuttingResult.totalWaste / cuttingResult.totalLength) *
									100
								).toFixed(1)}
								%)
							</li>
							<li>
								Stock Lengths Used:{" "}
								{Object.entries(cuttingResult.stockLengthsUsed)
									.map(([length, count]) => `${count}x ${length}mm`)
									.join(", ")}
							</li>
						</ul>
					</div>

					{/* Cutting List Table */}
					<CuttingListTable cutList={cuttingResult.cutList} />

					{/* Price Calculator */}
					<PriceCalculator
						cuttingResult={cuttingResult}
						customLengthFee={3}
						cutFee={2}
						basePrice={basePrice[profile]}
					/>
				</>
			)}{" "}
		</Container>
	);
};

export default CuttingCalculator;
