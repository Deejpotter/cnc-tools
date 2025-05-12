/**
 * Box Calculations
 * Updated: May 12, 2025
 * Author: Deej Potter
 * Description: Helper functions for calculating the best box size for shipping items.
 * Implements a simplified packing logic without external libraries.
 */

import type ShippingItem from "@/interfaces/box-shipping-calculator/ShippingItem";
import type ShippingBox from "@/interfaces/box-shipping-calculator/ShippingBox";

// Define the interface for multi-box packing results
export interface MultiBoxPackingResult {
	success: boolean;
	shipments: Array<{
		box: ShippingBox;
		packedItems: ShippingItem[];
	}>;
	unfitItems: ShippingItem[];
}

/**
 * Interface to represent how items are arranged in a box
 * This helps us track the actual physical layout of items rather than just using volume
 */
interface BoxArrangement {
	// The box being used
	box: ShippingBox;
	// Items that have been packed into this box
	packedItems: ShippingItem[];
	// Maximum number of items that can fit in the box's cross-section
	maxCrossSectionItems: number;
	// Number of items currently packed in the cross-section
	currentCrossSectionItems: number;
	// Remaining weight capacity in the box
	remainingWeight: number;
}

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
		maxWeight: 300,
	},
	{
		_id: "small satchel",
		name: "Small Satchel",
		length: 240,
		width: 150,
		height: 100,
		maxWeight: 5000,
	},
	{
		_id: "small",
		name: "Small Box",
		length: 190,
		width: 150,
		height: 100,
		maxWeight: 25000,
	},
	{
		_id: "medium",
		name: "Medium Box",
		length: 290,
		width: 290,
		height: 190,
		maxWeight: 25000,
	},
	{
		_id: "large",
		name: "Large Box",
		length: 500,
		width: 100,
		height: 100,
		maxWeight: 25000,
	},
	{
		_id: "extra large",
		name: "Extra Large Box",
		length: 1150,
		width: 100,
		height: 100,
		maxWeight: 25000,
	},
	{
		_id: "xxl",
		name: "XXL Box",
		length: 1570,
		width: 100,
		height: 100,
		maxWeight: 25000,
	},
];

/**
 * Calculates the best box size for a given set of items using a simplified packing logic.
 * This function iterates through all standard box sizes, attempting to pack the items based on:
 * 1. Total weight of items vs. box maximum weight.
 * 2. Individual item dimensions vs. box dimensions (no rotation).
 * 3. Total volume of items vs. box volume (as a heuristic).
 * It selects the smallest suitable box based on volume, then by shortest length if volumes are equal.
 *
 * @param itemsToPack - Array of ShippingItems to pack.
 * @returns An object containing:
 *  - success: boolean indicating if all items were successfully packed into any box.
 *  - box: The ShippingBox that was determined to be the best fit (or null if no fit).
 *  - packedItems: An array of original ShippingItems if a fit is found (as this simple model doesn't alter them).
 *  - unfitItems: An array of original ShippingItems that couldn't be packed if no suitable box was found.
 */
