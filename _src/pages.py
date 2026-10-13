# -*- coding: utf-8 -*-
"""Contenu des pages Growthline. Le texte est repris du site d'origine (aucune donnée inventée)."""
from pathlib import Path

SRC = Path(__file__).resolve().parent

FAQ_HOME = [
    ("Vos audits sont-ils automatisés ou réalisés par une vraie personne ?",
     "Manuels. Nos outils nous aident à collecter les données, mais chaque rapport est relu et priorisé par une personne avant de vous être envoyé — pas un score généré automatiquement sans contrôle."),
    ("Pourquoi un paiement unique plutôt qu'un abonnement ?",
     "Parce qu'un audit ou une correction a un début et une fin. Nous ne voyons pas l'intérêt de facturer chaque mois un travail déjà livré — vous payez une fois, pour un résultat concret."),
    ("Travaillez-vous avec tous les secteurs d'activité ?",
     "Oui — commerces, artisans, professions de santé, associations, startups... La méthode (mesurer, puis corriger ce qui compte) s'applique à peu près à n'importe quelle activité avec une présence en ligne."),
    ("Combien de temps pour obtenir mon audit ?",
     "Jusqu'à 24h. Vous recevez votre demande par email, nous analysons votre site en profondeur, et vous recevez votre rapport dès qu'il est prêt."),
    ("Que se passe-t-il si mon site n'a presque aucun problème ?",
     "Alors on vous le dit. L'audit sert à révéler ce qui bloque réellement — s'il n'y a rien de significatif à corriger, vous repartez avec un rapport honnête plutôt qu'une liste de prétextes pour vendre une refonte."),
]

FAQ_SERVICES = [
    ("Quelle est la différence entre l'analyse de site et le service ponctuel ?",
     "L'analyse de site est un rapport complet en paiement unique : score détaillé, tous les problèmes détectés et recommandations priorisées. Le service ponctuel va plus loin : nous corrigeons ou refaisons directement votre site, en paiement unique également."),
    ("Combien coûte l'analyse de site ?",
     "L'aperçu (score global et 3 problèmes détectés) est gratuit. Le rapport complet, sans limite, est disponible en paiement unique à 99€ — aucun abonnement."),
    ("Combien de temps prend l'audit ?",
     "Comptez jusqu'à 24h : vous recevez votre demande par email, notre équipe analyse votre site en profondeur, et nous vous répondons avec votre rapport dès qu'il est prêt."),
    ("Combien de temps prend une correction ou une refonte ?",
     "Comptez environ 5 jours ouvrés pour des corrections ciblées, et 10 jours ouvrés pour une refonte complète. Les projets sur-mesure sont estimés au cas par cas."),
    ("Les prix affichés sont-ils fixes ?",
     'Ce sont des points de départ, adaptés à la majorité des projets. Si le vôtre sort du cadre standard (délais serrés, besoin spécifique, budget différent), vous pouvez <a href="mailto:growthline.studio@gmail.com?subject=Discuter%20du%20prix">discuter du prix</a> directement avec nous par email.'),
]


def faq_html(b, items):
    out = []
    for q, a in items:
        out.append(f'<div class="faq-item"><button type="button" class="faq-q">{q}{b.icon("chevron")}</button>'
                   f'<div class="faq-a"><p>{a}</p></div></div>')
    return '<div class="faq-list" data-reveal>' + "".join(out) + "</div>"


def faq_ld(b, items):
    import re
    return b.ld({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"<[^>]+>", "", a)}} for q, a in items]})


def cta_final(b, eyebrow, title, primary=("index.html#audit", "Démarrer mon audit gratuit"), secondary=("contact.html", "Nous écrire")):
    return f'''<section class="section section--tight">
  <div class="container">
    <div class="cta-final" data-reveal>
      <div class="cta-final-orb" aria-hidden="true"></div>
      <div class="cta-final-inner">
        <span class="eyebrow eyebrow--dark">{eyebrow}</span>
        <h2>{title}</h2>
        <div class="cta-final-actions">
          <a href="{primary[0]}" class="btn btn-solid btn-lg" data-magnetic>{primary[1]}</a>
          <a href="{secondary[0]}" class="btn btn-lg" data-magnetic>{secondary[1]}</a>
        </div>
        <a class="cta-final-phone" href="tel:{b.PHONE_TEL}" data-magnetic aria-label="Appeler Growthline au {b.PHONE_HUMAN}">{b.icon("phone")} {b.PHONE_HUMAN}</a>
      </div>
    </div>
  </div>
</section>'''


def sky(count=5):
    return f'<div class="sky" aria-hidden="true"><canvas data-cloud-shader data-count="{count}" data-speed="1"></canvas></div>'


def page_hero(eyebrow, title, lede, extra=""):
    return f'''<section class="page-hero">
  {sky(4)}
  {extra}
  <div class="container">
    <span class="eyebrow">{eyebrow}</span>
    <h1 class="display-1" data-split>{title}</h1>
    <p class="lede">{lede}</p>
  </div>
</section>'''


def film_modal(b, mid, label, poster, video):
    return f'''<div class="film-modal" id="{mid}" hidden>
  <div class="film-modal-backdrop" data-film-close tabindex="-1"></div>
  <div class="film-modal-panel" role="dialog" aria-modal="true" aria-label="{label}">
    <button type="button" class="film-modal-fullscreen" data-film-fullscreen aria-label="Plein écran">{b.icon("fs")}</button>
    <button type="button" class="film-modal-close" data-film-close aria-label="Fermer la vidéo">{b.icon("x")}</button>
    <video class="film-modal-video" playsinline preload="none" poster="{poster}"><source src="{video}" type="video/mp4"></video>
    <div class="film-modal-loader" aria-hidden="true"></div>
  </div>
</div>'''


