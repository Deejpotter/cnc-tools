/**
 * PackingBox Type Definition
 * Updated: 29/05/2025
 * Author: Deej Potter
 * Description: Represents a box containing packed items and available packing space.
 * This is used internally by the packing algorithm to track the state of a box during packing.
 */

import type { Point3D } from "./Point3D";
import type { PackedItem } from "./PackedItem";
import type { default as ShippingBox } from "../mongodb/box-shipping-calculator/ShippingBox";

/**
 * Represents a box containing packed items and available packing space
 */
export interface PackingBox {
	box: ShippingBox; // The box being used
	packedItems: PackedItem[]; // Items packed in the box with their positions
	extremePoints: Point3D[]; // Possible positions for placing new items (extreme points)
	remainingWeight: number; // Remaining weight capacity
}
