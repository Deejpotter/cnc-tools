"use client";
import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-light py-4 mt-5 border-top">
			<div className="container">
				<div className="row">
					{/* Copyright and site info */}
					<div className="col-md-6 mb-3 mb-md-0">
						<h5>CNC Tools</h5>
						<p className="text-muted mb-2">
							A collection of mini-applications for CNC machining, 3D printing,
							and related tasks.
						</p>
						<p className="text-muted small">
							&copy; {currentYear} CNC Tools. All rights reserved.
						</p>
					</div>

					{/* Links */}
					<div className="col-md-3 mb-3 mb-md-0">
						<h6>Tools</h6>
						<ul className="list-unstyled">
							<li>
								<Link href="/cnc-calibration-tool">
									<span className="text-decoration-none">
										CNC Calibration Tool
									</span>
								</Link>
							</li>
							<li>
								<Link href="/box-shipping-calculator">
									<span className="text-decoration-none">
										Box Shipping Calculator
									</span>
								</Link>
							</li>
							<li>
								<Link href="/cnc-technical-ai">
									<span className="text-decoration-none">CNC Technical AI</span>
								</Link>
							</li>{" "}
							<li>
								<Link href="/enclosure-calculator">
									<span className="text-decoration-none">
										Enclosure Calculator
									</span>
								</Link>
							</li>
							<li>
								<Link href="/table-enclosure-calculator">
									<span className="text-decoration-none">
										Table & Enclosure Calculator
									</span>
								</Link>
							</li>
						</ul>
					</div>

					{/* More links/resources */}
					<div className="col-md-3">
						<h6>Resources</h6>
						<ul className="list-unstyled">
							<li>
								<Link href="/">
									<span className="text-decoration-none">Home</span>
								</Link>
							</li>
							<li>
								<Link href="/docs">
									<span className="text-decoration-none">Documentation</span>
								</Link>
							</li>
							<li>
								<a
									href="https://github.com/deejpotter/cnc-tools"
									target="_blank"
									rel="noreferrer"
									className="text-decoration-none"
								>
									GitHub
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
