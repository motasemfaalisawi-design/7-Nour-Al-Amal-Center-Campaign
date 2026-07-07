# -*- coding: utf-8 -*-
"""تخزين المشتركين وحالة التنبيهات — ملفات JSON بسيطة (كافية للمرحلة 1)."""
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
SUBS = DATA_DIR / "subscribers.json"
SENT = DATA_DIR / "notified_ids.json"


def load_subs():
    if SUBS.exists():
        return json.loads(SUBS.read_text(encoding="utf-8"))
    return {}


def save_subs(subs):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    SUBS.write_text(json.dumps(subs, ensure_ascii=False, indent=1), encoding="utf-8")


def get_sub(subs, chat_id):
    return subs.setdefault(str(chat_id), {"region": "gaza", "sectors": [], "active": True})


def load_sent():
    if SENT.exists():
        return set(json.loads(SENT.read_text(encoding="utf-8")))
    return set()


def save_sent(ids):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    SENT.write_text(json.dumps(sorted(ids), ensure_ascii=False), encoding="utf-8")
