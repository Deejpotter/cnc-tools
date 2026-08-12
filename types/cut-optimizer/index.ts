/**
 * Cut Optimizer Types
 * Types for the algo-api cut optimization service
 * Compatible with Opticutter API format
 */

// Linear (1D) Cut Optimization Types

export interface LinearStock {
  length: string;
  count?: number;
  priority?: string;
  price?: string;
  group?: string;
}

export interface LinearRequirement {
  length: string;
  count: number;
  label?: string;
  group?: string;
}

export interface LinearSettings {
  kerf?: string;
  leftTrim?: string;
  rightTrim?: string;
  minimizeNumberOfCuttingLayouts?: boolean;
  costMinimization?: boolean;
}

export interface LinearOptimizationRequest {
  stocks: LinearStock[];
  requirements: LinearRequirement[];
  settings?: LinearSettings;
}

export interface LinearPart {
  index: number;
  length: string;
  count: number;
  label?: string;
}

export interface LinearWaste {
  cut?: string;
  material: string;
}

export interface LinearCuts {
  count: number;
}

export interface LinearLayout {
  count: number;
  stock: {
    index: number;
    length: string;
  };
  parts: LinearPart[];
  waste: LinearWaste;
  cuts: LinearCuts;
}

export interface LinearRequiredStock {
  index: number;
  length: string;
  count: number;
  price?: number;
}

export interface LinearSolution {
  totalRequiredStocks: number;
  requiredStocks: LinearRequiredStock[];
  layouts: LinearLayout[];
}

export interface LinearOptimizationResponse {
  solution: LinearSolution;
}

// Panel (2D) Cut Optimization Types

export interface PanelStock {
  length: string;
  width: string;
  count?: number;
  grainDirection?: string | null;
  priority?: string;
  price?: string;
  group?: string;
}

export interface PanelRequirement {
  length: string;
  width: string;
  count: number;
  grainDirection?: string | null;
  label?: string;
  group?: string;
}

export interface PanelSettings {
  kerf?: string;
  leftTrim?: string;
  rightTrim?: string;
  topTrim?: string;
  bottomTrim?: string;
  costMinimization?: boolean;
  rollMaterial?: boolean;
  layoutImages?: boolean;
}

export interface PanelOptimizationRequest {
  stocks: PanelStock[];
  requirements: PanelRequirement[];
  settings?: PanelSettings;
}

export interface PanelPosition {
  index: number;
  length: string;
  width: string;
  x: string;
  y: string;
  label?: string;
}

export interface PanelRemainder {
  length: string;
  width: string;
  x: string;
  y: string;
}

export interface PanelCuts {
  count: number;
  length?: string;
}

export interface PanelLayout {
  count: number;
  stock: {
    index: number;
    length: string;
    width: string;
  };
  panels: PanelPosition[];
  remainders: PanelRemainder[] | null;
  cuts: PanelCuts;
  svgImage?: string;
}

export interface PanelRequiredStock {
  index: number;
  length: string;
  width: string;
  count: number;
  price?: number;
}

export interface PanelSolution {
  totalRequiredStocks: number;
  requiredStocks: PanelRequiredStock[];
  layouts: PanelLayout[];
}

export interface PanelOptimizationResponse {
  solution: PanelSolution;
}

// API Error Response

export interface ApiError {
  errors: Array<{
    status: string;
    source: {
      pointer: string;
    } | null;
    title: string;
    detail: string;
  }>;
}

// Optimization Type Union

export type OptimizationType = "linear" | "panel";
