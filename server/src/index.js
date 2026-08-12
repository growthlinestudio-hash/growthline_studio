require('dotenv').config();

const path = require('path');
const express = require('express');
const compression = require('compression');

const { fetchSiteSignals } = require('./fetchSite');
const { scorePerformance } = require('./performance');
const { synthesizeReport, applyTierLimits } = require('./synthesize');
const websiteAgent = require('./agents/websiteAgent');
const seoAgent = require('./agents/seoAgent');
const conversionAgent = require('./agents/conversionAgent');
const localSeoAgent = require('./agents/localSeoAgent');
const socialAgent = require('./agents/socialAgent');
const paypal = require('./paypal');

// Reçus de paiement vérifiés côté serveur, à usage unique : un orderID
// PayPal confirmé "COMPLETED" est stocké ici jusqu'à ce qu'il serve à
// débloquer un /api/audit payant, puis retiré. Process unique, pas de
// scaling horizontal prévu pour l'instant donc une Map en mémoire suffit —
// à remplacer par un store partagé (Redis, DB) si le serveur est répliqué.
var verifiedReceipts = new Map(); // orderId -> { tier, verifiedAt }
var RECEIPT_TTL_MS = 30 * 60 * 1000; // 30 min pour aller au bout de l'audit après paiement

function pruneExpiredReceipts() {
  var now = Date.now();
  verifiedReceipts.forEach(function (entry, orderId) {
    if (now - entry.verifiedAt > RECEIPT_TTL_MS) verifiedReceipts.delete(orderId);
  });
}

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
// Sert le site statique (index.html, vision.html, images/, css, js) : tout
// tourne sur la même origine que l'API, donc aucun souci de CORS.
app.use(express.static(path.join(__dirname, '..', '..'), {
  extensions: ['html'],
  setHeaders: function (res, filePath) {
    // Images/CSS/JS versionnés implicitement par nom de fichier : cache long.
    if (/\.(webp|jpg|jpeg|png|svg|css|js)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    } else if (/\.html$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

app.get('/api/paypal/config', function (req, res) {
  res.json({
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    configured: paypal.isConfigured(),
    prices: paypal.TIER_PRICES
  });
});

app.post('/api/paypal/verify-order', async function (req, res) {
  try {
    var body = req.body || {};
    var orderId = (body.orderId || '').trim();
    var tier = (body.tier || '').trim();
    if (!orderId || !tier) {
      return res.status(400).json({ error: 'orderId et tier requis.' });
    }
    await paypal.verifyOrder(orderId, tier);
    pruneExpiredReceipts();
    verifiedReceipts.set(orderId, { tier: tier, verifiedAt: Date.now() });
    res.json({ verified: true, receipt: orderId });
  } catch (err) {
    console.error('Erreur /api/paypal/verify-order :', err);
    res.status(422).json({ error: err.message || 'Paiement introuvable ou invalide.' });
  }
});

app.post('/api/audit', async function (req, res) {
  try {
    var body = req.body || {};
    var name = (body.name || '').trim();
    var url = (body.url || '').trim();
    var sector = (body.sector || '').trim();
    var city = (body.city || '').trim();
    var socials = body.socials || {};
    var tier = (body.tier || 'free').trim();
    var receipt = (body.receipt || '').trim();

    if (!url) {
      return res.status(400).json({ error: 'URL du site manquante.' });
    }

    if (tier !== 'free') {
      pruneExpiredReceipts();
      var receiptEntry = receipt && verifiedReceipts.get(receipt);
      if (!receiptEntry || receiptEntry.tier !== tier) {
        return res.status(402).json({ error: 'Paiement requis pour le forfait ' + tier + '.' });
      }
      verifiedReceipts.delete(receipt); // reçu à usage unique
    }

    var signals = await fetchSiteSignals(url, socials);
    if (!signals.reachable) {
      return res.status(422).json({ error: signals.error || 'Impossible d\'analyser ce site.' });
    }

    var meta = { city: city, sector: sector };

    var agentResults = await runAgents(signals, meta);

    var performanceResult = scorePerformance(signals);

    var report = synthesizeReport({
      business: { name: name || 'Votre entreprise', city: city },
      agentResults: agentResults,
      performanceResult: performanceResult
    });

    res.json(applyTierLimits(report, tier));
  } catch (err) {
    console.error('Erreur /api/audit :', err);
    var message = /ANTHROPIC_API_KEY/.test(err.message)
      ? 'Clé API manquante ou invalide côté serveur — vérifiez server/.env.'
      : "Une erreur inattendue s'est produite pendant l'analyse.";
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, function () {
  console.log('Server running on http://localhost:' + PORT);
});
