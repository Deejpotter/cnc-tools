import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CuttingListTable from '../CuttingListTable';

// Mock data for testing
const mockCutList = [
  {
    stockLength: 1000,
    cuts: [
      { length: 200, quantity: 2 },
      { length: 300, quantity: 1 }
    ],
    waste: 300,
    usedLength: 700,
    wastePercentage: 30
  },
  {
    stockLength: 2000,
    cuts: [
      { length: 500, quantity: 3 },
      { length: 400, quantity: 1 }
    ],
    waste: 100,
    usedLength: 1900,
    wastePercentage: 5
  }
];

describe('CuttingListTable Component', () => {
  test('renders the component with header', () => {
    render(<CuttingListTable cutList={mockCutList} />);
    
    // Check that the component renders with its header
    expect(screen.getByText('Cutting List')).toBeInTheDocument();
    expect(screen.getByTestId('cutting-list-table')).toBeInTheDocument();
  });

  test('renders with showStockLengths=true by default', () => {
    render(<CuttingListTable cutList={mockCutList} />);
    
    // Check stock length column is shown
    expect(screen.getByText('Stock Length')).toBeInTheDocument();
    expect(screen.getByText('1000mm')).toBeInTheDocument();
    expect(screen.getByText('2000mm')).toBeInTheDocument();
  });

  test('renders with showStockLengths=false', () => {
    render(<CuttingListTable cutList={mockCutList} showStockLengths={false} />);
    
    // Check stock length column is not shown
    expect(screen.queryByText('Stock Length')).not.toBeInTheDocument();
    expect(screen.queryByText('1000mm')).not.toBeInTheDocument();
  });

  test('renders cut information correctly', () => {
    render(<CuttingListTable cutList={mockCutList} />);
    
    // Check cut information
    expect(screen.getByText('2×200mm, 1×300mm')).toBeInTheDocument();
    expect(screen.getByText('3×500mm, 1×400mm')).toBeInTheDocument();
    
    // Check waste percentages
    expect(screen.getByText('30.0%')).toBeInTheDocument();
    expect(screen.getByText('5.0%')).toBeInTheDocument();
  });
});