# =============================================================================== ACCUEIL
def home(b):
    ic = b.icon
    hero_poster = b.pic("images/hero-loop-poster.jpg", "", widths=(640, 960), sizes="(max-width: 920px) 92vw, 46vw", loading="eager", fetchpriority="high")
    marquee_items = ["Performance", "SEO technique", "Accessibilité", "Sécurité", "Présence locale", "Conversion"]
    marquee = "".join(f'<span class="marquee-item">{m}</span>' for m in marquee_items)
    proj = [("secteur-restaurant", "Restaurant", "Refonte complète", "Objectif : plus de réservations en ligne"),
            ("secteur-beaute", "Institut de beauté", "Création de site", "Objectif : plus de prises de rendez-vous"),
            ("secteur-immobilier", "Agence immobilière", "Audit &amp; optimisation", "Objectif : plus de contacts qualifiés")]
    projs = "".join(f'''<a href="realisations.html" class="proj-card" data-cursor-view>
  <div class="proj-card-img">{b.pic(f"images/{img}.jpg", "", widths=(640, 960), sizes="(max-width: 860px) 92vw, 30vw")}</div>
  <div class="proj-card-body"><span class="proj-card-type">{t}</span><h3>{h}</h3><p>{p}</p></div></a>''' for img, t, h, p in proj)
    body = f'''
<section class="hero" id="top">
  {sky(6)}
  <div class="container hero-inner">
    <div class="hero-copy">
      <span class="eyebrow">Agence digitale · Audit gratuit</span>
      <h1 class="display-1" data-split>Un site web qui donne <em>confiance</em> dès la première visite</h1>
      <p class="lede">Création et refonte de sites web pour entreprises locales. Audit gratuit, accompagnement personnalisé et paiement unique.</p>
      <div class="hero-ctas">
        <a href="#audit" class="btn btn-solid btn-lg" data-magnetic>Audit gratuit {ic("arrow", "arrow")}</a>
        <a href="realisations.html" class="btn btn-lg" data-magnetic>Voir nos réalisations</a>
      </div>
      <ul class="hero-proof-list">
        <li>{ic("check")}Réponse sous 24h</li><li>{ic("check")}Paiement unique</li><li>{ic("check")}Accompagnement personnalisé</li>
      </ul>
    </div>
    <div class="hero-stage">
      <div class="hero-card">
        <button type="button" class="hero-video" data-video-open="showreelModal" aria-haspopup="dialog" aria-controls="showreelModal" aria-label="Regarder avec le son : showreel Growthline" data-cursor-view>
          <video muted loop playsinline preload="metadata" poster="images/hero-loop-poster.jpg" aria-hidden="true" tabindex="-1"><source src="video/growthline-hero-loop.mp4" type="video/mp4"></video>
          <span class="hero-play"><span>{ic("play")}</span>Regarder avec le son</span>
        </button>
      </div>
      <span class="hero-chip hero-chip--a float-a"><i>{ic("search")}</i>Audit gratuit</span>
      <span class="hero-chip hero-chip--b float-b"><i>{ic("clock")}</i>Réponse sous 24h</span>
      <span class="hero-chip hero-chip--c float-c"><i>{ic("check")}</i>Paiement unique</span>
    </div>
  </div>
  <a class="scroll-cue" href="#probleme" aria-label="Descendre"><i></i>Défiler</a>
</section>

{film_modal(b, "showreelModal", "Showreel Growthline", "images/hero-showreel-poster.jpg", "video/growthline-showreel.mp4")}

<div class="marquee-wrap"><div class="marquee" aria-label="Les six catégories analysées à chaque audit"><div class="marquee-track" data-marquee-track data-marquee-speed="38">{marquee}</div></div></div>

<section class="section" id="chiffres" aria-label="En bref">
  <div class="container">
    <div class="stats" data-stagger>
      <div class="stat"><b><span data-count="24">24</span><small>h</small></b><span>pour recevoir la réponse à votre demande</span></div>
      <div class="stat"><b><span data-count="6">6</span></b><span>catégories analysées à chaque audit</span></div>
      <div class="stat"><b><span data-count="0">0</span><small>€</small></b><span>d'abonnement : un paiement unique</span></div>
      <div class="stat"><b><span data-count="890">890</span><small>€</small></b><span>à partir de, pour une création ou une refonte</span></div>
    </div>
  </div>
</section>

<section class="section section--tight" id="probleme">
  <div class="container">
    <div class="section-head"><h2 class="display-2" data-split>Pourquoi votre site peut <em>freiner</em> votre croissance</h2></div>
    <div class="pb-grid" data-stagger>
      <div class="pb-card"><span class="pb-card-icon">{ic("clock")}</span><h3>Site dépassé</h3><p>Design daté, lent à charger : votre site ne reflète plus le sérieux de votre activité.</p></div>
      <div class="pb-card"><span class="pb-card-icon">{ic("shield")}</span><h3>Manque de crédibilité</h3><p>Un visiteur hésite à vous contacter si votre site ne donne pas immédiatement confiance.</p></div>
      <div class="pb-card"><span class="pb-card-icon">{ic("message")}</span><h3>Peu de demandes de contact</h3><p>Sans parcours clair vers un formulaire ou un appel, la plupart des visiteurs repartent sans agir.</p></div>
    </div>
  </div>
</section>

<section class="section section--tight" id="services">
  <div class="container">
    <div class="section-head"><h2 class="display-2" data-split>Des solutions adaptées à <em>votre activité</em></h2></div>
    <div class="sol-grid" data-stagger>
      <div class="sol-card"><h3>Création de site</h3><p>Vous n'avez pas encore de site ? On le construit de zéro, pensé pour convertir.</p><span class="sol-card-price">À partir de 890€</span></div>
      <div class="sol-card"><h3>Refonte de site</h3><p>Votre site existe déjà mais ne vous sert plus ? On le reconstruit entièrement.</p><span class="sol-card-price">À partir de 890€</span></div>
      <div class="sol-card"><h3>Audit &amp; optimisation</h3><p>Votre site est correct mais sous-performe ? On corrige ce qui bloque la conversion.</p><span class="sol-card-price">Audit gratuit</span></div>
    </div>
    <a href="contact.html" class="btn btn-solid sol-cta" data-magnetic>Discuter de mon projet {ic("arrow", "arrow")}</a>
  </div>
</section>

<section class="section section--tight" id="realisations">
  <div class="container">
    <div class="section-head"><h2 class="display-2" data-split>Quelques <em>réalisations</em></h2></div>
    <div class="proj-grid" data-stagger>{projs}</div>
    <p class="disclaimer-note" data-reveal>{ic("info")}Exemples illustratifs de style par secteur, pas des clients réels.</p>
    <a href="realisations.html" class="btn btn-solid" data-magnetic>Voir un exemple d'audit complet {ic("arrow", "arrow")}</a>
  </div>
</section>

<section class="section section--tight section--night" id="processus">
  <div class="container">
    <div class="section-head"><h2 class="display-2" data-split>Comment se déroule <em>un projet</em></h2></div>
    <div class="proc-h-grid">
      <div class="proc-line" aria-hidden="true"><span></span></div>
      <div class="proc-h-step"><span class="proc-h-num">01</span><h3>Audit</h3><p>On analyse votre présence digitale et ce qui bloque la conversion.</p></div>
      <div class="proc-h-step"><span class="proc-h-num">02</span><h3>Maquette</h3><p>On vous montre à quoi ressemblera votre site avant de le développer.</p></div>
      <div class="proc-h-step"><span class="proc-h-num">03</span><h3>Développement</h3><p>Une fois validée, on construit le site, optimisé conversion et SEO.</p></div>
      <div class="proc-h-step"><span class="proc-h-num">04</span><h3>Mise en ligne</h3><p>Votre site part en production, prêt à transformer vos visiteurs.</p></div>
    </div>
    <button type="button" class="video-preview-mini method-video-preview" data-video-open="processModal" aria-haspopup="dialog" aria-controls="processModal">
      <span class="video-preview-mini-thumb">{b.pic("images/process-poster.jpg", "", widths=(320, 640), sizes="92px")}<span class="video-preview-mini-play" aria-hidden="true"><span>{ic("play")}</span></span></span>
      <span class="video-preview-mini-label">Voir la vidéo du processus</span>
    </button>
  </div>
</section>
{film_modal(b, "processModal", "Processus Growthline", "images/process-poster.jpg", "video/growthline-process.mp4")}

<section class="section section--tight" id="faq">
  <div class="container">
    <div class="section-head section-head--center">
      <span class="eyebrow">Questions fréquentes</span>
      <h2 class="display-2" data-split>Tout ce qu'on nous demande <em>avant de commencer.</em></h2>
    </div>
    {faq_html(b, FAQ_HOME)}
  </div>
</section>

<section class="section section--tight" id="audit">
  <div class="container">
    <div class="audit-panel" data-reveal>
      <div class="audit-panel-head">
        <span class="eyebrow">Vous avez un projet ?</span>
        <h2 class="display-2">Prêt à améliorer votre présence en ligne ?</h2>
        <p class="lede">Discutons gratuitement de votre projet. Entrez votre site, nous vous montrons ce qui vous fait perdre des opportunités.</p>
        <a class="audit-panel-phone" href="tel:{b.PHONE_TEL}" data-magnetic aria-label="Appeler Growthline au {b.PHONE_HUMAN}">{ic("phone")} {b.PHONE_HUMAN}</a>
      </div>
      <div>
        <div id="auditFormWrap">
          <form class="audit-form" id="auditForm" novalidate>
            <div class="audit-field"><label for="auditSite">Site web</label><input id="auditSite" name="site" type="text" placeholder="https://votre-site.fr" autocomplete="url" required></div>
            <div class="audit-field"><label for="auditEmail">Votre email</label><input id="auditEmail" name="email" type="email" placeholder="votre@email.fr" autocomplete="email" required></div>
            <button type="submit" class="btn btn-solid btn-lg audit-submit" data-magnetic><span class="btn-spinner" aria-hidden="true"></span><span class="btn-label">Demander un audit gratuit</span>{ic("arrow", "arrow")}</button>
            <p class="form-status" id="auditFormStatus" role="status" aria-live="polite"></p>
          </form>
          <p class="audit-note">Sans engagement · Audit manuel · Réponse sous 24h</p>
        </div>
        <div class="form-confirm" id="auditConfirm" hidden>
          <div class="form-confirm-check">{ic("check", sw="3")}</div>
          <h3 class="form-confirm-title">Audit demandé.</h3>
          <p class="form-confirm-recap" id="auditConfirmRecap">—</p>
          <div class="form-confirm-steps">
            <div class="form-confirm-step is-done"><span class="form-confirm-dot"></span><span>Demande envoyée</span></div>
            <div class="form-confirm-step is-pending"><span class="form-confirm-dot"></span><span>Score + 3 problèmes détectés, par email sous 24h</span></div>
          </div>
          <p class="audit-note">Un vrai humain lit chaque demande — pas de rapport automatique envoyé sans relecture.</p>
          <button type="button" class="btn" id="auditConfirmReset">Analyser un autre site</button>
        </div>
      </div>
    </div>
  </div>
</section>'''
    ld = b.ld({
        "@context": "https://schema.org", "@type": "ProfessionalService", "name": "Growthline", "url": b.SITE + "/",
        "image": b.SITE + "/og-image.png", "telephone": b.PHONE_TEL, "email": b.EMAIL,
        "description": "Agence digitale : audit de présence en ligne, corrections ciblées et refontes de sites, orientées performance et conversion.",
        "areaServed": "France", "serviceType": "Audit digital et création de site internet", "priceRange": "0€ - 890€",
        "address": {"@type": "PostalAddress", "addressLocality": "Marseille", "addressCountry": "FR"}}) + faq_ld(b, FAQ_HOME)
    return b.page("index.html", "Growthline — Agence d'audit digital &amp; performance",
                  "Growthline analyse manuellement votre présence digitale, puis corrige ce qui compte : performance, SEO technique, conversion. Audit gratuit, réponse sous 24h.",
                  body, extra_ld=ld, extra_js=("film-modal.js",),
                  preload='<link rel="preload" as="image" type="image/webp" href="images/opt/hero-loop-poster-960.webp" fetchpriority="high">\n')


