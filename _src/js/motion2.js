/* Growthline — complément de mouvement (v3.1) : entrées de sections (IntersectionObserver), halo de carte, onde de bouton, colonnes du pied.
   Aucune boucle requestAnimationFrame : tout est déclenché par événement ou par observation, donc léger sur PC faible. */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('anim')) return;           // « réduire les animations » : rien du tout
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // 1. .in-view sur sections, cartes de projet, images et pied de page (une seule fois par élément)
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    var watched = $$('.section, .section-head, .proj-card, .proj-card-img, .site-footer');
    watched.forEach(function (el) { io.observe(el); });
    // filet de sécurité : un saut d'ancre ou un défilement très rapide peut dépasser un élément sans qu'il ait été « vu » ;
    // tout ce qui est passé au-dessus de l'écran (ou visible) est révélé, rien ne reste caché.
    var t = 0;
    var sweep = function () {
      t = 0;
      var vh = window.innerHeight;
      watched.forEach(function (el) {
        if (el.classList.contains('in-view')) return;
        var top = el.getBoundingClientRect().top;
        if (top < vh * 0.92) { el.classList.add('in-view'); io.unobserve(el); }
      });
    };
    window.addEventListener('scroll', function () { if (!t) t = setTimeout(sweep, 200); }, { passive: true });
    setTimeout(sweep, 6000);
  } else {
    $$('.section, .section-head, .proj-card, .proj-card-img, .site-footer').forEach(function (el) { el.classList.add('in-view'); });
  }

  // 2. échelonnement des colonnes du pied de page
  $$('.site-footer .footer-grid > div').forEach(function (el, i) { el.style.setProperty('--i', i); });

  // 3. halo de carte qui suit la souris (appareils à pointeur précis seulement)
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine) {
    root.classList.add('has-pointer');
    document.addEventListener('pointermove', function (ev) {
      var card = ev.target.closest && ev.target.closest('.sol-card, .pb-card, .price-card, .proc-h-step');
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
      card.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    }, { passive: true });
  }

  // 4. onde au clic sur les boutons
  document.addEventListener('pointerdown', function (ev) {
    var b = ev.target.closest && ev.target.closest('.btn');
    if (!b) return;
    var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2;
    var s = document.createElement('span');
    s.className = 'mo-ripple';
    s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (ev.clientX - r.left - d / 2) + 'px;top:' + (ev.clientY - r.top - d / 2) + 'px';
    b.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 750);
  }, { passive: true });
})();
