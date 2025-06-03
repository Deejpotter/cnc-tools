/**
 * Process Invoices server actions
 * Updated: 02/06/2025
 * Author: Deej Potter
 * Description: Handles invoice processing, including PDF extraction using pdf-ts and AI item extraction.
 * Uses Next.js 14 server actions and OpenAI API for item extraction.
 * Enhanced to support both PDF and text file imports using pdf-ts library.
 */

"use server";

import { OpenAI } from "openai";
import { pdfToText } from "pdf-ts"; // Import pdf-ts for PDF text extraction
import ShippingItem from "@/types/box-shipping-calculator/ShippingItem";
import {
	addItemToDatabase,
	updateItemInDatabase,
	getAllDocuments,
} from "./mongodb/actions";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Type definition for AI extracted item
 */
export interface ExtractedItem {
	name: string;
	sku: string;
	weight: number;
	quantity: number;
}

/**
 * Process invoice file and extract items using AI
 * Enhanced to support both PDF and text files using pdf-ts library
 * @param formData Form data containing the invoice file (PDF or text)
 * @returns Array of shipping items with dimensions
 */
export async function processInvoice(
	formData: FormData
): Promise<ShippingItem[]> {
	try {
		const file = formData.get("invoice") as File;
		if (!file) {
			console.error(
				"No file provided in formData. formData keys:",
				Array.from(formData.keys())
			);
			throw new Error("No file provided");
		}

		console.log(
			`Processing file: ${file.name} (${file.type}, ${file.size} bytes)`
		);

		let textContent: string;

		// Check file type and extract text accordingly
		if (
			file.type === "application/pdf" ||
			file.name.toLowerCase().endsWith(".pdf")
		) {
			// Handle PDF files using pdf-ts
			console.log("Processing PDF file with pdf-ts library");
			try {
				// Convert File to ArrayBuffer for pdf-ts
				const arrayBuffer = await file.arrayBuffer();
				if (!arrayBuffer) {
					throw new Error("Failed to read PDF file as ArrayBuffer");
				}
				const uint8Array = new Uint8Array(arrayBuffer);

				// Extract text from PDF using pdf-ts
				textContent = await pdfToText(uint8Array);
				if (!textContent) {
					throw new Error("pdfToText returned empty or undefined text");
				}
				console.log("PDF text extraction successful");
			} catch (pdfError) {
				console.error("PDF extraction error:", pdfError);
				throw new Error(
					`Failed to extract text from PDF: ${
						pdfError instanceof Error
							? pdfError.message
							: JSON.stringify(pdfError)
					}`
				);
			}
		} else {
			// Handle text files (existing functionality)
			console.log("Processing text file");
			try {
				textContent = await file.text();
				if (!textContent) {
					throw new Error("Text file is empty or unreadable");
				}
			} catch (txtErr) {
				console.error("Text file extraction error:", txtErr);
				throw new Error(
					`Failed to extract text from file: ${
						txtErr instanceof Error ? txtErr.message : JSON.stringify(txtErr)
					}`
				);
			}
		}

		// Defensive: Ensure textContent is a string before accessing .length
		if (typeof textContent !== "string") {
			console.error("Extracted file content is not a string:", textContent);
			throw new Error("Extracted file content is not a string");
		}
		console.log("Extracted text content length:", textContent.length);

		if (!textContent || !textContent.trim()) {
			console.error("File appears to be empty or unreadable after extraction.");
			throw new Error("File appears to be empty or unreadable");
		}

		// Process with AI to extract items (same for both PDF and text)
		let extractedItems: ExtractedItem[] = [];
		try {
			extractedItems = await processWithAI(textContent);
		} catch (aiErr) {
			console.error("AI extraction failed:", aiErr);
			throw new Error(
				"Failed to extract items from invoice text. AI error: " +
					(aiErr instanceof Error ? aiErr.message : JSON.stringify(aiErr))
			);
		}
		// Defensive: Ensure extractedItems is an array
		if (!Array.isArray(extractedItems) || extractedItems.length === 0) {
			console.error(
				"No items found in invoice (AI returned no items or invalid format)"
			);
			throw new Error(
				"No items found in invoice (AI returned no items or invalid format)"
			);
		}

		// Get full ShippingItem objects, either from DB or by creating new ones
		let shippingItemsFromInvoice: ShippingItem[] = [];
		try {
			shippingItemsFromInvoice = await getItemDimensions(extractedItems);
		} catch (dimErr) {
			console.error("Error getting item dimensions:", dimErr);
			throw new Error(
				"Failed to get item dimensions: " +
					(dimErr instanceof Error ? dimErr.message : JSON.stringify(dimErr))
			);
		}
		console.log(
			"Shipping items from invoice processing:",
			shippingItemsFromInvoice
		);

		// The result from getItemDimensions is already Promise<ShippingItem[]>
		return shippingItemsFromInvoice;
	} catch (error) {
		console.error("Invoice processing error (outer catch):", error);
		throw new Error(
			(error instanceof Error ? error.message : JSON.stringify(error)) +
				"\nIf this is a 502 Bad Gateway or TypeError, check server logs for more details."
		);
	}
}

