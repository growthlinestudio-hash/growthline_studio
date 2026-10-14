import { launch, sleep } from './cdp.mjs';
const OUT = 'C:/Users/Utilisateur/Desktop/growthline-apercu/v3';
const B = 'http://127.0.0.1:8821/';
const mode = process.argv[2] || 'desktop';
const opts = mode === 'mobile' ? { port: 9471, width: 390, height: 844, mobile: true } : mode === 'reduced' ? { port: 9472, reduced: true } : { port: 9470 };
const page = await launch(opts);
const q = mode === 'desktop' ? '?fx&forcegl' : '?fx';
await page.go(B + 'index.html' + q, 2500);
for (let i = 0; i < 80; i++) { if (await page.ev("document.documentElement.classList.contains('hero-ready')")) break; await sleep(500); }
await sleep(mode === 'reduced' ? 1500 : 6000);
const H = await page.ev('document.documentElement.scrollHeight');
console.log(mode, 'hauteur page', H, 'erreurs:', page.logs.filter(l => !/SplitText/.test(l)).slice(0, 4));
const stops = mode === 'mobile' ? [0, 700, 1800, Math.round(H * .55), H - 900, H] : [0, 500, 1100, 2200, Math.round(H * .5), Math.round(H * .72), H - 1000, H];
let n = 0;
for (const y of stops) {
  await page.scroll(y, 2200); n++;
  await page.shot(`${OUT}/${mode}_${String(n).padStart(2, '0')}_y${y}.jpg`, 62);
}
if (mode === 'desktop') {
  await page.go(B + 'sous-traitance.html' + '?fx', 7000); await page.shot(`${OUT}/sous-traitance_1_haut.jpg`, 62);
  await page.scroll(900, 1800); await page.shot(`${OUT}/sous-traitance_2_tarifs.jpg`, 62);
  await page.scroll(5000, 1800); await page.shot(`${OUT}/sous-traitance_3_bas.jpg`, 62);
}
page.close(); process.exit(0);
