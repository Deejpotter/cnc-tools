const BinPacking3D = require("binpackingjs").BP3D;
const { Item, Bin, Packer } = BinPacking3D;

import type ShippingItem from "@/interfaces/ShippingItem";
import type ShippingBox from "@/interfaces/ShippingBox";

/**
 * Standard box sizes available for shipping
 * These dimensions are in millimeters and weights in grams
 * Sizes are based on common shipping box dimensions
 */
export const standardBoxes: ShippingBox[] = [
	{
		id: "small",
		name: "Small Box",
		length: 296,
		width: 296,
		height: 8,
		maxWeight: 1000, // 1kg max weight
	},
	{
		id: "medium",
		name: "Medium Box",
		length: 396,
		width: 396,
		height: 16,
		maxWeight: 2000, // 2kg max weight
	},
	{
		id: "large",
		name: "Large Box",
		length: 496,
		width: 496,
		height: 24,
		maxWeight: 3000, // 3kg max weight
	},
];

/**
 * Calculates the best box size for a given set of items using 3D bin packing algorithm
 * This function tries to fit items into increasingly larger boxes until finding one that works
 *
 * @param items - Array of ShippingItems to pack
 * @returns Object containing:
 *  - success: boolean indicating if all items fit
 *  - box: the ShippingBox that fits the items (or null if no fit)
 *  - packedItems: array of successfully packed items
 *  - unfitItems: array of items that couldn't be packed
 */
export function findBestBox(items: ShippingItem[]) {
	// Create a new packer instance for our calculation
	const packer = new Packer();

	// Try each standard box size from smallest to largest
	for (const box of standardBoxes) {
		// Create a bin (box) with our dimensions
		const bin = new Bin(
			box.name,
			box.length,
			box.width,
			box.height,
			box.maxWeight
		);
		packer.addBin(bin);

		// Add each item to the packer
		items.forEach((item) => {
			packer.addItem(
				new Item(item.id, item.length, item.width, item.height, item.weight)
			);
		});

		// Attempt to pack all items
		packer.pack();

		// If all items fit (no unfitItems), we've found our box
		if (packer.unfitItems.length === 0) {
			return {
				success: true,
				box: box,
				packedItems: bin.items,
				unfitItems: [],
			};
		}
	}

	// If we get here, no box could fit all items
	return {
		success: false,
		box: null,
		packedItems: [],
		unfitItems: items,
	};
}