export function findBestBox(itemsToPack: ShippingItem[]): {
	success: boolean;
	box: ShippingBox | null;
	packedItems: ShippingItem[];
	unfitItems: ShippingItem[];
} {
	let bestSolution: {
		box: ShippingBox;
		volume: number; // This will be box volume
		length: number; // Original box length, for tie-breaking
	} | null = null;

	for (const currentBox of standardBoxes) {
		console.log(
			`[BoxCalc-Simple] Evaluating Box ${currentBox.name}. Dimensions: L${currentBox.length} W${currentBox.width} H${currentBox.height}`
		);

		// Rule 1: Check total weight of all items against the box's maximum weight capacity.
		const totalWeightOfItems = itemsToPack.reduce(
			(sum, item) => sum + item.weight * (item.quantity || 1),
			0
		);
		if (totalWeightOfItems > currentBox.maxWeight) {
			console.log(
				`[BoxCalc-Simple] Box ${currentBox.name} failed weight check: items ${totalWeightOfItems}g > box ${currentBox.maxWeight}g`
			);
			continue; // This box is too light, try the next one.
		}

		// Rule 2: Check if each individual item can fit dimensionally (no rotation).
		// This is a basic check assuming items are placed in their standard orientation.
		let allIndividualItemsFitDimensionally = true;
		for (const item of itemsToPack) {
			const itemFits =
				item.length <= currentBox.length &&
				item.width <= currentBox.width &&
				item.height <= currentBox.height;

			if (!itemFits) {
				console.log(
					`[BoxCalc-Simple] Box ${currentBox.name} (Dims: L${currentBox.length} W${currentBox.width} H${currentBox.height}) failed: item '${item.name}' (${item.length}x${item.width}x${item.height}) does not fit in standard orientation.`
				);
				allIndividualItemsFitDimensionally = false;
				break; // If one item doesn't fit, the box is unsuitable.
			}
		}
		if (!allIndividualItemsFitDimensionally) {
			continue; // This box can't fit one or more items, try the next one.
		}

		// Rule 3: Volume Heuristic Check.
		// The total volume of all items should be less than or equal to the box's volume.
		// This is a heuristic; it doesn't guarantee a geometric fit but is a useful quick filter.
		const totalVolumeOfItems = itemsToPack.reduce(
			(sum, item) =>
				sum + item.length * item.width * item.height * (item.quantity || 1),
			0
		);
		// Use original box volume for comparison
		const currentBoxVolume =
			currentBox.length * currentBox.width * currentBox.height;

		if (totalVolumeOfItems > currentBoxVolume) {
			console.log(
				`[BoxCalc-Simple] Box ${currentBox.name} (Vol: ${currentBoxVolume}) failed volume check: items volume ${totalVolumeOfItems} > box volume ${currentBoxVolume}`
			);
			continue; // Total item volume exceeds effective box volume, try the next one.
		}

		// If all checks pass, this box is a potential candidate.
		console.log(
			`[BoxCalc-Simple] Box ${currentBox.name} (Dims: L${currentBox.length} W${currentBox.width} H${currentBox.height}) is a potential fit.`
		);
		const currentVolume = currentBoxVolume; // Use original box volume for comparison
		const originalBoxLength = currentBox.length; // Use original box length for tie-breaking

		// Now, I check if this solution is better than what I've found so far.
		// "Better" means smaller volume, or same volume but shorter original box length.
		if (
			bestSolution === null ||
			currentVolume < bestSolution.volume ||
			(currentVolume === bestSolution.volume &&
				originalBoxLength < bestSolution.length)
		) {
			bestSolution = {
				box: currentBox,
				volume: currentVolume, // Store original box volume
				length: originalBoxLength, // Store original length for tie-breaking
			};
			console.log(`[BoxCalc-Simple] New best solution: ${currentBox.name}`);
		}
	}

	// After checking all standard boxes, if a best solution was found, I return it.
	if (bestSolution) {
		return {
			success: true,
			box: bestSolution.box,
			// In this simplified model, if a box is found, all items are considered "packed".
			// The \`packedItems\` list is simply the original list of items to pack.
			packedItems: itemsToPack,
			unfitItems: [],
		};
	} else {
		// If no suitable box was found after checking all of them.
		console.log("[BoxCalc-Simple] No suitable box found for the items.");
		return {
			success: false,
			box: null,
			packedItems: [],
			unfitItems: itemsToPack, // All original items are considered unfit.
		};
	}
}

/**
 * Helper function to calculate how many items of a specific type can fit in a box,
 * considering different possible orientations.
 *
 * @param item - The item to check
 * @param box - The box to pack into
 * @returns An object containing the maximum number of items that can fit and the optimal orientation
 */
function calculateItemFit(
	item: ShippingItem,
	box: ShippingBox
): {
	maxItems: number;
	orientation: { length: number; width: number; height: number };
} {
	// Try all possible orientations of the item (6 possible ways)
	const orientations = [
		{ length: item.length, width: item.width, height: item.height },
		{ length: item.length, width: item.height, height: item.width },
		{ length: item.width, width: item.length, height: item.height },
		{ length: item.width, width: item.height, height: item.length },
		{ length: item.height, width: item.length, height: item.width },
		{ length: item.height, width: item.width, height: item.length },
	];

	let bestFit = {
		maxItems: 0,
		orientation: orientations[0],
	};

	for (const orientation of orientations) {
		// Skip orientations where the item doesn't fit in any dimension
		if (
			orientation.length > box.length ||
			orientation.width > box.width ||
			orientation.height > box.height
		) {
			continue;
		}

		// Calculate how many items can fit in each dimension
		const lengthCount = Math.floor(box.length / orientation.length);
		const widthCount = Math.floor(box.width / orientation.width);
		const heightCount = Math.floor(box.height / orientation.height);

		// Total number of items that can fit with this orientation
		const itemCount = lengthCount * widthCount * heightCount;

		if (itemCount > bestFit.maxItems) {
			bestFit = {
				maxItems: itemCount,
				orientation,
			};
		}
	}

	return bestFit;
}

