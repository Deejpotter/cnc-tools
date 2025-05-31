"use client";
import React from "react";
import { CutList } from "@/types/20-series-extrusions/cutting-types";

interface CuttingListTableProps {
	cutList: CutList[];
	showStockLengths?: boolean;
}

const CuttingListTable: React.FC<CuttingListTableProps> = ({
	cutList,
	showStockLengths = true,
}) => {
	return (
		<div className="card mb-4">
			<div className="card-header">
				<h5 className="mb-0">Cutting List</h5>
			</div>
			<div className="card-body">
				<div className="table-responsive">
					<table className="table table-sm">
						<thead>
							<tr>
								{showStockLengths && <th>Stock Length</th>}
								<th>Required Cuts</th>
								<th>Used Length</th>
								<th>Waste %</th>
							</tr>
						</thead>
						<tbody>
							{cutList.map((cut, index) => (
								<tr key={index}>
									{showStockLengths && <td>{cut.stockLength}mm</td>}
									<td>
										{cut.cuts.map((c, i) => (
											<span key={i}>
												{c.quantity}×{c.length}mm
												{i < cut.cuts.length - 1 ? ", " : ""}
											</span>
										))}
									</td>
									<td>{cut.usedLength}mm</td>
									<td>{cut.wastePercentage?.toFixed(1)}%</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default CuttingListTable;
