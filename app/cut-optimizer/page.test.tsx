/**
 * Cut Optimizer Page Tests
 * Tests for the cut optimizer page component
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CutOptimizerPage from "./page";
import * as api from "@/utils/cut-optimizer/api";

// Mock the API module
jest.mock("@/utils/cut-optimizer/api", () => ({
  optimizeLinear: jest.fn(),
  optimizePanel: jest.fn(),
  AlgoApiError: class AlgoApiError extends Error {
    status: number;
    errors: Array<{ detail: string }>;
    constructor(
      message: string,
      status: number,
      errors: Array<{ detail: string }>
    ) {
      super(message);
      this.name = "AlgoApiError";
      this.status = status;
      this.errors = errors;
    }
  },
}));

// Mock the LayoutContainer component
jest.mock("@/components/LayoutContainer", () => {
  return function MockLayoutContainer({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div data-testid="layout-container">{children}</div>;
  };
});

describe("CutOptimizerPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render the page title", () => {
      render(<CutOptimizerPage />);
      expect(screen.getByText("Cut Optimizer")).toBeInTheDocument();
    });

    it("should render the description", () => {
      render(<CutOptimizerPage />);
      expect(
        screen.getByText(/Calculate optimal cutting layouts/)
      ).toBeInTheDocument();
    });

    it("should render linear and panel tabs", () => {
      render(<CutOptimizerPage />);
      expect(screen.getByText("Linear (1D)")).toBeInTheDocument();
      expect(screen.getByText("Panel (2D)")).toBeInTheDocument();
    });

    it("should render linear optimization by default", () => {
      render(<CutOptimizerPage />);
      expect(screen.getByText("Stock Materials")).toBeInTheDocument();
      expect(screen.getByText("Required Parts")).toBeInTheDocument();
    });

    it("should render the optimize button", () => {
      render(<CutOptimizerPage />);
      expect(screen.getByText("Optimize Cut Plan")).toBeInTheDocument();
    });
  });

  describe("Tab Switching", () => {
    it("should switch to panel tab when clicked", () => {
      render(<CutOptimizerPage />);

      fireEvent.click(screen.getByText("Panel (2D)"));

      expect(screen.getByText("Stock Sheets")).toBeInTheDocument();
      expect(screen.getByText("Required Panels")).toBeInTheDocument();
    });

    it("should switch back to linear tab when clicked", () => {
      render(<CutOptimizerPage />);

      fireEvent.click(screen.getByText("Panel (2D)"));
      fireEvent.click(screen.getByText("Linear (1D)"));

      expect(screen.getByText("Stock Materials")).toBeInTheDocument();
    });
  });

  describe("Linear Stock Management", () => {
    it("should add a new stock row when add button is clicked", () => {
      render(<CutOptimizerPage />);

      const addButton = screen.getByText("+ Add Stock");
      fireEvent.click(addButton);

      // Should now have 2 stock sections with "Stock Materials" header
      const stockHeaders = screen.getAllByText("Stock Materials");
      expect(stockHeaders).toHaveLength(1); // Only one header

      // Check that we have2 "Remove" buttons for stocks (plus 1 for requirement)
      const removeButtons = screen.getAllByText("Remove");
      expect(removeButtons.length).toBeGreaterThanOrEqual(3); // 2 stocks + 1 requirement
    });

    it("should not allow removing the last stock row", () => {
      render(<CutOptimizerPage />);

      // Find the disabled remove button in the stocks section
      const stockSection = screen.getByText("Stock Materials").closest(".card");
      const removeButton = stockSection?.querySelector("button:disabled");

      expect(removeButton).toBeTruthy();
      expect(removeButton).toHaveTextContent("Remove");
    });

    it("should update stock length when input changes", () => {
      render(<CutOptimizerPage />);

      // Get the first stock input (in the Stock Materials section)
      const stockSection = screen.getByText("Stock Materials").closest(".card");
      const lengthInput = stockSection?.querySelector(
        'input[placeholder="Length (mm)"]'
      );

      if (lengthInput) {
        fireEvent.change(lengthInput, { target: { value: "2000" } });
        expect(lengthInput).toHaveValue(2000);
      }
    });
  });

  describe("Linear Requirement Management", () => {
    it("should add a new requirement row when add button is clicked", () => {
      render(<CutOptimizerPage />);

      const addButton = screen.getByText("+ Add Part");
      fireEvent.click(addButton);

      // Check that we have more "Remove" buttons
      const removeButtons = screen.getAllByText("Remove");
      expect(removeButtons.length).toBeGreaterThanOrEqual(3); // 1 stock + 2 requirements
    });
  });

  describe("Panel Stock Management", () => {
    it("should add a new panel stock row when add button is clicked", () => {
      render(<CutOptimizerPage />);

      // Switch to panel tab
      fireEvent.click(screen.getByText("Panel (2D)"));

      const addButton = screen.getByText("+ Add Sheet");
      fireEvent.click(addButton);

      // Check that we have more "Remove" buttons
      const removeButtons = screen.getAllByText("Remove");
      expect(removeButtons.length).toBeGreaterThanOrEqual(3); // 2 stocks + 1 requirement
    });
  });

  describe("Linear Optimization", () => {
    it("should call optimizeLinear when button is clicked", async () => {
      const mockResponse = {
        solution: {
          totalRequiredStocks: 2,
          requiredStocks: [{ index: 0, length: "3000", count: 2 }],
          layouts: [
            {
              count: 1,
              stock: { index: 0, length: "3000" },
              parts: [{ index: 0, length: "500", count: 4 }],
              waste: { material: "1000" },
              cuts: { count: 4 },
            },
          ],
        },
      };

      (api.optimizeLinear as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(<CutOptimizerPage />);

      // Click optimize button
      fireEvent.click(screen.getByText("Optimize Cut Plan"));

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText("Optimization Results")).toBeInTheDocument();
      });

      expect(api.optimizeLinear).toHaveBeenCalledWith(
        expect.objectContaining({
          stocks: expect.arrayContaining([
            expect.objectContaining({ length: "3000" }),
          ]),
          requirements: expect.arrayContaining([
            expect.objectContaining({ length: "500", count: 4 }),
          ]),
        })
      );
    });

    it("should display results after successful optimization", async () => {
      const mockResponse = {
        solution: {
          totalRequiredStocks: 2,
          requiredStocks: [{ index: 0, length: "3000", count: 2 }],
          layouts: [
            {
              count: 1,
              stock: { index: 0, length: "3000" },
              parts: [{ index: 0, length: "500", count: 4 }],
              waste: { material: "1000" },
              cuts: { count: 4 },
            },
          ],
        },
      };

      (api.optimizeLinear as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(<CutOptimizerPage />);

      fireEvent.click(screen.getByText("Optimize Cut Plan"));

      await waitFor(() => {
        expect(
          screen.getByText("Total Stocks Required:")
        ).toBeInTheDocument();
      });

      // Check for the total stocks value
      const totalStocksElement = screen.getByText("Total Stocks Required:")
        .parentElement;
      expect(totalStocksElement).toHaveTextContent("2");
    });

    it("should display error message on API error", async () => {
      const error = new api.AlgoApiError("Validation failed", 422, [
        { detail: "Stocks must not be empty" },
      ]);

      (api.optimizeLinear as jest.Mock).mockRejectedValueOnce(error);

      render(<CutOptimizerPage />);

      fireEvent.click(screen.getByText("Optimize Cut Plan"));

      await waitFor(() => {
        expect(
          screen.getByText("Stocks must not be empty")
        ).toBeInTheDocument();
      });
    });

    it("should show loading state while optimizing", async () => {
      // Create a promise that we can resolve manually
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (api.optimizeLinear as jest.Mock).mockReturnValueOnce(promise);

      render(<CutOptimizerPage />);

      fireEvent.click(screen.getByText("Optimize Cut Plan"));

      // Check loading state
      expect(screen.getByText("Optimizing...")).toBeInTheDocument();

      // Resolve the promise
      resolvePromise!({
        solution: {
          totalRequiredStocks: 1,
          requiredStocks: [],
          layouts: [],
        },
      });

      await waitFor(() => {
        expect(screen.queryByText("Optimizing...")).not.toBeInTheDocument();
      });
    });
  });

  describe("Panel Optimization", () => {
    it("should call optimizePanel when button is clicked", async () => {
      const mockResponse = {
        solution: {
          totalRequiredStocks: 1,
          requiredStocks: [
            { index: 0, length: "2440", width: "1220", count: 1 },
          ],
          layouts: [
            {
              count: 1,
              stock: { index: 0, length: "2440", width: "1220" },
              panels: [
                { index: 0, length: "600", width: "400", x: "0", y: "0" },
              ],
              remainders: [],
              cuts: { count: 2, length: "2440" },
            },
          ],
        },
      };

      (api.optimizePanel as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(<CutOptimizerPage />);

      // Switch to panel tab
      fireEvent.click(screen.getByText("Panel (2D)"));

      // Click optimize button
      fireEvent.click(screen.getByText("Optimize Cut Plan"));

      await waitFor(() => {
        expect(screen.getByText("Optimization Results")).toBeInTheDocument();
      });

      expect(api.optimizePanel).toHaveBeenCalled();
    });
  });

  describe("Settings", () => {
    it("should update kerf setting", () => {
      render(<CutOptimizerPage />);

      const kerfInput = screen.getByLabelText("Kerf (mm)");
      fireEvent.change(kerfInput, { target: { value: "5" } });

      expect(kerfInput).toHaveValue(5);
    });

    it("should update left trim setting", () => {
      render(<CutOptimizerPage />);

      const leftTrimInput = screen.getByLabelText("Left Trim (mm)");
      fireEvent.change(leftTrimInput, { target: { value: "20" } });

      expect(leftTrimInput).toHaveValue(20);
    });
  });
});
