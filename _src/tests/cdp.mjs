// Mini client CDP (Node 22+, WebSocket natif) pour piloter Chrome headless en temps réel.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
export const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function launch({ port = 9444, width = 1440, height = 900, mobile = false, reduced = false, extra = [] } = {}) {
  const prof = (process.env.TEMP || '.').split(String.fromCharCode(92)).join('/') + '/gl_prof_' + port;
  const args = ['--headless=new', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-automation',
    '--remote-debugging-port=' + port, '--window-size=' + width + ',' + height, '--user-data-dir=' + prof, '--hide-scrollbars', ...extra, 'about:blank'];
  const proc = spawn(CHROME, args, { stdio: 'ignore' });
  let tabs;
  for (let k = 0; k < 60; k++) { try { tabs = await (await fetch('http://127.0.0.1:' + port + '/json')).json(); break; } catch { await sleep(300); } }
  const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {}; const logs = [];
  ws.onmessage = e => { const m = JSON.parse(e.data);
    if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; }
    else if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) logs.push(m.params.type + ': ' + m.params.args.map(a => a.value || a.description).join(' '));
    else if (m.method === 'Runtime.exceptionThrown') logs.push('exception: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text)); };
  const cmd = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  await cmd('Page.enable'); await cmd('Runtime.enable');
  await cmd('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  if (reduced) await cmd('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const api = {
    logs, cmd,
    async go(url, wait = 6000) { await cmd('Page.navigate', { url }); await sleep(wait); },
    async ev(expr) { const r = await cmd('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); return r.result?.result?.value; },
    async scroll(y, wait = 900) { await api.ev(`window.scrollTo({top:${y},behavior:'instant'})`); await sleep(wait); },
    async wheel(dy, x = 700, y = 450) { await cmd('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY: dy }); },
    async shot(path, quality = 70) { const r = await cmd('Page.captureScreenshot', { format: 'jpeg', quality }); fs.mkdirSync(path.slice(0, path.lastIndexOf('/')), { recursive: true }); fs.writeFileSync(path, Buffer.from(r.result.data, 'base64')); },
    close() { try { ws.close(); } catch {} proc.kill(); },
  };
  return api;
}
