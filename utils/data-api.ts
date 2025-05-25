/**
 * Data API Utilities
 * Updated: 25/05/25
 * Author: Deej Potter
 * Description: Utility functions for interacting with the Data API.
 * Provides type-safe, easy-to-use functions for data operations.
 *
 * CONSOLIDATION NOTE: This file should NOT be extended further.
 * All functionality exists as a copy in app/api/data/route.ts.
 * This file is maintained for backward compatibility only.
 * For future changes, please update the route.ts file directly.
 */

import ShippingItem from "@/interfaces/box-shipping-calculator/ShippingItem";
import { DatabaseResponse } from "@/app/api/mongodb/types";

/**
 * Base API configuration
 */
const DATA_API_BASE = "/api/data";

/**
 * Generic API request function with error handling
 */
async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	try {
		const response = await fetch(endpoint, {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		});

		if (!response.ok) {
			throw new Error(
				`API request failed: ${response.status} ${response.statusText}`
			);
		}

		return await response.json();
	} catch (error) {
		console.error(`API request failed for ${endpoint}:`, error);
		throw error;
	}
}

/**
 * Shipping Items API Functions
 */
export const shippingItemsAPI = {
	/**
	 * Get all available shipping items
	 */
	async getAvailable(): Promise<ShippingItem[]> {
		const url = `${DATA_API_BASE}?operation=shipping-items`;
		return apiRequest<ShippingItem[]>(url);
	},

	/**
	 * Add a new shipping item
	 */
	async add(item: Omit<ShippingItem, "_id">): Promise<ShippingItem> {
		return apiRequest<ShippingItem>(DATA_API_BASE, {
			method: "POST",
			body: JSON.stringify({
				operation: "shipping-item",
				data: item,
			}),
		});
	},

	/**
	 * Update an existing shipping item
	 */
	async update(item: ShippingItem): Promise<ShippingItem> {
		return apiRequest<ShippingItem>(DATA_API_BASE, {
			method: "PUT",
			body: JSON.stringify({
				operation: "shipping-item",
				data: item,
			}),
		});
	},

	/**
	 * Soft delete a shipping item
	 */
	async delete(id: string): Promise<ShippingItem> {
		return apiRequest<ShippingItem>(DATA_API_BASE, {
			method: "DELETE",
			body: JSON.stringify({
				operation: "shipping-item",
				id,
			}),
		});
	},
};

/**
 * User Data API Functions
 */
export const userDataAPI = {
	/**
	 * Get all user-specific data from a collection
	 */
	async getAll<T = any>(collection: string, userId: string): Promise<T[]> {
		const url = `${DATA_API_BASE}?operation=user-data&collection=${encodeURIComponent(
			collection
		)}&userId=${encodeURIComponent(userId)}`;
		return apiRequest<T[]>(url);
	},

	/**
	 * Add user-specific data to a collection
	 */
	async add<T = any>(collection: string, userId: string, data: T): Promise<T> {
		return apiRequest<T>(DATA_API_BASE, {
			method: "POST",
			body: JSON.stringify({
				operation: "user-data",
				collection,
				userId,
				data,
			}),
		});
	},

	/**
	 * Update user-specific data in a collection
	 */
	async update<T = any>(
		collection: string,
		userId: string,
		id: string,
		update: Partial<T>
	): Promise<T> {
		return apiRequest<T>(DATA_API_BASE, {
			method: "PUT",
			body: JSON.stringify({
				operation: "user-data",
				collection,
				userId,
				id,
				update,
			}),
		});
	},

	/**
	 * Delete user-specific data from a collection
	 */
	async delete<T = any>(
		collection: string,
		userId: string,
		id: string
	): Promise<T> {
		return apiRequest<T>(DATA_API_BASE, {
			method: "DELETE",
			body: JSON.stringify({
				operation: "user-data",
				collection,
				userId,
				id,
			}),
		});
	},
};

/**
 * Sync API Functions
 */
export const syncAPI = {
	/**
	 * Force sync with remote database
	 */
	async sync(): Promise<DatabaseResponse<void>> {
		const url = `${DATA_API_BASE}?operation=sync`;
		return apiRequest<DatabaseResponse<void>>(url);
	},
};

/**
 * Convenience export for all data API functions
 */
export const dataAPI = {
	shippingItems: shippingItemsAPI,
	userData: userDataAPI,
	sync: syncAPI,
};

export default dataAPI;
