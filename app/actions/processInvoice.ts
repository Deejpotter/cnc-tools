/**
 * Process Invoices - Mock Implementation
 *
 * This is a simplified mock implementation that returns dummy data
 * instead of actually processing invoice PDFs. This allows the app
 * to work without requiring MongoDB or OpenAI.
 */

"use client";

import ShippingItem from "@/interfaces/box-shipping-calculator/ShippingItem";

/**
 * Mock implementation of invoice processing that returns sample data
 */
export async function processInvoice(
	formData: FormData
): Promise<ShippingItem[]> {
	try {
		const file = formData.get("invoice") as File;
		if (!file) {
			throw new Error("No file provided");
		}

		console.log("Mock processing invoice:", file.name);

		// Return mock data instead of actually processing the PDF
		return [
			{
				_id: generateId(),
				name: "V-Slot Gantry Plate",
				sku: "LR-GP-2040",
				length: 120,
				width: 120,
				height: 4,
				weight: 150,
				quantity: 2,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
			},
			{
				_id: generateId(),
				name: "Nema 23 Stepper Motor",
				sku: "LS-NEMA23",
				length: 56,
				width: 56,
				height: 56,
				weight: 680,
				quantity: 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
			},
			{
				_id: generateId(),
				name: "GT2 Timing Belt (1m)",
				sku: "LR-GT2-6",
				length: 1000,
				width: 6,
				height: 1.5,
				weight: 20,
				quantity: 3,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
			},
		];
	} catch (error) {
		console.error("Invoice processing error:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to process invoice"
		);
	}
}

// Helper to generate unique IDs
function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
