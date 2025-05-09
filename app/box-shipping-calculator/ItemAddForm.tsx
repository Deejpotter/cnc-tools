"use client";
import React, { useState } from "react";
import ShippingItem from "@/interfaces/box-shipping-calculator/ShippingItem";

interface ItemAddFormProps {
	onAddItem: (item: ShippingItem) => void;
}

/**
 * Form component for adding new items to the shipping calculator
 * Handles input validation and item creation
 */
export default function ItemAddForm({ onAddItem }: ItemAddFormProps) {
	// State for form fields
	const [name, setName] = useState("");
	const [sku, setSku] = useState("");
	const [length, setLength] = useState("");
	const [width, setWidth] = useState("");
	const [height, setHeight] = useState("");
	const [weight, setWeight] = useState("");

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Create new item with unique ID
		const newItem: ShippingItem = {
			_id: null, // ID will be generated by the database
			name, // Use the name provided in the form
			sku: sku || "", // Use empty string if SKU is not provided
			length: Number(length),
			width: Number(width),
			height: Number(height),
			weight: Number(weight),
			deletedAt: null,
			updatedAt: new Date(),
			quantity: 1,
		};

		// Add item and reset form
		onAddItem(newItem);
		setName("");
		setSku("");
		setLength("");
		setWidth("");
		setHeight("");
		setWeight("");
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label className="block mb-1">Name:</label>
				<input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
					className="w-full p-2 border rounded"
				/>
			</div>

			<div>
				<label className="block mb-1">SKU:</label>
				<input
					type="text"
					value={sku}
					onChange={(e) => setSku(e.target.value)}
					className="w-full p-2 border rounded"
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block mb-1">Length (mm):</label>
					<input
						type="number"
						value={length}
						onChange={(e) => setLength(e.target.value)}
						required
						min="1"
						className="w-full p-2 border rounded"
					/>
				</div>

				<div>
					<label className="block mb-1">Width (mm):</label>
					<input
						type="number"
						value={width}
						onChange={(e) => setWidth(e.target.value)}
						required
						min="1"
						className="w-full p-2 border rounded"
					/>
				</div>

				<div>
					<label className="block mb-1">Height (mm):</label>
					<input
						type="number"
						value={height}
						onChange={(e) => setHeight(e.target.value)}
						required
						min="1"
						className="w-full p-2 border rounded"
					/>
				</div>

				<div>
					<label className="block mb-1">Weight (g):</label>
					<input
						type="number"
						value={weight}
						onChange={(e) => setWeight(e.target.value)}
						required
						min="1"
						className="w-full p-2 border rounded"
					/>
				</div>
			</div>

			<button
				type="submit"
				className="w-full py-2 bg-blue text-white rounded hover:bg-light-blue transition duration-200"
			>
				Add Item
			</button>
		</form>
	);
}
