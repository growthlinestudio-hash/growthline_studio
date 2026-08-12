const { runCategoryAgent } = require('./_shared');

async function run(signals) {
  var data = {
    isHttps: signals.isHttps,
    httpStatus: signals.httpStatus,
    title: signals.title,
    titleLength: signals.titleLength,
    metaDescription: signals.metaDescription,
    metaDescriptionLength: signals.metaDescriptionLength,
    viewportMetaPresent: signals.viewportMetaPresent,
    canonicalPresent: signals.canonicalPresent,
    ogTagsPresent: signals.ogTagsPresent,
    h1Count: signals.h1Count,
    headingsOutline: signals.headingsOutline,
    imgAltCoveragePct: signals.imgAltCoveragePct,
    formsCount: signals.formsCount
  };
  return runCategoryAgent({
    category: 'Website',
    systemIntro:
      "Tu es un auditeur technique de sites web pour Growthline, un outil d'audit " +
      "digital pour petites entreprises. Tu évalues la qualité technique et " +
      "structurelle générale d'un site (HTTPS, balises meta, structure des titres, " +
      'accessibilité de base des images) à partir de signaux mesurés automatiquement. ' +
      'Sois factuel et concret, en français, pour un dirigeant non technique.',
    dataLabel: 'Signaux techniques du site',
    data: data
  });
}

module.exports = { run };