# =============================================================================== SERVICES
def services(b):
    ic = b.icon
    rows = [
        ("index.html#audit", "linear-gradient(160deg,#bfe0ff,#6fa8f0)", ic("search"), '<div class="svc-scan-beam" aria-hidden="true"></div>', "Audit",
         "Notre équipe analyse votre site sur six catégories : performance, SEO technique, accessibilité, sécurité, présence locale et conversion. Chaque problème détecté est expliqué en langage clair, avec son niveau de priorité — aperçu gratuit, rapport complet à 99€.", "Gratuit"),
        ("#tarifs", "linear-gradient(160deg,#e3d9ff,#a99bf6)", ic("sliders"), "", "Optimisation",
         "Nous corrigeons directement les problèmes critiques identifiés lors de votre audit — ou nous l'effectuons gratuitement si vous n'en avez pas encore. Un aller-retour de révision est inclus.", "Sur devis"),
        ("#tarifs", "linear-gradient(160deg,#ffe6b8,#ffb547)", ic("layout"), "", "Refonte complète",
         "Votre site repensé de A à Z, jusqu'à 5 pages : design, rédaction et SEO technique orientés conversion dès la livraison. Deux allers-retours de révision inclus.", "À partir de 890€"),
    ]
    rows_html = "".join(f'''<a class="service-row" href="{h}">
  <div class="service-visual" style="background:{g}">{i}{beam}</div>
  <div class="service-main"><h2>{t}</h2><p>{p}</p></div>
  <div class="service-meta"><span class="service-price">{pr}</span><span class="service-arrow">{ic("arrow")}</span></div></a>''' for h, g, i, beam, t, p, pr in rows)

    def feats(*items):
        return '<ul class="price-features">' + "".join(f"<li>{ic('check')}{x}</li>" for x in items) + "</ul>"

    def card(icn, name, value, period, desc, features, btn, featured=False, badge=None, soon=False):
        bd = f'<span class="price-badge{" is-soon" if soon else ""}">{badge}</span>' if badge else ""
        per = f'<div class="price-period">{period}</div>' if period else ""
        cls = "price-card featured" if featured else "price-card"
        return f'''<div class="{cls}"><div class="price-card-icon">{ic(icn)}</div><div class="price-card-head"><h3>{name}</h3>{bd}</div>
<div class="price-value">{value}</div>{per}<p class="price-desc">{desc}</p>{features}{btn}</div>'''

    g1 = ('<div class="pricing-group" data-reveal><div class="pricing-group-label">Analyse de site</div><div class="pricing-grid">'
          + card("search", "Aperçu gratuit", "0€", "", "Pour tester l'outil et voir votre score global.", feats("Score global", "3 problèmes détectés"),
                 '<a href="index.html#audit" class="btn btn-block">Commencer gratuitement</a>')
          + card("chart", "Analyse de site", "99€", "Paiement unique, sans abonnement", "Le rapport complet de votre présence digitale, sans limite.",
                 feats("Audit complet, sans limite", "Score détaillé par catégorie", "Recommandations priorisées"),
                 '<a href="index.html#audit" class="btn btn-solid btn-block">Obtenir mon analyse</a>', True, "Recommandé")
          + "</div></div>")
    g2 = ('<div class="pricing-group" data-reveal><div class="pricing-group-label">Interventions ponctuelles</div><div class="pricing-grid">'
          + card("wrench", "Corrections ciblées", "450€", "Paiement unique, à partir de", "Corrections des problèmes critiques de votre site.",
                 feats("Analyse offerte si besoin", "Livraison sous 5 jours ouvrés"), '<a href="contact.html" class="btn btn-block">Obtenir un devis</a>')
          + card("layout", "Refonte complète", "890€", "Paiement unique, à partir de", "Votre site repensé de A à Z (jusqu'à 5 pages).",
                 feats("Design &amp; rédaction inclus", "SEO technique inclus"), '<a href="contact.html" class="btn btn-solid btn-block">Obtenir un devis</a>', True, "Le plus complet")
          + card("code", "Sur-mesure", "Sur devis", "", "E-commerce, fonctionnalités spécifiques ou plus de pages.",
                 feats("Nombre de pages illimité", "Devis sous 48h"), '<a href="contact.html" class="btn btn-block">Nous contacter</a>')
          + "</div></div>")
    g3 = ('<div class="pricing-group" data-reveal><div class="pricing-group-label">Produits</div><div class="pricing-grid pricing-grid--single">'
          + card("wifi", "Carte NFC personnalisée", "50€", "Paiement unique",
                 "Une carte à votre image : un simple tap pour partager votre fiche, votre site ou vos coordonnées.",
                 feats("Design personnalisé à votre marque", "Sans application, compatible tous téléphones récents"),
                 '<a href="mailto:growthline.studio@gmail.com?subject=Liste%20d%27attente%20-%20Carte%20NFC%20personnalis%C3%A9e" class="btn btn-block">Me prévenir à la sortie</a>',
                 False, "Bientôt disponible", True)
          + "</div></div>")
    body = f'''
{page_hero("Services", "Mesurer, puis <em>corriger</em> ce qui compte.", "Trois étapes, un même principe : aucune décision n'est prise sans données. Paiement unique, sans abonnement, à chaque étape.")}

<section class="section" id="detail" style="padding-top:0;">
  <div class="container">
    <div class="services-signature" data-reveal>{b.pic("images/services-signature.png", "Illustration : les fondations d'une présence digitale Growthline — stratégie, design, technologie, croissance.", widths=(640, 1280), sizes="(max-width: 1280px) 92vw, 1240px")}</div>
    <div class="service-list" data-stagger>{rows_html}</div>
  </div>
</section>

<section class="section" id="tarifs">
  <div class="container">
    <div class="section-head">
      <div><span class="eyebrow">Tarifs</span><h2 class="display-2" data-split style="margin-top:16px;">Un prix simple, <em>transparent.</em></h2></div>
      <p class="lede">Paiement unique à chaque étape. Aucun abonnement, aucun engagement mensuel.</p>
    </div>
    {g1}{g2}{g3}
  </div>
</section>

<section class="section" id="faq">
  <div class="container">
    <div class="section-head section-head--center"><span class="eyebrow">FAQ</span><h2 class="display-2" data-split>Questions <em>fréquentes.</em></h2></div>
    {faq_html(b, FAQ_SERVICES)}
  </div>
</section>

{cta_final(b, "Vous avez un projet ?", "Voyons ce qui freine votre site aujourd'hui.")}'''
    return b.page("services.html", "Services &amp; tarifs — Growthline",
                  "Audit, optimisation, refonte complète : les services Growthline et leurs tarifs, en paiement unique et sans abonnement.",
                  body, extra_ld=faq_ld(b, FAQ_SERVICES))


