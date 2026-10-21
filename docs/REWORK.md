# Rework Growthline — « Septième ciel »

Refonte complète du site (octobre 2026). Le logo (`images/logo-growthline-pastel-icon.png`) et le texte des mentions légales
(`_src/legal-main.html`, repris à l'identique) n'ont pas été modifiés.

## Ce qui a changé

| Domaine | Avant | Maintenant |
|---|---|---|
| Direction artistique | pastel beige/vert, très minimaliste | ciel bleu + nuages WebGL, verre dépoli, sections « nuit » étoilées, dégradés or/violet |
| Typographie | Inter Tight + Instrument Serif (Google Fonts distant) | **Bricolage Grotesque** (titres) + **Inter Tight** (texte) + **Instrument Serif italique** (mots d'accent), tout **hébergé en local** (woff2, `font-display: swap`) |
| Hero | vidéo 30 Mo en autoplay | ciel WebGL (`cloud-shader.js`), titre découpé mot par mot, boucle vidéo de 0,6 Mo, showreel (30 Mo) chargé **uniquement au clic** |
| Intro | logo + vol FLIP | intro nuage : logo, nom lettre par lettre, compteur, nuages qui s'écartent ; 1 fois par session, bouton « Passer », touche/molette/toucher pour sauter |
| Animations | GSAP depuis un CDN | GSAP 3.13 + ScrollTrigger + SplitText hébergés en local : révélations, compteurs, parallax, tilt 3D des cartes, boutons magnétiques, curseur, processus **épinglé** avec ligne qui se remplit, zoom des visuels, transitions de page |
| Pages | 7 pages + 20 doublons « - Copie » | 8 pages générées, doublons archivés hors dépôt |
| Images | JPG/PNG jusqu'à 1,8 Mo | variantes WebP responsives (`images/opt/`), `width/height`, lazy-loading |

## Ce que nous recommandons aux clients, appliqué sur notre site

* **Performance** : CSS minifié (68 Ko), JS unique minifié (148 Ko dont GSAP), polices préchargées et locales, images WebP, vidéos chargées à la demande,
  cache long (`render.yaml`), shader différé après le chargement, résolution du ciel réduite et **qualité adaptative** (le ciel baisse sa résolution
  si l'appareil rame), pause hors écran / onglet masqué.
* **Accessibilité** : audit axe-core (WCAG 2.1 AA + bonnes pratiques) **sans violation** sur les 8 pages ; lien d'évitement, `aria-current`, FAQ en
  accordéon `aria-expanded/controls`, focus visible, contrastes AA, `prefers-reduced-motion` (aucune animation, contenu immédiatement visible),
  pages utilisables **sans JavaScript**.
* **SEO** : `title`/`description`/canonical/Open Graph/Twitter par page, JSON-LD (`ProfessionalService`, `FAQPage`), `sitemap.xml`, `robots.txt`
  (l'outil interne `outil-audit.html` et les mentions légales sont en `noindex`).
* **Conversion** : un CTA principal par écran, téléphone et audit toujours à portée (en-tête, hero, pied de page), formulaire d'audit en 2 champs.
* **Responsive** : testé à 390 px, 768 px et 1440 px (aucun débordement horizontal), menu plein écran sur mobile.

## Choix et sources

* Inspirations : sites d'agences primés (révélations de titres, sections épinglées, curseur, transitions de page), composants de 21st.dev
  (carte de verre, marquee, boutons à reflet) réécrits en CSS/JS natif ; **GSAP** (gratuit, y compris les plugins, licence standard GSAP
  — https://gsap.com/standard-license) ; shader **CloudShader** fourni, porté en JavaScript natif (`_src/js/cloud-shader.js`).
* **Licences des polices** : Bricolage Grotesque, Inter Tight et Instrument Serif sont sous **SIL Open Font License 1.1** (usage commercial libre,
  fichiers issus de `@fontsource`). **« CS Bard »** (Craft Supply Co.) demandé par erreur sous le nom « CS Baird » : sa version gratuite
  est *réservée à un usage personnel* ; elle n'est donc **pas** embarquée. Aucune police dafont/FontSpace n'est utilisée tant qu'une licence
  commerciale n'est pas achetée.
* Vendors dans `assets/vendor/` : `gsap.min.js`, `ScrollTrigger.min.js`, `SplitText.min.js` (3.13.0). `Flip.min.js` est présent mais non chargé.

## Comment tout modifier

Les pages HTML sont **générées** (mais committées, le site reste un dossier statique) :

```
python _src/build.py          # depuis la racine : CSS/JS/pages/sitemap
python _src/check_links.py    # liens, images et ancres
```

* Textes et structure des pages : `_src/pages.py` (le texte d'origine y est repris tel quel).
* En-tête, pied de page, icônes, métadonnées : `_src/build.py`.
* Styles : `_src/css/00-base.css` (tokens : couleurs, polices, rayons), `10-layout.css`, `20-components.css`, `30-pages.css`.
* Ciel et nuages : `_src/js/cloud-shader.js` (options `speed`, `count`, `cloudColor`, `skyTopColor`, `skyBottomColor`, `scale`) ;
  attributs `data-count` et `data-speed` sur `<canvas data-cloud-shader>`. `?forcegl` dans l'URL force le shader même en rendu logiciel.
* Animations : `_src/js/motion.js` (attributs : `data-split`, `data-reveal`, `data-stagger`, `data-count`, `data-magnetic`, `data-parallax`, `data-cursor-view`).
* Minification JS : `build.py` utilise `esbuild` s'il est dans le PATH (variable `ESBUILD`), sinon laisse le JS du site non minifié.
* Images : déposer le JPG/PNG dans `images/`, l'appeler avec `pic("images/x.jpg", "texte alternatif")` dans `pages.py` ; les variantes WebP sont créées automatiquement.
* Mouvements désactivés sans JS ou si l'utilisateur le demande : rien à faire, c'est géré.
* Pour revoir l'intro : vider `sessionStorage` (ou nouvel onglet privé). Elle ne se joue pas pour les robots (`navigator.webdriver`).

## Points d'attention

1. `mentions-legales.html` contient encore le champ à compléter « Ton prénom et nom » (directeur de la publication) et indique un hébergement
   chez Vercel alors que le déploiement (`render.yaml`) est sur Render : à vérifier par le propriétaire. Le texte n'a pas été modifié.
2. L'envoi des formulaires passe par FormSubmit (compte e-mail à activer au premier envoi), comme avant.
3. `outil-audit.html` appelle `/api/audit` (serveur local `server/`) : il ne fonctionne pas sur l'hébergement statique ; il est en `noindex`.
4. Lighthouse (Chrome headless sans GPU) : accessibilité, bonnes pratiques et SEO à 100 ; la note de performance est faussée par le rendu
   logiciel du lab et les ressources non compressées du serveur de test — mesurer sur le site déployé (gzip/brotli) avec PageSpeed Insights.


---

## Version 2 — hero « Reel » (octobre 2026)

Demande : la vidéo du hero d'origine (le showreel de marque) revient, **beaucoup plus grande**, avec une apparition spectaculaire et une animation de scroll
inspirée de 21st.dev.

### Ce qui a changé
* **Vidéo** : `video/growthline-hero-reel.mp4` = le showreel d'origine (`growthline-showreel.mp4`, 42 s) ré-encodé pour le web : 1080p, 30 i/s, **sans piste audio**,
  7,2 Mo (au lieu de 30 Mo). Version `growthline-hero-reel-sm.mp4` (720p, 2,2 Mo) servie automatiquement en dessous de 920 px de large. Poster : `images/hero-showreel-poster.jpg`
  (préchargé). Le showreel complet avec le son (30 Mo) n'est toujours chargé qu'**au clic** sur « Regarder avec le son » (modal FLIP existant, `film-modal.js`).
* **Taille** : le cadre fait jusqu'à `min(96 vw, 88 svh × 16/9, 1760 px)`, soit ≈ 1 380 × 775 px sur un écran 1440 × 900 (avant : ≈ 620 × 390 px).
* **Apparition** (`revealReel` dans `_src/js/motion.js`, juste après l'intro) : le cadre monte en flou net (blur 16 px → 0), grandit de 60 % à 100 %, la vidéo s'ouvre par un
  **masque circulaire** depuis le centre, deux **anneaux d'onde** et 18 **étincelles** jaillissent, le **halo** lumineux respire derrière, et un **reflet** balaie la vidéo toutes les ~8 s.
  Un liseré dégradé (or / rose / violet / vert / bleu) **tourne autour du cadre** en continu.
* **Animation de scroll** (`setupReel`) : écran de verre en perspective 3D (`rotateX 20° → 0`, `scale .8 → 1`) qui se redresse et grandit pendant le défilement,
  titre qui recule, halo qui s'étend, puis la vidéo reste **épinglée plein cadre pendant 70 % de la hauteur d'écran** avant de repartir. Le ciel (canvas WebGL) reste collé à l'écran
  pendant l'épinglage (`position: sticky`, un seul canvas de la taille de la fenêtre). Sur mobile (≤ 920 px) : version allégée (inclinaison 9° → 0, pas d'épinglage).
* **Autres animations** (`setupSectionEffects`) : sections « nuit » et pied de page qui s'ouvrent comme un **rideau** (`clip-path` arrondi → plein), **textes qui se composent** ligne par ligne
  (SplitText, masques), cartes à **vitesses de parallaxe différentes** (profondeur), **bandeau qui s'incline** avec la vitesse de défilement, curseur « **Lire** » sur les vidéos
  (`data-cursor-label`), parallaxe du pointeur sur la vidéo.
* **PC faible** : après l'apparition, `watchFps()` mesure la fluidité (2 × 2,5 s). Sous 28 i/s, la classe `lowfx` coupe halo, reflet, flou d'apparition, rideaux, et ralentit le liseré.
  `?fx` dans l'URL désactive ce garde-fou (tests). `prefers-reduced-motion` : aucune animation, le cadre s'affiche à plat, plein format, immédiatement.

### Composants 21st.dev (inspiration ; le code est réécrit en JavaScript natif + GSAP, aucun code copié)
Le code source de ces composants n'est pas lisible sans compte/clé 21st (installation shadcn). Candidats trouvés, à choisir par le propriétaire :
1. **Container Scroll Animation** (Aceternity / Manu Arora, MIT) — carte 3D qui se redresse au scroll : https://21st.dev/@manuarora700/components/container-scroll-animation
   → **implémenté** (rotateX + scale + titre qui recule), combiné avec l'effet 3.
2. **Scroll Expansion Hero** (arunachalam, MIT) — le média s'agrandit jusqu'au plein écran : https://21st.dev/@arunachalam/components/scroll-expansion-hero
   → **implémenté** (agrandissement + épinglage plein cadre).
3. **Video Scroll Hero** (isaiahbjork, licence inconnue) : https://21st.dev/@isaiahbjork/components/video-scroll-hero — vidéo à 25 % qui grandit.
4. **Scroll Animated Video** (lovesickfromthe6ix, GSAP + Lenis, licence inconnue) : https://21st.dev/@lovesickfromthe6ix/components/scroll-animated-video — conteneur épinglé avec overlay qui se révèle.
Si l'onglet 21st du propriétaire montre une autre animation, donner son adresse : elle se branche dans `setupReel()`.

### Où modifier
* Structure : `_src/pages.py` (`<div class="reel">…`), styles : `_src/css/10-layout.css` (bloc « Hero Reel »), animations : `_src/js/motion.js` (`revealReel`, `setupReel`, `setupSectionEffects`, `watchFps`).
* Régler l'épinglage : `end: '+=70%'` dans `setupReel`. Taille du cadre : `.reel-frame { width: … }`.
* Ré-encoder la vidéo (ffmpeg) : `ffmpeg -i video/growthline-showreel.mp4 -an -vf fps=30 -c:v libx264 -preset medium -crf 27 -pix_fmt yuv420p -movflags +faststart video/growthline-hero-reel.mp4`.
* Tests visuels : script Node via le protocole de débogage de Chrome (captures dans `Bureau\growthline-apercuv2\`). Astuce : `html { scroll-behavior: smooth }` ralentit les `scrollTo` en test ; utiliser `behavior: 'instant'`.

### Limites connues
* Rendu vérifié en **logiciel (SwiftShader)** seulement : pas de GPU réel, pas de mesure sur le PC à Intel HD 530. Le garde-fou `lowfx` est prévu pour ce cas.
* L'intro d'ouverture n'a pas pu être rejouée en test automatisé (Chrome pilotable impose `navigator.webdriver`), mais l'apparition du Reel est branchée sur le même point de départ (`startHero`).


---

## Version 3 — « Voler vers le septième ciel » (octobre 2026)

Demande : corriger le titre du hero qui restait invisible quand on remonte tout en haut, rendre le défilement plus fluide, pousser l'esprit « 21st » (voyage au scroll,
on vole, on monte au septième ciel) et ajouter les tarifs de sous-traitance.

### 1. Bug du hero invisible au retour en haut — cause et correctif
* **Cause** : les animations de scroll du hero (`setupReel`, `setupScrollEffects`) utilisaient `gsap.to(...)` avec `invalidateOnRefresh`. Au `refresh()` (rechargement au milieu de la page,
  redimensionnement, retour navigateur, chargement tardif de la vidéo/polices) GSAP **relit l'état courant** de l'élément comme valeur de départ : si l'élément était déjà à moitié estompé,
  « la valeur initiale » devenait 0,3 et le titre restait à 30 % d'opacité même une fois revenu à `scrollY = 0`.
* **Correctif** : tous les tweens pilotés par le scroll sont des `fromTo` avec des valeurs de départ **explicites** (`opacity: 1`, `y: 0`, `scale`, `yPercent: 0`…).
* **Test automatisé** : `_src/tests/hero_visible.mjs` (Node 22+ + Chrome headless, protocole de débogage, temps réel). Vérifie par `getComputedStyle` que badge, titre, sous-titre, boutons et liste de preuves
  sont visibles (opacité cumulée > 0,95, dans le viewport) après : chargement, 3 allers-retours instantanés, molette rapide bas/haut, rechargement au milieu de la page, redimensionnement, retour navigateur.
  Avant le correctif : 4 échecs (opacité 0,3 bloquée) ; après : tout est visible. Lancer : `python -m http.server 8821` à la racine puis `node _src/tests/hero_visible.mjs`.

### 2. Défilement fluide
* **Lenis 1.3.26** (MIT, `assets/vendor/lenis.min.js`, téléchargé depuis jsDelivr) synchronisé avec ScrollTrigger : `lenis.on('scroll', ScrollTrigger.update)`, une seule boucle `gsap.ticker`, `lagSmoothing(0)`.
  Inertie à la molette ; **tactile natif** (pas de `syncTouch`). Désactivé en `prefers-reduced-motion` (motion.js ne s'exécute pas). `?nolenis` dans l'URL le coupe (test).
* Les ancres (`#audit`, `#faq`…) glissent avec inertie et tiennent compte de l'en-tête ; menu mobile, lightbox et vidéo modale arrêtent Lenis (`body.style.overflow = 'hidden'`).
* Autres gains de fluidité : pas de cibles GSAP vides (avertissements supprimés), `ScrollTrigger.refresh()` après `load`, couche d'ambiance en `contain: strict`, uniquement transform/opacity.

### 3. « Septième ciel » — l'ascension (`_src/js/ascent.js`, `_src/css/40-ascent.css`)
* **Ciel du hero piloté par le scroll** (`cloud-shader.js`, nouveaux uniforms `u_alt`, `u_warm` via `window.__glSky`) : en défilant, les nuages descendent (on monte), l'horizon se réchauffe, le soleil se couche.
* **Nuages d'avant-plan** qui traversent l'écran DEVANT le contenu, **avions en papier**, **rayons de soleil** dans le hero, **étoiles filantes** dans les sections nuit et le pied de page.
* **Ambiance** : dégradé fixe en haut/bas d'écran qui évolue du bleu du jour à l'or du soleil couchant puis à la nuit, selon la progression dans la page.
* **Jauge d'altitude** (≥ 1100 px) : sept « ciels » du Sol au 7ᵉ ciel, qui se remplit ; elle s'efface pendant que la vidéo est plein écran.
* **Cartes qui s'élèvent puis se posent** (`scale` + légère rotation en scrub), logo qui plane, bouton doré qui respire.
* **Atterrissage au 7ᵉ ciel** : en arrivant sur « Prêt à monter au septième ciel ? » (pied de page de toutes les pages), explosion douce de lumière + confettis dorés (canvas 2D, ~100 particules, une fois).
* **Garde-fous** : tout est coupé par `.lowfx` (FPS < 28), allégé sur mobile (2 nuages, pas de jauge ni d'étoiles filantes hors pied de page), absent en mouvement réduit.
* Réglages : durées/cycles dans `ascent.js` (`cyc`, `frac`), couleurs `DAY`/`GOLD`/`NIGHT`, intensité des nuages (`.46`) ; CSS dans `40-ascent.css`.

### 4. Page « Sous-traitance » (`sous-traitance.html`)
* **Aucun prix, délai ni promesse n'est écrit dans le code.** Tout vient de `_src/data/tarifs_sous_traitance.json`.
* Tant que tous les `prix` valent `null`, la page affiche un bloc « **Tarifs sur devis** » (aucun chiffre) avec un lien e-mail.
* **Pour publier vos tarifs** : ouvrez `_src/data/tarifs_sous_traitance.json`, renseignez pour chaque forfait `prix` (nombre en euros), éventuellement `prefixe` (« À partir de »), `unite` (« par site, HT »),
  `delai`, la liste `inclus` et la `note` générale (conditions, remise de volume, TVA…), puis `python _src/build.py`. La grille apparaît dès qu'un prix est renseigné ; un forfait sans prix reste « Sur devis ».
* Liens ajoutés : navigation principale, pied de page, sitemap. Le numéro de téléphone devient une pastille d'icône sous 1280 px (7 liens dans l'en-tête).
* Aucun texte légal (mention de non-engagement, TVA, CGV) n'a été inventé : à fournir par le propriétaire.

### Limites connues (version 3)
* Rendu vérifié en logiciel (SwiftShader) ; fluidité réelle de Lenis et des couches fixes non mesurée sur GPU ni sur Intel HD 530 (garde-fou `lowfx` en secours).
* Les photos de captures du dossier `growthline-apercu/v3/` sont des images fixes : le mouvement (nuages, avions, confettis) ne s'y voit pas.

## v5 — fonds variés et décors vivants (branche `rework-v5-fonds-animations`)

* **6 ambiances de fond** (`_src/css/50-fonds.css`, 100 % CSS, aucune image) : `bg-aurora` (halos bleu / violet / menthe), `bg-grid` (trame + halo qui suit le curseur),
  `bg-warm` (papier crème, halos pêche, grain), `bg-sunset` (lilas → pêche, disque solaire), `bg-mint` (menthe + cercles), `bg-nebula` (nuit, nébuleuse violet / rose).
  Elles sont posées par section dans `_src/pages.py` ; les pages sans classes explicites alternent automatiquement (bleuté / crème).
  Les sections se chevauchent légèrement (coins arrondis en haut) : effet de panneaux empilés.
* **Décors vivants** (`_src/js/motion3.js` + `_src/css/55-fonds-mouvement.css`) : impulsions lumineuses sur la grille, bulles de lumière qui montent (coucher de soleil),
  ondes qui s'étendent (menthe), cercles qui flottent (papier), étoiles filantes (nébuleuse), halos qui dérivent et montent plus lentement que la page (parallaxe CSS
  `animation-timeline: view()` quand le navigateur la gère), bandeaux dont la vitesse suit celle du défilement.
* **Légèreté** : transform / opacity uniquement ; animations en pause hors écran (IntersectionObserver) ; moitié moins de décors sur PC faible ; aucun requestAnimationFrame
  permanent ; rien si « réduire les animations » (`html.anim` absent) ; décors masqués en CSS pour `prefers-reduced-motion`.
* **Vérifié** : captures headless (bureau et mobile 390 px) de toutes les sections, tests `hero_visible`, `nav`, `warn` OK, aucune erreur console.
