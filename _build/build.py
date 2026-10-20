# -*- coding: utf-8 -*-
"""Générateur du site Growthline v4 (refonte à zéro, sobre et rapide).

    python _build/build.py          # écrit les pages, assets/, sitemap.xml à la racine
    python _build/check.py          # liens, images, ancres, SEO de base

Contenu : tout est repris des offres réelles (aperçu gratuit, analyse 99 €, corrections dès 450 €, refonte dès 890 €).
Aucune statistique, aucun client ni aucun avis inventé : les exemples sont étiquetés « illustratifs ».
Les tarifs de sous-traitance viennent de _build/tarifs_sous_traitance.json (aucun chiffre tant que tout vaut null).
"""
import json
import re
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SITE = "https://growthlineagency.fr"
PHONE_HUMAN = "07 63 88 39 51"
PHONE_TEL = "+33763883951"
EMAIL = "growthline.studio@gmail.com"
VERSION = "4"

ICONS = {
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "phone": '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    "mail": '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 6L2 7"/>',
    "pin": '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    "search": '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    "layout": '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/>',
    "wrench": '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
    "trend": '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    "shield": '<path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4z"/><path d="m9 12 2 2 4-4"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    "target": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    "message": '<path d="M4 4h16v12H7l-3 3V4z"/><path d="M8 9h8M8 12h5"/>',
    "info": '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
    "menu": '<path d="M4 7h16M4 12h16M4 17h16"/>',
    "card": '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
    "alert": '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/>',
    "spark": '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
}


def icon(name, cls=""):
    c = f' class="{cls}"' if cls else ""
    return (f'<svg{c} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
            f'stroke-linejoin="round" aria-hidden="true" focusable="false">{ICONS[name]}</svg>')


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s)


def pic(name, alt, sizes="(max-width: 620px) 92vw, 360px", eager=False):
    """Image WebP responsive (variantes déjà générées dans images/opt) avec repli JPG ; dimensions lues sur le fichier."""
    from PIL import Image
    base = f"images/opt/{name}"
    w640, w960 = f"{base}-640.webp", f"{base}-960.webp"
    with Image.open(ROOT / w960) as im:
        w, h = im.size
    load = '' if eager else ' loading="lazy" decoding="async"'
    return (f'<img src="{w960}" srcset="{w640} 640w, {w960} 960w" sizes="{sizes}" width="{w}" height="{h}" alt="{alt}"{load}>')


# ---------------------------------------------------------------- gabarit
NAV = [("services.html", "Services"), ("realisations.html", "Réalisations"), ("sous-traitance.html", "Sous-traitance"),
       ("a-propos.html", "À propos"), ("contact.html", "Contact")]


def page(fname, title, desc, body, ld="", noindex=False, og_type="website"):
    url = SITE + "/" + ("" if fname == "index.html" else fname)
    nav = "".join(f'<a href="{h}"{" aria-current=\"page\"" if h == fname else ""}>{t}</a>' for h, t in NAV)
    robots = '<meta name="robots" content="noindex, follow">\n' if noindex else ""
    full_title = title if title.startswith("Growthline") else f"{title} | Growthline"
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{full_title}</title>
<meta name="description" content="{desc}">
{robots}<link rel="canonical" href="{url}">
<meta name="theme-color" content="#F7F4EF">
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="Growthline">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="{full_title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="images/logo-growthline-pastel-icon.png" type="image/png">
<link rel="preload" href="assets/fonts/inter-tight.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/bricolage-grotesque.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/style.css?v={VERSION}">
{ld}</head>
<body>
<a class="skip" href="#main">Aller au contenu</a>
<header class="site-header">
  <div class="container bar">
    <a class="brand" href="index.html" aria-label="Growthline, accueil"><img src="images/logo-growthline-pastel-icon.png" width="34" height="31" alt="">Growthline</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menu">{icon("menu")}</button>
    <nav class="nav" id="nav" aria-label="Navigation principale">{nav}<a class="btn btn-solid" href="index.html#audit">Audit gratuit</a></nav>
  </div>
