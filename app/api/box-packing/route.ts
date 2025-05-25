/**
 * Box Packing API Route
 * Updated: 25/05/2025
 * Author: Deej Potter
 * Description: API endpoint for box packing calculations.
 * This route receives a list of items and returns the optimal box configuration.
 * Uses the Extreme Point-based 3D bin packing algorithm from BoxCalculations.ts.
 */

import { NextRequest, NextResponse } from "next/server";
import { packItemsIntoMultipleBoxes } from "@/app/box-shipping-calculator/BoxCalculations";

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

		// Call the packing algorithm
		const packingResult = packItemsIntoMultipleBoxes(itemsToPack);

		// Return the result
		return NextResponse.json(packingResult);
	} catch (error) {
		console.error("Error in box packing API:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
