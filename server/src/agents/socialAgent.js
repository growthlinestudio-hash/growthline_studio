const { runCategoryAgent } = require('./_shared');

async function run(signals) {
  var data = {
    socialProvidedUrls: signals.socialProvidedUrls,
    socialLinksFoundOnPage: signals.socialLinksFoundOnPage,
    socialReachability: signals.socialReachability
  };
  return runCategoryAgent({
    category: 'Social',
    systemIntro:
      'Tu es un expert en présence sur les réseaux sociaux pour des petites ' +
      'entreprises locales, pour Growthline. Tu évalues quels réseaux sociaux ' +
      "ont été renseignés, s'ils sont accessibles, et si le site web fait bien " +
      "le lien vers ces profils. Note : \"blocked_or_unreachable\" ne prouve pas " +
      "qu'un profil n'existe pas (beaucoup de réseaux sociaux bloquent les robots), " +
      'donc ne pénalise pas fortement ce seul signal — base ton jugement surtout ' +
      "sur le nombre de réseaux renseignés et le lien depuis le site. Sois " +
      'factuel, en français, pour un dirigeant non technique.',
    dataLabel: 'Signaux de présence sociale',
    data: data
  });
}

module.exports = { run };
