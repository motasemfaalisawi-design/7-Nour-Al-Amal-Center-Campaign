# -*- coding: utf-8 -*-
"""جامع عطاءات wenak.ps — يقرأ صفحة القائمة ويستخرج البطاقات وتفاصيلها المضمّنة."""
import re
import html as htmllib

SOURCE = "wenak.ps"
LIST_URL = "https://www.wenak.ps/tenders"

CARD_RE = re.compile(
    r'tender-card__company">(?P<org>[^<]*)</div>.*?'
    r'tender-card__location">.*?<span>(?P<location>[^<]*)</span>.*?'
    r'(?:tender-card__category">.*?<span>(?P<category>[^<]*)</span>.*?)?'
    r'tender-card__title">\s*(?P<title>.*?)\s*</h3>.*?'
    r'tender-card__time">.*?<span>(?P<time>[^<]*)</span>',
    re.S,
)
DETAIL_URL_RE = re.compile(r'href="(https://www\.wenak\.ps/tender/detail/(\d+)\.html)"')
DATE_RE = re.compile(r'(\d{4})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{1,2})|(\d{1,2})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{2,4})')
DEADLINE_HINTS = ("آخر موعد", "الموعد النهائي", "تقديم العروض", "تسليم العطاء", "تسليم العروض", "أقصاه", "إغلاق", "اخر موعد")


def _extract_deadline(text):
    """يلتقط كل التواريخ ويرجّح: تاريخ بجوار عبارة موعد نهائي، وإلا الأبعد زمنياً."""
    found = []  # (iso, has_hint)
    for m in DATE_RE.finditer(text):
        if m.group(1):  # YYYY/MM/DD
            y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        else:  # DD/MM/YY(YY)
            d, mo, y = int(m.group(4)), int(m.group(5)), int(m.group(6))
            if y < 100:
                y += 2000
        if not (2020 <= y <= 2040 and 1 <= mo <= 12 and 1 <= d <= 31):
            continue
        ctx = text[max(0, m.start() - 70):m.start()]
        hint = any(h in ctx for h in DEADLINE_HINTS)
        found.append((f"{y:04d}-{mo:02d}-{d:02d}", hint))
    if not found:
        return None
    hinted = [f for f, h in found if h]
    return hinted[0] if hinted else max(f for f, _ in found)


def _clean(s):
    return re.sub(r"\s+", " ", htmllib.unescape(s or "")).strip()


def parse(page_html):
    """يعيد قائمة عطاءات خام من HTML صفحة القائمة."""
    items = []
    # كل بطاقة يتبعها بلوك تفاصيل ورابط مشاركة يحمل رقم العطاء
    blocks = re.split(r'(?=<div class="tender-card__header")', page_html)
    for block in blocks[1:]:
        m = CARD_RE.search(block)
        if not m:
            continue
        url_m = DETAIL_URL_RE.search(block)
        detail_text = ""
        dm = re.search(r'tender-details__content(.*)', block, re.S)
        if dm:
            detail_text = _clean(re.sub(r"<[^>]+>", " ", dm.group(1)))
        deadline = _extract_deadline(detail_text)
        items.append({
            "source": SOURCE,
            "source_id": url_m.group(2) if url_m else None,
            "url": url_m.group(1) if url_m else LIST_URL,
            "title": _clean(m.group("title")),
            "org": _clean(m.group("org")),
            "location_raw": _clean(m.group("location")),
            "sector_raw": _clean(m.group("category") or ""),
            "published_rel": _clean(m.group("time")),
            "deadline_raw": deadline,
            "detail_excerpt": detail_text[:600] or None,
        })
    return items
