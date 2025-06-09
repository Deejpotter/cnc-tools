/**
 * whoami/page.test.tsx
 * Updated: 09/06/2025
 * Author: Deej Potter
 * Description: Test for WhoAmIPage. Mocks fetch to /api/whoami and tests success and error cases.
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import WhoAmIPage from "./page";

// Mock Clerk useAuth
jest.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    getToken: async () => "mock-jwt",
    isSignedIn: true,
  }),
}));

describe("WhoAmIPage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("shows user ID on success", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ userId: "user_123" }),
    }) as any;
    render(<WhoAmIPage />);
    await waitFor(() => {
      expect(screen.getByText(/User ID: user_123/)).toBeInTheDocument();
    });
  });

  it("shows error on API error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Unauthorized" }),
    }) as any;
    render(<WhoAmIPage />);
    await waitFor(() => {
      expect(screen.getByText(/Error: Unauthorized/)).toBeInTheDocument();
    });
  });

  it("shows error on network failure", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
    render(<WhoAmIPage />);
    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
    });
  });
});
