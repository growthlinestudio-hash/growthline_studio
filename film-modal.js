/* Growthline — modal plein écran pour les vidéos de marque (Film, Processus...).
   Pas d'autoplay au chargement : chaque vidéo ne se lance qu'après clic sur son
   bouton de lecture. Fermeture via Échap, clic en dehors, ou bouton dédié ;
   dans tous les cas la lecture est stoppée et remise à zéro. Un bouton
   [data-video-open="<id-de-la-modal>"] pilote sa propre modal, indépendamment
   des autres — permet d'ajouter d'autres vidéos sans dupliquer la logique. */
(function () {
  'use strict';

  document.querySelectorAll('[data-video-open]').forEach(function (openBtn) {
    var modal = document.getElementById(openBtn.getAttribute('data-video-open'));
    if (!modal) return;

    var video = modal.querySelector('.film-modal-video');
    var loader = modal.querySelector('.film-modal-loader');
    var closeEls = modal.querySelectorAll('[data-film-close]');
    var lastFocused = null;

    /* Le chargement (préchargement désactivé par défaut pour ne pas peser sur
       la page tant que personne n'a cliqué) peut prendre un instant sur une
       connexion mobile lente : ce loader évite que l'attente ressemble à un
       bouton cassé, aussi bien au démarrage qu'en cas de ré-achat de buffer
       pendant la lecture. */
    if (video && loader) {
      video.addEventListener('waiting', function () { loader.classList.add('is-visible'); });
      video.addEventListener('playing', function () { loader.classList.remove('is-visible'); });
    }

    function openModal() {
      lastFocused = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      if (loader) loader.classList.add('is-visible');
      requestAnimationFrame(function () {
        modal.classList.add('is-open');
        if (video) video.play().catch(function () {});
      });
      document.addEventListener('keydown', onKeydown);
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeydown);
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      if (loader) loader.classList.remove('is-visible');
      var hide = function () {
        modal.hidden = true;
        modal.removeEventListener('transitionend', hide);
      };
      modal.addEventListener('transitionend', hide);
      if (lastFocused) lastFocused.focus();
    }

    function onKeydown(e) {
      if (e.key === 'Escape') closeModal();
    }

    openBtn.addEventListener('click', openModal);
    closeEls.forEach(function (el) { el.addEventListener('click', closeModal); });
  });
})();
