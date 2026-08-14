const { runCategoryAgent } = require('./_shared');

async function run(signals, meta) {
  var data = {
    villeRenseigneeParLeClient: (meta && meta.city) || null,
    secteurActivite: (meta && meta.sector) || null,
    hasJsonLdLocalBusiness: signals.hasJsonLdLocalBusiness,
    hasPhoneText: signals.hasPhoneText,
    hasPostalCodeText: signals.hasPostalCodeText,
    hasTelLink: signals.hasTelLink
  };
  return runCategoryAgent({
    category: 'Local SEO',
    systemIntro:
      'Tu es un expert en SEO local pour Growthline. Tu évalues la présence de ' +
      'signaux de cohérence Nom/Adresse/Téléphone (NAP) et de données ' +
      "structurées locales (schema.org LocalBusiness) sur le site d'une " +
      'entreprise locale, à partir de signaux mesurés automatiquement. Sois ' +
      'factuel et concret, en français, pour un dirigeant non technique.',
    dataLabel: 'Signaux de présence locale du site',
    data: data
  });
}

module.exports = { run };
