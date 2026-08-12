/* Growthline — moteur des effets créatifs (reveal au scroll + titres avec halo).
   Purement CSS-driven : ce script ne fait qu'ajouter/retirer une classe "is-visible". */
(function(){
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var targets = document.querySelectorAll('[data-reveal], .stroke-heading');

  if(reduced || !('IntersectionObserver' in window)){
    targets.forEach(function(el){ el.classList.add('is-visible'); });
    return;
  }

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:0.18, rootMargin:'0px 0px -6% 0px'});

  targets.forEach(function(el){ io.observe(el); });
})();