/**
 * Process text content with OpenAI to extract item details
 * Enhanced to work with text extracted from both PDF and text files
 */
async function processWithAI(text: string): Promise<ExtractedItem[]> {
	try {
		// gpt-4o-mini is the recommended model for basic tasks now.
		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content:
						"Extract item details from invoice text. Return only the structured data. Make sure you get the SKU and quantity exactly correct.",
				},
				{
					role: "user",
					content: text,
				},
			],
			functions: [
				{
					name: "process_invoice_items",
					description: "Process and structure invoice items",
					parameters: {
						type: "object",
						properties: {
							items: {
								type: "array",
								items: {
									type: "object",
									properties: {
										name: { type: "string" },
										sku: { type: "string" },
										weight: {
											type: "number",
											description: "Weight in kg",
										},
										quantity: { type: "integer" },
									},
									required: ["name", "sku", "weight", "quantity"],
								},
							},
						},
						required: ["items"],
					},
				},
			],
			function_call: { name: "process_invoice_items" },
			temperature: 0.1,
		});

		// Get the function call from the response.
		const functionCall = response.choices[0].message.function_call;
		if (!functionCall?.arguments) {
			throw new Error("No function call arguments received");
		}

		// Return the parsed items from the function call arguments.
		return JSON.parse(functionCall.arguments).items;
	} catch (error: any) {
		if (
			error?.error?.type === "invalid_request_error" &&
			error?.error?.code === "context_length_exceeded"
		) {
			throw new Error(
				"Invoice text is too long. Please try with a shorter invoice."
			);
		}
		throw new Error("Failed to process invoice with AI");
	}
}

/**
 * Process text content with OpenAI to estimate item dimensions
 * @param items Array of extracted items to estimate dimensions for
 * @returns Array of items with estimated dimensions
 */
async function estimateItemDimensions(
	items: ExtractedItem[]
): Promise<
	Array<ExtractedItem & { length: number; width: number; height: number }>
> {
	try {
		// gpt-4o-mini is the recommended model for basic tasks now.
		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content: `
                        Estimate dimensions for hardware items in millimeters and weights in grams.
                        Consider:
                        - Standard hardware sizes
                        - Packaging for multi-packs
                        - Common engineering dimensions
                        - Item descriptions and SKUs
                        Return conservative estimates that would fit the items.
												
												Here are some weights per mm for common extrusion profiles:
												- 20 x 20mm - 20 Series: 0.49g/mm
												- 20 x 40mm - 20 Series: 0.8g/mm
												- 20 x 60mm - 20 Series: 1.08g/mm
												- 20 x 80mm - 20 Series: 1.56g/mm
												- 40 x 40mm - 20 Series: 1.08g/mm
												- C-beam - 20 Series: 2.065g/mm
												- C-beam HEAVY - 20 Series: 3.31g/mm
												- 40 x 40mm - 40 Series: 1.57g/mm
												- 40 x 80mm - 40 Series: 2.86g/mm
                    `,
				},
				{
					role: "user",
					content: JSON.stringify(items),
				},
			],
			functions: [
				{
					name: "estimate_dimensions",
					description: "Estimate physical dimensions for hardware items",
					parameters: {
						type: "object",
						properties: {
							items: {
								type: "array",
								items: {
									type: "object",
									properties: {
										name: { type: "string" },
										sku: { type: "string" },
										length: {
											type: "number",
											description: "Length in millimeters",
										},
										width: {
											type: "number",
											description: "Width in millimeters",
										},
										height: {
											type: "number",
											description: "Height in millimeters",
										},
										weight: { type: "number" },
										quantity: { type: "integer" },
									},
									required: [
										"name",
										"sku",
										"length",
										"width",
										"height",
										"weight",
										"quantity",
									],
								},
							},
						},
						required: ["items"],
					},
				},
			],
			function_call: { name: "estimate_dimensions" },
			temperature: 0.1, // Keep low for consistent estimates
		});

		const functionCall = response.choices[0].message.function_call;
		if (!functionCall?.arguments) {
			throw new Error("No dimension estimates received");
		}

		return JSON.parse(functionCall.arguments).items;
	} catch (error) {
		console.error("Dimension estimation error:", error);
		// Fallback to default dimensions if estimation fails
		return items.map((item) => ({
			...item,
			length: 50,
			width: 50,
			height: 50,
		}));
	}
}

/**
 * Get dimensions for items, using database first then falling back to AI
 * @param items Array of extracted items
 * @returns Array of items with dimensions, with duplicates removed
 */
