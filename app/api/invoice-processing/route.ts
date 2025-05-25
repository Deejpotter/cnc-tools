/**
 * Invoice Processing API Route
 * Updated: 25/05/2025
 * Author: Deej Potter
 * Description: API endpoint for invoice processing and item extraction.
 * This route processes uploaded invoices, extracts items using AI, and returns shipping items.
 * Uses OpenAI API and MongoDB for data storage/retrieval.
 *
 * NOTE: For client-side invoice processing operations, please use the utilities in /utils/invoice-api.ts.
 * This route file is for server-side API endpoints only, following Next.js conventions.
 */

import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import pdfParse from "pdf-parse";
import ShippingItem from "@/interfaces/box-shipping-calculator/ShippingItem";
// Keep using the utility function for server-side to avoid circular dependencies
import { fetchDocuments, createDocument } from "@/utils/mongodb-api";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "nodejs";

/**
 * Type definition for AI extracted item
 */
interface ExtractedItem {
	name: string;
	sku: string;
	weight: number;
	quantity: number;
}

/**
 * POST handler for invoice processing
 * @param request The incoming request with invoice file data
 * @returns JSON response with extracted shipping items
 */
export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("invoice") as File;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// First try PDF extraction
		const buffer = await file.arrayBuffer();
		const pdfText = await extractPdfText(buffer);

		let textContent: string;

		if (pdfText) {
			console.log("PDF Content:", pdfText);
			textContent = pdfText;
		} else {
			textContent = await file.text();
			console.log("Raw Text Content:", textContent);
		}

		// Process with AI to extract items
		const extractedItems = await processWithAI(textContent);
		if (!extractedItems?.length) {
			return NextResponse.json(
				{ error: "No items found in invoice" },
				{ status: 400 }
			);
		}

		// Get full ShippingItem objects, either from DB or by creating new ones
		const shippingItemsFromInvoice = await getItemDimensions(extractedItems);
		console.log(
			"Shipping items from invoice processing:",
			shippingItemsFromInvoice
		);

		// Return the results
		return NextResponse.json(shippingItemsFromInvoice);
	} catch (error) {
		console.error("Invoice processing error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to process invoice",
			},
			{ status: 500 }
		);
	}
}

/**
 * Extract text content from PDF using pdf-parse
 * Note: The pdf-parse library may produce Buffer() deprecation warnings
 * during build/runtime. These come from the library itself, not our code.
 * We're already using the recommended Buffer.from() method.
 *
 * @param buffer PDF file buffer
 * @returns Extracted text content
 */
async function extractPdfText(buffer: ArrayBuffer): Promise<string | null> {
	try {
		// Convert ArrayBuffer to Buffer for pdf-parse
		// Using Buffer.from() as recommended (not the deprecated Buffer constructor)
		const data = Buffer.from(buffer);

		// Process PDF with pdf-parse library
		const result = await pdfParse(data);

		// Return the text content from the PDF
		return result.text && typeof result.text === "string"
			? result.text.trim() || null
			: null;
	} catch (error) {
		console.error("PDF extraction error:", error);
		return null;
	}
}

/**
 * Process text content with OpenAI to extract item details
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
						"Extract item details from invoice text. Identify product names, SKUs, weights, and quantities. For each item, extract: 1) Complete product name, 2) Exact SKU code, 3) Weight in kg, 4) Quantity. Return only the structured data without explanations.",
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
                        Estimate dimensions for hardware items in millimeters.
                        Consider:
                        - Standard hardware sizes
                        - Packaging for multi-packs
                        - Common engineering dimensions
                        - Item descriptions and SKUs
                        Return conservative estimates that would fit the items.
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
		console.error("Dimension estimation error:", error); // Fallback to default dimensions if estimation fails
		return items.map((item) => ({
			...item,
			length: 50,
			width: 50,
			height: 50,
			weight: item.weight || 1,
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

	// 2. Fetch existing items from DB using the new MongoDB API
	const existingDbItems = await fetchDocuments("Items");
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

			// Note: The database already stores weights in grams as per BoxCalculations.ts,
			// so no conversion needed here
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
			// Ensure all dimensions and weight are valid numbers with fallback values
			const length =
				typeof estimatedItemDetails.length === "number" &&
				!isNaN(estimatedItemDetails.length)
					? estimatedItemDetails.length
					: 50;
			const width =
				typeof estimatedItemDetails.width === "number" &&
				!isNaN(estimatedItemDetails.width)
					? estimatedItemDetails.width
					: 50;
			const height =
				typeof estimatedItemDetails.height === "number" &&
				!isNaN(estimatedItemDetails.height)
					? estimatedItemDetails.height
					: 50;

			// Convert weight from kg to grams (OpenAI returns weights in kg because of the invoice, but box calculations use grams)
			const weightInKg =
				typeof estimatedItemDetails.weight === "number" &&
				!isNaN(estimatedItemDetails.weight)
					? estimatedItemDetails.weight
					: 0.1;
			const weight = weightInKg * 1000; // Convert from kg to g

			// Prepare item data for database storage
			const newItemDataForDb = {
				name: estimatedItemDetails.name,
				sku: estimatedItemDetails.sku.trim().toUpperCase(),
				length,
				width,
				height,
				weight,
				deletedAt: null,
			};

			try {
				// Use the MongoDB API utility for creating a document
				const creationResponse = await createDocument(
					"Items",
					newItemDataForDb
				);

				if (creationResponse.acknowledged && creationResponse.insertedId) {
					// Fetch the newly created document to get the complete item
					const newlyAddedItems = await fetchDocuments("Items", {
						_id: creationResponse.insertedId,
					});
					const newlyAddedItem = newlyAddedItems[0];

					console.log(
						`New item ${newlyAddedItem.name} (SKU: ${newlyAddedItem.sku}) added to database with ID: ${newlyAddedItem._id}`
					);

					finalShippingItems.push({
						...newlyAddedItem,
						quantity: invoiceItem.quantity,
					});
				} else {
					console.error(
						`Failed to add new item SKU ${invoiceItem.sku} to database. Using temporary item.`
					);
					const tempId = `temp_${Date.now()}_${invoiceItem.sku}`;
					finalShippingItems.push({
						_id: tempId,
						...newItemDataForDb,
						quantity: invoiceItem.quantity || 1,
						createdAt: new Date(),
						updatedAt: new Date(),
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
					...newItemDataForDb,
					quantity: invoiceItem.quantity || 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			}
		}
	}
	return finalShippingItems;
}

/**
 * Alternative endpoint to process invoice text without file upload
 * Useful for client-side PDF extraction
 *
 * @param request The incoming request with extracted invoice text
 * @returns JSON response with extracted shipping items
 */
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { invoiceText } = body;

		if (!invoiceText || typeof invoiceText !== "string") {
			return NextResponse.json(
				{ error: "No invoice text provided" },
				{ status: 400 }
			);
		}

		// Process with AI to extract items
		const extractedItems = await processWithAI(invoiceText);
		if (!extractedItems?.length) {
			return NextResponse.json(
				{ error: "No items found in invoice" },
				{ status: 400 }
			);
		}

		// Get full ShippingItem objects, either from DB or by creating new ones
		const shippingItemsFromInvoice = await getItemDimensions(extractedItems);
		console.log(
			"Shipping items from invoice processing:",
			shippingItemsFromInvoice
		);

		return NextResponse.json(shippingItemsFromInvoice);
	} catch (error) {
		console.error("Invoice processing error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to process invoice",
			},
			{ status: 500 }
		);
	}
}
