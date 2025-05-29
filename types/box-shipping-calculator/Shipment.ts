/**
 * Shipment Type Definition
 * Updated: 29/05/2025
 * Author: Deej Potter
 * Description: Represents a single shipment containing a box and its packed items.
 * This is the final output format for displaying packing results to the user.
 */

import type { default as ShippingBox } from "../mongodb/box-shipping-calculator/ShippingBox";
import type { default as ShippingItem } from "../mongodb/box-shipping-calculator/ShippingItem";

/**
 * Single shipment with a box and its packed items
 */
export interface Shipment {
	box: ShippingBox;
	packedItems: ShippingItem[];
}
