"use client";

import { ReactElement, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { calculateOptimalCuts } from "@/lib/cutOptimizer";
import {
  CutRequirement,
  CalculationResult,
  AlgorithmType,
  ValidationError,
} from "@/types/cutCalculator";
import CutRequirementsTable from "./CutRequirementsTable";
import ResultsDisplay from "./ResultsDisplay";
import styles from "./CutCalculator.module.scss";

export default function CutCalculatorPage(): ReactElement {
  const [stockLength, setStockLength] = useState<string>("6000");
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("FFD");
  const [requirements, setRequirements] = useState<CutRequirement[]>([
    { id: "1", length: 450, quantity: 4 },
  ]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string>("");

  const handleCalculate = (): void => {
    setError("");
    setResult(null);

    const stockLengthNum = parseFloat(stockLength);
    if (isNaN(stockLengthNum) || stockLengthNum <= 0) {
      setError("Please enter a valid stock length greater than 0.");
      return;
    }

    try {
      const calculationResult = calculateOptimalCuts({
        stockLength: stockLengthNum,
        requirements,
        algorithm,
      });
      setResult(calculationResult);
    } catch (err) {
      if (Array.isArray(err)) {
        // ValidationError[]
        const errors = err as ValidationError[];
        setError(errors.map((e) => `${e.field}: ${e.message}`).join(", "));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during calculation.");
      }
    }
  };

  const handleReset = (): void => {
    setStockLength("6000");
    setAlgorithm("FFD");
    setRequirements([{ id: "1", length: 450, quantity: 4 }]);
    setResult(null);
    setError("");
  };

  return (
    <Container className={`${styles.cutCalculator} py-5`}>
      <Row className="mb-4">
        <Col>
          <h1 className="text-center mb-3">20 Series Cut Calculator</h1>
          <p className="text-center text-muted">
            Optimize aluminum extrusion cuts using advanced bin packing
            algorithms. Minimize waste and maximize material utilization.
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Configuration</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      Stock Length (mm)
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={stockLength}
                      onChange={(e) => setStockLength(e.target.value)}
                      placeholder="Enter stock length"
                      min="1"
                      step="1"
                      aria-label="Stock length in millimeters"
                    />
                    <Form.Text className="text-muted">
                      Standard 20 series length: 6000mm
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      Algorithm
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={algorithm}
                      onChange={(e) =>
                        setAlgorithm(e.target.value as AlgorithmType)
                      }
                      aria-label="Select packing algorithm"
                    >
                      <option value="FFD">First Fit Decreasing (Faster)</option>
                      <option value="BFD">
                        Best Fit Decreasing (More Efficient)
                      </option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      FFD is faster, BFD may produce tighter packing
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <CutRequirementsTable
            requirements={requirements}
            onRequirementsChange={setRequirements}
          />
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              <Alert.Heading>Validation Error</Alert.Heading>
              <p className="mb-0">{error}</p>
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col className="d-flex justify-content-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCalculate}
            disabled={requirements.length === 0}
            aria-label="Calculate optimal cuts"
          >
            Calculate Cuts
          </Button>
          <Button
            variant="outline-secondary"
            size="lg"
            onClick={handleReset}
            aria-label="Reset calculator"
          >
            Reset
          </Button>
        </Col>
      </Row>

      {result && (
        <Row>
          <Col>
            <ResultsDisplay
              result={result}
              stockLength={parseFloat(stockLength)}
            />
          </Col>
        </Row>
      )}
    </Container>
  );
}
