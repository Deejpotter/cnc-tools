# Test info

- Name: Box Shipping Calculator E2E >> should calculate boxes for standard invoice
- Location: C:\Users\Deej\Repos\cnc-tools\e2e\box-shipping-calculator.spec.ts:118:6

# Error details

```
Error: browserType.launch: Executable doesn't exist at C:\Users\Deej\AppData\Local\ms-playwright\chromium-1169\chrome-win\chrome.exe
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   18 | 	plasma3m: path.join(
   19 | 		__dirname,
   20 | 		"../test/data/invoices/169434 - 3m Plasma.pdf"
   21 | 	),
   22 | 	invoice169402: path.join(
   23 | 		__dirname,
   24 | 		"../test/data/invoices/invoice-169402.pdf"
   25 | 	),
   26 | 	invoice169241: path.join(
   27 | 		__dirname,
   28 | 		"../test/data/invoices/invoice-169241.pdf"
   29 | 	),
   30 | 	invoice169116: path.join(
   31 | 		__dirname,
   32 | 		"../test/data/invoices/invoice-169116.pdf"
   33 | 	),
   34 | };
   35 |
   36 | // These tests require a running server instance
   37 | // They test the complete flow from invoice upload to box calculation
   38 |
   39 | test.describe("Box Shipping Calculator E2E", () => {
   40 | 	test.beforeEach(async ({ page }) => {
   41 | 		// Navigate to the box shipping calculator page
   42 | 		await page.goto("/box-shipping-calculator");
   43 | 		// Wait for the page to load completely
   44 | 		await page.waitForSelector('h1:has-text("Box Shipping Calculator")');
   45 | 		// Ensure the file input is ready
   46 | 		await page.waitForSelector('input[type="file"]', { state: 'attached' });
   47 | 	});
   48 |
   49 | 	test("should upload an invoice and calculate boxes", async ({ page }) => {
   50 | 		// Path to test invoice - using the 3m Plasma invoice
   51 | 		const invoicePath = TEST_INVOICES.plasma3m;
   52 |
   53 | 		// Upload the invoice with better error handling
   54 | 		const fileInput = page.locator('input[type="file"]');
   55 | 		await fileInput.setInputFiles(invoicePath);
   56 |
   57 | 		// Wait for processing to complete with extended timeout
   58 | 		await page.waitForSelector("text=Successfully processed invoice", { 
   59 | 			timeout: 15000 
   60 | 		});
   61 |
   62 | 		// Verify items were added from the invoice
   63 | 		const itemsTable = page.locator(".selected-items-table");
   64 | 		await expect(itemsTable).toBeVisible();
   65 |
   66 | 		// Verify at least one item is present with specific content
   67 | 		const firstItem = itemsTable.locator("tbody tr").first();
   68 | 		await expect(firstItem).toBeVisible();
   69 | 		
   70 | 		// Additional verification: check that item data is populated
   71 | 		const itemName = firstItem.locator("td").first();
   72 | 		await expect(itemName).not.toBeEmpty();
   73 |
   74 | 		// Click calculate button and wait for it to be enabled
   75 | 		const calculateButton = page.locator('button:has-text("Calculate Box")');
   76 | 		await expect(calculateButton).toBeEnabled();
   77 | 		await calculateButton.click();
   78 |
   79 | 		// Verify results are displayed with proper timeout
   80 | 		await page.waitForSelector('h3:has-text("Box Packing Results")', { 
   81 | 			timeout: 10000 
   82 | 		});
   83 |
   84 | 		// Verify that at least one shipment box is shown
   85 | 		const shipmentCard = page.locator('.card-title:has-text("Box")');
   86 | 		await expect(shipmentCard).toBeVisible();
   87 |
   88 | 		// Verify we have actual packing information
   89 | 		const packingInfo = page.locator('[data-testid="packing-result"]').first();
   90 | 		if (await packingInfo.isVisible()) {
   91 | 			await expect(packingInfo).toContainText(/Box|Shipment/);
   92 | 		}
   93 |
   94 | 		// Take a screenshot of the results for debugging
   95 | 		await page.screenshot({
   96 | 			path: "test-results/plasma-invoice-box-calculation.png",
   97 | 			fullPage: true
   98 | 		});
   99 | 	});
  100 | 	test("should handle invalid invoice format", async ({ page }) => {
  101 | 		// Path to potentially problematic invoice
  102 | 		const invalidFilePath = TEST_INVOICES.breakingOrder;
  103 |
  104 | 		// Upload the invalid file
  105 | 		const fileInput = page.locator('input[type="file"]');
  106 | 		await fileInput.setInputFiles(invalidFilePath);
  107 |
  108 | 		// Wait for error message
  109 | 		await page.waitForSelector("text=Error processing invoice", {
  110 | 			timeout: 10000,
  111 | 		});
  112 |
  113 | 		// Verify error message is displayed
  114 | 		const errorText = page.locator("p.text-danger");
  115 | 		await expect(errorText).toBeVisible();
  116 | 	});
  117 |
> 118 | 	test("should calculate boxes for standard invoice", async ({ page }) => {
      | 	    ^ Error: browserType.launch: Executable doesn't exist at C:\Users\Deej\AppData\Local\ms-playwright\chromium-1169\chrome-win\chrome.exe
  119 | 		// Path to a standard invoice
  120 | 		const invoicePath = TEST_INVOICES.invoice169402;
  121 |
  122 | 		// Upload the invoice
  123 | 		const fileInput = page.locator('input[type="file"]');
  124 | 		await fileInput.setInputFiles(invoicePath);
  125 |
  126 | 		// Wait for processing to complete
  127 | 		await page.waitForSelector("text=Successfully processed invoice", {
  128 | 			timeout: 10000,
  129 | 		});
  130 |
  131 | 		// Click calculate button
  132 | 		await page.locator('button:has-text("Calculate Box")').click();
  133 |
  134 | 		// Verify results are displayed
  135 | 		await page.waitForSelector('h3:has-text("Box Packing Results")');
  136 |
  137 | 		// Take a screenshot of this different invoice result
  138 | 		await page.screenshot({
  139 | 			path: "test-results/standard-invoice-box-calculation.png",
  140 | 		});
  141 | 	});
  142 | });
  143 |
```