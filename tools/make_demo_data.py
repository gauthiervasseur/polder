#!/usr/bin/env python3
"""Generate the fictional 'Lowlands Asset Finance' contract portfolio used by DEMO.

Every company, contract and number is made up. Deterministic (fixed seed), so
the demo looks the same on every build.
Writes app/samples/lowlands-asset-finance.csv and app/samples/demo-data.js.
"""
import csv
import io
import json
import math
import random
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "app" / "samples"
NAME = "lowlands-asset-finance.csv"
random.seed(1969)

COUNTRIES = {
    "Europe": ["Netherlands", "Germany", "France", "United Kingdom", "Poland", "Italy"],
    "North America": ["United States", "Canada"],
    "Latin America": ["Brazil", "Chile", "Mexico"],
    "Asia-Pacific": ["Australia", "China", "India"],
}
REGION_WEIGHT = {"Europe": 0.40, "North America": 0.34, "Latin America": 0.12, "Asia-Pacific": 0.14}
CHANNELS = [("Vendor", 0.55), ("Dealer", 0.33), ("Direct", 0.12)]
PRODUCTS = [("Lease", 0.46), ("Loan", 0.30), ("Pay-per-use", 0.10), ("Inventory Finance", 0.14)]
# industry -> [(asset type, typical asset value)]
CATALOG = {
    "Agriculture": [("Tractor", 185000), ("Combine Harvester", 520000), ("Sprayer", 140000), ("Milking Robot", 210000)],
    "Construction": [("Excavator", 260000), ("Wheel Loader", 230000), ("Compact Track Loader", 85000)],
    "Healthcare": [("MRI Scanner", 1400000), ("Ultrasound System", 95000), ("Dental Chair", 42000)],
    "Energy Transition": [("Solar Array", 320000), ("EV Charger Network", 120000), ("Battery Storage", 450000)],
    "Transportation": [("Truck", 145000), ("Refrigerated Trailer", 70000), ("Electric Van", 62000)],
    "Materials Handling": [("Forklift", 38000), ("Warehouse Robot", 90000), ("Reach Truck", 52000)],
    "Office Equipment": [("Printer Fleet", 28000), ("Laptop Fleet", 45000), ("Video Wall", 33000)],
    "Food": [("Packaging Line", 380000), ("Industrial Oven", 160000), ("Cold Storage Unit", 110000)],
}
IND_WEIGHT = {"Agriculture": 0.27, "Construction": 0.14, "Healthcare": 0.11, "Energy Transition": 0.09,
              "Transportation": 0.13, "Materials Handling": 0.12, "Office Equipment": 0.08, "Food": 0.06}


def pick(weighted):
    r = random.random() * sum(w for _, w in weighted)
    for item, w in weighted:
        r -= w
        if r <= 0:
            return item
    return weighted[-1][0]


def main():
    start, end = date(2023, 1, 1), date(2025, 12, 31)
    days = (end - start).days + 1
    rows = []
    cid = 400000
    for _ in range(4200):
        industry = pick(list(IND_WEIGHT.items()))
        # seasonality: spring peak for agriculture, Q4 budget flush elsewhere; growth over time,
        # strongest in Energy Transition
        while True:
            d = start + timedelta(days=random.randrange(days))
            if industry == "Agriculture":
                season = 1 + 1.1 * math.exp(-((d.month - 3.5) ** 2) / 2)
            else:
                season = 1 + 0.7 * math.exp(-((d.month - 12) ** 2) / 1.5)
            g = 1.2 if industry == "Energy Transition" else 0.3
            growth = 1 + g * (d - start).days / days
            if random.random() < season * growth / 3.4:
                break
        region = pick(list(REGION_WEIGHT.items()))
        country = random.choice(COUNTRIES[region])
        channel = pick(CHANNELS)
        product = pick(PRODUCTS)
        asset, value = random.choice(CATALOG[industry])
        units = 1 if value > 300000 else max(1, int(random.expovariate(1 / 2.2)) + 1)
        asset_value = int(round(units * value * random.uniform(0.8, 1.25), -2))
        financed = int(round(asset_value * random.uniform(0.7, 1.0), -2))
        term = random.choice([24, 36, 48, 60, 60, 72, 84] if value > 100000 else [12, 24, 36, 36, 48])
        if product == "Inventory Finance":
            term = random.choice([6, 9, 12])
        rate = round(random.gauss(6.2, 1.1) + (0.8 if region == "Latin America" else 0) - (0.4 if channel == "Vendor" else 0), 2)
        rate = max(2.5, rate)
        income = round(financed * rate / 100 * min(term, 12) / 12, 2)  # first-year interest income
        cost_of_funds = round(financed * 0.038 * min(term, 12) / 12, 2)
        nps = None if random.random() < 0.2 else min(5, max(1, round(random.gauss(4.2 - (rate - 6) * 0.15, 0.7))))
        cid += random.randint(1, 4)
        rows.append({
            "Contract ID": f"LAF-{cid}",
            "Start Date": d.isoformat(),
            "Region": region,
            "Country": country,
            "Industry": industry,
            "Asset Type": asset,
            "Finance Product": product,
            "Channel": channel,
            "Units": units,
            "Asset Value": asset_value,
            "Financed Amount": financed,
            "Term (Months)": term,
            "Interest Rate": rate,
            "Interest Income": income,
            "Margin": round(income - cost_of_funds, 2),
            "Customer Rating": "" if nps is None else nps,
        })
    rows.sort(key=lambda r: (r["Start Date"], r["Contract ID"]))

    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=list(rows[0].keys()), lineterminator="\n")
    w.writeheader()
    w.writerows(rows)
    text = buf.getvalue()

    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("pixel-mart-sales.csv"):
        old.unlink()
    (OUT / NAME).write_text(text, encoding="utf-8")
    (OUT / "demo-data.js").write_text(
        "/* Generated by tools/make_demo_data.py - fictional data for the DEMO button. */\n"
        "window.POLDER_DEMO_CSV = " + json.dumps(text) + ";\n",
        encoding="utf-8",
    )
    print(f"{len(rows)} demo rows -> {OUT / NAME}")


if __name__ == "__main__":
    main()
