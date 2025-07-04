/**
 * PdfImport Component
 * Author: Deej Potter
 * Description: Reusable component for importing PDF or text files.
 * This component is designed to be used anywhere in the app where PDF/text import is needed.
 */

"use client";

import React, { useRef, useState } from "react";
import { Upload, Check } from "lucide-react";

/**
 * Props for the PdfImport component.
 * @property {function} onFileSelected - Callback function to handle selected file.
 * @property {function} onError - Callback function to handle errors.
 * @property {string} [label] - Custom label for the import button.
 * @property {string} [accept] - Accepted file types for import.
 * @example
 * <PdfImport onFileSelected={handleFile} onError={handleError} label="Import Invoice" />
 */
interface PdfImportProps {
	onFileSelected: (file: File) => void;
	onError: (error: string) => void;
	label?: string;
	accept?: string;
}

export default function PdfImport({
	onFileSelected,
	onError,
	label = "Import PDF or Text File",
	accept = ".pdf,.txt,.text",
}: PdfImportProps) {
	const [dragActive, setDragActive] = useState(false);
	const [fileName, setFileName] = useState<string | null>(null);
	const [fileSelected, setFileSelected] = useState(false);
	const [loading, setLoading] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	// Handle file selection and extraction
	const handleFile = async (file: File) => {
		setLoading(true);
		try {
			onFileSelected(file);
		} catch (error) {
			const msg =
				error instanceof Error ? error.message : "Failed to process file";
			onError(msg);
		} finally {
			setLoading(false);
		}
	};

	// Handle file input change
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.length) {
			const file = e.target.files[0];
			setFileName(file.name);
			setFileSelected(true);
			handleFile(file);
		}
	};

	// Handle drag-and-drop
	const handleDrop = (e: React.DragEvent<HTMLFormElement>) => {
		e.preventDefault();
		setDragActive(false);
		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			const file = e.dataTransfer.files[0];
			setFileName(file.name);
			setFileSelected(true);
			handleFile(file);
		}
	};

	return (
		<form
			ref={formRef}
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
			onDrop={handleDrop}
		>
			<div
				className={`card ${dragActive ? "border-primary bg-light" : ""}`}
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						document.getElementById("pdf-import-input")?.click();
					}
				}}
			>
				<div className="card-body text-center p-5">
					<input
						type="file"
						accept={accept}
						className="d-none"
						id="pdf-import-input"
						onChange={handleFileChange}
						aria-label={label}
					/>
					<label
						htmlFor="pdf-import-input"
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
									<h5 className="card-title">{label}</h5>
									<p className="card-text text-muted">
										Drag & drop or click to select a .pdf or .txt file
									</p>
								</>
							)}
						</div>
					</label>
				</div>
			</div>
			{fileSelected && (
				<div className="mt-3">
					<button
						type="button"
						className="btn btn-outline-secondary ms-2"
						onClick={() => {
							setFileSelected(false);
							setFileName(null);
							const fileInput = document.getElementById(
								"pdf-import-input"
							) as HTMLInputElement;
							if (fileInput) fileInput.value = "";
						}}
						disabled={loading}
					>
						Cancel
					</button>
				</div>
			)}
			{loading && (
				<div className="mt-3 text-info">
					<span className="spinner-border spinner-border-sm me-2" />
					Processing file...
				</div>
			)}
		</form>
	);
}
