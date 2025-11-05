/**
 * 1D Cutting Stock Problem Optimizer
 *
 * Implements Best Fit Decreasing (BFD) algorithm for optimizing linear material cuts
 * with minimal waste. Supports multiple stock lengths and kerf (blade width) consideration.
 *
 * References:
 * - Johnson, D.S. (1973) "Near-optimal bin packing algorithms" MIT PhD Thesis
 * - Dósa, György (2007) Tight bound proof: BFD ≤ (11/9) * OPT + 6/9
 * - Wikipedia: https://en.wikipedia.org/wiki/Bin_packing_problem
 *
 * @see http://bookstack.deejpotter.com/books/deejpottercom/page/20-series-cut-calculator-implementation-guide
 */

import type {
  CutRequirement,
  StockItem,
  CalculationResult,
  CutPattern,
  CutCalculatorInput,
  StockLengthCost,
} from "@/types/cutCalculator";

/**
 * Best Fit Decreasing Algorithm for 1D Cutting Stock Problem with Multiple Stock Lengths
 *
 * Strategy:
 * 1. Sort all required cuts in descending order (largest first)
 * 2. For each cut, find the best stock piece:
 *    - Prefer stock pieces that already have cuts (minimize new stock usage)
 *    - Among viable stocks, choose the one with smallest remainder after cut + kerf
 * 3. Account for kerf (blade width) between cuts
 * 4. Try shorter stock lengths first when opening new stock pieces
 *
 * Time Complexity: O(n² * m) where n = total cuts, m = number of stock pieces
 * Space Complexity: O(n + m)
 * Approximation Ratio: ≤ (11/9) * OPT + 6/9
 *
 * @param stockItems - Array of available stock items with lengths and quantities
 * @param requirements - Array of cut requirements
 * @param kerfWidth - Kerf width (blade thickness) in millimeters
 * @returns Calculation result with patterns and statistics
 */
