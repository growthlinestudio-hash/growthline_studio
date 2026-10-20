# -*- coding: utf-8 -*-
"""Vérifie le site généré : liens, ancres, images, doublons d'ID, titres/descriptions, alt, un seul h1, sitemap."""
import re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
pages = sorted(ROOT.glob("*.html"))
ids = {p.name: set(re.findall(r'\sid="([^"]+)"', p.read_text(encoding="utf-8"))) for p in pages}
errs = []
for p in pages:
    h = p.read_text(encoding="utf-8")
    n = p.name
    if len(re.findall(r"<h1[ >]", h)) != 1: errs.append(f"{n}: {len(re.findall('<h1[ >]', h))} h1")
    t = re.search(r"<title>(.*?)</title>", h)
    d = re.search(r'name="description" content="([^"]*)"', h)
    if not t or len(t.group(1)) > 70: errs.append(f"{n}: titre absent ou > 70 car. ({len(t.group(1)) if t else 0})")
    if not d or not 70 <= len(d.group(1)) <= 170: errs.append(f"{n}: description hors 70-170 car. ({len(d.group(1)) if d else 0})")
    for m in re.finditer(r"<img\b[^>]*>", h):
        if " alt=" not in m.group(0): errs.append(f"{n}: image sans alt")
        if " width=" not in m.group(0): errs.append(f"{n}: image sans dimensions")
    dup = [i for i in set(re.findall(r'\sid="([^"]+)"', h)) if len(re.findall(rf'\sid="{i}"', h)) > 1]
    if dup: errs.append(f"{n}: id dupliqués {dup}")
    for ref in re.findall(r'(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"', h) + re.findall(r'srcset="([^"]+)"', h):
        for r in [x.strip().split(" ")[0] for x in ref.split(",")]:
            if r.startswith(("http", "mailto:", "tel:", "data:")) or not r: continue
            if not (ROOT / r).exists(): errs.append(f"{n}: fichier manquant {r}")
    for page, anc in re.findall(r'href="([^"#]*)#([^"]+)"', h):
        tgt = page or n
        if tgt in ids and anc not in ids[tgt]: errs.append(f"{n}: ancre #{anc} introuvable dans {tgt}")
sm = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
for p in pages:
    noidx = 'content="noindex' in p.read_text(encoding="utf-8")
    inmap = p.name in sm or (p.name == "index.html" and "growthlineagency.fr/</loc>" in sm)
    if noidx and inmap: errs.append(f"{p.name}: noindex mais présent dans le sitemap")
    if not noidx and not inmap: errs.append(f"{p.name}: absent du sitemap")
print("\n".join(errs) if errs else f"OK : {len(pages)} pages, aucune erreur")
sys.exit(1 if errs else 0)