</header>
<main id="main">
{body}
</main>
<footer class="site-footer">
  <div class="container">
    <div class="foot">
      <div><strong style="color:#fff;font:700 1.1rem var(--font-d)">Growthline</strong>
        <p style="margin-top:8px;max-width:36ch">Création et refonte de sites web pour entreprises locales. Audit gratuit, paiement unique.</p></div>
      <div><h2>Navigation</h2><ul>{"".join(f'<li><a href="{h}">{t}</a></li>' for h, t in NAV)}</ul></div>
      <div><h2>Contact</h2><ul>
        <li><a href="tel:{PHONE_TEL}">{PHONE_HUMAN}</a></li>
        <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
        <li>Marseille, France</li></ul></div>
    </div>
    <div class="legal-line"><span>© 2026 Growthline</span><a href="mentions-legales.html">Mentions légales</a></div>
  </div>
</footer>
<script src="assets/site.js?v={VERSION}" defer></script>
</body>
</html>
'''


def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False) + "</script>\n"


def faq_block(items):
    rows = "".join(f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in items)
    data = ld({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": strip_tags(a)}} for q, a in items]})
    return f'<div class="faq">{rows}</div>', data


def head(eyebrow, h1, lede):
    return f'''<section class="page-head"><div class="container">
  <span class="eyebrow">{eyebrow}</span>
  <h1>{h1}</h1>
  <p class="lede">{lede}</p>
</div></section>'''


def cta_band(title, sub, primary=("index.html#audit", "Demander un audit gratuit"), secondary=("contact.html", "Nous écrire")):
    return f'''<section class="section dark"><div class="container"><div class="cta-band">
  <h2>{title}</h2><p>{sub}</p>
  <div class="cta-row" style="justify-content:center;margin:0">
    <a class="btn btn-solid" href="{primary[0]}">{primary[1]}</a>
    <a class="btn" href="{secondary[0]}">{secondary[1]}</a>
  </div>
  <a class="tel" href="tel:{PHONE_TEL}">{PHONE_HUMAN}</a>
</div></div></section>'''


def audit_form():
    return f'''<form class="form" data-mailto="{EMAIL}" data-subject="Demande d'audit gratuit" aria-label="Demander un audit gratuit">
  <label>Adresse de votre site<input name="site" data-label="Site" type="text" inputmode="url" autocomplete="url" placeholder="www.mon-entreprise.fr" required></label>
  <label>Votre email<input name="email" data-label="Email" type="email" autocomplete="email" placeholder="vous@exemple.fr" required></label>
  <button class="btn btn-solid btn-block" type="submit">Demander mon audit gratuit</button>
  <p class="hint">Réponse sous 24 h. Gratuit, sans engagement.</p>