# =============================================================================== RÉALISATIONS
def realisations(b):
    ic = b.icon
    scores = [("Site web", 72), ("SEO", 68), ("Conversion", 54), ("SEO local", 81), ("Réseaux sociaux", 76), ("Performance", 73)]
    score_html = "".join(f'<div class="score-card"><div class="cat">{c}</div><div class="num">{n}</div><div class="bar"><span style="width:{n}%"></span></div></div>' for c, n in scores)
    issues = [("strength", "check", "Point fort", "La fiche Google Business est complète et à jour",
               "Horaires, catégorie, photos et coordonnées sont cohérents avec le site — un signal de confiance apprécié par Google et les visiteurs."),
              ("critical", "alert", "Critique", "Le CTA principal n'est pas suffisamment visible",
               "Le bouton d'action se trouve sous la ligne de flottaison sur mobile, ce qui réduit fortement le taux de clics."),
              ("important", "info", "Important", "La page mobile manque de points de conversion",
               "Un seul formulaire de contact est présent, sans numéro de téléphone cliquable ni prise de rendez-vous directe."),
              ("opportunity", "sparkles", "Opportunité", "La présence locale pourrait être davantage exploitée",
               "Les signaux de cohérence nom / adresse / téléphone sont incomplets sur les pages analysées.")]
    issues_html = "".join(f'<div class="issue-card {s}"><div class="issue-icon">{ic(i)}</div><div class="issue-body"><span class="tag">{t}</span><h2>{h}</h2><p>{p}</p></div></div>' for s, i, t, h, p in issues)
    sectors = [("immobilier", "Immobilier", "Exemple illustratif de style de site pour le secteur immobilier", "linear-gradient(160deg,#2F9C8C,#1E6B5F)"),
               ("restaurant", "Restaurant", "Exemple illustratif de style de site pour un restaurant", "linear-gradient(160deg,#E06544,#C2502F)"),
               ("beaute", "Salon &amp; beauté", "Exemple illustratif de style de site pour un salon de beauté", "linear-gradient(160deg,#D1548C,#B03E70)"),
               ("boutique", "Boutique en ligne", "Exemple illustratif de style de site pour une boutique en ligne", "linear-gradient(160deg,#8A69C9,#6C4FA8)"),
               ("artisan", "Artisan", "Exemple illustratif de style de site pour un artisan", "linear-gradient(160deg,#E3B23C,#C2932A)"),
               ("btp", "BTP &amp; Construction", "Exemple illustratif de style de site pour une entreprise de BTP", "linear-gradient(160deg,#5279AD,#3D5F8A)"),
               ("sante", "Santé &amp; bien-être", "Exemple illustratif de style de site pour un cabinet de santé ou bien-être", "linear-gradient(160deg,#63A67E,#478061)")]
    sec_html = "".join(f'''<div class="sector-card">
  <div class="sector-card-face" style="background:{g}"><b>{n}</b><span>Exemple illustratif</span></div>
  <div class="sector-card-image">{b.pic(f"images/secteur-{k}.jpg", alt, widths=(640, 960), sizes="(max-width: 600px) 78vw, 360px")}</div>
  <button type="button" class="sector-card-expand" data-label="{n}" data-img="images/secteur-{k}.jpg" aria-label="Voir {n} en grand">{ic("expand")}</button></div>''' for k, n, alt, g in sectors)
    body = f'''
{page_hero("Réalisations", "Voici à quoi ressemble <em>un audit</em> Growthline.", "Un exemple concret pour comprendre ce que vous recevrez : un score par catégorie, et des problèmes classés par priorité.")}

<section class="section section--night film-section">
  <div class="container film-head" data-reveal>
    <span class="eyebrow eyebrow--dark">Transformation</span>
    <h2 class="display-2">Un site transformé, <em>de A à Z.</em></h2>
    <p class="lede">Un exemple concret de ce que peut devenir votre site : d'une présence datée à une expérience moderne, pensée pour convertir.</p>
  </div>
  <div class="container" data-reveal>
    <button type="button" class="film-preview" data-video-open="transformationModal" aria-haspopup="dialog" aria-controls="transformationModal" data-cursor-view>
      {b.pic("images/transformation-poster.jpg", "Image d'ouverture de la vidéo de transformation Growthline", widths=(640, 1280), sizes="(max-width: 1100px) 92vw, 1040px", cls="film-preview-img")}
      <span class="film-preview-play" aria-hidden="true">{ic("play")}</span><span class="film-preview-label">Voir la transformation</span>
    </button>
    <p class="disclaimer-note" style="justify-content:center;margin-top:28px;">{ic("info")}Exemple illustratif de transformation, pas un client réel.</p>
  </div>
</section>
{film_modal(b, "transformationModal", "Transformation Growthline", "images/transformation-poster.jpg", "video/growthline-transformation.mp4")}

<section class="section">
  <div class="container">
    <div class="example-banner" data-reveal>{ic("info")}Ce rapport a été rédigé pour une entreprise fictive à titre d'exemple, dans le même format que celui utilisé pour votre audit — il ne s'agit pas d'un client réel.</div>
    <div class="score-breakdown" data-stagger>{score_html}</div>
    <div class="issues-list" data-stagger>{issues_html}</div>
  </div>
</section>

<section class="section" style="padding-top:0;">
  <div class="container">
    <div class="section-head">
      <div><span class="eyebrow">Exemples par secteur</span><h2 class="display-2" data-split style="margin-top:16px;">À quoi pourrait ressembler <em>votre nouveau site.</em></h2></div>
      <p class="lede">Survolez une case (ou touchez-la sur mobile) pour voir un style possible selon votre secteur — glissez pour voir les suivantes.</p>
    </div>
    <div class="sector-carousel" data-reveal tabindex="0" aria-label="Exemples par secteur, défilement horizontal">{sec_html}</div>
    <p class="disclaimer-note" data-reveal>{ic("info")}Illustrations de style, pas des sites réels existants ni des captures de clients.</p>
  </div>
</section>

<section class="section" style="padding-top:0;">
  <div class="container">
    <div class="section-head">
      <div><span class="eyebrow">Exemples d'audits</span><h2 class="display-2" data-split style="margin-top:16px;">Voici le type de <em>diagnostic</em> que Growthline produit.</h2></div>
      <p class="lede">Trois cas construits pour montrer notre méthode d'analyse — pas de vrais clients.</p>
    </div>
    <div class="audit-case" id="auditCase" data-reveal>
      <div class="audit-case-nav">
        <button type="button" class="audit-case-navbtn" id="auditPrev" aria-label="Cas précédent">{ic("arrow-left")}</button>
        <span class="audit-case-counter" id="auditCounter" aria-live="polite">01 / 03</span>
        <button type="button" class="audit-case-navbtn" id="auditNext" aria-label="Cas suivant">{ic("arrow")}</button>
      </div>
      <div class="audit-case-top">
        <div class="audit-case-id"><span class="audit-case-tag" id="auditTag">AUDIT 01</span><h3 id="auditName">CASA NOVA</h3><span class="audit-case-sector" id="auditSector">Restaurant méditerranéen premium — Marseille</span></div>
        <div class="audit-case-score">
          <svg viewBox="0 0 72 72" aria-hidden="true"><defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2257d9"/><stop offset="1" stop-color="#c24bd6"/></linearGradient></defs><circle class="ring-bg" cx="36" cy="36" r="32"/><circle class="ring-fg" id="auditScoreRing" cx="36" cy="36" r="32"/></svg>
          <div><b id="auditScoreNum">74</b><span>/100</span></div>
        </div>
      </div>
      <div class="audit-case-metrics" id="auditMetrics"></div>
      <p class="audit-case-diagnostic" id="auditDiagnostic"></p>
      <div class="audit-case-problems" id="auditProblems"></div>
      <div class="audit-case-opportunity"><span class="audit-case-label">Opportunité</span><p id="auditOpportunity"></p></div>
      <blockquote class="audit-case-verdict" id="auditVerdict"></blockquote>
      <div class="audit-case-priority"><span class="audit-case-label">Priorité #1</span><p id="auditPriority"></p></div>
    </div>
    <p class="disclaimer-note" data-reveal>{ic("info")}Cas fictifs construits pour illustrer notre méthode d'analyse — pas des clients réels ni de vraies données.</p>
  </div>
</section>

<div class="gallery-lightbox" id="galleryLightbox" aria-hidden="true">
  <div class="gallery-lightbox-backdrop"></div>
  <div class="gallery-lightbox-panel" role="dialog" aria-modal="true" aria-labelledby="galleryLightboxLabel">
    <button type="button" class="gallery-lightbox-close" aria-label="Fermer">&times;</button>
    <img id="galleryLightboxImg" src="" alt="">
    <div class="gallery-lightbox-label" id="galleryLightboxLabel"></div>
  </div>
</div>

{cta_final(b, "Votre tour", "Lancez votre propre audit, gratuitement.", secondary=("services.html", "Voir les tarifs"))}'''
    return b.page("realisations.html", "Réalisations — exemple d'audit Growthline",
                  "Découvrez à quoi ressemble un audit Growthline : score par catégorie, problèmes classés par priorité et exemples de styles de sites par secteur.",
                  body, extra_js=("film-modal.js", "audits-demo.js"))


