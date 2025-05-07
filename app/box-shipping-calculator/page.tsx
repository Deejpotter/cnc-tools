/**
 * Box Shipping Calculator Page Component
 * Updated: 30/03/25
 * Author: Deej Potter
 * Description: This component provides a user interface for calculating the best box size for shipping items.
 * It includes features for importing items from a Maker Store invoice, selecting items, and manually adding new items.
 * The component uses server actions to interact with a MongoDB database for item management.
 */

"use client";

import React, { useState, useEffect } from "react";
import ShippingItem from "@/interfaces/box-shipping-calculator/ShippingItem";
import { DatabaseResponse } from "@/app/actions/mongodb/types";
import ItemAddForm from "./ItemAddForm";
import ItemSelectAndCalculate from "./ItemSelectAndCalculate";
import LayoutContainer from "@/components/LayoutContainer";
import { findBestBox } from "@/app/box-shipping-calculator/BoxCalculations";
import InvoiceUploader from "./InvoiceUploader";
import {
	getAvailableItems,
	addItemToDatabase,
	updateItemInDatabase,
	deleteItemFromDatabase,
} from "@/app/actions/mongodb/actions";

/**
 * Box Shipping Calculator Page Component
 * This is the main page component that combines all functionality for the shipping calculator:
 * 1. Invoice import and processing
 * 2. Item selection and management
 * 3. Box size calculation
 * 4. Manual item addition
 */
const BoxShippingCalculatorPage: React.FC = () => {
	// State Management
	// ---------------
	const [items, setItems] = useState<ShippingItem[]>([]);
	const [selectedItems, setSelectedItems] = useState<ShippingItem[]>([]);
	const [packingResult, setPackingResult] = useState<any>(null);
	const [importError, setImportError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	/**
	 * Effect hook to load initial items from the database when the component mounts
	 * Uses the getAvailableItems server action to fetch data
	 */
	useEffect(() => {
		loadItems();
	}, []);

	/**
	 * Handles loading/reloading items from the database
	 * Used when items are updated, deleted, or added
	 * Shows loading state during fetch and handles errors
	 */
	const loadItems = async () => {
		try {
			setIsLoading(true);
			const response = await getAvailableItems();
			if (response.success && response.data) {
				setItems(response.data);
			} else {
				setImportError(response.error || "Failed to load items");
			}
		} catch (error) {
			console.error("Failed to load items:", error);
			setImportError("Failed to load available items");
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Handler for adding new items to the available items list
	 * Uses the addItemToDatabase server action
	 * @param item New item to be added to the database
	 */
	const handleAddItem = async (item: Omit<ShippingItem, "_id">) => {
		try {
			const response = await addItemToDatabase(item);
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
	 * Updates the items list with new items from the invoice
	 * @param newItems Array of items extracted from invoice
	 */
	const handleInvoiceItems = (newItems: ShippingItem[]) => {
		setItems((prev) => [...prev, ...newItems]);
		setImportError(null);
	};

	/**
	 * Handler for calculating the optimal box size
	 * Takes the currently selected items and finds the best box fit
	 * @param itemsToCalculate Array of items to calculate box size for
	 */
	const handleCalculateBox = (itemsToCalculate: ShippingItem[]) => {
		const result = findBestBox(itemsToCalculate);
		setPackingResult(result);
	};

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
				<h1 className="mb-4">Box Shipping Calculator</h1>

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
													{packingResult.box.length} x {packingResult.box.width}{" "}
													x {packingResult.box.height} mm
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
