// --- CNC Tools React Table Type Config ---
// This file augments react-table types for use in CNC Tools frontend.
//
// Updated: 2025-05-28
// Maintainer: Deej Potter

import {
	UseColumnOrderInstanceProps,
	UseColumnOrderState,
	UseExpandedHooks,
	UseExpandedInstanceProps,
	UseExpandedOptions,
	UseExpandedRowProps,
	UseExpandedState,
	UseFiltersColumnOptions,
	UseFiltersColumnProps,
	UseFiltersInstanceProps,
	UseFiltersOptions,
	UseFiltersState,
	UseGlobalFiltersColumnOptions,
	UseGlobalFiltersInstanceProps,
	UseGlobalFiltersOptions,
	UseGlobalFiltersState,
	UseGroupByCellProps,
	UseGroupByColumnOptions,
	UseGroupByColumnProps,
	UseGroupByHooks,
	UseGroupByInstanceProps,
	UseGroupByOptions,
	UseGroupByRowProps,
	UseGroupByState,
	UsePaginationInstanceProps,
	UsePaginationOptions,
	UsePaginationState,
	UseResizeColumnsColumnOptions,
	UseResizeColumnsColumnProps,
	UseResizeColumnsOptions,
	UseResizeColumnsState,
	UseRowSelectHooks,
	UseRowSelectInstanceProps,
	UseRowSelectOptions,
	UseRowSelectRowProps,
	UseRowSelectState,
	UseRowStateCellProps,
	UseRowStateInstanceProps,
	UseRowStateOptions,
	UseRowStateRowProps,
	UseRowStateState,
	UseSortByColumnOptions,
	UseSortByColumnProps,
	UseSortByHooks,
	UseSortByInstanceProps,
	UseSortByOptions,
	UseSortByState,
	Column,
} from "react-table";

// This module augmentation allows us to use advanced react-table features with TypeScript.
declare module "react-table" {
	// take this file as-is, or comment out the sections that don't apply to your plugin configuration

	export interface TableOptions<D extends Record<string, unknown>>
		extends UseExpandedOptions<D>,
			UseFiltersOptions<D>,
			UseGlobalFiltersOptions<D>,
			UseGroupByOptions<D>,
			UsePaginationOptions<D>,
			UseResizeColumnsOptions<D>,
			UseRowSelectOptions<D>,
			UseRowStateOptions<D>,
			UseSortByOptions<D>,
			// note: using Record<string, unknown> for extensibility, but prefer stricter types if possible
			Record<string, unknown> {}

	export interface Hooks<
		D extends Record<string, unknown> = Record<string, unknown>
	> extends UseExpandedHooks<D>,
			UseGroupByHooks<D>,
			UseRowSelectHooks<D>,
			UseSortByHooks<D> {}

	export interface TableInstance<
		D extends Record<string, unknown> = Record<string, unknown>
	> extends UseColumnOrderInstanceProps<D>,
			UseExpandedInstanceProps<D>,
			UseFiltersInstanceProps<D>,
			UseGlobalFiltersInstanceProps<D>,
			UseGroupByInstanceProps<D>,
			UsePaginationInstanceProps<D>,
			UseRowSelectInstanceProps<D>,
			UseRowStateInstanceProps<D>,
			UseSortByInstanceProps<D> {}

	export interface TableState<
		D extends Record<string, unknown> = Record<string, unknown>
	> extends UseColumnOrderState<D>,
			UseExpandedState<D>,
			UseFiltersState<D>,
			UseGlobalFiltersState<D>,
			UseGroupByState<D>,
			UsePaginationState<D>,
			UseResizeColumnsState<D>,
			UseRowSelectState<D>,
			UseRowStateState<D>,
			UseSortByState<D> {}

	export interface ColumnInterface<
		D extends Record<string, unknown> = Record<string, unknown>
	> extends UseFiltersColumnOptions<D>,
			UseGlobalFiltersColumnOptions<D>,
			UseGroupByColumnOptions<D>,
			UseResizeColumnsColumnOptions<D>,
			UseSortByColumnOptions<D> {}

	export interface ColumnInstance<
		D extends Record<string, unknown> = Record<string, unknown>
	> extends UseFiltersColumnProps<D>,
			UseGroupByColumnProps<D>,
			UseResizeColumnsColumnProps<D>,
			UseSortByColumnProps<D> {}

	export interface Cell<
		D extends Record<string, unknown> = Record<string, unknown>,
		V = unknown
	> extends UseGroupByCellProps<D>,
			UseRowStateCellProps<D> {}

	export interface Row<
		D extends Record<string, unknown> = Record<string, unknown>
	> extends UseExpandedRowProps<D>,
			UseGroupByRowProps<D>,
			UseRowSelectRowProps<D>,
			UseRowStateRowProps<D> {}
}

export type ColumnData = Column[];

export type TableDatum = Column<{
	name: (string | boolean)[];
	date: string | Date;
	progress: number;
	quantity?: number;
	status?: string;
	artworks?: string;
	rating?: number;
}>;

export type TableData = TableDatum[];

export type TableProps = {
	columnsData: ColumnData;
	tableData: TableData;
};
