/**
 * Box Shipping Calculator End-to-End Tests
 * Updated: 25/05/25
 * Author: Deej Potter
 * Description: End-to-end tests for the Box Shipping Calculator.
 * Tests the full flow from invoice upload to box calculation.
 */

import { test, expect } from "@playwright/test";
import path from "path";

// Define paths to test invoice PDFs for easy reference
const TEST_INVOICES = {
	breakingOrder: path.join(
		__dirname,
		"../test/data/invoices/BreakingOrder.pdf"
	),
	plasma3m: path.join(
		__dirname,
		"../test/data/invoices/169434 - 3m Plasma.pdf"
	),
	invoice169402: path.join(
		__dirname,
		"../test/data/invoices/invoice-169402.pdf"
	),
	invoice169241: path.join(
		__dirname,
		"../test/data/invoices/invoice-169241.pdf"
	),
	invoice169116: path.join(
		__dirname,
		"../test/data/invoices/invoice-169116.pdf"
	),
};

// These tests require a running server instance
// They test the complete flow from invoice upload to box calculation

test.describe("Box Shipping Calculator E2E", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the box shipping calculator page
		await page.goto("/box-shipping-calculator");
		// Wait for the page to load completely
		await page.waitForSelector('h1:has-text("Box Shipping Calculator")');
		// Ensure the file input is ready
		await page.waitForSelector('input[type="file"]', { state: "attached" });
	});

	test("should upload an invoice and calculate boxes", async ({ page }) => {
		// Path to test invoice - using the 3m Plasma invoice
		const invoicePath = TEST_INVOICES.plasma3m;

		// Upload the invoice with better error handling
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(invoicePath);

		// Wait for processing to complete with extended timeout
		await page.waitForSelector("text=Successfully processed invoice", {
			timeout: 15000,
		});

		// Verify items were added from the invoice
		const itemsTable = page.locator(".selected-items-table");
		await expect(itemsTable).toBeVisible();

		// Verify at least one item is present with specific content
		const firstItem = itemsTable.locator("tbody tr").first();
		await expect(firstItem).toBeVisible();

		// Additional verification: check that item data is populated
		const itemName = firstItem.locator("td").first();
		await expect(itemName).not.toBeEmpty();

		// Click calculate button and wait for it to be enabled
		const calculateButton = page.locator('button:has-text("Calculate Box")');
		await expect(calculateButton).toBeEnabled();
		await calculateButton.click();

		// Verify results are displayed with proper timeout
		await page.waitForSelector('h3:has-text("Box Packing Results")', {
			timeout: 10000,
		});

		// Verify that at least one shipment box is shown
		const shipmentCard = page.locator('.card-title:has-text("Box")');
		await expect(shipmentCard).toBeVisible();

		// Verify we have actual packing information
		const packingInfo = page.locator('[data-testid="packing-result"]').first();
		if (await packingInfo.isVisible()) {
			await expect(packingInfo).toContainText(/Box|Shipment/);
		}

		// Take a screenshot of the results for debugging
		await page.screenshot({
			path: "test-results/plasma-invoice-box-calculation.png",
			fullPage: true,
		});
	});
	test("should handle invalid invoice format", async ({ page }) => {
		// Path to potentially problematic invoice
		const invalidFilePath = TEST_INVOICES.breakingOrder;

		// Upload the invalid file
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(invalidFilePath);

		// Wait for error message
		await page.waitForSelector("text=Error processing invoice", {
			timeout: 10000,
		});

		// Verify error message is displayed
		const errorText = page.locator("p.text-danger");
		await expect(errorText).toBeVisible();
	});

	test("should calculate boxes for standard invoice", async ({ page }) => {
		// Path to a standard invoice
		const invoicePath = TEST_INVOICES.invoice169402;

		// Upload the invoice
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(invoicePath);

		// Wait for processing to complete
		await page.waitForSelector("text=Successfully processed invoice", {
			timeout: 10000,
		});

		// Click calculate button
		await page.locator('button:has-text("Calculate Box")').click();

		// Verify results are displayed
		await page.waitForSelector('h3:has-text("Box Packing Results")');

		// Take a screenshot of this different invoice result
		await page.screenshot({
			path: "test-results/standard-invoice-box-calculation.png",
		});
	});
});
