/**
 * PdfImport Component
 * Author: Deej Potter (refactored by Copilot)
 * Description: Reusable component for importing and extracting text from PDF or text files using pdf-ts.
 * This component is designed to be used anywhere in the app where PDF/text import is needed.
 *
 * Props:
 * - onTextExtracted: (text: string) => void
 *     Called with the extracted text content from the file (PDF or text).
 * - onError: (error: string) => void
 *     Called with an error message if extraction fails.
 * - label?: string
 *     Optional label to display in the UI.
 * - accept?: string
 *     Optional accept string for file input (default: '.pdf,.txt,.text')
 *
 * Usage Example:
 * <PdfImport onTextExtracted={handleText} onError={handleError} label="Import Invoice" />
 */

"use client";

import React, { useRef, useState } from "react";
import { pdfToText } from "pdf-ts";
import { Upload, Check } from "lucide-react";

interface PdfImportProps {
	onTextExtracted: (text: string) => void;
	onError: (error: string) => void;
	label?: string;
	accept?: string;
}

export default function PdfImport({
	onTextExtracted,
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
			const fileName = file.name.toLowerCase();
			const isPDF =
				file.type === "application/pdf" || fileName.endsWith(".pdf");
			let textContent = "";
			if (isPDF) {
				// Use pdf-ts to extract text from PDF
				const arrayBuffer = await file.arrayBuffer();
				const uint8Array = new Uint8Array(arrayBuffer);
				textContent = await pdfToText(uint8Array);
			} else {
				// Plain text file
				textContent = await file.text();
			}
			if (!textContent.trim()) {
				throw new Error("File appears to be empty or unreadable");
			}
			onTextExtracted(textContent);
		} catch (error) {
			const msg =
				error instanceof Error ? error.message : "Failed to extract file text";
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
					Extracting text...
				</div>
			)}
		</form>
	);
}
