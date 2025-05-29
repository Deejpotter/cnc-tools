/**
 * BoxDimensions Type Definition
 * Updated: 29/05/2025
 * Author: Deej Potter
 * Description: Represents the calculated dimensions and volume metrics for a set of items.
 * Used for analyzing space requirements and packing efficiency.
 */

/**
 * Box dimensions and volume metrics
 */
export interface BoxDimensions {
	totalLength: number;
	totalWidth: number;
	totalHeight: number;
	totalVolume: number;
}
