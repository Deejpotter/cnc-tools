/**
 * ItemAddFormClient
 * Updated: 05/27/2025
 * Author: Deej Potter
 * Description: Client-side form component for adding new items to the shipping calculator.
 * Handles input validation and item creation with proper dimensioning.
 * Enhanced with Bootstrap styling, improved validation, and better user feedback.
 */

"use client";
import React, { useState } from "react";
import type { ShippingItem } from "../../../types/box-shipping-calculator";
import { Plus, RotateCcw, PenTool } from "lucide-react"; // Icons for better UX

export default function ItemAddFormClient() {
	// State for form fields
	const [name, setName] = useState("");
	const [sku, setSku] = useState("");
	const [length, setLength] = useState("");
	const [width, setWidth] = useState("");
	const [height, setHeight] = useState("");
	const [weight, setWeight] = useState("");

	// State for form validation
	const [validated, setValidated] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isTouched, setIsTouched] = useState({
		name: false,
		length: false,
		width: false,
		height: false,
		weight: false,
	});

	/**
	 * Reset form to initial state
	 * Clears all input fields and validation state
	 */
	const resetForm = () => {
		setName("");
		setSku("");
		setLength("");
		setWidth("");
		setHeight("");
		setWeight("");
		setValidated(false);
		setIsTouched({
			name: false,
			length: false,
			width: false,
			height: false,
			weight: false,
		});
	};

	/**
	 * Fill form with sample dimensions
	 * Helps users by providing common dimension templates
	 * @param preset The preset name to apply
	 */
	const applyDimensionPreset = (preset: string) => {
		switch (preset) {
			case "small":
				setLength("100");
				setWidth("80");
				setHeight("30");
				setWeight("250");
				break;
			case "medium":
				setLength("200");
				setWidth("150");
				setHeight("50");
				setWeight("500");
				break;
			case "large":
				setLength("300");
				setWidth("200");
				setHeight("100");
				setWeight("1000");
				break;
			default:
				break;
		}

		// Mark all dimension fields as touched
		setIsTouched((prev) => ({
			...prev,
			length: true,
			width: true,
			height: true,
			weight: true,
		}));
	};
	/**
	 * Handle form submission with validation
	 * Creates a new shipping item and sends it to the API
	 * Provides visual feedback during submission
	 * @param e Form submit event
	 */
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Mark form as validated to show validation feedback
		setValidated(true);

		const form = e.currentTarget;
		if (form.checkValidity() === false) {
			e.stopPropagation();
			return;
		}

		setIsSubmitting(true);

		// Create new item with unique ID
		const newItem: ShippingItem = {
			name, // Use the name provided in the form
			sku: sku || "", // Use empty string if SKU is not provided
			length: Math.round(Number(length)),
			width: Math.round(Number(width)),
			height: Math.round(Number(height)),
			weight: Math.round(Number(weight)),
			updatedAt: new Date().toISOString(),
			createdAt: new Date().toISOString(),
			deletedAt: null,
			quantity: 1,
		};

		// Send the item to the backend API
		fetch("/api/items", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(newItem),
		})
			.then((response) => response.json())
			.then(() => {
				// Reset form after successful submission
				resetForm();
				// Simulate a refresh of items list by reloading the page
				window.location.reload();
			})
			.catch((error) => {
				console.error("Error adding item:", error);
			})
			.finally(() => {
				setIsSubmitting(false);
			});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={`needs-validation ${validated ? "was-validated" : ""}`}
			noValidate
		>
			<div className="card mb-4">
				<div className="card-header bg-light">
					<h5 className="card-title mb-0">
						<PenTool size={16} className="me-2" />
						Add New Item
					</h5>
				</div>
				<div className="card-body">
					<div className="row g-3">
						{/* Item Name */}
						<div className="col-md-6">
							<label htmlFor="itemName" className="form-label">
								Item Name*
							</label>
							<input
								type="text"
								className="form-control"
								id="itemName"
								value={name}
								onChange={(e) => setName(e.target.value)}
								onBlur={() => setIsTouched({ ...isTouched, name: true })}
								required
								placeholder="V-Slot Extrusion 2020 - 1.5m"
							/>
							<div className="invalid-feedback">
								Please provide a name for the item.
							</div>
						</div>

						{/* SKU */}
						<div className="col-md-6">
							<label htmlFor="itemSku" className="form-label">
								SKU (Optional)
							</label>
							<input
								type="text"
								className="form-control"
								id="itemSku"
								value={sku}
								onChange={(e) => setSku(e.target.value)}
								placeholder="LR-2020-S-1500"
							/>
						</div>

						{/* Length */}
						<div className="col-md-3">
							<label htmlFor="itemLength" className="form-label">
								Length (mm)*
							</label>
							<input
								type="number"
								className="form-control"
								id="itemLength"
								value={length}
								onChange={(e) => setLength(e.target.value)}
								onBlur={() => setIsTouched({ ...isTouched, length: true })}
								required
								min="1"
								placeholder="100"
							/>
							<div className="invalid-feedback">
								Please provide a valid length greater than 0.
							</div>
						</div>

						{/* Width */}
						<div className="col-md-3">
							<label htmlFor="itemWidth" className="form-label">
								Width (mm)*
							</label>
							<input
								type="number"
								className="form-control"
								id="itemWidth"
								value={width}
								onChange={(e) => setWidth(e.target.value)}
								onBlur={() => setIsTouched({ ...isTouched, width: true })}
								required
								min="1"
								placeholder="50"
							/>
							<div className="invalid-feedback">
								Please provide a valid width greater than 0.
							</div>
						</div>

						{/* Height */}
						<div className="col-md-3">
							<label htmlFor="itemHeight" className="form-label">
								Height (mm)*
							</label>
							<input
								type="number"
								className="form-control"
								id="itemHeight"
								value={height}
								onChange={(e) => setHeight(e.target.value)}
								onBlur={() => setIsTouched({ ...isTouched, height: true })}
								required
								min="1"
								placeholder="25"
							/>
							<div className="invalid-feedback">
								Please provide a valid height greater than 0.
							</div>
						</div>

						{/* Weight */}
						<div className="col-md-3">
							<label htmlFor="itemWeight" className="form-label">
								Weight (g)*
							</label>
							<input
								type="number"
								className="form-control"
								id="itemWeight"
								value={weight}
								onChange={(e) => setWeight(e.target.value)}
								onBlur={() => setIsTouched({ ...isTouched, weight: true })}
								required
								min="1"
								placeholder="1500"
							/>
							<div className="invalid-feedback">
								Please provide a valid weight greater than 0.
							</div>
						</div>

						{/* Dimension Presets */}
						<div className="col-12 mt-3">
							<div className="card">
								<div className="card-header bg-light">
									<h6 className="mb-0">Dimension Presets</h6>
								</div>
								<div className="card-body">
									<p className="text-muted small mb-2">
										Quick-fill with common dimensions:
									</p>
									<div className="btn-group btn-group-sm">
										<button
											type="button"
											className="btn btn-outline-primary"
											onClick={() => applyDimensionPreset("small")}
										>
											Small Item
										</button>
										<button
											type="button"
											className="btn btn-outline-primary"
											onClick={() => applyDimensionPreset("medium")}
										>
											Medium Item
										</button>
										<button
											type="button"
											className="btn btn-outline-primary"
											onClick={() => applyDimensionPreset("large")}
										>
											Large Item
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="card-footer d-flex justify-content-between">
					<button
						type="button"
						className="btn btn-outline-secondary"
						onClick={resetForm}
					>
						<RotateCcw size={16} className="me-1" />
						Reset
					</button>
					<button
						type="submit"
						className="btn btn-primary"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<>
								<span
									className="spinner-border spinner-border-sm me-1"
									role="status"
									aria-hidden="true"
								></span>
								Adding...
							</>
						) : (
							<>
								<Plus size={16} className="me-1" />
								Add Item
							</>
						)}
					</button>
				</div>
			</div>
		</form>
	);
}
