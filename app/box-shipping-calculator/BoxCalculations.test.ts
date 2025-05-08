/**
 * Tests for BoxCalculations Utility Functions
 */

import { findBestBox, standardBoxes } from "./BoxCalculations";
import type ShippingItem from "@/interfaces/box-shipping-calculator/ShippingItem";

// Helper to create a mock ShippingItem
const createMockShippingItem = (
	id: string,
	l: number,
	w: number,
	h: number,
	weight: number,
	qty: number = 1,
	sku: string = "SKU"
): ShippingItem => ({
	_id: id,
	name: `Test Item ${id}`,
	length: l,
	width: w,
	height: h,
	weight: weight,
	quantity: qty,
	sku: sku,
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
});

// --- Mocking binpackingjs ---
// const mockItemImpl = (id, length, width, height, weight, metadata) => ({ id, length, width, height, weight, metadata, name: metadata?.name || id }); // Moved

// Moved these declarations before jest.mock
const createdMockPackerInstances = [];
const mockPackerConstructor = jest.fn(); // This will be our main mock for the Packer class

jest.mock("binpackingjs", () => {
	const actualMockItemImpl = (id, length, width, height, weight, metadata) => ({
		id,
		length,
		width,
		height,
		weight,
		metadata,
		name: metadata?.name || id,
	});
	const actualMockBinImpl = (name, length, width, height, maxWeight) => {
		const binInstance = {
			name,
			length,
			width,
			height,
			maxWeight,
			items: [],
			addItem: jest.fn(function (item) {
				this.items.push(item);
			}),
		};
		return binInstance;
	};

	// Define PackerProxy as a function that can be called with 'new'
	const PackerProxy = function (...constructorArgs) {
		// mockPackerConstructor is a jest.fn(). When called with 'new',
		// Jest handles it, and it executes its mockImplementation.
		// If that implementation returns an object, that object becomes the result of 'new'.
		return new mockPackerConstructor(...constructorArgs);
	};

	return {
		BP3D: {
			Item: jest.fn().mockImplementation(actualMockItemImpl),
			Bin: jest.fn().mockImplementation(actualMockBinImpl),
			Packer: PackerProxy, // Use the function that correctly delegates construction
		},
	};
});
// --- End Mocking binpackingjs ---