</form>'''


FAQ_HOME = [
    ("Vos audits sont-ils automatisés ou réalisés par une vraie personne ?",
     "Manuels. Nos outils nous aident à collecter les données, mais chaque rapport est relu et priorisé par une personne avant de vous être envoyé."),
    ("Pourquoi un paiement unique plutôt qu'un abonnement ?",
     "Parce qu'un audit ou une correction a un début et une fin. Vous payez une fois, pour un résultat concret."),
    ("Travaillez-vous avec tous les secteurs d'activité ?",
     "Oui : commerces, artisans, professions de santé, associations, startups. La méthode (mesurer, puis corriger ce qui compte) s'applique à toute activité présente en ligne."),
    ("Combien de temps pour obtenir mon audit ?",
     "Jusqu'à 24 h. Vous envoyez votre demande par email, nous analysons votre site, puis vous recevez votre rapport dès qu'il est prêt."),
    ("Que se passe-t-il si mon site n'a presque aucun problème ?",
     "Alors on vous le dit. Vous repartez avec un rapport honnête plutôt qu'une liste de prétextes pour vendre une refonte."),
]
FAQ_SERVICES = [
    ("Quelle est la différence entre l'analyse de site et le service ponctuel ?",
     "L'analyse est un rapport complet en paiement unique : score détaillé, problèmes détectés, recommandations priorisées. Le service ponctuel va plus loin : nous corrigeons ou refaisons directement votre site, également en paiement unique."),
    ("Combien coûte l'analyse de site ?",
     "L'aperçu (score global et 3 problèmes détectés) est gratuit. Le rapport complet est disponible en paiement unique à 99 €, sans abonnement."),
    ("Combien de temps prend une correction ou une refonte ?",
     "Environ 5 jours ouvrés pour des corrections ciblées, 10 jours ouvrés pour une refonte complète. Les projets sur-mesure sont estimés au cas par cas."),
    ("Les prix affichés sont-ils fixes ?",
     f'Ce sont des points de départ adaptés à la majorité des projets. Si le vôtre sort du cadre standard, vous pouvez <a href="mailto:{EMAIL}?subject=Discuter%20du%20prix">discuter du prix</a> par email.'),
]


# ---------------------------------------------------------------- pages
def home():
    faq_html, faq_ld = faq_block(FAQ_HOME)
    ticks = "".join(f"<li>{icon('check')}{t}</li>" for t in ("Réponse sous 24 h", "Paiement unique", "Accompagnement personnalisé"))
    why = [("trend", "", "Plus de visibilité", "Un site rapide et bien structuré se fait trouver, localement comme sur Google."),
           ("shield", "lav", "Plus de confiance", "Un design net et des informations claires rassurent le visiteur avant même qu'il vous appelle."),
           ("message", "peach", "Plus de demandes", "Un téléphone cliquable, un formulaire simple et des appels à l'action visibles : le contact devient évident.")]
    why_html = "".join(f'<div class="card"><span class="icon {c}">{icon(i)}</span><h3>{t}</h3><p>{p}</p></div>' for i, c, t, p in why)
    svc = [("layout", "", "Création de site", "Un site neuf, pensé pour être trouvé et pour convertir.", "Dès 890 €"),
           ("wrench", "lav", "Refonte de site", "Votre site repensé de A à Z : design, rédaction et SEO technique.", "Dès 890 €"),
           ("search", "sky", "Audit &amp; optimisation", "Un diagnostic clair, puis les corrections qui comptent vraiment.", "Aperçu gratuit")]
    svc_html = "".join(f'<div class="card"><span class="icon {c}">{icon(i)}</span><h3>{t}</h3><p>{p}</p><p class="price" style="margin-top:auto;font-size:1.1rem">{pr}</p></div>' for i, c, t, p, pr in svc)
    steps = [("Audit gratuit", "Vous nous indiquez votre site ; nous mesurons ce qui freine vos visiteurs."),
             ("Maquette", "Nous vous proposons un design avant de développer quoi que ce soit."),
             ("Développement", "Pages rapides, adaptées au mobile, optimisées pour la recherche locale."),
             ("Mise en ligne", "Nous publions, vérifions et vous expliquons comment le faire vivre.")]
    steps_html = "".join(f"<li><h3>{t}</h3><p>{p}</p></li>" for t, p in steps)
    ex = [("restaurant", "Restaurant", "Menu lisible, réservation en un tap, horaires à jour."),
          ("artisan", "Artisan", "Réalisations en images, zone d'intervention, devis rapide."),
          ("beaute", "Salon &amp; beauté", "Prestations claires, prise de rendez-vous visible.")]
    ex_html = "".join(f'<article class="sector">{pic("secteur-" + k, "Exemple illustratif de site pour : " + strip_tags(n))}<div><span class="tag">Exemple illustratif</span><h3>{n}</h3><p>{d}</p></div></article>' for k, n, d in ex)
    body = f'''
<section class="hero"><div class="container hero-grid">
  <div>
    <span class="eyebrow">Agence web · Marseille</span>
    <h1>Un site web qui donne confiance dès la première visite</h1>
    <p class="lede">Création et refonte de sites web pour entreprises locales. Audit gratuit, accompagnement personnalisé et paiement unique.</p>
    <div class="cta-row"><a class="btn btn-solid" href="#audit">Demander un audit gratuit {icon("arrow")}</a><a class="btn" href="services.html">Voir les offres</a></div>
    <ul class="ticks">{ticks}</ul>
  </div>
  <figure class="mock" style="margin:0" aria-label="Exemple illustratif d'un site et de son score d'audit">
    <div class="mock-bar"><i></i><i></i><i></i><span class="mock-url">www.votre-entreprise.fr</span></div>
    <div class="mock-body">
      <div class="mock-hero"><b>Boulangerie du Vieux-Port</b><span>Pain au levain, viennoiseries, commandes pour événements.</span><em>Appeler maintenant</em></div>
      <div class="mock-cols"><div></div><div></div><div></div></div>
      <div class="mock-score"><strong>82</strong><span>Score global après optimisation<small>Performance · SEO · accessibilité · conversion</small></span></div>
    </div>
    <p class="mock-note">Exemple illustratif, pas un client réel.</p>
  </figure>
