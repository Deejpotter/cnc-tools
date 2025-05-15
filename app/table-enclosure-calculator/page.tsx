"use client";
/**
 * Table and Enclosure Calculator Page
 * Updated: 15/05/2025
 * Author: Deej Potter
 *
 * Main page component for the table enclosure calculator.
 */

import LayoutContainer from "@/components/LayoutContainer";
import React from "react";
import { QuickExamples } from "./components/QuickExamples";
// Explicit import path for the TableCalculator component
import TableCalculator from "@/app/table-enclosure-calculator/components/TableCalculator";

// Material types and their properties
const MATERIAL_TYPES = [
	{ id: "acrylic", name: "Acrylic", defaultThickness: 3 },
	{ id: "aluminum", name: "Aluminum", defaultThickness: 2 },
	{ id: "polycarbonate", name: "Polycarbonate", defaultThickness: 4 },
	{ id: "dibond", name: "Dibond", defaultThickness: 3 },
];

// Standard material thicknesses in mm
const MATERIAL_THICKNESSES = [2, 3, 4, 5, 6, 8, 10, 12];

export default function TableEnclosureCalculator() {
	return (
		<LayoutContainer>
			<div className="table-enclosure-calculator">
				<h1 className="mb-4">Table and Enclosure Calculator</h1>

				{/* Quick Access to Common Quote Configurations */}
				<QuickExamples />
				{/* Client Component Calculator */}
				<TableCalculator
					materialTypes={MATERIAL_TYPES}
					materialThicknesses={MATERIAL_THICKNESSES}
				/>
			</div>
		</LayoutContainer>
	);
}
