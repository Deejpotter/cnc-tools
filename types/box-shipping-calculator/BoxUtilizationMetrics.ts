/**
 * BoxUtilizationMetrics Type Definition
 * Updated: 29/05/2025
 * Author: Deej Potter
 * Description: Represents metrics for how efficiently a box is being utilized.
 * Includes both volume and weight utilization percentages for display purposes.
 */

/**
 * Box utilization metrics including volume and weight
 */
export interface BoxUtilizationMetrics {
	volumePercentage: number;
	weightPercentage: number;
	totalVolume: number;
	totalWeight: number;
	boxVolume: number;
}
