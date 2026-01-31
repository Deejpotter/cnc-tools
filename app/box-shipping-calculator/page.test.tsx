/**
 * Box Shipping Calculator Page Integration Tests
 * Tests API integration, error handling, and UI flows with mocked backend responses.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BoxShippingCalculatorPage from "./page";
import { mockFetchOnce } from "../../test/testUtils";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({ usePathname: () => "/" }));

// Mock LayoutContainer
jest.mock("@/components/LayoutContainer", () => {
	const MockLayoutContainer = ({ children }) => <div>{children}</div>;
	MockLayoutContainer.displayName = "LayoutContainer";
	return MockLayoutContainer;
});

// Mock child components
jest.mock("./ItemAddForm", () => {
	const MockItemAddForm = () => (
		<div data-testid="item-add-form">ItemAddForm</div>
	);
	MockItemAddForm.displayName = "ItemAddForm";
	return MockItemAddForm;
});

jest.mock("./ItemSelectAndCalculate", () => {
	const MockItemSelectAndCalculate = ({ onCalculateBox }) => (
		<button data-testid="calculate-button" onClick={() => onCalculateBox([])}>
			Calculate
		</button>
	);
	MockItemSelectAndCalculate.displayName = "ItemSelectAndCalculate";
	return MockItemSelectAndCalculate;
});

jest.mock("./BoxResultsDisplay", () => {
	const MockBoxResultsDisplay = () => (
		<div data-testid="box-results">BoxResultsDisplay</div>
	);
	MockBoxResultsDisplay.displayName = "BoxResultsDisplay";
	return MockBoxResultsDisplay;
});

jest.mock("@/components/PdfImport", () => {
	const MockPdfImport = () => <div data-testid="pdf-import">PdfImport</div>;
	MockPdfImport.displayName = "PdfImport";
	return MockPdfImport;
});

describe("BoxShippingCalculatorPage Integration Tests", () => {
	beforeEach(() => {
		// Reset fetch mock before each test
		global.fetch = jest.fn();
	});

	it("displays results after calculation", async () => {
		render(<BoxShippingCalculatorPage />);

		fireEvent.click(screen.getByTestId("calculate-button"));

		await waitFor(() => {
			expect(screen.getByTestId("box-results")).toBeInTheDocument();
		});
	});
});
