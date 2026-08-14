require('dotenv').config();

const path = require('path');
const express = require('express');
const compression = require('compression');

const { fetchSiteSignals } = require('./fetchSite');
const { scorePerformance } = require('./performance');
const { synthesizeReport } = require('./synthesize');
const websiteAgent = require('./agents/websiteAgent');
const seoAgent = require('./agents/seoAgent');
const conversionAgent = require('./agents/conversionAgent');
const localSeoAgent = require('./agents/localSeoAgent');
const socialAgent = require('./agents/socialAgent');

// Outil interne, usage local uniquement (voir README) : pas de forfaits, pas
// de paiement — chaque analyse rend toujours le rapport complet.

// Un modèle Ollama local tient un peu de parallèle mais pas les 5 agents à la
// fois (connexions refusées au-delà de sa capacité) : on plafonne à 2 appels
// simultanés, un compromis entre vitesse et fiabilité sur ce type de machine.
var AGENT_CONCURRENCY = 2;

function runAgents(signals, meta) {
  var tasks = [
    function () { return websiteAgent.run(signals); },
    function () { return seoAgent.run(signals); },
    function () { return conversionAgent.run(signals); },
    function () { return localSeoAgent.run(signals, meta); },
    function () { return socialAgent.run(signals); }
  ];
  var results = new Array(tasks.length);
  var next = 0;
  function worker() {
    var i = next++;
    if (i >= tasks.length) return Promise.resolve();
    return tasks[i]().then(function (r) { results[i] = r; return worker(); });
  }
  var workers = [];
  for (var w = 0; w < Math.min(AGENT_CONCURRENCY, tasks.length); w++) workers.push(worker());
  return Promise.all(workers).then(function () { return results; });
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(compression());
app.use(express.json());

app.get('/healthz', function (req, res) {
  res.status(200).json({ status: 'ok' });
});
// Sert le site statique (toutes les pages du dossier racine) : l'outil
// d'audit tourne sur la même origine, donc aucun souci de CORS.
app.use(express.static(path.join(__dirname, '..', '..'), {
  extensions: ['html'],
  setHeaders: function (res, filePath) {
    if (/\.(webp|jpg|jpeg|png|svg|css|js)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    } else if (/\.html$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

app.post('/api/audit', async function (req, res) {
  try {
    var body = req.body || {};
    var name = (body.name || '').trim();
    var url = (body.url || '').trim();
    var sector = (body.sector || '').trim();
    var city = (body.city || '').trim();
    var socials = body.socials || {};

    if (!url) {
      return res.status(400).json({ error: 'URL du site manquante.' });
    }

    var signals = await fetchSiteSignals(url, socials);
    if (!signals.reachable) {
      return res.status(422).json({ error: signals.error || 'Impossible d\'analyser ce site.' });
    }

    var meta = { city: city, sector: sector };

    var agentResults = await runAgents(signals, meta);

    var performanceResult = scorePerformance(signals);

    var report = synthesizeReport({
      business: { name: name || 'Cette entreprise', city: city },
      agentResults: agentResults,
      performanceResult: performanceResult
    });

    res.json(report);
  } catch (err) {
    console.error('Erreur /api/audit :', err);
    var message = /ANTHROPIC_API_KEY/.test(err.message)
      ? 'Clé API manquante ou invalide côté serveur — vérifiez server/.env.'
      : "Une erreur inattendue s'est produite pendant l'analyse.";
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, function () {
  console.log('Outil d\'audit Growthline (local) : http://localhost:' + PORT + '/outil-audit.html');
});
