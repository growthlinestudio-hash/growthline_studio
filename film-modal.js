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
  var loader = document.getElementById('filmLoader');
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

  var openModal = function () {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (loader) loader.classList.add('is-visible');
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
    if (loader) loader.classList.remove('is-visible');
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
