import csv
import io
import json
import sys
import zipfile

# World Bank bulk CSV keeps the release date above a quoted country table.
# Empty cells stay empty. Callers decide which economies and years to keep.

def main():
    archive_path, allowed, start_year, end_year = sys.argv[1:]
    allowed = set(allowed.split(","))
    start_year = int(start_year)
    end_year = int(end_year)
    with zipfile.ZipFile(archive_path) as archive:
        data_name = next(name for name in archive.namelist() if name.startswith("API_"))
        text = archive.read(data_name).decode("utf-8-sig")
    rows = list(csv.reader(io.StringIO(text)))
    updated_on = ""
    header_index = None
    for index, row in enumerate(rows):
        if row and row[0] == "Last Updated Date" and len(row) > 1:
            updated_on = row[1]
        if row and row[0] == "Country Name":
            header_index = index
            break
    if header_index is None:
        raise SystemExit("World Bank CSV has no country table")
    header = rows[header_index]
    year_columns = [
        (int(label), index)
        for index, label in enumerate(header)
        if label.isdigit() and start_year <= int(label) <= end_year
    ]
    extracted = []
    indicator = ""
    for row in rows[header_index + 1:]:
        if len(row) < 4 or row[1] not in allowed:
            continue
        indicator = indicator or row[3]
        for year, index in year_columns:
            if index >= len(row) or not row[index].strip():
                continue
            value = float(row[index])
            if value <= 0:
                continue
            extracted.append({"iso3": row[1], "year": year, "value": value})
    json.dump({"updatedOn": updated_on, "indicator": indicator, "rows": extracted}, sys.stdout)


if __name__ == "__main__":
    main()
