/* Growthline — outil d'audit interne (outil-audit.html).
   Appelle l'API locale /api/audit (server/) : nécessite que le serveur
   Express + Ollama tournent sur cet ordinateur (voir server/README ou
   `npm start` dans server/). Rend le rapport avec les mêmes composants
   visuels que l'exemple statique de realisations.html. */
(function () {
  'use strict';

  var form = document.getElementById('toolAuditForm');
  if (!form) return;

  var loadingEl = document.getElementById('toolLoading');
  var loadingTextEl = document.getElementById('toolLoadingText');
  var errorEl = document.getElementById('toolError');
  var resultsEl = document.getElementById('toolResults');
  var breakdownEl = document.getElementById('toolScoreBreakdown');
  var issuesListEl = document.getElementById('toolIssuesList');
  var scoreOverallEl = document.getElementById('toolScoreOverall');
  var scorePotentialEl = document.getElementById('toolScorePotential');

  var LOADING_MESSAGES = [
    'Récupération du site…',
    'Lecture de la structure de la page…',
    'Analyse technique et sécurité…',
    'Analyse du référencement (SEO)…',
    'Analyse de la prise de contact (conversion)…',
    'Analyse de la présence locale…',
    'Analyse des réseaux sociaux…',
    'Rédaction du rapport en français simple…'
  ];
  var loadingTimer = null;

  function startLoadingMessages() {
    var i = 0;
    loadingTextEl.textContent = LOADING_MESSAGES[0];
    loadingTimer = setInterval(function () {
      i = (i + 1) % LOADING_MESSAGES.length;
      loadingTextEl.style.opacity = 0;
      setTimeout(function () {
        loadingTextEl.textContent = LOADING_MESSAGES[i];
        loadingTextEl.style.opacity = 1;
      }, 250);
    }, 8000);
  }
  function stopLoadingMessages() {
    if (loadingTimer) { clearInterval(loadingTimer); loadingTimer = null; }
  }

  var CATEGORY_LABELS = {
    website: 'Site web',
    seo: 'SEO',
    conversion: 'Conversion',
    localSeo: 'SEO local',
    social: 'Réseaux sociaux',
    performance: 'Performance'
  };
  var CATEGORY_ORDER = ['website', 'seo', 'conversion', 'localSeo', 'social', 'performance'];

  var ICONS = {
    strength: '<path d="M20 6L9 17l-5-5"/>',
    critical: '<path d="M12 9v4M12 17h.01M10.3 3.9L2.6 17.5a1.8 1.8 0 001.6 2.7h15.6a1.8 1.8 0 001.6-2.7L13.7 3.9a1.8 1.8 0 00-3.4 0z"/>',
    important: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    opportunity: '<path d="M12 21c4-3 7-6.5 7-11a7 7 0 10-14 0c0 4.5 3 8 7 11z"/><circle cx="12" cy="10" r="2.5"/>'
  };
  var TAGS = { strength: 'Point fort', critical: 'Critique', important: 'Important', opportunity: 'Opportunité' };

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function issueCardHtml(severity, item) {
    return (
      '<div class="issue-card ' + severity + '">' +
        '<div class="issue-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICONS[severity] + '</svg></div>' +
        '<div class="issue-body"><span class="tag">' + TAGS[severity] + '</span><h4>' + escapeHtml(item.title) + '</h4><p>' + escapeHtml(item.description) + '</p></div>' +
      '</div>'
    );
  }

  function renderReport(report) {
    scoreOverallEl.childNodes[0].nodeValue = report.overall != null ? report.overall : '–';
    scorePotentialEl.childNodes[0].nodeValue = report.potential != null ? report.potential : '–';

    breakdownEl.innerHTML = CATEGORY_ORDER.map(function (key) {
      var val = report.scores && report.scores[key];
      var num = typeof val === 'number' ? val : 0;
      return (
        '<div class="score-card"><div class="cat">' + CATEGORY_LABELS[key] + '</div>' +
        '<div class="num">' + num + '</div>' +
        '<div class="bar"><span style="width:' + num + '%"></span></div></div>'
      );
    }).join('');

    var cards = [];
    (report.strengths || []).forEach(function (s) { cards.push(issueCardHtml('strength', s)); });
    (report.issues && report.issues.critical || []).forEach(function (s) { cards.push(issueCardHtml('critical', s)); });
    (report.issues && report.issues.important || []).forEach(function (s) { cards.push(issueCardHtml('important', s)); });
    (report.issues && report.issues.opportunities || []).forEach(function (s) { cards.push(issueCardHtml('opportunity', s)); });
    issuesListEl.innerHTML = cards.length
      ? cards.join('')
      : '<div class="issue-card"><div class="issue-body"><p>Aucun point notable détecté.</p></div></div>';

    resultsEl.hidden = false;
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    errorEl.hidden = true;
    resultsEl.hidden = true;
    loadingEl.hidden = false;
    startLoadingMessages();

    var payload = {
      url: form.url.value.trim(),
      name: form.name.value.trim(),
      city: form.city.value.trim()
    };

    fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (result) {
        stopLoadingMessages();
        loadingEl.hidden = true;
        if (!result.ok) {
          errorEl.textContent = result.data.error || "Une erreur inattendue s'est produite.";
          errorEl.hidden = false;
          return;
        }
        renderReport(result.data);
      })
      .catch(function () {
        stopLoadingMessages();
        loadingEl.hidden = true;
        errorEl.textContent = "Impossible de joindre le serveur local. Vérifiez qu'il tourne bien (dossier server/, commande \"npm start\").";
        errorEl.hidden = false;
      });
  });
})();
