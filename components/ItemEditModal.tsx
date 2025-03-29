"use client";
import { FC, FormEvent, useEffect, useState } from "react";
import ShippingItem from "@/interfaces/ShippingItem";

interface ItemEditModalProps {
	item: ShippingItem | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: (item: ShippingItem) => Promise<void>;
}

/**
 * Modal component for editing item details
 * Handles form validation and submission for item updates
 */
const ItemEditModal: FC<ItemEditModalProps> = ({
	item,
	isOpen,
	onClose,
	onSave,
}) => {
	const [formData, setFormData] = useState<ShippingItem | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Initialize form data when item changes
	useEffect(() => {
		setFormData(item);
		setError(null);
	}, [item]);

	if (!isOpen || !formData) return null;

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);

		try {
			await onSave(formData);
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save item");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-md">
				<h2 className="text-xl font-bold mb-4">Edit Item</h2>

				{error && (
					<div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-1">Name</label>
							<input
								type="text"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className="w-full p-2 border rounded"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">SKU</label>
							<input
								type="text"
								value={formData.sku || ""}
								onChange={(e) =>
									setFormData({ ...formData, sku: e.target.value })
								}
								className="w-full p-2 border rounded"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">
									Length (mm)
								</label>
								<input
									type="number"
									value={formData.length}
									onChange={(e) =>
										setFormData({
											...formData,
											length: Number(e.target.value),
										})
									}
									className="w-full p-2 border rounded"
									required
									min="0"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">
									Width (mm)
								</label>
								<input
									type="number"
									value={formData.width}
									onChange={(e) =>
										setFormData({
											...formData,
											width: Number(e.target.value),
										})
									}
									className="w-full p-2 border rounded"
									required
									min="0"
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">
									Height (mm)
								</label>
								<input
									type="number"
									value={formData.height}
									onChange={(e) =>
										setFormData({
											...formData,
											height: Number(e.target.value),
										})
									}
									className="w-full p-2 border rounded"
									required
									min="0"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">
									Weight (g)
								</label>
								<input
									type="number"
									value={formData.weight}
									onChange={(e) =>
										setFormData({
											...formData,
											weight: Number(e.target.value),
										})
									}
									className="w-full p-2 border rounded"
									required
									min="0"
								/>
							</div>
						</div>
					</div>

					<div className="mt-6 flex justify-end gap-2">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
							disabled={isSubmitting}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Saving..." : "Save Changes"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ItemEditModal;
