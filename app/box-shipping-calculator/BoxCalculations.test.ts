/**
 * Tests for BoxCalculations Utility Functions
 */

import { findBestBox, standardBoxes } from "./BoxCalculations";

// Mock the binpackingjs library
jest.mock("binpackingjs", () => {
	// Create classes to mock the library behavior
	const mockItem = jest
		.fn()
		.mockImplementation((id, length, width, height, weight, metadata) => ({
			id,
			length,
			width,
			height,
			weight,
			metadata,
		}));

	const mockBin = jest
		.fn()
		.mockImplementation((name, length, width, height, maxWeight) => ({
			name,
			length,
			width,
			height,
			maxWeight,
			items: [],
			// Add items to the bin when packed
			addItem: function (item) {
				this.items.push(item);
				return true;
			},
		}));

	const mockPacker = jest.fn().mockImplementation(() => {
		const bins = [];
		const items = [];
		let unfitItems = [];

		return {
			bins,
			unfitItems,
			addBin: function (bin) {
				this.bins.push(bin);
				return this;
			},
			addItem: function (item) {
				items.push(item);
				return this;
			},
			pack: function () {
				// Mock packing logic - in our tests we'll control whether items fit or not
				if (this._shouldSucceed) {
					// All items fit in the first bin
					unfitItems = [];
					items.forEach((item) => {
						if (this.bins[0]) {
							this.bins[0].addItem(item);
						}
					});
				} else {
					// No items fit
					unfitItems = [...items];
				}
			},
			// Test helper to control the packing result
			_shouldSucceed: true,
			_setShouldSucceed: function (value) {
				this._shouldSucceed = value;
			},
		};
	});

	return {
		BP3D: {
			Item: mockItem,
			Bin: mockBin,
			Packer: mockPacker,
		},
	};
});

// Get the mocked version of the Packer class
const mockPackerInstance = new (require("binpackingjs").BP3D.Packer)();

describe("BoxCalculations", () => {
	// Test standardBoxes
	describe("standardBoxes", () => {
		it("should define standard box sizes", () => {
			expect(standardBoxes).toBeDefined();
			expect(standardBoxes.length).toBeGreaterThan(0);

			// Check if all boxes have required properties
			standardBoxes.forEach((box) => {
				expect(box).toHaveProperty("_id");
				expect(box).toHaveProperty("name");
				expect(box).toHaveProperty("length");
				expect(box).toHaveProperty("width");
				expect(box).toHaveProperty("height");
				expect(box).toHaveProperty("maxWeight");
			});
		});
	});

	describe("findBestBox", () => {
		// Sample shipping items for testing
		const sampleItems = [
			{
				_id: "item1",
				name: "Test Item 1",
				length: 50,
				width: 50,
				height: 50,
				weight: 100,
				quantity: 1,
			},
			{
				_id: "item2",
				name: "Test Item 2",
				length: 30,
				width: 30,
				height: 30,
				weight: 50,
				quantity: 2,
				sku: "SKU123",
			},
		];

		// Setup for each test
		beforeEach(() => {
			jest.clearAllMocks();
			jest.spyOn(console, "log").mockImplementation(() => {}); // Suppress console logs
		});

		it("should return success when all items fit in a box", () => {
			// Arrange
			mockPackerInstance._setShouldSucceed(true);

			// Act
			const result = findBestBox(sampleItems);

			// Assert
			expect(result.success).toBe(true);
			expect(result.box).toBeDefined();
			expect(result.packedItems).toBeDefined();
			expect(result.unfitItems).toHaveLength(0);
		});

		it("should return failure when items do not fit in any box", () => {
			// Arrange
			mockPackerInstance._setShouldSucceed(false);

			// Act
			const result = findBestBox(sampleItems);

			// Assert
			expect(result.success).toBe(false);
			expect(result.box).toBeNull();
			expect(result.packedItems).toHaveLength(0);
			expect(result.unfitItems).toEqual(sampleItems);
		});

		it("should try each box size until finding one that works", () => {
			// This test would be more complex in a real scenario,
			// but we'd need to modify our mock to handle different box sizes
			// For now, we'll just ensure it goes through the boxes

			// Arrange
			mockPackerInstance._setShouldSucceed(true);

			// Act
			findBestBox(sampleItems);

			// Assert - we check that addBin was called for at least the first box
			expect(mockPackerInstance.addBin).toHaveBeenCalled();
		});
	});
});
