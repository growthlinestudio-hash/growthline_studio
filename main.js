/* Growthline — interactions de base (indépendantes de GSAP : menu mobile,
   navbar au scroll, lien actif, duplication des marquees pour la boucle). */
(function () {
  'use strict';

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

  /* ---------- Formulaire audit (index.html#audit) : ouvre le mail client pré-rempli ---------- */
  var auditForm = document.getElementById('auditForm');
  if (auditForm) {
    auditForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var site = auditForm.site.value.trim();
      var email = auditForm.email.value.trim();
      var subject = 'Demande d\'audit gratuit - ' + site;
      var body = 'Site à auditer : ' + site + '\nEmail de contact : ' + email;
      window.location.href = 'mailto:growthline.studio@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  /* ---------- Cases visuelles des services : tap pour révéler l'image sur tactile ---------- */
  var isTouch = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (isTouch) {
    document.querySelectorAll('.service-row').forEach(function (row) {
      var visual = row.querySelector('.service-visual');
      if (!visual) return;
      row.addEventListener('click', function () {
        var wasActive = visual.classList.contains('is-active');
        document.querySelectorAll('.service-visual.is-active').forEach(function (v) { v.classList.remove('is-active'); });
        if (!wasActive) visual.classList.add('is-active');
      });
    });
  }

  /* ---------- Duplication des pistes de marquee pour boucle infinie ---------- */
  document.querySelectorAll('[data-marquee-track]').forEach(function (track) {
    track.insertAdjacentHTML('beforeend', track.innerHTML);
  });
})();