/**
 * Calculates how many items of a given dimension can fit in a box's cross-section
 * This is crucial for properly packing long items like extrusions
 *
 * @param item - The item to check
 * @param box - The box to pack into
 * @returns Maximum number of items that can fit in the cross-section
 */
function calculateCrossSectionFit(
	item: ShippingItem,
	box: ShippingBox
): { maxItems: number; bestOrientation: string } {
	// Try different orientations of the item in the box's cross-section
	// We'll check all possible ways to arrange the item's width and height

	// First, determine which dimension is the length (typically the longest dimension)
	// For extrusions, this would be the 1000mm dimension
	const itemDimensions = [item.length, item.width, item.height].sort(
		(a, b) => b - a
	);
	const itemLength = itemDimensions[0]; // Longest dimension
	const itemWidth = itemDimensions[1]; // Second dimension
	const itemHeight = itemDimensions[2]; // Smallest dimension

	// Get the box dimensions and determine which is the length dimension
	const boxDimensions = [box.length, box.width, box.height].sort(
		(a, b) => b - a
	);
	const boxLength = boxDimensions[0]; // Longest dimension
	const boxWidth = boxDimensions[1]; // Second dimension
	const boxHeight = boxDimensions[2]; // Smallest dimension

	// We'll try to arrange the item so its longest dimension aligns with the box's longest dimension
	// Then we calculate how many can fit in the cross-section

	// First arrangement: item's width and height in box's cross-section
	const arrangement1 = {
		orientation: "width x height",
		widthCount: Math.floor(boxWidth / itemWidth),
		heightCount: Math.floor(boxHeight / itemHeight),
		total:
			Math.floor(boxWidth / itemWidth) * Math.floor(boxHeight / itemHeight),
	};

	// Second arrangement: item's width and height flipped in the cross-section
	const arrangement2 = {
		orientation: "height x width",
		widthCount: Math.floor(boxWidth / itemHeight),
		heightCount: Math.floor(boxHeight / itemWidth),
		total:
			Math.floor(boxWidth / itemHeight) * Math.floor(boxHeight / itemWidth),
	};

	// Check if the item's length fits in the box's length
	const lengthFits = itemLength <= boxLength;

	if (!lengthFits) {
		// Item is too long for the box
		return { maxItems: 0, bestOrientation: "none" };
	}

	// Choose the arrangement that fits more items
	if (arrangement1.total >= arrangement2.total) {
		return {
			maxItems: arrangement1.total,
			bestOrientation: `${arrangement1.widthCount}x${arrangement1.heightCount}`,
		};
	} else {
		return {
			maxItems: arrangement2.total,
			bestOrientation: `${arrangement2.widthCount}x${arrangement2.heightCount}`,
		};
	}
}

/**
 * Packs a set of items into multiple boxes if necessary.
 * This advanced algorithm prioritizes packing by length and efficiently fills boxes
 * before creating new ones. Specifically designed to handle long items like extrusions.
 *
 * @param itemsToPack - Array of ShippingItems to pack into one or more boxes
 * @returns A MultiBoxPackingResult object containing the success status, shipments array, and any unfit items
 */