export function bestFitDecreasing(
  stockItems: StockItem[],
  requirements: CutRequirement[],
  kerfWidth: number
): CalculationResult {
  const startTime = performance.now();

  // Step 1: Expand requirements into individual cuts
  const allCuts: number[] = [];
  requirements.forEach((req) => {
    for (let i = 0; i < req.quantity; i++) {
      allCuts.push(req.length);
    }
  });

  // Step 2: Sort cuts in descending order (largest first)
  allCuts.sort((a, b) => b - a);

  // Step 3: Sort stock items by length (ascending - prefer shorter stock)
  const sortedStockItems = [...stockItems].sort((a, b) => a.length - b.length);

  // Step 4: Initialize bins (stock pieces being used)
  type Bin = {
    stockLength: number;
    cuts: number[];
    usedLength: number; // Includes cuts + kerf
    remainingSpace: number;
  };

  const bins: Bin[] = [];
  const stockUsageCount = new Map<number, number>(); // Track stock usage by length

  // Initialize stock usage tracking
  sortedStockItems.forEach((stock) => {
    stockUsageCount.set(stock.length, 0);
  });

  // Step 5: Place each cut using Best Fit strategy with kerf consideration
  for (const cut of allCuts) {
    let bestBinIndex = -1;
    let smallestRemainder = Infinity;

    // First, try to fit in existing bins (minimizes new stock)
    for (let i = 0; i < bins.length; i++) {
      const bin = bins[i];
      // Calculate space needed: cut + kerf (except for first cut which doesn't need leading kerf)
      const spaceNeeded = bin.cuts.length > 0 ? cut + kerfWidth : cut;

      if (bin.remainingSpace >= spaceNeeded) {
        const remainderAfter = bin.remainingSpace - spaceNeeded;
        
        // Choose bin with smallest remainder (tightest fit)
        if (remainderAfter < smallestRemainder) {
          bestBinIndex = i;
          smallestRemainder = remainderAfter;
        }
      }
    }

    if (bestBinIndex !== -1) {
      // Found existing bin - place cut there
      const bin = bins[bestBinIndex];
      const spaceNeeded = bin.cuts.length > 0 ? cut + kerfWidth : cut;
      
      bin.cuts.push(cut);
      bin.usedLength += spaceNeeded;
      bin.remainingSpace -= spaceNeeded;
    } else {
      // No existing bin fits - need new stock piece
      // Find shortest stock that can fit this cut
      let newStock: StockItem | null = null;

      for (const stock of sortedStockItems) {
        const currentUsage = stockUsageCount.get(stock.length) || 0;
        
        // Check if stock is long enough and we have quantity available
        if (stock.length >= cut && currentUsage < stock.quantity) {
          newStock = stock;
          break; // Use shortest available stock
        }
      }

      if (!newStock) {
        // No stock available that can fit this cut
        throw new Error(
          `Cannot fit cut of ${cut}mm - no stock pieces available or long enough. ` +
          `Longest available stock: ${Math.max(...sortedStockItems.map(s => s.length))}mm`
        );
      }

      // Create new bin with this stock
      bins.push({
        stockLength: newStock.length,
        cuts: [cut],
        usedLength: cut,
        remainingSpace: newStock.length - cut,
      });

      stockUsageCount.set(newStock.length, (stockUsageCount.get(newStock.length) || 0) + 1);
    }
  }

  // Step 6: Calculate statistics and format results
  const patterns: CutPattern[] = bins.map((bin, index) => {
    const utilization = (bin.usedLength / bin.stockLength) * 100;

    return {
      stockIndex: index + 1,
      stockLength: bin.stockLength,
      cuts: bin.cuts,
      waste: bin.remainingSpace,
      utilization: Math.round(utilization * 10) / 10,
    };
  });

  const totalWaste = bins.reduce((sum, bin) => sum + bin.remainingSpace, 0);
  const averageUtilization =
    patterns.reduce((sum, p) => sum + p.utilization, 0) / patterns.length;

  // Step 7: Calculate costs
  // Cost structure:
  // - $3 setup fee per unique stock length used
  // - $2 per cut across all stock pieces
  
  // Group patterns by stock length to calculate costs
  const stockLengthMap = new Map<number, {
    quantity: number;
    totalCuts: number;
  }>();
  
  patterns.forEach((pattern) => {
    const existing = stockLengthMap.get(pattern.stockLength) || {
      quantity: 0,
      totalCuts: 0
    };
    
    stockLengthMap.set(pattern.stockLength, {
      quantity: existing.quantity + 1,
      totalCuts: existing.totalCuts + pattern.cuts.length
    });
  });
  
  // Calculate cost breakdown by length
  const costByLength = Array.from(stockLengthMap.entries()).map(
    ([stockLength, data]) => {
      const setupFee = 3; // $3 per unique length
      const cuttingCost = data.totalCuts * 2; // $2 per cut
      const totalCost = setupFee + cuttingCost;
      
      return {
        stockLength,
        quantity: data.quantity,
        setupFee,
        totalCuts: data.totalCuts,
        cuttingCost,
        totalCost
      };
    }
  ).sort((a, b) => a.stockLength - b.stockLength); // Sort by length for display
  
  // Calculate totals
  const totalSetupFees = costByLength.reduce((sum, cost) => sum + cost.setupFee, 0);
  const totalCuttingCosts = costByLength.reduce((sum, cost) => sum + cost.cuttingCost, 0);
  const totalCost = totalSetupFees + totalCuttingCosts;

  const executionTime = performance.now() - startTime;

  return {
    patterns,
    totalStock: bins.length,
    totalWaste,
    averageUtilization: Math.round(averageUtilization * 10) / 10,
    executionTime: Math.round(executionTime * 100) / 100,
    costByLength,
    totalSetupFees,
    totalCuttingCosts,
    totalCost,
  };
}