# =============================================================================== À PROPOS
def about(b):
    ic = b.icon
    nodes = [("Site web", "#2257d9"), ("SEO", "#6552e8"), ("Conversion", "#ffb547"), ("SEO local", "#e8553b"), ("Réseaux sociaux", "#148a73"), ("Performance", "#c24bd6")]
    nodes_html = "".join(f'<span class="orbit-node" style="--i:{i};--c:{c}"><span class="dot"></span>{n}</span>' for i, (n, c) in enumerate(nodes))
    values = [("target", "Mesurer avant d'agir", "Aucune recommandation n'est faite sans données : chaque audit s'appuie sur des critères techniques vérifiables, pas sur une impression."),
              ("eye", "Prioriser, sans jargon", "Un rapport n'a de valeur que s'il est compris. Chaque problème est expliqué en langage clair, avec un niveau de priorité."),
              ("card", "Paiement unique", "Aucun abonnement, aucun engagement mensuel. Vous payez pour un résultat livré, pas pour un accès continu."),
              ("chart", "Un rapport avant / après", "Chaque intervention ponctuelle est accompagnée d'un rapport avant / après, pour vérifier ce qui a réellement changé.")]
    values_html = "".join(f'<div class="value-item"><div class="value-icon">{ic(i)}</div><h3>{t}</h3><p>{p}</p></div>' for i, t, p in values)
    steps = [("Vous lancez l'audit", "Indiquez le nom et le site web de votre entreprise. L'aperçu est gratuit."),
             ("Nous analysons", "Notre équipe examine performance, SEO technique, accessibilité, sécurité et conversion."),
             ("Vous recevez un plan clair", "Un score par catégorie, et des recommandations classées par priorité."),
             ("Nous corrigeons, si vous le souhaitez", "Corrections ciblées ou refonte complète, en paiement unique, avec un rapport avant / après.")]
    steps_html = "".join(f'<div class="process-step" data-step="{i+1}"><h3>{t}</h3><p>{p}</p></div>' for i, (t, p) in enumerate(steps))
    body = f'''
{page_hero("À propos", "Une agence qui <em>mesure</em> avant d'agir.", "Growthline est née d'un constat simple : la plupart des sites d'entreprise perdent des clients pour des raisons identifiables, mais rarement mesurées. Nous avons construit un moteur d'audit pour les révéler, puis une équipe pour les corriger.")}

<section class="section" style="padding-top:0;">
  <div class="container orbit-wrap" data-reveal>
    <div class="orbit" role="img" aria-label="Schéma : votre entreprise au centre, reliée aux 6 catégories analysées par Growthline — site web, SEO, conversion, SEO local, réseaux sociaux, performance.">
      <span class="orbit-ring"></span><span class="orbit-ring orbit-ring--2"></span>
      <div class="orbit-core">Votre<br>entreprise</div>{nodes_html}
    </div>
    <p class="disclaimer-note">{ic("info")}Les 6 catégories que Growthline analyse à chaque audit — pas une liste de fonctionnalités marketing.</p>
  </div>
</section>

<section class="section" style="padding-top:0;">
  <div class="container"><p class="statement statement--wide" data-split>On ne vend pas une refonte. <em>On révèle d'abord ce qui bloque</em>, puis on corrige uniquement ce qui compte.</p></div>
</section>

<section class="section" id="methode">
  <div class="container">
    <div class="section-head"><div><span class="eyebrow">Notre méthode</span><h2 class="display-2" data-split style="margin-top:16px;">Quatre principes, <em>sans exception.</em></h2></div></div>
    <div class="value-grid" data-stagger>{values_html}</div>
  </div>
</section>

<section class="section" id="fonctionnement">
  <div class="container">
    <div class="section-head"><div><span class="eyebrow">Comment nous travaillons</span><h2 class="display-2" data-split style="margin-top:16px;">De l'audit <em>à la correction.</em></h2></div></div>
    <div class="process-row"><div class="process-track-fill" aria-hidden="true"><span></span></div>{steps_html}</div>
  </div>
</section>

<section class="section" id="faq">
  <div class="container">
    <div class="section-head section-head--center"><span class="eyebrow">FAQ</span><h2 class="display-2" data-split>Questions <em>fréquentes.</em></h2></div>
    {faq_html(b, FAQ_HOME)}
  </div>
</section>

{cta_final(b, "Vous avez un projet ?", "Voyons ce qui freine votre site aujourd'hui.")}'''
    return b.page("a-propos.html", "À propos — Growthline, l'agence qui mesure avant d'agir",
                  "Growthline mesure avant d'agir : un moteur d'audit pour révéler ce qui fait perdre des clients à votre site, puis une équipe pour le corriger.",
                  body, extra_ld=faq_ld(b, FAQ_HOME))


