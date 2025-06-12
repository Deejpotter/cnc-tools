import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
// import { pdfToText } from "pdf-ts"; // Assuming pdf-ts can be used server-side
// import OpenAI from "openai";

// import { ExtractedInvoiceItem } from "@/types/invoice"; // Adjust path as needed

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

export async function POST(request: NextRequest) {
	const { userId } = auth();
	if (!userId) {
		return NextResponse.json(
			{ success: false, message: "Unauthorized" },
			{ status: 401 }
		);
	}

	try {
		const formData = await request.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			return NextResponse.json(
				{ success: false, message: "No file uploaded" },
				{ status: 400 }
			);
		}

		const fileName = file.name.toLowerCase();
		const fileBuffer = Buffer.from(await file.arrayBuffer());

		let extractedText = "";

		// TODO: Implement actual text extraction from PDF/text
		// For now, let's simulate text extraction
		if (fileName.endsWith(".pdf")) {
			// Placeholder for pdf-ts or other library logic
			// try {
			//   extractedText = await pdfToText(fileBuffer); // This expects Uint8Array, ensure compatibility
			// } catch (e) {
			//   console.error("PDF text extraction failed:", e);
			//   return NextResponse.json({ success: false, message: "Failed to extract text from PDF" }, { status: 500 });
			// }
			extractedText = `Simulated PDF content for ${file.name}`;
		} else if (fileName.endsWith(".txt") || fileName.endsWith(".text")) {
			extractedText = fileBuffer.toString("utf-8");
		} else {
			return NextResponse.json(
				{ success: false, message: "Unsupported file type" },
				{ status: 400 }
			);
		}

		if (!extractedText.trim()) {
			return NextResponse.json(
				{ success: false, message: "File appears to be empty or unreadable" },
				{ status: 400 }
			);
		}

		// TODO: Implement AI processing if needed, similar to technical-ai/src/services/invoiceService.ts
		// For now, just return the extracted text.
		// const aiProcessedItems: ExtractedInvoiceItem[] = await processTextWithAI(extractedText);

		return NextResponse.json(
			{
				success: true,
				message: "File processed successfully (simulated)",
				data: { rawText: extractedText }, // Replace with aiProcessedItems if AI is used
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error processing file:", error);
		const message =
			error instanceof Error ? error.message : "Unknown error occurred";
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}

// async function processTextWithAI(text: string): Promise<ExtractedInvoiceItem[]> {
//   // This function would adapt the logic from technical-ai's invoiceService.ts
//   // - Define the prompt for OpenAI
//   // - Call OpenAI API
//   // - Parse the response
//   // - Return ExtractedInvoiceItem[]
//   console.log("Simulating AI processing for text:", text.substring(0, 100) + "...");
//   // Simulate a delay and return mock data
//   await new Promise(resolve => setTimeout(resolve, 1000));
//   return [
//     { name: "Sample Item 1", sku: "SKU001", quantity: 2, weight: 0.5 },
//     { name: "Sample Item 2", sku: "SKU002", quantity: 1, weight: 1.2 },
//   ];
// }
