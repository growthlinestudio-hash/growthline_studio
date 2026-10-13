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
    tl.fromTo($$('.lede, .hero-ctas, .hero-proof-list', hero), { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .1, clearProps: 'transform,opacity' }, .15)
      .fromTo($$('.hero-card', hero), { y: 70, opacity: 0, scale: .92, rotate: 6 }, { y: 0, opacity: 1, scale: 1, rotate: 1.6, duration: 1.3, ease: 'expo.out' }, .35)
      .fromTo($$('.hero-chip, .bubble', hero), { scale: .4, opacity: 0 }, { scale: 1, opacity: 1, duration: .9, stagger: .14, ease: 'back.out(2)', clearProps: 'transform,opacity' }, .9)
      .fromTo($$('.scroll-cue', hero), { opacity: 0 }, { opacity: 1, duration: 1 }, 1.6);
    root.classList.add('hero-ready');
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
  function done(el) { el.classList.add('is-revealed'); gsap.set(el, { clearProps: 'transform,opacity,visibility' }); }
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
      gsap.to(el, { yPercent: amt, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    var hero = $('.hero, .page-hero'), sky = $('.hero .sky, .page-hero .sky');
    if (hero && sky) gsap.to(sky, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    var copy = $('.hero-copy, .page-hero .container');
    if (hero && copy) gsap.to(copy, { yPercent: -8, opacity: .35, ease: 'none', scrollTrigger: { trigger: hero, start: '60% top', end: 'bottom top', scrub: true } });
    // zoom doux des visuels pendant le défilement
    $$('.proj-card-img img, .services-signature img, .film-preview-img').forEach(function (img) {
      gsap.fromTo(img, { scale: 1.14 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img.closest('.proj-card, .services-signature, .film-preview'), start: 'top bottom', end: 'center center', scrub: true } });
    });
    var bar = $('.scroll-progress span');
    if (bar) gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .2 } });

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
        gsap.fromTo(line, { scaleX: 0, scaleY: 0 }, { scaleX: window.innerWidth > 860 ? 1 : 1, scaleY: 1, ease: 'none', scrollTrigger: { trigger: proc, start: 'top 75%', end: 'bottom 60%', scrub: true } });
        steps.forEach(function (s) { gsap.from(s, { opacity: 0, y: 24, duration: .8, ease: EASE, scrollTrigger: { trigger: s, start: 'top 88%', once: true } }); });
      });
    }
    var fill = $('.process-track-fill span');
    if (fill) gsap.to(fill, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.process-row', start: 'top 70%', end: 'bottom 60%', scrub: true } });
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
    var heroCard = $('.hero-card'), stage = $('.hero-stage');
    if (heroCard && stage) {
      var hx = gsap.quickTo(heroCard, 'x', { duration: .9, ease: 'power3.out' }), hy = gsap.quickTo(heroCard, 'y', { duration: .9, ease: 'power3.out' });
      window.addEventListener('pointermove', function (e) { hx((e.clientX / window.innerWidth - .5) * 26); hy((e.clientY / window.innerHeight - .5) * 18); }, { passive: true });
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
      ring.classList.toggle('is-link', !!t && !view); ring.classList.toggle('is-view', !!view); ring.textContent = view ? 'Voir' : '';
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

  /* -------------------------------------------------------------------- Init */
  var introActive = !!(introEl && root.classList.contains('has-intro'));
  // L'intro démarre tout de suite (le logo est déjà visible en CSS) ; le reste attend les polices.
  if (introActive) runIntro(function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
  else if (introEl) introEl.remove();

  function init() {
    prepareSplits();
    setupReveals(); setupCounters(); setupScrollEffects(); setupTilt(); setupMagnetic(); setupCursor(); setupPageTransitions();
    if (!introActive) startHero();
    ScrollTrigger.refresh();
  }

  var fontsReady = (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 450); })]) : Promise.resolve();
  fontsReady.then(init);
})();
