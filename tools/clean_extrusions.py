#!/usr/bin/env python3
"""Clean extrusion data in data/ by keeping only lengths 500,1000,1500,3050,
removing TAP1/TAP2 rows, and ensuring each profile has a 3050 row (add blank if missing).

Usage: python3 tools/clean_extrusions.py
"""
import csv
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[1] / 'data'
CSV_FILE = DATA_DIR / 'AllExtrusions.csv'
TXT_FILE = DATA_DIR / 'AllExtrusions.txt'
ALLOWED = {'500', '1000', '1500', '3050'}


def parse_line_csv(line):
    # naive split, original file appears to be simple CSV without embedded commas
    parts = [p if p != '' else '' for p in line.strip().split(',')]
    return parts


def make_key_from_sku(sku):
    # remove trailing numeric length token (and any trailing TAP parts handled earlier)
    parts = sku.split('-')
    if parts and parts[-1].isdigit():
        return '-'.join(parts[:-1])
    # handle cases like ...-3000 etc
    return '-'.join(parts[:-1])


def clean_csv():
    text = CSV_FILE.read_text(encoding='utf-8')
    lines = [l for l in text.splitlines() if l.strip()]

    kept = []
    base_has_3050 = {}
    base_first_row = {}

    for line in lines:
        parts = parse_line_csv(line)
        if len(parts) < 3:
            continue
        sku = parts[2].strip()
        # normalize
        if 'TAP1' in sku or 'TAP2' in sku:
            continue
        # last token
        last = sku.split('-')[-1]
        if last not in ALLOWED:
            continue
        base = make_key_from_sku(sku)
        if base not in base_first_row:
            base_first_row[base] = parts
        if last == '3050':
            base_has_3050[base] = True
        kept.append(parts)

    # add missing 3050 rows
    for base, first_parts in base_first_row.items():
        if not base_has_3050.get(base, False):
            # create new row copying id and description, and SKU = base + -3050
            new_parts = first_parts.copy()
            # ensure at least 7 fields
            while len(new_parts) < 7:
                new_parts.append('')
            new_parts[2] = base + '-3050'
            # blank numeric fields
            if len(new_parts) >= 7:
                new_parts[3] = ''
                new_parts[4] = ''
                new_parts[5] = ''
                new_parts[6] = ''
            kept.append(new_parts)

    # sort kept by description then SKU
    kept.sort(key=lambda p: (p[1], p[2]))

    # write back CSV
    out_lines = [','.join(p) for p in kept]
    CSV_FILE.write_text('\n'.join(out_lines) + '\n', encoding='utf-8')
    print(f'Wrote cleaned CSV to {CSV_FILE} ({len(out_lines)} rows)')


def clean_txt():
    # TSV version - similar processing
    text = TXT_FILE.read_text(encoding='utf-8')
    lines = [l for l in text.splitlines() if l.strip()]

    kept = []
    base_has_3050 = {}
    base_first_row = {}

    for line in lines:
        parts = [p for p in line.split('\t')]
        if len(parts) < 3:
            continue
        sku = parts[2].strip()
        if 'TAP1' in sku or 'TAP2' in sku:
            continue
        last = sku.split('-')[-1]
        if last not in ALLOWED:
            continue
        base = make_key_from_sku(sku)
        if base not in base_first_row:
            base_first_row[base] = parts
        if last == '3050':
            base_has_3050[base] = True
        kept.append(parts)

    for base, first_parts in base_first_row.items():
        if not base_has_3050.get(base, False):
            new_parts = first_parts.copy()
            while len(new_parts) < 7:
                new_parts.append('')
            new_parts[2] = base + '-3050'
            new_parts[3] = ''
            new_parts[4] = ''
            new_parts[5] = ''
            new_parts[6] = ''
            kept.append(new_parts)

    kept.sort(key=lambda p: (p[1], p[2]))
    out_lines = ['\t'.join(p) for p in kept]
    TXT_FILE.write_text('\n'.join(out_lines) + '\n', encoding='utf-8')
    print(f'Wrote cleaned TXT to {TXT_FILE} ({len(out_lines)} rows)')


if __name__ == '__main__':
    clean_csv()
    clean_txt()
    print('Done')
