# -*- coding: utf-8 -*-
"""مشغّل الجمع: يجلب المصادر، يوحّد البيانات، ويكتب data/tenders.json."""
import json
import sys
import time
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from sources import wenak, tender4arab  # noqa: E402
from normalize import normalize  # noqa: E402

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
DATA = Path(__file__).parent.parent / "data" / "tenders.json"


def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ar,en"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", errors="ignore")


def main():
    all_items = []
    errors = []
    for mod in (wenak, tender4arab):
        try:
            page = fetch(mod.LIST_URL)
            items = mod.parse(page)
            print(f"[{mod.SOURCE}] {len(items)} items")
            all_items += items
        except Exception as e:  # مصدر واحد يفشل لا يوقف البقية
            errors.append({"source": mod.SOURCE, "error": str(e)})
            print(f"[{mod.SOURCE}] ERROR: {e}", file=sys.stderr)

    normalized = normalize(all_items)

    # دمج مع الأرشيف القائم (الأرشيف أصل تجاري — لا نفقد شيئاً جُمع سابقاً)
    existing = {}
    if DATA.exists():
        for it in json.loads(DATA.read_text(encoding="utf-8")).get("items", []):
            existing[it["id"]] = it
    for it in normalized:
        existing[it["id"]] = it  # الجديد يحدّث القديم بنفس المعرف

    payload = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "sources": [wenak.SOURCE, tender4arab.SOURCE],
        "errors": errors,
        "count": len(existing),
        "items": sorted(existing.values(), key=lambda x: x["id"], reverse=True),
    }
    DATA.parent.mkdir(parents=True, exist_ok=True)
    DATA.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"wrote {DATA} ({payload['count']} items)")


if __name__ == "__main__":
    main()
