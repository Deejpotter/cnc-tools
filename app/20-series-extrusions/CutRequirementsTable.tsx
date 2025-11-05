"use client";

import { ReactElement } from "react";
import { Table, Button, Form, Card } from "react-bootstrap";
import { CutRequirement } from "@/types/20-series-cut-calculator/cutCalculator";

type CutRequirementsTableProps = {
	requirements: CutRequirement[];
	onRequirementsChange: (requirements: CutRequirement[]) => void;
};

export default function CutRequirementsTable({
	requirements,
	onRequirementsChange,
}: CutRequirementsTableProps): ReactElement {
	const handleAddRequirement = (): void => {
		const newId = String(
			Math.max(0, ...requirements.map((r) => parseInt(r.id) || 0)) + 1
		);
		onRequirementsChange([
			...requirements,
			{ id: newId, length: 0, quantity: 1 },
		]);
	};

	const handleRemoveRequirement = (id: string): void => {
		onRequirementsChange(requirements.filter((r) => r.id !== id));
	};

	const handleUpdateRequirement = (
		id: string,
		field: "length" | "quantity",
		value: string
	): void => {
		const numValue = parseFloat(value);
		onRequirementsChange(
			requirements.map((r) =>
				r.id === id ? { ...r, [field]: isNaN(numValue) ? 0 : numValue } : r
			)
		);
	};

	return (
		<Card className="shadow-sm">
			<Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
				<h5 className="mb-0">Cut Requirements</h5>
				<Button
					variant="light"
					size="sm"
					onClick={handleAddRequirement}
					aria-label="Add new cut requirement"
				>
					<i className="bi bi-plus-lg me-1"></i>
					Add Row
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
								Quantity <span className="text-danger">*</span>
							</th>
							<th style={{ width: "15%" }} className="text-center">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{requirements.length === 0 ? (
							<tr>
								<td colSpan={4} className="text-center text-muted py-4">
									No requirements added. Click &quot;Add Row&quot; to start.
								</td>
							</tr>
						) : (
							requirements.map((req) => (
								<tr key={req.id}>
									<td className="align-middle">
										<strong>#{req.id}</strong>
									</td>
									<td>
										<Form.Control
											type="number"
											value={req.length || ""}
											onChange={(e) =>
												handleUpdateRequirement(
													req.id,
													"length",
													e.target.value
												)
											}
											placeholder="Cut length"
											min="1"
											step="1"
											aria-label={`Length for requirement ${req.id}`}
										/>
									</td>
									<td>
										<Form.Control
											type="number"
											value={req.quantity || ""}
											onChange={(e) =>
												handleUpdateRequirement(
													req.id,
													"quantity",
													e.target.value
												)
											}
											placeholder="Quantity"
											min="1"
											step="1"
											aria-label={`Quantity for requirement ${req.id}`}
										/>
									</td>
									<td className="text-center align-middle">
										<Button
											variant="outline-danger"
											size="sm"
											onClick={() => handleRemoveRequirement(req.id)}
											disabled={requirements.length === 1}
											aria-label={`Remove requirement ${req.id}`}
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
					Total cuts: {requirements.reduce((sum, r) => sum + r.quantity, 0)} |
					Total length needed:{" "}
					{requirements
						.reduce((sum, r) => sum + r.length * r.quantity, 0)
						.toLocaleString()}
					mm
				</small>
			</Card.Footer>
		</Card>
	);
}