</div></section>

<section class="section"><div class="container">
  <div class="head"><span class="eyebrow">Pourquoi Growthline</span><h2>Un site qui travaille pour votre activité</h2></div>
  <div class="grid c3">{why_html}</div>
</div></section>

<section class="section alt" id="services"><div class="container">
  <div class="head"><span class="eyebrow">Services</span><h2>Ce que nous faisons pour vous</h2><p class="lede">Trois offres, un même principe : mesurer avant d'agir, et un paiement unique.</p></div>
  <div class="grid c3">{svc_html}</div>
  <p style="margin-top:24px"><a class="btn" href="services.html">Détail des offres et des tarifs</a></p>
</div></section>

<section class="section" id="methode"><div class="container">
  <div class="head"><span class="eyebrow">Méthode</span><h2>De l'audit à la mise en ligne, en 4 étapes</h2></div>
  <ol class="steps">{steps_html}</ol>
</div></section>

<section class="section alt"><div class="container">
  <div class="head"><span class="eyebrow">Réalisations</span><h2>Des styles de sites adaptés à votre métier</h2></div>
  <div class="grid c3">{ex_html}</div>
  <p class="disclaimer">{icon("info")}<span>Ces visuels sont des exemples illustratifs de style : ce ne sont pas des clients réels et aucun résultat chiffré n'est annoncé. <a href="realisations.html">Voir un exemple d'audit</a>.</span></p>
</div></section>

<section class="section" id="faq"><div class="container">
  <div class="head center"><span class="eyebrow">FAQ</span><h2>Questions fréquentes</h2></div>
  {faq_html}
</div></section>

<section class="section dark" id="audit"><div class="container split">
  <div><span class="eyebrow">Audit gratuit</span><h2>Prêt à améliorer votre présence en ligne ?</h2>
    <p class="lede" style="margin-top:14px">Indiquez l'adresse de votre site et votre email. Nous analysons, puis nous vous répondons sous 24 h.</p>
    <p style="margin-top:16px">Vous préférez en parler ? <a style="color:#fff" href="tel:{PHONE_TEL}">{PHONE_HUMAN}</a></p></div>
  {audit_form()}
