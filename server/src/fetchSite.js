const cheerio = require('cheerio');

const USER_AGENT =
  'Mozilla/5.0 (compatible; GrowthlineAuditBot/1.0; +https://growthline.example/bot)';
const FETCH_TIMEOUT_MS = 10000;
const SIDE_CHECK_TIMEOUT_MS = 4000;

const CTA_KEYWORDS = [
  'contact', 'contactez', 'appelez', 'appeler', 'réserver', 'reserver',
  'commander', 'acheter', 'devis', 'rendez-vous', 'rdv', "s'inscrire",
  'inscription', 'demander', 'obtenir', 'découvrir', 'decouvrir'
];

const PHONE_RE = /(?:\+33|0)\s?[1-9](?:[\s.-]?\d{2}){4}/;
const POSTAL_CODE_RE = /\b\d{5}\b/;

function normalizeTargetUrl(rawUrl) {
  var trimmed = (rawUrl || '').trim();
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }
  try {
    return new URL(trimmed).toString();
  } catch (err) {
    return null;
  }
}

function normalizeSocialUrl(platform, raw) {
  var value = (raw || '').trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) {
    try { return new URL(value).toString(); } catch (err) { return null; }
  }
  var handle = value.replace(/^@/, '');
  if (platform === 'instagram') return 'https://www.instagram.com/' + handle + '/';
  if (platform === 'tiktok') return 'https://www.tiktok.com/@' + handle;
  // facebook / linkedin renseignés sans schéma (ex: "facebook.com/...")
  return 'https://' + value.replace(/^\/+/, '');
}

async function fetchWithTimeout(url, options, timeoutMs) {
  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, timeoutMs);
  try {
    return await fetch(url, Object.assign({}, options, { signal: controller.signal }));
  } finally {
    clearTimeout(timer);
  }
}

async function checkReachable(url) {
  if (!url) return 'not_provided';
  try {
    var res = await fetchWithTimeout(
      url,
      { method: 'GET', headers: { 'User-Agent': USER_AGENT }, redirect: 'follow' },
      SIDE_CHECK_TIMEOUT_MS
    );
    return res.ok || (res.status >= 300 && res.status < 400) ? 'reachable' : 'unreachable';
  } catch (err) {
    // Beaucoup de plateformes sociales bloquent les requêtes de bots :
    // un échec ici ne prouve pas que le profil n'existe pas.
    return 'blocked_or_unreachable';
  }
}