export function packItemsIntoMultipleBoxes(
	itemsToPack: ShippingItem[]
): MultiBoxPackingResult {
	// Handle empty input case
	if (itemsToPack.length === 0) {
		return {
			success: true,
			shipments: [],
			unfitItems: [],
		};
	}

	// First, check if all items are identical (same dimensions)
	// This is a common case for extrusions and we can optimize for it
	const allItemsIdentical = itemsToPack.every((item) => {
		return (
			item.length === itemsToPack[0].length &&
			item.width === itemsToPack[0].width &&
			item.height === itemsToPack[0].height
		);
	});

	// If all items are identical, we can use a more efficient packing algorithm
	if (allItemsIdentical) {
		console.log("[BoxCalc-Advanced] All items are identical - using optimized packing");
		return packIdenticalItems(itemsToPack);
	}

	// If single box packing fails, use our advanced multi-box approach for mixed items
	console.log(
		"[BoxCalc-Advanced] Items are mixed - using general packing algorithm"
	);

	// Create a deep copy of the items to avoid modifying the original list
	// Expand items with quantity > 1 into multiple individual items
	const expandedItems: ShippingItem[] = [];
	itemsToPack.forEach((item) => {
		const quantity = item.quantity || 1;
		for (let i = 0; i < quantity; i++) {
			// Create a new item for each quantity, maintaining the original ID
			expandedItems.push({
				...item,
				quantity: 1, // Set quantity to 1 since we're expanding
			});
		}
	});

	// Sort items by length first (longest first), then by volume if lengths are equal
	expandedItems.sort((a, b) => {
		if (a.length !== b.length) {
			return b.length - a.length; // Descending by length
		}

		const volumeA = a.length * a.width * a.height;
		const volumeB = b.length * b.width * b.height;
		return volumeB - volumeA; // Then by volume
	});

	console.log(
		`[BoxCalc-Advanced] Sorted ${expandedItems.length} items by length (longest first)`
	);

	// Results storage
	const boxArrangements: BoxArrangement[] = [];
	const unpackableItems: ShippingItem[] = [];

	// Process each item one by one
	while (expandedItems.length > 0) {
		const currentItem = expandedItems.shift()!;
		let itemPacked = false;

		// First try to fit the item in an existing box
		for (let i = 0; i < boxArrangements.length; i++) {
			const arrangement = boxArrangements[i];

			// Check if adding this item would exceed the box's weight limit
			const willExceedWeight = currentItem.weight > arrangement.remainingWeight;
			if (willExceedWeight) {
				continue;
			}

			// Check if there's space in the cross-section for another item
			if (arrangement.currentCrossSectionItems < arrangement.maxCrossSectionItems) {
				// Item fits in this box - add it
				arrangement.packedItems.push(currentItem);
				arrangement.currentCrossSectionItems++;
				arrangement.remainingWeight -= currentItem.weight;
				itemPacked = true;
				console.log(
					`[BoxCalc-Advanced] Added item ${
						currentItem.name || currentItem._id
					} to existing box ${arrangement.box.name}. ` +
					`Used ${arrangement.currentCrossSectionItems}/${arrangement.maxCrossSectionItems} cross-section spots.`
				);
				break;
			}
		}

		// If the item couldn't fit in any existing box, create a new one
		if (!itemPacked) {
			// Find the best box for this item by checking which box can fit the most of this item type
			let bestBoxArrangement: { 
				box: ShippingBox; 
				maxItems: number; 
				orientation: string;
			} | null = null;

			for (const box of standardBoxes) {
				// Check if the item fits dimensionally
				const crossSectionResult = calculateCrossSectionFit(currentItem, box);

				// Skip this box if the item doesn't fit at all
				if (crossSectionResult.maxItems === 0) {
					continue;
				}

				// Check weight limit
				if (currentItem.weight > box.maxWeight) {
					continue;
				}

				// If this box fits more items or is the first valid box, select it
				if (!bestBoxArrangement || crossSectionResult.maxItems > bestBoxArrangement.maxItems) {
					bestBoxArrangement = {
						box,
						maxItems: crossSectionResult.maxItems,
						orientation: crossSectionResult.bestOrientation
					};
				} else if (crossSectionResult.maxItems === bestBoxArrangement.maxItems) {
					// If both boxes can fit the same number of items, choose the one with smaller volume
					const currentBoxVolume = box.length * box.width * box.height;
					const bestBoxVolume = 
						bestBoxArrangement.box.length * 
						bestBoxArrangement.box.width * 
						bestBoxArrangement.box.height;
					
					if (currentBoxVolume < bestBoxVolume) {
						bestBoxArrangement = {
							box,
							maxItems: crossSectionResult.maxItems,
							orientation: crossSectionResult.bestOrientation
						};
					}
				}
			}

			if (bestBoxArrangement) {
				// Create a new arrangement with this item
				const newArrangement: BoxArrangement = {
					box: bestBoxArrangement.box,
					packedItems: [currentItem],
					maxCrossSectionItems: bestBoxArrangement.maxItems,
					currentCrossSectionItems: 1,
					remainingWeight: bestBoxArrangement.box.maxWeight - currentItem.weight
				};

				boxArrangements.push(newArrangement);
				itemPacked = true;
				console.log(
					`[BoxCalc-Advanced] Created new box ${bestBoxArrangement.box.name} for item ${currentItem.name || currentItem._id}. ` +
					`This box can fit ${bestBoxArrangement.maxItems} items in a ${bestBoxArrangement.orientation} arrangement.`
				);
			} else {
				// Item can't fit in any available box
				unpackableItems.push(currentItem);
				console.log(`[BoxCalc-Advanced] Item ${currentItem.name || currentItem._id} cannot fit in any available box`);
			}
		}
	}

	// Consolidate items with the same ID back into items with quantities
	const consolidatedShipments = boxArrangements.map(arrangement => {
		const consolidatedItems: { [key: string]: ShippingItem } = {};

		arrangement.packedItems.forEach(item => {
			const itemId = item._id?.toString() || item.name;
			if (!itemId) return;

			if (consolidatedItems[itemId]) {
				consolidatedItems[itemId].quantity = (consolidatedItems[itemId].quantity || 1) + 1;
			} else {
				consolidatedItems[itemId] = { ...item };
			}
		});

		return {
			box: arrangement.box,
			packedItems: Object.values(consolidatedItems)
		};
	});

	// Consolidate unpacked items too
	const consolidatedUnfitItems: { [key: string]: ShippingItem } = {};
	unpackableItems.forEach(item => {
		const itemId = item._id?.toString() || item.name;
		if (!itemId) return;

		if (consolidatedUnfitItems[itemId]) {
			consolidatedUnfitItems[itemId].quantity = (consolidatedUnfitItems[itemId].quantity || 1) + 1;
		} else {
			consolidatedUnfitItems[itemId] = { ...item };
		}
	});

	return {
		success: unpackableItems.length === 0,
		shipments: consolidatedShipments,
		unfitItems: Object.values(consolidatedUnfitItems)
	};
}

