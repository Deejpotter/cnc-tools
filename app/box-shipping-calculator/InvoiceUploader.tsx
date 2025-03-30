"use client";

import React, { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { processInvoice } from "@/app/actions/processInvoice";
import type ShippingItem from "@/interfaces/box-shipping-calculator/ShippingItem";

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
			className={`
        mt-4 px-4 py-2 bg-blue-500 text-white rounded
        ${pending ? "opacity-50" : "hover:bg-blue-600"}
      `}
		>
			{pending ? "Processing..." : "Process Invoice"}
		</button>
	);
}

export default function InvoiceUploader({
	onItemsFound,
	onError,
}: InvoiceUploaderProps) {
	const [dragActive, setDragActive] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	async function handleSubmit(formData: FormData) {
		try {
			const items = await processInvoice(formData);
			if (items.length === 0) {
				onError("No items found in invoice");
			} else {
				onItemsFound(items);
			}
		} catch (error) {
			onError(
				error instanceof Error ? error.message : "Failed to process invoice"
			);
		}
	}

	return (
		<form
			ref={formRef}
			action={handleSubmit}
			className="space-y-4"
			onDragEnter={() => setDragActive(true)}
			onDragLeave={() => setDragActive(false)}
			onDrop={() => setDragActive(false)}
		>
			<div
				className={`
        border-2 border-dashed rounded-lg p-6 text-center
        ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
      `}
			>
				<input
					type="file"
					name="invoice"
					accept=".pdf"
					className="hidden"
					id="invoice-upload"
					onChange={() => formRef.current?.requestSubmit()}
				/>
				<label htmlFor="invoice-upload" className="cursor-pointer">
					<div>
						<p className="text-lg mb-2">
							Drag & drop a Maker Store invoice PDF here
						</p>
						<p className="text-sm text-gray-500">Or click to select a file</p>
					</div>
				</label>
			</div>
			<SubmitButton />
		</form>
	);
}
