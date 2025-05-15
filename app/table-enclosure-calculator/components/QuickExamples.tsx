import Link from "next/link";

/**
 * Server component for quick examples section
 */
export function QuickExamples() {
	return (
		<div className="card mb-4">
			<div className="card-header bg-info text-white">
				<h2 className="h5 mb-0">Quick Examples</h2>
			</div>
			<div className="card-body">
				<div className="row">
					<div className="col-md-12">
						<p>Need a quick quote for one of these common configurations?</p>
						<div className="d-grid gap-2 d-md-flex">
							<Link
								href="/table-enclosure-calculator/examples/half-enclosure-quote-example"
								className="btn btn-outline-primary"
							>
								1200×1200 Table with 200mm Half Enclosure
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
