"use client";

import LayoutContainer from "@/components/LayoutContainer";
import React, { useState, useCallback } from "react";
import {
  optimizeLinear,
  optimizePanel,
  AlgoApiError,
} from "@/utils/cut-optimizer/api";
import type {
  LinearStock,
  LinearRequirement,
  LinearSettings,
  LinearOptimizationResponse,
  PanelStock,
  PanelRequirement,
  PanelSettings,
  PanelOptimizationResponse,
  OptimizationType,
} from "@/types/cut-optimizer";

/**
 * Cut Optimizer Page
 * Provides linear (1D) and panel (2D) cut optimization
 * Powered by algo-api.deejpotter.com
 */
export default function CutOptimizerPage() {
  const [optimizationType, setOptimizationType] =
    useState<OptimizationType>("linear");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Linear optimization state
  const [linearStocks, setLinearStocks] = useState<LinearStock[]>([
    { length: "3000", count: 10 },
  ]);
  const [linearRequirements, setLinearRequirements] = useState<
    LinearRequirement[]
  >([{ length: "500", count: 4 }]);
  const [linearSettings, setLinearSettings] = useState<LinearSettings>({
    kerf: "3",
  });
  const [linearResult, setLinearResult] =
    useState<LinearOptimizationResponse | null>(null);

  // Panel optimization state
  const [panelStocks, setPanelStocks] = useState<PanelStock[]>([
    { length: "2440", width: "1220", count: 10 },
  ]);
  const [panelRequirements, setPanelRequirements] = useState<
    PanelRequirement[]
  >([{ length: "600", width: "400", count: 4 }]);
  const [panelSettings, setPanelSettings] = useState<PanelSettings>({
    kerf: "3",
    leftTrim: "10",
    rightTrim: "10",
    topTrim: "10",
    bottomTrim: "10",
  });
  const [panelResult, setPanelResult] =
    useState<PanelOptimizationResponse | null>(null);

  /**
   * Add a new linear stock row
   */
  const addLinearStock = useCallback(() => {
    setLinearStocks((prev) => [...prev, { length: "", count: 1 }]);
  }, []);

  /**
   * Remove a linear stock row
   */
  const removeLinearStock = useCallback((index: number) => {
    setLinearStocks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Update a linear stock row
   */
  const updateLinearStock = useCallback(
    (index: number, field: keyof LinearStock, value: string | number) => {
      setLinearStocks((prev) =>
        prev.map((stock, i) =>
          i === index ? { ...stock, [field]: value } : stock
        )
      );
    },
    []
  );

  /**
   * Add a new linear requirement row
   */
  const addLinearRequirement = useCallback(() => {
    setLinearRequirements((prev) => [...prev, { length: "", count: 1 }]);
  }, []);

  /**
   * Remove a linear requirement row
   */
  const removeLinearRequirement = useCallback((index: number) => {
    setLinearRequirements((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Update a linear requirement row
   */
  const updateLinearRequirement = useCallback(
    (
      index: number,
      field: keyof LinearRequirement,
      value: string | number
    ) => {
      setLinearRequirements((prev) =>
        prev.map((req, i) =>
          i === index ? { ...req, [field]: value } : req
        )
      );
    },
    []
  );

  /**
   * Add a new panel stock row
   */
  const addPanelStock = useCallback(() => {
    setPanelStocks((prev) => [
      ...prev,
      { length: "", width: "", count: 1 },
    ]);
  }, []);

  /**
   * Remove a panel stock row
   */
  const removePanelStock = useCallback((index: number) => {
    setPanelStocks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Update a panel stock row
   */
  const updatePanelStock = useCallback(
    (index: number, field: keyof PanelStock, value: string | number | null) => {
      setPanelStocks((prev) =>
        prev.map((stock, i) =>
          i === index ? { ...stock, [field]: value } : stock
        )
      );
    },
    []
  );

  /**
   * Add a new panel requirement row
   */
  const addPanelRequirement = useCallback(() => {
    setPanelRequirements((prev) => [
      ...prev,
      { length: "", width: "", count: 1 },
    ]);
  }, []);

  /**
   * Remove a panel requirement row
   */
  const removePanelRequirement = useCallback((index: number) => {
    setPanelRequirements((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Update a panel requirement row
   */
  const updatePanelRequirement = useCallback(
    (
      index: number,
      field: keyof PanelRequirement,
      value: string | number | null
    ) => {
      setPanelRequirements((prev) =>
        prev.map((req, i) =>
          i === index ? { ...req, [field]: value } : req
        )
      );
    },
    []
  );

  /**
   * Run linear optimization
   */
  const handleLinearOptimize = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLinearResult(null);

    try {
      const result = await optimizeLinear({
        stocks: linearStocks.filter((s) => s.length && parseFloat(s.length) > 0),
        requirements: linearRequirements.filter(
          (r) => r.length && parseFloat(r.length) > 0 && r.count > 0
        ),
        settings: linearSettings,
      });
      setLinearResult(result);
    } catch (err) {
      if (err instanceof AlgoApiError) {
        setError(
          err.errors.map((e) => e.detail).join(", ") || "Optimization failed"
        );
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [linearStocks, linearRequirements, linearSettings]);

  /**
   * Run panel optimization
   */
  const handlePanelOptimize = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPanelResult(null);

    try {
      const result = await optimizePanel({
        stocks: panelStocks.filter(
          (s) => s.length && s.width && parseFloat(s.length) > 0 && parseFloat(s.width) > 0
        ),
        requirements: panelRequirements.filter(
          (r) =>
            r.length &&
            r.width &&
            parseFloat(r.length) > 0 &&
            parseFloat(r.width) > 0 &&
            r.count > 0
        ),
        settings: panelSettings,
      });
      setPanelResult(result);
    } catch (err) {
      if (err instanceof AlgoApiError) {
        setError(
          err.errors.map((e) => e.detail).join(", ") || "Optimization failed"
        );
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [panelStocks, panelRequirements, panelSettings]);

  return (
    <LayoutContainer>
      <h1>Cut Optimizer</h1>
      <p className="text-muted mb-4">
        Calculate optimal cutting layouts for linear materials (extrusion, pipe,
        tube) and panel materials (sheet goods, plywood, MDF).
      </p>

      {/* Optimization Type Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${optimizationType === "linear" ? "active" : ""}`}
            onClick={() => setOptimizationType("linear")}
          >
            Linear (1D)
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${optimizationType === "panel" ? "active" : ""}`}
            onClick={() => setOptimizationType("panel")}
          >
            Panel (2D)
          </button>
        </li>
      </ul>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Linear Optimization */}
      {optimizationType === "linear" && (
        <div className="row">
          <div className="col-md-6">
            {/* Stocks Section */}
            <div className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Stock Materials</h5>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={addLinearStock}
                >
                  + Add Stock
                </button>
              </div>
              <div className="card-body">
                {linearStocks.map((stock, index) => (
                  <div key={index} className="row mb-2 align-items-center">
                    <div className="col-5">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Length (mm)"
                        value={stock.length}
                        onChange={(e) =>
                          updateLinearStock(index, "length", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-4">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Quantity"
                        value={stock.count || ""}
                        onChange={(e) =>
                          updateLinearStock(
                            index,
                            "count",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="col-3">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeLinearStock(index)}
                        disabled={linearStocks.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements Section */}
            <div className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Required Parts</h5>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={addLinearRequirement}
                >
                  + Add Part
                </button>
              </div>
              <div className="card-body">
                {linearRequirements.map((req, index) => (
                  <div key={index} className="row mb-2 align-items-center">
                    <div className="col-5">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Length (mm)"
                        value={req.length}
                        onChange={(e) =>
                          updateLinearRequirement(
                            index,
                            "length",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-4">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Quantity"
                        value={req.count}
                        onChange={(e) =>
                          updateLinearRequirement(
                            index,
                            "count",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="col-3">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeLinearRequirement(index)}
                        disabled={linearRequirements.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="card mb-3">
              <div className="card-header">
                <h5 className="mb-0">Settings</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <label className="form-label" htmlFor="linear-kerf">Kerf (mm)</label>
                    <input
                      id="linear-kerf"
                      type="number"
                      className="form-control"
                      value={linearSettings.kerf || ""}
                      onChange={(e) =>
                        setLinearSettings((prev) => ({
                          ...prev,
                          kerf: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label" htmlFor="linear-left-trim">Left Trim (mm)</label>
                    <input
                      id="linear-left-trim"
                      type="number"
                      className="form-control"
                      value={linearSettings.leftTrim || ""}
                      onChange={(e) =>
                        setLinearSettings((prev) => ({
                          ...prev,
                          leftTrim: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Optimize Button */}
            <button
              className="btn btn-success btn-lg w-100"
              onClick={handleLinearOptimize}
              disabled={loading}
            >
              {loading ? "Optimizing..." : "Optimize Cut Plan"}
            </button>
          </div>

          {/* Linear Results */}
          <div className="col-md-6">
            {linearResult && (
              <LinearResults result={linearResult} />
            )}
          </div>
        </div>
      )}

      {/* Panel Optimization */}
      {optimizationType === "panel" && (
        <div className="row">
          <div className="col-md-6">
            {/* Stocks Section */}
            <div className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Stock Sheets</h5>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={addPanelStock}
                >
                  + Add Sheet
                </button>
              </div>
              <div className="card-body">
                {panelStocks.map((stock, index) => (
                  <div key={index} className="row mb-2 align-items-center">
                    <div className="col-4">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Length (mm)"
                        value={stock.length}
                        onChange={(e) =>
                          updatePanelStock(index, "length", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-3">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Width (mm)"
                        value={stock.width}
                        onChange={(e) =>
                          updatePanelStock(index, "width", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Qty"
                        value={stock.count || ""}
                        onChange={(e) =>
                          updatePanelStock(
                            index,
                            "count",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="col-3">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removePanelStock(index)}
                        disabled={panelStocks.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements Section */}
            <div className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Required Panels</h5>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={addPanelRequirement}
                >
                  + Add Panel
                </button>
              </div>
              <div className="card-body">
                {panelRequirements.map((req, index) => (
                  <div key={index} className="row mb-2 align-items-center">
                    <div className="col-4">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Length (mm)"
                        value={req.length}
                        onChange={(e) =>
                          updatePanelRequirement(
                            index,
                            "length",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-3">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Width (mm)"
                        value={req.width}
                        onChange={(e) =>
                          updatePanelRequirement(
                            index,
                            "width",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Qty"
                        value={req.count}
                        onChange={(e) =>
                          updatePanelRequirement(
                            index,
                            "count",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="col-3">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removePanelRequirement(index)}
                        disabled={panelRequirements.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="card mb-3">
              <div className="card-header">
                <h5 className="mb-0">Settings</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-6 mb-2">
                    <label className="form-label" htmlFor="panel-kerf">Kerf (mm)</label>
                    <input
                      id="panel-kerf"
                      type="number"
                      className="form-control"
                      value={panelSettings.kerf || ""}
                      onChange={(e) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          kerf: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label" htmlFor="panel-left-trim">Left Trim (mm)</label>
                    <input
                      id="panel-left-trim"
                      type="number"
                      className="form-control"
                      value={panelSettings.leftTrim || ""}
                      onChange={(e) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          leftTrim: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label" htmlFor="panel-right-trim">Right Trim (mm)</label>
                    <input
                      id="panel-right-trim"
                      type="number"
                      className="form-control"
                      value={panelSettings.rightTrim || ""}
                      onChange={(e) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          rightTrim: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label" htmlFor="panel-top-trim">Top Trim (mm)</label>
                    <input
                      id="panel-top-trim"
                      type="number"
                      className="form-control"
                      value={panelSettings.topTrim || ""}
                      onChange={(e) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          topTrim: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label" htmlFor="panel-bottom-trim">Bottom Trim (mm)</label>
                    <input
                      id="panel-bottom-trim"
                      type="number"
                      className="form-control"
                      value={panelSettings.bottomTrim || ""}
                      onChange={(e) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          bottomTrim: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Optimize Button */}
            <button
              className="btn btn-success btn-lg w-100"
              onClick={handlePanelOptimize}
              disabled={loading}
            >
              {loading ? "Optimizing..." : "Optimize Cut Plan"}
            </button>
          </div>

          {/* Panel Results */}
          <div className="col-md-6">
            {panelResult && (
              <PanelResults result={panelResult} />
            )}
          </div>
        </div>
      )}
    </LayoutContainer>
  );
}

/**
 * Linear Results Component
 */
function LinearResults({
  result,
}: {
  result: LinearOptimizationResponse;
}) {
  const { solution } = result;

  return (
    <div className="card">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">Optimization Results</h5>
      </div>
      <div className="card-body">
        <div className="alert alert-info">
          <strong>Total Stocks Required:</strong>{" "}
          {solution.totalRequiredStocks}
        </div>

        <h6>Required Stocks:</h6>
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Stock</th>
              <th>Length</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {solution.requiredStocks.map((stock, i) => (
              <tr key={i}>
                <td>#{stock.index + 1}</td>
                <td>{stock.length} mm</td>
                <td>{stock.count}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h6>Cut Layouts:</h6>
        {solution.layouts.map((layout, i) => (
          <div key={i} className="card mb-2">
            <div className="card-body">
              <p>
                <strong>Layout {i + 1}</strong> (x{layout.count})
              </p>
              <p>
                Stock: {layout.stock.length} mm
              </p>
              <p>
                Parts:{" "}
                {layout.parts
                  .map((p) => `${p.count}x ${p.length} mm`)
                  .join(", ")}
              </p>
              <p className="text-muted">
                Waste: {layout.waste.material} mm material
                {layout.waste.cut && `, ${layout.waste.cut} mm cuts`}
              </p>
              {/* Visual representation */}
              <LinearLayoutSVG layout={layout} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Linear Layout SVG Visualization
 */
function LinearLayoutSVG({
  layout,
}: {
  layout: LinearOptimizationResponse["solution"]["layouts"][0];
}) {
  const stockLength = parseFloat(layout.stock.length);
  const svgWidth = 500;
  const svgHeight = 40;
  const scale = svgWidth / stockLength;

  let currentX = 0;
  const parts = layout.parts.map((part, i) => {
    const partLength = parseFloat(part.length) * part.count;
    const x = currentX;
    currentX += partLength * scale;
    return { x, width: partLength * scale, label: `${part.length}mm`, index: i };
  });

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="border"
    >
      {/* Stock background */}
      <rect
        x={0}
        y={0}
        width={svgWidth}
        height={svgHeight}
        fill="#e9ecef"
        stroke="#adb5bd"
      />

      {/* Parts */}
      {parts.map((part, i) => (
        <g key={i}>
          <rect
            x={part.x}
            y={2}
            width={Math.max(part.width - 1, 1)}
            height={svgHeight - 4}
            fill={i % 2 === 0 ? "#0d6efd" : "#6c757d"}
            opacity={0.8}
          />
          {part.width > 30 && (
            <text
              x={part.x + part.width / 2}
              y={svgHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="10"
            >
              {part.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

/**
 * Panel Results Component
 */
function PanelResults({
  result,
}: {
  result: PanelOptimizationResponse;
}) {
  const { solution } = result;

  return (
    <div className="card">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">Optimization Results</h5>
      </div>
      <div className="card-body">
        <div className="alert alert-info">
          <strong>Total Sheets Required:</strong>{" "}
          {solution.totalRequiredStocks}
        </div>

        <h6>Required Sheets:</h6>
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Sheet</th>
              <th>Dimensions</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {solution.requiredStocks.map((stock, i) => (
              <tr key={i}>
                <td>#{stock.index + 1}</td>
                <td>
                  {stock.length} x {stock.width} mm
                </td>
                <td>{stock.count}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h6>Cut Layouts:</h6>
        {solution.layouts.map((layout, i) => (
          <div key={i} className="card mb-2">
            <div className="card-body">
              <p>
                <strong>Layout {i + 1}</strong> (x{layout.count})
              </p>
              <p>
                Sheet: {layout.stock.length} x {layout.stock.width} mm
              </p>
              <p>Panels: {layout.panels.length} panels</p>
              {layout.remainders && layout.remainders.length > 0 && (
                <p className="text-muted">
                  Remainders: {layout.remainders.length} pieces
                </p>
              )}
              {/* Visual representation */}
              <PanelLayoutSVG layout={layout} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Panel Layout SVG Visualization
 */
function PanelLayoutSVG({
  layout,
}: {
  layout: PanelOptimizationResponse["solution"]["layouts"][0];
}) {
  const stockLength = parseFloat(layout.stock.length);
  const stockWidth = parseFloat(layout.stock.width);
  const maxSize = 500;
  const scale = Math.min(maxSize / stockLength, maxSize / stockWidth);
  const svgWidth = stockLength * scale;
  const svgHeight = stockWidth * scale;

  const colors = [
    "#0d6efd",
    "#6c757d",
    "#198754",
    "#dc3545",
    "#ffc107",
    "#0dcaf0",
  ];

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="border"
    >
      {/* Stock background */}
      <rect
        x={0}
        y={0}
        width={svgWidth}
        height={svgHeight}
        fill="#e9ecef"
        stroke="#adb5bd"
      />

      {/* Panels */}
      {layout.panels.map((panel, i) => {
        const x = parseFloat(panel.x) * scale;
        const y = parseFloat(panel.y) * scale;
        const w = parseFloat(panel.length) * scale;
        const h = parseFloat(panel.width) * scale;
        const color = colors[panel.index % colors.length];

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={Math.max(w - 1, 1)}
              height={Math.max(h - 1, 1)}
              fill={color}
              opacity={0.8}
              stroke="white"
              strokeWidth={0.5}
            />
            {w > 40 && h > 20 && (
              <text
                x={x + w / 2}
                y={y + h / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="10"
              >
                {panel.length}x{panel.width}
              </text>
            )}
          </g>
        );
      })}

      {/* Remainders */}
      {layout.remainders?.map((remainder, i) => {
        const x = parseFloat(remainder.x) * scale;
        const y = parseFloat(remainder.y) * scale;
        const w = parseFloat(remainder.length) * scale;
        const h = parseFloat(remainder.width) * scale;

        return (
          <rect
            key={`remainder-${i}`}
            x={x}
            y={y}
            width={Math.max(w - 1, 1)}
            height={Math.max(h - 1, 1)}
            fill="#adb5bd"
            opacity={0.3}
            stroke="#6c757d"
            strokeWidth={0.5}
            strokeDasharray="4 2"
          />
        );
      })}
    </svg>
  );
}
