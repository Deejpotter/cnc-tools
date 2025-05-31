export interface Part {
	length: number;
	quantity: number;
}

export interface Cut {
	length: number;
	quantity: number;
}

export interface CutList {
	stockLength: number;
	usedLength: number;
	cuts: Cut[];
	wastePercentage?: number;
}

export type Profile =
	| "20x20"
	| "20x40"
	| "20x60"
	| "20x80"
	| "C-beam"
	| "C-beam HEAVY";
export type Color = "S" | "B"; // Silver or Black

export interface StockMaterial {
	profile: Profile;
	color: Color;
	standardLengths: number[];
}

export interface PricingDetails {
	materialCost: number;
	customLengthFees: number;
	cuttingFees: number;
	subtotal: number;
	gst: number;
	total: number;
	uniqueCustomLengths: number;
	totalCuts: number;
}

export interface CuttingResult {
	cutList: CutList[];
	totalWaste: number;
	totalLength: number;
	stockLengthsUsed: { [key: number]: number }; // e.g., { 3000: 2, 1500: 1 }
	sku?: string; // Generated SKU for ordering
	pricing?: PricingDetails; // Pricing breakdown if pricing info provided
}
