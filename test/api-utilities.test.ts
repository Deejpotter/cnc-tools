import { describe, it, expect } from "@jest/globals";
import { dataAPI } from "@/utils/data-api";
import { processInvoiceWithAPI } from "@/utils/invoice-api";
import { fetchDocuments, createDocument } from "@/utils/mongodb-api";

// Mock global fetch for testing
global.fetch = jest.fn();

describe("API Utilities", () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.resetAllMocks();
		// Mock successful fetch response
		(global.fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: jest.fn().mockResolvedValue([{ id: "1", name: "Test Item" }]),
		});
	});

	describe("Data API", () => {
		it("should fetch shipping items", async () => {
			// Arrange & Act
			const items = await dataAPI.shippingItems.getAvailable();

			// Assert
			expect(items).toEqual([{ id: "1", name: "Test Item" }]);
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining("/api/data?operation=shipping-items"),
				expect.any(Object)
			);
		});
	});

	describe("MongoDB API", () => {
		it("should fetch documents", async () => {
			// Arrange & Act
			const documents = await fetchDocuments("items", { status: "active" });

			// Assert
			expect(documents).toEqual([{ id: "1", name: "Test Item" }]);
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining("/api/mongodb?collection=items"),
				expect.any(Object)
			);
		});
	});
});
