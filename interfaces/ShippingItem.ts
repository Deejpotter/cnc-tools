export default interface ShippingItem {
	id: string;
	name: string;
	sku?: string; // Optional SKU for imported items
	length: number; // in millimeters
	width: number; // in millimeters
	height: number; // in millimeters
	weight: number; // in grams
	quantity: number; // Default to 1 if not specified
}
