/**
 * Tests for TileSection Component
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TileSection from "../TileSection";

// Mock the Tile component
jest.mock("../Tile", () => {
  return ({ title, description, link, linkText }: any) => (
    <div data-testid="mock-tile">
      <div data-title={title}>{title}</div>
      <div data-description={description}>{description}</div>
      <div data-link={link}>{link}</div>
      <div data-linktext={linkText}>{linkText}</div>
    </div>
  );
});

describe("TileSection", () => {
  const defaultProps = {
    title: "Test Section",
    tiles: [
      {
        title: "Tile 1",
        description: "Description 1",
        link: "/link1",
        linkText: "Link 1",
      },
      {
        title: "Tile 2",
        description: "Description 2",
        link: "/link2",
        linkText: "Link 2",
      },
    ],
  };

  it("renders the section title", () => {
    render(<TileSection {...defaultProps} />);
    expect(screen.getByText("Test Section")).toBeInTheDocument();
  });

  it("renders all tiles passed as props", () => {
    render(<TileSection {...defaultProps} />);
    
    // Check that all tiles are rendered
    const tiles = screen.getAllByTestId("mock-tile");
    expect(tiles).toHaveLength(2);
    
    // Check content of first tile
    expect(screen.getByText("Tile 1")).toBeInTheDocument();
    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("/link1")).toBeInTheDocument();
    expect(screen.getByText("Link 1")).toBeInTheDocument();
    
    // Check content of second tile
    expect(screen.getByText("Tile 2")).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
    expect(screen.getByText("/link2")).toBeInTheDocument();
    expect(screen.getByText("Link 2")).toBeInTheDocument();
  });

  it("renders an empty section when no tiles are provided", () => {
    render(<TileSection title="Empty Section" tiles={[]} />);
    
    expect(screen.getByText("Empty Section")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-tile")).not.toBeInTheDocument();
  });
});
