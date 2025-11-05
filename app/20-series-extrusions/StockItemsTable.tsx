"use client";

import { ReactElement } from "react";
import { Table, Button, Form, Card } from "react-bootstrap";
import { StockItem } from "@/types/20-series-cut-calculator/cutCalculator";

type StockItemsTableProps = {
  stockItems: StockItem[];
  onStockItemsChange: (stockItems: StockItem[]) => void;
  maxStockLength: number;
};

export default function StockItemsTable({
  stockItems,
  onStockItemsChange,
  maxStockLength,
}: StockItemsTableProps): ReactElement {
  const handleAddStockItem = (): void => {
    const newId = String(
      Math.max(0, ...stockItems.map((s) => parseInt(s.id) || 0)) + 1
    );
    onStockItemsChange([
      ...stockItems,
      { id: newId, length: maxStockLength, quantity: 10 },
    ]);
  };

  const handleRemoveStockItem = (id: string): void => {
    onStockItemsChange(stockItems.filter((s) => s.id !== id));
  };

  const handleUpdateStockItem = (
    id: string,
    field: "length" | "quantity",
    value: string
  ): void => {
    const numValue = parseFloat(value);
    onStockItemsChange(
      stockItems.map((s) =>
        s.id === id ? { ...s, [field]: isNaN(numValue) ? 0 : numValue } : s
      )
    );
  };

  const totalStockLength = stockItems.reduce(
    (sum, s) => sum + s.length * s.quantity,
    0
  );

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Available Stock</h5>
        <Button
          variant="light"
          size="sm"
          onClick={handleAddStockItem}
          aria-label="Add new stock item"
        >
          <i className="bi bi-plus-lg me-1"></i>
          Add Stock Length
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        <Table responsive striped hover className="mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: "15%" }}>ID</th>
              <th style={{ width: "35%" }}>
                Length (mm) <span className="text-danger">*</span>
              </th>
              <th style={{ width: "35%" }}>
                Quantity Available <span className="text-danger">*</span>
              </th>
              <th style={{ width: "15%" }} className="text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {stockItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted py-4">
                  No stock items added. Click &quot;Add Stock Length&quot; to start.
                </td>
              </tr>
            ) : (
              stockItems.map((stock) => (
                <tr key={stock.id}>
                  <td className="align-middle">
                    <strong>#{stock.id}</strong>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={stock.length || ""}
                      onChange={(e) =>
                        handleUpdateStockItem(stock.id, "length", e.target.value)
                      }
                      placeholder="Stock length"
                      min="1"
                      max={maxStockLength}
                      step="1"
                      aria-label={`Length for stock ${stock.id}`}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={stock.quantity || ""}
                      onChange={(e) =>
                        handleUpdateStockItem(
                          stock.id,
                          "quantity",
                          e.target.value
                        )
                      }
                      placeholder="Quantity available"
                      min="1"
                      step="1"
                      aria-label={`Quantity for stock ${stock.id}`}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveStockItem(stock.id)}
                      disabled={stockItems.length === 1}
                      aria-label={`Remove stock ${stock.id}`}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
      <Card.Footer className="text-muted">
        <small>
          Total stock pieces: {stockItems.reduce((sum, s) => sum + s.quantity, 0)} |
          Total stock length available:{" "}
          {totalStockLength.toLocaleString()}mm
        </small>
      </Card.Footer>
    </Card>
  );
}