describe("BoxCalculations", () => {
	// Sample shipping items for testing, matching ShippingItem interface
	const sampleItems: ShippingItem[] = [
		createMockShippingItem("item1", 50, 50, 50, 100, 1),
		createMockShippingItem("item2", 30, 30, 30, 50, 2, "SKU123"),
	];

	beforeEach(() => {
		jest.clearAllMocks(); // Clears all mock usage data, including mockPackerConstructor
		createdMockPackerInstances.length = 0; // Clear our array of created instances

		// Default behavior for Packer: new instance will succeed
		mockPackerConstructor.mockImplementation(() => {
			const itemsAddedToPacker = [];
			const packerInstance = {
				bins: [],
				unfitItems: [],
				_itemsAdded: itemsAddedToPacker,
				addBin: jest.fn(function (bin) {
					this.bins.push(bin);
					return this;
				}),
				addItem: jest.fn(function (item) {
					itemsAddedToPacker.push(item);
					return this;
				}),
				pack: jest.fn(function () {
					// Default: success
					this.unfitItems = [];
					if (this.bins.length > 0 && this.bins[0].addItem) {
						itemsAddedToPacker.forEach((item) => this.bins[0].addItem(item));
					}
				}),
			};
			createdMockPackerInstances.push(packerInstance);
			return packerInstance;
		});

		jest.spyOn(console, "log").mockImplementation(() => {}); // Suppress console logs
	});

	describe("standardBoxes", () => {
		it("should define standard box sizes", () => {
			expect(standardBoxes).toBeDefined();
			expect(standardBoxes.length).toBeGreaterThan(0);
			standardBoxes.forEach((box) => {
				expect(box).toHaveProperty("_id");
				expect(box).toHaveProperty("name");
				// ... other property checks if needed
			});
		});
	});

	describe("findBestBox", () => {
		it("should return success when all items fit in the first suitable box", () => {
			// For this test, the default mock (from beforeEach) is used,
			// where the first box (standardBoxes[0]) will successfully pack all items.
			const result = findBestBox(sampleItems);

			expect(result.success).toBe(true);
			expect(result.box).toEqual(standardBoxes[0]); // Should have used the first box
			expect(result.packedItems.length).toBe(sampleItems.length);
			expect(result.unfitItems).toHaveLength(0);
			// findBestBox iterates through ALL standardBoxes to find the truly "best" fit (smallest volume, then length),
			// not just the first one that can pack the items.
			// Therefore, mockPackerConstructor is called for each standard box.
			expect(mockPackerConstructor).toHaveBeenCalledTimes(standardBoxes.length);
			expect(createdMockPackerInstances[0].pack).toHaveBeenCalledTimes(1);

			// Verify packed items details (simple check for _id and quantity)
			sampleItems.forEach((originalItem) => {
				const packedItem = result.packedItems.find(
					(p) => p._id === originalItem._id
				);
				expect(packedItem).toBeDefined();
				expect(packedItem.quantity).toBe(originalItem.quantity);
				expect(packedItem.name).toBe(originalItem.name);
			});
		});

		it("should return failure when items do not fit in any box", () => {
			// Override mockPackerConstructor to always fail packing
			mockPackerConstructor.mockImplementation(() => {
				const itemsAddedToPacker: any[] = []; // Define itemsAddedToPacker for this scope
				const packerInstance = {
					bins: [] as any[],
					unfitItems: [] as any[],
					_itemsAdded: itemsAddedToPacker, // Use the scoped itemsAddedToPacker
					addBin: jest.fn(function (this: any, bin: any) {
						this.bins.push(bin);
						return this;
					}),
					addItem: jest.fn(function (this: any, item: any) {
						itemsAddedToPacker.push(item); // Add to scoped itemsAddedToPacker
						return this;
					}),
					pack: jest.fn(function (this: any) {
						this.unfitItems = [...itemsAddedToPacker]; // Use scoped itemsAddedToPacker
					}), // Always fail
				};
				createdMockPackerInstances.push(packerInstance);
				return packerInstance;
			});

			const result = findBestBox(sampleItems);

			expect(result.success).toBe(false);
			expect(result.box).toBeNull();
			expect(result.packedItems).toHaveLength(0);
			expect(result.unfitItems).toEqual(sampleItems);
			// It will try all boxes before concluding failure.
			expect(mockPackerConstructor).toHaveBeenCalledTimes(standardBoxes.length);
		});

		it("should try each box size until finding one that works", () => {
			// First packer fails (for standardBoxes[0])
			mockPackerConstructor
				.mockImplementationOnce(() => {
					const itemsAddedToPacker: any[] = [];
					const failingPacker = {
						bins: [] as any[],
						unfitItems: [] as any[],
						_itemsAdded: itemsAddedToPacker,
						addBin: jest.fn(function (this: any, bin: any) {
							this.bins.push(bin);
							return this;
						}),
						addItem: jest.fn(function (this: any, item: any) {
							itemsAddedToPacker.push(item);
							return this;
						}),
						pack: jest.fn(function (this: any) {
							// Simulate failure: all items added are unfit
							this.unfitItems = [...itemsAddedToPacker];
						}),
					};
					createdMockPackerInstances.push(failingPacker);
					return failingPacker;
				})
				// Second packer succeeds (for standardBoxes[1])
				.mockImplementationOnce(() => {
					const itemsAddedToPacker: any[] = [];
					const succeedingPacker = {
						bins: [
							{
								items: [] as any[],
								addItem: function (item: any) {
									this.items.push(item);
								},
							},
						] as any[], // Mock bin with addItem
						unfitItems: [] as any[],
						_itemsAdded: itemsAddedToPacker,
						addBin: jest.fn(function (this: any, bin: any) {
							this.bins.push(bin); // The bin itself needs to be a mock with an 'items' array
							return this;
						}),
						addItem: jest.fn(function (this: any, item: any) {
							itemsAddedToPacker.push(item);
							return this;
						}),
						pack: jest.fn(function (this: any) {
							this.unfitItems = []; // Simulate success
							// Simulate items being packed into the bin
							if (this.bins.length > 0 && this.bins[0].addItem) {
								itemsAddedToPacker.forEach((item) =>
									this.bins[0].addItem(item)
								);
							}
						}),
					};
					createdMockPackerInstances.push(succeedingPacker);
					return succeedingPacker;
				});
			// Subsequent calls (for standardBoxes[2] onwards) will use the default mock,
			// which is set up in beforeEach to succeed. This is important because findBestBox
			// will continue to check all boxes to find the *best* fit, even after finding one that works.

			const result = findBestBox(sampleItems);

			// findBestBox iterates through ALL standardBoxes to find the truly "best" fit.
			// Even if an early box fits, it continues checking to see if a subsequent box is "better"
			// (e.g., smaller volume or, for same volume, shorter length).
			// Thus, mockPackerConstructor is called for each standard box.
			expect(mockPackerConstructor).toHaveBeenCalledTimes(standardBoxes.length);
			expect(createdMockPackerInstances.length).toBe(standardBoxes.length); // Each call to constructor creates an instance

			// Check behavior of the first packer (should have failed)
			expect(createdMockPackerInstances[0].pack).toHaveBeenCalledTimes(1);
			// Check behavior of the second packer (should have succeeded)
			expect(createdMockPackerInstances[1].pack).toHaveBeenCalledTimes(1);

			expect(result.success).toBe(true);
			// Since standardBoxes[1] was the first to succeed and subsequent boxes (using the default mock)
			// also succeed, findBestBox would choose the one with the smallest volume/length among them.
			// For this test to be robust, we should ensure standardBoxes[1] is indeed the "best"
			// among those that succeed, or adjust the expectation if another box is better.
			// Assuming standardBoxes[1] is better than or equal to standardBoxes[0] (which failed)
			// and potentially better than standardBoxes[2] onwards (which succeeded with default mock).
			// If standardBoxes[0] was smaller than standardBoxes[1], and standardBoxes[1] was the first success,
			// then standardBoxes[1] would be chosen.
			// If a subsequent box (e.g. standardBoxes[2]) is smaller than standardBoxes[1] and also fits,
			// it would be chosen. The default mock makes all items fit.
			// For this test, we are asserting that it picked standardBoxes[1].
			// This implies standardBoxes[1] is the best fit among all succeeding boxes.
			expect(result.box).toEqual(standardBoxes[1]); // Should have used the second box
			expect(result.packedItems.length).toBe(sampleItems.length);
			expect(result.unfitItems).toHaveLength(0);
		});

		it("should correctly map packed item properties", () => {
			// Default mock (success on first box) is fine for this.
			const result = findBestBox([
				createMockShippingItem("mapTest", 10, 10, 10, 10, 1, "MAPSKU"),
			]);
			expect(result.success).toBe(true);
			expect(result.packedItems.length).toBe(1);
			const packed = result.packedItems[0];
			expect(packed._id).toBe("mapTest");
			expect(packed.name).toBe("Test Item mapTest");
			expect(packed.length).toBe(10);
			expect(packed.width).toBe(10);
			expect(packed.height).toBe(10);
			expect(packed.weight).toBe(10);
			expect(packed.quantity).toBe(1);
			expect(packed.sku).toBe("MAPSKU");
			expect(packed.createdAt).toBeDefined();
			expect(packed.updatedAt).toBeDefined();
			expect(packed.deletedAt).toBeNull();
		});
	});

	describe("findBestBox with problematic items (long item scenario from screenshot)", () => {
		// Items based on the user's screenshot, especially the long stepper cable.
		// My goal here is to simulate a real-world scenario that was causing issues.
		const problematicItems: ShippingItem[] = [
			createMockShippingItem(
				"item_iec_power",
				50,
				50,
				30,
				20,
				1,
				"ELEC-PWR-SW-FU-IEC"
			),
			createMockShippingItem(
				"item_m5_screws_pack",
				50,
				10,
				10,
				100,
				1,
				"SCREWS-M5-LP-50"
			),
			createMockShippingItem(
				"item_stepper_cable_1000mm",
				1000,
				5,
				5,
				10,
				1,
				"ELEC-STEPPER-CABLE-1000MM"
			),
			createMockShippingItem(
				"item_inductive_sensor_lj12a3",
				80,
				15,
				15,
				50,
				1,
				"ELEC-LJ12A3-AX"
			),
			createMockShippingItem(
				"item_v6_hotend_bowden_pack",
				80,
				80,
				5,
				50,
				1,
				"3D-HOTEND-BOW-0.4-1.75-V2"
			),
		];

		// This helper function creates a mock packer instance. I need to control how it behaves for each box.
		const createSpecificPackerInstance = (shouldSucceedPacking: boolean) => {
			const itemsAddedToThisPacker: any[] = [];
			const packerInstance = {
				bins: [] as any[], // Will hold the mock bin
				unfitItems: [] as any[],
				_itemsAdded: itemsAddedToThisPacker, // Keep a record of items added to this specific packer
				addBin: jest.fn(function (this: any, bin: any) {
					this.bins.push(bin);
					return this;
				}),
				addItem: jest.fn(function (this: any, item: any) {
					itemsAddedToThisPacker.push(item);
					return this;
				}),
				pack: jest.fn(function (this: any) {
					if (shouldSucceedPacking) {
						this.unfitItems = [];
						// If packing is meant to succeed, I need to simulate the items being put into the bin.
						// The actual binpackingjs library would modify the bin.items array.
						if (this.bins.length > 0 && this.bins[0].addItem) {
							// My mockBin has an addItem method
							itemsAddedToThisPacker.forEach((item) =>
								this.bins[0].addItem(item)
							);
						}
					} else {
						// If packing fails, all items added to this packer are considered unfit.
						this.unfitItems = [...itemsAddedToThisPacker];
					}
				}),
			};
			createdMockPackerInstances.push(packerInstance); // I keep track of all created mock instances.
			return packerInstance;
		};

		it("should select the 'Extra Large Box' when it fits the 1000mm item and is preferred over the 'XXL Box' due to smaller dimensions", () => {
			// I need to tell Jest how the Packer should behave for each standard box it tries.
			// The 1000mm long item (item_stepper_cable_1000mm) is the critical one.
			// It should not fit in the first 5 boxes based on their dimensions.
			mockPackerConstructor
				.mockImplementationOnce(() => createSpecificPackerInstance(false)) // standardBoxes[0] - Padded Satchel (length 100)
				.mockImplementationOnce(() => createSpecificPackerInstance(false)) // standardBoxes[1] - Small Satchel (length 240)
				.mockImplementationOnce(() => createSpecificPackerInstance(false)) // standardBoxes[2] - Small Box (length 210)
				.mockImplementationOnce(() => createSpecificPackerInstance(false)) // standardBoxes[3] - Medium Box (length 300)
				.mockImplementationOnce(() => createSpecificPackerInstance(false)) // standardBoxes[4] - Large Box (length 510)
				.mockImplementationOnce(() => createSpecificPackerInstance(true)) // standardBoxes[5] - Extra Large Box (length 1170) - Should fit!
				.mockImplementationOnce(() => createSpecificPackerInstance(true)); // standardBoxes[6] - XXL Box (length 1570) - Should also fit.

			// Now, I run the function I'm testing with my problematic items.
			const result = findBestBox(problematicItems);

			// Here are my expectations for the outcome:
			expect(result.success).toBe(true); // A box should have been found.
			// The 'Extra Large Box' (index 5) should be chosen because it's the smallest (by volume, then length) that fits.
			expect(result.box).toEqual(standardBoxes[5]);
			expect(result.packedItems.length).toBe(problematicItems.length); // All items should be packed.

			// I also want to make sure the packed items retain their original details.
			problematicItems.forEach((originalItem) => {
				const packedItem = result.packedItems.find(
					(p) => p._id === originalItem._id
				);
				expect(packedItem).toBeDefined();
				expect(packedItem?.quantity).toBe(originalItem.quantity);
			});
			expect(result.unfitItems).toHaveLength(0); // No items should be left unfit.

			// I expect the Packer constructor to have been called for each of the standard boxes.
			expect(mockPackerConstructor).toHaveBeenCalledTimes(standardBoxes.length);

			// And I expect the pack() method to have been called on each of those packer instances.
			expect(createdMockPackerInstances.length).toBe(standardBoxes.length);
			createdMockPackerInstances.forEach((instance) => {
				expect(instance.pack).toHaveBeenCalledTimes(1);
			});
		});
	});
});
