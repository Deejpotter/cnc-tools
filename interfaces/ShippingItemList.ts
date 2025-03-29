import ShippingItem from "./ShippingItem";

/**
 * Represents a list of ShippingItems that need to be packed into one or more boxes.
 */
export default interface ShippingItemList {
	items: ShippingItem[];
}
