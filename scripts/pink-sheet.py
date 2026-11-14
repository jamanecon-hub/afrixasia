import json
import sys
import zipfile
import xml.etree.ElementTree as ET

NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"


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


def sheet_path(archive, name):
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    relations = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    targets = {}
    for relation in relations:
        if local(relation.tag) != "Relationship":
            continue
        targets[relation.attrib.get("Id")] = relation.attrib.get("Target")
    for sheet in workbook.iter():
        if local(sheet.tag) != "sheet" or sheet.attrib.get("name") != name:
            continue
        relation = sheet.attrib.get(
            "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
        )
        target = targets[relation]
        return target if target.startswith("xl/") else f"xl/{target}"
    raise SystemExit(f"{name} sheet was not found")


def cell_value(cell, strings):
    kind = cell.attrib.get("t")
    value_node = next((child for child in cell if local(child.tag) == "v"), None)
    inline = next((child for child in cell if local(child.tag) == "is"), None)
    if kind == "s" and value_node is not None and value_node.text:
        return strings[int(value_node.text)]
    if kind == "inlineStr" and inline is not None:
        return text_of(inline)
    if value_node is not None and value_node.text not in (None, ""):
        return value_node.text
    return None


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
            value = cell_value(cell, strings)
            if value is not None:
                values[column] = value
        if values:
            rows.append(values)
    return rows


def period_of(label):
    text = str(label).strip()
    if len(text) != 7 or text[4] != "M":
        return None
    year, month = text[:4], text[5:]
    if not year.isdigit() or not month.isdigit():
        return None
    if int(year) < 2015 or not 1 <= int(month) <= 12:
        return None
    return f"{year}-{month}"


def price_of(value):
    text = str(value).strip()
    if text in {"", "…", "...", "..", "-"}:
        return None
    try:
        number = float(text)
    except ValueError:
        return None
    if number != number or number <= 0:
        return None
    return number


def main():
    wanted = {item.strip() for item in sys.argv[2].split("|") if item.strip()}
    with zipfile.ZipFile(sys.argv[1]) as archive:
        strings = shared_strings(archive)
        rows = sheet_rows(archive, sheet_path(archive, "Monthly Prices"), strings)
    updated = ""
    headers = {}
    units = {}
    observations = {name: [] for name in wanted}
    for row in rows:
        label = str(row.get(1, "")).strip()
        if label.startswith("Updated on "):
            updated = label.removeprefix("Updated on ").strip()
        if "Cocoa" in row.values() and not headers:
            headers = {column: str(value).strip() for column, value in row.items() if column > 1}
        elif headers and not units and any(str(value).startswith("(") for value in row.values()):
            units = {column: str(value).strip() for column, value in row.items() if column > 1}
        else:
            period = period_of(label)
            if not period or not headers:
                continue
            for column, name in headers.items():
                if name not in wanted:
                    continue
                price = price_of(row.get(column))
                if price is None:
                    continue
                observations[name].append({"period": period, "price": price})
    missing = sorted(name for name in wanted if name not in headers.values())
    if missing:
        raise SystemExit("Pink Sheet column missing: " + ", ".join(missing))
    columns = []
    for column, name in sorted(headers.items()):
        if name not in wanted:
            continue
        columns.append({
            "header": name,
            "unit": units.get(column, ""),
            "rows": observations[name],
        })
    json.dump({"updatedOn": updated, "columns": columns}, sys.stdout)


if __name__ == "__main__":
    main()
