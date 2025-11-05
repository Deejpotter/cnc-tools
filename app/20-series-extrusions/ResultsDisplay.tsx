"use client";

import { ReactElement } from "react";
import { Card, Row, Col, Badge, ListGroup } from "react-bootstrap";
import { CalculationResult } from "@/types/cutCalculator";
import CutPatternVisualization from "./CutPatternVisualization";

type ResultsDisplayProps = {
  result: CalculationResult;
};

export default function ResultsDisplay({
  result,
}: ResultsDisplayProps): ReactElement {
  const formatNumber = (num: number, decimals = 1): string => {
    return num.toFixed(decimals);
  };

  // Calculate total stock length used
  const totalStockLength = result.patterns.reduce(
    (sum, p) => sum + p.stockLength,
    0
  );

  return (
    <div>
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-info text-white">
          <h5 className="mb-0">Results Summary</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3} sm={6} className="mb-3">
              <Card className="text-center border-primary">
                <Card.Body>
                  <h6 className="text-muted mb-2">Stock Pieces</h6>
                  <h2 className="text-primary mb-0">{result.totalStock}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="text-center border-success">
                <Card.Body>
                  <h6 className="text-muted mb-2">Utilization</h6>
                  <h2 className="text-success mb-0">
                    {formatNumber(result.averageUtilization)}%
                  </h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="text-center border-warning">
                <Card.Body>
                  <h6 className="text-muted mb-2">Total Waste</h6>
                  <h2 className="text-warning mb-0">
                    {result.totalWaste.toLocaleString()}mm
                  </h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="text-center border-secondary">
                <Card.Body>
                  <h6 className="text-muted mb-2">Calculation Time</h6>
                  <h2 className="text-secondary mb-0">
                    {formatNumber(result.executionTime, 2)}ms
                  </h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Cost Breakdown Card */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-success text-white">
          <h5 className="mb-0">Cost Breakdown</h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col>
              <h3 className="text-center text-success mb-0">
                ${result.totalCost.toFixed(2)}
              </h3>
              <p className="text-center text-muted small mb-0">Total Cost</p>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6} className="text-center mb-2 mb-md-0">
              <div className="border rounded p-2">
                <h5 className="text-primary mb-0">
                  ${result.totalSetupFees.toFixed(2)}
                </h5>
                <small className="text-muted">Setup Fees</small>
                <div className="small text-muted">
                  ({result.costByLength.length} unique length{result.costByLength.length !== 1 ? "s" : ""} × $3)
                </div>
              </div>
            </Col>
            <Col md={6} className="text-center">
              <div className="border rounded p-2">
                <h5 className="text-info mb-0">
                  ${result.totalCuttingCosts.toFixed(2)}
                </h5>
                <small className="text-muted">Cutting Costs</small>
                <div className="small text-muted">
                  ({result.costByLength.reduce((sum, c) => sum + c.totalCuts, 0)} cuts × $2)
                </div>
              </div>
            </Col>
          </Row>

          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Stock Length</th>
                  <th className="text-center">Pieces Used</th>
                  <th className="text-center">Total Cuts</th>
                  <th className="text-end">Setup Fee</th>
                  <th className="text-end">Cutting Cost</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {result.costByLength.map((cost) => (
                  <tr key={cost.stockLength}>
                    <td><strong>{cost.stockLength}mm</strong></td>
                    <td className="text-center">{cost.quantity}</td>
                    <td className="text-center">{cost.totalCuts}</td>
                    <td className="text-end">${cost.setupFee.toFixed(2)}</td>
                    <td className="text-end">${cost.cuttingCost.toFixed(2)}</td>
                    <td className="text-end"><strong>${cost.totalCost.toFixed(2)}</strong></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <td colSpan={3}><strong>Total</strong></td>
                  <td className="text-end"><strong>${result.totalSetupFees.toFixed(2)}</strong></td>
                  <td className="text-end"><strong>${result.totalCuttingCosts.toFixed(2)}</strong></td>
                  <td className="text-end"><strong>${result.totalCost.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Header className="bg-dark text-white">
          <h5 className="mb-0">
            Cutting Patterns ({result.patterns.length} pieces)
          </h5>
        </Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
            {result.patterns.map((pattern, index) => (
              <ListGroup.Item key={index} className="px-0">
                <Row className="align-items-center">
                  <Col lg={2} md={3} className="mb-2 mb-md-0">
                    <strong className="text-primary">
                      Stock #{pattern.stockIndex}
                    </strong>
                    <div className="small text-muted">
                      {pattern.stockLength}mm stock
                    </div>
                    <div className="small text-muted">
                      {pattern.cuts.length} cuts
                    </div>
                  </Col>
                  <Col lg={7} md={6} className="mb-2 mb-md-0">
                    <CutPatternVisualization pattern={pattern} />
                  </Col>
                  <Col lg={3} md={3}>
                    <div className="d-flex flex-wrap gap-2">
                      <Badge bg="success" className="d-flex align-items-center">
                        <i className="bi bi-speedometer2 me-1"></i>
                        {formatNumber(pattern.utilization)}%
                      </Badge>
                      <Badge
                        bg="warning"
                        text="dark"
                        className="d-flex align-items-center"
                      >
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        {pattern.waste}mm waste
                      </Badge>
                    </div>
                    <div className="small text-muted mt-2">
                      Cuts: {pattern.cuts.join("mm, ")}mm
                    </div>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
        <Card.Footer className="text-muted">
          <Row>
            <Col md={6}>
              <small>
                <strong>Material Efficiency:</strong> Using {result.totalStock}{" "}
                stock pieces with{" "}
                {formatNumber(result.averageUtilization)}% average utilization
              </small>
            </Col>
            <Col md={6} className="text-md-end">
              <small>
                <strong>Waste:</strong> {result.totalWaste.toLocaleString()}mm
                total (~
                {formatNumber((result.totalWaste / totalStockLength) * 100)}% of
                material)
              </small>
            </Col>
          </Row>
        </Card.Footer>
      </Card>
    </div>
  );
}

