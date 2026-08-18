/* Growthline — démo interactive "Growthline Intelligence" (index.html#intelligence).
   Simulation locale uniquement : pas de vraie analyse, pas de réseau. Chiffres
   génériques par secteur, clairement annoncés comme une démonstration dans le
   HTML (disclaimer-note) — jamais présentés comme un vrai résultat client. */
(function () {
  'use strict';

  var section = document.getElementById('intelligence');
  if (!section) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!window.gsap;

  var toggle = document.getElementById('intelSectorToggle');
  var scanEl = document.getElementById('intelScan');
  var scanTextEl = document.getElementById('intelScanText');
  var resultsEl = document.getElementById('intelResults');
  var scoreEl = document.getElementById('intelScoreNum');
  var breakdownEl = document.getElementById('intelBreakdown');
  var issuesEl = document.getElementById('intelIssues');
  if (!toggle || !scanEl || !resultsEl) return;

  var CATEGORY_LABELS = {
    website: 'Site web', seo: 'SEO', conversion: 'Conversion',
    localSeo: 'SEO local', social: 'Réseaux sociaux', performance: 'Performance'
  };
  var CATEGORY_ORDER = ['website', 'seo', 'conversion', 'localSeo', 'social', 'performance'];

  var ICONS = {
    strength: '<path d="M20 6L9 17l-5-5"/>',
    critical: '<path d="M12 9v4M12 17h.01M10.3 3.9L2.6 17.5a1.8 1.8 0 001.6 2.7h15.6a1.8 1.8 0 001.6-2.7L13.7 3.9a1.8 1.8 0 00-3.4 0z"/>',
    important: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    opportunity: '<path d="M12 21c4-3 7-6.5 7-11a7 7 0 10-14 0c0 4.5 3 8 7 11z"/><circle cx="12" cy="10" r="2.5"/>'
  };
  var TAGS = { strength: 'Point fort', critical: 'Critique', important: 'Important', opportunity: 'Opportunité' };

  var SCAN_MESSAGES = [
    'Récupération de la page…',
    'Analyse technique et sécurité…',
    'Analyse du référencement (SEO)…',
    'Analyse de la prise de contact…',
    'Rédaction du résumé…'
  ];

  var SECTORS = {
    restaurant: {
      overall: 58,
      scores: { website: 62, seo: 54, conversion: 41, localSeo: 73, social: 66, performance: 55 },
      items: [
        { severity: 'strength', title: 'Fiche Google bien complétée', description: "Horaires, photos et avis sont à jour : la recherche locale fonctionne bien pour ce type d'établissement." },
        { severity: 'critical', title: 'Aucune réservation possible depuis le site', description: "Le menu n'est disponible qu'en photo, et rien ne permet de réserver une table directement." },
        { severity: 'opportunity', title: 'Images du menu trop lourdes', description: 'Non compressées, elles ralentissent nettement le chargement sur mobile.' }
      ]
    },
    dentiste: {
      overall: 71,
      scores: { website: 78, seo: 69, conversion: 74, localSeo: 80, social: 52, performance: 71 },
      items: [
        { severity: 'strength', title: 'Prise de rendez-vous en ligne fluide', description: 'Le lien vers la prise de rendez-vous est visible dès l\'arrivée sur le site.' },
        { severity: 'important', title: 'Peu de contenu rassurant sur l\'équipe', description: "Aucune présentation des praticiens ni de leurs diplômes, un critère de confiance important dans ce secteur." },
        { severity: 'opportunity', title: 'Réseaux sociaux peu reliés au site', description: 'Aucun lien vers Instagram ou Facebook : une visibilité supplémentaire perdue.' }
      ]
    },
    artisan: {
      overall: 49,
      scores: { website: 44, seo: 38, conversion: 55, localSeo: 61, social: 40, performance: 52 },
      items: [
        { severity: 'strength', title: 'Portfolio de réalisations convaincant', description: 'Les photos avant/après des chantiers donnent confiance immédiatement.' },
        { severity: 'critical', title: 'Site non sécurisé', description: "Le site n'est pas en HTTPS : les navigateurs affichent un avertissement qui fait fuir une partie des visiteurs." },
        { severity: 'opportunity', title: 'Pas de formulaire de devis rapide', description: 'Un simple formulaire en 3 questions augmenterait le nombre de demandes.' }
      ]
    },
    boutique: {
      overall: 64,
      scores: { website: 70, seo: 58, conversion: 62, localSeo: 45, social: 74, performance: 60 },
      items: [
        { severity: 'strength', title: 'Fiches produits bien rédigées', description: 'Descriptions claires et photos multiples : le contenu produit est un vrai point fort.' },
        { severity: 'important', title: "Tunnel d'achat trop long", description: "6 étapes avant le paiement, contre 2 à 3 en moyenne pour ce type de boutique — une source d'abandons de panier." },
        { severity: 'opportunity', title: 'SEO local sous-exploité', description: "Pas de page dédiée à la zone de livraison locale, alors qu'une partie des clients cherche une boutique 'près de moi'." }
      ]
    }
  };

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function issueCardHtml(item) {
    return (
      '<div class="issue-card ' + item.severity + '">' +
        '<div class="issue-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICONS[item.severity] + '</svg></div>' +
        '<div class="issue-body"><span class="tag">' + TAGS[item.severity] + '</span><h4>' + escapeHtml(item.title) + '</h4><p>' + escapeHtml(item.description) + '</p></div>' +
      '</div>'
    );
  }

  var running = false;
  var scanTimer = null;
  var hasPlayedOnce = false;

  function playScanMessages(duration) {
    var i = 0;
    scanTextEl.textContent = SCAN_MESSAGES[0];
    var step = duration / SCAN_MESSAGES.length;
    scanTimer = setInterval(function () {
      i++;
      if (i >= SCAN_MESSAGES.length) { clearInterval(scanTimer); return; }
      scanTextEl.style.opacity = 0;
      setTimeout(function () {
        scanTextEl.textContent = SCAN_MESSAGES[i];
        scanTextEl.style.opacity = 1;
      }, 140);
    }, step);
  }

  function renderResults(data) {
    breakdownEl.innerHTML = CATEGORY_ORDER.map(function (key) {
      var num = data.scores[key];
      return (
        '<div class="score-card"><div class="cat">' + CATEGORY_LABELS[key] + '</div>' +
        '<div class="num">' + num + '</div>' +
        '<div class="bar"><span style="width:' + (reduced ? num : 0) + '%"' + (reduced ? '' : ' data-target="' + num + '"') + '></span></div></div>'
      );
    }).join('');
    issuesEl.innerHTML = data.items.map(issueCardHtml).join('');
    scoreEl.textContent = reduced ? data.overall : '0';

    scanEl.hidden = true;
    resultsEl.hidden = false;
    if (!reduced) resultsEl.classList.add('intel-demo-fade-in');
    setTimeout(function () { resultsEl.classList.remove('intel-demo-fade-in'); }, 550);

    if (reduced) return;

    if (hasGsap) {
      var bars = breakdownEl.querySelectorAll('.bar span');
      bars.forEach(function (bar) {
        gsap.to(bar, { width: bar.getAttribute('data-target') + '%', duration: .8, ease: 'power2.out' });
      });
      var target = { val: 0 };
      gsap.to(target, {
        val: data.overall, duration: .9, ease: 'power1.out',
        onUpdate: function () { scoreEl.textContent = Math.round(target.val); }
      });
    } else {
      breakdownEl.querySelectorAll('.bar span').forEach(function (bar) {
        bar.style.width = bar.getAttribute('data-target') + '%';
      });
      scoreEl.textContent = data.overall;
    }
  }

  function runDemo(sectorKey) {
    var data = SECTORS[sectorKey];
    if (!data || running) return;
    running = true;
    hasPlayedOnce = true;

    resultsEl.hidden = true;
    scanEl.hidden = false;
    if (scanTimer) clearInterval(scanTimer);

    var scanDuration = reduced ? 0 : 1500;
    if (scanDuration) playScanMessages(scanDuration);

    setTimeout(function () {
      if (scanTimer) clearInterval(scanTimer);
      renderResults(data);
      running = false;
    }, scanDuration);
  }

  toggle.addEventListener('click', function (e) {
    var btn = e.target.closest('.slot-toggle-btn');
    if (!btn || running) return;
    toggle.querySelectorAll('.slot-toggle-btn').forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
    });
    runDemo(btn.getAttribute('data-sector'));
  });

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !hasPlayedOnce) {
          runDemo('restaurant');
          obs.disconnect();
        }
      });
    }, { threshold: .4 });
    obs.observe(section);
  } else {
    runDemo('restaurant');
  }
})();