</div></section>'''
    data = ld({"@context": "https://schema.org", "@type": "ProfessionalService", "name": "Growthline", "url": SITE + "/",
               "image": SITE + "/og-image.png", "telephone": PHONE_TEL, "email": EMAIL,
               "description": "Création et refonte de sites web pour entreprises locales : audit gratuit, accompagnement personnalisé, paiement unique.",
               "areaServed": "France", "priceRange": "0 € - 890 €",
               "address": {"@type": "PostalAddress", "addressLocality": "Marseille", "addressCountry": "FR"}}) + faq_ld
    return page("index.html", "Growthline : création et refonte de sites web pour entreprises locales",
                "Création et refonte de sites web pour entreprises locales à Marseille. Audit gratuit sous 24 h, accompagnement personnalisé, paiement unique dès 890 €.",
                body, data)


def price_card(icn, color, name, value, period, desc, feats, btn, feat=False, badge=None, soft=False):
    b = f'<span class="badge{" soft" if soft else ""}">{badge}</span>' if badge else ""
    per = f"<small>{period}</small>" if period else ""
    fl = '<ul class="list">' + "".join(f"<li>{icon('check')}{f}</li>" for f in feats) + "</ul>"
    return f'<div class="card{" feat" if feat else ""}">{b}<span class="icon {color}">{icon(icn)}</span><h3>{name}</h3><p class="price">{value}{per}</p><p>{desc}</p>{fl}{btn}</div>'


def services():
    faq_html, faq_ld = faq_block(FAQ_SERVICES)
    mail = lambda s: f"mailto:{EMAIL}?subject={s}"
    g1 = '<div class="grid c2">' + price_card("search", "sky", "Aperçu gratuit", "0 €", "", "Pour voir votre score global.", ["Score global", "3 problèmes détectés"],
            '<a class="btn btn-block" href="index.html#audit">Commencer gratuitement</a>') + price_card(
        "trend", "", "Analyse de site", "99 €", "Paiement unique, sans abonnement", "Le rapport complet de votre présence digitale.",
        ["Audit complet, sans limite", "Score détaillé par catégorie", "Recommandations priorisées"],
        '<a class="btn btn-solid btn-block" href="index.html#audit">Obtenir mon analyse</a>', True, "Recommandé") + "</div>"
    g2 = '<div class="grid c3">' + price_card("wrench", "lav", "Corrections ciblées", "450 €", "Paiement unique, à partir de", "Corrections des problèmes critiques de votre site.",
            ["Analyse offerte si besoin", "Livraison sous 5 jours ouvrés", "Un aller-retour de révision"],
            '<a class="btn btn-block" href="contact.html">Obtenir un devis</a>') + price_card(
        "layout", "", "Refonte complète", "890 €", "Paiement unique, à partir de", "Votre site repensé de A à Z (jusqu'à 5 pages).",
        ["Design et rédaction inclus", "SEO technique inclus", "Deux allers-retours de révision", "Livraison sous 10 jours ouvrés"],
        '<a class="btn btn-solid btn-block" href="contact.html">Obtenir un devis</a>', True, "Le plus complet") + price_card(
        "target", "peach", "Sur-mesure", "Sur devis", "", "E-commerce, fonctionnalités spécifiques, plus de pages.",
        ["Nombre de pages illimité", "Devis sous 48 h"], '<a class="btn btn-block" href="contact.html">Nous contacter</a>') + "</div>"
    g3 = '<div class="grid c3">' + price_card("card", "pink", "Carte NFC personnalisée", "50 €", "Paiement unique",
            "Un simple tap pour partager votre fiche, votre site ou vos coordonnées.", ["Design à votre marque", "Sans application"],
            f'<a class="btn btn-block" href="{mail("Liste%20d%27attente%20-%20Carte%20NFC")}">Me prévenir à la sortie</a>', False, "Bientôt disponible", True) + "</div>"
    body = head("Services", "Mesurer, puis corriger ce qui compte", "Trois étapes, un même principe : aucune décision sans données. Paiement unique à chaque étape, sans abonnement.") + f'''
<section class="section" style="padding-top:12px"><div class="container">
  <div class="grid c3">
    <div class="card"><span class="icon sky">{icon("search")}</span><h2 style="font-size:1.3rem">Audit</h2><p>Nous analysons votre site sur six catégories : performance, SEO technique, accessibilité, sécurité, présence locale et conversion. Chaque problème est expliqué simplement, avec son niveau de priorité.</p><p class="price" style="font-size:1.05rem">Aperçu gratuit · rapport 99 €</p></div>
    <div class="card"><span class="icon lav">{icon("wrench")}</span><h2 style="font-size:1.3rem">Optimisation</h2><p>Nous corrigeons directement les problèmes critiques identifiés, ou nous réalisons l'audit gratuitement si vous n'en avez pas encore. Un aller-retour de révision est inclus.</p><p class="price" style="font-size:1.05rem">Dès 450 €</p></div>
    <div class="card"><span class="icon peach">{icon("layout")}</span><h2 style="font-size:1.3rem">Refonte complète</h2><p>Votre site repensé de A à Z, jusqu'à 5 pages : design, rédaction et SEO technique orientés conversion dès la livraison. Deux allers-retours de révision inclus.</p><p class="price" style="font-size:1.05rem">Dès 890 €</p></div>
  </div>
</div></section>
<section class="section alt" id="tarifs"><div class="container">
  <div class="head"><span class="eyebrow">Tarifs</span><h2>Un prix simple et transparent</h2><p class="lede">Paiement unique, aucun abonnement, aucun engagement mensuel.</p></div>
  <h3 style="margin-bottom:12px">Analyse de site</h3>{g1}
  <h3 style="margin:32px 0 12px">Interventions ponctuelles</h3>{g2}
  <h3 style="margin:32px 0 12px">Produits</h3>{g3}
</div></section>
<section class="section"><div class="container">
  <div class="head center"><span class="eyebrow">FAQ</span><h2>Questions sur les offres</h2></div>{faq_html}
