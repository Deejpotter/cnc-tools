/**
 * ChatEngine tests
 * Updated: 25/05/25
 * Author: Deej Potter
 */

import { ChatEngine } from "../services/chat-engine";
import OpenAI from "openai";
import { MongoDBProvider } from "../data/MongoDBProvider";

// Mock OpenAI and MongoDBProvider
jest.mock("openai");
jest.mock("../data/MongoDBProvider");

// Mock environment variables
process.env.OPENAI_API_KEY = "test-api-key";
process.env.GPT_MODEL = "gpt-3.5-turbo";

describe("ChatEngine", () => {
	let chatEngine: ChatEngine;

	beforeEach(() => {
		// Clear all mocks before each test
		jest.clearAllMocks();

		// Setup OpenAI mock
		(OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(
			() =>
				({
					chat: {
						completions: {
							create: jest.fn(),
						},
					},
				} as unknown as OpenAI)
		);

		// Setup MongoDBProvider mock
		(
			MongoDBProvider as jest.MockedClass<typeof MongoDBProvider>
		).mockImplementation(
			() =>
				({
					createDocument: jest.fn(),
					getDocuments: jest.fn(),
				} as unknown as MongoDBProvider)
		);

		chatEngine = new ChatEngine();
	});

	it("should instantiate without errors", () => {
		expect(chatEngine).toBeDefined();
		expect(OpenAI).toHaveBeenCalledWith({ apiKey: "test-api-key" });
	});

	// Add more specific tests here as needed
});
