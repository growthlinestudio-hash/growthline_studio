/* Growthline — interactions de base, indépendantes de GSAP :
   navigation, menu mobile, FAQ, formulaires (envoi fiable), cartes, lightbox, marquee. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Header : état au scroll, masqué en descente rapide ---------- */
  var header = $('header.site-header');
  if (header) {
    var lastY = window.scrollY, ticking = false;
    var onScroll = function () {
      var y = window.scrollY;
      header.classList.toggle('scrolled', y > 40);
      if (!document.body.classList.contains('menu-open')) {
        if (y > lastY + 6 && y > 480) header.classList.add('is-hidden');
        else if (y < lastY - 6 || y < 200) header.classList.remove('is-hidden');
      }
      lastY = y; ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  }

  /* ---------- Lien actif ---------- */
  var here = (location.pathname.split('/').pop() || 'index.html');
  $$('.main-nav a, .mobile-menu-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === here) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
  });

  /* ---------- Menu mobile ---------- */
  var toggle = $('#menuToggle'), mobileMenu = $('#mobileMenu');
  if (toggle && mobileMenu) {
    var setMenu = function (open) {
      toggle.classList.toggle('is-open', open);
      mobileMenu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      document.body.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (header) header.classList.remove('is-hidden');
    };
    toggle.addEventListener('click', function () { setMenu(!mobileMenu.classList.contains('is-open')); });
    $$('a', mobileMenu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1020) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) { setMenu(false); toggle.focus(); } });
  }

  /* ---------- FAQ (accordéon accessible) ---------- */
  $$('.faq-item').forEach(function (item, i) {
    var btn = $('.faq-q', item), panel = $('.faq-a', item);
    if (!btn || !panel) return;
    var id = 'faq-panel-' + (item.closest('[data-faq-scope]') ? 'x' : '') + i + '-' + Math.random().toString(36).slice(2, 6);
    panel.id = id; btn.id = id + '-btn'; btn.setAttribute('aria-controls', id); btn.setAttribute('aria-expanded', 'false');
    panel.setAttribute('role', 'region'); panel.setAttribute('aria-labelledby', btn.id);
    btn.addEventListener('click', function () {
      var wasOpen = item.classList.contains('is-open');
      $$('.faq-item.is-open', item.parentElement).forEach(function (el) {
        el.classList.remove('is-open'); $('.faq-q', el).setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- Marquee : duplication de la piste pour une boucle infinie ---------- */
  $$('[data-marquee-track]').forEach(function (track) {
    track.insertAdjacentHTML('beforeend', track.innerHTML);
    $$('.marquee-item', track).forEach(function (el, i, all) { if (i >= all.length / 2) el.setAttribute('aria-hidden', 'true'); });
  });

  /* ---------- Hero : la vidéo de fond ne tourne que lorsqu'elle est visible ---------- */
  var heroVideo = $('.hero-video video');
  // petits écrans : version 720p allégée de la vidéo
  if (heroVideo && heroVideo.getAttribute('data-src-sm') && window.matchMedia && window.matchMedia('(max-width: 920px)').matches) {
    var srcEl = heroVideo.querySelector('source');
    if (srcEl) { srcEl.src = heroVideo.getAttribute('data-src-sm'); heroVideo.load(); }
  }
  if (heroVideo && 'IntersectionObserver' in window) {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); }
    else new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var p = heroVideo.play(); if (p && p.catch) p.catch(function () {}); } else heroVideo.pause(); });
    }, { threshold: .25 }).observe(heroVideo);
  }

  /* ---------- Carte de localisation (Contact) ---------- */
  var locationCard = $('#locationCard');
  if (locationCard) {
    var toggleCard = function () { var ex = locationCard.classList.toggle('is-expanded'); locationCard.setAttribute('aria-expanded', ex ? 'true' : 'false'); };
    locationCard.addEventListener('click', toggleCard);
    locationCard.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard(); } });
  }

  /* ---------- Envoi fiable d'un formulaire (FormSubmit) ----------
     Un mailto: seul échoue sans client mail configuré : on envoie réellement le message,
     et on ne retombe sur mailto qu'en dernier recours. */
  function submitFormReliably(form, statusEl, subject, mailtoBody, onSuccess) {
    var btn = $('button[type="submit"]', form);
    var formData = new FormData(form);
    formData.append('_subject', subject);
    formData.append('_captcha', 'true');
    formData.append('_template', 'table');
    btn.classList.add('is-loading'); btn.setAttribute('aria-busy', 'true');
    statusEl.textContent = ''; statusEl.className = 'form-status';
    fetch('https://formsubmit.co/ajax/growthline.studio@gmail.com', { method: 'POST', headers: { 'Accept': 'application/json' }, body: formData })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok || !data || data.success === false || data.success === 'false') throw new Error((data && data.message) || 'bad status');
          return data;
        });
      })
      .then(function () {
        btn.classList.remove('is-loading'); btn.removeAttribute('aria-busy');
        statusEl.textContent = 'Envoyé ! On vous répond rapidement par email.';
        statusEl.className = 'form-status is-success';
        form.reset();
        if (onSuccess) onSuccess();
      })
      .catch(function () {
        btn.classList.remove('is-loading'); btn.removeAttribute('aria-busy');
        statusEl.textContent = "L'envoi automatique a échoué — ouverture de votre messagerie...";
        statusEl.className = 'form-status is-error';
        window.location.href = 'mailto:growthline.studio@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(mailtoBody);
      });
  }

  /* ---------- Formulaire d'audit (accueil) ---------- */
  var auditForm = $('#auditForm');
  if (auditForm) {
    var wrap = $('#auditFormWrap'), confirmEl = $('#auditConfirm'), recapEl = $('#auditConfirmRecap');
    auditForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var site = auditForm.site.value.trim(), email = auditForm.email.value.trim();
      submitFormReliably(auditForm, $('#auditFormStatus'), "Demande d'audit gratuit - " + site,
        'Site à auditer : ' + site + '\nEmail de contact : ' + email, function () {
          if (!confirmEl) return;
          recapEl.textContent = site + ' — rapport envoyé à ' + email + '.';
          if (wrap) wrap.hidden = true;
          confirmEl.hidden = false;
          confirmEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
    var reset = $('#auditConfirmReset');
    if (reset) reset.addEventListener('click', function () { confirmEl.hidden = true; if (wrap) wrap.hidden = false; });
  }

  /* ---------- Lightbox (réalisations) ---------- */
  var lightbox = $('#galleryLightbox');
  if (lightbox) {
    var lbImg = $('#galleryLightboxImg'), lbLabel = $('#galleryLightboxLabel'), lbClose = $('.gallery-lightbox-close', lightbox), lastFocused = null;
    var openLb = function (src, label, trigger) {
      lbImg.src = src; lbImg.alt = label; lbLabel.textContent = label;
      lightbox.classList.add('is-open'); lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; lastFocused = trigger || document.activeElement; lbClose.focus();
    };
    var closeLb = function () {
      if (!lightbox.classList.contains('is-open')) return;
      lightbox.classList.remove('is-open'); lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = ''; if (lastFocused) lastFocused.focus();
    };
    $$('.sector-card-expand').forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); openLb(b.getAttribute('data-img'), b.getAttribute('data-label'), b); });
    });
    $('.gallery-lightbox-backdrop', lightbox).addEventListener('click', closeLb);
    lbClose.addEventListener('click', closeLb);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
  }

  /* ---------- Cartes secteur : tap pour révéler (tactile) ---------- */
  if (window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches) {
    $$('.sector-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var was = card.classList.contains('is-active');
        $$('.sector-card.is-active').forEach(function (c) { c.classList.remove('is-active'); });
        if (!was) card.classList.add('is-active');
      });
    });
  }

  /* ---------- Rendez-vous (contact) ---------- */
  var bookingForm = $('#bookingForm');
  if (bookingForm) {
    var bookingType = 'Appel téléphonique';
    var typeInput = $('#bookingTypeInput'), btns = $$('.slot-toggle-btn', bookingForm);
    var phoneInput = $('#bookingPhone'), phoneHint = $('#bookingPhoneHint');
    var updatePhone = function () {
      if (!phoneInput) return;
      var isCall = bookingType === 'Appel téléphonique';
      phoneInput.required = isCall;
      if (phoneHint) phoneHint.textContent = isCall ? '(obligatoire pour un appel)' : '(facultatif)';
    };
    updatePhone();
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-checked', 'false'); });
        btn.classList.add('is-active'); btn.setAttribute('aria-checked', 'true');
        bookingType = btn.getAttribute('data-type'); if (typeInput) typeInput.value = bookingType; updatePhone();
      });
    });
    var dateInput = $('#bookingDate'); if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);
    var fWrap = $('#bookingFormWrap'), cEl = $('#bookingConfirm'), rEl = $('#bookingConfirmRecap');
    var fmt = function (iso) { var p = (iso || '').split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso; };
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (id) { return $(id, bookingForm).value.trim(); };
      var date = v('#bookingDate'), time = v('#bookingTime'), name = v('#bookingName'), email = v('#bookingEmail'), phone = v('#bookingPhone'), note = v('#bookingNote');
      var lines = ['Type : ' + bookingType, 'Date souhaitée : ' + date, 'Heure souhaitée : ' + time, 'Nom : ' + name, 'Email : ' + email];
      if (phone) lines.push('Téléphone : ' + phone);
      if (note) lines.push('Projet : ' + note);
      submitFormReliably(bookingForm, $('#bookingFormStatus'), 'Demande de rendez-vous - ' + bookingType, lines.join('\n'), function () {
        var bits = [bookingType]; if (date) bits.push('le ' + fmt(date)); if (time) bits.push('à ' + time);
        rEl.textContent = bits.join(' ') + (name ? ', pour ' + name + '.' : '.');
        if (fWrap) fWrap.hidden = true; cEl.hidden = false; cEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
    var rb = $('#bookingConfirmReset');
    if (rb) rb.addEventListener('click', function () { cEl.hidden = true; if (fWrap) fWrap.hidden = false; });
  }
})();
