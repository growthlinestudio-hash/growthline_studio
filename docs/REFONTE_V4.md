# Refonte v4 — site Growthline, repartie de zéro

Objectif : un site **propre, rapide, clair**, pour qu'un artisan ou un commerçant comprenne en 10 secondes ce que fait Growthline,
pourquoi c'est utile et comment le contacter. Plus de ciel WebGL, d'intro, de GSAP, de curseur ni de vidéos : une page = 1 CSS (≈12 Ko) + 1 JS (≈1 Ko).

## Ce qui est conservé
Logo (`images/logo-growthline-pastel-icon.png`), texte des mentions légales (`_build/legal-main.html`, intact), offres et tarifs réels
(aperçu gratuit, analyse 99 €, corrections dès 450 €, refonte dès 890 €, carte NFC 50 € « bientôt »), coordonnées, FAQ, grille sous-traitance
pilotée par `_build/tarifs_sous_traitance.json` (aucun chiffre tant que tous les prix valent `null`), règles d'honnêteté (exemples étiquetés « illustratifs »,
aucune statistique, aucun client ni avis inventé).

## Pages
`index` · `services` (offres + tarifs + FAQ) · `realisations` (exemple d'audit illustratif + styles par métier) · `sous-traitance` · `a-propos` · `contact` ·
`mentions-legales` (noindex) · `404` (noindex). Anciennes pages `outil-audit` et `growthline-intelligence` retirées du site (copies dans `growthline-site-archive-copies/`).

## SEO / accessibilité / performance
Un `h1` par page, `title` ≤ 70 car. et `description` 70–170 car., canonical, Open Graph, JSON-LD `ProfessionalService` et `FAQPage`, `sitemap.xml`
(hors noindex), images WebP responsives avec dimensions et `alt`, polices locales préchargées, `prefers-reduced-motion`, lien d'évitement, focus visible,
formulaires étiquetés, FAQ en `<details>` (sans JS), menu mobile accessible (Échap, `aria-expanded`). Aucun script tiers.

## Modifier
```
python _build/build.py   # régénère pages, assets/, sitemap.xml
python _build/check.py   # liens, ancres, images, titres, descriptions, sitemap
```
Contenu et pages : `_build/build.py` · styles : `_build/style.css` · menu/formulaires : `_build/site.js`.

## Déploiement
Branche `refonte-v4`, **commits locaux seulement** (rien poussé, rien déployé). Pour mettre en ligne : fusionner dans `main` puis `git push` (Vercel).
Retour arrière possible : l'ancien site (v3 « Septième ciel ») reste dans l'historique git (commit f9eefe0).
Reste à faire par vous : compléter le « Directeur de la publication » dans les mentions légales ; ajouter un vrai client dans Réalisations dès qu'il existe.
