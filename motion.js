/* Growthline — couche d'interactions premium (GSAP + ScrollTrigger, en plus du
   système de reveal CSS existant, pas à sa place : IntersectionObserver reste
   pour les sections, GSAP gère ce que le CSS seul ne peut pas bien faire —
   chorégraphie d'entrée du hero, boutons magnétiques, parallax profondeur). */
(function () {
  'use strict';
  if (!window.gsap) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- 1. Chorégraphie d'entrée du hero (page d'accueil uniquement :
     seule page dont le hero n'a aucune animation d'apparition aujourd'hui —
     proposition*.html l'ont déjà en CSS pur, vision.html a son propre système). */
  (function heroEntrance() {
    var hero = document.querySelector('.hero .hero-content');
    if (!hero || reduced) return;

    var eyebrow = hero.querySelector('.eyebrow');
    var h1 = hero.querySelector('h1');
    var sub = hero.querySelector('p.sub');
    var ctas = hero.querySelector('.hero-ctas');
    var stats = hero.querySelectorAll('.hero-stat');
    var visual = document.querySelector('.hero-visual');

    var targets = [eyebrow, h1, sub, ctas].filter(Boolean);
    if (!targets.length) return;

    gsap.set(targets, { opacity: 0, y: 26 });
    if (stats.length) gsap.set(stats, { opacity: 0, y: 16 });
    if (visual) gsap.set(visual, { opacity: 0, y: 30, scale: 0.97 });

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });
    tl.to(targets, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 });
    if (stats.length) tl.to(stats, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, '-=0.4');
    if (visual) tl.to(visual, { opacity: 1, y: 0, scale: 1, duration: 1 }, '-=0.9');
  })();

  /* ---------- 2. Boutons magnétiques (survol souris fine uniquement) ---------- */
  (function magneticButtons() {
    if (!canHover || reduced) return;
    var buttons = document.querySelectorAll('.btn-solid, .hero-ctas .btn, .cta-row .btn, .split-cta, .final-cta .btn');
    buttons.forEach(function (btn) {
      var strength = 0.35;
      var xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      var yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var relX = e.clientX - (rect.left + rect.width / 2);
        var relY = e.clientY - (rect.top + rect.height / 2);
        xTo(relX * strength);
        yTo(relY * strength);
      });
      btn.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });
  })();

  /* ---------- 3. Parallax profondeur souris sur la carte hero (dashboard mock) ---------- */
  (function heroVisualParallax() {
    if (!canHover || reduced) return;
    var stage = document.querySelector('.hero-visual');
    var card = stage && stage.querySelector('.scan-window, .gauge-card');
    if (!stage || !card) return;

    var rotX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    var rotY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    gsap.set(card, { transformPerspective: 900, transformOrigin: 'center' });

    stage.addEventListener('mousemove', function (e) {
      var rect = stage.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      rotY(px * 8);
      rotX(py * -8);
    });
    stage.addEventListener('mouseleave', function () { rotX(0); rotY(0); });
  })();

  /* ---------- 4. Timeline "Processus" : ligne de connexion qui se remplit au scroll,
     + halo séquentiel sur chaque icône d'étape (donne l'effet "connexion" sans
     restructurer la grille existante). ---------- */
  (function stepsTimeline() {
    if (!window.ScrollTrigger) return;
    var fill = document.getElementById('stepsProgressFill');
    var steps = document.querySelectorAll('.step-card');
    if (!fill || !steps.length) return;

    if (!reduced) {
      gsap.to(fill, {
        width: '100%', ease: 'none',
        scrollTrigger: { trigger: '.steps', start: 'top 75%', end: 'bottom 60%', scrub: 0.4 }
      });
      gsap.set(steps, { opacity: 0, y: 24 });
      gsap.to(steps, {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.steps', start: 'top 82%' }
      });
    } else {
      fill.style.width = '100%';
    }
  })();

  /* ---------- 5. Parallax profondeur au scroll (fond IA en arrière-plan) ---------- */
  (function bgParallax() {
    if (reduced || !window.ScrollTrigger) return;
    var grid = document.querySelector('.ai-grid');
    if (!grid) return;
    gsap.to(grid, {
      yPercent: 14,
      ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.6 }
    });
  })();
})();
