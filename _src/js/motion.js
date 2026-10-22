/* Growthline — mise en mouvement (GSAP 3.13 + ScrollTrigger + SplitText, hébergés en local).
   Tout est un enrichissement : sans GSAP, avec prefers-reduced-motion ou sans JavaScript,
   le contenu reste visible et utilisable (voir les règles html.anim dans 00-base.css). */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || reduced) {
    root.classList.remove('has-intro', 'nav-in');
    var intro0 = document.getElementById('intro'); if (intro0) intro0.remove();
    return;
  }
  var gsap = window.gsap;
  gsap.registerPlugin.apply(gsap, [window.ScrollTrigger, window.SplitText].filter(Boolean));
  window.__glAnimReady = true;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var EASE = 'power3.out';

  /* ---------------------------------------------------------------- Intro */
  var introEl = $('#intro');
  var heroStarted = false;
  var introTl = null;

  function runIntro(done) {
    var word = $('.intro-word', introEl);
    var text = word.textContent; word.textContent = ''; word.setAttribute('aria-label', text);
    Array.prototype.forEach.call(text, function (ch) {
      var s = document.createElement('span'); s.className = 'lw'; s.setAttribute('aria-hidden', 'true'); s.textContent = ch; word.appendChild(s);
    });
    var counter = { v: 0 }, count = $('.intro-count', introEl), bar = $('.intro-bar span', introEl);
    var tl = gsap.timeline({ defaults: { ease: EASE }, onComplete: function () { introEl.remove(); root.classList.remove('has-intro'); done(); } });
    introTl = tl;
    tl.fromTo('.intro-mark', { scale: .55, rotate: -12 }, { scale: 1, rotate: 0, duration: .9, ease: 'back.out(1.8)' }, 0)
      .fromTo('.intro-ring', { scale: .7, opacity: 0 }, { scale: 1.25, opacity: .9, duration: .8 }, .15)
      .to('.intro-ring', { opacity: 0, duration: .5 }, .95)
      .to('.intro-word .lw', { yPercent: 0, y: 0, opacity: 1, duration: .8, stagger: .045, startAt: { y: 60 } }, .35)
      .to('.intro-tag', { opacity: 1, y: 0, duration: .7, startAt: { y: 14 } }, .85)
      .to('.intro-meter', { opacity: 1, duration: .5 }, .7)
      .to(counter, { v: 100, duration: 1.45, ease: 'power1.inOut', onUpdate: function () {
        var v = Math.round(counter.v); count.textContent = (v < 10 ? '0' : '') + v + ' %'; bar.style.transform = 'scaleX(' + (counter.v / 100) + ')';
      } }, .55)
      // les nuages s'écartent, le titre se dévoile
      .addLabel('part', 2.15)
      .to('.intro-core', { scale: 1.35, opacity: 0, duration: .8, ease: 'power2.in' }, 'part')
      .to('.intro-skip', { opacity: 0, duration: .3 }, 'part')
      .to('.intro-cloud--l', { xPercent: -135, duration: 1.25, ease: 'power3.inOut' }, 'part+=.1')
      .to('.intro-cloud--r', { xPercent: 135, duration: 1.25, ease: 'power3.inOut' }, 'part+=.1')
      .to(introEl, { backgroundColor: 'rgba(0,0,0,0)', opacity: 0, duration: .8, ease: 'power1.inOut' }, 'part+=.55')
      .add(function () { startHero(); }, 'part+=.45');

    function skip() { tl.timeScale(4); }
    $('.intro-skip', introEl).addEventListener('click', skip);
    ['keydown', 'wheel', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, skip, { once: true, passive: true }); });
  }

  /* ---------------------------------------------------------------- Hero */
  function startHero() {
    if (heroStarted) return; heroStarted = true;
    var hero = $('.hero, .page-hero');
    if (!hero) return;
    var tl = gsap.timeline({ defaults: { ease: EASE } });
    var eyebrow = $('.eyebrow', hero), h1 = $('h1', hero);
    if (eyebrow) tl.fromTo(eyebrow, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, 0);
    if (h1 && h1.__split) tl.add(function () { h1.__split.play(); }, .1);
    else if (h1) tl.fromTo(h1, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, .1);
    var parts = $$('.lede, .hero-ctas, .hero-proof-list', hero), cards = $$('.hero-card', hero), chips = $$('.hero-chip, .bubble', hero), cue = $$('.scroll-cue', hero);
    if (parts.length) tl.fromTo(parts, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .1, clearProps: 'transform,opacity' }, .15);
    if (cards.length) tl.fromTo(cards, { y: 70, opacity: 0, scale: .92, rotate: 6 }, { y: 0, opacity: 1, scale: 1, rotate: 1.6, duration: 1.3, ease: 'expo.out' }, .35);
    if (chips.length) tl.fromTo(chips, { scale: .4, opacity: 0 }, { scale: 1, opacity: 1, duration: .9, stagger: .14, ease: 'back.out(2)', clearProps: 'transform,opacity' }, hero.querySelector('.reel') ? 1.9 : .9);
    if (cue.length) tl.fromTo(cue, { opacity: 0 }, { opacity: 1, duration: 1 }, 1.6);
    revealReel(hero, tl);
    root.classList.add('hero-ready');
  }


  /* ------------------------------------- Hero « Reel » : apparition de la vidéo */
  function revealReel(hero, tl) {
    var intro = $('.reel-intro', hero);
    if (!intro) return;
    var frame = $('.reel-frame', intro), vid = $('.reel-video', intro), halo = $('.reel-halo', hero), glint = $('.reel-glint', intro);
    var low = root.classList.contains('lowfx');
    // état de départ : disque fermé au centre, cadre réduit, flou et décalé vers le bas
    gsap.set(vid, { clipPath: 'circle(0% at 50% 42%)' });
    tl.fromTo(intro, { opacity: 0, y: 150, scale: .6, rotationZ: -2.5, filter: low ? 'none' : 'blur(16px)' },
        { opacity: 1, y: 0, scale: 1, rotationZ: 0, filter: low ? 'none' : 'blur(0px)', duration: 1.8, ease: 'expo.out', clearProps: 'filter,rotation' }, .3)
      .to(vid, { clipPath: 'circle(80% at 50% 42%)', duration: 2.1, ease: 'power3.inOut', onComplete: function () { gsap.set(vid, { clearProps: 'clipPath' }); } }, .4);
    if (halo) tl.fromTo(halo, { opacity: 0 }, { opacity: .85, duration: 1.8, ease: 'power2.out', clearProps: 'opacity' }, .3);
    // anneaux d'onde et étincelles qui jaillissent du centre
    tl.add(function () { burst(intro); }, .95);
    // reflet qui balaie la vidéo, puis revient toutes les quelques secondes
    if (glint && !low) {
      var g = gsap.timeline({ repeat: -1, repeatDelay: 6, delay: 2.4 });
      g.set(glint, { xPercent: -75, opacity: 0 }).to(glint, { opacity: 1, duration: .25 }, 0)
        .to(glint, { xPercent: 75, duration: 1.7, ease: 'power2.inOut' }, 0).to(glint, { opacity: 0, duration: .35 }, 1.4);
    }
    // la vidéo se lance dès que le cadre apparaît
    var v = $('video', vid); if (v) { var pp = v.play(); if (pp && pp.catch) pp.catch(function () {}); }
  }
  function burst(host) {
    var low = root.classList.contains('lowfx');
    for (var r = 0; r < 2; r++) {
      var ring = document.createElement('span'); ring.className = 'reel-ring'; ring.setAttribute('aria-hidden', 'true'); host.appendChild(ring);
      gsap.fromTo(ring, { scale: .35, opacity: .85 }, { scale: 2.4 + r * .6, opacity: 0, duration: 1.7, delay: r * .22, ease: 'power2.out', onComplete: function () { this.targets()[0].remove(); } });
    }
    var n = low ? 8 : 18;
    for (var i = 0; i < n; i++) {
      var sp = document.createElement('span'); sp.className = 'reel-spark'; sp.setAttribute('aria-hidden', 'true'); host.appendChild(sp);
      var a = (Math.PI * 2 * i) / n + Math.random() * .4, d = 260 + Math.random() * 420;
      gsap.fromTo(sp, { x: 0, y: 0, scale: .3, opacity: 1 }, { x: Math.cos(a) * d, y: Math.sin(a) * d * .55, scale: .6 + Math.random() * 1.2, opacity: 0, duration: 1.3 + Math.random() * .9, ease: 'power3.out', onComplete: function () { this.targets()[0].remove(); } });
    }
  }

  /* ---- Garde-fou PC faible : si la fluidité chute après l'apparition, on coupe les effets lourds ---- */
  function watchFps() {
    if (root.classList.contains('lowfx') || /[?&]fx/.test(location.search)) return;
    var frames = 0, t0 = 0, rounds = 0;
    function tick() {
      if (document.hidden) return;
      frames++; if (!t0) t0 = performance.now();
      var dt = performance.now() - t0;
      if (dt >= 2500) {
        gsap.ticker.remove(tick);
        var fps = frames / (dt / 1000);
        if (fps < 28) { root.classList.add('lowfx'); if (window.ScrollTrigger) ScrollTrigger.refresh(); }
        else if (++rounds < 2) { frames = 0; t0 = 0; gsap.ticker.add(tick); }
      }
    }
    setTimeout(function () { gsap.ticker.add(tick); }, 4200);
  }

  /* ----------------------------------------------- Titres découpés (SplitText) */
  function prepareSplits() {
    $$('[data-split]').forEach(function (el) {
      if (!window.SplitText) { el.classList.add('is-split'); return; }
      var immediate = el.hasAttribute('data-split-immediate') || !!el.closest('.hero, .page-hero');
      var split = SplitText.create(el, { type: 'lines,words', mask: 'lines', linesClass: 'sl', wordsClass: 'sw', aria: /^H[1-6]$/.test(el.tagName) ? 'auto' : 'none' });
      el.classList.add('is-split');
      var anim = gsap.from(split.words, { yPercent: 118, rotate: 4, duration: 1.05, stagger: .045, ease: 'expo.out', paused: true, onComplete: function () { gsap.set(split.words, { clearProps: 'transform' }); } });
      if (immediate) { el.__split = anim; }
      else ScrollTrigger.create({ trigger: el, start: 'top 86%', once: true, onEnter: function () { anim.play(); } });
    });
  }

  /* ------------------------------------------------------ Révélations au scroll */
  function done(el) { el.classList.add('is-revealed'); gsap.set(el, { clearProps: el.hasAttribute('data-keep-transform') ? 'opacity,visibility' : 'transform,opacity,visibility' }); }
  function setupReveals() {
    $$('[data-reveal]').forEach(function (el) {
      if (el.closest('.hero, .page-hero') && !el.hasAttribute('data-reveal-scroll')) {
        // les éléments du hero sont animés par startHero()
        gsap.set(el, { opacity: 1, y: 0 }); el.classList.add('is-revealed'); return;
      }
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: EASE, scrollTrigger: { trigger: el, start: 'top 88%', once: true }, onComplete: function () { done(el); } });
    });
    $$('[data-stagger]').forEach(function (parent) {
      var kids = Array.prototype.slice.call(parent.children);
      gsap.to(kids, { opacity: 1, y: 0, duration: .95, ease: EASE, stagger: .12, scrollTrigger: { trigger: parent, start: 'top 84%', once: true }, onComplete: function () { kids.forEach(done); } });
    });
  }

  /* --------------------------------------------------------------- Compteurs */
  function setupCounters() {
    $$('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count')), obj = { v: 0 };
      el.textContent = '0';
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () {
        gsap.to(obj, { v: target, duration: 1.8, ease: 'power3.out', onUpdate: function () { el.textContent = String(Math.round(obj.v)); } });
      } });
    });
  }

  /* ------------------------------------------------------ Parallax & progression */
  function setupScrollEffects() {
    $$('[data-parallax]').forEach(function (el) {
      var amt = parseFloat(el.getAttribute('data-parallax')) || 10;
      gsap.fromTo(el, { yPercent: 0 }, { yPercent: amt, ease: 'none', immediateRender: false, scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.1 } });
    });
    setupReel();
    setupSectionEffects();
    var hero = $('.hero, .page-hero'), sky = $('.hero .sky, .page-hero .sky');
    if (hero && sky) gsap.fromTo(sky, { yPercent: 0 }, { yPercent: 14, ease: 'none', immediateRender: false, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.1 } });
    var copy = $('.hero-copy, .page-hero .container');
    if (hero && copy) gsap.fromTo(copy, { yPercent: 0, opacity: 1 }, { yPercent: -8, opacity: .35, ease: 'none', immediateRender: false, scrollTrigger: { trigger: hero, start: '60% top', end: 'bottom top', scrub: 1.1 } });
    // zoom doux des visuels pendant le défilement
    $$('.proj-card-img img, .services-signature img, .film-preview-img').forEach(function (img) {
      gsap.fromTo(img, { scale: 1.14 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img.closest('.proj-card, .services-signature, .film-preview'), start: 'top bottom', end: 'center center', scrub: 1.1 } });
    });
    var bar = $('.scroll-progress span');
    if (bar) gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .2 } });

    // Ligne de progression du processus : épinglée sur grand écran, simple scrub ailleurs
    var proc = $('.proc-h-grid');
    if (proc) {
      var line = $('.proc-line span', proc), steps = $$('.proc-h-step', proc);
      var mm = gsap.matchMedia();
      mm.add('(min-width: 861px) and (min-height: 700px)', function () {
        var sec = proc.closest('section');
        gsap.set(steps, { opacity: .25, y: 18 });
        var t = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: '+=120%', pin: true, scrub: .6, anticipatePin: 1 } });
        t.to(line, { scaleX: 1, duration: steps.length });
        steps.forEach(function (s, i) { t.to(s, { opacity: 1, y: 0, duration: .6, ease: 'power2.out' }, i); });
        return function () { gsap.set(steps, { clearProps: 'all' }); };
      });
      mm.add('(max-width: 860px), (max-height: 699px)', function () {
        gsap.fromTo(line, { scaleX: 0, scaleY: 0 }, { scaleX: window.innerWidth > 860 ? 1 : 1, scaleY: 1, ease: 'none', scrollTrigger: { trigger: proc, start: 'top 75%', end: 'bottom 60%', scrub: 1.1 } });
        steps.forEach(function (s) { gsap.from(s, { opacity: 0, y: 24, duration: .8, ease: EASE, scrollTrigger: { trigger: s, start: 'top 88%', once: true } }); });
      });
    }
    var fill = $('.process-track-fill span');
    if (fill) gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.process-row', start: 'top 70%', end: 'bottom 60%', scrub: 1.1 } });
  }


  /* ------------- Reel : le cadre se redresse (rotateX 20° → 0) et grandit pendant le défilement ------------- */
  function setupReel() {
    var frame = $('.reel-frame'), reel = $('.reel');
    if (!frame || !reel) return;
    var hdr = function () { var h = $('.site-header'); return h ? h.offsetHeight : 80; };
    var docTop = function () { return Math.max(0, Math.round(reel.getBoundingClientRect().top + window.scrollY)); };
    var mm = gsap.matchMedia();
    mm.add('(min-width: 921px)', function () {
      // fromTo + valeurs explicites : un « to » relirait l'état courant à chaque refresh (reload au milieu de la page, resize,
      // retour navigateur) et figerait le titre à moitié transparent une fois revenu en haut.
      var st = { trigger: reel, start: function () { return 'top ' + docTop() + 'px'; }, end: function () { return 'top ' + (hdr() + 14) + 'px'; }, scrub: .6, invalidateOnRefresh: true };
      gsap.fromTo(frame, { rotationX: 20, scale: .8 }, { rotationX: 0, scale: 1, ease: 'none', scrollTrigger: st });
      gsap.fromTo('.hero--reel .hero-inner', { y: 0, opacity: 1 }, { y: -60, opacity: .3, ease: 'none', immediateRender: false, scrollTrigger: st });
      gsap.fromTo('.reel-halo', { scale: 1 }, { scale: 1.25, ease: 'none', immediateRender: false, scrollTrigger: st });
      // la vidéo reste épinglée un moment, plein cadre, pour qu'on la savoure
      ScrollTrigger.create({ trigger: reel, start: function () { return 'top ' + (hdr() + 14) + 'px'; }, end: '+=70%', pin: true, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true });
      return function () { gsap.set(frame, { clearProps: 'transform' }); };
    });
    mm.add('(max-width: 920px)', function () {
      gsap.fromTo(frame, { rotationX: 9, scale: .9 }, { rotationX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: reel, start: 'top 88%', end: 'top 38%', scrub: .4 } });
      return function () { gsap.set(frame, { clearProps: 'transform' }); };
    });
  }

  /* ----------- Sections : rideau qui s'ouvre, textes qui se composent, parallaxe multi-couches, bandeau réactif ----------- */
  function setupSectionEffects() {
    var mm = gsap.matchMedia();
    // rideau : la section « nuit » et le pied de page s'ouvrent d'un cadre arrondi vers le plein écran
    mm.add('(min-width: 861px)', function () {
      if (root.classList.contains('lowfx')) return;
      $$('.section--night, .site-footer').forEach(function (sec) {
        gsap.fromTo(sec, { clipPath: 'inset(6% 4% round 64px)' }, { clipPath: 'inset(0% 0% round 0px)', ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top 96%', end: 'top 38%', scrub: .5 }, onComplete: function () { gsap.set(sec, { clearProps: 'clipPath' }); } });
      });
    });
    // cartes à vitesses différentes (profondeur)
    $$('.proj-grid .proj-card').forEach(function (c, i) {
      var amt = [-7, 10, -4][i % 3];
      gsap.fromTo(c, { yPercent: -amt }, { yPercent: amt, ease: 'none', scrollTrigger: { trigger: c.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.1 } });
    });
    $$('.sol-grid .sol-card, .pb-grid .pb-card').forEach(function (c, i) {
      var d = i % 2 ? 1 : -1;
      gsap.fromTo(c, { y: 26 * d }, { y: -26 * d, ease: 'none', scrollTrigger: { trigger: c.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.1 } });
    });
    // textes qui se composent : lignes masquées qui montent
    $$('section:not(.hero):not(.page-hero) .lede, .section-head > p, .audit-panel-head .lede').forEach(function (el) {
      if (el.hasAttribute('data-split')) return;
      el.setAttribute('data-compose', '');
      if (!window.SplitText) { el.classList.add('is-split'); return; }
      var split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'sl' });
      el.classList.add('is-split');
      gsap.from(split.lines, { yPercent: 110, opacity: 0, duration: 1, stagger: .09, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    // bandeau : s'incline avec la vitesse de défilement
    var mq = $('.marquee');
    if (mq && window.ScrollTrigger) {
      var skew = gsap.quickTo(mq, 'skewX', { duration: .4, ease: 'power3.out' });
      ScrollTrigger.create({ onUpdate: function (self) { skew(gsap.utils.clamp(-7, 7, self.getVelocity() / -260)); } });
      ScrollTrigger.addEventListener('scrollEnd', function () { skew(0); });
    }
  }

  /* ----------------------------------------------- Inclinaison des cartes (tilt) */
  function setupTilt() {
    if (!finePointer) return;
    $$('.pb-card, .sol-card, .value-item, .price-card, .score-card, .journey-stop').forEach(function (card) {
      gsap.set(card, { transformPerspective: 900 });
      var rx = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power3.out' });
      var ry = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3.out' });
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - .5) * 9); rx(-((e.clientY - r.top) / r.height - .5) * 9);
      });
      card.addEventListener('pointerleave', function () { rx(0); ry(0); });
    });
    var heroCard = $('.hero-card') || $('.reel-persp'), stage = $('.hero-stage') || $('.reel');
    if (heroCard && stage) {
      var hx = gsap.quickTo(heroCard, 'x', { duration: .9, ease: 'power3.out' }), hy = gsap.quickTo(heroCard, 'y', { duration: .9, ease: 'power3.out' });
      window.addEventListener('pointermove', function (e) { hx((e.clientX / window.innerWidth - .5) * 22); hy((e.clientY / window.innerHeight - .5) * 10); }, { passive: true });
    }
  }

  /* ---------------------------------------------------- Boutons magnétiques */
  function setupMagnetic() {
    if (!finePointer) return;
    $$('[data-magnetic]').forEach(function (el) {
      var qx = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3.out' }), qy = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * .28); qy((e.clientY - (r.top + r.height / 2)) * .36);
      });
      el.addEventListener('pointerleave', function () { qx(0); qy(0); });
    });
  }

  /* ------------------------------------------------------------------ Curseur */
  function setupCursor() {
    if (!finePointer) return;
    var dot = document.createElement('div'), ring = document.createElement('div');
    dot.className = 'cursor is-hidden'; ring.className = 'cursor-ring is-hidden';
    dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring); document.body.appendChild(dot);
    root.classList.add('has-cursor');
    var dx = gsap.quickTo(dot, 'x', { duration: .08, ease: 'none' }), dy = gsap.quickTo(dot, 'y', { duration: .08, ease: 'none' });
    var rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3.out' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3.out' });
    window.addEventListener('pointermove', function (e) {
      dot.classList.remove('is-hidden'); ring.classList.remove('is-hidden');
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    }, { passive: true });
    document.addEventListener('pointerleave', function () { dot.classList.add('is-hidden'); ring.classList.add('is-hidden'); });
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest ? e.target.closest('a, button, input, textarea, select, [data-magnetic], [data-cursor-view], [role="button"]') : null;
      var view = t && t.hasAttribute('data-cursor-view');
      ring.classList.toggle('is-link', !!t && !view); ring.classList.toggle('is-view', !!view); ring.textContent = view ? (t.getAttribute('data-cursor-label') || 'Voir') : '';
    });
  }

  /* ------------------------------------------------------ Transition de page */
  function setupPageTransitions() {
    var curtain = $('.curtain');
    if (!curtain) return;
    if (root.classList.contains('nav-in')) {
      requestAnimationFrame(function () {
        curtain.classList.add('is-open'); root.classList.remove('nav-in');
        setTimeout(function () { curtain.classList.remove('is-open'); }, 700);
      });
    }
    window.addEventListener('pageshow', function (e) { if (e.persisted) { curtain.classList.remove('is-covering'); root.classList.remove('nav-in'); } });
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var url; try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin || /^(mailto|tel):/.test(a.getAttribute('href'))) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // ancre sur la même page
      e.preventDefault();
      try { sessionStorage.setItem('glNav', '1'); } catch (err) {}
      curtain.classList.add('is-covering');
      setTimeout(function () { location.href = url.href; }, 520);
    });
  }

  /* ------------------------------------------- Défilement fluide inertiel (Lenis ↔ ScrollTrigger) */
  var lenis = null;
  function setupSmooth() {
    if (!window.Lenis || /[?&]nolenis/.test(location.search)) return;
    var hdr = function () { var h = $('.site-header'); return (h ? h.offsetHeight : 80) + 14; };
    lenis = new window.Lenis({
      lerp: .075, smoothWheel: true, syncTouch: false, wheelMultiplier: .9
    });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);                       // ScrollTrigger lit la position lissée
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });  // une seule boucle d'animation pour tout le site
    gsap.ticker.lagSmoothing(0);
    // menu mobile, lightbox et vidéo modale verrouillent le défilement via body.style.overflow
    var lock = function () { if (document.body.style.overflow === 'hidden') lenis.stop(); else lenis.start(); };
    new MutationObserver(lock).observe(document.body, { attributes: true, attributeFilter: ['style'] });
    // ancres internes (#audit, #faq…) : glissement inertiel avec le décalage de l'en-tête
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented) return;
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var t = document.getElementById(id.slice(1)); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: -hdr(), duration: 1.6 });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  }

  /* -------------------------------------------------------------------- Init */
  var introActive = !!(introEl && root.classList.contains('has-intro'));
  // L'intro démarre tout de suite (le logo est déjà visible en CSS) ; le reste attend les polices.
  if (introActive) runIntro(function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
  else if (introEl) introEl.remove();

  function init() {
    setupSmooth();
    prepareSplits();
    setupReveals(); setupCounters(); setupScrollEffects(); setupTilt(); setupMagnetic(); setupCursor(); setupPageTransitions();
    if (window.GLAscent) window.GLAscent.init({ gsap: gsap, ScrollTrigger: ScrollTrigger, lenis: lenis, root: root });
    if (!introActive) startHero();
    ScrollTrigger.refresh();
    watchFps();
    // la vidéo/les polices peuvent changer la hauteur de la page : on remesure sans casser l'état des animations
    if (document.readyState !== 'complete') window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  var fontsReady = (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 450); })]) : Promise.resolve();
  fontsReady.then(init);
})();
