/**
 * Box Shipping Calculator Page
 * Updated: 07/05/25
 * Author: Deej Potter
 * Description: Main UI for the box shipping calculator. Orchestrates invoice import, item management, and box calculation.
 *
 * Reasoning: Invoice import is chunked into fast, sequential server actions to avoid timeouts and make each step debuggable and retryable. UI state and progress are updated at each step for a responsive user experience.
 */

"use client";

import React, { useState, useEffect } from "react";
import ShippingItem, {
	SelectedShippingItem,
} from "@/types/box-shipping-calculator/ShippingItem";
import ItemAddForm from "./ItemAddForm";
import ItemSelectAndCalculate from "./ItemSelectAndCalculate";
import BoxResultsDisplay from "./BoxResultsDisplay";
import LayoutContainer from "@/components/LayoutContainer";
import {
	packItemsIntoMultipleBoxes,
	MultiBoxPackingResult,
} from "@/app/box-shipping-calculator/BoxCalculations";
import PdfImport from "@/components/PdfImport";

// All data operations now use backend API endpoints instead of Next.js server actions.
// These functions integrate with the technical-ai backend service running on localhost:5000
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetch all available shipping items from the backend database
 * Endpoint: GET /api/shipping/items
 * Returns: { success: boolean, data: ShippingItem[], error?: string }
 */
async function fetchAvailableItems() {
	const res = await fetch(`${API_URL}/api/shipping/items`);
	return await res.json();
}

/**
 * Add a new shipping item to the backend database
 * Endpoint: POST /api/shipping/items
 * @param item - The shipping item to add (without _id)
 * Returns: { success: boolean, data: ShippingItem, error?: string }
 */
async function addItemToBackend(item) {
	const res = await fetch(`${API_URL}/api/shipping/items`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(item),
	});
	return await res.json();
}

/**
 * Get available shipping boxes from backend
 * Endpoint: GET /api/shipping/boxes
 * Returns: ShippingBox[] array
 */
async function fetchAvailableBoxes() {
	const res = await fetch(`${API_URL}/api/shipping/boxes`);
	return await res.json();
}

/**
 * Calculate best box for given items using backend service
 * Endpoint: POST /api/shipping/calculate-best-box
 * @param items - Array of shipping items with quantities
 * Returns: BoxCalculationResult
 */
async function calculateBestBoxFromBackend(items) {
	const res = await fetch(`${API_URL}/api/shipping/calculate-best-box`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ items }),
	});
	return await res.json();
}

/**
 * Pack items into multiple boxes using backend service
 * Endpoint: POST /api/shipping/pack-multiple-boxes
 * @param items - Array of shipping items with quantities
 * Returns: MultiBoxPackingResult
 */
async function packItemsIntoMultipleBoxesFromBackend(items) {
	const res = await fetch(`${API_URL}/api/shipping/pack-multiple-boxes`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ items }),
	});
	return await res.json();
}

/**
 * Extract invoice items from text using backend AI service
 * Endpoint: POST /api/shipping/extract-invoice-items
 * @param text - The text content from the invoice
 * Returns: { success: boolean, data: Array, error?: string }
 */
async function extractInvoiceItemsFromBackend(text: string) {
	const res = await fetch(`${API_URL}/api/shipping/extract-invoice-items`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ text }),
	});
	return await res.json();
}

/**
 * Get item dimensions from backend using SKUs
 * Endpoint: POST /api/shipping/get-item-dimensions
 * @param extractedItems - Array of items with SKUs and quantities
 * Returns: { success: boolean, data: ShippingItem[], error?: string }
 */
async function getItemDimensionsFromBackend(extractedItems: any[]) {
	const res = await fetch(`${API_URL}/api/shipping/get-item-dimensions`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ extractedItems }),
	});
	return await res.json();
}

/**
 * Box Shipping Calculator Page Component
 */
