/**
 * Box Packing API Route
 * Updated: 25/05/25
 * Author: Deej Potter
 * Description: API endpoint for box packing calculations.
 * This route receives a list of items and returns the optimal box configuration.
 * Uses the Extreme Point-based 3D bin packing algorithm from BoxCalculations.ts.
 * Optimized for serverless deployment to prevent client-side errors.
 */

import { NextRequest, NextResponse } from "next/server";
// Import directly from relative path to avoid issues with path resolution in serverless
import { packItemsIntoMultipleBoxes } from "../../box-shipping-calculator/BoxCalculations";

// Mark this as edge runtime to optimize for Netlify Edge Functions
export const runtime = "edge";

// Specify preferred regions for better performance
export const preferredRegion = ["iad1"]; // US East for better performance

/**
 * POST handler for box packing calculations
 * @param request The incoming request with items to pack
 * @returns JSON response with packing results
 */
export async function POST(request: NextRequest) {
	try {
		// Parse the request body
		const body = await request.json();
		const itemsToPack = body.items;
		// Validate input
		if (!Array.isArray(itemsToPack)) {
			return NextResponse.json(
				{ error: "Invalid input. Expected an array of items." },
				{ status: 400 }
			);
		}

		if (itemsToPack.length === 0) {
			return NextResponse.json(
				{ error: "Empty input. Please provide at least one item to pack." },
				{ status: 400 }
			);
		}

		// Validate each item has the required dimensions
		const invalidItems = itemsToPack.filter(
			(item) =>
				typeof item.length !== "number" ||
				typeof item.width !== "number" ||
				typeof item.height !== "number" ||
				typeof item.quantity !== "number"
		);

		if (invalidItems.length > 0) {
			return NextResponse.json(
				{
					error:
						"Invalid items found. Each item must have valid length, width, height, and quantity properties.",
					invalidItems: invalidItems.map(
						(item) => item.sku || item.name || "unknown item"
					),
				},
				{ status: 400 }
			);
		}
		// Call the packing algorithm
		const packingResult = packItemsIntoMultipleBoxes(itemsToPack);

		// Return the result
		return NextResponse.json(packingResult);
	} catch (error) {
		console.error("Error in box packing API:", error);

		// Enhanced error response with more details for debugging
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		const errorStack = error instanceof Error ? error.stack : "";

		return NextResponse.json(
			{
				error: "Internal server error",
				message: errorMessage,
				// Only include stack trace in development for security
				...(process.env.NODE_ENV !== "production" && { stack: errorStack }),
			},
			{ status: 500 }
		);
	}
}