/**
 * Special optimized packing for identical items (like 20 extrusions of the same size)
 * This function efficiently distributes items into boxes based on cross-section fit
 * 
 * @param itemsToPack - Array of identical items to pack
 * @returns A MultiBoxPackingResult with the optimal packing solution
 */
function packIdenticalItems(itemsToPack: ShippingItem[]): MultiBoxPackingResult {
	console.log("[BoxCalc-Advanced] Using optimized identical items packing algorithm");

	// Calculate the total quantity of all identical items
	let totalQuantity = 0;
	itemsToPack.forEach(item => {
		totalQuantity += item.quantity || 1;
	});

	// Reference item (they're all the same)
	const referenceItem = { ...itemsToPack[0], quantity: 1 };
	
	// Find the best box type for this item
	let bestBox: ShippingBox | null = null;
	let maxItemsPerBox = 0;
	
	// Find the box that can fit the most items in its cross-section
	for (const box of standardBoxes) {
		const crossSectionResult = calculateCrossSectionFit(referenceItem, box);
		
		// Skip boxes where item doesn't fit
		if (crossSectionResult.maxItems === 0) continue;
		
		// Calculate how many of these items can fit by weight
		const maxItemsByWeight = Math.floor(box.maxWeight / referenceItem.weight);
		
		// The actual capacity is the smaller of space capacity and weight capacity
		const effectiveCapacity = Math.min(crossSectionResult.maxItems, maxItemsByWeight);
		
		// If this box can fit more items or is the first valid option, select it
		if (effectiveCapacity > maxItemsPerBox || !bestBox) {
			bestBox = box;
			maxItemsPerBox = effectiveCapacity;
		} else if (effectiveCapacity === maxItemsPerBox) {
			// If capacity is the same, prefer smaller volume box
			const currentVolume = box.length * box.width * box.height;
			const bestVolume = bestBox.length * bestBox.width * bestBox.height;
			
			if (currentVolume < bestVolume) {
				bestBox = box;
				maxItemsPerBox = effectiveCapacity;
			}
		}
	}
	
	// If no suitable box was found
	if (!bestBox || maxItemsPerBox === 0) {
		return {
			success: false,
			shipments: [],
			unfitItems: itemsToPack
		};
	}
	
	console.log(`[BoxCalc-Advanced] Selected ${bestBox.name} which can fit ${maxItemsPerBox} items per box`);
	
	// Calculate how many boxes we need
	const boxCount = Math.ceil(totalQuantity / maxItemsPerBox);
	
	// Create the shipments
	const shipments = [];
	let remainingQuantity = totalQuantity;
	
	for (let i = 0; i < boxCount; i++) {
		// How many items in this box
		const itemsInThisBox = Math.min(maxItemsPerBox, remainingQuantity);
		remainingQuantity -= itemsInThisBox;
		
		// Create a shipment
		shipments.push({
			box: bestBox,
			packedItems: [{
				...referenceItem,
				quantity: itemsInThisBox
			}]
		});
	}
	
	return {
		success: true,
		shipments,
		unfitItems: []
	};
}
