/**
 * Score "Performance" — calculé directement à partir de mesures réelles
 * (temps de réponse, poids du HTML), sans passer par un agent IA : ce sont
 * des chiffres, pas un jugement qualitatif. Volontairement simple (v1) :
 * ceci mesure le temps de réponse et le poids du document HTML, pas les
 * Core Web Vitals complets (qui nécessiteraient un navigateur headless).
 */
function scorePerformance(signals) {
  if (!signals || !signals.reachable) {
    return { score: 0, issues: [], strengths: [] };
  }

  var score = 100;
  var issues = [];
  var strengths = [];
  var ms = signals.responseTimeMs;
  var kb = signals.htmlSizeBytes / 1024;

  if (ms > 3000) { score -= 45; issues.push(sevIssue('critical', 'Temps de réponse du site très élevé', 'Le serveur a mis ' + Math.round(ms) + ' ms à répondre, ce qui pénalise fortement l\'expérience utilisateur et le référencement.')); }
  else if (ms > 1500) { score -= 30; issues.push(sevIssue('important', 'Temps de réponse du site élevé', 'Le serveur a mis ' + Math.round(ms) + ' ms à répondre. Sous les 800 ms serait plus confortable pour les visiteurs.')); }
  else if (ms > 800) { score -= 15; issues.push(sevIssue('opportunity', 'Temps de réponse perfectible', 'Le serveur a répondu en ' + Math.round(ms) + ' ms. Une optimisation du serveur ou du cache pourrait accélérer le chargement.')); }
  else if (ms > 300) { score -= 5; }
  else { strengths.push(strength('Temps de réponse rapide', 'Le serveur a répondu en ' + Math.round(ms) + ' ms, ce qui est un bon niveau pour l\'expérience utilisateur et le référencement.')); }

  if (kb > 1500) { score -= 35; issues.push(sevIssue('important', 'Page HTML très volumineuse', 'Le document HTML pèse ' + Math.round(kb) + ' Ko. Un poids élevé ralentit le premier affichage, surtout sur mobile.')); }
  else if (kb > 800) { score -= 25; issues.push(sevIssue('opportunity', 'Page HTML volumineuse', 'Le document HTML pèse ' + Math.round(kb) + ' Ko. Réduire ce poids améliorerait la vitesse perçue.')); }
  else if (kb > 300) { score -= 15; }
  else if (kb > 100) { score -= 5; }
  else { strengths.push(strength('Page HTML légère', 'Le document HTML pèse seulement ' + Math.round(kb) + ' Ko, ce qui favorise un chargement rapide.')); }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score: score, issues: issues, strengths: strengths };
}

function sevIssue(severity, title, description) {
  return { severity: severity, title: title, description: description, category: 'Performance' };
}

function strength(title, description) {
  return { title: title, description: description, category: 'Performance' };
}

module.exports = { scorePerformance };
