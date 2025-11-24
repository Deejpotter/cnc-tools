#!/usr/bin/env python3
"""Update AllExtrusions.xlsx from cleaned AllExtrusions.csv.
Fill missing 3050 price/cost values by scaling the per-mm price/cost from the 1000mm row when available.
Usage: python3 tools/update_xlsx_from_csv.py
"""
from pathlib import Path
import csv

try:
    from openpyxl import Workbook
except Exception:
    raise

ROOT = Path(__file__).resolve().parents[1]
CSV_FILE = ROOT / 'data' / 'AllExtrusions.csv'
XLSX_FILE = ROOT / 'data' / 'AllExtrusions.xlsx'

ALLOWED = {'500','1000','1500','3050'}


def read_csv_rows():
    rows = []
    with CSV_FILE.open('r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for r in reader:
            if not r:
                continue
            rows.append([c for c in r])
    return rows


def sku_base(sku: str) -> str:
    # drop trailing length token
    parts = sku.split('-')
    if len(parts) <= 1:
        return sku
    return '-'.join(parts[:-1])


def length_token(sku: str) -> str:
    return sku.split('-')[-1]


def to_float(s: str):
    try:
        return float(s)
    except Exception:
        return None


def main():
    rows = read_csv_rows()

    # build per-base per-mm price from 1000 rows (or fallback 1500)
    price_per_mm = {}
    cost_per_mm = {}
    first_row_for_base = {}

    for r in rows:
        if len(r) < 3:
            continue
        sku = r[2].strip()
        base = sku_base(sku)
        first_row_for_base.setdefault(base, r)
        token = length_token(sku)
        if token == '1000':
            price = to_float(r[5]) if len(r) > 5 else None
            cost = to_float(r[6]) if len(r) > 6 else None
            if price is not None:
                price_per_mm[base] = price / 1000.0
            if cost is not None:
                cost_per_mm[base] = cost / 1000.0

    # fallback: if no 1000 but 1500 exists use that
    for r in rows:
        if len(r) < 3:
            continue
        sku = r[2].strip()
        base = sku_base(sku)
        token = length_token(sku)
        if base in price_per_mm:
            continue
        if token == '1500':
            price = to_float(r[5]) if len(r) > 5 else None
            cost = to_float(r[6]) if len(r) > 6 else None
            if price is not None:
                price_per_mm[base] = price / 1500.0
            if cost is not None:
                cost_per_mm[base] = cost / 1500.0

    # Fill missing 3050 price/cost using per-mm rates
    updated_rows = []
    for r in rows:
        # ensure length at least 7 columns
        while len(r) < 7:
            r.append('')
        sku = r[2].strip() if len(r) > 2 else ''
        token = length_token(sku) if sku else ''
        base = sku_base(sku) if sku else ''
        if token == '3050':
            price = to_float(r[5])
            cost = to_float(r[6])
            # fill if missing
            ppm = price_per_mm.get(base)
            cpm = cost_per_mm.get(base)
            if price is None and ppm is not None:
                r[5] = f"{round(ppm * 3050, 2):.2f}"
            if cost is None and cpm is not None:
                r[6] = f"{round(cpm * 3050, 2):.2f}"
        updated_rows.append(r)

    # write to xlsx
    wb = Workbook()
    ws = wb.active
    ws.title = 'AllExtrusions'

    for row in updated_rows:
        ws.append(row)

    wb.save(XLSX_FILE)
    print(f'Wrote updated XLSX to {XLSX_FILE} ({len(updated_rows)} rows)')


if __name__ == '__main__':
    main()
