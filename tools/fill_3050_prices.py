#!/usr/bin/env python3
"""Fill missing 3050mm prices in data/AllExtrusions.csv by scaling 1000mm prices.

This script reads `data/AllExtrusions.csv`, finds rows with SKUs ending in
"-3050" that have an empty or non-numeric price in column 6 (1-based), and
fills them using the corresponding "-1000" SKU price scaled by 3.05.

It overwrites the CSV in-place after making changes and prints a short summary.
"""
import csv
import re
from decimal import Decimal, ROUND_HALF_UP

INPATH = "data/AllExtrusions.csv"

def is_numeric(s: str) -> bool:
    try:
        float(s)
        return True
    except Exception:
        return False

def round2(v: float) -> str:
    # round to 2 decimals like typical currency
    d = Decimal(str(v)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return format(d, "f")

with open(INPATH, "r", newline="", encoding="utf-8") as f:
    reader = list(csv.reader(f))

# Build price lookup for 1000mm SKUs (column index 5, 0-based)
price_map = {}
for row in reader:
    if len(row) < 3:
        continue
    sku = row[2].strip()
    if sku.endswith("-1000"):
        price = row[5].strip() if len(row) > 5 else ""
        if is_numeric(price):
            price_map[sku] = float(price)

updated = 0
missing_source = []

for i, row in enumerate(reader):
    if len(row) < 3:
        continue
    sku = row[2].strip()
    if not sku.endswith("-3050"):
        continue

    price = row[5].strip() if len(row) > 5 else ""
    if is_numeric(price):
        continue  # already has price

    # find corresponding 1000 SKU
    sku1000 = sku.replace("-3050", "-1000")
    if sku1000 in price_map:
        base = price_map[sku1000]
        new_price = base * 3.05
        new_price_str = round2(new_price)
        # ensure row has at least 6 columns
        while len(row) <= 5:
            row.append("")
        row[5] = new_price_str
        reader[i] = row
        updated += 1
    else:
        missing_source.append(sku)

if updated > 0:
    with open(INPATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerows(reader)

print(f"Updated {updated} 3050mm price(s) by scaling from 1000mm entries.")
if missing_source:
    print("Could not find 1000mm source price for the following SKUs:")
    for s in missing_source:
        print(" -", s)
