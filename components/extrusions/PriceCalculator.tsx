"use client";
import React from "react";
import { CuttingResult } from "@/types/20-series-extrusions/cutting-types";

interface PriceCalculatorProps {
	cuttingResult: CuttingResult;
	customLengthFee: number; // Fee per custom length ($3)
	cutFee: number; // Fee per cut ($2)
	basePrice: number; // Base price per meter
}

const PriceCalculator: React.FC<PriceCalculatorProps> = ({
	cuttingResult,
	customLengthFee,
	cutFee,
	basePrice,
}) => {
	// Calculate number of unique custom lengths
	const uniqueCustomLengths = new Set(
		cuttingResult.cutList.flatMap((cut) => cut.cuts.map((c) => c.length))
	).size;

	// Calculate total number of cuts
	const totalCuts = cuttingResult.cutList.reduce(
		(total, cut) => total + cut.cuts.length,
		0
	);

	// Calculate material cost
	const materialCost = cuttingResult.totalLength * (basePrice / 1000); // Convert mm to meters

	// Calculate fees
	const customLengthTotal = uniqueCustomLengths * customLengthFee;
	const cutTotal = totalCuts * cutFee;

	// Calculate totals
	const subtotal = materialCost + customLengthTotal + cutTotal;
	const gst = subtotal * 0.1;
	const total = subtotal + gst;

	return (
		<div className="card mb-4">
			<div className="card-header">
				<h5 className="mb-0">Price Breakdown</h5>
			</div>
			<div className="card-body">
				<table className="table table-sm">
					<tbody>
						<tr>
							<td>Material Cost</td>
							<td className="text-end">${materialCost.toFixed(2)}</td>
						</tr>
						<tr>
							<td>
								Custom Length Fee ({uniqueCustomLengths} × ${customLengthFee})
							</td>
							<td className="text-end">${customLengthTotal.toFixed(2)}</td>
						</tr>
						<tr>
							<td>
								Cutting Fee ({totalCuts} cuts × ${cutFee})
							</td>
							<td className="text-end">${cutTotal.toFixed(2)}</td>
						</tr>
						<tr>
							<td>Subtotal</td>
							<td className="text-end">${subtotal.toFixed(2)}</td>
						</tr>
						<tr>
							<td>GST (10%)</td>
							<td className="text-end">${gst.toFixed(2)}</td>
						</tr>
						<tr className="fw-bold">
							<td>Total</td>
							<td className="text-end">${total.toFixed(2)}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default PriceCalculator;
