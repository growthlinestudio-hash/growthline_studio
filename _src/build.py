#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Growthline — générateur du site statique.

Usage :  python _src/build.py            (depuis la racine du dépôt)

Ce script :
  1. optimise les images (variantes WebP responsives dans images/opt/),
  2. assemble et minifie le CSS  -> assets/css/site.min.css
  3. assemble et minifie le JS   -> assets/js/site.min.js (GSAP + ScrollTrigger + SplitText + code du site)
  4. écrit les pages HTML (index, services, realisations, a-propos, contact,
     growthline-intelligence, outil-audit, mentions-legales) et sitemap.xml.

Le contenu des pages est dans _src/pages.py ; les éléments communs (en-tête, pied de page,
icônes) sont dans ce fichier. Les mentions légales gardent leur texte d'origine (_src/legal-main.html).
Les pages générées sont committées : le site reste un simple dossier statique.
"""
import hashlib, json, os, re, subprocess, sys, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "_src"
sys.path.insert(0, str(SRC))

SITE = "https://growthlineagency.fr"
PHONE_HUMAN = "07 63 88 39 51"
PHONE_TEL = "+33763883951"
EMAIL = "growthline.studio@gmail.com"

# --------------------------------------------------------------------------- icônes
def svg(inner, cls="", fill="none", sw="2"):
    c = f' class="{cls}"' if cls else ""
    return (f'<svg{c} viewBox="0 0 24 24" fill="{fill}" stroke="currentColor" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">{inner}</svg>')

ICON_PATHS = {
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "arrow-left": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "phone": '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    "mail": '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 6L2 7"/>',
    "play": '<path d="M8 5.5v13a1 1 0 0 0 1.52.85l10.5-6.5a1 1 0 0 0 0-1.7l-10.5-6.5A1 1 0 0 0 8 5.5z" fill="currentColor" stroke="none"/>',
    "search": '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "zap": '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    "gauge": '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    "shield": '<path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4z"/><path d="m9 12 2 2 4-4"/>',
    "target": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    "pin": '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    "layout": '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/>',
    "sparkles": '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M17 5h4"/>',
    "wrench": '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
    "trend": '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    "message": '<path d="M4 4h16v12H7l-3 3V4z"/><path d="M8 9h8M8 12h5"/>',
    "chevron": '<path d="M6 9l6 6 6-6"/>',
    "info": '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
    "expand": '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
    "x": '<path d="M6 6l12 12M18 6 6 18"/>',
    "fs": '<path data-fs-icon d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
    "chart": '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    "eye": '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    "code": '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    "card": '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
    "wifi": '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01"/>',
    "pen": '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    "lock": '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    "sliders": '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    "heart": '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    "link": '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    "alert": '<path d="M12 2 2 21h20L12 2z"/><path d="M12 9v5M12 17h.01"/>',
    "star": '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
}

def icon(name, cls="", **kw):
    return svg(ICON_PATHS[name], cls, **kw)

SOCIAL = json.load(open(SRC / "social-svgs.json", encoding="utf-8"))

# --------------------------------------------------------------------------- images
IMG_OPT = ROOT / "images" / "opt"
_img_cache = {}

def optimize(src_rel, widths, q=80):
    """Crée images/opt/<nom>-<largeur>.webp ; renvoie ([(largeur, chemin)], (w, h) d'origine)."""
    from PIL import Image
    key = (src_rel, tuple(widths))
    if key in _img_cache:
        return _img_cache[key]
    src = ROOT / src_rel
    IMG_OPT.mkdir(parents=True, exist_ok=True)
    im = Image.open(src)
    ow, oh = im.size
    out = []
    for w in widths:
        w = min(w, ow)
        dst = IMG_OPT / f"{src.stem}-{w}.webp"
        if not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime:
            h = round(oh * w / ow)
            r = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB").resize((w, h), Image.LANCZOS)
            r.save(dst, "WEBP", quality=q, method=6)
        out.append((w, f"images/opt/{dst.name}"))
    _img_cache[key] = (out, (ow, oh))
    return _img_cache[key]

def pic(src_rel, alt, widths=(640, 1280), sizes="100vw", cls="", loading="lazy", fetchpriority=None, dims=None):
    """<picture> WebP responsive avec repli sur l'image d'origine."""
    variants, (ow, oh) = optimize(src_rel, widths)
    srcset = ", ".join(f"{p} {w}w" for w, p in variants)
    w, h = dims or (ow, oh)
    c = f' class="{cls}"' if cls else ""
    fp = f' fetchpriority="{fetchpriority}"' if fetchpriority else ""
    return (f'<picture><source type="image/webp" srcset="{srcset}" sizes="{sizes}">'
            f'<img{c} src="{src_rel}" alt="{alt}" width="{w}" height="{h}" loading="{loading}" decoding="async"{fp}></picture>')

# --------------------------------------------------------------------------- CSS / JS
def minify_css(css):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*([{};,>])\s*", r"\1", css)
    css = re.sub(r";}", "}", css)
    css = re.sub(r":\s+", ":", css)
    return css.strip()

def build_assets():
    css = "\n".join((SRC / "css" / f).read_text(encoding="utf-8") for f in sorted(os.listdir(SRC / "css")) if f.endswith(".css"))
    (ROOT / "assets" / "css").mkdir(parents=True, exist_ok=True)
    (ROOT / "assets" / "css" / "site.css").write_text(css, encoding="utf-8")     # version lisible (débogage)
    mini = minify_css(css)
    (ROOT / "assets" / "css" / "site.min.css").write_text(mini, encoding="utf-8")
    # JS : vendeurs (déjà minifiés) + code du site (minifié si esbuild est disponible)
    parts = []
    for v in ("gsap.min.js", "ScrollTrigger.min.js", "SplitText.min.js", "lenis.min.js"):
        parts.append((ROOT / "assets" / "vendor" / v).read_text(encoding="utf-8"))
    own = []
    for f in ("cloud-shader.js", "core.js", "ascent.js", "motion.js", "motion2.js", "motion3.js"):
        own.append((SRC / "js" / f).read_text(encoding="utf-8"))
    own_js = "\n;\n".join(own)
    esbuild = shutil.which("esbuild") or os.environ.get("ESBUILD")
    if esbuild:
        try:
            r = subprocess.run([esbuild, "--minify", "--target=es2017"], input=own_js, capture_output=True, text=True, encoding="utf-8", check=True)
            own_js = r.stdout
        except Exception as e:  # repli : JS non minifié
            print("esbuild a échoué, JS du site non minifié :", e)
    (ROOT / "assets" / "js").mkdir(parents=True, exist_ok=True)
    bundle = "\n;\n".join(parts) + "\n;\n" + own_js
    (ROOT / "assets" / "js" / "site.min.js").write_text(bundle, encoding="utf-8")
    h = lambda t: hashlib.md5(t.encode("utf-8")).hexdigest()[:8]
    return h(mini), h(bundle)

# --------------------------------------------------------------------------- squelette de page
NAV = [("services.html", "Services"), ("realisations.html", "Réalisations"), ("index.html#processus", "Processus"),
       ("sous-traitance.html", "Sous-traitance"), ("a-propos.html", "À propos"), ("index.html#faq", "FAQ"), ("contact.html", "Contact")]

HEAD_SCRIPT = ("<script>(function(d){var r=d.documentElement;r.classList.remove('no-js');var m=false;"
               "try{m=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}"
               "if(!m){r.classList.add('anim');var s=navigator.webdriver===true;try{s=s||sessionStorage.getItem('glIntro')}catch(e){}"
               "if(!s){r.classList.add('has-intro');try{sessionStorage.setItem('glIntro','1')}catch(e){}}"
               "else{var n=false;try{n=sessionStorage.getItem('glNav')==='1';sessionStorage.removeItem('glNav')}catch(e){}if(n)r.classList.add('nav-in')}"
               "setTimeout(function(){if(!window.__glAnimReady){r.classList.add('anim-failed');r.classList.remove('has-intro','nav-in')}},4500)}})(document)</script>")

def header_html(current):
    links = "".join(f'<a href="{h}">{t}</a>' for h, t in NAV)
    mlinks = "".join(f'<a href="{h}">{t} <span>{i+1:02d}</span></a>' for i, (h, t) in enumerate([("index.html", "Accueil")] + NAV))
    return f'''<a class="skip-link" href="#main">Aller au contenu</a>
<div class="curtain" aria-hidden="true"></div>
<div id="intro" class="intro" role="presentation">
  <div class="intro-cloud intro-cloud--l"></div><div class="intro-cloud intro-cloud--r"></div>
  <div class="intro-core">
    <div class="intro-mark"><span class="intro-ring"></span><img src="images/logo-growthline-pastel-icon.png" alt="" width="104" height="96"></div>
    <div class="intro-word" aria-hidden="true">Growthline</div>
    <p class="intro-tag">Mesurer, puis corriger ce qui compte.</p>
    <div class="intro-meter"><div class="intro-bar"><span></span></div><span class="intro-count">00 %</span></div>
  </div>
  <button type="button" class="intro-skip">Passer l'intro</button>
</div>
<div class="scroll-progress" aria-hidden="true"><span></span></div>
<div class="grain" aria-hidden="true"></div>
<header class="site-header">
  <div class="nav-inner">
    <a href="index.html" class="brand" aria-label="Growthline — accueil">
      <span class="mark"><img src="images/logo-growthline-pastel-icon.png" alt="" width="38" height="35"></span>
      <span class="brand-word">Growthline</span>
    </a>
    <nav class="main-nav" aria-label="Navigation principale">{links}</nav>
    <div class="nav-right">
      <a href="tel:{PHONE_TEL}" class="nav-phone" aria-label="Appeler Growthline au {PHONE_HUMAN}">{icon("phone")}<span>{PHONE_HUMAN}</span></a>
      <a href="index.html#audit" class="btn btn-solid btn-sm nav-cta" data-magnetic>Démarrer un audit</a>
      <button class="menu-toggle" id="menuToggle" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mobileMenu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="mobile-menu" id="mobileMenu">
  <nav class="mobile-menu-links" aria-label="Navigation mobile">{mlinks}</nav>
  <div class="mobile-menu-foot">
    <a href="index.html#audit" class="btn btn-solid btn-lg">Démarrer un audit gratuit</a>
    <div class="meta-row"><span>{EMAIL}</span><span>© 2026</span></div>
  </div>
</div>'''

def footer_html():
    soc = [("https://www.tiktok.com/@velora.studio.official0", "Growthline sur TikTok", SOCIAL[0]),
           ("https://www.facebook.com/profile.php?id=61593355891078&amp;locale=fr_FR", "Growthline sur Facebook", SOCIAL[1]),
           ("https://www.linkedin.com/in/growthline-undefined-96ba26429/", "Growthline sur LinkedIn", SOCIAL[2])]
    socials = "".join(f'<a href="{u}" target="_blank" rel="noopener noreferrer" aria-label="{l}">{s}</a>' for u, l, s in soc)
    return f'''<footer class="site-footer">
  <div class="container">
    <div class="footer-cta">
      <span class="eyebrow eyebrow--dark">Vous avez un projet ?</span>
      <h2 class="display-2" data-split>Prêt à monter <em>au septième ciel</em> ?</h2>
      <div class="hero-ctas">
        <a href="index.html#audit" class="btn btn-sun btn-lg" data-magnetic>Audit gratuit {icon("arrow", "arrow")}</a>
        <a href="contact.html" class="btn btn-ghost-light btn-lg" data-magnetic>Nous écrire</a>
      </div>
    </div>
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="index.html" class="brand"><span class="mark"><img src="images/logo-growthline-pastel-icon.png" alt="" width="38" height="35"></span> Growthline</a>
        <p>Agence digitale : audit de présence en ligne, corrections ciblées et refontes de sites, orientées performance et conversion.</p>
      </div>
      <div><h3>Navigation</h3><ul>
        <li><a href="services.html">Services</a></li><li><a href="realisations.html">Réalisations</a></li>
        <li><a href="sous-traitance.html">Sous-traitance</a></li><li><a href="a-propos.html">À propos</a></li><li><a href="contact.html">Contact</a></li></ul></div>
      <div><h3>Ressources</h3><ul>
        <li><a href="index.html#faq">Questions fréquentes</a></li><li><a href="growthline-intelligence.html">Démo Growthline Intelligence™</a></li>
        <li><a href="services.html#tarifs">Tarifs</a></li><li><a href="mentions-legales.html">Mentions légales</a></li></ul></div>
      <div><h3>Contact</h3><ul>
        <li><a href="tel:{PHONE_TEL}">{PHONE_HUMAN}</a></li><li><a href="mailto:{EMAIL}">{EMAIL}</a></li><li>Marseille, France</li></ul></div>
    </div>
    <div class="footer-bottom">
      <div class="footer-meta-group"><span>© 2026 Growthline. Tous droits réservés.</span><a href="mentions-legales.html">Mentions légales</a></div>
      <div class="footer-social">{socials}</div>
    </div>
  </div>
  <div class="footer-word" aria-hidden="true">Growthline</div>
</footer>'''

def page(name, title, desc, body, current=None, robots=None, extra_ld="", extra_js=(), og_image=None, preload=""):
    css_v, js_v = VERS
    url = f"{SITE}/" if name == "index.html" else f"{SITE}/{name}"
    og = og_image or f"{SITE}/og-image.png"
    robots_meta = f'<meta name="robots" content="{robots}">\n' if robots else ""
    scripts = "".join(f'<script src="{s}" defer></script>\n' for s in extra_js)
    return f'''<!DOCTYPE html>
<html lang="fr" class="no-js">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{HEAD_SCRIPT}
<title>{title}</title>
<meta name="description" content="{desc}">
{robots_meta}<meta name="theme-color" content="#4f93dd">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Growthline">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{og}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{og}">
<link rel="icon" type="image/png" href="images/logo-growthline-pastel-icon.png">
<link rel="apple-touch-icon" href="images/logo-growthline-pastel-icon.png">
<link rel="preload" href="assets/fonts/bricolage-grotesque-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/inter-tight-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
{preload}<link rel="stylesheet" href="assets/css/site.min.css?v={css_v}">
{extra_ld}</head>
<body>
{header_html(current)}
<main id="main">
{body}
</main>
{footer_html()}
<script src="assets/js/site.min.js?v={js_v}" defer></script>
{scripts}</body>
</html>
'''

def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False) + '</script>\n'

# --------------------------------------------------------------------------- main
VERS = ("0", "0")

def main():
    global VERS
    VERS = build_assets()
    import pages
    out = pages.render_all(sys.modules[__name__])
    for fname, html in out.items():
        (ROOT / fname).write_text(html, encoding="utf-8", newline="\n")
        print("écrit", fname, len(html) // 1024, "Ko")
    # sitemap
    urls = [("", "1.0", "weekly"), ("services.html", "0.8", "monthly"), ("realisations.html", "0.8", "monthly"),
            ("sous-traitance.html", "0.6", "monthly"), ("a-propos.html", "0.6", "monthly"), ("contact.html", "0.7", "monthly"), ("growthline-intelligence.html", "0.5", "monthly")]
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u, p, f in urls:
        sm.append(f"  <url>\n    <loc>{SITE}/{u}</loc>\n    <changefreq>{f}</changefreq>\n    <priority>{p}</priority>\n  </url>")
    sm.append("</urlset>\n")
    (ROOT / "sitemap.xml").write_text("\n".join(sm), encoding="utf-8")
    print("CSS", VERS[0], "JS", VERS[1])

if __name__ == "__main__":
    main()
