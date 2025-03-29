"use server";

import { OpenAI } from "openai";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf";
import { TextItem } from "pdfjs-dist/types/src/display/api";
import ShippingItem from "@/interfaces/ShippingItem";
import { MongoClient } from "mongodb";

// Initialize PDF.js worker
const pdfjsWorker = require("pdfjs-dist/legacy/build/pdf.worker.entry");
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI as string);

/**
 * Interface for items in the CncTools database
 */
interface CncToolsItem {
	_id: string;
	sku: string;
	name: string;
	dimensions?: {
		length: number;
		width: number;
		height: number;
	};
	weight?: number;
}

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
 * @param formData Form data containing the invoice file
 * @returns Array of shipping items with dimensions
 */
export async function processInvoice(
	formData: FormData
): Promise<ShippingItem[]> {
	try {
		const file = formData.get("invoice") as File;
		if (!file) {
			throw new Error("No file provided");
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
			throw new Error("No items found in invoice");
		}

		// Estimate dimensions for extracted items
		const itemsWithDimensions = await getItemDimensions(extractedItems);
		console.log("Items with estimated dimensions:", itemsWithDimensions);

		// Convert to shipping items
		return itemsWithDimensions.map((item) => ({
			id: crypto.randomUUID(),
			name: item.name,
			sku: item.sku,
			weight: item.weight * 1000, // Convert kg to g
			quantity: item.quantity,
			length: item.length,
			width: item.width,
			height: item.height,
		}));
	} catch (error) {
		console.error("Invoice processing error:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to process invoice"
		);
	}
}

/**
 * Extract text content from PDF using pdf.js
 * @param buffer PDF file buffer
 * @returns Extracted text content
 */
async function extractPdfText(buffer: ArrayBuffer): Promise<string | null> {
	try {
		const loadingTask = pdfjs.getDocument({
			data: new Uint8Array(buffer),
			useWorkerFetch: false,
			isEvalSupported: false,
		});

		const pdf = await loadingTask.promise;
		let text = "";

		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i);
			const content = await page.getTextContent();
			text +=
				content.items.map((item) => (item as TextItem).str).join(" ") + "\n";
		}

		// Only return if we actually got some text
		return text.trim() || null;
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
		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content:
						"Extract item details from invoice text. Return only the structured data.",
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
 * @returns Array of items with dimensions
 */
async function getItemDimensions(
	items: ExtractedItem[]
): Promise<
	Array<ExtractedItem & { length: number; width: number; height: number }>
> {
	const itemsWithDimensions = await Promise.all(
		items.map(async (item) => {
			// First check database
			const dbItem = await getItemFromDatabase(item.sku);

			if (dbItem?.dimensions) {
				console.log(`Found dimensions for ${item.sku} in database`);
				return {
					...item,
					length: dbItem.dimensions.length,
					width: dbItem.dimensions.width,
					height: dbItem.dimensions.height,
				};
			}

			// If not in database, estimate with AI
			console.log(`Estimating dimensions for ${item.sku}`);
			const [estimatedItem] = await estimateItemDimensions([item]);

			// Store the estimated dimensions
			await updateItemDimensions(estimatedItem);

			return estimatedItem;
		})
	);

	return itemsWithDimensions;
}

/**
 * Fetch item dimensions from CncTools database
 * @param sku The SKU to look up
 * @returns The item with dimensions if found, null if not
 */
async function getItemFromDatabase(sku: string): Promise<CncToolsItem | null> {
	try {
		await client.connect();
		const database = client.db("CncTools");
		const items = database.collection<CncToolsItem>("Items");

		return await items.findOne({ sku });
	} catch (error) {
		console.error("Database lookup error:", error);
		return null;
	} finally {
		await client.close();
	}
}

/**
 * Update or insert item dimensions in database
 * @param item The item to update
 */
async function updateItemDimensions(
	item: ExtractedItem & { length: number; width: number; height: number }
) {
	try {
		await client.connect();
		const database = client.db("CncTools");
		const items = database.collection<CncToolsItem>("Items");

		await items.updateOne(
			{ sku: item.sku },
			{
				$set: {
					dimensions: {
						length: item.length,
						width: item.width,
						height: item.height,
					},
					weight: item.weight,
				},
				$setOnInsert: {
					name: item.name,
				},
			},
			{ upsert: true }
		);
	} catch (error) {
		console.error("Failed to update item dimensions:", error);
	} finally {
		await client.close();
	}
}
