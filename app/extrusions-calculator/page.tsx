"use client";

import React, { useState } from "react";
import calculateStockUsage, { CutRequirement } from "./cutOptimizer";
import ResultsDisplay from '../20-series-extrusions/ResultsDisplay';
import StockItemsTable from '../20-series-extrusions/StockItemsTable';
import type {
  CalculationResult,
  CutPattern,
  StockItem,
} from '@/types/20-series-cut-calculator/cutCalculator';

export default function Page() {
	const [kerf, setKerf] = useState<number>(3);
	const [requirementsText, setRequirementsText] =
		useState<string>("1000:2,500:1");
	const [result, setResult] = useState<any | null>(null);

	const standardLengths = [500, 1000, 1500, 3050];

	// minimal stock items state for StockItemsTable integration
	const [stockItems, setStockItems] = useState<StockItem[]>([
		{ id: '1', length: 3050, quantity: 10 },
	]);

	function parseRequirements(text: string): CutRequirement[] {
		// simple format: `length:qty,length:qty`
		const parts = text
			.split(",")
			.map((p) => p.trim())
			.filter(Boolean);
		const reqs: CutRequirement[] = [];
		for (const part of parts) {
			const [l, q] = part.split(":").map((s) => s.trim());
			const length = Number(l);
			const quantity = Number(q || 1);
			if (Number.isFinite(length) && Number.isInteger(quantity) && quantity > 0)
				reqs.push({ length, quantity });
		}
		return reqs;
	}

	function onCalculate() {
		try {
			const reqs = parseRequirements(requirementsText);
			const res = calculateStockUsage(reqs, standardLengths, kerf, {
				setupFeePerLength: 3,
				perCutFee: 2,
				availableStock: stockItems.map((s) => ({ stockLength: s.length, quantity: s.quantity })),
			});

			// adapt InvoiceResult -> CalculationResult for ResultsDisplay
			const patterns = res.patterns.map((p: any, idx: number) => {
				const sumCuts = p.cuts.reduce((s: number, c: number) => s + c, 0);
				const kerfTotal = p.cuts.length > 1 ? (p.cuts.length - 1) * kerf : 0;
				const used = sumCuts + kerfTotal;
				const waste = Math.max(0, p.stockLength - used);
				const utilization = p.stockLength > 0 ? (used / p.stockLength) * 100 : 0;

				const pattern: CutPattern = {
					stockIndex: idx + 1,
					stockLength: p.stockLength,
					cuts: p.cuts,
					waste,
					utilization,
				};
				return pattern;
			});

			const totalWaste = patterns.reduce((s, p) => s + p.waste, 0);
			const averageUtilization =
				patterns.length > 0
					? patterns.reduce((s, p) => s + p.utilization, 0) / patterns.length
					: 0;

			const calcResult: CalculationResult = {
				patterns,
				totalStock: res.totalStockPieces,
				totalWaste,
				averageUtilization,
				executionTime: 0,
				costByLength: (res.costByLength || []).map((c: any) => ({
					stockLength: c.stockLength,
					quantity: c.quantity,
					setupFee: c.setupFee,
					totalCuts: c.totalCuts,
					cuttingCost: c.cuttingCost,
					totalCost: c.totalCost,
				})),
				totalSetupFees: res.totalSetupFees || 0,
				totalCuttingCosts: res.totalCuttingCosts || 0,
				totalCost: res.totalCost || 0,
			};

			setResult({ raw: res, adapted: calcResult });
		} catch (err: any) {
			setResult({ error: String(err) });
		}
	}

	return (
		<div style={{ padding: 20 }}>
			<h1>Extrusions Calculator (Merged)</h1>

			<label>
				Kerf (mm):{" "}
				<input
					type="number"
					value={kerf}
					onChange={(e) => setKerf(Number(e.target.value))}
				/>
			</label>

			<div style={{ marginTop: 12 }}>
				<label>Requirements (format: length:qty, ...)</label>
				<br />
				<input
					style={{ width: "60%" }}
					value={requirementsText}
					onChange={(e) => setRequirementsText(e.target.value)}
				/>
				<button style={{ marginLeft: 8 }} onClick={onCalculate}>
					Calculate
				</button>
			</div>

			{result && (
				<div style={{ marginTop: 20 }}>
					{result.error ? (
						<div style={{ color: "red" }}>Error: {result.error}</div>
					) : (
						<>
							<h2>Summary</h2>
							<div>Total Cuts: {result.totalCuts}</div>
							<div>Total Stock Pieces: {result.totalStockPieces}</div>

							<h3>Stock Usage</h3>
							<table style={{ borderCollapse: "collapse" }}>
								<thead>
									<tr>
										<th style={{ padding: 6 }}>Stock Length</th>
										<th style={{ padding: 6 }}>Quantity</th>
									</tr>
								</thead>
								<tbody>
									{result.stockUsage.map((s: any) => (
										<tr key={s.stockLength}>
											<td style={{ padding: 6 }}>{s.stockLength}mm</td>
											<td style={{ padding: 6 }}>{s.quantity}</td>
										</tr>
									))}
								</tbody>
							</table>

							<div style={{ marginTop: 18 }}>
								<StockItemsTable stockItems={stockItems} onStockItemsChange={setStockItems} maxStockLength={3050} />
							</div>

							{result.adapted && (
								<div style={{ marginTop: 18 }}>
									<ResultsDisplay result={result.adapted} />
								</div>
							)}

							{result.costByLength && (
								<>
									<h3>Cost Breakdown</h3>
									<table>
										<thead>
											<tr>
												<th style={{ padding: 6 }}>Stock</th>
												<th style={{ padding: 6 }}>Qty</th>
												<th style={{ padding: 6 }}>Setup</th>
												<th style={{ padding: 6 }}>Cuts</th>
												<th style={{ padding: 6 }}>Cut Cost</th>
												<th style={{ padding: 6 }}>Total</th>
											</tr>
										</thead>
										<tbody>
											{result.costByLength.map((c: any) => (
												<tr key={c.stockLength}>
													<td style={{ padding: 6 }}>{c.stockLength}mm</td>
													<td style={{ padding: 6 }}>{c.quantity}</td>
													<td style={{ padding: 6 }}>${c.setupFee}</td>
													<td style={{ padding: 6 }}>{c.totalCuts}</td>
													<td style={{ padding: 6 }}>${c.cuttingCost}</td>
													<td style={{ padding: 6 }}>${c.totalCost}</td>
												</tr>
											))}
										</tbody>
									</table>
									<div style={{ marginTop: 8 }}>
										<strong>Totals:</strong> Setup ${result.totalSetupFees} ·
										Cut ${result.totalCuttingCosts} · Grand ${result.totalCost}
									</div>
								</>
							)}

							<h3>Warehouse Instructions</h3>
							<div>
								<p>
									Provide the following cuts so the warehouse can consolidate
									and use offcuts where possible:
								</p>
								{result.aggregatedCuts ? (
									<ul>
										{result.aggregatedCuts.map((c: any) => (
											<li key={c.length}>
												<strong>{c.length}mm</strong> × {c.quantity}
											</li>
										))}
									</ul>
								) : (
									<ol>
										{result.patterns.map((p: any, i: number) => (
											<li key={i}>
												{p.stockLength}mm x1: {p.cuts.join("mm, ")}mm
											</li>
										))}
									</ol>
								)}
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}
