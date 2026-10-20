import { launch, sleep } from './cdp.mjs';
const page = await launch({ port: 9462 });
await page.go('http://127.0.0.1:8821/index.html?fx', 9000);
const H = (await page.ev('document.documentElement.scrollHeight')) || 8000;
for (let y = 0; y <= H; y += 900) { await page.scroll(y, 800); }
await sleep(2000);
const u = {}; page.logs.forEach(l => u[l] = (u[l] || 0) + 1);
console.log('H=', H, JSON.stringify(u, null, 1));
page.close(); process.exit(0);