# =============================================================================== CONTACT
def contact(b):
    ic = b.icon
    bubbles = ('<div class="bubbles" aria-hidden="true">'
               '<span class="bubble float-a" style="right:26%;top:30%"><span class="dot"></span>Bonjour 👋</span>'
               '<span class="bubble float-b" style="right:8%;top:22%"><span class="dot"></span>Stratégie</span>'
               '<span class="bubble float-c" style="right:14%;top:44%"><span class="dot"></span>Votre projet</span>'
               '<span class="bubble float-b" style="right:36%;top:56%"><span class="dot"></span>Growth</span>'
               '<span class="bubble bubble--accent float-a" style="right:6%;top:64%"><span class="dot"></span>Let&#39;s build</span></div>')
    topics = [("Devis%20-%20Corrections%20cibl%C3%A9es", "Devis · Corrections ciblées"), ("Devis%20-%20Refonte%20compl%C3%A8te", "Devis · Refonte complète"),
              ("Projet%20sur-mesure", "Projet sur-mesure"), ("Question%20g%C3%A9n%C3%A9rale", "Question générale")]
    topics_html = "".join(f'<a href="mailto:{b.EMAIL}?subject={s}">{t}</a>' for s, t in topics)
    body = f'''
{page_hero("Contact", "Parlons de <em>votre projet.</em>", "Un devis pour une correction, une refonte, ou simplement une question sur votre audit : écrivez-nous directement.", bubbles)}

<section class="section" style="padding-top:0;padding-bottom:0;">
  <div class="container">
    <div class="journey" data-stagger role="list" aria-label="Trois étapes : vous écrivez, on reçoit votre message, on répond personnellement sous 24h.">
      <div class="journey-stop" role="listitem"><div class="journey-dot">{ic("pen")}</div><b>Vous écrivez</b><span>Email direct, sans formulaire à rallonge</span></div>
      <div class="journey-stop" role="listitem"><div class="journey-dot">{ic("mail")}</div><b>On la reçoit, vraiment</b><span>Pas de robot, pas de file d'attente</span></div>
      <div class="journey-stop" role="listitem"><div class="journey-dot">{ic("check")}</div><b>Réponse sous 24h</b><span>Personnelle, par la même personne</span></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="contact-grid">
      <div data-reveal>
        <div class="contact-primary">
          <a class="contact-primary-link contact-primary-link--primary" href="tel:{b.PHONE_TEL}" data-cursor-view data-magnetic aria-label="Appeler Growthline au {b.PHONE_HUMAN}">
            <span class="contact-primary-icon" aria-hidden="true">{ic("phone")}</span>
            <span class="contact-primary-body"><span class="contact-primary-label">Par téléphone</span><span class="contact-primary-value">{b.PHONE_HUMAN}</span></span>{ic("arrow")}</a>
          <a class="contact-primary-link" href="mailto:{b.EMAIL}" data-cursor-view data-magnetic>
            <span class="contact-primary-icon" aria-hidden="true">{ic("mail")}</span>
            <span class="contact-primary-body"><span class="contact-primary-label">Par email</span><span class="contact-primary-value">{b.EMAIL}</span></span>{ic("arrow")}</a>
        </div>
        <div class="contact-topics">{topics_html}</div>
        <div class="location-card" id="locationCard" role="button" tabindex="0" aria-expanded="false" aria-label="Localisation de l'agence, à Marseille — cliquer pour agrandir la carte">
          <div class="location-card-map" aria-hidden="true"><span class="location-card-pin"></span></div>
          <div class="location-card-body">
            <div class="location-card-top">{ic("pin")}<span class="location-card-live"><i></i>En activité</span></div>
            <div class="location-card-bottom"><b>Marseille, France</b><span class="location-card-coords">43.2965° N, 5.3698° E</span></div>
          </div>
          <p class="location-card-hint">Cliquez pour agrandir</p>
        </div>
      </div>
      <div class="contact-side" data-stagger>
        <a href="index.html#audit"><span><b>Démarrer un audit gratuit</b><span>Score global et 3 problèmes détectés, sans frais.</span></span>{ic("arrow")}</a>
        <a href="services.html"><span><b>Voir les tarifs</b><span>Analyse, corrections, refonte : prix transparents.</span></span>{ic("arrow")}</a>
        <a href="realisations.html"><span><b>Voir un exemple de rapport</b><span>À quoi ressemble un audit Growthline.</span></span>{ic("arrow")}</a>
      </div>
    </div>
  </div>
</section>

<section class="section" style="padding-top:0;" id="rendez-vous">
  <div class="container">
    <div class="tool-card" data-reveal>
      <span class="eyebrow">Rendez-vous</span>
      <h2 class="display-3" style="margin-top:16px;">Réservez un créneau.</h2>
      <p class="lede" style="margin-top:10px;">Choisissez comment et quand vous préférez qu'on échange — on confirme le créneau par retour d'email.</p>
      <div id="bookingFormWrap">
        <form id="bookingForm" class="audit-form" style="margin-top:26px;" novalidate>
          <input type="hidden" name="type" id="bookingTypeInput" value="Appel téléphonique">
          <div class="slot-toggle" role="radiogroup" aria-label="Type de rendez-vous">
            <button type="button" class="slot-toggle-btn is-active" data-type="Appel téléphonique" role="radio" aria-checked="true">Appel téléphonique</button>
            <button type="button" class="slot-toggle-btn" data-type="Rendez-vous physique" role="radio" aria-checked="false">Rendez-vous physique</button>
          </div>
          <div class="tool-form-grid" style="margin-top:6px;">
            <div class="audit-field"><label for="bookingDate">Date souhaitée</label><input id="bookingDate" name="date" type="date" required></div>
            <div class="audit-field"><label for="bookingTime">Heure souhaitée</label><input id="bookingTime" name="heure" type="time" required></div>
            <div class="audit-field full"><label for="bookingName">Votre nom</label><input id="bookingName" name="nom" type="text" autocomplete="name" required></div>
            <div class="audit-field full"><label for="bookingEmail">Votre email</label><input id="bookingEmail" name="email" type="email" autocomplete="email" required></div>
            <div class="audit-field full"><label for="bookingPhone">Votre téléphone <span id="bookingPhoneHint">(obligatoire pour un appel)</span></label><input id="bookingPhone" name="telephone" type="tel" inputmode="tel" autocomplete="tel" placeholder="06 12 34 56 78" required></div>
            <div class="audit-field full"><label for="bookingNote">Un mot sur votre projet</label><input id="bookingNote" name="projet" type="text" placeholder="Facultatif"></div>
          </div>
          <button type="submit" class="btn btn-solid btn-lg audit-submit"><span class="btn-spinner" aria-hidden="true"></span><span class="btn-label">Confirmer ma demande de créneau</span>{ic("arrow", "arrow")}</button>
          <p class="form-status" id="bookingFormStatus" role="status" aria-live="polite"></p>
        </form>
        <p class="audit-note">Le créneau n'est confirmé qu'après notre retour par email.</p>
      </div>
      <div class="form-confirm" id="bookingConfirm" hidden>
        <div class="form-confirm-check">{ic("check", sw="3")}</div>
        <h3 class="form-confirm-title">Demande envoyée.</h3>
        <p class="form-confirm-recap" id="bookingConfirmRecap">—</p>
        <div class="form-confirm-steps">
          <div class="form-confirm-step is-done"><span class="form-confirm-dot"></span><span>Demande envoyée</span></div>
          <div class="form-confirm-step is-pending"><span class="form-confirm-dot"></span><span>Confirmation par email sous 24h</span></div>
        </div>
        <p class="audit-note">On vous écrit à l'adresse indiquée dès que le créneau est confirmé — pas avant.</p>
        <button type="button" class="btn" id="bookingConfirmReset">Faire une autre demande</button>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container"><p class="statement statement--wide" data-split>Que ce soit un simple audit ou une refonte complète, <em>on répond personnellement</em> à chaque message — pas de robot, pas de file d'attente automatisée.</p></div>
</section>'''
    return b.page("contact.html", "Contact — Growthline, parlons de votre projet",
                  "Contactez Growthline par téléphone, par email ou réservez un créneau : devis pour une correction ou une refonte, réponse sous 24h.", body)


