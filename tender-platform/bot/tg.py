# -*- coding: utf-8 -*-
"""طبقة رقيقة فوق Telegram Bot API — بدون مكتبات خارجية (urllib فقط)."""
import json
import os
import urllib.parse
import urllib.request

TOKEN = os.environ.get("TG_TOKEN", "")
API = f"https://api.telegram.org/bot{TOKEN}"


def call(method, **params):
    """ينفذ استدعاء API ويعيد result (أو يرمي استثناء بوصف الخطأ)."""
    clean = {}
    for k, v in params.items():
        if v is None:
            continue
        clean[k] = json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list)) else v
    data = urllib.parse.urlencode(clean).encode()
    req = urllib.request.Request(f"{API}/{method}", data=data)
    with urllib.request.urlopen(req, timeout=35) as r:
        out = json.loads(r.read().decode())
    if not out.get("ok"):
        raise RuntimeError(f"{method}: {out}")
    return out["result"]


def send(chat_id, text, keyboard=None):
    return call("sendMessage", chat_id=chat_id, text=text, parse_mode="HTML",
                disable_web_page_preview=True,
                reply_markup={"inline_keyboard": keyboard} if keyboard else None)


def answer_callback(cb_id, text=None):
    return call("answerCallbackQuery", callback_query_id=cb_id, text=text)


def edit_markup(chat_id, message_id, keyboard):
    return call("editMessageReplyMarkup", chat_id=chat_id, message_id=message_id,
                reply_markup={"inline_keyboard": keyboard})


def get_updates(offset=None, timeout=30):
    return call("getUpdates", offset=offset, timeout=timeout,
                allowed_updates=["message", "callback_query"])
