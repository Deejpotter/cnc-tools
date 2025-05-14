/**
 * Tests for Half Enclosure Quote Calculator
 * Updated: 15/05/2025
 * Author: Deej Potter
 * Description: Test suite for the half enclosure quote calculator helper functions.
 */

import {
	calculateHalfEnclosureQuote,
	generateSpecificCustomerQuote,
} from "./half-enclosure-quote";

describe("Half Enclosure Quote Calculator", () => {
	it("calculates materials for custom half enclosure configurations", () => {
		const result = calculateHalfEnclosureQuote({
			workingAreaLength: 1000,
			workingAreaWidth: 800,
			tableHeight: 700,
			enclosureHeight: 200,
			panelMaterial: "acrylic",
			panelThickness: 3,
			includeCasterWheels: true,
		});

		// Verify table calculations
		expect(result.tableMaterials.extrusions.rail2060Length).toBe(1000);
		expect(result.tableMaterials.extrusions.rail2060Width).toBe(800);
		expect(result.tableMaterials.extrusions.rail4040Legs).toBe(700);

		// Verify enclosure calculations
		// Enclosure dimensions should be working area + 40mm
		expect(result.enclosureMaterials.extrusions.horizontal.length.size).toBe(
			1040
		);
		expect(result.enclosureMaterials.extrusions.horizontal.width.size).toBe(
			840
		);
		expect(result.enclosureMaterials.extrusions.vertical2020.size).toBe(200);

		// Verify panel materials
		expect(result.panelMaterials.material.type).toBe("acrylic");
		expect(result.panelMaterials.material.thickness).toBe(3);

		// Should have 3 panels (left, right, back) - no top or bottom
		expect(result.panelMaterials.panels).toHaveLength(3);

		// Verify URL was generated
		expect(result.url).toContain("/table-enclosure-calculator?");
		expect(result.url).toContain("tableLength=1000");
		expect(result.url).toContain("enclosureHeight=200");
	});

	it("generates a quote for the specific customer request", () => {
		// Customer's specific requirements:
		// 1200×1200 working area, 950mm total height (including 200mm half enclosure)
		// M8 caster wheels, and corflute panels
		const result = generateSpecificCustomerQuote();

		// Verify table dimensions
		expect(result.tableMaterials.extrusions.rail2060Length).toBe(1200);
		expect(result.tableMaterials.extrusions.rail2060Width).toBe(1200);
		expect(result.tableMaterials.extrusions.rail4040Legs).toBe(750);

		// Verify enclosure dimensions
		expect(result.enclosureMaterials.extrusions.horizontal.length.size).toBe(
			1240
		);
		expect(result.enclosureMaterials.extrusions.horizontal.width.size).toBe(
			1240
		);
		expect(result.enclosureMaterials.extrusions.vertical2020.size).toBe(200);

		// Verify panel materials
		expect(result.panelMaterials.material.type).toBe("corflute");
		expect(result.panelMaterials.panels).toHaveLength(3);

		// Check that the panels don't include top or bottom
		const panelPositions = result.panelMaterials.panels.map((p) => p.position);
		expect(panelPositions).toContain("Left");
		expect(panelPositions).toContain("Right");
		expect(panelPositions).toContain("Back");
		expect(panelPositions).not.toContain("Top");
		expect(panelPositions).not.toContain("Bottom");

		// Verify URL generation
		expect(result.url).toContain("tableLength=1200");
		expect(result.url).toContain("tableWidth=1200");
		expect(result.url).toContain("enclosureHeight=200");
		expect(result.url).toContain("panelType=corflute");
	});
});
