# -*- coding: utf-8 -*-
"""استيراد دفعة عطاءات من ملف CSV يوفره المالك (عنوان، مدينة، آخر موعد، رابط).

الاستخدام: python3 import_csv.py path/to/file.csv "اسم المصدر"
- يزيل التكرار مقابل الأرشيف (بالرابط وبتشابه العنوان بعد التطبيع).
- يصنّف ويوسم المنطقة بنفس منطق الجمع الآلي.
"""
import csv
import json
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from normalize import normalize  # noqa: E402

DATA = Path(__file__).parent.parent / "data" / "tenders.json"
MONTHS = {"jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
          "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12}


def parse_deadline(raw, year=2026):
    """"09 Jul" → 2026-07-09 (والسنة تتقدم إذا كان الشهر قد مضى)."""
    m = re.match(r"(\d{1,2})\s+([A-Za-z]{3})", (raw or "").strip())
    if not m:
        return None
    d, mon = int(m.group(1)), MONTHS.get(m.group(2).lower())
    if not mon:
        return None
    return f"{year:04d}-{mon:02d}-{d:02d}"


def norm_title(t):
    return re.sub(r"[^\w؀-ۿ]+", "", (t or "").lower())


def main():
    csv_path, source_name = sys.argv[1], sys.argv[2]
    existing = json.loads(DATA.read_text(encoding="utf-8"))
    known_urls = {it["url"] for it in existing["items"]}
    known_titles = {norm_title(it["title"]) for it in existing["items"]}

    raw_items, dup = [], 0
    for row in csv.DictReader(open(csv_path, encoding="utf-8")):
        title = (row.get("العنوان") or "").strip()
        url = (row.get("الرابط") or "").strip()
        if not title or not url:
            continue
        nt = norm_title(title)
        if url in known_urls or nt in known_titles or any(
                nt and (nt in kt or kt in nt) for kt in known_titles if len(kt) > 15):
            dup += 1
            continue
        raw_items.append({
            "source": source_name,
            "source_id": re.search(r"(\d+)\.html?$", url).group(1) if re.search(r"(\d+)\.html?$", url) else None,
            "url": url,
            "title": title,
            "org": (row.get("الجهة") or "").strip(" -") or None,
            "location_raw": (row.get("المدينة") or "").strip(),
            "sector_raw": "",
            "published_rel": None,
            "deadline_raw": parse_deadline(row.get("آخر موعد")),
            "detail_excerpt": None,
        })
        known_titles.add(nt)

    new_items = normalize(raw_items)
    for it in new_items:
        existing["items"].append(it)
    existing["count"] = len(existing["items"])
    existing["generated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    if source_name not in existing["sources"]:
        existing["sources"].append(source_name)
    DATA.write_text(json.dumps(existing, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"imported: {len(new_items)} | duplicates skipped: {dup} | archive total: {existing['count']}")


if __name__ == "__main__":
    main()
