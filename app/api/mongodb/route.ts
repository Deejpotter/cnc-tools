/**
 * MongoDB API Route
 * Updated: 25/05/2025
 * Author: Deej Potter
 * Description: Generic API endpoint for MongoDB operations.
 * This route provides a centralized interface for all MongoDB operations across the application.
 * It supports operations on any collection with standard CRUD functionality.
 *
 * NOTE: For client-side MongoDB operations, please use the utilities in /utils/mongodb-api.ts.
 * This route file is for server-side API endpoints only, following Next.js conventions.
 */

import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { connectToDatabase } from "@/app/api/mongodb/client";

/**
 * GET handler for MongoDB
 * Supports querying documents from any collection
 *
 * @param request The incoming request with collection and query parameters
 * @returns JSON response with query results
 */
export async function GET(request: NextRequest) {
	try {
		// Get the query parameters
		const url = new URL(request.url);
		const collection = url.searchParams.get("collection");
		const query = url.searchParams.get("query");
		const limit = parseInt(url.searchParams.get("limit") || "100");
		const skip = parseInt(url.searchParams.get("skip") || "0");

		// Validate required parameters
		if (!collection) {
			return NextResponse.json(
				{ error: "Missing collection parameter" },
				{ status: 400 }
			);
		}

		// Parse the query if provided
		let queryObj = {};
		if (query) {
			try {
				queryObj = JSON.parse(query);
			} catch (error) {
				return NextResponse.json(
					{ error: "Invalid query format. Must be valid JSON." },
					{ status: 400 }
				);
			}
		}

		// Connect to the database
		const { db } = await connectToDatabase();

		// Execute the query
		const results = await db
			.collection(collection)
			.find(queryObj)
			.skip(skip)
			.limit(limit)
			.toArray();

		// Return the results
		return NextResponse.json(results);
	} catch (error) {
		console.error("Error in MongoDB GET API:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

/**
 * POST handler for MongoDB
 * Creates new documents in the specified collection
 *
 * @param request The incoming request with collection and document data
 * @returns JSON response with the created document
 */
export async function POST(request: NextRequest) {
	try {
		// Parse the request body
		const body = await request.json();
		const { collection, document, documents } = body;

		// Validate required parameters
		if (!collection) {
			return NextResponse.json(
				{ error: "Missing collection parameter" },
				{ status: 400 }
			);
		}

		if (!document && !documents) {
			return NextResponse.json(
				{ error: "Missing document(s) to insert" },
				{ status: 400 }
			);
		}

		// Connect to the database
		const { db } = await connectToDatabase();

		let result;

		// Insert single document or multiple documents
		if (document) {
			result = await db.collection(collection).insertOne(document);
			return NextResponse.json({
				acknowledged: result.acknowledged,
				insertedId: result.insertedId,
			});
		} else {
			result = await db.collection(collection).insertMany(documents);
			return NextResponse.json({
				acknowledged: result.acknowledged,
				insertedIds: result.insertedIds,
				insertedCount: result.insertedCount,
			});
		}
	} catch (error) {
		console.error("Error in MongoDB POST API:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

/**
 * PUT handler for MongoDB
 * Updates documents in the specified collection
 *
 * @param request The incoming request with collection, filter and update data
 * @returns JSON response with update results
 */
export async function PUT(request: NextRequest) {
	try {
		// Parse the request body
		const body = await request.json();
		const { collection, filter, update, options } = body;

		// Validate required parameters
		if (!collection) {
			return NextResponse.json(
				{ error: "Missing collection parameter" },
				{ status: 400 }
			);
		}

		if (!filter) {
			return NextResponse.json(
				{ error: "Missing filter for update operation" },
				{ status: 400 }
			);
		}

		if (!update) {
			return NextResponse.json(
				{ error: "Missing update data" },
				{ status: 400 }
			);
		}

		// Process any ObjectId in the filter
		const processedFilter = processObjectIds(filter);

		// Connect to the database
		const { db } = await connectToDatabase();

		// Default options
		const updateOptions = {
			upsert: false,
			...options,
		};

		// Perform the update
		let result;
		if (updateOptions.many) {
			result = await db
				.collection(collection)
				.updateMany(processedFilter, update, { upsert: updateOptions.upsert });
		} else {
			result = await db
				.collection(collection)
				.updateOne(processedFilter, update, { upsert: updateOptions.upsert });
		}

		// Return the results
		return NextResponse.json({
			acknowledged: result.acknowledged,
			matchedCount: result.matchedCount,
			modifiedCount: result.modifiedCount,
			upsertedCount: result.upsertedCount,
			upsertedId: result.upsertedId,
		});
	} catch (error) {
		console.error("Error in MongoDB PUT API:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

/**
 * DELETE handler for MongoDB
 * Removes documents from the specified collection
 *
 * @param request The incoming request with collection and filter data
 * @returns JSON response with deletion results
 */
export async function DELETE(request: NextRequest) {
	try {
		// For DELETE, we need to get the body from the request
		const body = await request.json();
		const { collection, filter, options } = body;

		// Validate required parameters
		if (!collection) {
			return NextResponse.json(
				{ error: "Missing collection parameter" },
				{ status: 400 }
			);
		}

		if (!filter) {
			return NextResponse.json(
				{ error: "Missing filter for delete operation" },
				{ status: 400 }
			);
		}

		// Process any ObjectId in the filter
		const processedFilter = processObjectIds(filter);

		// Connect to the database
		const { db } = await connectToDatabase();

		// Perform the deletion
		let result;
		if (options?.many) {
			result = await db.collection(collection).deleteMany(processedFilter);
		} else {
			result = await db.collection(collection).deleteOne(processedFilter);
		}

		// Return the results
		return NextResponse.json({
			acknowledged: result.acknowledged,
			deletedCount: result.deletedCount,
		});
	} catch (error) {
		console.error("Error in MongoDB DELETE API:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

/**
 * Helper function to process ObjectId strings in filters
 * Converts string _id fields to MongoDB ObjectId
 *
 * @param obj The object to process
 * @returns The processed object with ObjectId conversions
 */
function processObjectIds(obj: any): any {
	if (typeof obj !== "object" || obj === null) {
		return obj;
	}

	// Process arrays
	if (Array.isArray(obj)) {
		return obj.map((item) => processObjectIds(item));
	}

	// Process objects
	const result: any = {};
	for (const key in obj) {
		if (key === "_id" && typeof obj[key] === "string") {
			try {
				result[key] = new ObjectId(obj[key]);
			} catch (e) {
				// If not a valid ObjectId, keep the original value
				result[key] = obj[key];
			}
		} else if (typeof obj[key] === "object" && obj[key] !== null) {
			result[key] = processObjectIds(obj[key]);
		} else {
			result[key] = obj[key];
		}
	}
	return result;
}

/**
 * Utility functions (for internal use only in this file)
 * Client components should import these functions from /utils/mongodb-api.ts
 */
