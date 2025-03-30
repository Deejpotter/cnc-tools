/**
 * The shipping box interface represents a box that can be used to ship items.
 * It includes the box's dimensions in mm and its maximum weight capacity in grams.
 * @prop id - The unique identifier of the box.
 * @prop name - The name of the box.
 * @prop length - The length of the box in millimeters.
 * @prop width - The width of the box in millimeters.
 * @prop height - The height of the box in millimeters.
 * @prop maxWeight - The maximum weight the box can hold in grams.
 * @example {
 *  _id: "507f1f77bcf86cd799439011",
 * name: "Small Box",
 * length: 210,
 * width: 170,
 * height: 120,
 * maxWeight: 25000
 * }
 */
export default interface ShippingBox {
	/**
	 * MongoDB ObjectId as string
	 * @example "507f1f77bcf86cd799439011"
	 */
	_id: string;
	/**
	 * The name of the box.
	 * @example "Small Box"
	 */
	name: string;
	/**
	 * The length of the box in millimeters.
	 * @example 210
	 */
	length: number;
	/**
	 * The width of the box in millimeters.
	 * @example 170
	 */
	width: number;
	/**
	 * The height of the box in millimeters.
	 * @example 120
	 */
	height: number;
	/**
	 * The maximum weight the box can hold in grams.
	 * @example 25000
	 */
	maxWeight: number;
}
