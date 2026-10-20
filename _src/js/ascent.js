/* Growthline — « Ascension » : la page entière devient un voyage vers le septième ciel.
   Appelé par motion.js (GLAscent.init) : jamais chargé en mouvement réduit, jamais bloquant, tout en transform/opacity.
   - ciel du hero piloté par le défilement (altitude + chaleur du soleil couchant) via window.__glSky (lu par cloud-shader.js)
   - nuages d'avant-plan qui passent DEVANT le contenu, avions en papier, rayons de soleil, étoiles filantes (sections « nuit »)
   - dégradé d'ambiance qui évolue : bleu du jour → or du soleil couchant → nuit étoilée
   - jauge d'altitude (1 → 7ᵉ ciel), cartes qui s'élèvent puis se posent
   - atterrissage final : explosion douce de lumière + confettis dorés quand on arrive au pied de page */
(function () {
  'use strict';
  var A = {};
  window.GLAscent = A;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var mixc = function (a, b, t) { return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]; };
  var DAY = [125, 182, 242], GOLD = [255, 179, 71], NIGHT = [27, 42, 107];

  var PLANE = '<svg viewBox="0 0 64 40" width="64" height="40" focusable="false"><path d="M2 18 62 2 40 38 31 24z" fill="#fff" stroke="#9bb8e6" stroke-width="1.5" stroke-linejoin="round"/><path d="M31 24 62 2 26 21z" fill="#dbe7fb" stroke="#9bb8e6" stroke-width="1.5" stroke-linejoin="round"/></svg>';

  A.init = function (ctx) {
    var gsap = ctx.gsap, ST = ctx.ScrollTrigger, root = ctx.root;
    if (!gsap || !ST || A.ready) return;
    A.ready = true;
    var small = window.matchMedia('(max-width: 860px)').matches;
    var low = function () { return root.classList.contains('lowfx'); };

    /* ------------------------------------------------------ couche fixe : nuages d'avant-plan, ambiance, jauge */
    var layer = document.createElement('div');
    layer.className = 'ascent'; layer.setAttribute('aria-hidden', 'true');
    var nClouds = small ? 2 : 4;
    var html = '<div class="asc-tint"></div>';
    for (var i = 0; i < nClouds; i++) html += '<span class="asc-cloud asc-cloud--' + (i + 1) + '"></span>';
    html += '<span class="asc-plane asc-plane--1">' + PLANE + '</span>';
    if (!small) html += '<span class="asc-plane asc-plane--2">' + PLANE + '</span>';
    if (!small) {
      html += '<div class="asc-gauge"><span class="asc-g-label asc-g-label--top">7<sup>e</sup> ciel</span><div class="asc-g-track"><span class="asc-g-fill"></span>';
      for (var k = 7; k >= 1; k--) html += '<i class="asc-g-dot" data-n="' + k + '"></i>';
      html += '</div><span class="asc-g-label">Sol</span></div>';
    }
    layer.innerHTML = html;
    document.body.appendChild(layer);

    var clouds = $$('.asc-cloud', layer), planes = $$('.asc-plane', layer), dots = $$('.asc-g-dot', layer), fill = $('.asc-g-fill', layer);
    var setCloudY = clouds.map(function (c) { return gsap.quickSetter(c, 'y', 'vh'); });
    var setCloudX = clouds.map(function (c) { return gsap.quickSetter(c, 'x', 'vw'); });
    var setCloudO = clouds.map(function (c) { return gsap.quickSetter(c, 'opacity'); });
    var cyc = [3.2, 4.6, 2.4, 5.4];

    function frac(p, cycles, phase) { var f = (p * cycles + phase) % 1; return f < 0 ? f + 1 : f; }

    var lastDot = -1;
    function update(self) {
      var p = self ? self.progress : 0;
      var vh = window.innerHeight, y = window.scrollY || window.pageYOffset || 0;
      // ciel du hero (shader) : on monte → les nuages descendent, le soleil se couche et réchauffe l'horizon
      var alt = clamp(y / (vh * 1.5), 0, 1);
      window.__glSky = { alt: alt, warm: clamp(y / (vh * 1.8), 0, 1) * 0.9 };
      // ambiance : jour → or → nuit
      var col = p < .5 ? mixc(DAY, GOLD, p / .5) : mixc(GOLD, NIGHT, (p - .5) / .5);
      layer.style.setProperty('--asc-tint', col[0] + ',' + col[1] + ',' + col[2]);
      // nuages d'avant-plan : chaque nuage traverse l'écran de bas en haut plusieurs fois pendant la page
      for (var i = 0; i < clouds.length; i++) {
        var f = frac(p, cyc[i], i * .27);
        setCloudY[i](118 - 250 * f);
        setCloudX[i]((i % 2 ? 6 : -6) + (i % 2 ? -1 : 1) * 14 * f);
        setCloudO[i](Math.sin(Math.PI * f) * (low() ? 0 : .46));
      }
      // avions en papier : une traversée en diagonale de temps en temps
      for (var j = 0; j < planes.length; j++) {
        var g = frac(p, 2.2 + j * 1.3, .15 + j * .4);
        var dir = j ? -1 : 1, hide = y < 60 ? 0 : 1;   // jamais d'avion devant le titre à l'arrivée
        gsap.set(planes[j], { x: (dir > 0 ? -14 + g * 128 : 114 - g * 128) + 'vw', y: (74 - g * 52 + Math.sin(g * 9) * 3) + 'vh', rotation: dir * (-10 + g * 16 + Math.sin(g * 9) * 4), scaleX: dir, opacity: Math.sin(Math.PI * g) * (low() ? 0 : .9) * hide });
      }
      // jauge d'altitude
      if (dots.length) {
        var n = Math.min(7, Math.floor(p * 7.001) + 1);
        gsap.set(fill, { scaleY: p });
        if (n !== lastDot) { lastDot = n; dots.forEach(function (d) { d.classList.toggle('is-on', +d.getAttribute('data-n') <= n); }); }
      }
    }
    ST.create({ trigger: document.documentElement, start: 0, end: function () { return ST.maxScroll(window); }, onUpdate: update, onRefresh: update });
    update(null);
    // la jauge s'efface pendant que la vidéo occupe tout l'écran (elle recouvrirait les pastilles du cadre)
    var reelEl = $('.reel');
    if (reelEl) ST.create({ trigger: reelEl, start: 'top 55%', end: function () { return '+=' + Math.round(window.innerHeight * 1.5); }, onToggle: function (self) { layer.classList.toggle('asc-gauge-off', self.isActive); } });

    /* ------------------------------------------------------ rayons de soleil dans le hero */
    var hero = $('.hero');
    if (hero && !$('.asc-rays', hero)) {
      var rays = document.createElement('div'); rays.className = 'asc-rays'; rays.setAttribute('aria-hidden', 'true');
      hero.appendChild(rays);
    }

    /* ------------------------------------------------------ étoiles filantes dans les sections « nuit » et le pied de page */
    $$('.section--night, .site-footer').forEach(function (sec) {
      if (small && !sec.classList.contains('site-footer')) return;
      var stars = [];
      for (var s = 0; s < 3; s++) { var sp = document.createElement('span'); sp.className = 'asc-shoot'; sp.setAttribute('aria-hidden', 'true'); sec.appendChild(sp); stars.push(sp); }
      var tls = stars.map(function (el, idx) {
        var tl = gsap.timeline({ repeat: -1, paused: true, repeatRefresh: true, delay: idx * 1.7 });
        tl.fromTo(el, { left: function () { return gsap.utils.random(35, 100) + '%'; }, top: function () { return gsap.utils.random(2, 40) + '%'; }, x: 0, y: 0, opacity: 0, scaleX: .15 },
          { x: -420, y: 270, opacity: 1, scaleX: 1, duration: .85, ease: 'power2.in' })
          .to(el, { opacity: 0, duration: .25 }, '-=.3').to({}, { duration: gsap.utils.random(3.5, 8) });
        return tl;
      });
      ST.create({ trigger: sec, start: 'top 85%', end: 'bottom 15%', onToggle: function (self) { tls.forEach(function (t) { if (self.isActive && !low()) t.play(); else t.pause(); }); } });
    });

    /* ------------------------------------------------------ cartes qui s'élèvent puis se posent */
    $$('.sol-card, .pb-card, .proj-card, .stat, .value-item, .price-card, .tarif-card').forEach(function (c, i) {
      c.setAttribute('data-keep-transform', '');
      gsap.fromTo(c, { scale: .9, rotation: (i % 2 ? 2.2 : -2.2) }, { scale: 1, rotation: 0, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: c, start: 'top 106%', end: 'top 66%', scrub: .8 } });
    });

    /* ------------------------------------------------------ atterrissage : lumière + confettis au pied de page */
    var cta = $('.footer-cta');
    if (cta) {
      ST.create({ trigger: cta, start: 'top 72%', once: true, onEnter: function () { land(cta, gsap, low); } });
    }
  };

  function land(host, gsap, low) {
    var foot = host.closest('.site-footer') || host;
    var burst = document.createElement('div'); burst.className = 'asc-burst'; burst.setAttribute('aria-hidden', 'true'); foot.appendChild(burst);
    gsap.fromTo(burst, { scale: .1, opacity: 0 }, { scale: 2.6, opacity: .95, duration: 1.1, ease: 'power3.out' });
    gsap.to(burst, { opacity: 0, duration: 1.6, delay: .7, ease: 'power2.inOut', onComplete: function () { burst.remove(); } });
    if (low()) return;
    var r = host.getBoundingClientRect(), ox = Math.min(window.innerWidth * .5, r.left + r.width * .3), oy = clamp(r.top + r.height * .45, 80, window.innerHeight - 80);
    var cv = document.createElement('canvas'); cv.className = 'asc-confetti'; cv.setAttribute('aria-hidden', 'true');
    var W = window.innerWidth, H = window.innerHeight; cv.width = W; cv.height = H; document.body.appendChild(cv);
    var g = cv.getContext('2d'), cols = ['#ffd27a', '#ffb547', '#ff9ec7', '#fff3c4', '#9fc8ff', '#ffffff'];
    var n = W < 700 ? 46 : 96, ps = [];
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + gsap.utils.random(-1.25, 1.25), v = gsap.utils.random(7, 17);
      ps.push({ x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: gsap.utils.random(6, 12), h: gsap.utils.random(3, 7), r: gsap.utils.random(0, 6.28), vr: gsap.utils.random(-.25, .25), c: cols[i % cols.length], life: gsap.utils.random(150, 230) });
    }
    var tick = function () {
      g.clearRect(0, 0, W, H); var alive = 0;
      for (var k = 0; k < ps.length; k++) {
        var p = ps[k]; if (p.life <= 0) continue; alive++;
        p.vy += .32; p.vx *= .992; p.vy *= .992; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life--;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = clamp(p.life / 50, 0, 1); g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore();
      }
      if (!alive) { gsap.ticker.remove(tick); cv.remove(); }
    };
    gsap.ticker.add(tick);
  }
})();
