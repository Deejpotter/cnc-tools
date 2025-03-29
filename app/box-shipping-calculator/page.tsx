"use client";
import React, { useState } from "react";
import ShippingItem from "@/interfaces/ShippingItem";
import ItemAddForm from "@/components/ItemAddForm";
import ItemSelectAndCalculate from "@/components/ItemSelectAndCalculate";
import LayoutContainer from "@/components/LayoutContainer";
import { findBestBox } from "@/utils/BoxCalculations";
import InvoiceUploader from "@/components/InvoiceUploader";

/**
 * Box Shipping Calculator Page Component
 * Allows users to:
 * 1. Add items with dimensions and weight
 * 2. Select items for shipping
 * 3. Calculate the optimal box size for selected items
 */
const BoxShippingCalculatorPage: React.FC = () => {
	// State for storing all available items and calculation results
	const [items, setItems] = useState<ShippingItem[]>([]); // State for available items
	const [packingResult, setPackingResult] = useState<any>(null); // State for packing results
	const [importError, setImportError] = useState<string | null>(null); // State for import error messages

	/**
	 * Handler for adding new items to the available items list
	 * Generates a unique ID for each new item
	 */
	const handleAddItem = (item: ShippingItem) => {
		setItems((prevItems) => [
			...prevItems,
			{ ...item, id: crypto.randomUUID() },
		]);
	};

	/**
	 * Handler for importing items from a Maker Store invoice
	 * Uses the InvoiceUploader component to extract item information
	 */
	const handleInvoiceItems = (newItems: ShippingItem[]) => {
		setItems((prev) => [...prev, ...newItems]);
		setImportError(null);
	};

	/**
	 * Handler for calculating the optimal box size
	 * Uses the findBestBox utility function
	 */
	const handleCalculateBox = (selectedItems: ShippingItem[]) => {
		const result = findBestBox(selectedItems);
		setPackingResult(result);
	};

	return (
		<LayoutContainer>
			<div className="container mx-auto p-4">
				<h1 className="text-2xl font-bold mb-4">Box Shipping Calculator</h1>

				<div className="mb-6">
					<h2 className="text-xl mb-2">Import from Maker Store Invoice</h2>
					<InvoiceUploader
						onItemsFound={handleInvoiceItems}
						onError={setImportError}
					/>
					{importError && <p className="mt-2 text-red-600">{importError}</p>}
				</div>

				{/* Item selection and calculation section */}
				<ItemSelectAndCalculate
					items={items}
					onCalculateBox={handleCalculateBox}
				/>

				{/* Form to add new items */}
				<div className="mt-6">
					<h2 className="text-xl mb-2">Add New Item</h2>
					<ItemAddForm onAddItem={handleAddItem} />
				</div>

				{/* Results section */}
				{packingResult && (
					<div className="mt-6 p-4 border rounded">
						<h2 className="text-xl mb-2">Calculation Results</h2>
						{packingResult.success ? (
							<>
								<p className="text-green-600">Found suitable box!</p>
								<div className="mt-2">
									<p>
										<strong>Box:</strong> {packingResult.box.name}
									</p>
									<p>
										<strong>Dimensions:</strong> {packingResult.box.length} x{" "}
										{packingResult.box.width} x {packingResult.box.height} mm
									</p>
									<p>
										<strong>Max Weight:</strong> {packingResult.box.maxWeight}g
									</p>
								</div>
							</>
						) : (
							<p className="text-red-600">
								Could not find a suitable box for all items. Consider splitting
								into multiple shipments.
							</p>
						)}
					</div>
				)}
			</div>
		</LayoutContainer>
	);
};

export default BoxShippingCalculatorPage;
