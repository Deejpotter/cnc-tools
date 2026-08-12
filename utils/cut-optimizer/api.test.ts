/**
 * Cut Optimizer API Client Tests
 * Tests for the algo-api client utility
 */

import {
  checkHealth,
  optimizeLinear,
  optimizePanel,
  AlgoApiError,
} from "./api";
import type {
  LinearOptimizationRequest,
  PanelOptimizationRequest,
} from "@/types/cut-optimizer";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Cut Optimizer API Client", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("checkHealth", () => {
    it("should return health status on success", async () => {
      const mockResponse = {
        status: "ok",
        timestamp: "2026-08-12T01:00:00.000Z",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await checkHealth();

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://algo-api.deejpotter.com/health"
      );
    });

    it("should throw AlgoApiError on failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ errors: [] }),
      });

      await expect(checkHealth()).rejects.toThrow(AlgoApiError);
    });
  });

  describe("optimizeLinear", () => {
    it("should send correct request and return solution", async () => {
      const request: LinearOptimizationRequest = {
        stocks: [{ length: "300", count: 10 }],
        requirements: [
          { length: "100", count: 4 },
          { length: "40", count: 3 },
        ],
        settings: { kerf: "1" },
      };

      const mockResponse = {
        solution: {
          totalRequiredStocks: 2,
          requiredStocks: [{ index: 0, length: "300", count: 2 }],
          layouts: [
            {
              count: 1,
              stock: { index: 0, length: "300" },
              parts: [
                { index: 0, length: "100", count: 2 },
                { index: 1, length: "40", count: 2 },
              ],
              waste: { cut: "1", material: "17" },
              cuts: { count: 4 },
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await optimizeLinear(request);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://algo-api.deejpotter.com/api/optimize/linear",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        }
      );
    });

    it("should throw AlgoApiError with validation errors", async () => {
      const request: LinearOptimizationRequest = {
        stocks: [],
        requirements: [],
      };

      const errorResponse = {
        errors: [
          {
            status: "422",
            source: { pointer: "stocks" },
            title: "Validation failed",
            detail: "Must not be empty.",
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => errorResponse,
      });

      try {
        await optimizeLinear(request);
        fail("Expected error to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("API error");
      }
    });

    it("should handle network errors", async () => {
      const request: LinearOptimizationRequest = {
        stocks: [{ length: "300" }],
        requirements: [{ length: "100", count: 1 }],
      };

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(optimizeLinear(request)).rejects.toThrow("Network error");
    });
  });

  describe("optimizePanel", () => {
    it("should send correct request and return solution", async () => {
      const request: PanelOptimizationRequest = {
        stocks: [{ length: "2440", width: "1220", count: 10 }],
        requirements: [
          { length: "600", width: "400", count: 4 },
          { length: "300", width: "200", count: 8 },
        ],
        settings: { kerf: "3" },
      };

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
                { index: 0, length: "600", width: "400", x: "603", y: "0" },
              ],
              remainders: [
                { length: "1220", width: "400", x: "0", y: "410" },
              ],
              cuts: { count: 4, length: "2440" },
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await optimizePanel(request);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://algo-api.deejpotter.com/api/optimize/panel",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        }
      );
    });

    it("should throw AlgoApiError with validation errors", async () => {
      const request: PanelOptimizationRequest = {
        stocks: [],
        requirements: [],
      };

      const errorResponse = {
        errors: [
          {
            status: "422",
            source: { pointer: "stocks" },
            title: "Validation failed",
            detail: "Must not be empty.",
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => errorResponse,
      });

      await expect(optimizePanel(request)).rejects.toThrow();
    });
  });

  describe("AlgoApiError", () => {
    it("should create error with correct properties", () => {
      const errors = [
        {
          status: "422",
          source: { pointer: "stocks" },
          title: "Validation failed",
          detail: "Must not be empty.",
        },
      ];

      const error = new AlgoApiError("Test error", 422, errors);

      expect(error.name).toBe("AlgoApiError");
      expect(error.message).toBe("Test error");
      expect(error.status).toBe(422);
      expect(error.errors).toEqual(errors);
      expect(error).toBeInstanceOf(Error);
    });

    it("should handle empty errors array", () => {
      const error = new AlgoApiError("Server error", 500, []);

      expect(error.status).toBe(500);
      expect(error.errors).toEqual([]);
    });
  });
});
