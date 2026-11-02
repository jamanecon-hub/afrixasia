import csv
import io
import json
import sys
import zipfile

DATA_NAME = "Global_production_quantity.csv"
SPECIES_NAME = "CL_FI_SPECIES_GROUPS.csv"
COUNTRY_NAME = "CL_FI_COUNTRY_GROUPS.csv"
AQUATIC_ANIMALS = "Aquatic animals (Fish, crustaceans and molluscs, etc.)"
AQUA_SOURCES = {"FRESHWATER", "BRACKISHWATER", "MARINE"}
YEAR_START = 2015
YEAR_END = 2024


def archive_date(archive):
    info = archive.getinfo(DATA_NAME)
    return f"{info.date_time[0]:04d}-{info.date_time[1]:02d}-{info.date_time[2]:02d}"


def aquatic_species(archive):
    codes = set()
    with archive.open(SPECIES_NAME) as raw:
        reader = csv.DictReader(io.TextIOWrapper(raw, encoding="utf-8-sig"))
        for row in reader:
            if row["Yearbook_Group_En"] == AQUATIC_ANIMALS and row["3A_Code"]:
                codes.add(row["3A_Code"])
    if not codes:
        raise SystemExit("FAO FishStat aquatic-animal species list is empty.")
    return codes


def country_iso(archive, wanted):
    iso_by_un = {}
    seen = {}
    with archive.open(COUNTRY_NAME) as raw:
        reader = csv.DictReader(io.TextIOWrapper(raw, encoding="utf-8-sig"))
        for row in reader:
            iso3 = (row.get("ISO3_Code") or "").strip()
            un_code = (row.get("UN_Code") or "").strip().zfill(3)
            if not iso3 or iso3 not in wanted:
                continue
            previous = seen.get(iso3)
            if previous and previous != un_code:
                raise SystemExit(f"FAO FishStat ISO3 {iso3} maps to both {previous} and {un_code}.")
            seen[iso3] = un_code
            iso_by_un[un_code] = iso3
    return iso_by_un


def item_for(source):
    if source == "CAPTURE":
        return "FISH-CAPTURE"
    if source in AQUA_SOURCES:
        return "FISH-AQUA"
    return ""


def main():
    zip_path, wdi_path = sys.argv[1:]
    countries = json.load(open(wdi_path, encoding="utf-8"))["countries"]
    wanted = {country["iso3"] for country in countries}
    totals = {}
    with zipfile.ZipFile(zip_path) as archive:
        species = aquatic_species(archive)
        iso_by_un = country_iso(archive, wanted)
        source_date = archive_date(archive)
        with archive.open(DATA_NAME) as raw:
            reader = csv.DictReader(io.TextIOWrapper(raw, encoding="utf-8-sig"))
            for row in reader:
                if row["MEASURE"] != "Q_tlw":
                    continue
                if row["SPECIES.ALPHA_3_CODE"] not in species:
                    continue
                item = item_for(row["PRODUCTION_SOURCE_DET.CODE"])
                if not item:
                    continue
                year = int(row["PERIOD"])
                if year < YEAR_START or year > YEAR_END:
                    continue
                iso3 = iso_by_un.get((row["COUNTRY.UN_CODE"] or "").zfill(3))
                if not iso3:
                    continue
                value = row.get("VALUE")
                if value in (None, ""):
                    continue
                flag = (row.get("STATUS") or "").strip() or "A"
                key = (iso3, item, year)
                bucket = totals.get(key)
                if bucket is None:
                    bucket = {"value": 0.0, "flags": set()}
                    totals[key] = bucket
                bucket["value"] += float(value)
                bucket["flags"].add(flag)
    rows = []
    for (iso3, item, year), bucket in sorted(totals.items()):
        flags = "".join(sorted(bucket["flags"]))
        value = round(bucket["value"], 3)
        if value == round(value):
            value = int(round(value))
        rows.append({
            "country": iso3,
            "itemCode": item,
            "elementCode": "Q_tlw",
            "element": "Live weight",
            "year": year,
            "value": value,
            "unit": "t",
            "flag": flags,
        })
    json.dump({"sourceFileDate": source_date, "rows": rows}, sys.stdout)
    print(f"FishStat kept {len(rows)} country-item-years", file=sys.stderr)


if __name__ == "__main__":
    main()
