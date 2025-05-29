/**
 * MultiBoxPackingResult Type Definition
 * Updated: 29/05/2025
 * Author: Deej Potter
 * Description: Represents the complete result of the box packing algorithm.
 * Contains all successful shipments and any items that couldn't fit.
 */

import type { Shipment } from "./Shipment";
import type { default as ShippingItem } from "../mongodb/box-shipping-calculator/ShippingItem";

/**
 * Results from packing items into multiple boxes
 */
export interface MultiBoxPackingResult {
	success: boolean;
	shipments: Shipment[];
	unfitItems: ShippingItem[];
}
