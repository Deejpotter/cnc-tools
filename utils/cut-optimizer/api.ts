/**
 * Cut Optimizer API Client
 * Client for the algo-api cut optimization service
 * API URL: https://algo-api.deejpotter.com/
 */

import type {
  LinearOptimizationRequest,
  LinearOptimizationResponse,
  PanelOptimizationRequest,
  PanelOptimizationResponse,
  ApiError,
} from "@/types/cut-optimizer";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_ALGO_API_URL || "https://algo-api.deejpotter.com";

/**
 * Custom error class for API errors
 */
export class AlgoApiError extends Error {
  status: number;
  errors: ApiError["errors"];

  constructor(message: string, status: number, errors: ApiError["errors"]) {
    super(message);
    this.name = "AlgoApiError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Make an API request to the algo-api service
 */
async function apiRequest<T>(
  endpoint: string,
  data: unknown
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorData = responseData as ApiError;
    throw new AlgoApiError(
      `API error: ${response.status}`,
      response.status,
      errorData.errors || []
    );
  }

  return responseData as T;
}

/**
 * Check if the API is healthy
 */
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const url = `${API_BASE_URL}/health`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new AlgoApiError(
      `Health check failed: ${response.status}`,
      response.status,
      []
    );
  }

  return response.json();
}

/**
 * Run linear (1D) cut optimization
 */
export async function optimizeLinear(
  request: LinearOptimizationRequest
): Promise<LinearOptimizationResponse> {
  return apiRequest<LinearOptimizationResponse>(
    "/api/optimize/linear",
    request
  );
}

/**
 * Run panel (2D) cut optimization
 */
export async function optimizePanel(
  request: PanelOptimizationRequest
): Promise<PanelOptimizationResponse> {
  return apiRequest<PanelOptimizationResponse>(
    "/api/optimize/panel",
    request
  );
}
