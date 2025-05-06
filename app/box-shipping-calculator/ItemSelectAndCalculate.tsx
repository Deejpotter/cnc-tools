/**
 * Item select and calculate interface component
 * Updated: 30/03/25
 * Author: Deej Potter
 * Description: Provides a user interface for selecting items, calculating box sizes, and managing item data.
 * Used on the Box Shipping Calculator page.
 * This component allows users to search, filter, and sort items, as well as add, edit, and delete items.
 *
 * Note: This component handles client-side operations for item management.
 * Item data is stored in localStorage instead of MongoDB.
 */

"use client";

import React, { useState, useMemo } from "react";
import ShippingItem from "@/interfaces/box-shipping-calculator/ShippingItem";
import { Search, Plus, Minus, X, Edit, Trash2 } from "lucide-react";
import ItemEditModal from "./ItemEditModal";
import { updateItemInDatabase, deleteItemFromDatabase } from "./localStorageDB";

/**
 * Props interface for ItemSelectAndCalculate component
 * Defines the expected properties and callbacks for the component
 */
interface ItemSelectAndCalculateProps {
	availableItems: ShippingItem[]; // List of all available items
	selectedItems: ShippingItem[]; // Currently selected items for calculation
	onSelectedItemsChange: (items: ShippingItem[]) => void; // Callback when selected items change
	onCalculateBox: (items: ShippingItem[]) => void; // Callback to trigger box calculation
	onItemsChange: () => void; // Callback when items are modified/deleted/added
}

/**
 * Type definitions for sorting and filtering options
 * These types ensure type safety when handling sort and filter operations
 */
type SortOption = "name" | "weight" | "dimensions" | "sku";
type FilterOption = "all" | "light" | "heavy";

/**
 * ItemSelectAndCalculate Component
 * Handles the selection, filtering, and management of items for box calculation
 * Includes search, sort, and filter functionality
 *
 * Note: This is a client-side component that manages the UI state and interactions
 * All database operations are delegated to server actions
 */
