import { launch, sleep } from './cdp.mjs';
const OUT = 'C:/Users/Utilisateur/Desktop/growthline-apercu/v3';
for (const w of [1280, 1100, 1000]) {
  const page = await launch({ port: 9480 + (w % 7), width: w, height: 700 });
  await page.go('http://127.0.0.1:8821/sous-traitance.html?fx', 5000);
  const r = await page.ev("(()=>{const n=document.querySelector('.nav-inner');return JSON.stringify({sw:n.scrollWidth,cw:n.clientWidth,over:document.documentElement.scrollWidth>innerWidth})})()");
  console.log(w, r); await page.shot(`${OUT}/nav_${w}.jpg`, 60); page.close();
}
process.exit(0);
