/**
 * Box Calculations
 * Updated: 30/03/25
 * Author: Deej Potter
 * Description: Helper functions for calculating the best box size for shipping items.
 * Uses binpackingjs library for 3D bin packing algorithm.
 * https://github.com/olragon/binpackingjs
 */

const BinPacking3D = require("binpackingjs").BP3D;
const { Item, Bin, Packer } = BinPacking3D;

import type ShippingItem from "@/interfaces/box-shipping-calculator/ShippingItem";
import type ShippingBox from "@/interfaces/box-shipping-calculator/ShippingBox";

/**
 * Standard box sizes available for shipping
 * These dimensions are in millimeters and weights in grams
 * Sizes are based on common shipping box dimensions
 */
export const standardBoxes: ShippingBox[] = [
	{
		_id: "padded satchel",
		name: "Padded Satchel",
		length: 100,
		width: 80,
		height: 20,
		maxWeight: 300, // 300g max weight
	},
	{
		_id: "small satchel",
		name: "Small Satchel",
		length: 240,
		width: 150,
		height: 100,
		maxWeight: 5000, // 5kg max weight
	},
	{
		_id: "small",
		name: "Small Box",
		length: 210,
		width: 170,
		height: 120,
		maxWeight: 25000, // 25kg max weight
	},
	{
		_id: "medium",
		name: "Medium Box",
		length: 300,
		width: 300,
		height: 200,
		maxWeight: 25000, // 25kg max weight
	},
	{
		_id: "large",
		name: "Large Box",
		length: 510,
		width: 120,
		height: 120,
		maxWeight: 25000, // 25kg max weight
	},
	{
		_id: "extra large",
		name: "Extra Large Box",
		length: 1170,
		width: 120,
		height: 120,
		maxWeight: 25000, // 25kg max weight
	},
	{
		_id: "xxl",
		name: "XXL Box",
		length: 1570,
		width: 120,
		height: 120,
		maxWeight: 25000, // 25kg max weight
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
export function findBestBox(itemsToPack: ShippingItem[]): {
	success: boolean;
	box: ShippingBox | null;
	packedItems: ShippingItem[];
	unfitItems: ShippingItem[];
} {
	// Variable to store the best solution found so far.
	// A solution includes the box itself, its volume and length (for preference),
	// and the list of items as they are packed in that box.
	let bestSolution: {
		box: ShippingBox;
		volume: number;
		length: number; // Using length as the secondary sort criterion to prefer less "long" boxes.
		packedItemsList: ShippingItem[];
	} | null = null;

	// Try each standard box size.
	// Instead of returning the first fit, we iterate through all boxes
	// to find the one that best matches the preference (smallest volume, then shortest length).
	for (const currentBox of standardBoxes) {
		// Create a new packer instance for each box to ensure isolation
		const packer = new Packer();

		// Create a bin (representing the current box) with its dimensions and max weight
		// The binpackingjs library expects dimensions in the order: name, width, height, depth, maxWeight.
		// We map our ShippingBox properties as follows:
		// - name: currentBox.name
		// - width: currentBox.width
		// - height: currentBox.height
		// - depth: currentBox.length (treating our box 'length' as the depth for the packer)
		// - maxWeight: currentBox.maxWeight
		const currentBin = new Bin(
			currentBox.name,
			currentBox.width, // Corresponds to binpackingjs Bin's 'width'
			currentBox.height, // Corresponds to binpackingjs Bin's 'height'
			currentBox.length, // Corresponds to binpackingjs Bin's 'depth'
			currentBox.maxWeight
		);
		packer.addBin(currentBin);

		// Log the item details for debugging.
		console.log(
			`[BoxCalc] Attempting to pack into: ${currentBox.name} (Packer Bin dims: W ${currentBin.width}, H ${currentBin.height}, D ${currentBin.length}, MaxW ${currentBin.maxWeight})`
		);
		console.log(
			`[BoxCalc] currentBin raw object after new Bin():`,
			JSON.stringify(currentBin)
		);
		console.log(
			`[BoxCalc] Checking currentBin.depth directly: ${currentBin.depth}`
		);
		console.log(
			`[BoxCalc] Checking currentBin.length directly: ${currentBin.length}`
		);
		// console.log("[BoxCalc] Items to pack (original structure):", JSON.parse(JSON.stringify(itemsToPack)));

		// Add each item to the packer. Each item is duplicated by its quantity.
		itemsToPack.forEach((item) => {
			for (let i = 0; i < (item.quantity || 1); i++) {
				// IMPORTANT: The binpackingjs library's Item constructor typically expects dimensions
				// in the order: name (or id), width, height, depth, weight.
				// We are mapping our ShippingItem properties as follows:
				// - name: unique_id (`${item._id}_${i}`)
				// - width: item.width
				// - height: item.height
				// - depth: item.length (treating our 'length' as the depth for the packer)
				// - weight: item.weight
				const packerItem = new Item(
					`${item._id}_${i}`, // Unique ID for each instance of an item
					item.width, // Corresponds to binpackingjs Item's 'width'
					item.height, // Corresponds to binpackingjs Item's 'height'
					item.length, // Corresponds to binpackingjs Item's 'depth'
					item.weight,
					{
						// Store original item details in metadata for reconstruction
						originalId: item._id, // Keep track of the original item ID
						quantity: 1, // Each packed item instance represents quantity 1
						name: item.name,
						sku: item.sku,
						createdAt: item.createdAt,
						updatedAt: item.updatedAt,
						deletedAt: item.deletedAt,
					}
				);
				packer.addItem(packerItem);
				console.log(
					`[BoxCalc] Added to packer: ${packerItem.name} (Packer Item dims: W ${packerItem.width}, H ${packerItem.height}, D ${packerItem.depth}, Wt ${packerItem.weight})`
				);
			}
		});

		// Attempt to pack all items into the currentBin
		packer.pack();

		// Log the packing results for debugging.
		console.log(`[BoxCalc] Packing result for box: ${currentBox.name}`);
		if (packer.unfitItems.length > 0) {
			console.warn(
				`[BoxCalc] Unfit items for ${currentBox.name}:`,
				JSON.parse(
					JSON.stringify(
						packer.unfitItems.map((item) => ({
							name: item.name,
							w: item.width,
							h: item.height,
							d: item.depth,
						}))
					)
				)
			);
		} else {
			console.log(
				`[BoxCalc] All items fit in ${currentBox.name}. Packed bin items:`,
				JSON.parse(
					JSON.stringify(
						currentBin.items.map((item) => ({
							name: item.name,
							w: item.width,
							h: item.height,
							d: item.depth,
						}))
					)
				)
			);
		}

		// If all items fit (no unfitItems), this box is a potential candidate.
		if (packer.unfitItems.length === 0) {
			const currentVolume =
				currentBox.length * currentBox.width * currentBox.height;
			const currentLength = currentBox.length;

			// Reconstruct the ShippingItem list from the packed items in the bin.
			// The binpackingjs library returns items with their individual instance IDs.
			// We need to aggregate these back based on the original item ID and sum quantities.
			const packedItemsMap = new Map<string, ShippingItem>();
			currentBin.items.forEach((packedBinItem: any) => {
				const originalId = packedBinItem.metadata.originalId;
				if (packedItemsMap.has(originalId)) {
					const existingItem = packedItemsMap.get(originalId)!;
					existingItem.quantity = (existingItem.quantity || 0) + 1;
				} else {
					packedItemsMap.set(originalId, {
						_id: originalId,
						name: packedBinItem.metadata.name,
						length: packedBinItem.length,
						width: packedBinItem.width,
						height: packedBinItem.height,
						weight: packedBinItem.weight,
						quantity: 1, // Initialize with quantity 1 for this instance
						sku: packedBinItem.metadata.sku,
						createdAt: packedBinItem.metadata.createdAt,
						updatedAt: packedBinItem.metadata.updatedAt,
						deletedAt: packedBinItem.metadata.deletedAt,
					});
				}
			});
			const finalPackedItemsList = Array.from(packedItemsMap.values());

			// Now, compare this solution with the best one found so far.
			if (bestSolution === null) {
				// This is the first successful solution.
				bestSolution = {
					box: currentBox,
					volume: currentVolume,
					length: currentLength,
					packedItemsList: finalPackedItemsList,
				};
			} else {
				// If this box has a smaller volume, it's better.
				if (currentVolume < bestSolution.volume) {
					bestSolution = {
						box: currentBox,
						volume: currentVolume,
						length: currentLength,
						packedItemsList: finalPackedItemsList,
					};
				} else if (currentVolume === bestSolution.volume) {
					// If volumes are the same, prefer the one with shorter length.
					if (currentLength < bestSolution.length) {
						bestSolution = {
							box: currentBox,
							volume: currentVolume,
							length: currentLength,
							packedItemsList: finalPackedItemsList,
						};
					}
				}
			}
		}
	}

	// After checking all boxes, if a best solution was found, return it.
	if (bestSolution) {
		return {
			success: true,
			box: bestSolution.box,
			packedItems: bestSolution.packedItemsList,
			unfitItems: [],
		};
	} else {
		// If we get here, no box could fit all items.
		return {
			success: false,
			box: null,
			packedItems: [],
			unfitItems: itemsToPack, // Return the original items as unfit
		};
	}
}
