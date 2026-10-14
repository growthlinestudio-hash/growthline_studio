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
