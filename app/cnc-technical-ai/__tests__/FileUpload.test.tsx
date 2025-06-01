/**
 * Tests for FileUpload Component
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import FileUpload from "../FileUpload";

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({
      onClick: jest.fn(),
      onKeyDown: jest.fn(),
      tabIndex: 0,
    }),
    getInputProps: () => ({
      type: 'file',
      multiple: false,
      style: { display: 'none' },
    }),
  }),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
  })
) as jest.Mock;

// Mock FormData
global.FormData = jest.fn().mockImplementation(() => ({
  append: jest.fn(),
}));

describe("FileUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component with correct text", () => {
    render(<FileUpload uploadEndpoint="/api/upload" />);
    
    // Check that component text is rendered
    expect(screen.getByText(/This uploader is for bulk adding QA pairs/)).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop a file here, or click to select a file/)).toBeInTheDocument();
    
    // Check that the input element is present
    expect(screen.getByRole('textbox', { hidden: true })).toBeInTheDocument();
  });

  it("has correct styling for dropzone", () => {
    render(<FileUpload uploadEndpoint="/api/upload" />);
    
    const dropzone = screen.getByText(/Drag and drop/).parentElement;
    expect(dropzone).toHaveStyle({
      border: '1px dashed #218838',
      padding: '1rem',
      cursor: 'pointer',
    });
  });
});
