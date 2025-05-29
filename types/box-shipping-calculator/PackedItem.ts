/**
 * PackedItem Type Definition
 * Updated: 29/05/2025
 * Author: Deej Potter
 * Description: Represents an item that has been packed into a box, including its position and orientation.
 */

import type { Point3D } from "./Point3D";
import type ShippingItem from "../mongodb/box-shipping-calculator/ShippingItem";

/**
 * Represents an item that has been packed into a box with position and orientation
 */
export interface PackedItem {
	item: ShippingItem; // The original item
	position: Point3D; // Position of the item within the box (bottom-left-back corner)
	rotation: number; // Rotation index (0-5) representing one of the six possible orientations
	dimensions: {
		// Dimensions after rotation
		width: number;
		height: number;
		depth: number;
	};
}
