/**
 * The shipping box interface represents a box that can be used to ship items.
 * It includes the box's dimensions in mm and its maximum weight capacity in grams.
 * @prop id - The unique identifier of the box.
 * @prop name - The name of the box.
 * @prop length - The length of the box in millimeters.
 * @prop width - The width of the box in millimeters.
 * @prop height - The height of the box in millimeters.
 * @prop maxWeight - The maximum weight the box can hold in grams.
 */
export default interface ShippingBox {
	id: string;
	name: string;
	length: number; // in millimeters
	width: number; // in millimeters
	height: number; // in millimeters
	maxWeight: number; // in grams
}
