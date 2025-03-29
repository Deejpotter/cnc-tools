"use server";

import { MongoClient, ObjectId } from "mongodb";
import type ShippingItem from "@/interfaces/ShippingItem";

/**
 * Create a singleton MongoDB client instance
 * This prevents creating multiple connections and improves performance
 * The connection will be reused across requests
 */
const client = new MongoClient(process.env.MONGODB_URI as string, {
	// Add connection pooling options
	maxPoolSize: 10,
	minPoolSize: 1,
	maxIdleTimeMS: 30000,
});

// Initialize the connection
let clientPromise: Promise<MongoClient> = client.connect().catch((err) => {
	console.error("Failed to connect to MongoDB:", err);
	throw err;
});

interface DatabaseItem extends ShippingItem {
	_id: ObjectId;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date; // Add soft delete support
}

/**
 * Validates and converts a string ID to MongoDB ObjectId
 * @param id The string ID to validate
 * @throws Error if the ID is invalid
 */
function validateObjectId(id: string): ObjectId {
	try {
		return new ObjectId(id);
	} catch (error) {
		throw new Error(`Invalid ID format: ${id}`);
	}
}

/**
 * Get all available items from the database
 * Returns a list of items with their dimensions and weights
 * Excludes soft-deleted items
 */
export async function getAvailableItems(): Promise<ShippingItem[]> {
	try {
		const database = (await clientPromise).db("CncTools");
		const items = database.collection<DatabaseItem>("Items");

		const result = await items
			.find({ deletedAt: { $exists: false } })
			.toArray();

		return result.map((item) => ({
			id: item._id.toString(),
			name: item.name,
			sku: item.sku,
			length: item.length,
			width: item.width,
			height: item.height,
			weight: item.weight,
			quantity: 1,
		}));
	} catch (error) {
		console.error("Database error:", error);
		throw new Error("Failed to load available items");
	}
}

/**
 * Add a new item to the database
 * Returns the newly created item
 * Validates required fields before insertion
 */
export async function addItemToDatabase(
	item: ShippingItem
): Promise<ShippingItem> {
	try {
		// Validate required fields
		if (
			!item.name ||
			!item.length ||
			!item.width ||
			!item.height ||
			!item.weight
		) {
			throw new Error("Missing required fields");
		}

		const database = (await clientPromise).db("CncTools");
		const items = database.collection<DatabaseItem>("Items");

		const now = new Date();
		const insertResult = await items.insertOne({
			...item,
			_id: new ObjectId(),
			createdAt: now,
			updatedAt: now,
		});

		const newItem = await items.findOne({ _id: insertResult.insertedId });
		if (!newItem) {
			throw new Error("Failed to retrieve newly created item");
		}

		return {
			id: newItem._id.toString(),
			name: newItem.name,
			sku: newItem.sku,
			length: newItem.length,
			width: newItem.width,
			height: newItem.height,
			weight: newItem.weight,
			quantity: 1,
		};
	} catch (error) {
		console.error("Database error:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to add item to database"
		);
	}
}

/**
 * Update an existing item in the database
 * Returns the updated item
 * Validates item existence and required fields
 */
export async function updateItemInDatabase(
	item: ShippingItem
): Promise<ShippingItem> {
	try {
		// Validate required fields
		if (
			!item.id ||
			!item.name ||
			!item.length ||
			!item.width ||
			!item.height ||
			!item.weight
		) {
			throw new Error("Missing required fields");
		}

		// Validate ObjectId format
		const objectId = validateObjectId(item.id);

		const database = (await clientPromise).db("CncTools");
		const items = database.collection<DatabaseItem>("Items");

		const updateResult = await items.findOneAndUpdate(
			{
				_id: objectId,
				deletedAt: { $exists: false },
			},
			{
				$set: {
					name: item.name,
					sku: item.sku,
					length: item.length,
					width: item.width,
					height: item.height,
					weight: item.weight,
					updatedAt: new Date(),
				},
			},
			{ returnDocument: "after" }
		);

		if (!updateResult) {
			throw new Error("Item not found or already deleted");
		}

		return {
			id: updateResult._id.toString(),
			name: updateResult.name,
			sku: updateResult.sku,
			length: updateResult.length,
			width: updateResult.width,
			height: updateResult.height,
			weight: updateResult.weight,
			quantity: 1,
		};
	} catch (error) {
		console.error("Database error:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to update item"
		);
	}
}

/**
 * Soft delete an item from the database
 * Sets deletedAt timestamp instead of removing the record
 */
export async function deleteItemFromDatabase(itemId: string): Promise<void> {
	try {
		// Validate ObjectId format
		const objectId = validateObjectId(itemId);

		const database = (await clientPromise).db("CncTools");
		const items = database.collection<DatabaseItem>("Items");

		const result = await items.updateOne(
			{ _id: objectId },
			{
				$set: {
					deletedAt: new Date(),
					updatedAt: new Date(),
				},
			}
		);

		if (result.matchedCount === 0) {
			throw new Error("Item not found");
		}
	} catch (error) {
		console.error("Database error:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to delete item"
		);
	}
}
