/* Growthline — couche d'animation premium (GSAP + ScrollTrigger).
   Curseur personnalisé, reveals au scroll, split-text, hero, boutons
   magnétiques, marquees, ligne de progression du processus. */
(function () {
  'use strict';
  if (!window.gsap) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- 1. Curseur personnalisé (desktop, hover fin uniquement) ---------- */
  (function customCursor() {
    if (!canHover || reduced) return;
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    var dotX = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3.out' });
    var dotY = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3.out' });
    var ringX = gsap.quickTo(ring, 'x', { duration: .35, ease: 'power3.out' });
    var ringY = gsap.quickTo(ring, 'y', { duration: .35, ease: 'power3.out' });

    window.addEventListener('mousemove', function (e) {
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    });

    document.querySelectorAll('a, button, [data-cursor-hover]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('is-hover'); });
    });
    document.querySelectorAll('[data-cursor-view]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('is-view'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('is-view'); });
    });
  })();

  /* ---------- 2. Reveal générique au scroll ([data-reveal]) ---------- */
  (function scrollReveals() {
    var els = gsap.utils.toArray('[data-reveal]');
    if (!els.length) return;
    if (reduced) { gsap.set(els, { opacity: 1 }); return; }
    gsap.set(els, { opacity: 0, y: 28 });
    if (!window.ScrollTrigger) { gsap.set(els, { opacity: 1, y: 0 }); return; }
    ScrollTrigger.batch(els, {
      start: 'top 88%',
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1 });
      },
      once: true
    });
  })();

  /* ---------- 3. Split-text mot par mot ([data-split]) ---------- */
  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) {
      return '<span class="split-word"><span>' + w + '</span></span> ';
    }).join('');
    return el.querySelectorAll('.split-word > span');
  }

  (function splitReveals() {
    var targets = document.querySelectorAll('[data-split]');
    if (!targets.length) return;
    targets.forEach(function (el) {
      var spans = splitWords(el);
      if (reduced) return;
      gsap.set(spans, { yPercent: 110, opacity: 0 });
      if (el.hasAttribute('data-split-immediate')) return; // animé par la timeline hero
      if (!window.ScrollTrigger) { gsap.set(spans, { yPercent: 0, opacity: 1 }); return; }
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: function () { gsap.to(spans, { yPercent: 0, opacity: 1, duration: .8, stagger: .025, ease: 'power3.out' }); }
      });
    });
  })();

  /* ---------- 4. Chorégraphie d'entrée du hero ---------- */
  (function heroEntrance() {
    var hero = document.querySelector('.hero');
    if (!hero || reduced) return;
    var h1 = hero.querySelector('h1[data-split-immediate]');
    var eyebrowRow = hero.querySelector('.hero-eyebrow-row');
    var subCol = hero.querySelector('.hero-sub-col');
    var visual = hero.querySelector('.signal-card');
    var cue = hero.querySelector('.scroll-cue');

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (eyebrowRow) { gsap.set(eyebrowRow, { opacity: 0, y: 16 }); tl.to(eyebrowRow, { opacity: 1, y: 0, duration: .7 }, 0.1); }
    if (h1) {
      var spans = h1.querySelectorAll('.split-word > span');
      tl.to(spans, { yPercent: 0, opacity: 1, duration: 1, stagger: .035 }, 0.25);
    }
    if (subCol) { gsap.set(subCol, { opacity: 0, y: 22 }); tl.to(subCol, { opacity: 1, y: 0, duration: .9 }, '-=0.6'); }
    if (visual) { gsap.set(visual, { opacity: 0, y: 30, scale: .97 }); tl.to(visual, { opacity: 1, y: 0, scale: 1, duration: 1.1 }, '-=0.9'); }

    /* Graphique du signal-card : les barres se remplissent, le score compte jusqu'à sa valeur */
    var bars = hero.querySelectorAll('.signal-bar i');
    var scoreEl = hero.querySelector('#heroScoreNum');
    if (bars.length) {
      gsap.set(bars, { scaleX: 0, transformOrigin: 'left center' });
      tl.to(bars, { scaleX: 1, duration: .9, stagger: .12, ease: 'power2.out' }, '-=0.5');
    }
    if (scoreEl) {
      var target = { val: 0 };
      var finalScore = parseInt(scoreEl.textContent, 10) || 66;
      scoreEl.textContent = '0';
      tl.to(target, {
        val: finalScore, duration: 1.1, ease: 'power1.out',
        onUpdate: function () { scoreEl.textContent = Math.round(target.val); }
      }, '-=0.8');
    }

    if (cue) { gsap.set(cue, { opacity: 0 }); tl.to(cue, { opacity: 1, duration: .6 }, '-=0.3'); }
  })();

  /* ---------- 5. Boutons magnétiques ---------- */
  (function magneticButtons() {
    if (!canHover || reduced) return;
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      var strength = 0.3;
      var xTo = gsap.quickTo(btn, 'x', { duration: .5, ease: 'power3.out' });
      var yTo = gsap.quickTo(btn, 'y', { duration: .5, ease: 'power3.out' });
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      btn.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });
  })();

  /* ---------- 6. Marquees en boucle continue (contenu déjà dupliqué par main.js) ---------- */
  (function marquees() {
    document.querySelectorAll('[data-marquee-track]').forEach(function (track) {
      if (reduced) return;
      var speed = parseFloat(track.getAttribute('data-marquee-speed')) || 40;
      var distance = track.scrollWidth / 2;
      gsap.fromTo(track, { x: track.hasAttribute('data-marquee-reverse') ? -distance : 0 },
        { x: track.hasAttribute('data-marquee-reverse') ? 0 : -distance, duration: distance / speed, ease: 'none', repeat: -1 });
    });
  })();

  /* ---------- 7. Ligne de progression du processus ---------- */
  (function processFill() {
    if (!window.ScrollTrigger) return;
    var fill = document.querySelector('.process-track-fill');
    var track = document.querySelector('.process-track');
    if (!fill || !track || reduced) return;
    gsap.to(fill, {
      height: '100%', ease: 'none',
      scrollTrigger: { trigger: track, start: 'top 70%', end: 'bottom 65%', scrub: .4 }
    });
  })();

  /* ---------- 9. Pluie d'icônes discrète (fond décoratif, hero + CTA final) ---------- */
  (function emojiRain() {
    var zones = document.querySelectorAll('[data-emoji-rain]');
    if (!zones.length || reduced) return;
    var defaultEmojis = ['📈', '🚀', '✨'];

    zones.forEach(function (zone) {
      var list = (zone.getAttribute('data-emoji-rain') || '').trim();
      var emojis = list ? list.split(/\s+/) : defaultEmojis;
      var count = parseInt(zone.getAttribute('data-emoji-count'), 10) || 5;
      var h = zone.offsetHeight || 400;

      for (var i = 0; i < count; i++) {
        var span = document.createElement('span');
        span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        var size = gsap.utils.random(16, 26);
        span.style.left = gsap.utils.random(4, 94) + '%';
        span.style.fontSize = size + 'px';
        span.style.opacity = gsap.utils.random(.22, .42);
        zone.appendChild(span);

        gsap.set(span, { y: -40, rotation: gsap.utils.random(-20, 20) });
        gsap.to(span, {
          y: h + 60,
          rotation: '+=' + gsap.utils.random(-40, 40),
          duration: gsap.utils.random(10, 16),
          delay: gsap.utils.random(0, 5),
          ease: 'none',
          repeat: -1
        });
        gsap.to(span, {
          x: gsap.utils.random(-20, 20),
          duration: gsap.utils.random(3, 5),
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        });
      }
    });
  })();

  /* ---------- 10. Fondu d'entrée de page (léger, pas un vrai preloader) ---------- */
  (function pageFadeIn() {
    if (reduced) return;
    gsap.from('body', { opacity: 0, duration: .5, ease: 'power1.out' });
  })();
})();
