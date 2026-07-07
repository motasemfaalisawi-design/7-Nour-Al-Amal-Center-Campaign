# -*- coding: utf-8 -*-
"""بناء الموقع: يدمج data/tenders.json في القالب وينتج dist/index.html.

--inline-font : يضمّن الخط كـ data URI (لمعاينات لا تسمح بجلب خارجي).
"""
import base64
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
TEMPLATE = Path(__file__).parent / "template.html"
DATA = ROOT / "data" / "tenders.json"
DIST = Path(__file__).parent / "dist"

WEB_FONT = ('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            '<link rel="stylesheet" '
            'href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;700&display=swap">')


def inline_font_css(woff2_path):
    b64 = base64.b64encode(Path(woff2_path).read_bytes()).decode()
    return ("<style>@font-face{font-family:'Noto Kufi Arabic';font-style:normal;"
            "font-weight:100 900;font-display:swap;"
            f"src:url(data:font/woff2;base64,{b64}) format('woff2');}}</style>")


def main():
    inline = "--inline-font" in sys.argv
    data = json.loads(DATA.read_text(encoding="utf-8"))
    html = TEMPLATE.read_text(encoding="utf-8")
    if inline:
        woff2 = next(a for a in sys.argv if a.endswith(".woff2"))
        font = inline_font_css(woff2)
        out = DIST / "preview.html"
    else:
        font = WEB_FONT
        out = DIST / "index.html"
    html = html.replace("__FONT_CSS__", font)
    html = html.replace("__DATA_JSON__", json.dumps(data, ensure_ascii=False))
    DIST.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")
    print(f"built {out} ({out.stat().st_size:,} bytes, {data['count']} tenders)")


if __name__ == "__main__":
    main()