</div></section>''' + cta_band("Un projet en tête ?", "Parlons-en, c'est gratuit.")
    return page("services.html", "Services et tarifs : audit, optimisation, refonte de site",
                "Audit gratuit, analyse complète à 99 €, corrections dès 450 € et refonte de site dès 890 €. Paiement unique, sans abonnement.", body, faq_ld)


def realisations():
    scores = [("Site web", 72), ("SEO", 68), ("Conversion", 54), ("SEO local", 81), ("Réseaux", 76), ("Performance", 73)]
    sc = "".join(f'<div class="score"><small>{c}</small><b>{n}</b><span><i style="width:{n}%"></i></span></div>' for c, n in scores)
    issues = [("ok", "check", "Point fort", "La fiche Google Business est complète", "Horaires, catégorie, photos et coordonnées sont cohérents avec le site : un signal de confiance pour Google et pour les visiteurs."),
              ("bad", "alert", "Critique", "Le bouton d'action n'est pas assez visible", "Sur mobile, le bouton principal est sous la ligne de flottaison, ce qui réduit fortement les clics."),
              ("warn", "info", "Important", "La page mobile manque de points de contact", "Un seul formulaire, sans numéro cliquable ni prise de rendez-vous directe."),
              ("idea", "spark", "Opportunité", "La présence locale peut être mieux exploitée", "Nom, adresse et téléphone ne sont pas identiques sur toutes les pages analysées.")]
    iss = "".join(f'<div class="issue {s}"><span class="icon" style="background:var(--bg-2)">{icon(i)}</span><div><span class="pill">{t}</span><h3>{h}</h3><p>{p}</p></div></div>' for s, i, t, h, p in issues)
    sectors = [("restaurant", "Restaurant"), ("artisan", "Artisan"), ("beaute", "Salon &amp; beauté"), ("boutique", "Boutique en ligne"),
               ("btp", "BTP &amp; construction"), ("sante", "Santé &amp; bien-être"), ("immobilier", "Immobilier")]
    sec = "".join(f'<article class="sector">{pic("secteur-" + k, "Exemple illustratif de site pour : " + strip_tags(n))}<div><span class="tag">Exemple illustratif</span><h3>{n}</h3></div></article>' for k, n in sectors)
    body = head("Réalisations", "Voici à quoi ressemble un audit Growthline", "Un exemple concret pour comprendre ce que vous recevez : un score par catégorie et des problèmes classés par priorité.") + f'''
<section class="section" style="padding-top:12px"><div class="container">
  <p class="disclaimer" style="margin:0 0 24px">{icon("info")}<span>Exemple illustratif construit pour expliquer la méthode. Les scores ne proviennent pas d'un client réel.</span></p>
  <div class="scores">{sc}</div>
  <div class="grid c2" style="margin-top:18px">{iss}</div>
</div></section>
<section class="section alt"><div class="container">
  <div class="head"><span class="eyebrow">Styles de sites</span><h2>Des univers adaptés à chaque métier</h2><p class="lede">Aperçus de direction visuelle. Ce sont des exemples illustratifs, pas des sites de clients réels.</p></div>
  <div class="grid c4">{sec}</div>
</div></section>''' + cta_band("Voir ce que cela donne pour votre site ?", "L'aperçu est gratuit et sans engagement.")
    return page("realisations.html", "Exemple d'audit de site web et styles de sites par métier",
                "Découvrez un exemple d'audit Growthline : score par catégorie, problèmes classés par priorité, et des styles de sites adaptés à chaque métier.", body)


def about():
    vals = [("target", "", "Mesurer avant d'agir", "Chaque recommandation s'appuie sur des critères techniques vérifiables, pas sur une impression."),
            ("message", "lav", "Prioriser, sans jargon", "Chaque problème est expliqué en langage clair, avec un niveau de priorité."),
            ("card", "peach", "Paiement unique", "Aucun abonnement ni engagement mensuel : vous payez un résultat livré."),
            ("trend", "sky", "Un rapport avant / après", "Chaque intervention ponctuelle s'accompagne d'un rapport avant / après.")]
    v = "".join(f'<div class="card"><span class="icon {c}">{icon(i)}</span><h3>{t}</h3><p>{p}</p></div>' for i, c, t, p in vals)
    steps = [("Vous lancez l'audit", "Indiquez le nom et le site de votre entreprise. L'aperçu est gratuit."),
             ("Nous analysons", "Performance, SEO technique, accessibilité, sécurité et conversion."),
             ("Vous recevez un plan clair", "Un score par catégorie et des recommandations classées par priorité."),
             ("Nous corrigeons, si vous le souhaitez", "Corrections ciblées ou refonte, en paiement unique, avec un rapport avant / après.")]
    s = "".join(f"<li><h3>{t}</h3><p>{p}</p></li>" for t, p in steps)
    body = head("À propos", "Une agence web qui mesure avant de proposer", "Growthline aide les entreprises locales à avoir un site clair, rapide et qui donne envie d'appeler.") + f'''
