/**
 * Merged extrusions calculator
 *
 * Provides a lightweight greedy packing algorithm that packs required cuts into
 * standard stock lengths (e.g. 500,1000,1500,3050). It returns stock usage
 * counts, simple warehouse instructions, and basic statistics.
 */

export type CutRequirement = { length: number; quantity: number };

export type StockUsage = {
  stockLength: number;
  quantity: number;
};

export type WarehouseInstruction = {
  stockLength: number;
  cuts: number[]; // cuts assigned to this stock piece, in order
};

export type CostByLength = {
  stockLength: number;
  quantity: number;
  setupFee: number;
  totalCuts: number;
  cuttingCost: number;
  totalCost: number;
};

export type InvoiceResult = {
  patterns: WarehouseInstruction[];
  stockUsage: StockUsage[];
  totalCuts: number;
  totalStockPieces: number;
  costByLength?: CostByLength[];
  totalSetupFees?: number;
  totalCuttingCosts?: number;
  totalCost?: number;
};

/**
 * Calculate invoice-like stock usage from requirements.
 *
 * - Expands requirements into individual cuts
 * - Sorts cuts descending
 * - Packs into existing stock pieces if they fit (considering kerf)
 * - When opening a new stock piece chooses the shortest standard length that fits the cut
 */
export function calculateStockUsage(
  requirements: CutRequirement[],
  standardLengths: number[],
  kerfWidth = 0,
  options?: { setupFeePerLength?: number; perCutFee?: number }
): InvoiceResult {
  if (!standardLengths || standardLengths.length === 0) {
    throw new Error('At least one standard length must be provided');
  }

  // normalize and sort available stock lengths ascending (prefer shorter stock)
  const sortedStandards = [...new Set(standardLengths)].sort((a, b) => a - b);

  // expand requirements
  const allCuts: number[] = [];
  for (const r of requirements) {
    for (let i = 0; i < r.quantity; i++) allCuts.push(r.length);
  }

  // sort cuts descending (best-fit decreasing style)
  allCuts.sort((a, b) => b - a);

  type Bin = { stockLength: number; cuts: number[]; usedLength: number; remaining: number };
  const bins: Bin[] = [];

  for (const cut of allCuts) {
    let placed = false;

    // try existing bins first
    for (const bin of bins) {
      const spaceNeeded = bin.cuts.length > 0 ? cut + kerfWidth : cut;
      if (bin.remaining >= spaceNeeded) {
        bin.cuts.push(cut);
        bin.usedLength += spaceNeeded;
        bin.remaining -= spaceNeeded;
        placed = true;
        break;
      }
    }

    if (placed) continue;

    // open new stock piece: choose shortest standard >= cut
    const candidate = sortedStandards.find((s) => s >= cut);
    if (!candidate) {
      // no stock can fit this cut: throw (caller should validate)
      throw new Error(`No available stock long enough for cut ${cut}mm`);
    }

    bins.push({ stockLength: candidate, cuts: [cut], usedLength: cut, remaining: candidate - cut });
  }

  const patterns: WarehouseInstruction[] = bins.map((b) => ({ stockLength: b.stockLength, cuts: b.cuts }));

  // aggregate stock usage
  const usageMap = new Map<number, number>();
  for (const p of patterns) usageMap.set(p.stockLength, (usageMap.get(p.stockLength) || 0) + 1);

  const stockUsage: StockUsage[] = Array.from(usageMap.entries()).map(([stockLength, quantity]) => ({ stockLength, quantity })).sort((a, b) => a.stockLength - b.stockLength);

  const result: InvoiceResult = {
    patterns,
    stockUsage,
    totalCuts: allCuts.length,
    totalStockPieces: bins.length,
  };

  // If options provided, calculate costs
  if (options) {
    const setupFeePerLength = options.setupFeePerLength ?? 0;
    const perCutFee = options.perCutFee ?? 0;

    const costByLength: CostByLength[] = [];
    let totalSetupFees = 0;
    let totalCuttingCosts = 0;

    for (const [stockLength, quantity] of usageMap.entries()) {
      // count total cuts assigned to this stock length
      const totalCutsForLength = patterns.filter((p) => p.stockLength === stockLength).reduce((s, p) => s + p.cuts.length, 0);
      const setupFee = setupFeePerLength * 1; // per unique length used
      const cuttingCost = perCutFee * totalCutsForLength;
      const totalCost = setupFee + cuttingCost;

      costByLength.push({ stockLength, quantity, setupFee, totalCuts: totalCutsForLength, cuttingCost, totalCost });

      totalSetupFees += setupFee;
      totalCuttingCosts += cuttingCost;
    }

    result.costByLength = costByLength.sort((a, b) => a.stockLength - b.stockLength);
    result.totalSetupFees = totalSetupFees;
    result.totalCuttingCosts = totalCuttingCosts;
    result.totalCost = totalSetupFees + totalCuttingCosts;
  }

  return result;
}

export default calculateStockUsage;
