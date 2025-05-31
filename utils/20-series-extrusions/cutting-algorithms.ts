import {
	Part,
	CutList,
	CuttingResult,
	PricingDetails,
	Profile,
	Color,
} from "../../types/20-series-extrusions/cutting-types";

interface PricingConfig {
	basePrice: number; // Price per meter
	customLengthFee: number; // Fee per unique custom length
	cutFee: number; // Fee per cut
	profile: Profile; // Profile type
	color: Color; // Color (for SKU generation)
}

/**
 * Linear Cutting Algorithm
 * This algorithm uses a "First Fit Decreasing" approach where:
 * 1. Parts are sorted by length (descending)
 * 2. Each part is fitted into the first available stock length
 * 3. New stock lengths are added as needed
 */
/**
 * Calculate optimal cuts using a linear cutting algorithm
 * @param parts List of parts to cut
 * @param standardStockLengths Available stock lengths
 * @returns CuttingResult with optimized cuts and total lengths
 */
export function calculateLinearCuts(
	parts: Part[],
	standardStockLengths: number[]
): CuttingResult {
	// Sort parts in decreasing order of length
	const sortedParts = [...parts].sort((a, b) => b.length - a.length);
	const cutList: CutList[] = [];
	const stockLengthsUsed: { [key: number]: number } = {};
	let totalLength = 0;

	// Process each part
	for (let part of sortedParts) {
		for (let i = 0; i < part.quantity; i++) {
			let fitted = false;

			// Find smallest suitable stock length
			const suitableStockLength = standardStockLengths.find(
				(length) => length >= part.length
			);

			if (!suitableStockLength) {
				throw new Error(
					`No suitable stock length for part of length ${part.length}mm`
				);
			}

			// Try to fit in existing cuts
			for (let cut of cutList) {
				if (
					cut.stockLength === suitableStockLength &&
					cut.stockLength - cut.usedLength >= part.length
				) {
					cut.usedLength += part.length;
					cut.cuts.push({ length: part.length, quantity: 1 });
					cut.wastePercentage =
						((cut.stockLength - cut.usedLength) / cut.stockLength) * 100;
					fitted = true;
					break;
				}
			}

			// Create new cut if needed
			if (!fitted) {
				const newCut: CutList = {
					stockLength: suitableStockLength,
					usedLength: part.length,
					cuts: [{ length: part.length, quantity: 1 }],
					wastePercentage:
						((suitableStockLength - part.length) / suitableStockLength) * 100,
				};
				cutList.push(newCut);
				stockLengthsUsed[suitableStockLength] =
					(stockLengthsUsed[suitableStockLength] || 0) + 1;
				totalLength += suitableStockLength;
			}
		}
	}

	// Calculate total waste
	const totalWaste = cutList.reduce(
		(waste, cut) => waste + (cut.stockLength - cut.usedLength),
		0
	);

	return {
		cutList,
		totalWaste,
		totalLength,
		stockLengthsUsed,
	};
}

/**
 * Bin Packing Adaptation for 1D Cutting
 * This algorithm adapts the 3D bin packing logic to work with 1D cuts by:
 * 1. Treating lengths as volumes
 * 2. Using a modified version of the NextFit algorithm
 * 3. Optimizing for minimum waste
 */
export function calculateBinPackingCuts(
	parts: Part[],
	standardStockLengths: number[]
): CuttingResult {
	// Implementation coming in next phase
	// For now, fallback to linear cutting
	return calculateLinearCuts(parts, standardStockLengths);
}

/**
 * Determines the best cutting strategy based on the parts and stock lengths
 * In the future, this will use heuristics to choose between linear and bin packing
 */
/**
 * Calculate pricing details based on cutting result
 */
function calculatePricing(
	result: CuttingResult,
	config: PricingConfig
): PricingDetails {
	// Calculate number of unique custom lengths
	const uniqueCustomLengths = new Set(
		result.cutList.flatMap((cut) => cut.cuts.map((c) => c.length))
	).size;

	// Calculate total number of cuts
	const totalCuts = result.cutList.reduce(
		(total, cut) => total + cut.cuts.length,
		0
	);

	// Calculate material cost (convert mm to meters)
	const materialCost = result.totalLength * (config.basePrice / 1000);

	// Calculate fees
	const customLengthFees = uniqueCustomLengths * config.customLengthFee;
	const cuttingFees = totalCuts * config.cutFee;

	// Calculate totals
	const subtotal = materialCost + customLengthFees + cuttingFees;
	const gst = subtotal * 0.1;
	const total = subtotal + gst;

	return {
		materialCost,
		customLengthFees,
		cuttingFees,
		subtotal,
		gst,
		total,
		uniqueCustomLengths,
		totalCuts,
	};
}

/**
 * Generate SKU for the cutting configuration
 */
function generateSKU(result: CuttingResult, config: PricingConfig): string {
	// Get unique lengths
	const uniqueLengths = [
		...new Set(result.cutList.flatMap((cut) => cut.cuts.map((c) => c.length))),
	].sort((a, b) => a - b);

	// Count quantity for each length
	const lengthCounts = uniqueLengths.map((length) => {
		const quantity = result.cutList.reduce((total, cut) => {
			return total + cut.cuts.filter((c) => c.length === length).length;
		}, 0);
		return `${quantity}x${length}`;
	});

	// Format: LR-P-C-LENGTH where:
	// LR = Linear Cut
	// P = Profile (e.g., 2020 for 20x20)
	// C = Color (S/B)
	// LENGTH = lengths in format QxL (e.g., 2x500)
	const profileCode = config.profile.replace(/[x]/g, "");
	return `LR-${profileCode}-${config.color}-${lengthCounts.join("-")}`;
}

/**
 * Main function to calculate optimal cuts with pricing
 */
export function calculateOptimalCuts(
	parts: Part[],
	standardStockLengths: number[],
	algorithm: "linear" | "binPacking" = "linear",
	pricingConfig?: PricingConfig
): CuttingResult {
	// Calculate cuts using specified algorithm
	let result: CuttingResult;
	if (algorithm === "binPacking") {
		result = calculateBinPackingCuts(parts, standardStockLengths);
	} else {
		result = calculateLinearCuts(parts, standardStockLengths);
	}

	// Add pricing and SKU if config provided
	if (pricingConfig) {
		result.pricing = calculatePricing(result, pricingConfig);
		result.sku = generateSKU(result, pricingConfig);
	}

	return result;
}
