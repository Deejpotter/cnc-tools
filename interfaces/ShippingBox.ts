export default interface ShippingBox {
	id: string;
	name: string;
	length: number; // in millimeters
	width: number; // in millimeters
	height: number; // in millimeters
	maxWeight: number; // in grams
}