# =============================================================================== INTELLIGENCE
def intelligence(b):
    ic = b.icon
    axes = [("globe", "Site web", "Structure, clarté, accessibilité — les fondations techniques de votre présence en ligne."),
            ("search", "SEO", "Ce qui vous rend trouvable — ou invisible — sur les moteurs de recherche."),
            ("target", "Conversion", "Ce qui pousse — ou freine — un visiteur à devenir client."),
            ("pin", "SEO local", "Votre visibilité pour les recherches proches de chez vous — fiche Google, cohérence des informations."),
            ("users", "Réseaux sociaux", "Présence, cohérence, mise à jour — ce que voient vos prospects avant de vous contacter."),
            ("gauge", "Performance", "Vitesse de chargement, fluidité mobile — chaque seconde perdue coûte des visiteurs.")]
    axes_html = "".join(f'<div class="value-item"><div class="value-icon">{ic(i)}</div><h3>{t}</h3><p>{p}</p></div>' for i, t, p in axes)

    def toggle(sector, label, icon_file, selected=False):
        im = (f'<img class="slot-toggle-icon" src="images/opt/{icon_file}-96.webp" alt="" width="22" height="22">' if icon_file else "🏠 ")
        return (f'<button type="button" class="slot-toggle-btn{" is-active" if selected else ""}" data-sector="{sector}" role="tab" '
                f'aria-selected="{"true" if selected else "false"}" aria-controls="intelDemoCard">{im}{label}</button>')
    for f in ("icon-secteur-restaurant", "icon-secteur-medical", "icon-secteur-ecommerce"):
        b.optimize(f"images/{f}.png", (96,))
    body = f'''
{page_hero("Growthline Intelligence™", "Voyez comment on <em>analyse</em> un site.", "Choisissez un secteur, regardez l'analyse se dérouler — même format que le vrai rapport que vous recevez après un audit.")}

<section class="section" id="intelligence" style="padding-top:0;">
  <div class="container">
    <div class="intel-demo-controls" data-reveal>
      <span class="intel-demo-label">Simuler un audit pour :</span>
      <div class="slot-toggle" id="intelSectorToggle" role="tablist" aria-label="Secteur d'activité">
        {toggle("restaurant", "Restaurant", "icon-secteur-restaurant", True)}{toggle("dentiste", "Cabinet médical", "icon-secteur-medical")}{toggle("artisan", "Artisan", None)}{toggle("boutique", "E-commerce", "icon-secteur-ecommerce")}
      </div>
    </div>
    <div class="tool-card intel-demo-card" id="intelDemoCard" role="tabpanel" tabindex="0" aria-live="polite" data-reveal>
      <div class="signal-card-head"><div class="dots"><span></span><span></span><span></span></div><span class="tag">Growthline Intelligence™ — démo</span></div>
      <div class="intel-demo-scan" id="intelScan"><div class="tool-loading-ring" aria-hidden="true"></div><p class="intel-demo-scan-text" id="intelScanText">Analyse technique et sécurité…</p></div>
      <div id="intelResults" hidden>
        <div class="tool-summary"><div class="signal-score"><span id="intelScoreNum">–</span><span>/100</span></div></div>
        <div class="score-breakdown" id="intelBreakdown"></div>
        <div class="issues-list" id="intelIssues"></div>
      </div>
    </div>
    <p class="disclaimer-note" data-reveal>{ic("info")}Démonstration : aucune vraie analyse n'est effectuée sur cette section. <a href="index.html#audit" style="text-decoration:underline;margin-left:4px;">Lancez votre vrai audit gratuit</a></p>
  </div>
</section>

<section class="section" style="padding-top:0;">
  <div class="container">
    <div class="section-head">
      <div><span class="eyebrow">Ce qu'on regarde</span><h2 class="display-2" data-split style="margin-top:16px;">Six axes, à chaque audit, <em>sans exception.</em></h2></div>
      <p class="lede">Pas une liste de fonctionnalités marketing — les mêmes six catégories, à chaque fois.</p>
    </div>
    <div class="value-grid" data-stagger>{axes_html}</div>
  </div>
</section>

{cta_final(b, "Prêt à voir votre propre score ?", "Ceci était une démo. Votre audit sera réel.", secondary=("realisations.html", "Voir un exemple de rapport"))}'''
    return b.page("growthline-intelligence.html", "Growthline Intelligence™ — démo d'analyse de site",
                  "Simulez un audit Growthline par secteur : score, catégories analysées et problèmes classés par priorité, dans le même format que le vrai rapport.",
                  body, extra_js=("intel-demo.js",))


