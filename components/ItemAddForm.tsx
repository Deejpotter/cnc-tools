"use client";
import React, { useState } from "react";
import ShippingItem from "@/interfaces/ShippingItem";

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
	const [length, setLength] = useState("");
	const [width, setWidth] = useState("");
	const [height, setHeight] = useState("");
	const [weight, setWeight] = useState("");

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Create new item with unique ID
		const newItem: ShippingItem = {
			id: crypto.randomUUID(),
			name,
			length: Number(length),
			width: Number(width),
			height: Number(height),
			weight: Number(weight),
			quantity: 1,
		};

		// Add item and reset form
		onAddItem(newItem);
		setName("");
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
				className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
			>
				Add Item
			</button>
		</form>
	);
}
