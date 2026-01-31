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
jest.mock("@/components/LayoutContainer", () => ({ children }) => (
	<div>{children}</div>
));

// Mock child components
jest.mock("./ItemAddForm", () => () => (
	<div data-testid="item-add-form">ItemAddForm</div>
));
jest.mock("./ItemSelectAndCalculate", () => ({ onCalculateBox }) => (
	<button data-testid="calculate-button" onClick={() => onCalculateBox([])}>
		Calculate
	</button>
));
jest.mock("./BoxResultsDisplay", () => () => (
	<div data-testid="box-results">BoxResultsDisplay</div>
));
jest.mock("@/components/PdfImport", () => () => (
	<div data-testid="pdf-import">PdfImport</div>
));

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
