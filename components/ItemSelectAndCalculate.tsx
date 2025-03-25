"use client";
import React, { useState } from "react";
import ShippingItem from "@/interfaces/ShippingItem";

interface ItemSelectAndCalculateProps {
	items: ShippingItem[];
	onCalculateBox: (selectedItems: ShippingItem[]) => void;
}

/**
 * Component for selecting items and triggering box calculations
 * Handles item selection, removal, and search functionality
 */
export default function ItemSelectAndCalculate({
	items,
	onCalculateBox,
}: ItemSelectAndCalculateProps) {
	// State for search and selected items
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedItems, setSelectedItems] = useState<ShippingItem[]>([]);

	// Filter items based on search term
	const filteredItems = items.filter((item) =>
		item.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	/**
	 * Add an item to the selected items list
	 */
	const handleSelectItem = (item: ShippingItem) => {
		setSelectedItems((prev) => [...prev, item]);
	};

	/**
	 * Remove an item from the selected items list
	 */
	const handleRemoveItem = (itemId: string) => {
		setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
	};

	return (
		<div className="space-y-4">
			{/* Search input */}
			<div>
				<input
					type="text"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="Search Items"
					className="w-full p-2 border rounded"
				/>
			</div>

			{/* Available items list - only show when searching */}
			{searchTerm && (
				<div className="border rounded p-2">
					<h3 className="font-bold mb-2">Available Items</h3>
					<ul className="space-y-2">
						{filteredItems.map((item) => (
							<li key={item.id} className="flex justify-between items-center">
								<span>{item.name}</span>
								<button
									onClick={() => handleSelectItem(item)}
									className="px-2 py-1 bg-blue-500 text-white rounded"
								>
									Add
								</button>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Selected items list */}
			{selectedItems.length > 0 && (
				<div className="border rounded p-2">
					<h3 className="font-bold mb-2">Selected Items</h3>
					<ul className="space-y-2">
						{selectedItems.map((item) => (
							<li key={item.id} className="flex justify-between items-center">
								<span>{item.name}</span>
								<button
									onClick={() => handleRemoveItem(item.id)}
									className="px-2 py-1 bg-red-500 text-white rounded"
								>
									Remove
								</button>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Calculate button */}
			<button
				onClick={() => onCalculateBox(selectedItems)}
				disabled={selectedItems.length === 0}
				className="w-full py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
			>
				Calculate Box Size
			</button>
		</div>
	);
}
