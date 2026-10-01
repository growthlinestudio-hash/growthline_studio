/* Growthline — modal plein écran du film de marque.
   Pas d'autoplay au chargement : la vidéo ne se lance qu'après clic sur
   "Voir le film". Fermeture via Échap, clic en dehors, ou bouton dédié ;
   dans tous les cas la lecture est stoppée et remise à zéro. */
(function () {
  'use strict';

  var modal = document.getElementById('filmModal');
  var openBtn = document.querySelector('[data-film-open]');
  if (!modal || !openBtn) return;

  var video = document.getElementById('filmVideo');
  var closeEls = modal.querySelectorAll('[data-film-close]');
  var lastFocused = null;

  var openModal = function () {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      modal.classList.add('is-open');
      if (video) video.play().catch(function () {});
    });
    document.addEventListener('keydown', onKeydown);
  };

  var closeModal = function () {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    var hide = function () {
      modal.hidden = true;
      modal.removeEventListener('transitionend', hide);
    };
    modal.addEventListener('transitionend', hide);
    if (lastFocused) lastFocused.focus();
  };

  function onKeydown(e) {
    if (e.key === 'Escape') closeModal();
  }

  openBtn.addEventListener('click', openModal);
  closeEls.forEach(function (el) { el.addEventListener('click', closeModal); });
})();
