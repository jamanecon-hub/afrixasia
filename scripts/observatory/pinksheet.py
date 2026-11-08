import json
import sys
import zipfile
import xml.etree.ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def local(tag):
    return tag.rsplit("}", 1)[-1]


def cell_ref(ref):
    column = 0
    row = 0
    for char in ref:
        if char.isalpha():
            column = column * 26 + ord(char.upper()) - 64
        elif char.isdigit():
            row = row * 10 + int(char)
    return column, row


def text_of(node):
    parts = []
    if node.text:
        parts.append(node.text)
    for child in node:
        parts.append(text_of(child))
        if child.tail:
            parts.append(child.tail)
    return "".join(parts)


def shared_strings(archive):
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    return [text_of(item) for item in root if local(item.tag) == "si"]


def sheet_path(archive):
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    relations = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    targets = {}
    for relation in relations:
        if local(relation.tag) != "Relationship":
            continue
        targets[relation.attrib.get("Id")] = relation.attrib.get("Target")
    for sheet in workbook.iter():
        if local(sheet.tag) != "sheet" or sheet.attrib.get("name") != "Monthly Prices":
            continue
        relation = sheet.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
        target = targets[relation]
        return target if target.startswith("xl/") else f"xl/{target}"
    raise SystemExit("Monthly Prices sheet was not found")


def sheet_rows(archive, path, strings):
    root = ET.fromstring(archive.read(path))
    rows = []
    for row in root.iter():
        if local(row.tag) != "row":
            continue
        values = {}
        for cell in row:
            if local(cell.tag) != "c" or "r" not in cell.attrib:
                continue
            column, _row_number = cell_ref(cell.attrib["r"])
            kind = cell.attrib.get("t")
            value_node = next((child for child in cell if local(child.tag) == "v"), None)
            inline = next((child for child in cell if local(child.tag) == "is"), None)
            if kind == "s" and value_node is not None and value_node.text:
                values[column] = strings[int(value_node.text)]
            elif kind == "inlineStr" and inline is not None:
                values[column] = text_of(inline)
            elif value_node is not None and value_node.text not in (None, ""):
                values[column] = value_node.text
        if values:
            rows.append(values)
    return rows


def main():
    with zipfile.ZipFile(sys.argv[1]) as archive:
        rows = sheet_rows(archive, sheet_path(archive), shared_strings(archive))
    updated = ""
    header_index = None
    for index, row in enumerate(rows):
        label = str(row.get(1, ""))
        if label.startswith("Updated on"):
            updated = label.removeprefix("Updated on ").strip()
        if any(str(value).strip() == "Cocoa" for value in row.values()):
            header_index = index
            break
    if header_index is None:
        raise SystemExit("Commodity header row was not found")
    header = rows[header_index]
    units = rows[header_index + 1]
    columns = []
    for column, name in sorted(header.items()):
        title = str(name).strip()
        if column == 1 or not title:
            continue
        columns.append({"column": column, "name": title, "unit": str(units.get(column, "")).strip()})
    prices = []
    for row in rows[header_index + 2 :]:
        period_raw = str(row.get(1, "")).strip()
        if len(period_raw) != 7 or period_raw[4] != "M":
            continue
        period = f"{period_raw[:4]}-{period_raw[5:]}"
        if period < "2015-01":
            continue
        for column in columns:
            raw = row.get(column["column"])
            if raw in (None, "", "…", "..."):
                continue
            try:
                price = float(raw)
            except ValueError:
                continue
            prices.append({"series": column["name"], "period": period, "price": price, "unit": column["unit"]})
    json.dump({"updated": updated, "prices": prices}, sys.stdout)


if __name__ == "__main__":
    main()