<section class="section" style="padding-top:12px"><div class="container"><div class="grid c4">{v}</div></div></section>
<section class="section alt"><div class="container"><div class="head"><span class="eyebrow">Fonctionnement</span><h2>Comment se passe une collaboration</h2></div><ol class="steps">{s}</ol></div></section>''' + cta_band("Faisons connaissance", "Un appel ou un email suffit pour démarrer.")
    return page("a-propos.html", "À propos : une agence web qui mesure avant d'agir",
                "Growthline conçoit et optimise des sites pour entreprises locales : méthode fondée sur les données, paiement unique, accompagnement personnalisé.", body)


def contact():
    body = head("Contact", "Parlons de votre projet", "Écrivez-nous ou appelez : nous répondons sous 24 h, du lundi au vendredi.") + f'''
<section class="section" style="padding-top:12px"><div class="container split">
  <div>
    <h2 style="font-size:1.4rem">Nos coordonnées</h2>
    <ul class="contact-list">
      <li><a href="tel:{PHONE_TEL}">{icon("phone")}{PHONE_HUMAN}</a></li>
      <li><a href="mailto:{EMAIL}">{icon("mail")}{EMAIL}</a></li>
      <li><span style="display:flex;gap:12px;align-items:center;font-weight:600">{icon("pin")}Marseille, France</span></li>
    </ul>
  </div>
  <form class="form" data-mailto="{EMAIL}" data-subject="Contact depuis le site Growthline" aria-label="Formulaire de contact">
    <div class="row2">
      <label>Nom<input name="nom" data-label="Nom" autocomplete="name" required></label>
      <label>Email<input name="email" data-label="Email" type="email" autocomplete="email" required></label>
    </div>
    <label>Téléphone (facultatif)<input name="tel" data-label="Téléphone" type="tel" autocomplete="tel"></label>
    <label>Votre projet<textarea name="msg" data-label="Message" required></textarea></label>
    <button class="btn btn-solid btn-block" type="submit">Envoyer</button>
    <p class="hint">Le message s'ouvre dans votre messagerie, prêt à envoyer.</p>
  </form>
