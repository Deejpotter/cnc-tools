/**
 * Item select and calculate interface component
 * Updated: 07/05/25
 * Author: Deej Potter
 * Description: Provides a user interface for selecting items, calculating box sizes, and managing item data.
 * Used on the Box Shipping Calculator page.
 * This component allows users to search, filter, and sort items, as well as add, edit, and delete items from the database.
 *
 * Note: This component handles client-side operations for item management.
 * Database operations are handled through server actions to maintain proper separation of concerns.
 */

"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import ShippingItem, {
	SelectedShippingItem,
} from "@/types/box-shipping-calculator/ShippingItem";
import { Search, Plus, Minus, X, Edit, Trash2, Save } from "lucide-react";

/**
 * Props interface for ItemSelectAndCalculate component
 * Defines the expected properties and callbacks for the component
 *
 * - availableItems: All items from DB (ShippingItem[])
 * - selectedItems: UI state, includes quantity (SelectedShippingItem[])
 * - onSelectedItemsChange: callback for UI state (SelectedShippingItem[])
 * - onCalculateBox: callback for calculation, receives SelectedShippingItem[] with quantities
 */
interface ItemSelectAndCalculateProps {
	availableItems: ShippingItem[];
	selectedItems: SelectedShippingItem[];
	onSelectedItemsChange: (items: SelectedShippingItem[]) => void;
	/**
	 * Callback to trigger box calculation. Receives SelectedShippingItem[] with quantities.
	 */
	onCalculateBox: (items: SelectedShippingItem[]) => void;
	onItemsChange: () => void;
	/**
	 * Optional callback for when an item is updated
	 * If provided, will be called instead of onItemsChange for better performance
	 */
	onItemUpdate?: (updatedItem: ShippingItem) => void;
	/**
	 * Optional callback for when an item is deleted
	 * If provided, will be called instead of onItemsChange for better performance
	 */
	onItemDelete?: (deletedItemId: string) => void;
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
	onItemUpdate,
	onItemDelete,
}: ItemSelectAndCalculateProps) {
	// State Management
	// ---------------
	const [searchTerm, setSearchTerm] = useState(""); // Search input value
	const [sortBy, setSortBy] = useState<SortOption>("name"); // Current sort criteria
	const [filterBy, setFilterBy] = useState<FilterOption>("all"); // Current filter criteria
	const [editingItemId, setEditingItemId] = useState<string | null>(null); // ID of item being edited inline
	const [editingItemData, setEditingItemData] = useState<ShippingItem | null>(
		null
	); // Temporary data for the item being edited
	const [isDeleting, setIsDeleting] = useState<string | null>(null); // Item being deleted (using string ID)
	const [pendingUpdates, setPendingUpdates] = useState<string[]>([]); // Track items with pending DB updates
	// Focus and UX state
	const [lastEditedItems, setLastEditedItems] = useState<string[]>([]); // IDs of recently edited items
	const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]); // IDs of deleted items to filter out of UI
	const availableItemsRef = useRef<HTMLDivElement>(null); // Reference for scrolling back to position
	const [scrollPosition, setScrollPosition] = useState(0); // Remember scroll position
	// Loading state for items - this component now manages its own loading
	const [isLoadingItems, setIsLoadingItems] = useState(true);
	// Hydration fix: Track if component is mounted to prevent SSR/client mismatch
	const [isMounted, setIsMounted] = useState(false);

	/**
	 * Handle hydration by setting mounted state
	 */
	useEffect(() => {
		setIsMounted(true);
	}, []);

	/**
	 * Load available items when component mounts
	 * This moved from the parent page component to avoid blocking the entire page
	 */
	useEffect(() => {
		if (!isMounted) return; // Don't load until component is mounted on client

		const loadItemsOnMount = async () => {
			if (availableItems.length === 0) {
				setIsLoadingItems(true);
				try {
					await onItemsChange(); // Trigger parent to load items
				} finally {
					setIsLoadingItems(false);
				}
			} else {
				setIsLoadingItems(false);
			}
		};
		loadItemsOnMount();
	}, [isMounted, availableItems.length, onItemsChange]);

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
	 *
	 * Debug: Log the availableItems and processedItems to verify weights before rendering.
	 */
	const processedItems = useMemo(() => {
		// Debug: Log availableItems to verify weights before filtering/sorting
		console.log("[ItemSelectAndCalculate] availableItems:", availableItems);
		// First filter items based on search term, weight filter, and deleted status
		let filtered = availableItems.filter((item) => {
			// Skip deleted items
			if (deletedItemIds.includes(String(item._id))) {
				return false;
			}

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
		const sorted = filtered.sort((a, b) => {
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
		// Debug: Log processedItems to verify weights after filtering/sorting
		console.log("[ItemSelectAndCalculate] processedItems:", sorted);
		return sorted;
	}, [availableItems, searchTerm, sortBy, filterBy, deletedItemIds]);

	/**
	 * Add an item to the selected items list or increment its quantity
	 * If the item already exists, its quantity is incremented
	 * If it's a new item, it's added with quantity 1
	 * @param item Item to add or increment
	 */ const handleSelectItem = (item: ShippingItem) => {
		const existingItem = selectedItems.find(
			(i) => String(i._id) === String(item._id)
		);
		if (existingItem) {
			// If item exists, increment its quantity
			onSelectedItemsChange(
				selectedItems.map((i) =>
					String(i._id) === String(item._id)
						? { ...i, quantity: (i.quantity || 1) + 1 }
						: i
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
	 */ const updateQuantity = (itemId: string, delta: number) => {
		const updatedItems = selectedItems.map((item) => {
			if (String(item._id) === itemId) {
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
	 */ const handleRemoveItem = (itemId: string) => {
		onSelectedItemsChange(
			selectedItems.filter((item) => String(item._id) !== itemId)
		);
	};
	/**
	 * Start inline editing for an item
	 * @param item Item to edit
	 */
	const handleEditItem = (item: ShippingItem) => {
		// Save scroll position before starting edit
		if (availableItemsRef.current) {
			setScrollPosition(availableItemsRef.current.scrollTop);
		}
		setEditingItemId(String(item._id));
		setEditingItemData({ ...item });
	};

	/**
	 * Cancel inline editing
	 */
	const cancelEdit = () => {
		setEditingItemId(null);
		setEditingItemData(null);
	};
	/**
	 * Handle keyboard navigation during editing
	 * Provides shortcuts for saving (Enter), canceling (Escape), and navigating between inputs (Tab)
	 * Tab navigation uses browser's default behavior to move focus between inputs
	 * @param e Keyboard event
	 * @param item Current item being edited
	 */
	const handleKeyDown = (e: React.KeyboardEvent, item: ShippingItem) => {
		if (e.key === "Enter" && !e.shiftKey) {
			// Save changes with Enter
			e.preventDefault();
			editingItemData && handleUpdateItem(editingItemData);
		} else if (e.key === "Escape") {
			// Cancel with Escape
			e.preventDefault();
			cancelEdit();
		}
		// Default behavior for Tab to allow moving between inputs
		// This uses the browser's built-in focus management
	};
	/**
	 * Handle item update submission
	 * Updates the item immediately in the UI and syncs to database in background
	 * This approach prevents UI disruption while ensuring data persistence
	 * @param updatedItem Item with updated values
	 */ const handleUpdateItem = async (updatedItem: ShippingItem) => {
		try {
			// Save scroll position before update
			if (availableItemsRef.current) {
				setScrollPosition(availableItemsRef.current.scrollTop);
			}

			// Ensure weights and dimensions are integers
			const processedItem = {
				...updatedItem,
				weight: Math.round(updatedItem.weight),
				length: Math.round(updatedItem.length),
				width: Math.round(updatedItem.width),
				height: Math.round(updatedItem.height),
			};

			// Update any selected items that match this ID first (immediate UI update)
			if (
				selectedItems.some(
					(item) => String(item._id) === String(updatedItem._id)
				)
			) {
				onSelectedItemsChange(
					selectedItems.map((item) =>
						String(item._id) === String(updatedItem._id)
							? { ...updatedItem, quantity: item.quantity }
							: item
					)
				);
			}

			// Mark this item as recently edited for highlighting
			setLastEditedItems([String(processedItem._id)]);

			// Add this item to pending updates
			setPendingUpdates((prev) => [...prev, String(processedItem._id)]);

			// Reset editing state immediately to provide responsive UI
			setEditingItemId(null);
			setEditingItemData(null);

			// Update the database in the background using backend API
			updateItemInBackend(processedItem)
				.then((response) => {
					setPendingUpdates((prev) =>
						prev.filter((id) => id !== String(processedItem._id))
					);
					// Use specific callback if available, otherwise reload all items
					if (onItemUpdate && response.success && response.data) {
						onItemUpdate(response.data);
					} else {
						onItemsChange();
					}
				})
				.catch((error) => {
					console.error("Background item update failed:", error);
					// On error, trigger reload to ensure consistency
					onItemsChange();
				});
		} catch (error) {
			console.error("Failed to update item:", error);
			throw error;
		}
	};

	const handleDeleteItem = async (itemId: string) => {
		if (!window.confirm("Are you sure you want to delete this item?")) {
			return;
		}
		try {
			setIsDeleting(itemId);
			setDeletedItemIds((prev) => [...prev, itemId]);

			// Delete from backend API
			await deleteItemInBackend(itemId);

			// Remove from selected items if it was selected
			onSelectedItemsChange(
				selectedItems.filter((item) => String(item._id) !== itemId)
			);

			// Use specific callback if available, otherwise reload all items
			if (onItemDelete) {
				onItemDelete(itemId);
			} else {
				// Trigger parent to reload items from database to reflect deletion
				onItemsChange();
			}
		} catch (error) {
			console.error("Failed to delete item:", error);
			// On error, remove from local deleted items list and reload
			setDeletedItemIds((prev) => prev.filter((id) => id !== itemId));
			onItemsChange();
		} finally {
			setIsDeleting(null);
		}
	};

	/**
	 * Effect to restore scroll position after item updates and handle highlighting
	 */
	useEffect(() => {
		// Restore scroll position when items change
		if (availableItemsRef.current && scrollPosition > 0) {
			availableItemsRef.current.scrollTop = scrollPosition;
		}

		// Clear highlight after 2 seconds
		if (lastEditedItems.length > 0) {
			const timer = setTimeout(() => {
				setLastEditedItems([]);
			}, 2000);

			return () => clearTimeout(timer);
		}
	}, [availableItems, scrollPosition, lastEditedItems]);

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
				{" "}
				<div className="col-md-6">
					{" "}
					<div className="d-flex justify-content-between align-items-center mb-3">
						<h3 className="h5 mb-0">Available Items</h3>
					</div>
					<div
						className="list-group"
						style={{ maxHeight: "400px", overflowY: "auto" }}
						ref={availableItemsRef}
					>
						{!isMounted || isLoadingItems ? (
							/* Loading state - shown during SSR and while loading */
							<div className="list-group-item text-center">
								<div
									className="spinner-border spinner-border-sm me-2"
									role="status"
								>
									<span className="visually-hidden">Loading...</span>
								</div>
								Loading items...
							</div>
						) : (
							/* Items list */
							<>
								{processedItems.map((item) => (
									<div
										key={String(item._id)}
										className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
											lastEditedItems.includes(String(item._id))
												? "list-group-item-success"
												: ""
										}`}
									>
										{editingItemId ===
										String(item._id) /* Inline Edit Mode */ ? (
											<div
												className="w-100"
												onKeyDown={(e) => handleKeyDown(e, item)}
											>
												<div className="mb-2">
													<input
														type="text"
														className="form-control form-control-sm mb-2"
														placeholder="Item name"
														value={editingItemData?.name || ""}
														onChange={(e) =>
															setEditingItemData((prev) =>
																prev ? { ...prev, name: e.target.value } : null
															)
														}
														autoFocus
													/>
													<div className="row g-2 mb-2">
														{" "}
														<div className="col">
															{" "}
															<input
																type="number"
																className="form-control form-control-sm"
																placeholder="Length (mm)"
																value={editingItemData?.length || 0}
																step="1"
																min="1"
																pattern="[0-9]*"
																onChange={(e) => {
																	const rawValue = Number(e.target.value);
																	const roundedValue = Math.round(rawValue);

																	setEditingItemData((prev) =>
																		prev
																			? {
																					...prev,
																					length: roundedValue,
																			  }
																			: null
																	);
																}}
															/>
														</div>{" "}
														<div className="col">
															{" "}
															<input
																type="number"
																className="form-control form-control-sm"
																placeholder="Width (mm)"
																value={editingItemData?.width || 0}
																step="1"
																min="1"
																pattern="[0-9]*"
																onChange={(e) => {
																	const rawValue = Number(e.target.value);
																	const roundedValue = Math.round(rawValue);

																	setEditingItemData((prev) =>
																		prev
																			? {
																					...prev,
																					width: roundedValue,
																			  }
																			: null
																	);
																}}
															/>
														</div>{" "}
														<div className="col">
															{" "}
															<input
																type="number"
																className="form-control form-control-sm"
																placeholder="Height (mm)"
																value={editingItemData?.height || 0}
																step="1"
																min="1"
																pattern="[0-9]*"
																onChange={(e) => {
																	const rawValue = Number(e.target.value);
																	const roundedValue = Math.round(rawValue);

																	setEditingItemData((prev) =>
																		prev
																			? {
																					...prev,
																					height: roundedValue,
																			  }
																			: null
																	);
																}}
															/>
														</div>{" "}
														<div className="col">
															<input
																type="number"
																className="form-control form-control-sm"
																placeholder="Weight (g)"
																value={editingItemData?.weight || 0}
																step="1"
																min="1"
																pattern="[0-9]*"
																onChange={(e) => {
																	const rawValue = Number(e.target.value);
																	const roundedValue = Math.round(rawValue);

																	setEditingItemData((prev) =>
																		prev
																			? { ...prev, weight: roundedValue }
																			: null
																	);
																}}
															/>
														</div>
													</div>
													<input
														type="text"
														className="form-control form-control-sm"
														placeholder="SKU (optional)"
														value={editingItemData?.sku || ""}
														onChange={(e) =>
															setEditingItemData((prev) =>
																prev ? { ...prev, sku: e.target.value } : null
															)
														}
													/>{" "}
												</div>{" "}
												<div className="d-flex justify-content-between align-items-center">
													<small className="text-muted">
														Tab to navigate fields, Enter to save, Esc to cancel
													</small>
													<div>
														<button
															className="btn btn-sm btn-outline-secondary me-2"
															onClick={cancelEdit}
														>
															Cancel
														</button>
														<button
															className="btn btn-sm btn-success"
															onClick={() =>
																editingItemData &&
																handleUpdateItem(editingItemData)
															}
														>
															<Save size={16} className="me-1" />
															Save
														</button>
													</div>
												</div>
											</div>
										) : (
											/* Normal View Mode */ <>
												{" "}
												<div className="flex-grow-1">
													<h6 className="mb-1">
														{item.name}
														{pendingUpdates.includes(String(item._id)) && (
															<small className="ms-2">
																<span
																	className="spinner-border spinner-border-sm text-secondary"
																	style={{ width: "0.8rem", height: "0.8rem" }}
																/>
															</small>
														)}
													</h6>
													<small className="text-muted">
														{item.length}x{item.width}x{item.height}mm |{" "}
														{item.weight}g{item.sku && ` | SKU: ${item.sku}`}
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
														onClick={() => handleDeleteItem(String(item._id))}
														disabled={isDeleting === String(item._id)}
														title="Delete item"
													>
														{isDeleting === String(item._id) ? (
															<span className="spinner-border spinner-border-sm" />
														) : (
															<Trash2 size={16} />
														)}
													</button>
												</div>
											</>
										)}
									</div>
								))}
								{processedItems.length === 0 &&
									isMounted &&
									!isLoadingItems && (
										<div className="list-group-item text-center text-muted">
											No items found
										</div>
									)}
							</>
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
								key={String(item._id)}
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
											onClick={() => updateQuantity(String(item._id), -1)}
										>
											<Minus size={16} />
										</button>
										<span className="btn btn-outline-secondary btn-sm disabled">
											{item.quantity}
										</span>
										<button
											className="btn btn-outline-secondary btn-sm"
											onClick={() => updateQuantity(String(item._id), 1)}
										>
											<Plus size={16} />
										</button>
									</div>
									{/* Remove Item Button */}
									<button
										className="btn btn-outline-danger btn-sm"
										onClick={() => handleRemoveItem(String(item._id))}
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
				</div>{" "}
			</div>
		</div>
	);
}

// Remove server action imports and use backend API endpoints for item update/delete
// These functions integrate with the technical-ai backend service
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Update an existing shipping item in the backend database
 * Endpoint: PUT /api/shipping/items/:id (Note: This endpoint may need to be implemented in backend)
 * @param item - The shipping item to update (includes _id)
 * Returns: { success: boolean, data: ShippingItem, error?: string }
 */
async function updateItemInBackend(item) {
	const res = await fetch(`${API_URL}/api/shipping/items/${item._id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(item),
	});
	return await res.json();
}

/**
 * Delete a shipping item from the backend database
 * Endpoint: DELETE /api/shipping/items/:id (Note: This endpoint may need to be implemented in backend)
 * @param id - The ID of the shipping item to delete
 * Returns: { success: boolean, error?: string }
 */
async function deleteItemInBackend(id) {
	const res = await fetch(`${API_URL}/api/shipping/items/${id}`, {
		method: "DELETE",
	});
	return await res.json();
}
