/**
 * ShippingItem
 * Updated: 05/13/2025
 * Author: Deej Potter
 * Description: Defines the structure of a shipping item in the database.
 * This interface extends the MongoDocument interface to include standard MongoDB fields.
 */

/**
 * Base interface for MongoDB documents
 */
export interface MongoDocument {
	_id?: string;
	createdAt?: string | Date;
	updatedAt?: string | Date;
	deletedAt?: string | Date | null;
}

/**
 * ShippingItem interface represents an item that can be shipped.
 * Extends MongoDocument to include standard MongoDB fields.
 * @extends MongoDocument
 * @example
 * {
 *  _id: "60d5f9b2c3f1a2b3c4d5e6f7",
 * name: "V-Slot Extrusion 2020 - 1.5m",
 * sku: "LR-2020-S-1500",
 * length: 1500,
 * width: 20,
 * height: 20,
 * weight: 1500,
 * createdAt: "2023-10-01T12:00:00Z",
 * updatedAt: "2023-10-01T12:00:00Z",
 * deletedAt: null,
 * quantity: 1
 * }
 */
export default interface ShippingItem extends MongoDocument {
	/**
	 * MongoDB ObjectId as string (optional, for compatibility with backend and UI)
	 */
	_id?: string;
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

	/**
	 * An optional quantity for UI operations only (not stored in database).
	 * Used only for selected items in the box calculation.
	 * @example 5
	 */
	quantity?: number;
}
