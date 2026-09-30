#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Перевод однострочных /* ... */ комментариев на русский (с ручными правками качества)."""
import os, re

MAP = {
    "Groups": "Группы",
    "Mostvisited related": "Связано с «часто посещаемыми»",
    "something misc": "Разное",
    "Utility functions": "Вспомогательные функции",
    "handles to the dom nodes": "ссылки на DOM-узлы",
    "Serve horizontal and vertical scrolling types for thumbs modes":
        "Поддержка горизонтальной и вертикальной прокрутки в режимах миниатюр",
    "TODO new search functions - monitor": "TODO новые функции поиска - наблюдение",
    "styling": "стили",
    "sd related": "связано со SpeedDial",
    "recentlyclosed related": "связано с недавно закрытыми",
    "Misc": "Разное",
    "In new tab": "На новой вкладке",
    "ID of the search <input tag   >": None,  # обрабатывается отдельно ниже
    "from zero": "с нуля",
}

REPLACEMENTS = [
    # (файл, старая подстрока, новая подстрока)
    ("js/newtab/scrolling.js", "/* Serve horizontal and vertical scrolling types for thumbs modes */",
     "/* Поддержка горизонтальной и вертикальной прокрутки в режимах миниатюр */"),
    ("js/newtab/dialogs/simple-dialog.js", "/* Utility functions */", "/* Вспомогательные функции */"),
    ("js/newtab/dialogs/simple-dialog.js", "/* handles to the dom nodes */", "/* ссылки на DOM-узлы */"),
    ("js/newtab/autocompleteplus.js", "/* ID of the search <input tag   */", "/* ID поля поиска <input>   */"),
    ("js/newtab/autocompleteplus.js", "/* ID of the search form         */", "/* ID формы поиска         */"),
    ("js/newtab/search.js", "/* TODO new search functions - monitor */", "/* TODO новые функции поиска - наблюдение */"),
    ("js/prefs.js", "/* styling */", "/* стили */"),
    ("js/prefs.js", "/* sd related */", "/* связано со SpeedDial */"),
    ("js/prefs.js", "/* recentlyclosed related */", "/* связано с недавно закрытыми */"),
    ("js/prefs.js", "/* Misc */", "/* Разное */"),
    ("js/prefs.js", "/* In new tab */", "/* На новой вкладке */"),
    ("js/newtab/speeddial.js", "/* Groups */", "/* Группы */"),
    ("js/newtab/speeddial.js", "/* Mostvisited related */", "/* Связано с «часто посещаемыми» */"),
    ("js/newtab/speeddial.js", "/* something misc */", "/* Разное */"),
    ("js/storage.js", "/* Groups */", "/* Группы */"),
    ("js/options/roller.js", "/* from zero */", "/* отсчёт с нуля */"),
    ("js/utils.js", """/* sometimes the returned value does not have
            * the 6 digits needed, so we do it again until
            * it does
            */""",
     """/* иногда возвращаемое значение содержит меньше
            * нужных 6 цифр, поэтому повторяем, пока не повезёт
            */"""),
    ("js/utils.js", """/* if (red*0.299 + green*0.587 + blue*0.114) > 180
        * use #000000 else use #ffffff
        */""",
     """/* если (red*0.299 + green*0.587 + blue*0.114) > 180 —
        * использовать #000000, иначе #ffffff
        */"""),
]

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)
done = set()
for path, old, new in REPLACEMENTS:
    src = open(path, encoding="utf-8").read()
    if old in src:
        src = src.replace(old, new)
        open(path, "w", encoding="utf-8").write(src)
        done.add((path, old[:40]))
        print(f"OK   {path}: {old[:60]}")
    elif (path, old[:40]) not in done:
        print(f"MISS {path}: {old[:60]!r}")
