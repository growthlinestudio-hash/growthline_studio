// Vérifie que les phrases du hero sont visibles à scrollY=0 après des allers-retours de scroll.
import { launch, sleep } from './cdp.mjs';
const BASE = process.env.BASE || 'http://127.0.0.1:8821/index.html';
const OUT = process.env.OUT || 'C:/Users/Utilisateur/Desktop/growthline-apercu/v3';
const SEL = ['.hero .eyebrow', '.hero h1', '.hero .lede', '.hero .hero-ctas', '.hero .hero-proof-list'];
const probe = `(()=>{const r={};for(const s of ${JSON.stringify(SEL)}){const e=document.querySelector(s);if(!e){r[s]='absent';continue}
 let o=1,n=e;while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity);n=n.parentElement}
 const b=e.getBoundingClientRect();r[s]={op:+o.toFixed(2),top:Math.round(b.top),bottom:Math.round(b.bottom),inView:b.bottom>0&&b.top<innerHeight,vis:getComputedStyle(e).visibility}}
 r.scrollY=Math.round(scrollY);return r})()`;
let fails = 0;
async function ready(page, extra = 3500) {   // attend la fin de l'intro / du démarrage du hero (rendu logiciel lent)
  for (let i = 0; i < 60; i++) { if (await page.ev("document.documentElement.classList.contains('hero-ready')")) break; await sleep(500); }
  await sleep(extra);
}
async function check(page, label, maxWait = 25000) {
  // « visible » = opacité cumulée > 0.95, dans le viewport, visibility visible. On laisse le scrub se terminer (rendu logiciel lent) :
  // un vrai bug (titre bloqué transparent) ne revient JAMAIS et dépasse donc le délai.
  const t0 = Date.now(); let r, bad;
  for (;;) {
    r = await page.ev(probe);
    bad = SEL.filter(s => r[s] === 'absent' ? false : !(r[s].op > 0.95 && r[s].inView && r[s].vis === 'visible'));
    if (!bad.length || Date.now() - t0 > maxWait) break;
    await sleep(700);
  }
  console.log((bad.length ? 'ECHEC ' : 'OK    ') + label + ' scrollY=' + r.scrollY + ' (' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)' + (bad.length ? ' -> ' + bad.map(s => s + ' op=' + r[s].op + ' top=' + r[s].top).join('; ') : ''));
  if (bad.length) fails++;
}
const page = await launch({ port: 9451 });
await page.go(BASE + '?fx', 2500); await ready(page, 6000);
await check(page, 'chargement');
await page.shot(OUT + '/test_0_haut.jpg');
for (let k = 0; k < 3; k++) {
  await page.scroll(2600, 1200); await page.scroll(0, 1800); await check(page, 'aller-retour instantané #' + (k + 1));
}
// scroll rapide par molette
for (let i = 0; i < 40; i++) { await page.wheel(300); await sleep(25); }
await sleep(800);
for (let i = 0; i < 60; i++) { await page.wheel(-300); await sleep(25); }
await sleep(2500); await check(page, 'molette rapide bas/haut');
await page.shot(OUT + '/test_1_retour_haut.jpg');
// reload au milieu de la page puis retour en haut
await page.scroll(1500, 800); await page.cmd('Page.reload'); await sleep(2500); await ready(page, 4500); await page.scroll(0, 2000); await check(page, 'reload au milieu puis haut');
// resize
await page.cmd('Emulation.setDeviceMetricsOverride', { width: 1100, height: 700, deviceScaleFactor: 1, mobile: false }); await sleep(1200);
await page.scroll(2000, 1000); await page.scroll(0, 1800); await check(page, 'après resize 1100x700');
// retour navigateur
await page.go(BASE.replace('index.html', 'services.html'), 4000); await page.cmd('Page.navigateToHistoryEntry', { entryId: (await page.cmd('Page.getNavigationHistory')).result.entries.slice(-2)[0].id }); await sleep(2500); await ready(page, 4500);
await page.scroll(0, 2500); await check(page, 'retour navigateur');
console.log('erreurs console:', page.logs.length ? page.logs.slice(0, 5) : 'aucune');
page.close();
console.log(fails ? 'RESULTAT: ' + fails + ' échec(s)' : 'RESULTAT: tout est visible'); process.exit(fails ? 1 : 0);