# =============================================================================== OUTIL AUDIT (interne)
def tool(b):
    ic = b.icon
    body = f'''
{page_hero("Outil interne · usage local", "Analyser un site <em>en profondeur.</em>", "Entrez une adresse de site : des agents IA (qui tournent en local sur cet ordinateur, gratuitement, via Ollama) l'examinent sur 6 catégories et rédigent un rapport en français simple, sans jargon.")}

<section class="section" style="padding-top:0;">
  <div class="container">
    <h2 class="sr-only">Lancer une analyse.</h2>
    <div class="tool-card" data-reveal>
      <form id="toolAuditForm" class="audit-form tool-form-grid" novalidate>
        <div class="audit-field full"><label for="toolUrl">Adresse du site (obligatoire)</label><input id="toolUrl" name="url" type="text" placeholder="exemple-entreprise.fr" required></div>
        <div class="audit-field"><label for="toolName">Nom de l'entreprise</label><input id="toolName" name="name" type="text" placeholder="Facultatif"></div>
        <div class="audit-field"><label for="toolCity">Ville</label><input id="toolCity" name="city" type="text" placeholder="Facultatif, utile pour le SEO local"></div>
        <button type="submit" class="btn btn-solid btn-lg audit-submit" style="grid-column:1/-1;">Lancer l'analyse {ic("arrow", "arrow")}</button>
      </form>
    </div>
    <div class="tool-loading" id="toolLoading" hidden>
      <div class="tool-loading-ring" aria-hidden="true"></div>
      <p class="tool-loading-text" id="toolLoadingText">Récupération du site…</p>
      <p class="tool-loading-note">Ça tourne en local sur cet ordinateur (pas de cloud, pas de coût) — comptez plusieurs minutes selon la taille du site. Ne fermez pas cette page.</p>
    </div>
    <div class="tool-error" id="toolError" role="alert" hidden></div>
    <div id="toolResults" hidden>
      <div class="tool-legend">
        <div class="tool-legend-item"><b>Site web</b><span>La base technique : le site s'affiche-t-il correctement et de façon sécurisée ?</span></div>
        <div class="tool-legend-item"><b>SEO</b><span>Est-ce que Google comprend bien votre site, pour vous montrer dans ses résultats ?</span></div>
        <div class="tool-legend-item"><b>Conversion</b><span>Une fois sur votre site, est-ce facile de vous contacter ou de passer à l'action ?</span></div>
        <div class="tool-legend-item"><b>SEO local</b><span>Les habitants de votre ville peuvent-ils facilement vous trouver et vous faire confiance ?</span></div>
        <div class="tool-legend-item"><b>Réseaux sociaux</b><span>Vos réseaux sociaux sont-ils bien reliés à votre site ?</span></div>
        <div class="tool-legend-item"><b>Performance</b><span>Le site se charge-t-il vite ? Un site lent fait fuir les visiteurs.</span></div>
      </div>
      <div class="tool-severity-legend">
        <span class="tool-severity-chip strength"><i></i>Point fort — à garder tel quel</span>
        <span class="tool-severity-chip critical"><i></i>Critique — à corriger en priorité</span>
        <span class="tool-severity-chip important"><i></i>Important — un vrai souci, moins urgent</span>
        <span class="tool-severity-chip opportunity"><i></i>Opportunité — une amélioration possible</span>
      </div>
      <div class="tool-summary">
        <div class="signal-score" id="toolScoreOverall">–<span>/100 aujourd'hui</span></div>
        <div class="signal-score" id="toolScorePotential" style="color:var(--blue);">–<span>/100 potentiel estimé</span></div>
      </div>
      <div class="score-breakdown" id="toolScoreBreakdown"></div>
      <div class="issues-list" id="toolIssuesList"></div>
    </div>
  </div>
</section>'''
    return b.page("outil-audit.html", "Outil d'analyse de site — Growthline (usage interne)",
                  "Outil interne Growthline : analyse d'un site sur 6 catégories par des agents IA exécutés en local.",
                  body, robots="noindex, nofollow", extra_js=("outil-audit.js",))


# =============================================================================== MENTIONS LÉGALES
def legal(b):
    main = (SRC / "legal-main.html").read_text(encoding="utf-8")
    return b.page("mentions-legales.html", "Mentions légales — Growthline",
                  "Mentions légales et politique de confidentialité de Growthline.", "\n" + main[len("<main>"):-len("</main>")] if False else main[len("<main>"):-len("</main>")],
                  robots="noindex, follow")


def render_all(b):
    return {"index.html": home(b), "services.html": services(b), "realisations.html": realisations(b), "a-propos.html": about(b),
            "contact.html": contact(b), "growthline-intelligence.html": intelligence(b), "outil-audit.html": tool(b),
            "mentions-legales.html": legal(b)}
