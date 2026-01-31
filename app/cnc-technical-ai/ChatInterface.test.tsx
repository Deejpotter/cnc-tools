import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@clerk/nextjs", () => ({
	useAuth: () => ({ getToken: jest.fn(async () => "fake-jwt") }),
}));

import ChatInterface from "./ChatInterface";
import { mockFetchStream } from "../../test/testUtils";

function mount() {
	return render(
		<ChatInterface setShowConversations={() => {}} showConversations={false} />
	);
}

describe("ChatInterface", () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("handles successful streaming response", async () => {
		const fetchMock = mockFetchStream(["Hello from AI"]);
		// @ts-ignore
		global.fetch = fetchMock;

		mount();

		const textarea = screen.getByPlaceholderText(
			"Type your CNC or technical question here..."
		);
		fireEvent.change(textarea, { target: { value: "What is G-code?" } });

		const sendButton = document.querySelector(
			"button.btn.btn-primary"
		) as HTMLButtonElement;
		fireEvent.click(sendButton);

		// Wait for the streamed content to appear
		await waitFor(
			() => expect(screen.getByText(/Hello from AI/)).toBeInTheDocument(),
			{ timeout: 2000 }
		);
	});

	it("shows error on non-ok response", async () => {
		// Simulate non-OK response for chat
		// @ts-ignore
		global.fetch = jest.fn(async () => ({ ok: false }));

		mount();

		const textarea = screen.getByPlaceholderText(
			"Type your CNC or technical question here..."
		);
		fireEvent.change(textarea, { target: { value: "Test error" } });

		const sendButton = document.querySelector(
			"button.btn.btn-primary"
		) as HTMLButtonElement;
		fireEvent.click(sendButton);

		await waitFor(() =>
			expect(
				screen.getByText(/Sorry, I encountered an error/)
			).toBeInTheDocument()
		);
	});

	it("handles fetch/network errors gracefully", async () => {
		// Suppress expected error log from the component for this test
		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

		// @ts-ignore
		global.fetch = jest.fn(async () => {
			throw new Error("network");
		});

		mount();

		const textarea = screen.getByPlaceholderText(
			"Type your CNC or technical question here..."
		);
		fireEvent.change(textarea, { target: { value: "Network fail" } });

		const sendButton = document.querySelector(
			"button.btn.btn-primary"
		) as HTMLButtonElement;
		fireEvent.click(sendButton);

		await waitFor(() =>
			expect(
				screen.getByText(/couldn't connect to the server/i)
			).toBeInTheDocument()
		);

		// Restore the console error spy (afterEach also restores mocks)
		errorSpy.mockRestore();
	});

	it("uploads file successfully and shows progress message", async () => {
		// Upload endpoint returns ok
		// @ts-ignore
		global.fetch = jest.fn(async (url) => ({ ok: url?.includes("/upload") }));

		mount();

		const uploadInput = document.querySelector(
			"input[type=file]"
		) as HTMLInputElement;
		const file = new File(["a,b,c"], "qa.csv", { type: "text/csv" });

		// Simulate user selecting a file
		fireEvent.change(uploadInput, { target: { files: [file] } });

		await waitFor(() =>
			expect(
				screen.getByText(/File uploaded successfully/i)
			).toBeInTheDocument()
		);
	});
});