const BoxShippingCalculatorPage: React.FC = () => {
	// State Management
	// ---------------
	const [items, setItems] = useState<ShippingItem[]>([]);
	const [selectedItems, setSelectedItems] = useState<SelectedShippingItem[]>(
		[]
	);
	const [packingResult, setPackingResult] =
		useState<MultiBoxPackingResult | null>(null);
	const [importError, setImportError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSyncing, setIsSyncing] = useState(false);

	/**
	 * Effect hook to load initial items and initialize sample data if needed
	 */
	useEffect(() => {
		// Load items from the database when the component mounts
		loadItems();
		// });
	}, []);

	/**
	 * Handles loading/reloading items from the database
	 * Used when items are updated, deleted, or added
	 * Shows loading state during fetch and handles errors
	 *
	 * Debug: Log the items loaded from the database to verify weights and data integrity.
	 */
	const loadItems = async () => {
		setIsLoading(true);
		try {
			const response = await fetchAvailableItems();
			if (response.success && response.data) {
				// Debug: Log all item weights loaded from DB
				console.debug(
					"[loadItems] Items loaded from DB:",
					response.data.map((item) => ({
						sku: item.sku,
						name: item.name,
						weight: item.weight,
					}))
				);
				// Warn if any item has zero or missing weight
				response.data.forEach((item) => {
					if (!item.weight || item.weight === 0) {
						console.warn(
							`[loadItems] WARNING: Item with SKU ${item.sku} has zero or missing weight!`,
							item
						);
					}
				});
				setItems(response.data);
				// Debug: Confirm items state after set
				setTimeout(() => {
					console.debug(
						"[loadItems] Items state after set:",
						response.data.map((item) => ({
							sku: item.sku,
							weight: item.weight,
						}))
					);
				}, 0);
			} else {
				setImportError(response.error || "Failed to load items");
				setItems([]); // Clear items on error
			}
		} catch (error) {
			console.error("Failed to load items:", error);
			setImportError("Error loading items from database.");
			setItems([]); // Clear items on error
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Handler for adding new items to the available items list
	 * @param item New item to be added to the database
	 */
	const handleAddItem = async (item: Omit<ShippingItem, "_id">) => {
		try {
			const response = await addItemToBackend(item);
			if (response.success && response.data) {
				setItems((prevItems) => [...prevItems, response.data]);
				setImportError(null);
			} else {
				setImportError(response.error || "Failed to add item");
			}
		} catch (error) {
			console.error("Failed to add item:", error);
			setImportError("Failed to add new item");
		}
	};

	/**
	 * Handler for importing items from a Maker Store invoice
	 * @param newItems Array of ShippingItem objects from processInvoice, already checked against/added to DB
	 */
	const handleInvoiceItems = async (newItems: ShippingItem[]) => {
		// The `newItems` are already processed by `processInvoice` and `getItemDimensions`.
		// This means they are either existing items from the DB (with updated quantities from the invoice)
		// or new items that have been estimated and added to the DB.
		try {
			// First, refresh the displayed list of available items from the database.
			await loadItems();

			// Now, add/update these invoice items in the selectedItems state.
			setSelectedItems((prevSelectedItems) => {
				const updatedSelectedItems = [...prevSelectedItems]; // Create a mutable copy

				newItems.forEach((invoiceItem) => {
					// Ensure invoiceItem._id is valid, as it's crucial for matching.
					if (!invoiceItem._id) {
						console.warn(
							"Invoice item missing _id, cannot add to selection:",
							invoiceItem
						);
						return; // Skip this item if it doesn't have an _id
					}
					const existingItemIndex = updatedSelectedItems.findIndex(
						(selItem) => selItem._id === invoiceItem._id
					);

					if (existingItemIndex > -1) {
						// Item already exists in selectedItems, so update its quantity
						const currentItem = updatedSelectedItems[existingItemIndex];
						updatedSelectedItems[existingItemIndex] = {
							...currentItem,
							// Ensure quantities are numbers before adding
							quantity:
								(Number(currentItem.quantity) || 0) +
								(Number((invoiceItem as any).quantity) || 0),
						};
					} else {
						// Item is not in selectedItems, add it.
						// The invoiceItem should already have the correct quantity from the invoice.
						updatedSelectedItems.push({
							...invoiceItem,
							quantity: Number((invoiceItem as any).quantity) || 1,
						});
					}
				});

				return updatedSelectedItems;
			});

			if (newItems.length > 0) {
				setImportError(null); // Clear any previous import errors
				// Optionally, provide a success message to the user here.
			} else {
				setImportError(
					"No items were processed from the invoice. The invoice might be empty or items lacked SKUs."
				);
			}
		} catch (error) {
			console.error(
				"An error occurred while refreshing items and updating selection after invoice processing:",
				error
			);
			setImportError(
				error instanceof Error
					? error.message
					: "Failed to update item list and selection after invoice processing."
			);
		}
	};
	/**
	 * Handler for calculating the optimal box size
	 * @param itemsToCalculate Array of items to calculate box size for
	 */
	const handleCalculateBox = (itemsToCalculate: ShippingItem[]) => {
		const result = packItemsIntoMultipleBoxes(itemsToCalculate);
		setPackingResult(result);
	};

	/**
	 * Sync with backend database by reloading all items
	 * This function refreshes the local items state from the backend database
	 * Useful when items may have been updated by other processes or users
	 */
	const syncWithBackend = async () => {
		const response = await fetchAvailableItems();
		if (response.success && response.data) {
			setItems(response.data);
			return { success: true, message: "Items synced successfully" };
		} else {
			return {
				success: false,
				message: response.error || "Failed to sync items",
			};
		}
	};

	/**
	 * Handler for manually triggering a sync with the remote database
	 */
	const handleSync = async () => {
		try {
			setIsSyncing(true);
			const response = await syncWithBackend();
			if (response.success) {
				// Optionally show a success message
			} else {
				setImportError(response.message || "Sync failed");
			}
		} catch (error) {
			console.error("Sync failed:", error);
			setImportError("Sync failed");
		} finally {
			setIsSyncing(false);
		}
	};
	/**
	 * Handler for when invoice items are directly extracted (new backend approach)
	 * The new PdfImport component handles the entire PDF-to-ShippingItems workflow
	 */

	// Render loading state while fetching initial data
	if (isLoading) {
		return (
			<LayoutContainer>
				<div className="container pb-5">
					<h1 className="mb-4">Box Shipping Calculator</h1>
					<div className="text-center">
						<div className="spinner-border" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
				</div>
			</LayoutContainer>
		);
	}

	return (
		<LayoutContainer>
			<div className="container pb-5">
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h1>Box Shipping Calculator</h1>
					<button
						className="btn btn-outline-primary"
						onClick={handleSync}
						disabled={isSyncing}
					>
						{isSyncing ? (
							<>
								<span
									className="spinner-border spinner-border-sm me-2"
									role="status"
									aria-hidden="true"
								></span>
								Syncing...
							</>
						) : (
							"Sync Data"
						)}
					</button>
				</div>

				<div className="row">
					{/* Invoice Import Section */}
					<div className="col-12 mb-4">
						<div className="card h-100 shadow bg-light">
							{" "}
							<div className="card-body">
								<h2 className="card-title mb-3">Import from Invoice</h2>{" "}
								<PdfImport
									onItemsExtracted={handleInvoiceItems}
									onError={setImportError}
									label="Import Maker Store Invoice (PDF or Text)"
									accept=".pdf,.txt,.text"
								/>
								{importError && (
									<p className="mt-3 text-danger">{importError}</p>
								)}
							</div>
						</div>
					</div>
					{/* Item Selection and Calculation Section */}
					<div className="col-12 mb-4">
						<div className="card h-100 shadow bg-light">
							<div className="card-body">
								<h2 className="card-title mb-3">Select Items</h2>
								<ItemSelectAndCalculate
									availableItems={items}
									selectedItems={selectedItems}
									onSelectedItemsChange={setSelectedItems}
									onCalculateBox={(items) => handleCalculateBox(items)}
									onItemsChange={loadItems}
								/>
							</div>
						</div>
					</div>{" "}
					{/* Box Results Display */}
					{packingResult && (
						<div className="col-12 mb-4">
							<div className="card h-100 shadow bg-light">
								<div className="card-body">
									<h2 className="card-title mb-3">Calculation Results</h2>
									<BoxResultsDisplay packingResult={packingResult} />
								</div>
							</div>
						</div>
					)}
					{/* Manual Item Addition Form */}
					<div className="col-12 mb-4">
						<div className="card h-100 shadow bg-light">
							<div className="card-body">
								<h2 className="card-title mb-3">Manually Add New Item</h2>
								<ItemAddForm onAddItem={handleAddItem} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</LayoutContainer>
	);
};

export default BoxShippingCalculatorPage;
