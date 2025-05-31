"use client";
import React, { useState, useMemo } from "react";

/**
 * Column definition for the Table component
 * @interface TableColumn
 * @property {string} key - Unique identifier for the column, matches data property
 * @property {string} header - Display text for the column header
 * @property {(value: any, rowData: any, rowIndex: number) => React.ReactNode} [render] - Custom render function
 * @property {string} [width] - CSS width value for the column
 * @property {boolean} [sortable=false] - Whether the column is sortable
 * @property {boolean} [filterable=false] - Whether the column can be filtered
 * @property {string} [align="left"] - Text alignment for the column
 * @property {boolean} [visible=true] - Whether the column is visible
 */
export interface TableColumn<T = any> {
	key: string;
	header: string;
	render?: (value: any, rowData: T, rowIndex: number) => React.ReactNode;
	width?: string;
	sortable?: boolean;
	filterable?: boolean;
	align?: "left" | "center" | "right";
	visible?: boolean;
}

/**
 * Props for the Table component
 * @interface TableProps
 * @property {any[]} data - Array of data objects to display in the table
 * @property {TableColumn[]} columns - Column definitions for the table
 * @property {string} [keyField="id"] - Field to use as unique key for rows
 * @property {boolean} [striped=true] - Whether to use striped rows
 * @property {boolean} [hover=true] - Whether to highlight rows on hover
 * @property {boolean} [bordered=false] - Whether to add borders to the table
 * @property {boolean} [responsive=true] - Whether the table should be responsive
 * @property {boolean} [compact=false] - Whether to use compact row spacing
 * @property {string} [className] - Additional CSS classes for the table
 * @property {string} [variant] - Table color variant
 * @property {boolean} [sortable=false] - Whether sorting is enabled
 * @property {boolean} [filterable=false] - Whether filtering is enabled
 * @property {boolean} [pagination=false] - Whether pagination is enabled
 * @property {number} [pageSize=10] - Number of rows per page when pagination is enabled
 * @property {boolean} [selectable=false] - Whether rows can be selected
 * @property {(selectedRows: any[]) => void} [onSelect] - Callback when rows are selected
 * @property {(rowData: any) => void} [onRowClick] - Callback when a row is clicked
 * @property {React.ReactNode} [emptyState] - Content to display when no data is available
 * @property {string} [loadingText] - Text to display when data is loading
 * @property {boolean} [loading=false] - Whether the table is in loading state
 */
export interface TableProps<T = any> {
	data: T[];
	columns: TableColumn<T>[];
	keyField?: string;
	striped?: boolean;
	hover?: boolean;
	bordered?: boolean;
	responsive?: boolean;
	compact?: boolean;
	className?: string;
	variant?:
		| "primary"
		| "secondary"
		| "success"
		| "danger"
		| "warning"
		| "info"
		| "light"
		| "dark";
	sortable?: boolean;
	filterable?: boolean;
	pagination?: boolean;
	pageSize?: number;
	selectable?: boolean;
	onSelect?: (selectedRows: T[]) => void;
	onRowClick?: (rowData: T) => void;
	emptyState?: React.ReactNode;
	loadingText?: string;
	loading?: boolean;
}

/**
 * Reusable Table component with sorting, filtering, and pagination
 *
 * @example
 * // Basic usage
 * <Table
 *   data={[
 *     { id: 1, name: "John Doe", age: 30 },
 *     { id: 2, name: "Jane Doe", age: 25 }
 *   ]}
 *   columns={[
 *     { key: "name", header: "Name" },
 *     { key: "age", header: "Age" }
 *   ]}
 * />
 *
 * @example
 * // Advanced usage with custom rendering and sorting
 * <Table
 *   data={users}
 *   columns={[
 *     { key: "name", header: "Name", sortable: true },
 *     { key: "age", header: "Age", sortable: true },
 *     {
 *       key: "actions",
 *       header: "Actions",
 *       align: "center",
 *       render: (_, user) => (
 *         <button onClick={() => handleEdit(user)}>Edit</button>
 *       )
 *     }
 *   ]}
 *   hover
 *   striped
 *   pagination
 *   pageSize={5}
 * />
 *
 * @param {TableProps} props - The component props
 * @returns {JSX.Element} The rendered Table component
 */
