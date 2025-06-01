/* /**
 * Tests for ItemEditModalBatch Component
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ItemEditModalBatch from "../ItemEditModalBatch";
import ShippingItem from "@/types/box-shipping-calculator/ShippingItem";

const mockItems: ShippingItem[] = [
  {
    _id: "item1",
    name: "Test Item 1",
    sku: "TEST001",
    length: 100,
    width: 80,
    height: 30,
    weight: 250,
    quantity: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    _id: "item2",
    name: "Test Item 2",
    sku: "TEST002",
    length: 150,
    width: 120,
    height: 40,
    weight: 400,
    quantity: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    _id: "item3",
    name: "Test Item 3",
    sku: undefined,
    length: 200,
    width: 160,
    height: 50,
    weight: 600,
    quantity: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
];

describe("ItemEditModalBatch", () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  it("does not render when isOpen is false", () => {
    render(
      <ItemEditModalBatch
        items={mockItems}
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.queryByText("Batch Edit Items")).not.toBeInTheDocument();
  });

  it("renders the modal with items when isOpen is true", () => {
    render(
      <ItemEditModalBatch
        items={mockItems}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    // Check modal title
    expect(screen.getByText("Batch Edit Items")).toBeInTheDocument();
    
    // Check batch update section
    expect(screen.getByText("Batch Update")).toBeInTheDocument();
    expect(screen.getByText("Select Field")).toBeInTheDocument();
    expect(screen.getByText("New Value")).toBeInTheDocument();
    
    // Check all items are displayed
    expect(screen.getByText("Test Item 1")).toBeInTheDocument();
    expect(screen.getByText("Test Item 2")).toBeInTheDocument();
    expect(screen.getByText("Test Item 3")).toBeInTheDocument();
    
    // Check SKUs are displayed
    expect(screen.getByText("SKU: TEST001")).toBeInTheDocument();
    expect(screen.getByText("SKU: TEST002")).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save All Changes/i })).toBeInTheDocument();
  });

  it("handles select all functionality", () => {
    render(
      <ItemEditModalBatch
        items={mockItems}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    const selectAllCheckbox = screen.getByLabelText("Select All Items");
    
    // Should be checked by default
    expect(selectAllCheckbox).toBeChecked();
    
    // Uncheck select all
    fireEvent.click(selectAllCheckbox);
    expect(selectAllCheckbox).not.toBeChecked();
    
    // All individual checkboxes should be unchecked
    const itemCheckboxes = screen.getAllByRole("checkbox").filter(
      checkbox => checkbox !== selectAllCheckbox
    );
    itemCheckboxes.forEach(checkbox => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it("handles individual item selection", () => {
    render(
      <ItemEditModalBatch
        items={mockItems}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    const selectAllCheckbox = screen.getByLabelText("Select All Items");
    const firstItemCheckbox = screen.getByLabelText("Test Item 1");
    
    // Uncheck first item
    fireEvent.click(firstItemCheckbox);
    
    // Select all should become unchecked
    expect(selectAllCheckbox).not.toBeChecked();
    expect(firstItemCheckbox).not.toBeChecked();
  });

  it("applies batch value to selected items", () => {
    render(
      <ItemEditModalBatch
        items={mockItems}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    // Enter batch value for weight
    const batchValueInput = screen.getByLabelText("New Value");
    fireEvent.change(batchValueInput, { target: { value: "500" } });
    
    // Apply to selected items
    const applyButton = screen.getByRole("button", { name: /Apply to Selected/i });
    fireEvent.click(applyButton);
    
    // Check that weight values were updated in the table
    const weightInputs = screen.getAllByDisplayValue("500");
    expect(weightInputs.length).toBe(3); // All items should have new weight
  });

  it("toggles advanced view", () => {
    render(
      <ItemEditModalBatch
        items={mockItems}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    // Advanced view should be hidden by default
    expect(screen.queryByText("Length")).not.toBeInTheDocument();
    expect(screen.queryByText("Width")).not.toBeInTheDocument();
    expect(screen.queryByText("Height")).not.toBeInTheDocument();
    
    // Show advanced view
    const advancedButton = screen.getByRole("button", { name: /Show Advanced/i });
    fireEvent.click(advancedButton);
    
    // Advanced columns should now be visible
    expect(screen.getByText("Length")).toBeInTheDocument();
    expect(screen.getByText("Width")).toBeInTheDocument();
    expect(screen.getByText("Height")).toBeInTheDocument();
    
    // Button text should change
    expect(screen.getByRole("button", { name: /Hide Advanced/i })).toBeInTheDocument();
  });

  it("handles individual item weight changes", () => {
    render(
      <ItemEditModalBatch
        items={mockItems}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    // Find the first weight input and change it
    const weightInputs = screen.getAllByDisplayValue("250");
    const firstWeightInput = weightInputs[0];
    
    fireEvent.change(firstWeightInput, { target: { value: "300" } });
    expect(firstWeightInput).toHaveValue(300);
  });

  it("changes batch field selection", () => {
    render(
      <ItemEditModalBatch
        items={mockItems}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    const fieldSelect = screen.getByLabelText("Select Field");
    
    // Should default to weight
    expect(fieldSelect).toHaveValue("weight");
    
    // Change to length
    fireEvent.change(fieldSelect, { target: { value: "length" } });
    expect(fieldSelect).toHaveValue("length");
  });

  it("closes modal when close button is clicked", () => {
    render(
      <ItemEditModalBatch
        items={mockItems}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("closes modal when X button is clicked", () => {
    render(
      <ItemEditModalBatch
        items={mockItems}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    fireEvent.click(screen.getByRole("button", { name: "" })); // X button
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("submits form with modified items only", async () => {
    mockOnSave.mockResolvedValue(undefined);
    
    render(
      <ItemEditModalBatch
        items={mockItems}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    // Modify first item's weight
    const weightInputs = screen.getAllByDisplayValue("250");
    const firstWeightInput = weightInputs[0];
    fireEvent.change(firstWeightInput, { target: { value: "350" } });
    
    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /Save All Changes/i }));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith([
        expect.objectContaining({
          _id: "item1",
          weight: 350,
        }),
      ]);
    });
  });

  it("shows loading state while saving", async () => {
    mockOnSave.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(
      <ItemEditModalBatch
        items={mockItems}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    // Modify an item
    const weightInputs = screen.getAllByDisplayValue("250");
    fireEvent.change(weightInputs[0], { target: { value: "350" } });
    
    fireEvent.click(screen.getByRole("button", { name: /Save All Changes/i }));
    
    // Check loading state
    expect(screen.getByText("Saving...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.queryByText("Saving...")).not.toBeInTheDocument();
    });
  });

  it("shows error message when save fails", async () => {
    mockOnSave.mockRejectedValue(new Error("Save failed"));
    
    render(
      <ItemEditModalBatch
        items={mockItems}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    // Modify an item
    const weightInputs = screen.getAllByDisplayValue("250");
    fireEvent.change(weightInputs[0], { target: { value: "350" } });
    
    fireEvent.click(screen.getByRole("button", { name: /Save All Changes/i }));
    
    await waitFor(() => {
      expect(screen.getByText("Failed to save changes. Please try again.")).toBeInTheDocument();
    });
  });

  it("closes without saving if no items were modified", async () => {
    mockOnSave.mockResolvedValue(undefined);
    
    render(
      <ItemEditModalBatch
        items={mockItems}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    // Submit form without modifications
    fireEvent.click(screen.getByRole("button", { name: /Save All Changes/i }));
    
    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("handles items without SKU", () => {
    render(
      <ItemEditModalBatch
        items={mockItems}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    // Item 3 has no SKU, so it shouldn't show SKU text
    expect(screen.getByText("Test Item 3")).toBeInTheDocument();
    expect(screen.queryByText("SKU: undefined")).not.toBeInTheDocument();
  });

  it("disables apply button when no batch value is entered", () => {
    render(
      <ItemEditModalBatch
        items={mockItems}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    const applyButton = screen.getByRole("button", { name: /Apply to Selected/i });
    expect(applyButton).toBeDisabled();
    
    // Enter a value
    const batchValueInput = screen.getByLabelText("New Value");
    fireEvent.change(batchValueInput, { target: { value: "500" } });
    
    expect(applyButton).not.toBeDisabled();
  });
});
 */
