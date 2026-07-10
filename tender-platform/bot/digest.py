# -*- coding: utf-8 -*-
"""الملخص اليومي: يرسل للمالك رسالة جاهزة للنسخ واللصق في قناة واتساب.

التشغيل: TG_TOKEN=xxx TG_ADMIN_CHAT=123456 python3 bot/digest.py
- يعتمد سجل data/digested_ids.json (في git) حتى لا يكرر فرصة سبق تلخيصها.
- يقتصر على فرص غزة المفتوحة؛ 12 فرصة كحد أقصى والباقي إحالة للموقع.
"""
import json
import os
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import tg  # noqa: E402

DATA = Path(__file__).parent.parent / "data" / "tenders.json"
LEDGER = Path(__file__).parent.parent / "data" / "digested_ids.json"
ADMIN = os.environ.get("TG_ADMIN_CHAT", "")
SITE_URL = os.environ.get("SITE_URL", "")
BOT_LINK = "t.me/TawreedPSBot"
MAX_ITEMS = 12


def load_ledger():
    if LEDGER.exists():
        return set(json.loads(LEDGER.read_text(encoding="utf-8")))
    return set()


def fmt_date(iso):
    if not iso:
        return "راجع الإعلان"
    y, m, d = iso.split("-")
    return f"{d}/{m}"


def build_digest(items):
    today = time.strftime("%Y-%m-%d")
    date_line = time.strftime("%d/%m/%Y")
    lines = [f"📢 *فرص توريد اليوم — غزة* ({date_line})", ""]
    for it in items:
        org = f" — {it['org']}" if it.get("org") else ""
        lines.append(f"▪️ {it['title']}{org}")
        closing = fmt_date(it.get("deadline"))
        urgency = ""
        if it.get("deadline"):
            days = (time.mktime(time.strptime(it["deadline"], "%Y-%m-%d"))
                    - time.mktime(time.strptime(today, "%Y-%m-%d"))) / 86400
            if days <= 2:
                urgency = " ⚠️ عاجل"
        lines.append(f"   🏷 {it['sector']} · ⏰ يغلق {closing}{urgency}")
        lines.append(f"   🔗 {it['url']}")
        lines.append("")
    lines.append(f"🔔 بدك بس اللي بخصك؟ تنبيهات فورية حسب قطاعك — مجاناً: {BOT_LINK}")
    if SITE_URL:
        lines.append(f"🌐 كل الفرص: {SITE_URL}")
    return "\n".join(lines)


def main():
    if not tg.TOKEN or not ADMIN:
        sys.exit("مطلوب TG_TOKEN وTG_ADMIN_CHAT")
    today = time.strftime("%Y-%m-%d")
    items = json.loads(DATA.read_text(encoding="utf-8"))["items"]
    done = load_ledger()
    fresh = [it for it in items
             if it["region"] == "gaza"
             and it["id"] not in done
             and not (it.get("deadline") and it["deadline"] < today)]
    fresh.sort(key=lambda x: x.get("deadline") or "9999")
    if not fresh:
        print("لا جديد اليوم — لا رسالة")
        return
    batch, rest = fresh[:MAX_ITEMS], fresh[MAX_ITEMS:]
    text = build_digest(batch)
    if rest:
        text += f"\n\n(وفي {len(rest)} فرصة إضافية — كاملة على الموقع)"
    tg.call("sendMessage", chat_id=ADMIN,
            text="📋 ملخص اليوم جاهز — انسخ الرسالة الجاية والصقها بقناة الواتساب 👇")
    tg.call("sendMessage", chat_id=ADMIN, text=text)
    done.update(it["id"] for it in batch)
    LEDGER.write_text(json.dumps(sorted(done), ensure_ascii=False), encoding="utf-8")
    print(f"digest sent: {len(batch)} items (+{len(rest)} overflow)")


if __name__ == "__main__":
    main()
