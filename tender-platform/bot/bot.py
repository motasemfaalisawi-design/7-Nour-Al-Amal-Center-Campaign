# -*- coding: utf-8 -*-
"""بوت «توريد» — تسجيل المشتركين واختيار المنطقة والقطاعات (long polling).

التشغيل: TG_TOKEN=xxx python3 bot/bot.py
"""
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, str(Path(__file__).parent.parent / "scraper"))
import tg  # noqa: E402
import store  # noqa: E402
from normalize import SECTORS  # noqa: E402

REGIONS = {"gaza": "غزة", "west_bank": "الضفة", "all": "الكل"}
DATA = Path(__file__).parent.parent / "data" / "tenders.json"

WELCOME = (
    "أهلاً بك في <b>توريد</b> 🟢\n"
    "فرص التوريد والمناقصات في فلسطين — أول بأول.\n\n"
    "اختر منطقتك، ثم قطاعاتك، وكل فرصة جديدة تناسبك بتوصلك هون فوراً — مجاناً."
)


def region_kb(current):
    return [[{"text": ("✅ " if k == current else "") + v, "callback_data": f"r:{k}"}
             for k, v in REGIONS.items()]]


def sectors_kb(selected):
    rows, row = [], []
    for s in SECTORS:
        mark = "✅ " if s in selected else ""
        row.append({"text": mark + s, "callback_data": f"s:{s}"})
        if len(row) == 2:
            rows.append(row)
            row = []
    if row:
        rows.append(row)
    rows.append([{"text": "💾 تم — فعّل تنبيهاتي", "callback_data": "done"}])
    return rows


def fmt_item(it):
    days = ""
    if it.get("deadline"):
        d = it["deadline"].split("-")  # YYYY-MM-DD → DD/MM/YYYY
        days = f"\n⏰ آخر موعد: {d[2]}/{d[1]}/{d[0]}"
    org = it.get("org") or f"عبر {it['source']}"
    city = f" · {it['city']}" if it.get("city") else ""
    return (f"📌 <b>{it['title']}</b>\n"
            f"🏢 {org}{city}\n"
            f"🏷 {it['sector']}{days}\n"
            f'🔗 <a href="{it["url"]}">رابط المصدر للتقديم</a>')


def latest_matching(sub, limit=5):
    if not DATA.exists():
        return []
    import time as _t
    today = _t.strftime("%Y-%m-%d")
    items = json.loads(DATA.read_text(encoding="utf-8"))["items"]
    out = []
    for it in items:
        if it.get("deadline") and it["deadline"] < today:
            continue  # المغلق لا يُعرض
        if sub["region"] != "all" and it["region"] != sub["region"]:
            continue
        if sub["sectors"] and it["sector"] not in sub["sectors"]:
            continue
        out.append(it)
        if len(out) >= limit:
            break
    return out


def handle_message(subs, msg):
    chat = msg["chat"]["id"]
    sub = store.get_sub(subs, chat)
    text = (msg.get("text") or "").strip()
    if text.startswith("/start"):
        tg.send(chat, WELCOME)
        tg.send(chat, "1️⃣ اختر منطقتك:", region_kb(sub["region"]))
    elif text.startswith("/stop"):
        sub["active"] = False
        tg.send(chat, "وقّفنا التنبيهات. رجعتها بأي وقت بـ /start 👋")
    else:
        items = latest_matching(sub)
        if items:
            tg.send(chat, "آخر الفرص المطابقة لاختياراتك:\n\n" +
                    "\n\n———\n\n".join(fmt_item(i) for i in items))
        else:
            tg.send(chat, "ما في فرص مطابقة حالياً — أول ما يصدر جديد بيوصلك تنبيه ⚡")
    store.save_subs(subs)


def handle_callback(subs, cb):
    chat = cb["message"]["chat"]["id"]
    mid = cb["message"]["message_id"]
    sub = store.get_sub(subs, chat)
    data = cb["data"]
    if data.startswith("r:"):
        sub["region"] = data[2:]
        tg.answer_callback(cb["id"], f"المنطقة: {REGIONS[sub['region']]}")
        tg.edit_markup(chat, mid, region_kb(sub["region"]))
        tg.send(chat, "2️⃣ اختر قطاعاتك (تقدر تختار أكثر من واحد):",
                sectors_kb(sub["sectors"]))
    elif data.startswith("s:"):
        s = data[2:]
        if s in sub["sectors"]:
            sub["sectors"].remove(s)
        else:
            sub["sectors"].append(s)
        tg.answer_callback(cb["id"])
        tg.edit_markup(chat, mid, sectors_kb(sub["sectors"]))
    elif data == "done":
        sub["active"] = True
        tg.answer_callback(cb["id"], "تم ✅")
        chosen = "، ".join(sub["sectors"]) if sub["sectors"] else "كل القطاعات"
        tg.send(chat, f"تمام! 🎉 تنبيهاتك مفعّلة:\n"
                      f"📍 {REGIONS[sub['region']]} — 🏷 {chosen}\n\n"
                      f"أول فرصة جديدة تطابق اختياراتك بتوصلك فوراً.\n"
                      f"ابعت أي رسالة لعرض آخر الفرص المطابقة.")
    store.save_subs(subs)


def main():
    if not tg.TOKEN:
        sys.exit("ضع التوكن في متغير البيئة TG_TOKEN")
    print("bot running…")
    offset = None
    subs = store.load_subs()
    while True:
        try:
            for u in tg.get_updates(offset):
                offset = u["update_id"] + 1
                if "message" in u:
                    handle_message(subs, u["message"])
                elif "callback_query" in u:
                    handle_callback(subs, u["callback_query"])
        except KeyboardInterrupt:
            break
        except Exception as e:  # لا يسقط البوت بخطأ عابر
            print("ERR:", e, file=sys.stderr)
            time.sleep(3)


if __name__ == "__main__":
    main()
