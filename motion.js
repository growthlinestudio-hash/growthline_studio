/* Growthline — couche d'animation premium (GSAP + ScrollTrigger).
   Curseur personnalisé, reveals au scroll, split-text, hero, boutons
   magnétiques, marquees, ligne de progression du processus. */
(function () {
  'use strict';
  if (!window.gsap) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* Flottement continu + léger tilt vers la souris (dashboard du hero) */
  function floatAndParallax(el) {
    if (reduced) return;
    gsap.to(el, { y: '+=10', duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    if (!canHover) return;
    var wrap = el.closest('.hero-inner') || el.parentElement;
    gsap.set(el, { transformPerspective: 900, transformOrigin: 'center' });
    var rotX = gsap.quickTo(el, 'rotationX', { duration: .7, ease: 'power3.out' });
    var rotY = gsap.quickTo(el, 'rotationY', { duration: .7, ease: 'power3.out' });
    wrap.addEventListener('mousemove', function (e) {
      var r = wrap.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - .5;
      var py = (e.clientY - r.top) / r.height - .5;
      rotY(px * 7);
      rotX(-py * 7);
    });
    wrap.addEventListener('mouseleave', function () { rotX(0); rotY(0); });
  }

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

    /* Texte contextuel dans le curseur selon l'élément survolé */
    var textEl = ring.querySelector('.cursor-text');
    if (textEl) {
      var textTargets = [
        { selector: '.btn-solid', text: 'OUVRIR' },
        { selector: '.service-row', text: 'VOIR' },
        { selector: '.sector-card', text: 'VOIR' },
        { selector: '.price-card', text: 'CHOISIR' }
      ];
      textTargets.forEach(function (t) {
        document.querySelectorAll(t.selector).forEach(function (el) {
          el.addEventListener('mouseenter', function () {
            textEl.textContent = t.text;
            ring.classList.add('is-text');
          });
          el.addEventListener('mouseleave', function () {
            ring.classList.remove('is-text');
          });
        });
      });
    }
  })();

  /* ---------- 1bis. Barre de progression du scroll ---------- */
  (function scrollProgress() {
    var bar = document.querySelector('.scroll-progress span');
    if (!bar || reduced || !window.ScrollTrigger) return;
    gsap.to(bar, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
    });
  })();

  /* ---------- 1ter. Smooth scroll premium (Lenis, si chargé) ---------- */
  (function smoothScroll() {
    if (!window.Lenis || reduced) return;
    var lenis = new window.Lenis({ lerp: 0.5, wheelMultiplier: 1 });
    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function raf(time) { lenis.raf(time); requestAnimationFrame(raf); });
    }
  })();

  /* ---------- 2. Reveal générique au scroll ([data-reveal]) ---------- */
  /* Effet "chute + rebond léger" : les cartes tombent d'un peu plus haut puis se posent,
     comme des objets physiques (cf. brief pastel/motion premium). */
  (function scrollReveals() {
    var els = gsap.utils.toArray('[data-reveal]');
    if (!els.length) return;
    if (reduced) { gsap.set(els, { opacity: 1 }); return; }
    gsap.set(els, { opacity: 0, y: -34 });
    if (!window.ScrollTrigger) { gsap.set(els, { opacity: 1, y: 0 }); return; }
    ScrollTrigger.batch(els, {
      start: 'top 88%',
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: .9, ease: 'back.out(1.5)', stagger: .15 });
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

    /* Le repère de marque tombe légèrement du haut à l'ouverture, comme suspendu puis lâché */
    var brandMark = document.querySelector('.brand .mark');
    if (brandMark) {
      gsap.set(brandMark, { y: -46, opacity: 0 });
      tl.to(brandMark, { y: 0, opacity: 1, duration: .9, ease: 'expo.out' }, 0);
    }

    if (eyebrowRow) { gsap.set(eyebrowRow, { opacity: 0, y: 16, filter: 'blur(6px)' }); tl.to(eyebrowRow, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .7 }, 0.1); }
    if (h1) {
      var spans = h1.querySelectorAll('.split-word > span');
      tl.to(spans, { yPercent: 0, opacity: 1, duration: 1, stagger: .035 }, 0.25);
    }
    if (subCol) { gsap.set(subCol, { opacity: 0, y: 22 }); tl.to(subCol, { opacity: 1, y: 0, duration: .9 }, '-=0.6'); }
    if (visual) {
      gsap.set(visual, { opacity: 0, x: 40, y: 30, scale: .96, filter: 'blur(10px)' });
      tl.to(visual, { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.2 }, '-=0.9');
      tl.call(function () { floatAndParallax(visual); });
    }
    var cornerBadge = hero.querySelector('.spin-badge--corner');
    if (cornerBadge) {
      gsap.set(cornerBadge, { y: -60, opacity: 0, rotate: -12 });
      tl.to(cornerBadge, { y: 0, opacity: 1, rotate: 0, duration: 1, ease: 'back.out(1.4)' }, '-=0.7');
    }

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

  /* ---------- 4bis. Tilt 3D discret : les cartes réagissent à la perspective ---------- */
  function tiltCards(selector, opts) {
    if (!canHover || reduced) return;
    opts = opts || {};
    var strength = opts.strength || 8;
    var lift = opts.lift || -5;
    document.querySelectorAll(selector).forEach(function (card) {
      gsap.set(card, { transformPerspective: 800 });
      var rotX = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power3.out' });
      var rotY = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3.out' });
      var liftY = gsap.quickTo(card, 'y', { duration: .5, ease: 'power3.out' });
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        rotY((px - .5) * strength);
        rotX(-(py - .5) * strength);
        liftY(lift);
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
      });
      card.addEventListener('mouseleave', function () { rotX(0); rotY(0); liftY(0); });
    });
  }
  tiltCards('.price-card', { strength: 10, lift: -6 });
  tiltCards('.craft-card', { strength: 7, lift: -4 });
  tiltCards('.proof-cell', { strength: 6, lift: -3 });

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

  /* ---------- 8. Mot qui défile ("peu importe votre activité") ---------- */
  (function shiftCycle() {
    var el = document.getElementById('shiftCycle');
    if (!el || !window.ScrollTrigger) return;
    var emojiEl = el.querySelector('.shift-emoji');
    var wordEl = el.querySelector('.shift-word');
    var items = [
      { emoji: '🍔', word: 'Restaurant' },
      { emoji: '🦷', word: 'Dentiste' },
      { emoji: '🏋️', word: 'Coach sportif' },
      { emoji: '🏠', word: 'Immobilier' },
      { emoji: '⚖️', word: 'Avocat' },
      { emoji: '💄', word: 'Institut de beauté' },
      { emoji: '🛒', word: 'E-commerce' },
      { emoji: '🚀', word: 'Startup' }
    ];
    var i = 0, timer = null;
    function paint(next) {
      emojiEl.textContent = items[next].emoji;
      wordEl.textContent = items[next].word;
    }
    function tick() {
      i = (i + 1) % items.length;
      if (reduced) { paint(i); return; }
      gsap.to([emojiEl, wordEl], {
        opacity: 0, y: -10, duration: .22, ease: 'power2.in',
        onComplete: function () {
          paint(i);
          gsap.fromTo([emojiEl, wordEl], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .32, ease: 'power2.out' });
        }
      });
    }
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', end: 'bottom 15%',
      onEnter: function () { if (!timer) timer = setInterval(tick, 1300); },
      onEnterBack: function () { if (!timer) timer = setInterval(tick, 1300); },
      onLeave: function () { clearInterval(timer); timer = null; },
      onLeaveBack: function () { clearInterval(timer); timer = null; }
    });
  })();

  /* ---------- 9. Construction en direct : wireframe → design → animation → site terminé ---------- */
  (function buildStory() {
    var stage = document.getElementById('buildStage');
    if (!stage || !window.ScrollTrigger) return;
    var frames = stage.querySelectorAll('.build-frame');
    var labels = document.querySelectorAll('.build-labels [data-label]');
    if (reduced) { frames.forEach(function (f, i) { f.classList.toggle('is-active', i === frames.length - 1); }); return; }
    ScrollTrigger.create({
      trigger: stage, start: 'top 75%', end: 'bottom 45%', scrub: .4,
      onUpdate: function (self) {
        var idx = Math.min(frames.length - 1, Math.floor(self.progress * frames.length));
        frames.forEach(function (f, i) { f.classList.toggle('is-active', i === idx); });
        labels.forEach(function (l, i) { l.classList.toggle('is-active', i === idx); });
      }
    });
  })();

  /* ---------- 11. Parallax léger des blobs du hero (profondeur à la souris) ---------- */
  (function heroParallax() {
    if (!canHover || reduced) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var layers = [];
    hero.querySelectorAll('.blob-parallax').forEach(function (el) {
      var depth = parseFloat(el.getAttribute('data-depth')) || 14;
      layers.push({
        xTo: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3.out' }),
        yTo: gsap.quickTo(el, 'y', { duration: 1, ease: 'power3.out' }),
        depth: depth
      });
    });
    if (!layers.length) return;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - .5;
      var py = (e.clientY - r.top) / r.height - .5;
      layers.forEach(function (l) { l.xTo(px * l.depth); l.yTo(py * l.depth); });
    });
    hero.addEventListener('mouseleave', function () {
      layers.forEach(function (l) { l.xTo(0); l.yTo(0); });
    });
  })();

  /* ---------- 12. Ambiance qui glisse doucement au fil du scroll (sauge → pêche) ---------- */
  (function scrollMoodShift() {
    if (reduced || !window.ScrollTrigger) return;
    var glow = document.querySelector('.hero-glow');
    if (!glow) return;
    gsap.to(glow, {
      filter: 'blur(16px) hue-rotate(24deg)',
      ease: 'none',
      scrollTrigger: { start: 'top top', end: 'max', scrub: .6 }
    });
  })();

  /* ---------- 13. Convergence finale : les formes du site reviennent se rassembler dans le logo ---------- */
  (function ctaConverge() {
    var cta = document.querySelector('.cta-final');
    var sticker = document.querySelector('.cta-final-sticker');
    if (!cta || !sticker || !window.ScrollTrigger || reduced) return;
    var colors = ['var(--sage)', 'var(--lavender)', 'var(--sky)', 'var(--pink)', 'var(--peach)'];
    var field = document.createElement('div');
    field.setAttribute('aria-hidden', 'true');
    field.style.cssText = 'position:absolute; inset:0; z-index:1; pointer-events:none; overflow:hidden;';
    cta.appendChild(field);

    var particles = [];
    var count = 18;
    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      var size = 6 + Math.random() * 10;
      var startTop = 10 + Math.random() * 75;
      var startLeft = 8 + Math.random() * 78;
      var shape = i % 3 === 0 ? '30%' : '50%';
      p.style.cssText = 'position:absolute; top:' + startTop + '%; left:' + startLeft + '%; width:' + size + 'px; height:' + size + 'px; border-radius:' + shape + '; background:' + colors[i % colors.length] + '; opacity:0;';
      p.dataset.startTop = startTop;
      p.dataset.startLeft = startLeft;
      field.appendChild(p);
      particles.push(p);
    }

    ScrollTrigger.create({
      trigger: cta, start: 'top 65%', once: true,
      onEnter: function () {
        var r = cta.getBoundingClientRect();
        var s = sticker.getBoundingClientRect();
        var targetX = s.left + s.width / 2 - r.left;
        var targetY = s.top + s.height / 2 - r.top;

        var tl = gsap.timeline();
        particles.forEach(function (p, i) {
          var pr = cta.getBoundingClientRect();
          var fromX = (parseFloat(p.dataset.startLeft) / 100) * pr.width;
          var fromY = (parseFloat(p.dataset.startTop) / 100) * pr.height;
          tl.fromTo(p,
            { opacity: 0, scale: .4, x: 0, y: 0 },
            {
              opacity: .85, scale: 1, duration: .5, ease: 'power2.out',
              onStart: function () { gsap.set(p, { x: 0, y: 0 }); }
            }, i * .035)
            .to(p, {
              x: targetX - fromX, y: targetY - fromY, scale: .2, opacity: 0,
              duration: .7, ease: 'power2.inOut'
            }, i * .035 + .35);
        });
        tl.fromTo(sticker,
          { scale: 1 },
          { scale: 1.16, duration: .35, ease: 'power2.out', transformOrigin: '50% 50%' },
          '-=0.5')
          .to(sticker, { scale: 1, duration: .5, ease: 'elastic.out(1, .5)' });
      }
    });
  })();

  /* ---------- 10. Fondu d'entrée de page (léger, pas un vrai preloader) ---------- */
  (function pageFadeIn() {
    if (reduced) return;
    gsap.from('body', { opacity: 0, duration: .5, ease: 'power1.out' });
  })();
})();
