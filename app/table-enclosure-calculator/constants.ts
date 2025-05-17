/**
 * Table and Enclosure Calculator Constants
 * Updated: 17/05/2025
 * Author: Deej Potter
 *
 * Constants for the Table and Enclosure Calculator
 */

// Material types and their properties
// Updated: Only Corflute and Polypropylene Bubble Board, all 6mm
export const MATERIAL_TYPES = [
	{
		id: "corflute-clear-6mm",
		name: "Clear Corflute Sheets - 6mm",
		sku: "MAT-CFLU-6-C-240X120",
	},
	{
		id: "corflute-black-6mm",
		name: "Black Corflute Sheets - 6mm",
		sku: "MAT-CFLU-6-B-240X120",
	},
	{
		id: "polypropylene-bubble-6mm",
		name: "Heavy Duty Polypropylene Bubble Board - 6mm - Black",
		sku: "MAT-BUBL-6-G-240X120",
	},
];

// Standard material thicknesses in mm - Now a single fixed value
export const MATERIAL_THICKNESS = 6;
