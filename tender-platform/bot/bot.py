# -*- coding: utf-8 -*-
"""بوت «توريد» — اشتراك بالمدن والقطاعات، دفعة أولى فورية ثم تنبيهات أولاً بأول.

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
from normalize import SECTORS, CITIES, WB_ALL  # noqa: E402

DATA = Path(__file__).parent.parent / "data" / "tenders.json"

WELCOME = (
    "أهلاً بك في <b>توريد</b> 🟢\n"
    "فرص التوريد والمناقصات في فلسطين — أول بأول.\n\n"
    "خطوتان بس: اختر مدنك، ثم قطاعاتك — وبتوصلك فوراً كل الفرص "
    "المفتوحة المطابقة، وبعدها كل جديد أولاً بأول. مجاناً."
)
BTN_LATEST = "📋 آخر الفرص"
BTN_PREFS = "⚙️ تعديل تفضيلاتي"
MAIN_KB = {"keyboard": [[{"text": BTN_LATEST}, {"text": BTN_PREFS}]],
           "resize_keyboard": True, "is_persistent": True}


def cities_kb(selected):
    rows, row = [], []
    for c in CITIES:
        mark = "✅ " if c in selected else ""
        row.append({"text": mark + c, "callback_data": f"c:{c}"})
        if len(row) == 3:
            rows.append(row)
            row = []
    if row:
        rows.append(row)
    all_mark = "✅ " if not selected else ""
    wb_mark = "✅ " if set(WB_ALL) <= set(selected) else ""
    rows.append([{"text": f"{all_mark}🌍 كل المدن", "callback_data": "c:*"},
                 {"text": f"{wb_mark}⛰ كل الضفة", "callback_data": "c:wb"}])
    return rows


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
    all_mark = "✅ " if not selected else ""
    rows.append([{"text": f"{all_mark}🌍 كل القطاعات", "callback_data": "s:*"}])
    return rows


def fmt_item(it):
    days = ""
    if it.get("deadline"):
        d = it["deadline"].split("-")  # YYYY-MM-DD → DD/MM/YYYY
        days = f"\n⏰ آخر موعد: {d[2]}/{d[1]}/{d[0]}"
    org = it.get("org") or f"عبر {it['source']}"
    city = " · " + "، ".join(it["cities"]) if it.get("cities") else ""
    return (f"📌 <b>{it['title']}</b>\n"
            f"🏢 {org}{city}\n"
            f"🏷 {it['sector']}{days}\n"
            f'🔗 <a href="{it["url"]}">رابط المصدر للتقديم</a>')


def matches(sub, it):
    if sub.get("cities") and it.get("cities"):
        if not set(sub["cities"]) & set(it["cities"]):
            return False
    if sub.get("sectors") and it["sector"] not in sub["sectors"]:
        return False
    return True


def open_matching(sub, limit=None):
    """الفرص المفتوحة (غير المنتهية) المطابقة لتفضيلات المشترك."""
    if not DATA.exists():
        return []
    today = time.strftime("%Y-%m-%d")
    items = json.loads(DATA.read_text(encoding="utf-8"))["items"]
    out = [it for it in items
           if not (it.get("deadline") and it["deadline"] < today)
           and matches(sub, it)]
    out.sort(key=lambda x: x.get("deadline") or "9999")
    return out[:limit] if limit else out


def prefs_line(sub):
    cities = "، ".join(sub["cities"]) if sub.get("cities") else "كل المدن"
    sectors = "، ".join(sub["sectors"]) if sub.get("sectors") else "كل القطاعات"
    return f"📍 {cities}\n🏷 {sectors}"


def send_batch(chat, items, header):
    tg.send(chat, header)
    for it in items:  # كل فرصة برسالة مستقلة
        tg.send(chat, fmt_item(it))
        time.sleep(0.7)  # ضمن حدود المعدل لكل محادثة


def start_prefs(chat, sub):
    tg.send(chat, "1️⃣ اختر مدنك (أكثر من وحدة عادي):", cities_kb(sub["cities"]))
    tg.send(chat, "بعد ما تخلص اختيار مدنك، اضغط هون 👇",
            [[{"text": "✔️ التالي: اختيار القطاعات", "callback_data": "cities_done"}]])


def handle_message(subs, msg):
    chat = msg["chat"]["id"]
    sub = store.get_sub(subs, chat)
    sub.setdefault("cities", [])
    text = (msg.get("text") or "").strip()
    if text.startswith("/start") or text == BTN_PREFS:
        if text.startswith("/start"):
            tg.call("sendMessage", chat_id=chat, text=WELCOME, parse_mode="HTML",
                    reply_markup=MAIN_KB)
        start_prefs(chat, sub)
    elif text.startswith("/stop"):
        sub["active"] = False
        tg.send(chat, "وقّفنا التنبيهات. رجعها بأي وقت بـ /start 👋")
    else:  # BTN_LATEST أو أي رسالة أخرى
        items = open_matching(sub, limit=10)
        if items:
            send_batch(chat, items, f"آخر الفرص المطابقة لتفضيلاتك:\n{prefs_line(sub)}")
        else:
            tg.send(chat, "ما في فرص مفتوحة مطابقة حالياً — أول ما يصدر جديد بيوصلك ⚡")
    store.save_subs(subs)


def handle_callback(subs, cb):
    chat = cb["message"]["chat"]["id"]
    mid = cb["message"]["message_id"]
    sub = store.get_sub(subs, chat)
    sub.setdefault("cities", [])
    data = cb["data"]
    if data.startswith("c:"):
        c = data[2:]
        if c == "*":
            sub["cities"] = []
        elif c == "wb":
            if set(WB_ALL) <= set(sub["cities"]):
                sub["cities"] = [x for x in sub["cities"] if x not in WB_ALL]
            else:
                sub["cities"] = list(dict.fromkeys(sub["cities"] + WB_ALL))
        elif c in sub["cities"]:
            sub["cities"].remove(c)
        else:
            sub["cities"].append(c)
        tg.answer_callback(cb["id"])
        tg.edit_markup(chat, mid, cities_kb(sub["cities"]))
    elif data == "cities_done":
        tg.answer_callback(cb["id"])
        tg.send(chat, "2️⃣ اختر قطاعاتك (أكثر من واحد عادي):", sectors_kb(sub["sectors"]))
        tg.send(chat, "بعد ما تخلص اختيار قطاعاتك، اضغط هون 👇",
                [[{"text": "🔔 فعّل تنبيهاتي الآن", "callback_data": "done"}]])
    elif data.startswith("s:"):
        s = data[2:]
        if s == "*":
            sub["sectors"] = []
        elif s in sub["sectors"]:
            sub["sectors"].remove(s)
        else:
            sub["sectors"].append(s)
        tg.answer_callback(cb["id"])
        tg.edit_markup(chat, mid, sectors_kb(sub["sectors"]))
    elif data == "done":
        sub["active"] = True
        tg.answer_callback(cb["id"], "تم ✅")
        tg.send(chat, f"تمام! 🎉 تنبيهاتك مفعّلة:\n{prefs_line(sub)}\n\n"
                      f"غيّر تفضيلاتك بأي وقت من زر «{BTN_PREFS}» تحت 👇")
        items = open_matching(sub)
        if items:
            send_batch(chat, items,
                       f"وهاي كل الفرص المفتوحة حالياً المطابقة لاختيارك ({len(items)}) — "
                       f"من هلأ الجديد بيوصلك أولاً بأول:")
        else:
            tg.send(chat, "ما في فرص مفتوحة مطابقة هاللحظة — أول جديد بيوصلك فوراً ⚡")
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
