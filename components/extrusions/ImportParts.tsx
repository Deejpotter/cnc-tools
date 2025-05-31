"use client";
import React from "react";
import { useDropzone } from "react-dropzone";

interface InvoiceItem {
	profile: string;
	color: string;
	length: number;
	quantity: number;
}

interface ImportPartsProps {
	onPartsImported: (items: InvoiceItem[]) => void;
}

const ImportParts: React.FC<ImportPartsProps> = ({ onPartsImported }) => {
	const onDrop = async (acceptedFiles: File[]) => {
		const file = acceptedFiles[0];
		if (!file) return;

		try {
			const text = await file.text();
			const lines = text.split("\n");
			const items: InvoiceItem[] = [];

			// Skip header row
			for (let i = 1; i < lines.length; i++) {
				const line = lines[i].trim();
				if (!line) continue;

				const parts = line.split(",");
				// Expecting: Profile, Color, Quantity, Length
				if (parts.length >= 4) {
					items.push({
						profile: parts[0].trim(),
						color: parts[1].trim(),
						quantity: parseInt(parts[2].trim()),
						length: parseInt(parts[3].trim()),
					});
				}
			}

			onPartsImported(items);
		} catch (error) {
			console.error("Error parsing invoice:", error);
			alert("Error parsing invoice. Please check the file format.");
		}
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"text/csv": [".csv"],
			"text/plain": [".txt"],
		},
		multiple: false,
	});

	return (
		<div
			{...getRootProps()}
			className={`card mb-4 ${isDragActive ? "border-primary" : ""}`}
		>
			<div className="card-body text-center p-5">
				<input {...getInputProps()} />
				{isDragActive ? (
					<p className="mb-0">Drop the file here...</p>
				) : (
					<>
						<p className="mb-0">
							Drag and drop an invoice file here, or click to select
						</p>
						<small className="text-muted">
							Accepts CSV or TXT files with format:
							Profile,Color,Quantity,Length
						</small>
					</>
				)}
			</div>
		</div>
	);
};

export default ImportParts;
