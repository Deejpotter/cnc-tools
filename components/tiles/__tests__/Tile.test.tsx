/**
 * Tests for Tile Component
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Tile from "../Tile";

// Mock Next.js Link component
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe("Tile", () => {
  const defaultProps = {
    title: "Test Tile",
    description: "This is a test description",
    link: "/test-link",
    linkText: "Click Me",
  };

  it("renders the component with required props", () => {
    render(<Tile {...defaultProps} />);

    // Check that title and description are rendered
    expect(screen.getByText("Test Tile")).toBeInTheDocument();
    expect(screen.getByText("This is a test description")).toBeInTheDocument();
    
    // Check that link and button text are rendered
    const button = screen.getByText("Click Me");
    expect(button).toBeInTheDocument();
    expect(button.closest("a")).toHaveAttribute("href", "/test-link");
  });

  it("renders with default background and text colors when not specified", () => {
    render(<Tile {...defaultProps} />);
    
    // Check for default classes
    const card = screen.getByText("Test Tile").closest(".card");
    expect(card).toHaveClass("bg-light");
    expect(card).toHaveClass("text-dark");
  });

  it("renders with custom background and text colors when specified", () => {
    render(
      <Tile 
        {...defaultProps} 
        bgColorClass="bg-primary" 
        textColorClass="text-white" 
      />
    );
    
    // Check for custom classes
    const card = screen.getByText("Test Tile").closest(".card");
    expect(card).toHaveClass("bg-primary");
    expect(card).toHaveClass("text-white");
  });
});
