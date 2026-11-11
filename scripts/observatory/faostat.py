import csv
import json
import sys
import zipfile

ELEMENTS = {"5312", "5412", "5510"}
DATA_NAME = "Production_Crops_Livestock_E_All_Data_(Normalized).csv"
AREA_NAME = "Production_Crops_Livestock_E_AreaCodes.csv"

# Observatory name -> FAO area name, when the published names differ.
ALIASES = {
    "Côte d’Ivoire": "Côte d'Ivoire",
    "Congo, Dem. Rep.": "Democratic Republic of the Congo",
    "Congo, Rep.": "Congo",
    "Gambia, The": "Gambia",
    "China": "China; mainland",
    "Hong Kong SAR, China": "China; Hong Kong SAR",
    "Iran, Islamic Rep.": "Iran (Islamic Republic of)",
    "Korea, Dem. People's Rep.": "Democratic People's Republic of Korea",
    "Kyrgyz Republic": "Kyrgyzstan",
    "Lao PDR": "Lao People's Democratic Republic",
    "Macao SAR, China": "China; Macao SAR",
    "Somalia, Fed. Rep.": "Somalia",
    "South Korea": "Republic of Korea",
    "Tanzania": "United Republic of Tanzania",
    "Turkiye": "Türkiye",
    "Vietnam": "Viet Nam",
    "West Bank and Gaza": "Palestine",
    "Yemen, Rep.": "Yemen",
}


def area_names(archive):
    text = archive.read(AREA_NAME).decode("utf-8-sig")
    names = {}
    for line in text.splitlines()[1:]:
        parts = line.split(",", 2)
        if len(parts) < 3:
            continue
        names[parts[2].strip()] = parts[0].strip()
    return names


def main():
    zip_path, wdi_path, item_arg = sys.argv[1:]
    item_codes = {code.strip() for code in item_arg.split(",") if code.strip()}
    countries = json.load(open(wdi_path, encoding="utf-8"))["countries"]
    with zipfile.ZipFile(zip_path) as archive:
        fao_names = area_names(archive)
        iso_by_area_code = {}
        missing = []
        for country in countries:
            fao_name = ALIASES.get(country["name"], country["name"])
            area_code = fao_names.get(fao_name)
            if not area_code:
                missing.append(country["name"])
                continue
            iso_by_area_code[area_code] = country["iso3"]
        if missing:
            raise SystemExit("FAO area name missing for: " + ", ".join(missing))
        rows = []
        units = {}
        with archive.open(DATA_NAME) as raw:
            reader = csv.DictReader(line.decode("utf-8-sig") for line in raw)
            for record in reader:
                if record["Item Code"] not in item_codes:
                    continue
                if record["Element Code"] not in ELEMENTS:
                    continue
                iso3 = iso_by_area_code.get(record["Area Code"])
                if not iso3:
                    continue
                year = int(record["Year"])
                if year < 2015:
                    continue
                flag = (record.get("Flag") or "").strip()
                if flag == "M":
                    continue
                value = record.get("Value")
                if value in (None, ""):
                    continue
                unit = (record.get("Unit") or "").strip()
                units[(record["Item Code"], record["Element Code"], unit)] = units.get(
                    (record["Item Code"], record["Element Code"], unit), 0
                ) + 1
                rows.append({
                    "country": iso3,
                    "itemCode": record["Item Code"],
                    "elementCode": record["Element Code"],
                    "element": record["Element"],
                    "year": year,
                    "value": float(value),
                    "unit": unit,
                    "flag": flag,
                })
    dates = archive_date(zip_path)
    json.dump({"sourceFileDate": dates, "rows": rows, "unitCounts": [
        {"itemCode": key[0], "elementCode": key[1], "unit": key[2], "rows": count}
        for key, count in sorted(units.items())
    ]}, sys.stdout)
    print(
        f"FAOSTAT kept {len(rows)} rows across {len({row['country'] for row in rows})} economies",
        file=sys.stderr,
    )


def archive_date(zip_path):
    with zipfile.ZipFile(zip_path) as archive:
        info = archive.getinfo(DATA_NAME)
        return f"{info.date_time[0]:04d}-{info.date_time[1]:02d}-{info.date_time[2]:02d}"


if __name__ == "__main__":
    main()
