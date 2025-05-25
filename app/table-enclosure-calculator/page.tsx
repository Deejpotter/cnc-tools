/**
 * Table and Enclosure Calculator Page
 * Updated: 17/05/25
 * Author: Deej Potter
 * Description: Main page component for the Table and Enclosure Calculator tool.
 * This is a client component that uses dynamic imports and Suspense
 * for better performance and code splitting.
 */
"use client";

import LayoutContainer from "@/components/LayoutContainer";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { MATERIAL_TYPES, MATERIAL_THICKNESS } from "./constants";

// Dynamically import client components
const TableCalculator = dynamic(() => import("./components/TableCalculator"), {
	loading: () => <div className="alert alert-info">Loading calculator...</div>,
	ssr: false,
});

export default function TableEnclosureCalculatorPage() {
	return (
		<LayoutContainer>
			<div className="table-enclosure-calculator">
				<h1 className="mb-4">Table and Enclosure Calculator</h1>

				{/* Client Component Calculator */}
				<Suspense
					fallback={
						<div className="alert alert-info">Loading calculator...</div>
					}
				>
					<TableCalculator
						materialTypes={MATERIAL_TYPES}
						materialThickness={MATERIAL_THICKNESS} // Changed from materialThicknesses
					/>
				</Suspense>
			</div>
		</LayoutContainer>
	);
}
