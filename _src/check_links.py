#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Vérifie que chaque lien interne, image, script, feuille de style et ancre existe (python _src/check_links.py)."""
import re, sys
from pathlib import Path
from urllib.parse import urlparse, unquote
ROOT = Path(__file__).resolve().parent.parent
pages = sorted(ROOT.glob("*.html"))
pages = [p for p in pages if "Copie" not in p.name]
ids = {p.name: set(re.findall(r'\sid="([^"]+)"', p.read_text(encoding="utf-8"))) for p in pages}
bad = 0
for p in pages:
    html = p.read_text(encoding="utf-8")
    for attr, val in re.findall(r'\s(href|src|srcset|poster|data-img)="([^"]+)"', html):
        cands = [v.strip().split(" ")[0] for v in val.split(",")] if attr == "srcset" else [val]
        for v in cands:
            if v.startswith(("http:", "https:", "mailto:", "tel:", "data:", "javascript:", "#")) and not v.startswith("#"):
                continue
            if v.startswith("#"):
                if v != "#" and v[1:] not in ids[p.name]:
                    print(f"{p.name}: ancre introuvable {v}"); bad += 1
                continue
            u = urlparse(v); path = unquote(u.path)
            if not path: continue
            target = ROOT / path
            if not target.exists():
                print(f"{p.name}: fichier introuvable {v}"); bad += 1
            elif u.fragment and target.suffix == ".html" and u.fragment not in ids.get(target.name, set()):
                print(f"{p.name}: ancre introuvable {v}"); bad += 1
print("OK : aucun lien cassé" if not bad else f"{bad} problème(s)")
sys.exit(1 if bad else 0)
