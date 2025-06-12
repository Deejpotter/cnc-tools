/**
 * ShippingItem
 * Updated: 05/13/2025
 * Author: Deej Potter
 * Description: Defines the structure of a shipping item in the database.
 * This interface extends the MongoDocument interface to include standard MongoDB fields.
 */

import { ObjectId } from "mongodb";
import { MongoDocument } from "@/types/mongodb/mongo-types";

/**
 * ShippingItem interface represents an item that can be shipped.
 * This type is GLOBAL and stored in the database. It does NOT include quantity.
 * If you need to track quantity (e.g., for UI state), use SelectedShippingItem below.
 *
 * Example usage:
 *   - Use ShippingItem for all DB/API operations.
 *   - Use SelectedShippingItem for UI state when the user selects items and specifies a quantity.
 */
// The core ShippingItem type is for DB and API use only (no quantity field)
export default interface ShippingItem extends MongoDocument {
	/**
	 * The user-friendly name of the item.
	 * @example "V-Slot Extrusion 2020 - 1.5m"
	 */
	name: string;

	/**
	 * The Maker Store SKU of the item.
	 * @example "LR-2020-S-1500"
	 */
	sku: string;

	/**
	 * The length of the item in millimeters.
	 * @example 100
	 */
	length: number;

	/**
	 * The width of the item in millimeters.
	 * @example 50
	 */
	width: number;

	/**
	 * The height of the item in millimeters.
	 * @example 25
	 */
	height: number;

	/**
	 * The weight of the item in grams.
	 * @example 1500
	 */
	weight: number;
}

/**
 * SelectedShippingItem is used ONLY in the UI state for selected items.
 * It extends ShippingItem and adds a quantity field (not stored in DB).
 */
export interface SelectedShippingItem extends ShippingItem {
	/**
	 * The quantity of the item selected by the user.
	 * @example 3
	 */
	quantity: number; // UI-only, not persisted in DB
}
