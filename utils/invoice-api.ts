/**
 * Invoice Processing API Integration
 * Updated: 25/05/25
 * Author: Deej Potter
 * Description: This file provides utility functions to interact with the Invoice Processing API.
 * It abstracts away the API call details and provides a simple interface for invoice processing.
 *
 * CONSOLIDATION NOTE: This file should NOT be extended further.
 * All functionality exists as a copy in app/api/invoice-processing/route.ts.
 * This file is maintained for backward compatibility only.
 * For future changes, please update the route.ts file directly.
 */

import ShippingItem from "@/interfaces/box-shipping-calculator/ShippingItem";

/**
 * Processes an invoice file using the invoice processing API
 *
 * @param invoiceFile The invoice file to process
 * @returns Promise resolving to an array of shipping items
 */
export async function processInvoiceWithAPI(
	invoiceFile: File
): Promise<ShippingItem[]> {
	try {
		const formData = new FormData();
		formData.append("invoice", invoiceFile);

		const response = await fetch("/api/invoice-processing", {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`API error: ${errorData.error || response.statusText}`);
		}

		const data = await response.json();

		// Validate the response format
		if (!Array.isArray(data)) {
			throw new Error(
				"Invalid response format: expected an array of shipping items"
			);
		}

		return data;
	} catch (error) {
		console.error("Error processing invoice:", error);
		throw error;
	}
}

/**
 * Processes extracted invoice text using the invoice processing API
 * This is useful when the PDF is extracted client-side
 *
 * @param invoiceText The extracted text content from the invoice
 * @returns Promise resolving to an array of shipping items
 */
export async function processInvoiceTextWithAPI(
	invoiceText: string
): Promise<ShippingItem[]> {
	try {
		const response = await fetch("/api/invoice-processing", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ invoiceText }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`API error: ${errorData.error || response.statusText}`);
		}

		const data = await response.json();

		// Validate the response format
		if (!Array.isArray(data)) {
			throw new Error(
				"Invalid response format: expected an array of shipping items"
			);
		}

		return data;
	} catch (error) {
		console.error("Error processing invoice text:", error);
		throw error;
	}
}
