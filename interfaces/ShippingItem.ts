export default interface ShippingItem {
	id: string;
	name: string;
	length: number; // in millimeters
	width: number; // in millimeters
	height: number; // in millimeters
	weight: number; // in grams
}
