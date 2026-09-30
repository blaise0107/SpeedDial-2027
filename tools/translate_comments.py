#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Перевод одиночных комментариев (//) в JS/HTML файлах проекта на русский язык.

Использует бесплатный эндпоинт translate.googleapis.com с пакетным переводом,
кэшированием и устойчивостью к сетевым ошибкам.

Исключения: js/_external/**, js/colorpicker/**, minified-файлы (*.min.js).

Запуск:  python3 tools/translate_comments.py [--dry-run] [путь ...]
"""

import argparse
import json
import os
import re
import sys
import time

import requests

API = "https://translate.googleapis.com/translate_a/single"
SEP = "\n\u0001\n"          # разделитель строк внутри пакета
CACHE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "translation_cache.json")

# Папки, которые НЕ трогаем
EXCLUDE_DIRS = {"_external", "colorpicker", ".git", "node_modules", "tools"}
EXCLUDE_SUFFIX = (".min.js",)

LINE_RE = re.compile(r'^(\s*)//(.*)$')


def is_translatable(text):
    """Комментарий подлежит переводу, если содержит латиницу."""
    t = text.strip()
    if not t:
        return False
    if not re.search(r'[A-Za-z]', t):
        return False
    low = t.lower()
    for prefix in ("jshint", "eslint", "globals ", "global ", "jslint",
                   "sourceMappingURL", "#!"):
        if low.startswith(prefix):
            return False
    return True


def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_cache(cache):
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False)


def google_batch(texts, retries=4):
    """Пакетный перевод списка строк en->ru. Возвращает список переводов."""
    payload = SEP.join(texts)
    for attempt in range(retries):
        try:
            r = requests.get(API, params={
                "client": "gtx", "sl": "en", "tl": "ru", "dt": "t", "q": payload
            }, timeout=25)
            if r.status_code == 429:
                time.sleep(2 + attempt * 3)
                continue
            r.raise_for_status()
            data = r.json()[0]
            out = []
            for chunk in data:
                if chunk is None or len(chunk) < 2 or chunk[0] is None:
                    out.append("")
                else:
                    out.append(chunk[0])
            joined = "".join(out)
            parts = joined.split(SEP)
            if len(parts) != len(texts):
                return list(texts)  # не совпало — оставляем как есть
            return [p.strip() if p.strip() else src for p, src in zip(parts, texts)]
        except Exception as e:
            sys.stderr.write(f"[warn] batch error: {e}; retrying\n")
            time.sleep(2 + attempt * 2)
    return list(texts)  # не удалось — оставляем как есть


def translate_pending(todo, cache):
    """Переводит все уникальные тексты из todo, пополняя cache."""
    need = []
    seen = set()
    for _, _, _, txt in todo:
        if txt not in cache and txt not in seen:
            seen.add(txt)
            need.append(txt)

    BATCH_LINES = 40
    BATCH_CHARS = 1600
    i = 0
    while i < len(need):
        batch = []
        chars = 0
        j = i
        while j < len(need) and len(batch) < BATCH_LINES and (chars == 0 or chars + len(need[j]) + 2 <= BATCH_CHARS):
            batch.append(need[j])
            chars += len(need[j]) + 2
            j += 1
        tr = google_batch(batch)
        for src, dst in zip(batch, tr):
            cache[src] = dst
        i = j
        time.sleep(0.3)


def process_file(path, cache, dry_run=False):
    with open(path, encoding="utf-8", errors="replace") as f:
        lines = f.readlines()

    todo = []   # (line_idx, indent, lead_ws, text_to_translate)
    for i, line in enumerate(lines):
        m = LINE_RE.match(line.rstrip("\n"))
        if not m:
            continue
        indent, body = m.group(1), m.group(2)
        stripped = body.lstrip()
        lead = body[:len(body) - len(stripped)]
        txt = stripped
        if not txt:
            continue
        # пропускаем декоративные разделители вида ====, ----, ***
        if re.fullmatch(r'[-=*_.~]{3,}', txt):
            continue
        if not is_translatable(txt):
            continue
        todo.append((i, indent, lead, txt))

    if not todo:
        return 0

    translate_pending(todo, cache)

    changed = 0
    for idx, indent, lead, txt in todo:
        ru = cache.get(txt, txt)
        if ru == txt:
            continue
        new_line = f"{indent}//{lead}{ru}\n"
        if lines[idx] != new_line:
            lines[idx] = new_line
            changed += 1

    if changed and not dry_run:
        with open(path, "w", encoding="utf-8") as f:
            f.writelines(lines)
    return changed


def iter_files(paths):
    for root in paths:
        if os.path.isfile(root):
            yield root
            continue
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
            for fn in sorted(filenames):
                if fn.endswith((".js", ".html")) and not fn.endswith(EXCLUDE_SUFFIX):
                    yield os.path.join(dirpath, fn)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("paths", nargs="*", default=["js"])
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)
    paths = args.paths or ["js"]

    cache = load_cache()
    total = 0
    files = list(iter_files(paths))
    for n, fp in enumerate(files, 1):
        c = process_file(fp, cache, args.dry_run)
        if c:
            print(f"{c:4d}  {fp}", flush=True)
            total += c
        if n % 5 == 0:
            save_cache(cache)
    save_cache(cache)
    print(f"\nИтого переведено комментариев: {total} (файлов обработано: {len(files)})")


if __name__ == "__main__":
    main()
