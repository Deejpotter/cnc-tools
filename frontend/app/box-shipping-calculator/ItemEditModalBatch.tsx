/**
 * ItemEditModalBatch
 * Updated: 14/05/2025
 * Author: Deej Potter
 * Description: Modal component for batch editing shipping items.
 * Allows efficient updating of weights and other properties across multiple items.
 */

import React, { useState, useEffect } from "react";
import ShippingItem from "/interfaces/box-shipping-calculator/ShippingItem";
import { Check, ChevronUp, ChevronRight, ChevronDown } from "lucide-react";

interface ItemEditModalBatchProps {
	items: ShippingItem[];
	isOpen: boolean;
	onClose: () => void;
	onSave: (items: ShippingItem[]) => Promise<void>;
}

interface EditField {
	name: string;
	type: string;
	label: string;
}

const ItemEditModalBatch: React.FC<ItemEditModalBatchProps> = ({
	items,
	isOpen,
	onClose,
	onSave,
}) => {
	const [editedItems, setEditedItems] = useState<ShippingItem[]>(items);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedField, setSelectedField] = useState<string>("weight");
	const [batchValue, setBatchValue] = useState<string>("");
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [selectAll, setSelectAll] = useState(true);
	const [selectedItems, setSelectedItems] = useState<{
		[key: string]: boolean;
	}>({});

	// Define the fields that can be batch edited
	const editFields: EditField[] = [
		{ name: "weight", type: "number", label: "Weight (g)" },
		{ name: "length", type: "number", label: "Length (mm)" },
		{ name: "width", type: "number", label: "Width (mm)" },
		{ name: "height", type: "number", label: "Height (mm)" },
	];

	// Initialize selected items
	useEffect(() => {
		if (items.length > 0) {
			const initialSelected = {};
			items.forEach((item) => {
				initialSelected[String(item._id)] = true;
			});
			setSelectedItems(initialSelected);
		}
	}, [items]);

	/**
	 * Toggle selection of all items
	 */
	const handleSelectAllToggle = () => {
		const newSelectAll = !selectAll;
		setSelectAll(newSelectAll);

		const newSelectedItems = { ...selectedItems };
		items.forEach((item) => {
			newSelectedItems[String(item._id)] = newSelectAll;
		});
		setSelectedItems(newSelectedItems);
	};

	/**
	 * Toggle selection of a single item
	 */
	const handleItemToggle = (itemId: string) => {
		const newSelectedItems = {
			...selectedItems,
			[itemId]: !selectedItems[itemId],
		};
		setSelectedItems(newSelectedItems);

		// Update selectAll based on whether all items are selected
		const allSelected = items.every(
			(item) => newSelectedItems[String(item._id)]
		);
		setSelectAll(allSelected);
	};
	/**
	 * Apply the batch value to all selected items for the selected field
	 */
	const applyBatchValue = () => {
		if (!batchValue) return;

		let value;
		if (
			selectedField === "weight" ||
			selectedField === "length" ||
			selectedField === "width" ||
			selectedField === "height"
		) {
			// Ensure numeric fields are rounded to whole numbers
			value = Math.round(Number(batchValue));
		} else {
			value = batchValue;
		}

		setEditedItems((prev) =>
			prev.map((item) =>
				selectedItems[String(item._id)]
					? { ...item, [selectedField]: value }
					: item
			)
		);
	};

	/**
	 * Handle individual item field change
	 */
	const handleItemChange = (itemId: string, fieldName: string, value: any) => {
		setEditedItems((prev) =>
			prev.map((item) =>
				String(item._id) === itemId ? { ...item, [fieldName]: value } : item
			)
		);
	};

	/**
	 * Handle form submission
	 */
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSaving(true);

		try {
			// Only save items that were actually modified
			const itemsToSave = editedItems.filter((editedItem, idx) => {
				const originalItem = items[idx];
				return JSON.stringify(editedItem) !== JSON.stringify(originalItem);
			});

			if (itemsToSave.length > 0) {
				await onSave(itemsToSave);
			} else {
				onClose();
			}
		} catch (error) {
			setError("Failed to save changes. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div
			className="modal d-block"
			style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
		>
			<div className="modal-dialog modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">Batch Edit Items</h5>
						<button
							type="button"
							className="btn-close"
							onClick={onClose}
							disabled={isSaving}
						/>
					</div>
					<form onSubmit={handleSubmit}>
						<div className="modal-body">
							{error && (
								<div className="alert alert-danger" role="alert">
									{error}
								</div>
							)}

							{/* Batch Update Section */}
							<div className="card mb-3">
								<div className="card-header bg-light">
									<h6 className="mb-0">Batch Update</h6>
								</div>
								<div className="card-body">
									<div className="row align-items-end">
										<div className="col-md-4">
											<label className="form-label">Select Field</label>
											<select
												className="form-select"
												value={selectedField}
												onChange={(e) => setSelectedField(e.target.value)}
											>
												{editFields.map((field) => (
													<option key={field.name} value={field.name}>
														{field.label}
													</option>
												))}
											</select>
										</div>
										<div className="col-md-4">
											<label className="form-label">New Value</label>
											<input
												type={
													selectedField === "weight" ||
													selectedField === "length" ||
													selectedField === "width" ||
													selectedField === "height"
														? "number"
														: "text"
												}
												className="form-control"
												value={batchValue}
												onChange={(e) => setBatchValue(e.target.value)}
												min={
													selectedField === "weight" ||
													selectedField === "length" ||
													selectedField === "width" ||
													selectedField === "height"
														? "1"
														: undefined
												}
											/>
										</div>
										<div className="col-md-4">
											<button
												type="button"
												className="btn btn-primary w-100"
												onClick={applyBatchValue}
												disabled={!batchValue}
											>
												Apply to Selected
											</button>
										</div>
									</div>
								</div>
							</div>

							{/* Item Selection and Individual Editing */}
							<div className="d-flex justify-content-between align-items-center mb-2">
								<div>
									<div className="form-check">
										<input
											className="form-check-input"
											type="checkbox"
											id="selectAll"
											checked={selectAll}
											onChange={handleSelectAllToggle}
										/>
										<label className="form-check-label" htmlFor="selectAll">
											Select All Items
										</label>
									</div>
								</div>
								<button
									type="button"
									className="btn btn-sm btn-link text-decoration-none"
									onClick={() => setShowAdvanced(!showAdvanced)}
								>
									{showAdvanced ? (
										<>
											Hide Advanced <ChevronUp size={16} />
										</>
									) : (
										<>
											Show Advanced <ChevronDown size={16} />
										</>
									)}
								</button>
							</div>

							<div style={{ maxHeight: "400px", overflowY: "auto" }}>
								<table className="table table-sm table-hover">
									<thead className="table-light sticky-top">
										<tr>
											<th style={{ width: "40px" }}></th>
											<th>Name</th>
											<th style={{ width: "100px" }}>Weight</th>
											{showAdvanced && (
												<>
													<th style={{ width: "80px" }}>Length</th>
													<th style={{ width: "80px" }}>Width</th>
													<th style={{ width: "80px" }}>Height</th>
												</>
											)}
										</tr>
									</thead>
									<tbody>
										{editedItems.map((item, index) => (
											<tr key={String(item._id)}>
												<td>
													<div className="form-check">
														<input
															className="form-check-input"
															type="checkbox"
															checked={selectedItems[String(item._id)] || false}
															onChange={() =>
																handleItemToggle(String(item._id))
															}
															id={`item-${item._id}`}
														/>
													</div>
												</td>
												<td>
													<label
														htmlFor={`item-${item._id}`}
														className="mb-0 d-block"
													>
														{item.name}
														{item.sku && (
															<small className="text-muted d-block">
																SKU: {item.sku}
															</small>
														)}
													</label>
												</td>
												<td>
													<input
														type="number"
														className="form-control form-control-sm"
														value={item.weight}
														onChange={(e) =>
															handleItemChange(
																String(item._id),
																"weight",
																Number(e.target.value)
															)
														}
														min="1"
													/>
												</td>
												{showAdvanced && (
													<>
														<td>
															<input
																type="number"
																className="form-control form-control-sm"
																value={item.length}
																onChange={(e) =>
																	handleItemChange(
																		String(item._id),
																		"length",
																		Number(e.target.value)
																	)
																}
																min="1"
															/>
														</td>
														<td>
															<input
																type="number"
																className="form-control form-control-sm"
																value={item.width}
																onChange={(e) =>
																	handleItemChange(
																		String(item._id),
																		"width",
																		Number(e.target.value)
																	)
																}
																min="1"
															/>
														</td>
														<td>
															<input
																type="number"
																className="form-control form-control-sm"
																value={item.height}
																onChange={(e) =>
																	handleItemChange(
																		String(item._id),
																		"height",
																		Number(e.target.value)
																	)
																}
																min="1"
															/>
														</td>
													</>
												)}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
						<div className="modal-footer">
							<button
								type="button"
								className="btn btn-secondary"
								onClick={onClose}
								disabled={isSaving}
							>
								Cancel
							</button>
							<button
								type="submit"
								className="btn btn-primary"
								disabled={isSaving}
							>
								{isSaving ? (
									<>
										<span className="spinner-border spinner-border-sm me-2" />
										Saving...
									</>
								) : (
									"Save All Changes"
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ItemEditModalBatch;


