/* Growthline — modal plein écran pour les vidéos de marque (Film, Processus...).
   Pas d'autoplay au chargement : chaque vidéo ne se lance qu'après clic sur son
   bouton de lecture. Fermeture via Échap, clic en dehors, ou bouton dédié ;
   dans tous les cas la lecture est stoppée et remise à zéro. Un bouton
   [data-video-open="<id-de-la-modal>"] pilote sa propre modal, indépendamment
   des autres — permet d'ajouter d'autres vidéos sans dupliquer la logique. */
(function () {
  'use strict';

  /* ---------- Plein écran natif (API Fullscreen), avec les prefixes
     nécessaires pour Safari/anciens navigateurs, et le cas particulier
     d'iOS Safari qui n'autorise le plein écran que sur l'élément <video>
     lui-même (pas sur un conteneur quelconque), via sa propre méthode
     webkitEnterFullscreen plutôt que l'API standard. ---------- */
  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement ||
      document.mozFullScreenElement || document.msFullscreenElement);
  }

  function requestFs(video) {
    if (video.requestFullscreen) video.requestFullscreen().catch(function () {});
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    else if (video.mozRequestFullScreen) video.mozRequestFullScreen();
    else if (video.msRequestFullscreen) video.msRequestFullscreen();
  }

  function exitFs() {
    if (document.exitFullscreen) document.exitFullscreen().catch(function () {});
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  }

  var FS_ICON_ENTER = 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3';
  var FS_ICON_EXIT = 'M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3';

  document.querySelectorAll('[data-video-open]').forEach(function (openBtn) {
    var modal = document.getElementById(openBtn.getAttribute('data-video-open'));
    if (!modal) return;

    var video = modal.querySelector('.film-modal-video');
    var loader = modal.querySelector('.film-modal-loader');
    var closeEls = modal.querySelectorAll('[data-film-close]');
    var fsBtn = modal.querySelector('[data-film-fullscreen]');
    var fsIcon = fsBtn && fsBtn.querySelector('[data-fs-icon]');
    var panel = modal.querySelector('.film-modal-panel');
    var lastFocused = null;

    /* Zoom depuis la vignette cliquée plutôt qu'un simple fondu centré : le
       panneau démarre exactement à la taille/position du bouton d'ouverture
       (mesurée en direct, jamais codée en dur), puis rejoint sa taille
       finale via la transition déjà posée sur .film-modal-panel — la vidéo
       semble jaillir de l'endroit cliqué plutôt qu'apparaître toute faite. */
    function flipFrom(sourceEl) {
      if (!panel || !sourceEl) return;
      var sr = sourceEl.getBoundingClientRect(), tr = panel.getBoundingClientRect();
      var scale = sr.width / tr.width;
      var dx = (sr.left + sr.width / 2) - (tr.left + tr.width / 2);
      var dy = (sr.top + sr.height / 2) - (tr.top + tr.height / 2);
      panel.style.transition = 'none';
      panel.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ')';
      panel.getBoundingClientRect(); // force le reflow avant de réactiver la transition
      panel.style.transition = '';
    }

    function updateFsIcon() {
      if (!fsIcon || !video) return;
      var active = isFullscreen() || video.webkitDisplayingFullscreen;
      fsIcon.setAttribute('d', active ? FS_ICON_EXIT : FS_ICON_ENTER);
    }

    if (video && fsBtn) {
      fsBtn.addEventListener('click', function () {
        if (isFullscreen() || video.webkitDisplayingFullscreen) exitFs();
        else requestFs(video);
      });
      ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange',
        'webkitbeginfullscreen', 'webkitendfullscreen'].forEach(function (evt) {
        video.addEventListener(evt, updateFsIcon);
        document.addEventListener(evt, updateFsIcon);
      });
    }

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
      flipFrom(openBtn);
      requestAnimationFrame(function () {
        modal.classList.add('is-open');
        if (panel) panel.style.transform = ''; // laisse .is-open piloter l'arrivée
        if (video) video.play().catch(function () {});
      });
      document.addEventListener('keydown', onKeydown);
    }

    function closeModal() {
      if (isFullscreen() || (video && video.webkitDisplayingFullscreen)) exitFs();
      /* Rétrécit symétriquement vers la vignette avant de disparaître,
         plutôt qu'un simple fondu — la transition de .film-modal-panel
         reste active (elle n'est pas conditionnée à .is-open), donc ce
         changement de transform s'anime tout seul. */
      if (panel && openBtn) {
        var sr = openBtn.getBoundingClientRect(), tr = panel.getBoundingClientRect();
        var scale = sr.width / tr.width;
        var dx = (sr.left + sr.width / 2) - (tr.left + tr.width / 2);
        var dy = (sr.top + sr.height / 2) - (tr.top + tr.height / 2);
        panel.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ')';
      }
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
        if (panel) panel.style.transform = '';
        modal.removeEventListener('transitionend', hide);
      };
      modal.addEventListener('transitionend', hide);
      if (lastFocused) lastFocused.focus();
    }

    function onKeydown(e) {
      if (e.key !== 'Escape') return;
      /* En plein écran, Échap doit d'abord juste en sortir (comportement
         natif du navigateur) sans fermer toute la modal — sinon un
         deuxième Échap (hors plein écran) ferme la video normalement. */
      if (isFullscreen()) return;
      closeModal();
    }

    openBtn.addEventListener('click', openModal);
    closeEls.forEach(function (el) { el.addEventListener('click', closeModal); });
  });
})();
