/**
 * Data API Route
 * Updated: 25/05/2025
 * Author: Deej Potter
 * Description: API endpoint for unified data operations.
 * Provides access to shipping items and user-specific data through the DataService layer.
 *
 * NOTE: For client-side data operations, please use the utilities in /utils/data-api.ts.
 * This route file is for server-side API endpoints only, following Next.js conventions.
 */

import { NextRequest, NextResponse } from "next/server";
import { DatabaseResponse } from "@/app/api/mongodb/types";
import DataService from "@/utils/data/DataService";
import ShippingItem from "@/interfaces/box-shipping-calculator/ShippingItem";

/**
 * GET handler for data operations
 * Supports getting shipping items and user-specific data
 *
 * Query parameters:
 * - operation: "shipping-items" | "user-data" | "sync"
 * - collection: collection name (for user-data operations)
 * - userId: user ID (for user-data operations)
 */
export async function GET(request: NextRequest) {
	try {
		const url = new URL(request.url);
		const operation = url.searchParams.get("operation");
		const collection = url.searchParams.get("collection");
		const userId = url.searchParams.get("userId");

		switch (operation) {
			case "shipping-items":
				// Get all available shipping items
				const items = await DataService.shippingItems.getAvailable();
				return NextResponse.json(items);

			case "user-data":
				// Get user-specific data
				if (!collection || !userId) {
					return NextResponse.json(
						{ error: "Missing collection or userId parameter" },
						{ status: 400 }
					);
				}
				const userData = await DataService.userData.getAll(collection, userId);
				return NextResponse.json(userData);

			case "sync":
				// Force sync with remote database
				try {
					await DataService.sync();
					const response: DatabaseResponse<void> = {
						success: true,
						status: 200,
						message: "Sync successful",
					};
					return NextResponse.json(response);
				} catch (error) {
					const response: DatabaseResponse<void> = {
						success: false,
						status: 500,
						error: "Sync failed",
						message:
							error instanceof Error ? error.message : "Unknown error occurred",
					};
					return NextResponse.json(response, { status: 500 });
				}

			default:
				return NextResponse.json(
					{
						error:
							"Invalid operation. Supported operations: shipping-items, user-data, sync",
					},
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error("Error in data GET API:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

/**
 * POST handler for data operations
 * Supports adding shipping items and user-specific data
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { operation, data, collection, userId } = body;

		switch (operation) {
			case "shipping-item":
				// Add a new shipping item
				if (!data) {
					return NextResponse.json(
						{ error: "Missing item data" },
						{ status: 400 }
					);
				}
				const newItem = await DataService.shippingItems.add(
					data as Omit<ShippingItem, "_id">
				);
				return NextResponse.json(newItem);

			case "user-data":
				// Add user-specific data
				if (!collection || !userId || !data) {
					return NextResponse.json(
						{ error: "Missing collection, userId, or data" },
						{ status: 400 }
					);
				}
				const newUserData = await DataService.userData.add(
					collection,
					userId,
					data
				);
				return NextResponse.json(newUserData);

			default:
				return NextResponse.json(
					{
						error:
							"Invalid operation. Supported operations: shipping-item, user-data",
					},
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error("Error in data POST API:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

/**
 * PUT handler for data operations
 * Supports updating shipping items and user-specific data
 */
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { operation, data, collection, userId, id, update } = body;

		switch (operation) {
			case "shipping-item":
				// Update an existing shipping item
				if (!data) {
					return NextResponse.json(
						{ error: "Missing item data" },
						{ status: 400 }
					);
				}
				const updatedItem = await DataService.shippingItems.update(
					data as ShippingItem
				);
				return NextResponse.json(updatedItem);

			case "user-data":
				// Update user-specific data
				if (!collection || !userId || !id || !update) {
					return NextResponse.json(
						{ error: "Missing collection, userId, id, or update data" },
						{ status: 400 }
					);
				}
				const updatedUserData = await DataService.userData.update(
					collection,
					userId,
					id,
					update
				);
				return NextResponse.json(updatedUserData);

			default:
				return NextResponse.json(
					{
						error:
							"Invalid operation. Supported operations: shipping-item, user-data",
					},
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error("Error in data PUT API:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

/**
 * DELETE handler for data operations
 * Supports soft deleting shipping items and user-specific data
 */
export async function DELETE(request: NextRequest) {
	try {
		const body = await request.json();
		const { operation, id, collection, userId } = body;

		switch (operation) {
			case "shipping-item":
				// Soft delete a shipping item
				if (!id) {
					return NextResponse.json(
						{ error: "Missing item ID" },
						{ status: 400 }
					);
				}
				const deletedItem = await DataService.shippingItems.delete(id);
				return NextResponse.json(deletedItem);

			case "user-data":
				// Delete user-specific data
				if (!collection || !userId || !id) {
					return NextResponse.json(
						{ error: "Missing collection, userId, or id" },
						{ status: 400 }
					);
				}
				const deletedUserData = await DataService.userData.delete(
					collection,
					userId,
					id
				);
				return NextResponse.json(deletedUserData);

			default:
				return NextResponse.json(
					{
						error:
							"Invalid operation. Supported operations: shipping-item, user-data",
					},
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error("Error in data DELETE API:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