/**
 * Main calculation function with validation
 *
 * Validates inputs and delegates to Best Fit Decreasing algorithm.
 *
 * @param input - Complete calculation input with stock items, requirements, and kerf
 * @returns Calculation result with patterns and statistics
 * @throws Error if validation fails
 */
export function calculateOptimalCuts(
  input: CutCalculatorInput
): CalculationResult {
  // Validation: At least one stock item
  if (input.stockItems.length === 0) {
    throw new Error("At least one stock item is required");
  }

  // Validation: All stock lengths must be positive
  const invalidStockLengths = input.stockItems.filter(
    (stock) => stock.length <= 0
  );

  if (invalidStockLengths.length > 0) {
    throw new Error(
      `All stock lengths must be greater than 0. Invalid: ${invalidStockLengths
        .map((s) => s.length)
        .join(", ")}`
    );
  }

  // Validation: All stock quantities must be positive
  const invalidStockQuantities = input.stockItems.filter(
    (stock) => stock.quantity <= 0 || !Number.isInteger(stock.quantity)
  );

  if (invalidStockQuantities.length > 0) {
    throw new Error(
      `All stock quantities must be positive integers. Invalid: ${invalidStockQuantities
        .map((s) => s.quantity)
        .join(", ")}`
    );
  }

  // Validation: At least one requirement
  if (input.requirements.length === 0) {
    throw new Error("At least one cut requirement is needed");
  }

  // Validation: All cut lengths must be positive
  const invalidLengths = input.requirements.filter((req) => req.length <= 0);

  if (invalidLengths.length > 0) {
    throw new Error(
      `All cut lengths must be greater than 0. Invalid: ${invalidLengths
        .map((c) => c.length)
        .join(", ")}`
    );
  }

  // Validation: All quantities must be positive integers
  const invalidQuantities = input.requirements.filter(
    (req) => req.quantity <= 0 || !Number.isInteger(req.quantity)
  );

  if (invalidQuantities.length > 0) {
    throw new Error(
      `All quantities must be positive integers. Invalid: ${invalidQuantities
        .map((c) => c.quantity)
        .join(", ")}`
    );
  }

  // Validation: No cut can be longer than longest stock
  const maxStockLength = Math.max(...input.stockItems.map((s) => s.length));
  const tooLongCuts = input.requirements.filter(
    (req) => req.length > maxStockLength
  );

  if (tooLongCuts.length > 0) {
    throw new Error(
      `Some cuts are longer than longest available stock (${maxStockLength}mm): ${tooLongCuts
        .map((c) => c.length)
        .join(", ")}mm`
    );
  }

  // Validation: Kerf width must be non-negative
  if (input.kerfWidth < 0) {
    throw new Error("Kerf width must be non-negative");
  }

  // Execute Best Fit Decreasing algorithm
  return bestFitDecreasing(
    input.stockItems,
    input.requirements,
    input.kerfWidth
  );
}

/**
 * Utility function to calculate waste percentage for a pattern
 *
 * @param waste - Waste length in millimeters
 * @param stockLength - Stock length in millimeters
 * @returns Waste percentage (0-100)
 */
export function calculateWastePercentage(
  waste: number,
  stockLength: number
): number {
  return Math.round((waste / stockLength) * 1000) / 10; // Round to 1 decimal
}

/**
 * Utility function to format cut length for display
 *
 * @param length - Length in millimeters
 * @returns Formatted string (e.g., "450mm")
 */
export function formatCutLength(length: number): string {
  return `${length}mm`;
}

/**
 * Utility function to generate cut pattern description
 *
 * @param pattern - Cut pattern to describe
 * @returns Human-readable description
 */
export function describeCutPattern(pattern: CutPattern): string {
  const cutsList = pattern.cuts.map(formatCutLength).join(" + ");
  const wasteStr = formatCutLength(pattern.waste);
  return `Stock #${pattern.stockIndex} (${pattern.stockLength}mm): ${cutsList} | Waste: ${wasteStr} (${
    100 - pattern.utilization
  }%)`;
}
