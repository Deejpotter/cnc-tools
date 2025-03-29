"use client";
import React, { useState, useEffect } from "react";
import ShippingItem from "@/interfaces/ShippingItem";
import ItemAddForm from "@/components/ItemAddForm";
import ItemSelectAndCalculate from "@/components/ItemSelectAndCalculate";
import LayoutContainer from "@/components/LayoutContainer";
import { findBestBox } from "@/utils/BoxCalculations";
import InvoiceUploader from "@/components/InvoiceUploader";
import {
	getAvailableItems,
	addItemToDatabase,
} from "@/app/actions/databaseActions";

/**
 * Box Shipping Calculator Page Component
 * Allows users to:
 * 1. Add items with dimensions and weight
 * 2. Select items for shipping
 * 3. Calculate the optimal box size for selected items
 * 4. Import items from Maker Store invoices
 */
const BoxShippingCalculatorPage: React.FC = () => {
	// State Management
	// ---------------
	// items: Master list of all available items that can be selected for shipping
	const [items, setItems] = useState<ShippingItem[]>([]);

	// selectedItems: Current items chosen by the user for box calculation
	const [selectedItems, setSelectedItems] = useState<ShippingItem[]>([]);

	// packingResult: Stores the calculation results from findBestBox
	const [packingResult, setPackingResult] = useState<any>(null);

	// importError: Captures and displays any errors during invoice import
	const [importError, setImportError] = useState<string | null>(null);

	// Loading state to handle data fetching
	const [isLoading, setIsLoading] = useState(true);

	/**
	 * Effect hook to load initial items from the database when the component mounts
	 * Uses the getAvailableItems server action to fetch data
	 */
	useEffect(() => {
		const loadItems = async () => {
			try {
				setIsLoading(true);
				const dbItems = await getAvailableItems();
				setItems(dbItems);
			} catch (error) {
				console.error("Failed to load items:", error);
				setImportError("Failed to load available items");
			} finally {
				setIsLoading(false);
			}
		};

		loadItems();
	}, []);

	/**
	 * Handler for adding new items to the available items list
	 * Generates a unique ID for each new item
	 * @param item - The new item to be added (without ID)
	 */
	const handleAddItem = async (item: ShippingItem) => {
		try {
			const newItem = await addItemToDatabase(item);
			setItems((prevItems) => [...prevItems, newItem]);
		} catch (error) {
			console.error("Failed to add item:", error);
			setImportError("Failed to add new item");
		}
	};

	/**
	 * Handler for importing items from a Maker Store invoice
	 * Updates the items list with new items from the invoice
	 * Clears any previous import errors on successful import
	 * @param newItems - Array of items extracted from the invoice
	 */
	const handleInvoiceItems = (newItems: ShippingItem[]) => {
		setItems((prev) => [...prev, ...newItems]);
		setImportError(null);
	};

	/**
	 * Handler for calculating the optimal box size
	 * Takes the currently selected items and finds the best box fit
	 * Updates the packingResult state with the calculation results
	 * @param itemsToCalculate - Array of items selected for shipping
	 */
	const handleCalculateBox = (itemsToCalculate: ShippingItem[]) => {
		const result = findBestBox(itemsToCalculate);
		setPackingResult(result);
	};

	/**
	 * Handler for refreshing the items list
	 * Used when items are updated, deleted, or added
	 */
	const loadItems = async () => {
		try {
			setIsLoading(true);
			const dbItems = await getAvailableItems();
			setItems(dbItems);
		} catch (error) {
			console.error("Failed to load items:", error);
			setImportError("Failed to load available items");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<LayoutContainer>
			{/* Main container with bottom padding */}
			<div className="container pb-5">
				{/* Page Header */}
				<h1 className="mb-4">Box Shipping Calculator</h1>

				{/* Loading State */}
				{isLoading ? (
					<div className="text-center pb-5">
						<p>Loading available items...</p>
					</div>
				) : (
					<div className="row">
						{/* Invoice Import Section */}
						<div className="col-12 mb-4">
							<div className="card h-100 shadow bg-light">
								<div className="card-body">
									<h2 className="card-title mb-3">
										Import from Maker Store Invoice
									</h2>
									<InvoiceUploader
										onItemsFound={handleInvoiceItems}
										onError={setImportError}
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
										onCalculateBox={handleCalculateBox}
										onItemsChange={loadItems}
									/>
								</div>
							</div>
						</div>

						{/* Calculation Results Display */}
						{packingResult && (
							<div className="col-12 mb-4">
								<div className="card h-100 shadow bg-light">
									<div className="card-body">
										<h2 className="card-title mb-3">Calculation Results</h2>
										{packingResult.success ? (
											<>
												<p className="text-success mb-3">Found suitable box!</p>
												<div className="mb-2">
													<p>
														<strong>Box:</strong> {packingResult.box.name}
													</p>
													<p>
														<strong>Dimensions:</strong>{" "}
														{packingResult.box.length} x{" "}
														{packingResult.box.width} x{" "}
														{packingResult.box.height} mm
													</p>
													<p>
														<strong>Max Weight:</strong>{" "}
														{packingResult.box.maxWeight}g
													</p>
												</div>
											</>
										) : (
											<p className="text-danger">
												Could not find a suitable box for all items. Consider
												splitting into multiple shipments.
											</p>
										)}
									</div>
								</div>
							</div>
						)}

						{/* New Item Addition Form */}
						<div className="col-12 mb-4">
							<div className="card h-100 shadow bg-light">
								<div className="card-body">
									<h2 className="card-title mb-3">Manually Add New Item</h2>
									<ItemAddForm onAddItem={handleAddItem} />
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</LayoutContainer>
	);
};

export default BoxShippingCalculatorPage;
