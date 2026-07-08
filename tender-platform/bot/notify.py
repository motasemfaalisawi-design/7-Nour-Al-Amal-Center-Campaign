# -*- coding: utf-8 -*-
"""مرسل التنبيهات: يقارن أحدث جمع بما أُرسل سابقاً ويبلّغ المشتركين المطابقين.

التشغيل (بعد scraper/run.py): TG_TOKEN=xxx python3 bot/notify.py
اختياري: TG_CHANNEL=@TawreedGaza لبث كل جديد غزة للقناة العامة.
"""
import json
import os
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import tg  # noqa: E402
import store  # noqa: E402
from bot import fmt_item  # noqa: E402

DATA = Path(__file__).parent.parent / "data" / "tenders.json"
CHANNEL = os.environ.get("TG_CHANNEL", "")


from bot import matches as _prefs_match  # noqa: E402


def matches(sub, it):
    return bool(sub.get("active")) and _prefs_match(sub, it)


def main():
    if not tg.TOKEN:
        sys.exit("ضع التوكن في متغير البيئة TG_TOKEN")
    items = json.loads(DATA.read_text(encoding="utf-8"))["items"]
    sent = store.load_sent()
    today = time.strftime("%Y-%m-%d")
    new = [it for it in items
           if it["id"] not in sent
           and not (it.get("deadline") and it["deadline"] < today)]
    if not new:
        print("no new items")
        return
    subs = store.load_subs()
    delivered = 0
    for it in new:
        text = "⚡ <b>فرصة جديدة</b>\n\n" + fmt_item(it)
        if CHANNEL and it["region"] == "gaza":
            try:
                tg.send(CHANNEL, text)
                time.sleep(1)
            except Exception as e:
                print(f"channel ERR: {e}", file=sys.stderr)
        for chat_id, sub in subs.items():
            if matches(sub, it):
                try:
                    tg.send(chat_id, text)
                    delivered += 1
                    time.sleep(0.05)  # ضمن حدود المعدل
                except Exception as e:
                    print(f"user {chat_id} ERR: {e}", file=sys.stderr)
        sent.add(it["id"])
    store.save_sent(sent)
    print(f"{len(new)} new items, {delivered} personal alerts delivered")


if __name__ == "__main__":
    main()
