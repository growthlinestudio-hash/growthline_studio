/* Growthline — rework v6 : halo des cartes qui suit le curseur + bouton flottant « Audit gratuit ». Aucun rAF permanent. */
(function () {
  'use strict';
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  // Halo : seule la carte survolée est mise à jour
  if (matchMedia('(hover: hover)').matches) {
    $$('.sol-card, .stat, .inc-item').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  }

  // Bouton flottant : après le hero, masqué près du formulaire d'audit, du pied de page, et absent des pages de formulaire
  var page = location.pathname.split('/').pop() || 'index.html';
  if (/contact|outil-audit|mentions/.test(page)) return;
  var a = document.createElement('a');
  a.className = 'float-cta';
  a.href = page === 'index.html' ? '#audit' : 'index.html#audit';
  a.textContent = 'Audit gratuit';
  document.body.appendChild(a);
  var hidden = 0;
  function refresh() { a.classList.toggle('is-on', window.scrollY > 700 && hidden <= 0); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { hidden += e.isIntersecting ? 1 : -1; });
      refresh();
    });
    $$('#audit, footer, .cta-final').forEach(function (el) { io.observe(el); });
  }
  window.addEventListener('scroll', refresh, { passive: true });
  refresh();
})();
