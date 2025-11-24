import calculateStockUsage from "./cutOptimizer";

describe("calculateStockUsage", () => {
	it("packs simple cuts into appropriate stock lengths", () => {
		const requirements = [
			{ length: 1000, quantity: 2 },
			{ length: 500, quantity: 1 },
		];

		// standard lengths: prefer shorter lengths first
		const standardLengths = [500, 1000, 1500, 3050];

		const result = calculateStockUsage(requirements, standardLengths, 3, {
			setupFeePerLength: 3,
			perCutFee: 2,
		});

		// Total cuts should be 3
		expect(result.totalCuts).toBe(3);

		// Check that all cuts are assigned
		const assignedCuts = result.patterns.flatMap((p) => p.cuts);
		expect(assignedCuts.sort((a, b) => a - b)).toEqual([500, 1000, 1000]);

		// Cost assertions: 1 setup fee per unique length used, $2 per cut
		expect(result.totalCuttingCosts).toBe(2 * 3);
		// Determine unique stock lengths used
		const uniqueLengths = Array.from(
			new Set(result.patterns.map((p) => p.stockLength))
		).length;
		expect(result.totalSetupFees).toBe(3 * uniqueLengths);
	});

	it("throws when a cut is longer than any standard length", () => {
		const requirements = [{ length: 4000, quantity: 1 }];
		const standardLengths = [500, 1000, 1500, 3050];
		expect(() => calculateStockUsage(requirements, standardLengths)).toThrow();
	});

	it("produces aggregatedCuts with correct counts", () => {
		const requirements = [
			{ length: 1000, quantity: 3 },
			{ length: 500, quantity: 2 },
		];
		const standardLengths = [500, 1000, 1500, 3050];
		const res = calculateStockUsage(requirements, standardLengths, 3);
		expect(res.aggregatedCuts).toBeDefined();
		// aggregatedCuts sorted descending by length in implementation
		expect(res.aggregatedCuts).toEqual(
			expect.arrayContaining([
				{ length: 1000, quantity: 3 },
				{ length: 500, quantity: 2 },
			])
		);
	});

	it("accounts for kerf when packing (uses more stock when kerf prevents tight packing)", () => {
		// Without kerf, two 500mm cuts fit into 1000mm stock; with kerf they may not
		const requirements = [{ length: 500, quantity: 2 }];
		// Use only 1000mm stock so that two 500mm cuts can be packed into a single 1000mm piece when kerf=0
		const standards = [1000];

		const resNoKerf = calculateStockUsage(requirements, standards, 0);
		// Expect both cuts packed into one 1000mm piece
		expect(resNoKerf.totalStockPieces).toBe(1);

		const resWithKerf = calculateStockUsage(requirements, standards, 10); // large kerf
		// With kerf, they should require two 500mm pieces (or two 1000mm pieces depending on algorithm)
		expect(resWithKerf.totalStockPieces).toBeGreaterThanOrEqual(2);
	});

	it("returns sensible result for empty requirements", () => {
		const res = calculateStockUsage([], [500, 1000, 1500], 3);
		expect(res.totalCuts).toBe(0);
		expect(res.totalStockPieces).toBe(0);
		expect(res.patterns).toEqual([]);
		expect(res.aggregatedCuts).toEqual([]);
	});

	it("calculates cost breakdown totals consistently", () => {
		const requirements = [
			{ length: 1000, quantity: 2 },
			{ length: 500, quantity: 1 },
		];
		const standards = [500, 1000, 1500];
		const res = calculateStockUsage(requirements, standards, 3, {
			setupFeePerLength: 5,
			perCutFee: 4,
		});
		// total cuts = 3
		expect(res.totalCuts).toBe(3);
		// cutting cost is perCutFee * totalCuts
		expect(res.totalCuttingCosts).toBe(4 * 3);
		// totalCost should equal totalSetupFees + totalCuttingCosts
		expect(res.totalCost).toBe(res.totalSetupFees! + res.totalCuttingCosts!);
	});

	it("respects available stock quantities when provided", () => {
		const requirements = [{ length: 1000, quantity: 2 }];
		const standards = [1000, 1500];
		// only one 1000mm and one 1500mm available
		const res = calculateStockUsage(requirements, standards, 3, {
			availableStock: [
				{ stockLength: 1000, quantity: 1 },
				{ stockLength: 1500, quantity: 1 },
			],
		});

		expect(res.totalCuts).toBe(2);
		expect(res.totalStockPieces).toBe(2);
		// one 1000 and one 1500 used
		const usage = Object.fromEntries(res.stockUsage.map((s) => [s.stockLength, s.quantity]));
		expect(usage[1000]).toBe(1);
		expect(usage[1500]).toBe(1);
	});
});
