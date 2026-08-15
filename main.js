/* Growthline — interactions de base (indépendantes de GSAP : menu mobile,
   navbar au scroll, lien actif, duplication des marquees pour la boucle). */
(function () {
  'use strict';

  /* ---------- Écran de bienvenue au chargement ---------- */
  var pageLoader = document.getElementById('pageLoader');
  if (pageLoader) {
    requestAnimationFrame(function () { pageLoader.classList.add('is-in'); });
    var hideLoader = function () { pageLoader.classList.add('is-out'); };
    window.addEventListener('load', function () { setTimeout(hideLoader, 380); });
    setTimeout(hideLoader, 2200); // filet de sécurité si "load" tarde
  }

  /* ---------- Navbar : réduction au scroll ---------- */
  var header = document.querySelector('header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Lien de nav actif selon la page courante ---------- */
  var here = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.main-nav a, .mobile-menu-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === here || (here === '' && href === 'index.html')) a.classList.add('active');
  });

  /* ---------- Menu mobile plein écran ---------- */
  var toggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  if (toggle && mobileMenu) {
    var closeMenu = function () {
      toggle.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    var openMenu = function () {
      toggle.classList.add('is-open');
      mobileMenu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    toggle.addEventListener('click', function () {
      if (mobileMenu.classList.contains('is-open')) closeMenu(); else openMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) closeMenu(); });
  }

  /* ---------- Accordéon FAQ ---------- */
  document.querySelectorAll('.faq-item .faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var wasOpen = item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.faq-item.is-open').forEach(function (el) { el.classList.remove('is-open'); });
      if (!wasOpen) item.classList.add('is-open');
    });
  });

  /* ---------- Envoi fiable d'un formulaire (FormSubmit, sans compte requis) ----------
     Un lien mailto: ne fonctionne pas pour les visiteurs sans client mail configuré
     sur leur appareil (fréquent sur mobile/webmail) — on envoie donc réellement le
     message via un service gratuit, avec un mini-spinner pendant l'envoi, et on ne
     retombe sur mailto qu'en dernier recours si la requête échoue. */
  function submitFormReliably(form, statusEl, subject, mailtoBody) {
    var btn = form.querySelector('button[type="submit"]');
    var formData = new FormData(form);
    formData.append('_subject', subject);
    formData.append('_captcha', 'false');
    formData.append('_template', 'table');

    btn.classList.add('is-loading');
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    fetch('https://formsubmit.co/ajax/growthline.studio@gmail.com', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    })
      .then(function (res) { if (!res.ok) throw new Error('bad status'); return res.json(); })
      .then(function () {
        btn.classList.remove('is-loading');
        statusEl.textContent = 'Envoyé ! On vous répond rapidement par email.';
        statusEl.className = 'form-status is-success';
        form.reset();
      })
      .catch(function () {
        btn.classList.remove('is-loading');
        statusEl.textContent = "L'envoi automatique a échoué — ouverture de votre messagerie...";
        statusEl.className = 'form-status is-error';
        window.location.href = 'mailto:growthline.studio@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(mailtoBody);
      });
  }

  /* ---------- Formulaire audit (index.html#audit) ---------- */
  var auditForm = document.getElementById('auditForm');
  if (auditForm) {
    auditForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var site = auditForm.site.value.trim();
      var email = auditForm.email.value.trim();
      var subject = 'Demande d\'audit gratuit - ' + site;
      var body = 'Site à auditer : ' + site + '\nEmail de contact : ' + email;
      submitFormReliably(auditForm, document.getElementById('auditFormStatus'), subject, body);
    });
  }

  /* ---------- Slider avant/après (index.html) ---------- */
  (function compareSlider() {
    var slider = document.getElementById('compareSlider');
    if (!slider) return;
    var before = document.getElementById('compareBefore');
    var handle = document.getElementById('compareHandle');
    var dragging = false;

    function setPos(pct) {
      pct = Math.max(6, Math.min(94, pct));
      before.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      handle.style.left = pct + '%';
    }
    function pointerToPct(clientX) {
      var r = slider.getBoundingClientRect();
      return ((clientX - r.left) / r.width) * 100;
    }
    function onMove(e) {
      if (!dragging) return;
      var x = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(pointerToPct(x));
    }
    slider.addEventListener('mousedown', function (e) { dragging = true; setPos(pointerToPct(e.clientX)); });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', function () { dragging = false; });
    slider.addEventListener('touchstart', function (e) { dragging = true; setPos(pointerToPct(e.touches[0].clientX)); }, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', function () { dragging = false; });

    setPos(50);
  })();

  /* ---------- Galerie immersive (realisations.html) : lightbox plein écran ---------- */
  var lightbox = document.getElementById('galleryLightbox');
  if (lightbox) {
    var lbImg = document.getElementById('galleryLightboxImg');
    var lbLabel = document.getElementById('galleryLightboxLabel');
    var openLightbox = function (src, label) {
      lbImg.src = src;
      lbImg.alt = label;
      lbLabel.textContent = label;
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    var closeLightbox = function () {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    document.querySelectorAll('.sector-card-expand').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        openLightbox(btn.getAttribute('data-img'), btn.getAttribute('data-label'));
      });
    });
    lightbox.querySelector('.gallery-lightbox-backdrop').addEventListener('click', closeLightbox);
    lightbox.querySelector('.gallery-lightbox-close').addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ---------- Cartes secteur (realisations.html) : tap pour révéler l'image sur tactile ---------- */
  var isTouchDevice = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (isTouchDevice) {
    document.querySelectorAll('.sector-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var wasActive = card.classList.contains('is-active');
        document.querySelectorAll('.sector-card.is-active').forEach(function (c) { c.classList.remove('is-active'); });
        if (!wasActive) card.classList.add('is-active');
      });
    });
  }

  /* ---------- Formulaire de rendez-vous (contact.html) : type + créneau -> mail pré-rempli ---------- */
  var bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    var bookingType = 'Appel téléphonique';
    var bookingTypeInput = document.getElementById('bookingTypeInput');
    var toggleBtns = bookingForm.querySelectorAll('.slot-toggle-btn');
    toggleBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        toggleBtns.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        bookingType = btn.getAttribute('data-type');
        if (bookingTypeInput) bookingTypeInput.value = bookingType;
      });
    });

    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var date = bookingForm.querySelector('#bookingDate').value;
      var time = bookingForm.querySelector('#bookingTime').value;
      var name = bookingForm.querySelector('#bookingName').value.trim();
      var email = bookingForm.querySelector('#bookingEmail').value.trim();
      var note = bookingForm.querySelector('#bookingNote').value.trim();

      var subject = 'Demande de rendez-vous - ' + bookingType;
      var bodyLines = [
        'Type : ' + bookingType,
        'Date souhaitée : ' + date,
        'Heure souhaitée : ' + time,
        'Nom : ' + name,
        'Email : ' + email
      ];
      if (note) bodyLines.push('Projet : ' + note);
      var body = bodyLines.join('\n');

      submitFormReliably(bookingForm, document.getElementById('bookingFormStatus'), subject, body);
    });
  }

  /* ---------- Duplication des pistes de marquee pour boucle infinie ---------- */
  document.querySelectorAll('[data-marquee-track]').forEach(function (track) {
    track.insertAdjacentHTML('beforeend', track.innerHTML);
  });
})();
