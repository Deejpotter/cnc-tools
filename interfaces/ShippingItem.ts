interface ShippingItem {
	/**
	 * MongoDB ObjectId as string
	 * @example "507f1f77bcf86cd799439011"
	 */
	id: string;
	name: string;
	sku: string;
	length: number;
	width: number;
	height: number;
	weight: number;
	quantity: number;
}

export default ShippingItem;