export default function ItemSelectAndCalculate({
	availableItems,
	selectedItems,
	onSelectedItemsChange,
	onCalculateBox,
	onItemsChange,
}: ItemSelectAndCalculateProps) {
	// State Management
	// ---------------
	const [searchTerm, setSearchTerm] = useState(""); // Search input value
	const [sortBy, setSortBy] = useState<SortOption>("name"); // Current sort criteria
	const [filterBy, setFilterBy] = useState<FilterOption>("all"); // Current filter criteria
	const [editItem, setEditItem] = useState<ShippingItem | null>(null); // Item being edited
	const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Edit modal visibility
	const [isDeleting, setIsDeleting] = useState<string | null>(null); // Item being deleted (using string ID)

	/**
	 * Calculate total weight of selected items including quantities
	 * Uses useMemo to cache the calculation until selectedItems changes
	 * This prevents unnecessary recalculations on every render
	 */
	const totalWeight = useMemo(() => {
		return selectedItems.reduce(
			(sum, item) => sum + item.weight * (item.quantity || 1),
			0
		);
	}, [selectedItems]);

	/**
	 * Filter and sort available items based on current criteria
	 * Uses useMemo to cache the processed items until dependencies change
	 */
	const processedItems = useMemo(() => {
		// First filter items based on search term and weight filter
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

		// Then sort the filtered items
		return filtered.sort((a, b) => {
			switch (sortBy) {
				case "weight":
					return a.weight - b.weight;
				case "dimensions":
					return a.length * a.width * a.height - b.length * b.width * b.height;
				case "sku":
					return (a.sku || "").localeCompare(b.sku || "");
				default: // "name"
					return a.name.localeCompare(b.name);
			}
		});
	}, [availableItems, searchTerm, sortBy, filterBy]);

	/**
	 * Add an item to the selected items list or increment its quantity
	 * If the item already exists, its quantity is incremented
	 * If it's a new item, it's added with quantity 1
	 * @param item Item to add or increment
	 */
	const handleSelectItem = (item: ShippingItem) => {
		const existingItem = selectedItems.find((i) => i._id === item._id);
		if (existingItem) {
			// If item exists, increment its quantity
			onSelectedItemsChange(
				selectedItems.map((i) =>
					i._id === item._id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
				)
			);
		} else {
			// If item is new, add it with quantity 1
			onSelectedItemsChange([...selectedItems, { ...item, quantity: 1 }]);
		}
	};

	/**
	 * Update quantity of a selected item
	 * Ensures quantity never goes below 1
	 * @param itemId ID of the item to update
	 * @param delta Amount to change quantity by (+1 or -1)
	 */
	const updateQuantity = (itemId: string, delta: number) => {
		const updatedItems = selectedItems.map((item) => {
			if (item._id === itemId) {
				const newQuantity = Math.max(1, (item.quantity || 1) + delta);
				return { ...item, quantity: newQuantity };
			}
			return item;
		});
		onSelectedItemsChange(updatedItems);
	};

	/**
	 * Remove an item from the selected items list
	 * @param itemId ID of the item to remove
	 */
	const handleRemoveItem = (itemId: string) => {
		onSelectedItemsChange(selectedItems.filter((item) => item._id !== itemId));
	};

	/**
	 * Open the edit modal for an item
	 * @param item Item to edit
	 */
	const handleEditItem = (item: ShippingItem) => {
		setEditItem(item);
		setIsEditModalOpen(true);
	};

	/**
	 * Handle item update submission
	 * Updates the item in the database and refreshes the list
	 * @param updatedItem Item with updated values
	 */
	const handleUpdateItem = async (updatedItem: ShippingItem) => {
		try {
			await updateItemInDatabase(updatedItem);
			onItemsChange(); // Refresh the items list

			// Update the item in selectedItems if it exists there
			if (selectedItems.some((item) => item._id === updatedItem._id)) {
				onSelectedItemsChange(
					selectedItems.map((item) =>
						item._id === updatedItem._id
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
	 * Confirms deletion with user before proceeding
	 * Updates UI state and database through server action
	 * @param itemId ID of the item to delete
	 */
	const handleDeleteItem = async (itemId: string) => {
		if (!window.confirm("Are you sure you want to delete this item?")) {
			return;
		}

		try {
			setIsDeleting(itemId);
			await deleteItemFromDatabase(itemId);
			onItemsChange();

			// Remove item from selected items if it exists there
			if (selectedItems.some((item) => item._id === itemId)) {
				onSelectedItemsChange(
					selectedItems.filter((item) => item._id !== itemId)
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
		<div className="item-select-calculate">
			{/* Search and Filter Controls */}
			<div className="mb-4">
				<div className="row g-3">
					{/* Search Input */}
					<div className="col-md-6">
						<div className="input-group">
							<span className="input-group-text">
								<Search size={18} />
							</span>
							<input
								type="text"
								className="form-control"
								placeholder="Search items by name or SKU..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>

					{/* Sort Dropdown */}
					<div className="col-md-3">
						<select
							className="form-select"
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as SortOption)}
						>
							<option value="name">Sort by Name</option>
							<option value="weight">Sort by Weight</option>
							<option value="dimensions">Sort by Size</option>
							<option value="sku">Sort by SKU</option>
						</select>
					</div>

					{/* Filter Dropdown */}
					<div className="col-md-3">
						<select
							className="form-select"
							value={filterBy}
							onChange={(e) => setFilterBy(e.target.value as FilterOption)}
						>
							<option value="all">All Items</option>
							<option value="light">Light Items (&lt;500g)</option>
							<option value="heavy">Heavy Items (≥500g)</option>
						</select>
					</div>
				</div>
			</div>

			{/* Available Items List */}
			<div className="row mb-4">
				<div className="col-md-6">
					<h3 className="h5 mb-3">Available Items</h3>
					<div
						className="list-group"
						style={{ maxHeight: "400px", overflowY: "auto" }}
					>
						{processedItems.map((item) => (
							<div
								key={item.sku}
								className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
							>
								<div className="flex-grow-1">
									<h6 className="mb-1">{item.name}</h6>
									<small className="text-muted">
										{item.length}x{item.width}x{item.height}mm | {item.weight}g
										{item.sku && ` | SKU: ${item.sku}`}
									</small>
								</div>
								<div className="btn-group">
									{/* Add Item Button */}
									<button
										className="btn btn-outline-primary btn-sm"
										onClick={() => handleSelectItem(item)}
										title="Add to selection"
									>
										<Plus size={16} />
									</button>

									{/* Edit Item Button */}
									<button
										className="btn btn-outline-secondary btn-sm"
										onClick={() => handleEditItem(item)}
										title="Edit item"
									>
										<Edit size={16} />
									</button>

									{/* Delete Item Button */}
									<button
										className="btn btn-outline-danger btn-sm"
										onClick={() => handleDeleteItem(item._id as string)}
										disabled={isDeleting === item._id}
										title="Delete item"
									>
										{isDeleting === item._id ? (
											<span className="spinner-border spinner-border-sm" />
										) : (
											<Trash2 size={16} />
										)}
									</button>
								</div>
							</div>
						))}
						{processedItems.length === 0 && (
							<div className="list-group-item text-center text-muted">
								No items found
							</div>
						)}
					</div>
				</div>

				{/* Selected Items List */}
				<div className="col-md-6">
					<h3 className="h5 mb-3">Selected Items</h3>
					<div
						className="list-group"
						style={{ maxHeight: "400px", overflowY: "auto" }}
					>
						{selectedItems.map((item) => (
							<div
								key={item.sku}
								className="list-group-item d-flex justify-content-between align-items-center"
							>
								<div className="flex-grow-1">
									<h6 className="mb-1">{item.name}</h6>
									<small className="text-muted">
										{item.length}x{item.width}x{item.height}mm | {item.weight}g
										{item.sku && ` | SKU: ${item.sku}`}
									</small>
								</div>
								<div className="d-flex align-items-center">
									{/* Quantity Controls */}
									<div className="btn-group me-2">
										<button
											className="btn btn-outline-secondary btn-sm"
											onClick={() => updateQuantity(item._id as string, -1)}
										>
											<Minus size={16} />
										</button>
										<span className="btn btn-outline-secondary btn-sm disabled">
											{item.quantity}
										</span>
										<button
											className="btn btn-outline-secondary btn-sm"
											onClick={() => updateQuantity(item._id as string, 1)}
										>
											<Plus size={16} />
										</button>
									</div>
									{/* Remove Item Button */}
									<button
										className="btn btn-outline-danger btn-sm"
										onClick={() => handleRemoveItem(item._id as string)}
									>
										<X size={16} />
									</button>
								</div>
							</div>
						))}
						{selectedItems.length === 0 && (
							<div className="list-group-item text-center text-muted">
								No items selected
							</div>
						)}
					</div>

					{/* Total Weight Display */}
					{selectedItems.length > 0 && (
						<div className="mt-3">
							<p className="mb-2">
								<strong>Total Weight:</strong> {totalWeight}g
							</p>
						</div>
					)}

					{/* Calculate Button */}
					<button
						className="btn btn-primary mt-3"
						onClick={() => onCalculateBox(selectedItems)}
						disabled={selectedItems.length === 0}
					>
						Calculate Box Size
					</button>
				</div>
			</div>

			{/* Edit Modal */}
			{editItem && (
				<ItemEditModal
					item={editItem}
					isOpen={isEditModalOpen}
					onClose={() => {
						setIsEditModalOpen(false);
						setEditItem(null);
					}}
					onSave={async (updatedItem) => {
						await handleUpdateItem(updatedItem);
						setIsEditModalOpen(false);
						setEditItem(null);
					}}
				/>
			)}
		</div>
	);
}
