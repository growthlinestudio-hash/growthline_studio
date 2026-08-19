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

  /* ---------- 1bis. Barre de progression du scroll ---------- */
  (function scrollProgress() {
    var bar = document.querySelector('.scroll-progress span');
    if (!bar || reduced || !window.ScrollTrigger) return;
    gsap.to(bar, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
    });
  })();

  /* Scroll natif du navigateur — Lenis (scroll lissé) retiré : donnait une
     sensation de perte de contrôle, contraire à ce qui est recherché ici. */

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

  /* ---------- 3bis. Masque qui révèle le titre (bande qui glisse, pas un simple fondu) ---------- */
  (function maskReveals() {
    var targets = document.querySelectorAll('[data-mask]');
    if (!targets.length) return;
    targets.forEach(function (el) {
      var text = el.textContent;
      el.innerHTML = '<span class="mask-reveal-inner">' + text + '</span>';
      el.classList.add('mask-reveal-wrap');
      var inner = el.firstElementChild;
      if (reduced) return;
      gsap.set(inner, { yPercent: 105 });
      if (!window.ScrollTrigger) { gsap.set(inner, { yPercent: 0 }); return; }
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: function () { gsap.to(inner, { yPercent: 0, duration: .9, ease: 'power4.out' }); }
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
    var visual = hero.querySelector('.hero-signature');
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

    /* Les 3 vrais chiffres du hero (0€ / 6 / 24h) comptent jusqu'à leur valeur —
       ce sont les seules stats du site, pas d'inventer de faux compteurs ailleurs */
    var statEls = hero.querySelectorAll('.hero-stat b');
    if (statEls.length) {
      statEls.forEach(function (el) {
        var m = el.textContent.match(/^(\d+)(.*)$/);
        if (!m) return;
        var finalVal = parseInt(m[1], 10), suffix = m[2];
        var counter = { val: 0 };
        el.textContent = '0' + suffix;
        tl.to(counter, {
          val: finalVal, duration: 1, ease: 'power1.out',
          onUpdate: function () { el.textContent = Math.round(counter.val) + suffix; }
        }, '-=0.9');
      });
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
  tiltCards('.location-card', { strength: 6, lift: -3 });

  /* ---------- 4ter. Glow qui suit la souris, sans le tilt 3D (lignes de service : trop larges pour un tilt cohérent) ---------- */
  function glowTrack(selector) {
    if (!canHover || reduced) return;
    document.querySelectorAll(selector).forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }
  glowTrack('.service-row');

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

  /* ---------- 11bis. Le logo réagit très légèrement au scroll de la page ---------- */
  (function logoScrollReact() {
    if (reduced || !window.ScrollTrigger) return;
    var img = document.querySelector('.brand .mark img');
    if (!img) return;
    gsap.to(img, {
      rotation: 14, ease: 'none',
      scrollTrigger: { start: 'top top', end: 'max', scrub: .6 }
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

  /* ---------- 13. Geste signature Growthline : les formes convergent vers un point ---------- */
  /* Réutilisé à deux moments clés (fin du "Construction en direct", puis CTA finale)
     pour devenir un motif reconnaissable plutôt qu'un effet isolé. */
  function growthlineConverge(container, target, opts) {
    if (!container || !target || !window.ScrollTrigger || reduced) return;
    opts = opts || {};
    var count = opts.count || 18;
    var colors = ['var(--sage)', 'var(--lavender)', 'var(--sky)', 'var(--pink)', 'var(--peach)'];
    var field = document.createElement('div');
    field.setAttribute('aria-hidden', 'true');
    field.style.cssText = 'position:absolute; inset:0; z-index:1; pointer-events:none; overflow:hidden;';
    container.appendChild(field);

    var particles = [];
    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      var size = 5 + Math.random() * (opts.maxSize || 10);
      var startTop = 10 + Math.random() * 75;
      var startLeft = 8 + Math.random() * 78;
      var shape = i % 3 === 0 ? '30%' : '50%';
      p.style.cssText = 'position:absolute; top:' + startTop + '%; left:' + startLeft + '%; width:' + size + 'px; height:' + size + 'px; border-radius:' + shape + '; background:' + colors[i % colors.length] + '; opacity:0;';
      p.dataset.startTop = startTop;
      p.dataset.startLeft = startLeft;
      field.appendChild(p);
      particles.push(p);
    }

    return function fire() {
      var r = container.getBoundingClientRect();
      var s = target.getBoundingClientRect();
      var targetX = s.left + s.width / 2 - r.left;
      var targetY = s.top + s.height / 2 - r.top;

      var tl = gsap.timeline();
      particles.forEach(function (p, i) {
        var fromX = (parseFloat(p.dataset.startLeft) / 100) * r.width;
        var fromY = (parseFloat(p.dataset.startTop) / 100) * r.height;
        tl.fromTo(p,
          { opacity: 0, scale: .4, x: 0, y: 0 },
          {
            opacity: .85, scale: 1, duration: .45, ease: 'power2.out',
            onStart: function () { gsap.set(p, { x: 0, y: 0 }); }
          }, i * .03)
          .to(p, {
            x: targetX - fromX, y: targetY - fromY, scale: .2, opacity: 0,
            duration: .6, ease: 'power2.inOut'
          }, i * .03 + .3);
      });
      tl.fromTo(target,
        { scale: 1 },
        { scale: (opts.punch || 1.16), duration: .32, ease: 'power2.out', transformOrigin: '50% 50%' },
        '-=0.45')
        .to(target, { scale: 1, duration: .5, ease: 'elastic.out(1, .5)' });
    };
  }

  (function ctaConverge() {
    var cta = document.querySelector('.cta-final');
    var sticker = document.querySelector('.cta-final-sticker');
    var fire = growthlineConverge(cta, sticker, { count: 18, maxSize: 10, punch: 1.16 });
    if (!fire) return;
    ScrollTrigger.create({ trigger: cta, start: 'top 65%', once: true, onEnter: fire });
  })();

  (function buildStoryConverge() {
    var stage = document.getElementById('buildStage');
    var finalTarget = stage && stage.querySelector('.build-frame--clients .build-avatar:last-child');
    var fire = growthlineConverge(stage, finalTarget, { count: 10, maxSize: 7, punch: 1.1 });
    if (!fire || !stage) return;
    var done = false;
    ScrollTrigger.create({
      trigger: stage, start: 'top 75%', end: 'bottom 45%',
      onUpdate: function (self) {
        if (!done && self.progress > .96) { done = true; fire(); }
      }
    });
  })();

  /* ---------- 14. Petite surprise cachée : le badge du dashboard réagit au clic ---------- */
  (function heroEasterEgg() {
    var badge = document.querySelector('.spin-badge--corner');
    var wrap = badge && badge.closest('.signal-card-wrap');
    if (!badge || !wrap || reduced) return;
    badge.style.cursor = 'pointer';
    var colors = ['var(--sage)', 'var(--lavender)', 'var(--sky)', 'var(--pink)', 'var(--peach)'];
    badge.addEventListener('click', function () {
      gsap.fromTo(badge, { scale: 1 }, { scale: 1.22, duration: .16, ease: 'power2.out', yoyo: true, repeat: 1 });
      for (var i = 0; i < 10; i++) {
        (function () {
          var p = document.createElement('span');
          var size = 5 + Math.random() * 7;
          p.style.cssText = 'position:absolute; top:0; right:14px; width:' + size + 'px; height:' + size + 'px; border-radius:50%; background:' + colors[i % colors.length] + '; opacity:0; pointer-events:none; z-index:5;';
          wrap.appendChild(p);
          var angle = Math.random() * Math.PI * 2;
          var dist = 40 + Math.random() * 70;
          gsap.fromTo(p, { opacity: 0, scale: .4, x: 0, y: 0 }, {
            opacity: .9, scale: 1, x: Math.cos(angle) * dist, y: Math.sin(angle) * dist,
            duration: .6, ease: 'power2.out',
            onComplete: function () { gsap.to(p, { opacity: 0, duration: .4, onComplete: function () { p.remove(); } }); }
          });
        })();
      }
    });
  })();

  /* ---------- 14bis. Deuxième easter egg : le badge du footer révèle un message après 5 clics ---------- */
  (function footerEasterEgg() {
    var badge = document.querySelector('.spin-badge--footer');
    if (!badge) return;
    badge.style.cursor = 'pointer';
    var count = 0;
    var msg = document.createElement('div');
    msg.textContent = "Vous êtes arrivé·e jusqu'ici — merci 👋";
    msg.style.cssText = 'position:absolute; bottom:100%; right:0; margin-bottom:12px; padding:8px 14px; border-radius:999px; background:var(--ink); color:var(--bg); font-size:.78rem; white-space:nowrap; opacity:0; transform:translateY(6px); transition:opacity .4s ease, transform .4s ease; pointer-events:none;';
    badge.appendChild(msg);
    badge.addEventListener('click', function () {
      count++;
      if (window.gsap && !reduced) gsap.fromTo(badge, { scale: 1 }, { scale: 1.15, duration: .15, ease: 'power2.out', yoyo: true, repeat: 1 });
      if (count === 5) {
        msg.style.opacity = '1';
        msg.style.transform = 'translateY(0)';
        setTimeout(function () { msg.style.opacity = '0'; msg.style.transform = 'translateY(6px)'; }, 3200);
      }
    });
  })();

  /* ---------- 10. Fondu d'entrée de page (léger, pas un vrai preloader) ---------- */
  (function pageFadeIn() {
    if (reduced) return;
    gsap.from('body', { opacity: 0, duration: .5, ease: 'power1.out' });
  })();
})();
