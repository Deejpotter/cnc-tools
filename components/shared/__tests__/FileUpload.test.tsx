import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FileUpload from "../FileUpload";
import {
	useFileUploadMock,
	configureMock,
	resetMock,
	mockFileInfo,
} from "./__mocks__/useFileUpload";

// Mock the useFileUpload hook
jest.mock("../hooks/useFileUpload", () => ({
	useFileUpload: jest.fn((props) => useFileUploadMock(props)),
}));

describe("FileUpload Component", () => {
	// Reset mocks between tests
	beforeEach(() => {
		resetMock();
	});

	test("renders with default props", () => {
		render(<FileUpload />);

		// Check that default message is displayed
		expect(
			screen.getByText("Drag and drop files here, or click to select")
		).toBeInTheDocument();
	});

	test("displays custom idle message", () => {
		const customMessage = "Custom upload message";
		render(<FileUpload idleMessage={customMessage} />);

		expect(screen.getByText(customMessage)).toBeInTheDocument();
	});

	test("displays allowed file types when provided", () => {
		render(<FileUpload allowedTypes={[".pdf", ".docx"]} />);

		expect(screen.getByText("Accepts: .pdf, .docx")).toBeInTheDocument();
	});

	test("displays custom button when buttonText is provided", () => {
		const buttonText = "Select Files";
		render(<FileUpload buttonText={buttonText} />);

		expect(screen.getByText(buttonText)).toBeInTheDocument();
	});

	test("applies theme-specific styling", () => {
		const { container, rerender } = render(<FileUpload theme="light" />);

		// Test light theme (default)
		expect(container.firstChild).toHaveClass("bg-light");
		expect(container.firstChild).toHaveClass("text-dark");

		// Test dark theme
		rerender(<FileUpload theme="dark" />);
		expect(container.firstChild).toHaveClass("bg-dark");
		expect(container.firstChild).toHaveClass("text-light");
	});
	test("displays error message when provided", () => {
		// Configure the mock for this test
		configureMock({
			error: "Test error message",
		});

		render(<FileUpload />);

		expect(screen.getByText("Test error message")).toBeInTheDocument();
	});

	test("displays custom error message when provided and error occurs", () => {
		const customError = "Something went wrong!";

		// Configure the mock for this test
		configureMock({
			error: "Original error",
		});

		render(<FileUpload errorMessage={customError} />);

		expect(screen.getByText(customError)).toBeInTheDocument();
	});
	test("displays loading message when isLoading is true", () => {
		// Configure the mock for loading state
		configureMock({
			isLoading: true,
		});

		const loadingMessage = "Processing your files...";
		render(<FileUpload loadingMessage={loadingMessage} />);

		expect(screen.getByText(loadingMessage)).toBeInTheDocument();
	});

	test("displays drag message when isDragActive is true", () => {
		// Configure the mock for drag active state
		configureMock({
			isDragActive: true,
		});

		const dragMessage = "Drop files here to upload";
		render(<FileUpload dragMessage={dragMessage} />);

		expect(screen.getByText(dragMessage)).toBeInTheDocument();
	});
});
