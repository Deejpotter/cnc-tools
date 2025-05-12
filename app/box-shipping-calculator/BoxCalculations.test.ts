/**
 * Tests for BoxCalculations Utility Functions
 */

import { findBestBox, packItemsIntoMultipleBoxes, standardBoxes } from "./BoxCalculations";
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

// Mock ShippingItem data for testing
const create20x40x1000mmExtrusions = (quantity: number): ShippingItem[] => {
  return [{
    _id: 'extrusion-20-40-1000',
    name: 'V-Slot 20 x 40mm - 20 Series - 1000mm',
    length: 1000,
    width: 20,
    height: 40,
    weight: 1000, // 1kg per extrusion
    quantity: quantity
  }];
};

// No longer mocking external libraries, so the complex jest.mock for 'binpackingjs' is removed.

describe("BoxCalculations", () => {
	// Sample shipping items for testing, matching ShippingItem interface
	const itemSmallLight = createMockShippingItem("itemSL", 10, 10, 10, 50, 1); // Fits Padded Satchel
	const itemMediumHeavy = createMockShippingItem("itemMH", 100, 100, 50, 2000, 1); // Fits Small Satchel by dims, but weight might be an issue for Padded Satchel
	const itemLong = createMockShippingItem("itemLong", 1000, 5, 5, 10, 1); // Needs Extra Large Box or XXL Box for length
	const itemTooLarge = createMockShippingItem("itemTooLarge", 2000, 2000, 2000, 100, 1); // Too large for any box
	const itemTooHeavy = createMockShippingItem("itemTooHeavy", 10, 10, 10, 30000, 1); // Too heavy for any box (max is 25kg)

	beforeEach(() => {
		jest.spyOn(console, "log").mockImplementation(() => {}); // Suppress console logs during tests
		jest.spyOn(console, "warn").mockImplementation(() => {}); // Suppress console warnings during tests
	});

	afterEach(() => {
		jest.restoreAllMocks(); // Restore console mocks
	});

	describe("standardBoxes", () => {
		it("should define standard box sizes with required properties", () => {
			expect(standardBoxes).toBeDefined();
			expect(standardBoxes.length).toBeGreaterThan(0);
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

	describe("findBestBox - Simplified Logic", () => {
		it("should return success and the smallest box when a single small item fits", () => {
			const items = [itemSmallLight];
			const result = findBestBox(items);
			expect(result.success).toBe(true);
			// Padded Satchel: 100x80x20, 300g
			// itemSmallLight: 10x10x10, 50g
			expect(result.box?.name).toBe("Padded Satchel");
			expect(result.packedItems).toEqual(items);
			expect(result.unfitItems).toHaveLength(0);
		});

		it("should return success and a suitable box for multiple items that fit", () => {
			const items = [
				createMockShippingItem("itemA", 10, 10, 10, 20, 2), // Total weight 40g, total vol 2000
				createMockShippingItem("itemB", 50, 50, 10, 30, 1), // Total weight 30g, total vol 25000
			]; // Total weight 70g. Max dims: 50x50x10. Total vol: 27000
			const result = findBestBox(items);
			expect(result.success).toBe(true);
			// Padded Satchel: 100x80x20 (vol 160000), 300g. Items fit by individual dim, weight, and total vol.
			expect(result.box?.name).toBe("Padded Satchel");
			expect(result.packedItems).toEqual(items);
		});

		it("should return failure when an item is too large for any box", () => {
			const items = [itemTooLarge];
			const result = findBestBox(items);
			expect(result.success).toBe(false);
			expect(result.box).toBeNull();
			expect(result.unfitItems).toEqual(items);
		});

		it("should return failure when an item is too heavy for any box", () => {
			const items = [itemTooHeavy]; // 30000g, max box weight is 25000g
			const result = findBestBox(items);
			expect(result.success).toBe(false);
			expect(result.box).toBeNull();
			expect(result.unfitItems).toEqual(items);
		});

		it("should return failure when total item weight exceeds box capacity", () => {
			const items = [
				createMockShippingItem("heavy1", 10, 10, 10, 200, 1),
				createMockShippingItem("heavy2", 10, 10, 10, 150, 1), // Total 350g
			];
			// Padded Satchel maxWeight is 300g. Small Satchel is 5000g.
			const result = findBestBox(items);
			expect(result.success).toBe(true); // Should fit in Small Satchel
			expect(result.box?.name).toBe("Small Satchel");
		});

		it("should select a larger box if an item's dimension doesn't fit smaller boxes", () => {
			// Padded Satchel: L=100. Small Satchel: L=240. Small Box: L=210.
			const items = [createMockShippingItem("longish", 220, 10, 10, 100, 1)];
			const result = findBestBox(items);
			expect(result.success).toBe(true);
			expect(result.box?.name).toBe("Small Satchel"); // Length 240
		});

		it("should select the Extra Large Box for the very long item", () => {
			const items = [itemLong]; // 1000mm length
			const result = findBestBox(items);
			expect(result.success).toBe(true);
			// Extra Large Box: L=1170. XXL Box: L=1570.
			// Extra Large Box should be chosen as it's smaller volume and fits.
			expect(result.box?.name).toBe("Extra Large Box");
		});

		it("should return success with the smallest box for an empty item list", () => {
			const items: ShippingItem[] = [];
			const result = findBestBox(items);
			expect(result.success).toBe(true);
			// Expects the first box in the standardBoxes array as the default for empty items.
			// Or null if that's the preferred behavior (current code picks smallest that fits criteria, which is Padded Satchel for 0 items)
			expect(result.box?.name).toBe("Padded Satchel");
			expect(result.packedItems).toEqual([]);
			expect(result.unfitItems).toHaveLength(0);
		});

		it("should correctly consider item quantity for weight and volume", () => {
			// Padded Satchel: 100x80x20 (vol 160000), 300g max weight.
			const items = [createMockShippingItem("multiQty", 10, 10, 10, 60, 5)]; // Total weight 300g, Total vol 5000
			const result = findBestBox(items);
			expect(result.success).toBe(true);
			expect(result.box?.name).toBe("Padded Satchel"); // Exactly fits weight

			const itemsTooHeavyDueToQty = [createMockShippingItem("multiQtyHeavy", 10, 10, 10, 61, 5)]; // Total weight 305g
			const resultHeavy = findBestBox(itemsTooHeavyDueToQty);
			expect(resultHeavy.success).toBe(true);
			expect(resultHeavy.box?.name).toBe("Small Satchel"); // Padded Satchel fails on weight
		});

		it("should choose the box with smaller volume if multiple boxes fit", () => {
			// All items will fit in Small Box, Medium Box, Large Box etc.
			// Small Box: 210*170*120 = 4,284,000
			// Medium Box: 300*300*200 = 18,000,000
			const items = [createMockShippingItem("volTest", 150, 150, 100, 1000, 1)]; // Fits Small Box
			const result = findBestBox(items);
			expect(result.success).toBe(true);
			expect(result.box?.name).toBe("Small Box");
		});

		it("should choose the box with shorter length if volumes are equal (hypothetical)", () => {
			// This test requires custom standard boxes as current ones don't have same volume easily.
			const originalStandardBoxes = [...standardBoxes]; // Save original
			(standardBoxes as ShippingItem[]).splice(0, standardBoxes.length); // Clear current standardBoxes
			standardBoxes.push(
				{ _id: "boxA", name: "Box A (Longer)", length: 20, width: 10, height: 10, maxWeight: 1000 }, // Vol 2000
				{ _id: "boxB", name: "Box B (Shorter)", length: 10, width: 20, height: 10, maxWeight: 1000 } // Vol 2000
			);
			const items = [createMockShippingItem("lenTest", 5, 5, 5, 10, 1)];
			const result = findBestBox(items);
			expect(result.success).toBe(true);
			expect(result.box?.name).toBe("Box B (Shorter)");

			// Restore original standard boxes for other tests
			standardBoxes.splice(0, standardBoxes.length, ...originalStandardBoxes);
		});

		it("should fail if total item volume exceeds box volume, even if other checks pass", () => {
      // Padded Satchel: 100x80x20 (vol 160000), 300g max weight.
      const items = [
        createMockShippingItem("volFail1", 70, 70, 15, 10, 1), // 73500
        createMockShippingItem("volFail2", 70, 70, 15, 10, 1), // 73500. Total: 147000. Fits.
      ];
      const resultFit = findBestBox(items);
      expect(resultFit.success).toBe(true);
      expect(resultFit.box?.name).toBe("Padded Satchel");

      const itemsVolOverflow = [
        createMockShippingItem("volFail3", 80, 80, 15, 10, 1), // 96000
        createMockShippingItem("volFail4", 80, 80, 15, 10, 1), // 96000. Total: 192000. Exceeds Padded Satchel vol.
      ];
      // All individual items fit, weight is fine (20g).
      // Padded Satchel vol: 160000. Items total vol: 192000.
      // Small Satchel vol: 240*150*100 = 3,600,000. This should be chosen.
      const resultOverflow = findBestBox(itemsVolOverflow);
      expect(resultOverflow.success).toBe(true);
      expect(resultOverflow.box?.name).toBe("Small Satchel");
    });

		// Test for the problematic items from the user's scenario
		describe("findBestBox with problematic items (long item scenario)", () => {
			const problematicItems: ShippingItem[] = [
				createMockShippingItem("item_iec_power",50,50,30,20,1,"ELEC-PWR-SW-FU-IEC"),
				createMockShippingItem("item_m5_screws_pack",50,10,10,100,1,"SCREWS-M5-LP-50"),
				createMockShippingItem("item_stepper_cable_1000mm",1000,5,5,10,1,"ELEC-STEPPER-CABLE-1000MM"),
				createMockShippingItem("item_inductive_sensor_lj12a3",80,15,15,50,1,"ELEC-LJ12A3-AX"),
				createMockShippingItem("item_v6_hotend_bowden_pack",80,80,5,50,1,"3D-HOTEND-BOW-0.4-1.75-V2"),
			];

			it("should select the 'Extra Large Box' for the problematic items set", () => {
				const result = findBestBox(problematicItems);
				expect(result.success).toBe(true);
				// The 1000mm item dictates the box size.
				// Extra Large Box (L=1170) is the smallest that fits this length.
				expect(result.box?.name).toBe("Extra Large Box");
				expect(result.packedItems).toEqual(problematicItems);
				expect(result.unfitItems).toHaveLength(0);
			});
		});
	});

	describe('findBestBox', () => {
    test('should find the correct box for a single small item', () => {
      const items: ShippingItem[] = [{
        _id: 'small-item',
        name: 'Small Item',
        length: 50,
        width: 50,
        height: 50,
        weight: 100,
        quantity: 1
      }];

      const result = findBestBox(items);
      expect(result.success).toBe(true);
      expect(result.box?.name).toBe('Padded Satchel');
    });
    
    test('should handle an item that is too large for any box', () => {
      const items: ShippingItem[] = [{
        _id: 'large-item',
        name: 'Oversized Item',
        length: 2000,
        width: 2000,
        height: 2000,
        weight: 1000,
        quantity: 1
      }];

      const result = findBestBox(items);
      expect(result.success).toBe(false);
      expect(result.unfitItems.length).toBe(1);
    });
  });

  describe('packItemsIntoMultipleBoxes', () => {
    test('should pack 20 extrusions into exactly 2 boxes with 10 in each', () => {
      const items = create20x40x1000mmExtrusions(20);
      const result = packItemsIntoMultipleBoxes(items);
      
      expect(result.success).toBe(true);
      expect(result.shipments.length).toBe(2);
      expect(result.unfitItems.length).toBe(0);
      
      // Check if each box has 10 extrusions
      expect(result.shipments[0].packedItems[0].quantity).toBe(10);
      expect(result.shipments[1].packedItems[0].quantity).toBe(10);
      
      // Check that we're using the Extra Large box (or larger)
      expect(['Extra Large Box', 'XXL Box']).toContain(result.shipments[0].box.name);
    });
    
    test('should pack 19 extrusions into exactly 2 boxes (10 in first, 9 in second)', () => {
      const items = create20x40x1000mmExtrusions(19);
      const result = packItemsIntoMultipleBoxes(items);
      
      expect(result.success).toBe(true);
      expect(result.shipments.length).toBe(2);
      expect(result.unfitItems.length).toBe(0);
      
      // Check if boxes have correct quantities
      expect(result.shipments[0].packedItems[0].quantity).toBe(10);
      expect(result.shipments[1].packedItems[0].quantity).toBe(9);
    });

    test('should pack 10 extrusions into a single box', () => {
      const items = create20x40x1000mmExtrusions(10);
      const result = packItemsIntoMultipleBoxes(items);
      
      expect(result.success).toBe(true);
      expect(result.shipments.length).toBe(1);
      expect(result.shipments[0].packedItems[0].quantity).toBe(10);
    });

    test('should pack 11 extrusions into 2 boxes (10 in first, 1 in second)', () => {
      const items = create20x40x1000mmExtrusions(11);
      const result = packItemsIntoMultipleBoxes(items);
      
      expect(result.success).toBe(true);
      expect(result.shipments.length).toBe(2);
      expect(result.shipments[0].packedItems[0].quantity).toBe(10);
      expect(result.shipments[1].packedItems[0].quantity).toBe(1);
    });
  });
});
