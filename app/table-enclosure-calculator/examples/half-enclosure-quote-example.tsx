/**
 * Half Enclosure Quote Example
 * Updated: 15/05/2025
 * Author: Deej Potter
 * Description: Example component showing how to use the half enclosure quote calculator
 * for customer requests. This shows a specific use case for quoting a 1200x1200 table
 * with a 200mm half enclosure and corflute panels.
 */

"use client";

import React, { useState } from "react";
import LayoutContainer from "@/components/LayoutContainer";
import { generateSpecificCustomerQuote } from "../quotes/half-enclosure-quote";
import Link from "next/link";

/**
 * Example component for generating a half enclosure quote
 */
export default function HalfEnclosureQuoteExample() {
	const [quoteResult, setQuoteResult] = useState<ReturnType<
		typeof generateSpecificCustomerQuote
	> | null>(null);
	const [loading, setLoading] = useState(false);

	const handleGenerateQuote = () => {
		setLoading(true);

		// Simulate a bit of loading time to show the spinner (optional)
		setTimeout(() => {
			const result = generateSpecificCustomerQuote();
			setQuoteResult(result);
			setLoading(false);
		}, 500);
	};

	const formatNumber = (num: number) => {
		return num.toLocaleString();
	};

	return (
		<LayoutContainer>
			<div className="container py-4">
				<h1 className="mb-4">Table and Half Enclosure Quote</h1>

				<div className="card mb-4">
					<div className="card-body">
						<h2 className="card-title">Customer Requirements</h2>
						<ul className="list-group list-group-flush mb-3">
							<li className="list-group-item">
								<strong>Working Area:</strong> 1200mm × 1200mm
							</li>
							<li className="list-group-item">
								<strong>Total Height:</strong> 950mm (including 200mm half
								enclosure)
							</li>
							<li className="list-group-item">
								<strong>Enclosure:</strong> 200mm height around perimeter
							</li>
							<li className="list-group-item">
								<strong>Panel Material:</strong> Corflute
							</li>
							<li className="list-group-item">
								<strong>Additional:</strong> M8 caster wheels
							</li>
						</ul>

						<button
							className="btn btn-primary"
							onClick={handleGenerateQuote}
							disabled={loading}
						>
							{loading ? (
								<>
									<span
										className="spinner-border spinner-border-sm me-2"
										role="status"
										aria-hidden="true"
									></span>
									Generating Quote...
								</>
							) : (
								"Generate Quote"
							)}
						</button>
					</div>
				</div>

				{quoteResult && (
					<div className="card">
						<div className="card-body">
							<h2 className="card-title mb-4">Quote Results</h2>

							<div className="row mb-4">
								<div className="col-md-6">
									<div className="card h-100">
										<div className="card-header bg-primary text-white">
											<h3 className="h5 mb-0">Table Materials</h3>
										</div>
										<div className="card-body">
											<h4 className="h6">Extrusions</h4>
											<ul className="list-group list-group-flush mb-3">
												<li className="list-group-item d-flex justify-content-between">
													<span>Length Rails (2060):</span>
													<span>
														{
															quoteResult.tableMaterials.extrusions
																.rail2060Length
														}
														mm × 4
													</span>
												</li>
												<li className="list-group-item d-flex justify-content-between">
													<span>Width Rails (2060):</span>
													<span>
														{
															quoteResult.tableMaterials.extrusions
																.rail2060Width
														}
														mm × 4
													</span>
												</li>
												<li className="list-group-item d-flex justify-content-between">
													<span>Leg Extrusions (4040):</span>
													<span>
														{quoteResult.tableMaterials.extrusions.rail4040Legs}
														mm × 4
													</span>
												</li>
											</ul>

											<h4 className="h6">Hardware</h4>
											<ul className="list-group list-group-flush">
												<li className="list-group-item d-flex justify-content-between">
													<span>Inside Corner Brackets (60mm):</span>
													<span>
														{quoteResult.tableMaterials.hardware.IOCNR_60}
													</span>
												</li>
												<li className="list-group-item d-flex justify-content-between">
													<span>Triple L Brackets:</span>
													<span>
														{
															quoteResult.tableMaterials.hardware
																.L_BRACKET_TRIPLE
														}
													</span>
												</li>
												<li className="list-group-item d-flex justify-content-between">
													<span>M8 Caster Wheels:</span>
													<span>4</span>
												</li>
											</ul>
										</div>
									</div>
								</div>

								<div className="col-md-6">
									<div className="card h-100">
										<div className="card-header bg-success text-white">
											<h3 className="h5 mb-0">Half Enclosure Materials</h3>
										</div>
										<div className="card-body">
											<h4 className="h6">Extrusions</h4>
											<ul className="list-group list-group-flush mb-3">
												<li className="list-group-item d-flex justify-content-between">
													<span>
														Horizontal Length Rails (
														{
															quoteResult.enclosureMaterials.extrusions
																.horizontal.length.type
														}
														):
													</span>
													<span>
														{
															quoteResult.enclosureMaterials.extrusions
																.horizontal.length.size
														}
														mm × 4
													</span>
												</li>
												<li className="list-group-item d-flex justify-content-between">
													<span>
														Horizontal Width Rails (
														{
															quoteResult.enclosureMaterials.extrusions
																.horizontal.width.type
														}
														):
													</span>
													<span>
														{
															quoteResult.enclosureMaterials.extrusions
																.horizontal.width.size
														}
														mm × 4
													</span>
												</li>
												<li className="list-group-item d-flex justify-content-between">
													<span>Vertical Rails (2020):</span>
													<span>
														{
															quoteResult.enclosureMaterials.extrusions
																.vertical2020.size
														}
														mm × 8
													</span>
												</li>
											</ul>

											<h4 className="h6">Panels (Corflute)</h4>
											<ul className="list-group list-group-flush">
												{quoteResult.panelMaterials.panels.map(
													(panel, index) => (
														<li
															key={index}
															className="list-group-item d-flex justify-content-between"
														>
															<span>{panel.position} Panel:</span>
															<span>
																{panel.width &&
																	panel.height &&
																	`${panel.width}mm × ${panel.height}mm`}
																{panel.width &&
																	panel.length &&
																	`${panel.width}mm × ${panel.length}mm`}
															</span>
														</li>
													)
												)}
											</ul>
										</div>
									</div>
								</div>
							</div>

							<div className="mt-4">
								<h4>Total Materials Summary</h4>
								<ul className="list-group list-group-flush mb-4">
									<li className="list-group-item d-flex justify-content-between">
										<span>Total 2060 Rail Length:</span>
										<span>
											{formatNumber(
												quoteResult.tableMaterials.totalLengths.rail2060
											)}
											mm
										</span>
									</li>
									<li className="list-group-item d-flex justify-content-between">
										<span>Total 4040 Rail Length:</span>
										<span>
											{formatNumber(
												quoteResult.tableMaterials.totalLengths.rail4040
											)}
											mm
										</span>
									</li>
									<li className="list-group-item d-flex justify-content-between">
										<span>Total 2020 Rail Length:</span>
										<span>
											{formatNumber(
												quoteResult.enclosureMaterials.totalLengths.rail2020 +
													quoteResult.enclosureMaterials.totalLengths
														.verticalRail2020
											)}
											mm
										</span>
									</li>
									<li className="list-group-item d-flex justify-content-between">
										<span>Total Corflute Panel Area:</span>
										<span>
											{formatNumber(quoteResult.panelMaterials.totalArea)}mm²
										</span>
									</li>
								</ul>

								<div className="d-grid gap-2 d-md-flex justify-content-md-center">
									<Link
										href={quoteResult.url}
										className="btn btn-primary"
										target="_blank"
									>
										Open in Table & Enclosure Calculator
									</Link>

									<button
										className="btn btn-outline-secondary"
										onClick={() => {
											navigator.clipboard.writeText(
												window.location.origin + quoteResult.url
											);
											alert("Link copied to clipboard!");
										}}
									>
										Copy Shareable Link
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</LayoutContainer>
	);
}
