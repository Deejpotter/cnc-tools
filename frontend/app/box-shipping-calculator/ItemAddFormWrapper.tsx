/**
 * ItemAddFormWrapper
 * This is a server component that wraps the client ItemAddFormClient component
 * Provides a consistent interface for adding items
 */

import React from "react";
import ItemAddFormClient from "./ItemAddFormClient";

// No props needed as ItemAddFormClient handles submission internally
export default function ItemAddFormWrapper() {
	return <ItemAddFormClient />;
}
