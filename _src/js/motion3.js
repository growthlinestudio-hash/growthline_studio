/* Growthline — décors vivants (v5) : chaque thème de fond a son propre mouvement.
   - grille  : points lumineux qui pulsent sur la trame + halo qui suit le curseur
   - coucher de soleil : bulles de lumière (bokeh) qui montent
   - menthe  : anneaux qui s'étendent comme des ondes
   - papier chaud : cercles doux qui flottent
   - nébuleuse (nuit) : étoiles filantes
   - bandeaux : défilent plus vite quand on défile vite (vitesse liée au geste)
   Légèreté : quelques éléments par section, uniquement transform / opacity, animations CSS (GPU), MISES EN PAUSE hors écran
   (IntersectionObserver). Rien ne tourne si « réduire les animations » est actif (html.anim absent). Aucun requestAnimationFrame permanent. */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('anim')) return;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;   // PC faible : moitié moins de décors
  var coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  var cap = function (n) { return weak ? Math.ceil(n / 2) : n; };

  function add(sec, cls, n, setup) {
    var box = document.createElement('div');
    box.className = 'fx-layer'; box.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < n; i++) { var e = document.createElement('i'); e.className = cls; setup(e, i, n); box.appendChild(e); }
    sec.insertBefore(box, sec.firstChild);
  }

  // 1. grille : impulsions sur les croisements de la trame (56 px)
  $$('.bg-grid').forEach(function (sec) {
    add(sec, 'fx-pulse', cap(9), function (e) {
      e.style.left = (Math.round(rnd(2, 96) / 100 * 1400 / 56) * 56) + 'px';
      e.style.top = (Math.round(rnd(3, 90) / 100 * 800 / 56) * 56) + 'px';
      e.style.animationDelay = (-rnd(0, 6)) + 's'; e.style.animationDuration = rnd(3.5, 6.5) + 's';
    });
  });
  // 2. coucher de soleil : bulles de lumière qui montent
  $$('.bg-sunset').forEach(function (sec) {
    add(sec, 'fx-bokeh', cap(10), function (e) {
      var s = rnd(18, 70);
      e.style.cssText = 'left:' + rnd(2, 96) + '%;width:' + s + 'px;height:' + s + 'px;animation-delay:' + (-rnd(0, 18)) + 's;animation-duration:' + rnd(14, 26) + 's;--dx:' + rnd(-40, 40) + 'px';
    });
  });
  // 3. menthe : ondes
  $$('.bg-mint').forEach(function (sec) {
    add(sec, 'fx-ring', 3, function (e, i) {
      e.style.cssText = 'left:' + [12, 78, 52][i] + '%;top:' + [70, 30, 90][i] + '%;animation-delay:' + (-i * 3.2) + 's';
    });
  });
  // 4. papier chaud : cercles doux qui flottent
  $$('.bg-warm').forEach(function (sec) {
    add(sec, 'fx-float', cap(6), function (e) {
      var s = rnd(40, 120);
      e.style.cssText = 'left:' + rnd(0, 94) + '%;top:' + rnd(6, 90) + '%;width:' + s + 'px;height:' + s + 'px;animation-delay:' + (-rnd(0, 12)) + 's;animation-duration:' + rnd(12, 22) + 's';
    });
  });
  // 5. nébuleuse : étoiles filantes (une toutes les quelques secondes)
  $$('.bg-nebula').forEach(function (sec) {
    add(sec, 'fx-shoot', 3, function (e, i) {
      e.style.cssText = 'left:' + rnd(10, 80) + '%;top:' + rnd(4, 40) + '%;animation-delay:' + (i * 4.3 + rnd(0, 2)) + 's';
    });
  });

  // pause hors écran : la classe fx-on déclenche les animations (CSS) seulement quand la section est visible
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle('fx-on', en.isIntersecting); });
    }, { rootMargin: '80px 0px' });
    $$('.bg-aurora, .bg-grid, .bg-warm, .bg-sunset, .bg-mint, .bg-nebula').forEach(function (s) { io.observe(s); });
  } else {
    $$('.bg-aurora, .bg-grid, .bg-warm, .bg-sunset, .bg-mint, .bg-nebula').forEach(function (s) { s.classList.add('fx-on'); });
  }

  // 6. halo qui suit le curseur sur les sections « grille » (pointeur précis seulement)
  if (!coarse) {
    $$('.bg-grid').forEach(function (sec) {
      var raf = 0, x = 0, y = 0;
      sec.addEventListener('pointermove', function (ev) {
        var r = sec.getBoundingClientRect(); x = ev.clientX - r.left; y = ev.clientY - r.top;
        if (!raf) raf = requestAnimationFrame(function () { raf = 0; sec.style.setProperty('--mx', x + 'px'); sec.style.setProperty('--my', y + 'px'); });
      }, { passive: true });
    });
  }

  // 7. bandeaux : la vitesse suit la vitesse de défilement (retour progressif au rythme normal)
  var tracks = $$('.marquee-track').map(function (t) { return { el: t, anim: null }; });
  if (tracks.length && 'getAnimations' in document.documentElement) {
    var lastY = window.scrollY, rate = 1, ticking = false;
    var step = function () {
      var y = window.scrollY, v = Math.abs(y - lastY); lastY = y;
      var target = 1 + Math.min(v / 14, 5);                 // jusqu'à ×6 quand on défile vite
      rate += (target - rate) * (target > rate ? .25 : .06);
      tracks.forEach(function (t) {
        if (!t.anim) { var a = t.el.getAnimations(); t.anim = a.length ? a[0] : null; }
        if (t.anim) t.anim.playbackRate = rate;
      });
      if (rate > 1.02 || v > 0) requestAnimationFrame(step); else ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(step); } }, { passive: true });
  }
})();
