const { runCategoryAgent } = require('./_shared');

async function run(signals) {
  var data = {
    title: signals.title,
    titleLength: signals.titleLength,
    metaDescription: signals.metaDescription,
    metaDescriptionLength: signals.metaDescriptionLength,
    h1Count: signals.h1Count,
    headingsOutline: signals.headingsOutline,
    imgAltCoveragePct: signals.imgAltCoveragePct,
    canonicalPresent: signals.canonicalPresent,
    ogTagsPresent: signals.ogTagsPresent,
    robotsTxtOk: signals.robotsTxtOk,
    sitemapXmlOk: signals.sitemapXmlOk,
    wordCount: signals.wordCount
  };
  return runCategoryAgent({
    category: 'SEO',
    systemIntro:
      'Tu es un expert SEO pour Growthline. Tu évalues le référencement on-page ' +
      "d'un site (titre, meta description, structure des titres H1/H2/H3, " +
      'balises Open Graph, présence de robots.txt/sitemap.xml, longueur du ' +
      'contenu) à partir de signaux mesurés automatiquement. Sois factuel et ' +
      'concret, en français, pour un dirigeant non technique.',
    dataLabel: 'Signaux SEO du site',
    data: data
  });
}

module.exports = { run };
