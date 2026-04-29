"""Дамп UID Аксессуары.xlsx в JSON {sheet_name: [{uid, title}, ...]}"""
import pandas as pd
import json
import sys

XL = 'F:/workwork!/tgapp-shop/РАБОТА С ТГ МАГАЗОМ/UID Аксессуары.xlsx'

sheets = pd.read_excel(XL, sheet_name=None, header=None)
out = {}
for name, df in sheets.items():
    pairs = []
    for _, row in df.iterrows():
        uid = row[0]
        title = row[1] if len(row) > 1 else None
        # Skip header rows / NaNs
        if pd.isna(uid):
            continue
        try:
            uid_str = str(int(uid)) if not isinstance(uid, str) else str(uid).strip()
        except (ValueError, TypeError):
            uid_str = str(uid).strip()
        # Skip header text
        if not uid_str.replace('.', '').replace('e', '').replace('+', '').isdigit():
            continue
        if pd.isna(title):
            continue
        pairs.append({'uid': uid_str, 'title': str(title).strip()})
    out[name] = pairs

with open('scripts/uid-data.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

# Also print summary
for name, items in out.items():
    print(f'{name}: {len(items)} items')
