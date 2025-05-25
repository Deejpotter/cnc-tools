/**
 * InvoiceUploader
 * Updated: 14/05/2025
 * Author: Deej Potter
 * Description: Component for uploading and processing invoice files.
 * Extracts shipping items from invoices and passes them to the parent component.
 * Enhanced with better visual feedback, consistent Bootstrap styling and improved accessibility.
 */

"use client";

import React, { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { processInvoice } from "@/app/actions/processInvoice";
import type ShippingItem from "@/interfaces/box-shipping-calculator/ShippingItem";
import { Upload, AlertCircle, FileText, Check } from "lucide-react";

interface InvoiceUploaderProps {
	onItemsFound: (items: ShippingItem[]) => void;
	onError: (error: string) => void;
}

function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<button
			type="submit"
			disabled={pending}
			className={`btn btn-primary ${pending ? "disabled" : ""}`}
			aria-busy={pending}
		>
			{pending ? (
				<>
					<span
						className="spinner-border spinner-border-sm me-2"
						aria-hidden="true"
					></span>
					Processing...
				</>
			) : (
				<>
					<FileText size={16} className="me-2" />
					Process Invoice
				</>
			)}
		</button>
	);
}

export default function InvoiceUploader({
	onItemsFound,
	onError,
}: InvoiceUploaderProps) {
	const [dragActive, setDragActive] = useState(false);
	const [fileName, setFileName] = useState<string | null>(null);
	const [fileSelected, setFileSelected] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	/**
	 * Handle form submission and invoice processing
	 * Extracts shipping items from the uploaded invoice
	 * @param formData Form data containing the invoice file
	 */
	async function handleSubmit(formData: FormData) {
		try {
			const items = await processInvoice(formData);
			if (items.length === 0) {
				onError("No items found in invoice");
				setFileSelected(false);
				setFileName(null);
			} else {
				onItemsFound(items);
			}
		} catch (error) {
			onError(
				error instanceof Error ? error.message : "Failed to process invoice"
			);
			setFileSelected(false);
			setFileName(null);
		}
	}

	/**
	 * Handle file selection and display filename
	 * @param e Change event from file input
	 */
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.length) {
			setFileName(e.target.files[0].name);
			setFileSelected(true);
			formRef.current?.requestSubmit();
		}
	};

	return (
		<form
			ref={formRef}
			action={handleSubmit}
			className="mb-4"
			onDragEnter={(e) => {
				e.preventDefault();
				setDragActive(true);
			}}
			onDragOver={(e) => {
				e.preventDefault();
				setDragActive(true);
			}}
			onDragLeave={() => setDragActive(false)}
			onDrop={(e) => {
				e.preventDefault(); // Prevent default browser behavior of opening the file
				setDragActive(false);

				// Check if the event has files
				if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
					const file = e.dataTransfer.files[0];

					// Get the file input element
					const fileInput = document.getElementById(
						"invoice-upload"
					) as HTMLInputElement;

					// Create a new DataTransfer object and add our file
					const dataTransfer = new DataTransfer();
					dataTransfer.items.add(file);

					// Set the file in the input element
					if (fileInput) {
						fileInput.files = dataTransfer.files;
						setFileName(file.name);
						setFileSelected(true);

						// Trigger form submission
						formRef.current?.requestSubmit();
					}
				}
			}}
		>
			<div
				className={`card ${dragActive ? "border-primary bg-light" : ""}`}
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						document.getElementById("invoice-upload")?.click();
					}
				}}
			>
				<div className="card-body text-center p-5">
					<input
						type="file"
						name="invoice"
						accept=".pdf"
						className="d-none"
						id="invoice-upload"
						onChange={handleFileChange}
						aria-label="Upload invoice PDF"
					/>
					<label
						htmlFor="invoice-upload"
						className="d-block cursor-pointer"
						style={{ cursor: "pointer" }}
					>
						<div className="py-3">
							{fileSelected ? (
								<>
									<div className="mb-3 text-success">
										<Check size={48} className="mx-auto" />
									</div>
									<h5 className="card-title">File selected</h5>
									<p className="card-text text-muted">{fileName}</p>
								</>
							) : (
								<>
									<div className="mb-3 text-primary">
										<Upload size={48} className="mx-auto" />
									</div>
									<h5 className="card-title">
										Drag & drop a Maker Store invoice PDF here
									</h5>
									<p className="card-text text-muted">
										Or click to select a file
									</p>
								</>
							)}
						</div>
					</label>
				</div>
			</div>

			<div className="mt-3">
				<SubmitButton />

				{fileSelected && (
					<button
						type="button"
						className="btn btn-outline-secondary ms-2"
						onClick={() => {
							setFileSelected(false);
							setFileName(null);
							// Reset the file input
							const fileInput = document.getElementById(
								"invoice-upload"
							) as HTMLInputElement;
							if (fileInput) fileInput.value = "";
						}}
					>
						Cancel
					</button>
				)}
			</div>
		</form>
	);
}
