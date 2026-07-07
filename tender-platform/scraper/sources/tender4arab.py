# -*- coding: utf-8 -*-
"""جامع tender4arab.com (فلتر غزة) — حقول معنونة بمعرّفات GridView ثابتة."""
import re
import html as htmllib

SOURCE = "tender4arab.com"
LIST_URL = "https://tender4arab.com/Search.aspx?gaza=1"
BASE = "https://tender4arab.com/"

FIELD_RE = {
    "title": r'GridView1_LabelSubject_{n}"[^>]*>([^<]*)<',
    "org": r'GridView1_LabelTenderBy_{n}"[^>]*>([^<]*)<',
    "org_type": r'GridView1_LabelCompCat_{n}"[^>]*>([^<]*)<',
    "published": r'GridView1_LabelDate_{n}"[^>]*>([^<]*)<',
    "expiry": r'GridView1_LabelExpiry_{n}"[^>]*>([^<]*)<',
    "city": r'GridView1_LabelCity_{n}"[^>]*>([^<]*)<',
    "category": r'GridView1_LabelCat_{n}"[^>]*>([^<]*)<',
}
DETAIL_RE = r'href=.TenderDetails\.aspx\?id=(\d+)'


def _clean(s):
    return re.sub(r"\s+", " ", htmllib.unescape(s or "")).strip(" -–")


def parse(page_html):
    items = []
    for n in range(200):  # حتى 200 صف بالصفحة
        fields = {}
        for key, pat in FIELD_RE.items():
            m = re.search(pat.format(n=n), page_html)
            if m:
                fields[key] = _clean(m.group(1))
        if "title" not in fields:
            break
        # رقم التفاصيل: أقرب رابط TenderDetails بعد موضع العنوان
        pos = page_html.find(f'GridView1_LabelSubject_{n}"')
        dm = re.search(DETAIL_RE, page_html[pos:pos + 4000]) if pos >= 0 else None
        source_id = dm.group(1) if dm else None
        items.append({
            "source": SOURCE,
            "source_id": source_id,
            "url": f"{BASE}TenderDetails.aspx?id={source_id}" if source_id else LIST_URL,
            "title": fields.get("title"),
            "org": fields.get("org"),
            "org_type": fields.get("org_type"),
            "location_raw": fields.get("city", ""),
            "sector_raw": fields.get("category", ""),
            "published_rel": fields.get("published"),
            "deadline_raw": fields.get("expiry"),  # DD/MM/YYYY — يوحّده normalize
            "detail_excerpt": None,
        })
    return items
