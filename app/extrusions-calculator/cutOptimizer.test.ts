import calculateStockUsage from './cutOptimizer';

describe('calculateStockUsage', () => {
  it('packs simple cuts into appropriate stock lengths', () => {
    const requirements = [
      { length: 1000, quantity: 2 },
      { length: 500, quantity: 1 },
    ];

    // standard lengths: prefer shorter lengths first
    const standardLengths = [500, 1000, 1500, 3050];

    const result = calculateStockUsage(requirements, standardLengths, 3);

    // Total cuts should be 3
    expect(result.totalCuts).toBe(3);

    // Expect at least one 3050 or a 1500+1000 distribution depending on kerf
    // Check that all cuts are assigned
    const assignedCuts = result.patterns.flatMap((p) => p.cuts);
    expect(assignedCuts.sort((a, b) => a - b)).toEqual([500, 1000, 1000]);
  });

  it('throws when a cut is longer than any standard length', () => {
    const requirements = [{ length: 4000, quantity: 1 }];
    const standardLengths = [500, 1000, 1500, 3050];
    expect(() => calculateStockUsage(requirements, standardLengths)).toThrow();
  });
});
