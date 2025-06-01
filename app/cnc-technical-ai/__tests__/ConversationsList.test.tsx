/**
 * Tests for ConversationsList Component
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConversationsList from "../ConversationsList";

describe("ConversationsList", () => {
  it("renders the component with default selected value", () => {
    render(<ConversationsList />);
    
    // Check that label is rendered
    expect(screen.getByLabelText("Conversation Type:")).toBeInTheDocument();
    
    // Check that dropdown is rendered with default value
    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toHaveValue("Chat");
    
    // Check that options are rendered
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveValue("Chat");
    expect(options[1]).toHaveValue("Email");
  });

  it("changes selected value when user selects a different option", () => {
    render(<ConversationsList />);
    
    // Get the select element
    const selectElement = screen.getByRole("combobox");
    
    // Change the selected value
    fireEvent.change(selectElement, { target: { value: "Email" } });
    
    // Check that the value has changed
    expect(selectElement).toHaveValue("Email");
  });
});
