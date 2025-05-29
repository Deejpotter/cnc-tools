/**
 * Box Shipping Calculator - Type Definitions Index
 * Updated: 29/05/2025
 * Author: Deej Potter
 * Description: Centralizes all box shipping calculator type definitions.
 * 
 * This module serves as a clean re-export hub that combines:
 * 1. MongoDB/Database types (ShippingBox, ShippingItem) - from ../mongodb/box-shipping-calculator/
 * 2. Algorithm/Calculation types (Point3D, PackedItem, etc.) - from individual files in this directory
 * 
 * The separation allows for:
 * - Database types: Structures that match MongoDB documents
 * - Algorithm types: Internal calculation and packing algorithm structures
 * 
 * Import from here to get all box shipping calculator types in one place.
 */

// =============================================================================
// DATABASE/MONGODB TYPES
// =============================================================================

/**
 * Re-export MongoDB types that represent database documents.
 * These types match the structure of data stored in MongoDB collections.
 */
export type { default as ShippingBox } from "../mongodb/box-shipping-calculator/ShippingBox";
export type { default as ShippingItem } from "../mongodb/box-shipping-calculator/ShippingItem";

// =============================================================================
// ALGORITHM/CALCULATION TYPES  
// =============================================================================

/**
 * Re-export algorithm-specific types used in packing calculations.
 * These types are used internally by the 3D bin packing algorithms.
 */
export type { Point3D } from "./Point3D";
export type { PackedItem } from "./PackedItem";
export type { PackingBox } from "./PackingBox";
export type { BoxDimensions } from "./BoxDimensions";
export type { BoxUtilizationMetrics } from "./BoxUtilizationMetrics";
export type { Shipment } from "./Shipment";
export type { MultiBoxPackingResult } from "./MultiBoxPackingResult";