async function getItemDimensions(
	itemsFromInvoice: ExtractedItem[]
): Promise<ShippingItem[]> {
	// 1. Aggregate quantities for items with the same SKU from the invoice
	const aggregatedInvoiceItems = new Map<string, ExtractedItem>();
	for (const item of itemsFromInvoice) {
		if (!item.sku || item.sku.trim() === "") {
			console.warn(
				`Invoice item "${item.name}" missing SKU or SKU is empty, cannot process.`
			);
			continue;
		}
		const trimmedSku = item.sku.trim().toUpperCase(); // Standardize SKU to uppercase
		if (aggregatedInvoiceItems.has(trimmedSku)) {
			const existing = aggregatedInvoiceItems.get(trimmedSku)!;
			existing.quantity += item.quantity;
			// Retain the name and weight from the first encountered item for that SKU in the invoice.
		} else {
			// Store with trimmed, uppercase SKU
			aggregatedInvoiceItems.set(trimmedSku, { ...item, sku: trimmedSku });
		}
	}

	// 2. Fetch existing items from DB
	const dbResponse = await getAllDocuments<ShippingItem>("Items");
	const existingDbItems =
		dbResponse.success && dbResponse.data ? dbResponse.data : [];
	const dbItemsBySku = new Map(
		existingDbItems.map((item) => [item.sku.trim().toUpperCase(), item]) // Standardize SKU to uppercase for lookup
	);

	const finalShippingItems: ShippingItem[] = [];

	// 3. Process aggregated invoice items
	// Convert Map iterator to an array to avoid downlevelIteration issues
	for (const invoiceItem of Array.from(aggregatedInvoiceItems.values())) {
		const dbItem = dbItemsBySku.get(invoiceItem.sku); // SKU is already trimmed and uppercased

		if (dbItem) {
			console.log(
				`SKU ${invoiceItem.sku} found in database. Using existing data for item: ${dbItem.name}`
			);
			finalShippingItems.push({
				...dbItem, // Includes _id, name, length, width, height, sku, createdAt, updatedAt, deletedAt from DB
				quantity: invoiceItem.quantity, // Aggregated quantity from the current invoice
				weight: dbItem.weight, // Prioritize DB weight over invoice extracted weight
			});
		} else {
			console.log(
				`SKU ${invoiceItem.sku} not found in database. Estimating dimensions for: ${invoiceItem.name}`
			);
			const [estimatedItemDetails] = await estimateItemDimensions([
				invoiceItem,
			]);

			if (!estimatedItemDetails) {
				console.error(
					`Failed to estimate dimensions for SKU: ${invoiceItem.sku}. Skipping item.`
				);
				continue;
			}

			const newItemDataForDb: Omit<
				ShippingItem,
				"_id" | "createdAt" | "updatedAt" | "deletedAt"
			> & { deletedAt: null | Date } = {
				name: estimatedItemDetails.name,
				sku: estimatedItemDetails.sku.trim().toUpperCase(), // Standardize SKU to uppercase before saving
				length: estimatedItemDetails.length,
				width: estimatedItemDetails.width,
				height: estimatedItemDetails.height,
				weight: estimatedItemDetails.weight,
				deletedAt: null,
			};

			try {
				const creationResponse = await addItemToDatabase(
					newItemDataForDb as Omit<ShippingItem, "_id">
				);

				if (creationResponse.success && creationResponse.data) {
					const newlyAddedItem = creationResponse.data;
					console.log(
						`New item ${newlyAddedItem.name} (SKU: ${newlyAddedItem.sku}) added to database with ID: ${newlyAddedItem._id}`
					);
					finalShippingItems.push({
						...newlyAddedItem,
						quantity: invoiceItem.quantity,
					});
				} else {
					console.error(
						`Failed to add new item SKU ${invoiceItem.sku} to database: ${creationResponse.error}. Using temporary item.`
					);
					const tempId = `temp_${Date.now()}_${invoiceItem.sku}`;
					finalShippingItems.push({
						_id: tempId,
						name: newItemDataForDb.name,
						sku: newItemDataForDb.sku,
						length: newItemDataForDb.length,
						width: newItemDataForDb.width,
						height: newItemDataForDb.height,
						weight: newItemDataForDb.weight,
						quantity: invoiceItem.quantity,
						createdAt: new Date(), // Corrected to Date object
						updatedAt: new Date(), // Corrected to Date object
						deletedAt: null,
					});
				}
			} catch (error) {
				console.error(
					`Exception while adding new item SKU ${invoiceItem.sku} to database:`,
					error
				);
				const tempId = `temp_exc_${Date.now()}_${invoiceItem.sku}`;
				finalShippingItems.push({
					_id: tempId,
					name: newItemDataForDb.name,
					sku: newItemDataForDb.sku,
					length: newItemDataForDb.length,
					width: newItemDataForDb.width,
					height: newItemDataForDb.height,
					weight: newItemDataForDb.weight,
					quantity: invoiceItem.quantity,
					createdAt: new Date(), // Corrected to Date object
					updatedAt: new Date(), // Corrected to Date object
					deletedAt: null,
				});
			}
		}
	}
	return finalShippingItems;
}

/**
 * Error Handling Notes (2025-06-03):
 * - All file extraction and AI steps are wrapped in try/catch with clear error messages.
 * - If a file is missing, not a string, or empty, a descriptive error is thrown.
 * - PDF extraction errors are logged and surfaced with context.
 * - AI extraction and dimension estimation errors are logged and surfaced with context.
 * - All errors are caught at the top level and rethrown with a user-friendly message.
 * - If a 502 Bad Gateway or TypeError occurs, the error message will now include more context for debugging.
 */
