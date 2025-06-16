/**
 * PdfImport Component (Backend-based)
 * Author: Deej Potter
 * Description: Reusable component for importing and processing PDF or text files using the backend API.
 * This component now sends files to the backend for processing instead of handling them client-side.
 */

"use client";

import { useAuth } from "@clerk/nextjs"; // Ensure useAuth is imported from Clerk
import { useState, useRef } from "react"; // Ensure useState and useRef are imported
import { UploadCloud, CheckCircle } from "lucide-react";

/**
 * Props for the PdfImport component.
 * @property {function} onItemsExtracted - Callback function to handle extracted shipping items.
 * @property {function} onError - Callback function to handle errors.
 * @property {string} [label] - Custom label for the import button.
 * @property {string} [accept] - Accepted file types for import.
 * @example
 * <PdfImport onItemsExtracted={handleItems} onError={handleError} label="Import Invoice" />
 */
interface PdfImportProps {
	onItemsExtracted: (items: any[]) => void;
	onError: (error: string) => void;
	label?: string;
	accept?: string;
}

export default function PdfImport({
	onItemsExtracted,
	onError,
	label = "Import PDF or Text File",
	accept = ".pdf,.txt,.text",
}: PdfImportProps) {
	const { getToken } = useAuth();
	const [dragActive, setDragActive] = useState(false);
	const [fileName, setFileName] = useState<string | null>(null);
	const [fileSelected, setFileSelected] = useState(false);
	const [loading, setLoading] = useState(false);
	const [progress, setProgress] = useState<string>("");
	const formRef = useRef<HTMLFormElement>(null);

	// Handle file processing through backend API
	const handleFile = async (file: File) => {
		setLoading(true);
		setProgress("Uploading file...");

		try {
			const formData = new FormData();
			formData.append("invoiceFile", file);

			const jwt = await getToken();
			// Always send the Clerk JWT in the Authorization header for backend-protected endpoints.
			// Use the backend API URL from env if set, otherwise fallback to local route (for dev/test).
			const apiBase = process.env.NEXT_PUBLIC_TECHNICAL_AI_API_URL || "";
			console.log("PdfImport.backend.tsx: apiBase:", apiBase); // <-- Add this log
			const endpoint = apiBase
				? `${apiBase}/api/invoice/process-pdf`
				: "/api/invoice/process-pdf";
			console.log("PdfImport.backend.tsx: endpoint:", endpoint); // <-- Add this log

			setProgress("Processing invoice...");
			const response = await fetch(endpoint, {
				method: "POST",
				body: formData,
				headers: {
					...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
				},
			});

			// Improved error handling: check for non-JSON responses (e.g., HTML error pages)
			const contentType = response.headers.get("content-type");
			if (!response.ok) {
				let errorText = await response.text();
				if (contentType && contentType.includes("application/json")) {
					try {
						const errorJson = JSON.parse(errorText);
						throw new Error(errorJson.message || errorJson.error || "Unknown error");
					} catch (e) {
						throw new Error("Failed to parse error JSON: " + errorText);
					}
				} else {
					// Most likely a 404 or server error returning HTML
					throw new Error(
						`Unexpected response from server (status ${response.status}):\n` + errorText
					);
				}
			}

			if (contentType && contentType.includes("application/json")) {
				const result = await response.json();
				if (result.success && result.data) {
					onItemsExtracted(result.data);
					setProgress("File processed successfully!");
					if (formRef.current) {
						formRef.current.reset();
					}
					setFileName(null);
					setFileSelected(false);
				} else {
					throw new Error(result.message || "Processing failed");
				}
			} else {
				// Not JSON, unexpected
				const text = await response.text();
				throw new Error(
					`Unexpected non-JSON response from server (status ${response.status}):\n` + text
				);
			}
		} catch (error) {
			console.error("Error processing file:", error);
			onError(
				error instanceof Error ? error.message : "Unknown error occurred"
			);
			setProgress("");
		} finally {
			setLoading(false);
		}
	};

	// Handle file input change
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0];
			setFileName(file.name);
			setFileSelected(true);
		}
	};

	// Handle drag and drop
	const handleDragEnter = (e: React.DragEvent<HTMLFormElement>) => {
		e.preventDefault();
		setDragActive(true);
	};

	const handleDragOver = (e: React.DragEvent<HTMLFormElement>) => {
		e.preventDefault();
		setDragActive(true);
	};

	const handleDragLeave = () => {
		setDragActive(false);
	};

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

	// Handle process button click
	const handleProcessClick = () => {
		const fileInput = document.getElementById(
			"pdf-import-input"
		) as HTMLInputElement;
		if (fileInput?.files && fileInput.files.length > 0) {
			handleFile(fileInput.files[0]);
		}
	};

	return (
		<form
			ref={formRef}
			className="mb-4"
			onDragEnter={handleDragEnter}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<div
				className={`card ${dragActive ? "border-primary bg-light" : ""}`}
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						// Allow triggering file input with keyboard
						(
							document.getElementById("pdf-import-input") as HTMLInputElement
						)?.click();
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
							{loading ? (
								<>
									<div className="spinner-border text-primary" role="status">
										<span className="visually-hidden">Loading...</span>
									</div>
									<p className="mt-2 mb-0">{progress || "Processing..."}</p>
								</>
							) : fileSelected && fileName ? (
								<>
									<div className="mb-3 text-success">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="48"
											height="48"
											fill="currentColor"
											className="bi bi-check-circle-fill mx-auto"
											viewBox="0 0 16 16"
										>
											<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
										</svg>
									</div>
									<p className="mb-1">Selected: {fileName}</p>
									<small className="text-muted">
										Click &quot;Process File&quot; or drop another file.
									</small>
								</>
							) : (
								<>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="48"
										height="48"
										fill="currentColor"
										className="bi bi-cloud-arrow-up-fill text-primary mx-auto"
										viewBox="0 0 16 16"
									>
										<path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2zm2.354 5.146a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2z" />
									</svg>
									<p className="mt-2 mb-0">
										{dragActive ? "Drop the file here..." : label}
									</p>
									<small className="text-muted">
										Accepted formats: {accept}
									</small>
								</>
							)}
						</div>
					</label>
				</div>
			</div>

			{fileSelected && !loading && (
				<div className="mt-3 d-flex justify-content-center gap-2">
					<button
						type="button"
						className="btn btn-primary"
						onClick={handleProcessClick}
						disabled={loading || !fileSelected}
					>
						Process File
					</button>
					<button
						type="button"
						className="btn btn-outline-secondary"
						onClick={() => {
							setFileSelected(false);
							setFileName(null);
							setProgress("");
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

			{progress && !loading && !fileSelected && (
				<div className="mt-3 alert alert-info">{progress}</div>
			)}
		</form>
	);
}