async function checkPathExists(baseUrl, path) {
  try {
    var target = new URL(path, baseUrl).toString();
    var res = await fetchWithTimeout(
      target,
      { method: 'GET', headers: { 'User-Agent': USER_AGENT } },
      SIDE_CHECK_TIMEOUT_MS
    );
    return res.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Agent de collecte : récupère le HTML réel du site cible et en extrait des
 * signaux factuels (pas de jugement ici, juste des mesures et des présences/
 * absences). Les agents IA travailleront uniquement à partir de ces signaux.
 */
async function fetchSiteSignals(rawUrl, socials) {
  var targetUrl = normalizeTargetUrl(rawUrl);
  if (!targetUrl) {
    return { reachable: false, error: 'URL invalide.' };
  }

  var startedAt = Date.now();
  var response;
  var html;
  try {
    response = await fetchWithTimeout(
      targetUrl,
      { method: 'GET', headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' }, redirect: 'follow' },
      FETCH_TIMEOUT_MS
    );
    html = await response.text();
  } catch (err) {
    var reason = err.name === 'AbortError' ? 'Le site n\'a pas répondu à temps.' : "Impossible d'atteindre ce site.";
    return { reachable: false, error: reason, url: targetUrl };
  }
  var responseTimeMs = Date.now() - startedAt;

  if (!response.ok) {
    return { reachable: false, error: 'Le site a répondu avec une erreur (HTTP ' + response.status + ').', url: targetUrl };
  }

  var $ = cheerio.load(html);
  var finalUrl = response.url || targetUrl;
  var isHttps = finalUrl.startsWith('https://');
  var bodyText = $('body').text().replace(/\s+/g, ' ').trim();

  var title = ($('title').first().text() || '').trim();
  var metaDescription = ($('meta[name="description"]').attr('content') || '').trim();
  var viewportMetaPresent = $('meta[name="viewport"]').length > 0;
  var canonicalPresent = $('link[rel="canonical"]').length > 0;
  var ogTagsPresent = $('meta[property^="og:"]').length > 0;

  var h1Count = $('h1').length;
  var headingsOutline = {
    h1: $('h1').length, h2: $('h2').length, h3: $('h3').length
  };

  var imgs = $('img');
  var imgCount = imgs.length;
  var imgWithAlt = imgs.filter(function (i, el) {
    var alt = $(el).attr('alt');
    return typeof alt === 'string' && alt.trim().length > 0;
  }).length;
  var imgAltCoveragePct = imgCount > 0 ? Math.round((imgWithAlt / imgCount) * 100) : null;

  var jsonLdBlocks = [];
  $('script[type="application/ld+json"]').each(function (i, el) {
    try { jsonLdBlocks.push(JSON.parse($(el).text())); } catch (err) { /* ignore invalid blocks */ }
  });
  var jsonLdTypes = jsonLdBlocks.flatMap(function (b) {
    var arr = Array.isArray(b) ? b : [b];
    return arr.map(function (item) { return item && item['@type']; }).filter(Boolean);
  });
  var hasJsonLdLocalBusiness = jsonLdTypes.some(function (t) {
    return String(t).toLowerCase().indexOf('localbusiness') !== -1 || String(t).toLowerCase().indexOf('organization') !== -1;
  });

  var hasTelLink = $('a[href^="tel:"]').length > 0;
  var hasMailtoLink = $('a[href^="mailto:"]').length > 0;
  var hasPhoneText = PHONE_RE.test(bodyText);
  var hasPostalCodeText = POSTAL_CODE_RE.test(bodyText);
  var formsCount = $('form').length;

  var ctaCount = 0;
  $('a, button').each(function (i, el) {
    var txt = ($(el).text() || '').toLowerCase();
    if (CTA_KEYWORDS.some(function (k) { return txt.indexOf(k) !== -1; })) ctaCount++;
  });

  var navLinksCount = $('nav a, header a').length;
  var wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  var htmlSizeBytes = Buffer.byteLength(html, 'utf8');

  var pageLinks = $('a').map(function (i, el) { return ($(el).attr('href') || ''); }).get();
  function pageLinksTo(domainFragment) {
    return pageLinks.some(function (href) { return href.toLowerCase().indexOf(domainFragment) !== -1; });
  }

  var socialDomains = { instagram: 'instagram.com', tiktok: 'tiktok.com', facebook: 'facebook.com', linkedin: 'linkedin.com' };
  var socialLinksFoundOnPage = {};
  var socialProvidedUrls = {};
  Object.keys(socialDomains).forEach(function (platform) {
    socialLinksFoundOnPage[platform] = pageLinksTo(socialDomains[platform]);
    socialProvidedUrls[platform] = normalizeSocialUrl(platform, socials && socials[platform]);
  });

  var robotsTxtOk = await checkPathExists(finalUrl, '/robots.txt');
  var sitemapXmlOk = await checkPathExists(finalUrl, '/sitemap.xml');

  var socialReachability = {};
  for (var platform in socialProvidedUrls) {
    socialReachability[platform] = await checkReachable(socialProvidedUrls[platform]);
  }

  return {
    reachable: true,
    url: targetUrl,
    finalUrl: finalUrl,
    isHttps: isHttps,
    httpStatus: response.status,
    responseTimeMs: responseTimeMs,
    htmlSizeBytes: htmlSizeBytes,

    title: title,
    titleLength: title.length,
    metaDescription: metaDescription,
    metaDescriptionLength: metaDescription.length,
    viewportMetaPresent: viewportMetaPresent,
    canonicalPresent: canonicalPresent,
    ogTagsPresent: ogTagsPresent,
    robotsTxtOk: robotsTxtOk,
    sitemapXmlOk: sitemapXmlOk,

    headingsOutline: headingsOutline,
    h1Count: h1Count,
    imgCount: imgCount,
    imgWithAltCount: imgWithAlt,
    imgAltCoveragePct: imgAltCoveragePct,
    wordCount: wordCount,

    hasJsonLdLocalBusiness: hasJsonLdLocalBusiness,
    hasTelLink: hasTelLink,
    hasMailtoLink: hasMailtoLink,
    hasPhoneText: hasPhoneText,
    hasPostalCodeText: hasPostalCodeText,
    formsCount: formsCount,
    ctaCount: ctaCount,
    navLinksCount: navLinksCount,

    socialProvidedUrls: socialProvidedUrls,
    socialLinksFoundOnPage: socialLinksFoundOnPage,
    socialReachability: socialReachability
  };
}

module.exports = { fetchSiteSignals, normalizeTargetUrl };
