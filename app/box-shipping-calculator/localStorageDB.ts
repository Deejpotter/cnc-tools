/**
 * Local Storage Database Implementation
 *
 * This file provides a local storage implementation of the database operations
 * to allow the box-shipping-calculator to work without MongoDB when offline.
 */

import ShippingItem from "@/interfaces/box-shipping-calculator/ShippingItem";
import { DatabaseResponse } from "@/app/actions/mongodb/types";

// Key for storing items in local storage
const STORAGE_KEY = "box-shipping-calculator-items";

// Helper to generate unique IDs
function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Helper to load items from local storage
function loadItems(): ShippingItem[] {
	if (typeof window === "undefined") return [];

	try {
		const itemsJson = localStorage.getItem(STORAGE_KEY);
		return itemsJson ? JSON.parse(itemsJson) : [];
	} catch (error) {
		console.error("Error loading items from local storage:", error);
		return [];
	}
}

// Helper to save items to local storage
function saveItems(items: ShippingItem[]): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch (error) {
		console.error("Error saving items to local storage:", error);
	}
}

/**
 * Get all available items from local storage
 */
export async function getAvailableItems(): Promise<
	DatabaseResponse<ShippingItem[]>
> {
	try {
		const items = loadItems();
		return {
			success: true,
			data: items.filter((item) => !item.deletedAt),
			status: 200,
			message: "Items retrieved successfully from local storage",
		};
	} catch (error) {
		console.error("Error fetching items from local storage:", error);
		return {
			success: false,
			error: "Failed to fetch items from local storage",
			status: 500,
			message:
				error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}

/**
 * Add a new item to local storage
 */
export async function addItemToDatabase(
	item: Omit<ShippingItem, "_id">
): Promise<DatabaseResponse<ShippingItem>> {
	try {
		const items = loadItems();
		const now = new Date().toISOString();

		const newItem: ShippingItem = {
			...item,
			_id: generateId(),
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
		};

		items.push(newItem);
		saveItems(items);

		return {
			success: true,
			data: newItem,
			status: 201,
			message: "Item added successfully to local storage",
		};
	} catch (error) {
		console.error("Error adding item to local storage:", error);
		return {
			success: false,
			error: "Failed to add item to local storage",
			status: 500,
			message:
				error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}

/**
 * Update an existing item in local storage
 */
export async function updateItemInDatabase(
	updatedItem: ShippingItem
): Promise<DatabaseResponse<ShippingItem>> {
	try {
		const items = loadItems();
		const itemIndex = items.findIndex((item) => item._id === updatedItem._id);

		if (itemIndex === -1) {
			return {
				success: false,
				error: "Item not found",
				status: 404,
				message: "No item found with the specified ID",
			};
		}

		const now = new Date().toISOString();
		items[itemIndex] = {
			...updatedItem,
			updatedAt: now,
		};

		saveItems(items);

		return {
			success: true,
			data: items[itemIndex],
			status: 200,
			message: "Item updated successfully in local storage",
		};
	} catch (error) {
		console.error("Error updating item in local storage:", error);
		return {
			success: false,
			error: "Failed to update item in local storage",
			status: 500,
			message:
				error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}

/**
 * Delete an item from local storage (soft delete by setting deletedAt)
 */
export async function deleteItemFromDatabase(
	id: string
): Promise<DatabaseResponse<ShippingItem>> {
	try {
		const items = loadItems();
		const itemIndex = items.findIndex((item) => item._id === id);

		if (itemIndex === -1) {
			return {
				success: false,
				error: "Item not found",
				status: 404,
				message: "No item found with the specified ID",
			};
		}

		const now = new Date().toISOString();
		items[itemIndex] = {
			...items[itemIndex],
			deletedAt: now,
			updatedAt: now,
		};

		saveItems(items);

		return {
			success: true,
			data: items[itemIndex],
			status: 200,
			message: "Item deleted successfully in local storage",
		};
	} catch (error) {
		console.error("Error deleting item from local storage:", error);
		return {
			success: false,
			error: "Failed to delete item from local storage",
			status: 500,
			message:
				error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}

// Initialize with some sample items if storage is empty
export function initializeWithSampleItems(): void {
	if (typeof window === "undefined") return;

	const items = loadItems();
	if (items.length === 0) {
		const sampleItems: ShippingItem[] = [
			{
				_id: generateId(),
				name: "V-Slot Extrusion 2020 - 1.5m",
				sku: "LR-2020-S-1500",
				length: 1500,
				width: 20,
				height: 20,
				weight: 1500,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
			},
			{
				_id: generateId(),
				name: "V-Slot Extrusion 2040 - 1.5m",
				sku: "LR-2040-S-1500",
				length: 1500,
				width: 40,
				height: 20,
				weight: 3000,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
			},
			{
				_id: generateId(),
				name: "V-Slot Extrusion 2080 - 1.0m",
				sku: "LR-2080-S-1000",
				length: 1000,
				width: 80,
				height: 20,
				weight: 4000,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
			},
			{
				_id: generateId(),
				name: "Arduino Mega 2560",
				sku: "ARD-MEGA2560",
				length: 101.6,
				width: 53.3,
				height: 15,
				weight: 37,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
			},
			{
				_id: generateId(),
				name: "Nema 17 Stepper Motor",
				sku: "LS-NEMA17",
				length: 42,
				width: 42,
				height: 40,
				weight: 280,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
			},
		];

		saveItems(sampleItems);
	}
}
