const { runCategoryAgent } = require('./_shared');

async function run(signals) {
  var data = {
    ctaCount: signals.ctaCount,
    formsCount: signals.formsCount,
    hasTelLink: signals.hasTelLink,
    hasMailtoLink: signals.hasMailtoLink,
    navLinksCount: signals.navLinksCount,
    wordCount: signals.wordCount
  };
  return runCategoryAgent({
    category: 'Conversion',
    systemIntro:
      'Tu es un expert en optimisation de la conversion (CRO) pour Growthline. ' +
      "Tu évalues si un site facilite la prise de contact et le passage à l'action " +
      '(boutons/liens avec verbe d\'action, présence de formulaires, numéro de ' +
      "téléphone cliquable, email cliquable) à partir de signaux mesurés " +
      'automatiquement. Sois factuel et concret, en français, pour un dirigeant ' +
      'non technique.',
    dataLabel: 'Signaux de conversion du site',
    data: data
  });
}

module.exports = { run };