const Table = <T extends Record<string, any>>({
	data,
	columns,
	keyField = "id",
	striped = true,
	hover = true,
	bordered = false,
	responsive = true,
	compact = false,
	className = "",
	variant,
	sortable = false,
	filterable = false,
	pagination = false,
	pageSize = 10,
	selectable = false,
	onSelect,
	onRowClick,
	emptyState = <div className="text-center p-4">No data available</div>,
	loadingText = "Loading data...",
	loading = false,
}: TableProps<T>) => {
	// State for sorting
	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: "asc" | "desc";
	} | null>(null);

	// State for pagination
	const [currentPage, setCurrentPage] = useState(1);

	// State for filtering
	const [filters, setFilters] = useState<Record<string, string>>({});

	// State for row selection
	const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

	// Handle sort request
	const requestSort = (key: string) => {
		if (!sortable) return;

		let direction: "asc" | "desc" = "asc";

		if (
			sortConfig &&
			sortConfig.key === key &&
			sortConfig.direction === "asc"
		) {
			direction = "desc";
		}

		setSortConfig({ key, direction });
	};

	// Handle filter change
	const handleFilterChange = (key: string, value: string) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));

		// Reset to first page when filtering
		setCurrentPage(1);
	};

	// Handle row selection
	const handleRowSelect = (rowKey: string, selected: boolean) => {
		const newSelectedRows = { ...selectedRows, [rowKey]: selected };
		setSelectedRows(newSelectedRows);

		if (onSelect) {
			const selectedItems = data.filter(
				(item) => newSelectedRows[item[keyField]]
			);
			onSelect(selectedItems);
		}
	};

	// Handle select all rows
	const handleSelectAll = (selected: boolean) => {
		const newSelectedRows: Record<string, boolean> = {};

		data.forEach((item) => {
			newSelectedRows[item[keyField]] = selected;
		});

		setSelectedRows(newSelectedRows);

		if (onSelect) {
			onSelect(selected ? [...data] : []);
		}
	};

	// Calculate if all rows are selected
	const allSelected =
		data.length > 0 && data.every((item) => selectedRows[item[keyField]]);
	const someSelected =
		!allSelected && data.some((item) => selectedRows[item[keyField]]);

	// Process data with sorting and filtering
	const processedData = useMemo(() => {
		// Start with a copy of the data
		let result = [...data];

		// Apply filters
		if (filterable && Object.keys(filters).length > 0) {
			result = result.filter((item) => {
				return Object.entries(filters).every(([key, filterValue]) => {
					if (!filterValue) return true;

					const itemValue = String(item[key] || "").toLowerCase();
					return itemValue.includes(filterValue.toLowerCase());
				});
			});
		}

		// Apply sorting
		if (sortable && sortConfig) {
			result.sort((a, b) => {
				// Get values to compare
				let aValue = a[sortConfig.key];
				let bValue = b[sortConfig.key];

				// Handle strings case-insensitive
				if (typeof aValue === "string") aValue = aValue.toLowerCase();
				if (typeof bValue === "string") bValue = bValue.toLowerCase();

				// Compare values
				if (aValue < bValue) {
					return sortConfig.direction === "asc" ? -1 : 1;
				}
				if (aValue > bValue) {
					return sortConfig.direction === "asc" ? 1 : -1;
				}
				return 0;
			});
		}

		return result;
	}, [data, sortConfig, filters, filterable, sortable]);

	// Apply pagination
	const paginatedData = useMemo(() => {
		if (!pagination) return processedData;

		const startIndex = (currentPage - 1) * pageSize;
		return processedData.slice(startIndex, startIndex + pageSize);
	}, [processedData, pagination, currentPage, pageSize]);

	// Generate pagination controls
	const totalPages = Math.ceil(processedData.length / pageSize);

	const renderPagination = () => {
		if (!pagination || totalPages <= 1) return null;

		return (
			<nav aria-label="Table pagination">
				<ul className="pagination justify-content-center">
					{/* Previous button */}
					<li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
						<button
							className="page-link"
							onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}
						>
							Previous
						</button>
					</li>

					{/* Page numbers */}
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
						<li
							key={page}
							className={`page-item ${currentPage === page ? "active" : ""}`}
						>
							<button
								className="page-link"
								onClick={() => setCurrentPage(page)}
							>
								{page}
							</button>
						</li>
					))}

					{/* Next button */}
					<li
						className={`page-item ${
							currentPage === totalPages ? "disabled" : ""
						}`}
					>
						<button
							className="page-link"
							onClick={() =>
								setCurrentPage((prev) => Math.min(prev + 1, totalPages))
							}
							disabled={currentPage === totalPages}
						>
							Next
						</button>
					</li>
				</ul>
			</nav>
		);
	};

	// Build table classes
	const tableClasses = [
		"table",
		striped ? "table-striped" : "",
		hover ? "table-hover" : "",
		bordered ? "table-bordered" : "",
		compact ? "table-sm" : "",
		variant ? `table-${variant}` : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	// Visible columns only
	const visibleColumns = columns.filter((col) => col.visible !== false);

	// Render empty state
	if (!loading && (!data || data.length === 0)) {
		return <div className="table-responsive">{emptyState}</div>;
	}

	return (
		<div>
			{/* Filter inputs */}
			{filterable && (
				<div className="row mb-3">
					{visibleColumns
						.filter((col) => col.filterable)
						.map((column) => (
							<div className="col-md-3 mb-2" key={`filter-${column.key}`}>
								<input
									type="text"
									className="form-control form-control-sm"
									placeholder={`Filter ${column.header}`}
									value={filters[column.key] || ""}
									onChange={(e) =>
										handleFilterChange(column.key, e.target.value)
									}
								/>
							</div>
						))}
				</div>
			)}

			{/* Table with optional responsive wrapper */}
			<div className={responsive ? "table-responsive" : ""}>
				<table className={tableClasses}>
					<thead>
						<tr>
							{/* Select all checkbox */}
							{selectable && (
								<th style={{ width: "1%" }}>
									<div className="form-check">
										<input
											type="checkbox"
											className="form-check-input"
											checked={allSelected}
											ref={(input) => {
												// Handle indeterminate state
												if (input) {
													input.indeterminate = !allSelected && someSelected;
												}
											}}
											onChange={(e) => handleSelectAll(e.target.checked)}
										/>
									</div>
								</th>
							)}

							{/* Column headers */}
							{visibleColumns.map((column) => (
								<th
									key={column.key}
									style={{
										width: column.width,
										cursor: sortable && column.sortable ? "pointer" : "default",
										textAlign: column.align || "left",
									}}
									onClick={() => column.sortable && requestSort(column.key)}
								>
									<div className="d-flex align-items-center">
										<span>{column.header}</span>

										{/* Sort indicator */}
										{sortable &&
											column.sortable &&
											sortConfig?.key === column.key && (
												<span className="ms-1">
													{sortConfig.direction === "asc" ? "▲" : "▼"}
												</span>
											)}
									</div>
								</th>
							))}
						</tr>
					</thead>

					<tbody>
						{loading ? (
							<tr>
								<td
									colSpan={visibleColumns.length + (selectable ? 1 : 0)}
									className="text-center p-4"
								>
									{loadingText}
								</td>
							</tr>
						) : (
							paginatedData.map((row, rowIndex) => {
								const rowKey = String(row[keyField]);
								const isSelected = !!selectedRows[rowKey];

								return (
									<tr
										key={rowKey}
										onClick={() => onRowClick && onRowClick(row)}
										style={{
											cursor: onRowClick ? "pointer" : "default",
											backgroundColor: isSelected
												? "rgba(0, 123, 255, 0.1)"
												: undefined,
										}}
									>
										{/* Row select checkbox */}
										{selectable && (
											<td onClick={(e) => e.stopPropagation()}>
												<div className="form-check">
													<input
														type="checkbox"
														className="form-check-input"
														checked={isSelected}
														onChange={(e) =>
															handleRowSelect(rowKey, e.target.checked)
														}
													/>
												</div>
											</td>
										)}

										{/* Data cells */}
										{visibleColumns.map((column) => {
											const cellValue = row[column.key];

											return (
												<td
													key={`${rowKey}-${column.key}`}
													style={{ textAlign: column.align || "left" }}
												>
													{column.render
														? column.render(cellValue, row, rowIndex)
														: cellValue !== undefined
														? String(cellValue)
														: ""}
												</td>
											);
										})}
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination controls */}
			{renderPagination()}
		</div>
	);
};

export default Table;