</div></section>'''
    return page("contact.html", "Contact : demander un audit ou un devis",
                "Contactez Growthline pour un audit gratuit, un devis de création ou de refonte de site. Réponse sous 24 h.", body)


def subcontract():
    data = json.loads((HERE / "tarifs_sous_traitance.json").read_text(encoding="utf-8"))
    forf = data.get("forfaits", [])
    has = any(f.get("prix") is not None for f in forf)
    if has:
        fmt = lambda n: (f"{n:,}".replace(",", " ") if isinstance(n, int) else str(n).replace(".", ",")) + " €"
        cards = ""
        for f in forf:
            p = f.get("prix")
            per = " ".join(x for x in (f.get("prefixe") if p is not None else None, f.get("unite") if p is not None else None) if x)
            inc = '<ul class="list">' + "".join(f"<li>{icon('check')}{x}</li>" for x in f["inclus"]) + "</ul>" if f.get("inclus") else ""
            delai = f'<p><strong>Délai :</strong> {f["delai"]}</p>' if f.get("delai") else ""
            cards += (f'<div class="card"><h3>{f["nom"]}</h3><p class="price">{fmt(p) if p is not None else "Sur devis"}'
                      f'{f"<small>{per}</small>" if per else ""}</p><p>{f.get("description", "")}</p>{delai}{inc}'
                      f'<a class="btn btn-block" href="contact.html">Demander un devis</a></div>')
        note = f'<p class="disclaimer">{icon("info")}<span>{data["note"]}</span></p>' if data.get("note") else ""
        tarifs = f'<div class="grid c2">{cards}</div>{note}'
    else:
        tarifs = (f'<div class="card" style="max-width:640px"><span class="icon">{icon("message")}</span><h3>Tarifs sur devis</h3>'
                  f'<p>Chaque projet de sous-traitance est chiffré selon le besoin : type de site, volume, calendrier. Décrivez votre demande, nous revenons avec une proposition.</p>'
                  f'<a class="btn btn-solid" href="mailto:{EMAIL}?subject=Sous-traitance%20-%20demande%20de%20devis">Demander un devis</a></div>')
    scope = [("layout", "", "Création de site", "Un site neuf, pensé pour convertir, pour le client final de votre agence."),
             ("wrench", "lav", "Refonte de site", "La reconstruction complète d'un site existant qui ne sert plus son activité."),
             ("search", "sky", "Audit &amp; optimisation", "L'analyse d'un site et la correction de ce qui bloque la conversion.")]
    sc = "".join(f'<div class="card"><span class="icon {c}">{icon(i)}</span><h3>{t}</h3><p>{d}</p></div>' for i, c, t, d in scope)
    body = head("Sous-traitance", "Confiez-nous vos sites pour vos clients", "Agences, freelances et studios : externalisez la création, la refonte ou l'optimisation de sites web pour vos propres clients.") + f'''
<section class="section" style="padding-top:12px"><div class="container"><div class="head"><h2>Ce que nous pouvons prendre en charge</h2></div><div class="grid c3">{sc}</div></div></section>
<section class="section alt"><div class="container"><div class="head"><span class="eyebrow">Tarifs</span><h2>Un cadre clair pour travailler ensemble</h2></div>{tarifs}</div></section>''' + cta_band("Un projet à externaliser ?", "Parlons de votre prochain site.", ("contact.html", "Nous écrire"), ("index.html#audit", "Audit gratuit"))
    return page("sous-traitance.html", "Sous-traitance de sites web pour agences et freelances",
                "Agences, freelances et studios : confiez à Growthline la création, la refonte ou l'optimisation de sites web pour vos clients.", body)


def legal():
    main = (HERE / "legal-main.html").read_text(encoding="utf-8")
    main = re.sub(r"^\s*<main>\s*|\s*</main>\s*$", "", main)  # le gabarit fournit déjà <main>
    return page("mentions-legales.html", "Mentions légales", "Éditeur du site, hébergement et traitement des données personnelles de Growthline.", main, noindex=True)


def not_found():
    body = head("Erreur 404", "Cette page n'existe pas", "Le lien est peut-être ancien. Retournez à l'accueil ou écrivez-nous.") + \
        '<section class="section" style="padding-top:12px"><div class="container"><a class="btn btn-solid" href="index.html">Retour à l\'accueil</a></div></section>'
    return page("404.html", "Page introuvable", "Cette page n'existe pas ou a été déplacée. Retournez à l'accueil de Growthline ou contactez-nous directement.", body, noindex=True)


def main():
    pages = {"index.html": home(), "services.html": services(), "realisations.html": realisations(), "a-propos.html": about(),
             "contact.html": contact(), "sous-traitance.html": subcontract(), "mentions-legales.html": legal(), "404.html": not_found()}
    for f, html in pages.items():
        (ROOT / f).write_text(html, encoding="utf-8", newline="\n")
    assets = ROOT / "assets"
    (assets / "fonts").mkdir(parents=True, exist_ok=True)
    shutil.copy(HERE / "style.css", assets / "style.css")
    shutil.copy(HERE / "site.js", assets / "site.js")
    urls = [f for f in pages if f not in ("404.html", "mentions-legales.html")]
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for f in urls:
        sm.append(f"  <url><loc>{SITE}/{'' if f == 'index.html' else f}</loc></url>")
    sm.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(sm) + "\n", encoding="utf-8", newline="\n")
    print("OK :", ", ".join(pages))


if __name__ == "__main__":
    main()
