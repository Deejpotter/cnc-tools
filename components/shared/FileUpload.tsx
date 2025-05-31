"use client";
import React from "react";
import { useFileUpload, UseFileUploadOptions } from "../hooks/useFileUpload";

/**
 * Props for the FileUpload component, extends UseFileUploadOptions
 * @interface FileUploadProps
 * @property {string} [className] - Additional CSS classes for the upload area
 * @property {string} [activeClassName] - CSS class applied when dragging over
 * @property {string} [dragMessage] - Message shown when dragging a file
 * @property {string} [idleMessage] - Default message shown
 * @property {string} [errorMessage] - Custom error message
 * @property {string} [loadingMessage] - Message shown during file processing
 * @property {string} [buttonText] - Optional text for an explicit upload button
 * @property {boolean} [showFileInfo=false] - Whether to show information about uploaded files
 * @property {React.ReactNode} [icon] - Optional icon to display
 * @property {string} [theme="light"] - Theme for the component ("light" or "dark")
 * @property {(result: any) => void} [onProcessingComplete] - Callback when processing is complete
 * @property {(files: File[]) => Promise<any>} [processFiles] - Custom file processing function
 */
interface FileUploadProps extends UseFileUploadOptions {
	className?: string;
	activeClassName?: string;
	dragMessage?: string;
	idleMessage?: string;
	errorMessage?: string;
	loadingMessage?: string;
	buttonText?: string;
	showFileInfo?: boolean;
	icon?: React.ReactNode;
	theme?: "light" | "dark";
	onProcessingComplete?: (result: any) => void;
	processFiles?: (files: File[]) => Promise<any>;
}

/**
 * Generic file upload component with drag & drop support
 * Handles multiple file types and provides validation
 *
 * @param {FileUploadProps} props - The component props
 * @returns {JSX.Element} The rendered FileUpload component
 */
const FileUpload: React.FC<FileUploadProps> = ({
	className = "",
	activeClassName = "border-primary",
	dragMessage = "Drop files here...",
	idleMessage = "Drag and drop files here, or click to select",
	errorMessage,
	loadingMessage = "Processing files...",
	buttonText,
	showFileInfo = false,
	icon,
	...uploadOptions
}) => {
	const {
		isDragActive,
		isLoading,
		error,
		handleDrop,
		handleFileSelect,
		fileInfo,
	} = useFileUpload(uploadOptions);

	// Event handlers for drag and drop functionality
	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleFileDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const files = Array.from(e.dataTransfer.files);
		handleDrop(files);
	};

	return (
		<div
			className={`card mb-4 ${className} ${
				isDragActive ? activeClassName : ""
			}`}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleFileDrop}
		>
			<div className="card-body text-center p-5">
				<input
					type="file"
					onChange={handleFileSelect}
					multiple={uploadOptions.multiple}
					accept={uploadOptions.allowedTypes?.join(",")}
					style={{ display: "none" }}
					id="file-upload"
				/>
				<label htmlFor="file-upload" style={{ cursor: "pointer" }}>
					{isLoading ? (
						<p className="mb-0">{loadingMessage}</p>
					) : isDragActive ? (
						<p className="mb-0">{dragMessage}</p>
					) : (
						<>
							{icon && <div className="mb-2">{icon}</div>}
							<p className="mb-0">{idleMessage}</p>
							{uploadOptions.allowedTypes && (
								<small className="text-muted">
									Accepts: {uploadOptions.allowedTypes.join(", ")}
								</small>
							)}
							{buttonText && (
								<div className="mt-3">
									<button className="btn btn-outline-primary">
										{buttonText}
									</button>
								</div>
							)}
						</>
					)}
				</label>

				{/* Show file information if requested */}
				{showFileInfo && fileInfo && fileInfo.length > 0 && (
					<div className="mt-3">
						<h6>Selected Files:</h6>
						<ul className="list-group">
							{fileInfo.map((file, index) => (
								<li key={index} className="list-group-item text-start">
									<strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)}{" "}
									KB)
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Error display */}
				{error && (
					<div className="alert alert-danger mt-3 mb-0">
						{errorMessage || error}
					</div>
				)}
			</div>
		</div>
	);
};

export default FileUpload;

export default FileUpload;
