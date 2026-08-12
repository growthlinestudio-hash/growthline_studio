const { askForJson } = require('../claudeClient');

const JSON_SCHEMA_INSTRUCTION =
  'Réponds UNIQUEMENT avec un objet JSON de cette forme exacte, sans texte ' +
  "autour, sans balises markdown :\n" +
  '{\n' +
  '  "score": <entier de 0 à 100>,\n' +
  '  "strengths": [\n' +
  '    { "title": "<titre court, en français>", "description": "<1-2 phrases factuelles, en français>" }\n' +
  '  ],\n' +
  '  "issues": [\n' +
  '    { "severity": "critical" | "important" | "opportunity", "title": "<titre court, en français>", "description": "<1-2 phrases factuelles, en français>" }\n' +
  '  ]\n' +
  '}\n' +
  'Règles :\n' +
  "- \"critical\" = un problème qui nuit clairement à l'acquisition de clients.\n" +
  '- "important" = un problème réel mais moins urgent.\n' +
  "- \"opportunity\" = une amélioration possible, pas un problème bloquant.\n" +
  '- Donne entre 1 et 4 issues au total, les plus pertinentes seulement.\n' +
  '- "strengths" = ce qui fonctionne déjà bien, à ne pas changer. Donne entre 0 et 3 strengths, uniquement si c\'est vraiment justifié par les données ; un tableau vide est correct s\'il n\'y a rien de notable.\n' +
  "- Base-toi UNIQUEMENT sur les données fournies. N'invente jamais de donnée absente.";

function clampScore(v) {
  var n = Number(v);
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeSeverity(s) {
  return ['critical', 'important', 'opportunity'].indexOf(s) !== -1 ? s : 'opportunity';
}

async function runCategoryAgent(opts) {
  var system = opts.systemIntro + '\n\n' + JSON_SCHEMA_INSTRUCTION;
  var prompt = opts.dataLabel + ' (JSON) :\n' + JSON.stringify(opts.data);
  try {
    var result = await askForJson({ system: system, prompt: prompt, maxTokens: 500 });
    var issues = Array.isArray(result.issues)
      ? result.issues.slice(0, 4).map(function (it) {
          return {
            severity: normalizeSeverity(it.severity),
            title: String(it.title || '').slice(0, 140),
            description: String(it.description || '').slice(0, 400),
            category: opts.category
          };
        })
      : [];
    var strengths = Array.isArray(result.strengths)
      ? result.strengths.slice(0, 3).map(function (it) {
          return {
            title: String(it.title || '').slice(0, 140),
            description: String(it.description || '').slice(0, 400),
            category: opts.category
          };
        })
      : [];
    return { category: opts.category, score: clampScore(result.score), issues: issues, strengths: strengths };
  } catch (err) {
    console.error('Agent "' + opts.category + '" a échoué :', err.message);
    return { category: opts.category, score: null, issues: [], strengths: [], error: err.message };
  }
}

module.exports = { runCategoryAgent };
