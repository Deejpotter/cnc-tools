"use client";
import React, { useState, useMemo } from "react";
import ShippingItem from "@/interfaces/ShippingItem";
import { Search, Plus, Minus, X, Filter, SortDesc } from "lucide-react";

interface ItemSelectAndCalculateProps {
	items: ShippingItem[];
	onCalculateBox: (selectedItems: ShippingItem[]) => void;
}

type SortOption = "name" | "weight" | "dimensions";
type FilterOption = "all" | "light" | "heavy";

/**
 * Component for selecting items and triggering box calculations
 * Handles item selection, removal, search, sorting, and filtering functionality
 */
export default function ItemSelectAndCalculate({
	items,
	onCalculateBox,
}: ItemSelectAndCalculateProps) {
	// State management
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedItems, setSelectedItems] = useState<
		(ShippingItem & { quantity: number })[]
	>([]);
	const [sortBy, setSortBy] = useState<SortOption>("name");
	const [filterBy, setFilterBy] = useState<FilterOption>("all");

	/**
	 * Calculate total weight of selected items
	 */
	const totalWeight = useMemo(() => {
		return selectedItems.reduce(
			(sum, item) => sum + item.weight * item.quantity,
			0
		);
	}, [selectedItems]);

	/**
	 * Filter and sort items based on current criteria
	 */
	const processedItems = useMemo(() => {
		let filtered = items.filter((item) => {
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
				default:
					return a.name.localeCompare(b.name);
			}
		});
	}, [items, searchTerm, sortBy, filterBy]);

	/**
	 * Add an item to the selected items list
	 */
	const handleSelectItem = (item: ShippingItem) => {
		setSelectedItems((prev) => {
			const existing = prev.find((i) => i.id === item.id);
			if (existing) {
				return prev.map((i) =>
					i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
				);
			}
			return [...prev, { ...item, quantity: 1 }];
		});
	};

	/**
	 * Update item quantity
	 */
	const updateQuantity = (itemId: string, delta: number) => {
		setSelectedItems((prev) =>
			prev.map((item) => {
				if (item.id === itemId) {
					const newQuantity = Math.max(1, item.quantity + delta);
					return { ...item, quantity: newQuantity };
				}
				return item;
			})
		);
	};

	/**
	 * Remove an item from the selected items list
	 */
	const handleRemoveItem = (itemId: string) => {
		setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
	};

	return (
		<div className="space-y-6">
			{/* Search and filters section */}
			<div className="flex flex-col md:flex-row gap-4">
				<div className="flex-1 relative">
					<Search
						className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
						size={20}
					/>
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search by name or SKU"
						className="w-full pl-10 p-2 border rounded"
					/>
				</div>

				<div className="flex gap-2">
					<select
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as SortOption)}
						className="p-2 border rounded"
					>
						<option value="name">Sort by Name</option>
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

			{/* Available items list */}
			<div className="grid md:grid-cols-2 gap-4">
				<div className="border rounded-lg p-4">
					<h3 className="font-bold mb-4">Available Items</h3>
					<div className="max-h-96 overflow-y-auto">
						{processedItems.map((item) => (
							<div
								key={item.id}
								className="flex justify-between items-center p-2 hover:bg-gray-50 border-b"
							>
								<div className="flex-1">
									<div className="font-medium">{item.name}</div>
									<div className="text-sm text-gray-500">
										{item.length}x{item.width}x{item.height}mm • {item.weight}g
									</div>
								</div>
								<button
									onClick={() => handleSelectItem(item)}
									className="ml-2 p-2 text-blue-500 hover:bg-blue-50 rounded"
								>
									<Plus size={20} />
								</button>
							</div>
						))}
					</div>
				</div>

				{/* Selected items list */}
				<div className="border rounded-lg p-4">
					<h3 className="font-bold mb-4">Selected Items</h3>
					<div className="max-h-96 overflow-y-auto">
						{selectedItems.map((item) => (
							<div
								key={item.id}
								className="flex justify-between items-center p-2 hover:bg-gray-50 border-b"
							>
								<div className="flex-1">
									<div className="font-medium">{item.name}</div>
									<div className="text-sm text-gray-500">
										{item.length}x{item.width}x{item.height}mm • {item.weight}g
									</div>
								</div>
								<div className="flex items-center gap-2">
									<button
										onClick={() => updateQuantity(item.id, -1)}
										className="p-1 text-gray-500 hover:bg-gray-100 rounded"
									>
										<Minus size={16} />
									</button>
									<span className="w-8 text-center">{item.quantity}</span>
									<button
										onClick={() => updateQuantity(item.id, 1)}
										className="p-1 text-gray-500 hover:bg-gray-100 rounded"
									>
										<Plus size={16} />
									</button>
									<button
										onClick={() => handleRemoveItem(item.id)}
										className="p-1 text-red-500 hover:bg-red-50 rounded"
									>
										<X size={16} />
									</button>
								</div>
							</div>
						))}
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
		</div>
	);
}
