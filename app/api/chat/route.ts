/**
 * Chat API Route
 * Updated: 25/05/2025
 * Author: Deej Potter
 * Description: API endpoint for AI chat functionality.
 * Handles streaming responses from OpenAI for CNC technical questions.
 * Migrated from server actions to API route for better separation of concerns.
 */

import { ChatBody } from "@/types/types";
import { OpenAIStream } from "@/utils/chatStream";

export const runtime = "edge";

/**
 * GET handler for chat requests
 * Processes user input and returns streaming AI responses
 * @param req Request containing chat data (inputCode, model, apiKey)
 * @returns Streaming response from OpenAI
 */
export async function GET(req: Request): Promise<Response> {
	try {
		const { inputCode, model, apiKey } = (await req.json()) as ChatBody;

		// Determine which API key to use - user provided or environment variable
		let apiKeyFinal;
		if (apiKey) {
			apiKeyFinal = apiKey;
		} else {
			apiKeyFinal = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
		}

		// Create streaming response from OpenAI
		const stream = await OpenAIStream(inputCode, model, apiKeyFinal);

		return new Response(stream);
	} catch (error) {
		console.error("Error in chat GET API:", error);
		return new Response("Error", { status: 500 });
	}
}

/**
 * POST handler for chat requests
 * Processes user input and returns streaming AI responses
 * @param req Request containing chat data (inputCode, model, apiKey)
 * @returns Streaming response from OpenAI
 */
export async function POST(req: Request): Promise<Response> {
	try {
		const { inputCode, model, apiKey } = (await req.json()) as ChatBody;

		// Determine which API key to use - user provided or environment variable
		let apiKeyFinal;
		if (apiKey) {
			apiKeyFinal = apiKey;
		} else {
			apiKeyFinal = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
		}

		// Create streaming response from OpenAI
		const stream = await OpenAIStream(inputCode, model, apiKeyFinal);

		return new Response(stream);
	} catch (error) {
		console.error("Error in chat POST API:", error);
		return new Response("Error", { status: 500 });
	}
}
