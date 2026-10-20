/* Growthline — 3 cas d'audit fictifs (realisations.html#auditCase).
   Contenu fixe, construit pour illustrer la méthode Growthline — jamais
   présenté comme de vrais clients (voir le disclaimer-note dans le HTML).
   Indépendant de GSAP : navigation et anneau de score en JS/CSS natif. */
(function () {
  'use strict';

  var caseEl = document.getElementById('auditCase');
  if (!caseEl) return;

  var AUDITS = [
    {
      tag: 'AUDIT 01', name: 'CASA NOVA', sector: 'Restaurant méditerranéen premium — Marseille',
      score: 74,
      metrics: [
        { label: 'Image de marque', value: 82 },
        { label: 'Site web', value: 71 },
        { label: 'Conversion', value: 58 },
        { label: 'SEO local', value: 79 },
        { label: 'Réseaux sociaux', value: 86 },
        { label: 'Expérience utilisateur', value: 63 }
      ],
      diagnostic: "CASA NOVA possède déjà une bonne visibilité. Le problème est que cette visibilité n'est pas suffisamment transformée en réservations.",
      problems: [
        { title: 'CTA trop faible', text: "Le visiteur découvre le restaurant mais l'action principale n'est pas suffisamment évidente." },
        { title: 'Parcours mobile perfectible', text: "Une grande partie des visiteurs arrive depuis Instagram, mais le parcours vers la réservation demande trop d'étapes." },
        { title: 'Preuve sociale sous-exploitée', text: "Les avis et éléments de confiance existent mais ne sont pas placés aux moments stratégiques." }
      ],
      opportunity: "Simplifier le parcours : Instagram → Site → Menu → Avis → Réservation, avec un CTA réservation constamment visible.",
      verdict: "CASA NOVA n'a pas un problème de visibilité. Elle a un problème de conversion.",
      priority: "Transformer chaque visite du site en opportunité de réservation."
    },
    {
      tag: 'AUDIT 02', name: 'CABINET ÉLAN', sector: 'Kinésithérapie & bien-être — Marseille',
      score: 48,
      metrics: [
        { label: 'Positionnement', value: 54 },
        { label: 'Site web', value: 31 },
        { label: 'Conversion', value: 39 },
        { label: 'SEO local', value: 62 },
        { label: 'Réseaux sociaux', value: 45 },
        { label: 'Confiance', value: 47 }
      ],
      diagnostic: "Cabinet Élan possède une expertise réelle, mais son image digitale ne la reflète pas. Un prospect doit rapidement comprendre qui vous êtes, pourquoi vous choisir, et que faire ensuite.",
      problems: [
        { title: 'Positionnement peu clair', text: 'Plusieurs prestations sont présentées sans hiérarchie claire.' },
        { title: 'Absence de parcours de conversion efficace', text: "Les informations sont dispersées et la prise de rendez-vous n'est pas suffisamment directe." },
        { title: 'Manque de réassurance', text: "L'expertise, les témoignages et les résultats sont insuffisamment valorisés." }
      ],
      opportunity: 'Recherche Google → Page service → Preuves → Présentation → Prise de rendez-vous.',
      verdict: "Votre expertise est meilleure que votre présence digitale. Le problème, c'est que vos prospects ne peuvent pas le deviner.",
      priority: "Transformer l'expertise du cabinet en expérience digitale qui inspire immédiatement confiance."
    },
    {
      tag: 'AUDIT 03', name: 'NOMAÉ', sector: 'Décoration intérieure premium — E-commerce',
      score: 61,
      metrics: [
        { label: 'Image de marque', value: 84 },
        { label: 'Site web', value: 68 },
        { label: 'Conversion', value: 42 },
        { label: 'SEO', value: 57 },
        { label: 'Expérience utilisateur', value: 59 },
        { label: 'Réassurance', value: 46 }
      ],
      diagnostic: "NOMAÉ attire déjà l'attention. Le problème n'est pas uniquement le trafic : c'est ce qui se passe après le clic.",
      problems: [
        { title: 'Pages produits insuffisamment persuasives', text: 'Produits visuellement attractifs, mais bénéfices et arguments d\'achat mal hiérarchisés.' },
        { title: 'Réassurance insuffisante', text: 'Avis, livraison, retours et garanties arrivent trop tard ou restent trop discrets.' },
        { title: 'Tunnel de conversion fragile', text: 'Le visiteur peut parcourir plusieurs produits sans être suffisamment guidé vers l\'achat.' }
      ],
      opportunity: 'Publicité / Social → Produit → Réassurance → Panier → Achat, avec une hiérarchie plus agressive autour de la conversion.',
      verdict: 'Le trafic est là. La marque est crédible. Mais une partie de vos visiteurs quitte le site avant de devenir client.',
      priority: 'Optimiser le parcours produit → panier → achat.'
    }
  ];

  var tagEl = document.getElementById('auditTag');
  var nameEl = document.getElementById('auditName');
  var sectorEl = document.getElementById('auditSector');
  var scoreNumEl = document.getElementById('auditScoreNum');
  var scoreRing = document.getElementById('auditScoreRing');
  var metricsEl = document.getElementById('auditMetrics');
  var diagnosticEl = document.getElementById('auditDiagnostic');
  var problemsEl = document.getElementById('auditProblems');
  var opportunityEl = document.getElementById('auditOpportunity');
  var verdictEl = document.getElementById('auditVerdict');
  var priorityEl = document.getElementById('auditPriority');
  var counterEl = document.getElementById('auditCounter');
  var prevBtn = document.getElementById('auditPrev');
  var nextBtn = document.getElementById('auditNext');

  var RING_CIRC = 201;
  var idx = 0;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function statusClass(v) { return v >= 70 ? 'is-good' : v >= 50 ? 'is-warn' : 'is-bad'; }

  function render(i) {
    var a = AUDITS[i];
    tagEl.textContent = a.tag;
    nameEl.textContent = a.name;
    sectorEl.textContent = a.sector;
    scoreNumEl.textContent = a.score;
    scoreRing.style.strokeDashoffset = String(RING_CIRC * (1 - a.score / 100));
    metricsEl.innerHTML = a.metrics.map(function (m) {
      return '<div class="audit-metric"><span>' + m.label + '</span><b class="' + statusClass(m.value) + '">' + m.value + '</b></div>';
    }).join('');
    problemsEl.innerHTML = a.problems.map(function (p, n) {
      return '<div class="audit-problem"><span class="audit-problem-num">' + (n + 1) + '</span><div><b>' + p.title + '</b><p>' + p.text + '</p></div></div>';
    }).join('');
    diagnosticEl.textContent = a.diagnostic;
    opportunityEl.textContent = a.opportunity;
    verdictEl.textContent = '« ' + a.verdict + ' »';
    priorityEl.textContent = a.priority;
    var n = i + 1;
    counterEl.textContent = (n < 10 ? '0' + n : n) + ' / 0' + AUDITS.length;
  }

  function goTo(next) {
    idx = (next + AUDITS.length) % AUDITS.length;
    if (reduced) { render(idx); return; }
    caseEl.classList.add('is-switching');
    setTimeout(function () {
      render(idx);
      caseEl.classList.remove('is-switching');
    }, 260);
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(idx - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(idx + 1); });

  if (reduced || !('IntersectionObserver' in window)) {
    render(idx);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          render(idx);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .3 });
    io.observe(caseEl);
  }
})();
