/**
 * Invoice Processing Integration Tests
 * Updated: 25/05/25
 * Author: Deej Potter
 * Description: Integration tests for the invoice processing functionality.
 * Tests the full flow from PDF upload to shipping item extraction.
 */

import fs from "fs";
import path from "path";
import { processInvoiceWithAPI } from "@/utils/invoice-api";

// Mock fetch for testing
global.fetch = jest.fn();

// Define paths to test invoice PDFs
const TEST_INVOICES = {
	breakingOrder: path.join(__dirname, "data/invoices/BreakingOrder.pdf"),
	plasma3m: path.join(__dirname, "data/invoices/169434 - 3m Plasma.pdf"),
	invoice169402: path.join(__dirname, "data/invoices/invoice-169402.pdf"),
	invoice169241: path.join(__dirname, "data/invoices/invoice-169241.pdf"),
	invoice169116: path.join(__dirname, "data/invoices/invoice-169116.pdf"),
};

describe("Invoice Processing Integration Tests", () => {
	/**
	 * Helper function to create a File object from a test PDF
	 */
	const createInvoiceFile = (filename: string): File => {
		const filePath = path.join(
			process.cwd(),
			"test",
			"data",
			"invoices",
			filename
		);
		const buffer = fs.readFileSync(filePath);
		return new File([buffer], filename, { type: "application/pdf" });
	};

	test("should process a valid Maker Store invoice", async () => {
		// Mock successful API response
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => [
				{
					_id: "1234",
					name: "V-Slot 2040 - 1000mm",
					sku: "LR-2040-S-1000",
					length: 1000,
					width: 40,
					height: 20,
					weight: 1200,
					quantity: 2,
				},
				{
					_id: "5678",
					name: "Tee Nut M5",
					sku: "LR-TN-M5",
					length: 10,
					width: 10,
					height: 5,
					weight: 5,
					quantity: 50,
				},
			],
		});

		// Use our helper to get a real test file
		// This just tests the API call, not the actual PDF parsing
		// since that happens server-side
		const invoiceFile = createInvoiceFile("169434 - 3m Plasma.pdf");

		const result = await processInvoiceWithAPI(invoiceFile);

		// Verify API was called correctly
		expect(global.fetch).toHaveBeenCalledWith(
			"/api/invoice-processing",
			expect.any(Object)
		);

		// Verify results
		expect(result).toHaveLength(2);
		expect(result[0].sku).toBe("LR-2040-S-1000");
		expect(result[1].quantity).toBe(50);
	});

	test("should handle API errors gracefully", async () => {
		// Mock a failed API response
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
			json: async () => ({ error: "Failed to process invoice" }),
		});

		const invoiceFile = createInvoiceFile("169434 - 3m Plasma.pdf");

		// The API should throw an error
		await expect(processInvoiceWithAPI(invoiceFile)).rejects.toThrow();
	});
});
