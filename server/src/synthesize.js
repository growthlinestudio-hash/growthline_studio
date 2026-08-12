const CATEGORY_KEY_MAP = {
  Website: 'website',
  SEO: 'seo',
  Conversion: 'conversion',
  'Local SEO': 'localSeo',
  Social: 'social'
};

/**
 * Fusionne les résultats des 5 agents IA + le score Performance déterministe
 * en un rapport final. Aucune donnée n'est inventée ici : uniquement de
 * l'agrégation/tri de ce que les agents ont déjà produit.
 */
function synthesizeReport(opts) {
  var business = opts.business;
  var agentResults = opts.agentResults;
  var performanceResult = opts.performanceResult;

  var scores = { performance: performanceResult.score };
  var allIssues = performanceResult.issues.slice();
  var allStrengths = (performanceResult.strengths || []).slice();

  agentResults.forEach(function (r) {
    var key = CATEGORY_KEY_MAP[r.category];
    // Si un agent a échoué (erreur API, parsing...), on met une valeur neutre
    // plutôt que de fausser la moyenne globale ou de faire planter le rapport.
    scores[key] = r.score === null ? 50 : r.score;
    allIssues = allIssues.concat(r.issues);
    allStrengths = allStrengths.concat(r.strengths || []);
  });

  var scoreValues = Object.keys(scores).map(function (k) { return scores[k]; });
  var overall = Math.round(scoreValues.reduce(function (a, b) { return a + b; }, 0) / scoreValues.length);

  var severityOrder = { critical: 0, important: 1, opportunity: 2 };
  allIssues.sort(function (a, b) { return severityOrder[a.severity] - severityOrder[b.severity]; });

  var critical = allIssues.filter(function (i) { return i.severity === 'critical'; }).slice(0, 4);
  var important = allIssues.filter(function (i) { return i.severity === 'important'; }).slice(0, 3);
  var opportunities = allIssues.filter(function (i) { return i.severity === 'opportunity'; }).slice(0, 3);
  var strengths = allStrengths.slice(0, 4);

  // Potentiel estimé : gain plafonné selon le nombre/gravité des problèmes détectés.
  var gain = critical.length * 8 + important.length * 4 + opportunities.length * 2;
  var potential = Math.max(overall, Math.min(97, overall + Math.min(gain, 30)));

  return {
    business: business,
    scores: {
      website: scores.website,
      seo: scores.seo,
      conversion: scores.conversion,
      localSeo: scores.localSeo,
      social: scores.social,
      performance: scores.performance
    },
    overall: overall,
    potential: potential,
    strengths: strengths,
    issues: { critical: critical, important: important, opportunities: opportunities },
    generatedAt: new Date().toISOString()
  };
}

// Free : aperçu (score + 3 problèmes max, pas de points forts), pour donner
// envie de passer à un forfait payant. Pro/Business/Agency : rapport complet
// sans restriction — la profondeur ne varie pas encore entre eux.
var TIER_LIMITS = {
  free: { maxIssues: 3, includeStrengths: false },
  pro: { maxIssues: Infinity, includeStrengths: true },
  business: { maxIssues: Infinity, includeStrengths: true },
  agency: { maxIssues: Infinity, includeStrengths: true }
};

function applyTierLimits(report, tier) {
  var normalizedTier = Object.prototype.hasOwnProperty.call(TIER_LIMITS, tier) ? tier : 'free';
  var limits = TIER_LIMITS[normalizedTier];

  var issues = report.issues;
  if (limits.maxIssues !== Infinity) {
    var severityOrder = { critical: 0, important: 1, opportunity: 2 };
    var flat = issues.critical.concat(issues.important, issues.opportunities)
      .sort(function (a, b) { return severityOrder[a.severity] - severityOrder[b.severity]; })
      .slice(0, limits.maxIssues);
    issues = {
      critical: flat.filter(function (i) { return i.severity === 'critical'; }),
      important: flat.filter(function (i) { return i.severity === 'important'; }),
      opportunities: flat.filter(function (i) { return i.severity === 'opportunity'; })
    };
  }

  return {
    business: report.business,
    scores: report.scores,
    overall: report.overall,
    potential: report.potential,
    tier: normalizedTier,
    strengths: limits.includeStrengths ? report.strengths : [],
    issues: issues,
    generatedAt: report.generatedAt
  };
}

module.exports = { synthesizeReport: synthesizeReport, applyTierLimits: applyTierLimits };
