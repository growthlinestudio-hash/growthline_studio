// Vérification des paiements PayPal côté serveur : la source de vérité sur ce
// qui a réellement été payé doit être PayPal, jamais ce que le client
// prétend avoir payé. Le flux : le front crée + capture la commande via le
// SDK PayPal (client-side), envoie l'orderID ici, on interroge l'API PayPal
// pour confirmer que la commande est bien COMPLETED et du bon montant, puis
// on délivre un reçu à usage unique consommé par /api/audit.

var PAYPAL_ENV = process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox';
var PAYPAL_API_BASE = PAYPAL_ENV === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// tier -> prix attendu (EUR), doit correspondre à ce qui est affiché sur la
// page (pricing "Analyse de site" = 99€, paiement unique).
var TIER_PRICES = {
  pro: process.env.PAYPAL_PRICE_PRO || '99.00',
  business: process.env.PAYPAL_PRICE_BUSINESS || process.env.PAYPAL_PRICE_PRO || '99.00',
  agency: process.env.PAYPAL_PRICE_AGENCY || process.env.PAYPAL_PRICE_PRO || '99.00'
};

var tokenCache = { value: null, expiresAt: 0 };

function isConfigured() {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

function getAccessToken() {
  var now = Date.now();
  if (tokenCache.value && now < tokenCache.expiresAt) {
    return Promise.resolve(tokenCache.value);
  }
  var clientId = process.env.PAYPAL_CLIENT_ID;
  var clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  var basicAuth = Buffer.from(clientId + ':' + clientSecret).toString('base64');

  return fetch(PAYPAL_API_BASE + '/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + basicAuth,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  }).then(function (res) {
    if (!res.ok) throw new Error('Échec authentification PayPal (' + res.status + ').');
    return res.json();
  }).then(function (data) {
    tokenCache.value = data.access_token;
    // On rafraîchit un peu avant l'expiration réelle, par sécurité.
    tokenCache.expiresAt = now + Math.max(0, (data.expires_in - 60) * 1000);
    return tokenCache.value;
  });
}

// Vérifie qu'une commande PayPal est bien payée (COMPLETED) et correspond au
// tarif attendu pour le tier demandé. Renvoie la commande PayPal si valide,
// lève une erreur sinon.
function verifyOrder(orderId, tier) {
  if (!isConfigured()) {
    return Promise.reject(new Error('PayPal non configuré côté serveur (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET manquants).'));
  }
  var expectedAmount = TIER_PRICES[tier];
  if (!expectedAmount) {
    return Promise.reject(new Error('Forfait inconnu pour la vérification du paiement.'));
  }

  return getAccessToken().then(function (token) {
    return fetch(PAYPAL_API_BASE + '/v2/checkout/orders/' + encodeURIComponent(orderId), {
      headers: { Authorization: 'Bearer ' + token }
    });
  }).then(function (res) {
    if (!res.ok) throw new Error('Commande PayPal introuvable ou inaccessible.');
    return res.json();
  }).then(function (order) {
    if (order.status !== 'COMPLETED') {
      throw new Error('Paiement PayPal non finalisé (statut : ' + order.status + ').');
    }
    var unit = (order.purchase_units || [])[0];
    var paid = unit && unit.payments && unit.payments.captures && unit.payments.captures[0];
    var amount = paid && paid.amount;
    if (!amount || amount.currency_code !== 'EUR' || parseFloat(amount.value) < parseFloat(expectedAmount) - 0.01) {
      throw new Error('Montant payé ne correspond pas au forfait demandé.');
    }
    return order;
  });
}

module.exports = { verifyOrder: verifyOrder, isConfigured: isConfigured, TIER_PRICES: TIER_PRICES };
