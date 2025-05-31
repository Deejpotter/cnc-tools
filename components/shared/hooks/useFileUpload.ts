"use client";
import { useCallback, useState } from "react";

/**
 * File validation options
 * @interface FileValidation
 * @property {number} [maxSize] - Maximum file size in bytes
 * @property {string[]} [allowedTypes] - Array of MIME types that are allowed
 * @property {function} [validateContent] - Optional function to validate file content
 */
export interface FileValidation {
	maxSize?: number;
	allowedTypes?: string[];
	validateContent?: (content: string) => boolean | Promise<boolean>;
}

/**
 * File information object
 * @interface FileInfo
 * @property {string} name - File name
 * @property {number} size - File size in bytes
 * @property {string} type - File MIME type
 */
export interface FileInfo {
	name: string;
	size: number;
	type: string;
}

/**
 * Options for useFileUpload hook
 * @interface UseFileUploadOptions
 * @extends FileValidation
 * @property {function} [onUpload] - Callback function when a file is uploaded
 * @property {boolean} [multiple=false] - Whether multiple files can be uploaded
 */
export interface UseFileUploadOptions extends FileValidation {
	onUpload?: (content: string, file: File) => void | Promise<void>;
	multiple?: boolean;
}

/**
 * Result of useFileUpload hook
 * @interface UseFileUploadResult
 * @property {boolean} isDragActive - Whether a file is being dragged over the drop area
 * @property {boolean} isLoading - Whether files are being processed
 * @property {string|null} error - Error message, if any
 * @property {FileInfo[]} fileInfo - Information about the uploaded files
 * @property {function} handleDrop - Function to handle file drop events
 * @property {function} handleFileSelect - Function to handle file select events
 */
export interface UseFileUploadResult {
	isDragActive: boolean;
	isLoading: boolean;
	error: string | null;
	fileInfo: FileInfo[];
	handleDrop: (files: File[]) => Promise<void>;
	handleFileSelect: (
		event: React.ChangeEvent<HTMLInputElement>
	) => Promise<void>;
}

/**
 * Custom hook for handling file uploads
 * Supports drag & drop, file selection, and various validation options
 *
 * @param {UseFileUploadOptions} options - Configuration options
 * @returns {UseFileUploadResult} Hook result with state and handlers
 */
export function useFileUpload({
	maxSize,
	allowedTypes,
	validateContent,
	onUpload,
	multiple = false,
}: UseFileUploadOptions): UseFileUploadResult {
	const [isDragActive, setIsDragActive] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fileInfo, setFileInfo] = useState<FileInfo[]>([]);

	const validateFile = useCallback(
		async (file: File): Promise<boolean> => {
			// Size validation
			if (maxSize && file.size > maxSize) {
				setError(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
				return false;
			}

			// Type validation
			if (
				allowedTypes &&
				allowedTypes.length > 0 &&
				!allowedTypes.includes(file.type)
			) {
				setError(`File type ${file.type} not supported`);
				return false;
			}

			// Content validation if provided
			if (validateContent) {
				try {
					const content = await file.text();
					if (!(await validateContent(content))) {
						setError("File content validation failed");
						return false;
					}
					return true;
				} catch (err) {
					setError("Error reading file content");
					return false;
				}
			}

			return true;
		},
		[maxSize, allowedTypes, validateContent]
	);

	const processFile = useCallback(
		async (file: File) => {
			try {
				const isValid = await validateFile(file);
				if (!isValid) return;

				// Add file info
				setFileInfo((prev) =>
					multiple
						? [...prev, { name: file.name, size: file.size, type: file.type }]
						: [{ name: file.name, size: file.size, type: file.type }]
				);

				const content = await file.text();
				if (onUpload) {
					await onUpload(content, file);
				}
				setError(null);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Error processing file");
			}
		},
		[validateFile, onUpload, multiple]
	);

	const handleDrop = useCallback(
		async (files: File[]) => {
			setIsDragActive(false);
			setIsLoading(true);

			// Clear previous file info if not multiple
			if (!multiple) {
				setFileInfo([]);
			}

			try {
				if (multiple) {
					await Promise.all(files.map(processFile));
				} else if (files.length > 0) {
					await processFile(files[0]);
				}
			} finally {
				setIsLoading(false);
			}
		},
		[multiple, processFile]
	);

	const handleFileSelect = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(event.target.files || []);
			await handleDrop(files);
		},
		[handleDrop]
	);

	return {
		isDragActive,
		isLoading,
		error,
		fileInfo,
		handleDrop,
		handleFileSelect,
	};
}
