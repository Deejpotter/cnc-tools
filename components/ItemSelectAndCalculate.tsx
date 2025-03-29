"use client";
import React, { useState, useMemo } from "react";
import ShippingItem from "@/interfaces/ShippingItem";
import { Search, Plus, Minus, X, Edit, Trash2 } from "lucide-react";
import ItemEditModal from "./ItemEditModal";
import {
	updateItemInDatabase,
	deleteItemFromDatabase,
} from "@/app/actions/databaseActions";

interface ItemSelectAndCalculateProps {
	availableItems: ShippingItem[];
	selectedItems: ShippingItem[];
	onSelectedItemsChange: (items: ShippingItem[]) => void;
	onCalculateBox: (items: ShippingItem[]) => void;
	onItemsChange: () => void;
}

type SortOption = "name" | "weight" | "dimensions" | "sku";
type FilterOption = "all" | "light" | "heavy";

/**
 * Component for selecting items and triggering box calculations
 * Handles item selection, removal, search, sorting, and filtering functionality
 */
export default function ItemSelectAndCalculate({
	availableItems,
	selectedItems,
	onSelectedItemsChange,
	onCalculateBox,
	onItemsChange,
}: ItemSelectAndCalculateProps) {
	// State management
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState<SortOption>("name");
	const [filterBy, setFilterBy] = useState<FilterOption>("all");

	// New state for edit modal
	const [editItem, setEditItem] = useState<ShippingItem | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState<string | null>(null);

	/**
	 * Calculate total weight of selected items including quantities
	 */
	const totalWeight = useMemo(() => {
		return selectedItems.reduce(
			(sum, item) => sum + item.weight * item.quantity,
			0
		);
	}, [selectedItems]);

	/**
	 * Filter and sort available items based on current criteria
	 */
	const processedItems = useMemo(() => {
		let filtered = availableItems.filter((item) => {
			const matchesSearch =
				item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.sku?.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesFilter =
				filterBy === "all"
					? true
					: filterBy === "light"
					? item.weight < 500
					: item.weight >= 500;

			return matchesSearch && matchesFilter;
		});

		return filtered.sort((a, b) => {
			switch (sortBy) {
				case "weight":
					return a.weight - b.weight;
				case "dimensions":
					return a.length * a.width * a.height - b.length * b.width * b.height;
				case "sku":
					return (a.sku || "").localeCompare(b.sku || "");
				default:
					return a.name.localeCompare(b.name);
			}
		});
	}, [availableItems, searchTerm, sortBy, filterBy]);

	/**
	 * Add an item to the selected items list or increment its quantity
	 */
	const handleSelectItem = (item: ShippingItem) => {
		const existingItem = selectedItems.find((i) => i.id === item.id);
		if (existingItem) {
			onSelectedItemsChange(
				selectedItems.map((i) =>
					i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
				)
			);
		} else {
			onSelectedItemsChange([...selectedItems, { ...item, quantity: 1 }]);
		}
	};

	/**
	 * Update quantity of a selected item
	 */
	const updateQuantity = (itemId: string, delta: number) => {
		const updatedItems = selectedItems.map((item) => {
			if (item.id === itemId) {
				const newQuantity = Math.max(1, item.quantity + delta);
				return { ...item, quantity: newQuantity };
			}
			return item;
		});
		onSelectedItemsChange(updatedItems);
	};

	/**
	 * Remove an item from the selected items list
	 */
	const handleRemoveItem = (itemId: string) => {
		onSelectedItemsChange(selectedItems.filter((item) => item.id !== itemId));
	};

	/**
	 * Handle item edit request
	 * Opens the edit modal with the selected item
	 */
	const handleEditItem = (item: ShippingItem) => {
		setEditItem(item);
		setIsEditModalOpen(true);
	};

	/**
	 * Handle item update submission
	 * Updates the item in the database and refreshes the list
	 */
	const handleUpdateItem = async (updatedItem: ShippingItem) => {
		try {
			await updateItemInDatabase(updatedItem);
			onItemsChange(); // Refresh the items list

			// Update the item in selectedItems if it exists there
			if (selectedItems.some((item) => item.id === updatedItem.id)) {
				onSelectedItemsChange(
					selectedItems.map((item) =>
						item.id === updatedItem.id
							? { ...updatedItem, quantity: item.quantity }
							: item
					)
				);
			}
		} catch (error) {
			console.error("Failed to update item:", error);
			throw error;
		}
	};

	/**
	 * Handle item deletion
	 * Shows confirmation dialog and performs soft delete
	 */
	const handleDeleteItem = async (itemId: string) => {
		if (!window.confirm("Are you sure you want to delete this item?")) {
			return;
		}

		try {
			setIsDeleting(itemId);
			await deleteItemFromDatabase(itemId);
			onItemsChange(); // Refresh the items list

			// Remove the item from selectedItems if it exists there
			if (selectedItems.some((item) => item.id === itemId)) {
				onSelectedItemsChange(
					selectedItems.filter((item) => item.id !== itemId)
				);
			}
		} catch (error) {
			console.error("Failed to delete item:", error);
			alert("Failed to delete item. Please try again.");
		} finally {
			setIsDeleting(null);
		}
	};

	return (
		<div className="">
			{/* Search and filters section */}
			<div className="mb-1">
				<div className="">
					<Search className="" size={25} />
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search by name or SKU"
						className="border rounded mb-1 w-75 p-2"
					/>
				</div>

				<div className="">
					<select
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as SortOption)}
						className="p-2 border rounded"
					>
						<option value="name">Sort by Name</option>
						<option value="sku">Sort by SKU</option>
						<option value="weight">Sort by Weight</option>
						<option value="dimensions">Sort by Size</option>
					</select>

					<select
						value={filterBy}
						onChange={(e) => setFilterBy(e.target.value as FilterOption)}
						className="p-2 border rounded"
					>
						<option value="all">All Items</option>
						<option value="light">Light Items (&lt;500g)</option>
						<option value="heavy">Heavy Items (≥500g)</option>
					</select>
				</div>
			</div>

			{/* Available and selected items grid */}
			<div className="grid md:grid-cols-2 gap-4">
				{/* Available items list */}
				<div className="border rounded-lg p-4">
					<h3 className="font-bold mb-4">Available Items</h3>
					<div className="max-h-96 overflow-y-auto">
						{processedItems.length === 0 ? (
							<p className="text-gray-500 text-center py-4">
								No items match your search
							</p>
						) : (
							processedItems.map((item) => (
								<div
									key={item.id}
									className="flex justify-between items-center p-2 hover:bg-gray-50 border-b"
								>
									<div className="flex-1">
										<div className="font-medium">{item.name}</div>
										<div className="text-sm text-gray-500">
											{item.sku && (
												<span className="mr-2">SKU: {item.sku}</span>
											)}
											{item.length}x{item.width}x{item.height}mm • {item.weight}
											g
										</div>
									</div>
									<div className="flex items-center gap-2">
										<button
											onClick={() => handleEditItem(item)}
											className="p-2 text-blue-500 hover:bg-blue-50 rounded"
											title="Edit item"
										>
											<Edit size={16} />
										</button>
										<button
											onClick={() => handleDeleteItem(item.id)}
											className="p-2 text-red-500 hover:bg-red-50 rounded"
											title="Delete item"
											disabled={isDeleting === item.id}
										>
											<Trash2 size={16} />
										</button>
										<button
											onClick={() => handleSelectItem(item)}
											className="p-2 text-green-500 hover:bg-green-50 rounded"
											title="Add item"
										>
											<Plus size={16} />
										</button>
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* Selected items list */}
				<div className="border rounded-lg p-4">
					<h3 className="mb-3">Selected Items</h3>
					<div className="max-h-96 overflow-y-auto">
						{selectedItems.length === 0 ? (
							<p className="text-center py-4">No items selected</p>
						) : (
							selectedItems.map((item) => (
								<div
									key={item.id}
									className="flex justify-between items-center p-2 hover:bg-gray-50 border-b"
								>
									<div className="flex-1">
										<div className="">{item.name}</div>
										<div className="">
											{item.sku && (
												<span className="mr-2">SKU: {item.sku}</span>
											)}
										</div>
										<div className="">
											{item.length}x{item.width}x{item.height}mm
										</div>
										<div className="">
											Weight: {item.weight}g • Quantity: {item.quantity}
										</div>
										<div className="">
											Total: {item.weight * item.quantity}g
										</div>
									</div>
									<div className="flex items-center gap-2">
										<button
											onClick={() => updateQuantity(item.id, -1)}
											className="p-1 text-gray-500 hover:bg-gray-100 rounded"
											title="Decrease quantity"
										>
											<Minus size={16} />
										</button>
										<span className="w-8 text-center">{item.quantity}</span>
										<button
											onClick={() => updateQuantity(item.id, 1)}
											className="p-1 text-gray-500 hover:bg-gray-100 rounded"
											title="Increase quantity"
										>
											<Plus size={16} />
										</button>
										<button
											onClick={() => handleRemoveItem(item.id)}
											className="p-1 text-red-500 hover:bg-red-50 rounded"
											title="Remove item"
										>
											<X size={16} />
										</button>
									</div>
								</div>
							))
						)}
					</div>

					{/* Total weight and calculate button */}
					<div className="mt-4 pt-4 border-t">
						<div className="flex justify-between items-center mb-4">
							<span className="font-medium">Total Weight:</span>
							<span>{totalWeight}g</span>
						</div>
						<button
							onClick={() => onCalculateBox(selectedItems)}
							disabled={selectedItems.length === 0}
							className="w-full py-2 bg-green-500 text-white rounded disabled:bg-gray-300 hover:bg-green-600 transition-colors"
						>
							Calculate Box Size
						</button>
					</div>
				</div>
			</div>

			{/* Edit Modal */}
			<ItemEditModal
				item={editItem}
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setEditItem(null);
				}}
				onSave={handleUpdateItem}
			/>
		</div>
	);
}
