/**
 * Type definitions for 20 Series Cut Calculator
 *
 * Implements 1D cutting stock problem optimization using
 * Best Fit Decreasing (BFD) algorithm with kerf consideration.
 *
 * @see http://bookstack.deejpotter.com/books/deejpottercom/page/20-series-cut-calculator-implementation-guide
 */

/**
 * Represents a single cut requirement from the user
 */
export type CutRequirement = {
  /** Unique identifier for the requirement */
  id: string;
  /** Length of the cut in millimeters */
  length: number;
  /** Number of pieces needed at this length */
  quantity: number;
};

/**
 * Represents an available stock piece with length and quantity
 */
export type StockItem = {
  /** Unique identifier for the stock item */
  id: string;
  /** Length of the stock piece in millimeters */
  length: number;
  /** Number of stock pieces available at this length */
  quantity: number;
};

/**
 * Represents a cutting pattern for a single stock piece
 */
export type CutPattern = {
  /** Stock piece number (1-indexed) */
  stockIndex: number;
  /** Length of the stock piece used */
  stockLength: number;
  /** Array of cut lengths placed in this stock piece */
  cuts: number[];
  /** Waste/leftover length in millimeters */
  waste: number;
  /** Utilization percentage (0-100) */
  utilization: number;
};

/**
 * Cost breakdown for a specific stock length
 */
export type StockLengthCost = {
  /** Stock length in millimeters */
  stockLength: number;
  /** Number of pieces of this length used */
  quantity: number;
  /** Setup fee for this length ($3 per unique length) */
  setupFee: number;
  /** Number of cuts made on this length */
  totalCuts: number;
  /** Cutting cost ($2 per cut) */
  cuttingCost: number;
  /** Total cost for this length (setup + cutting) */
  totalCost: number;
};

/**
 * Complete calculation result with patterns and statistics
 */
export type CalculationResult = {
  /** Array of cutting patterns, one per stock piece */
  patterns: CutPattern[];
  /** Total number of stock pieces needed */
  totalStock: number;
  /** Total waste across all stock pieces in millimeters */
  totalWaste: number;
  /** Average utilization across all stock pieces (0-100) */
  averageUtilization: number;
  /** Algorithm execution time in milliseconds */
  executionTime: number;
  /** Cost breakdown by stock length */
  costByLength: StockLengthCost[];
  /** Total setup fees (all unique lengths) */
  totalSetupFees: number;
  /** Total cutting costs (all cuts) */
  totalCuttingCosts: number;
  /** Grand total cost */
  totalCost: number;
};

/**
 * Input parameters for cut calculation
 */
export type CutCalculatorInput = {
  /** Array of available stock items with lengths and quantities */
  stockItems: StockItem[];
  /** Array of cut requirements */
  requirements: CutRequirement[];
  /** Kerf width in millimeters (blade thickness) */
  kerfWidth: number;
};

/**
 * Validation error types
 */
export type ValidationError = {
  /** Field that failed validation */
  field: string;
  /** Error message */
  message: string;
};
