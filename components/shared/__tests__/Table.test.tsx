import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Table from "../display/Table";

describe("Table Component", () => {
	const columns = [
		{ header: "Name", accessor: "name" },
		{ header: "Age", accessor: "age" },
		{ header: "Email", accessor: "email" },
	];

	const data = [
		{ name: "John Doe", age: 30, email: "john@example.com" },
		{ name: "Jane Smith", age: 25, email: "jane@example.com" },
	];

	test("renders table with columns and data", () => {
		render(<Table columns={columns} data={data} />);

		// Check column headers
		expect(screen.getByText("Name")).toBeInTheDocument();
		expect(screen.getByText("Age")).toBeInTheDocument();
		expect(screen.getByText("Email")).toBeInTheDocument();

		// Check data cells
		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("30")).toBeInTheDocument();
		expect(screen.getByText("john@example.com")).toBeInTheDocument();
		expect(screen.getByText("Jane Smith")).toBeInTheDocument();
		expect(screen.getByText("25")).toBeInTheDocument();
		expect(screen.getByText("jane@example.com")).toBeInTheDocument();
	});

	test("renders empty state message when no data", () => {
		render(
			<Table columns={columns} data={[]} emptyMessage="No data available" />
		);

		expect(screen.getByText("No data available")).toBeInTheDocument();
	});

	test("renders caption when provided", () => {
		render(
			<Table columns={columns} data={data} caption="Test Table Caption" />
		);

		expect(screen.getByText("Test Table Caption")).toBeInTheDocument();
	});

	test("applies custom className", () => {
		const { container } = render(
			<Table columns={columns} data={data} className="custom-table" />
		);

		const table = container.querySelector("table");
		expect(table).toHaveClass("custom-table");
	});

	test("applies striped style when striped is true", () => {
		const { container } = render(
			<Table columns={columns} data={data} striped />
		);

		const table = container.querySelector("table");
		expect(table).toHaveClass("table-striped");
	});

	test("applies hover style when hover is true", () => {
		const { container } = render(<Table columns={columns} data={data} hover />);

		const table = container.querySelector("table");
		expect(table).toHaveClass("table-hover");
	});

	test("applies bordered style when bordered is true", () => {
		const { container } = render(
			<Table columns={columns} data={data} bordered />
		);

		const table = container.querySelector("table");
		expect(table).toHaveClass("table-bordered");
	});
});
