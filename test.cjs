// End-to-end run of the app at iPhone size. Usage: node test.cjs [en]
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let p = path.join(__dirname, 'dist', decodeURIComponent(q.url.split('?')[0])); if (p.endsWith('/')) p += 'index.html';
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); r.end(d); }); });
(async () => {
  await new Promise(r => srv.listen(4173, r));
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ar-SA', timezoneId: 'Asia/Riyadh' });
  await ctx.clock.install({ time: new Date('2026-11-14T10:05:00+03:00') });
  const p = await ctx.newPage(); const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  let n = 0; const shot = async (name) => { await p.waitForTimeout(350); await p.screenshot({ path: `shots/${String(++n).padStart(2, '0')}-${name}.png` }); };
  const tap = async (sel) => { await p.locator(sel).first().click(); await p.waitForTimeout(250); };
  const step = async (name, fn) => { try { await fn(); console.log('ok  ', name); } catch (e) { console.log('FAIL', name, '-', e.message.split('\n')[0]); errs.push('step ' + name); await p.screenshot({ path: `shots/FAIL-${name}.png` }); } };

  await p.goto('http://localhost:4173/'); await p.waitForTimeout(500); await shot('splash');
  await p.waitForTimeout(1500);
  await step('onboarding', async () => { await shot('onboard-1'); await tap('[data-testid=next]'); await shot('onboard-2'); await tap('[data-testid=next]'); await tap('[data-testid=next]');
    await p.fill('[data-testid=name]', 'ريماس'); await shot('onboard-name'); await tap('[data-testid=start]'); await p.waitForSelector('[data-screen=home]'); await shot('home'); });
  await step('link flight', async () => { await tap('[data-testid=flight-link]'); await p.fill('[data-testid=fno]', 'SV1543'); await shot('flight-sheet'); await tap('[data-testid=fno-go]'); await p.waitForSelector('[data-testid=flight-card]'); await shot('home-flight'); });
  await step('book transfer from flight', async () => { await tap('[data-testid=flight-book]'); await p.waitForSelector('[data-screen=transport]'); await shot('transport');
    await tap('[data-testid=to]'); await shot('place-picker'); await tap('[data-place=shura]'); await tap('[data-option=car]'); await shot('transport-selected');
    await tap('[data-testid=continue]'); await p.waitForSelector('[data-screen=checkout]'); await shot('checkout'); await tap('[data-pay=mada]'); await tap('[data-testid=pay]'); await shot('paying');
    await p.waitForSelector('[data-screen=ticket]', { timeout: 6000 }); await shot('ticket'); });
  await step('track trip', async () => { await p.locator('[data-testid=track-go]').scrollIntoViewIfNeeded(); await tap('[data-testid=track-go]'); await p.waitForTimeout(2500); await shot('tracking'); });
  await step('back home + delay', async () => { await tap('.topbar .round'); await p.waitForSelector('[data-screen=home]'); await shot('home-with-trip'); await tap('[data-testid=sim-delay]'); await shot('home-delayed'); const tg = await p.locator('[data-testid=next-trip] .tag').innerText(); if (!tg.includes('عُدّل')) throw new Error('booking not rescheduled: ' + tg); await tap('[data-testid=bell]'); await shot('notifications'); await tap('.scrim'); });
  await step('planner', async () => { await tap('[data-tab=plan]'); await p.waitForSelector('[data-screen=plan-form]'); await tap('[data-interest=sea]'); await tap('[data-interest=food]'); await tap('[data-interest=stars]'); await shot('plan-form');
    await p.locator('[data-testid=plan-go]').scrollIntoViewIfNeeded(); await tap('[data-testid=plan-go]'); await p.waitForTimeout(700); await shot('plan-thinking'); await p.waitForSelector('[data-screen=plan-view]', { timeout: 8000 }); await shot('plan-view');
    await p.locator('[data-screen=plan-view]').evaluate(e => e.scrollTo(0, 420)); await shot('plan-view-2'); await tap('[data-swap]'); await shot('plan-swapped'); });
  await step('book leg from plan', async () => { await p.locator('[data-book-leg]').first().scrollIntoViewIfNeeded(); await tap('[data-book-leg]'); await p.waitForSelector('[data-screen=checkout]'); await tap('[data-testid=pay]'); await p.waitForSelector('[data-screen=ticket]', { timeout: 6000 }); await shot('ticket-from-plan'); await tap('.topbar .round'); });
  await step('parking', async () => { await tap('[data-tab=parking]'); await p.waitForSelector('[data-screen=parking]'); await shot('parking'); await tap('[data-filter=ev]'); await shot('parking-filter'); await tap('[data-filter=ev]');
    await tap('[data-lot=p-rsi-a]'); await shot('lot-sheet'); await tap('[data-testid=reserve]'); await p.waitForSelector('[data-screen=checkout]'); await shot('parking-checkout'); await tap('[data-testid=pay]'); await p.waitForSelector('[data-screen=pass]', { timeout: 6000 }); await shot('parking-pass'); await tap('.topbar .round'); });
  await step('account + plus', async () => { await tap('[data-tab=account]'); await p.waitForSelector('[data-screen=account]'); await shot('account'); await tap('[data-testid=plus-card]'); await shot('plus'); await tap('[data-testid=plus-buy]'); await tap('[data-testid=pay]'); await p.waitForSelector('[data-screen=account]', { timeout: 6000 }); await p.waitForTimeout(600); await shot('account-plus');
    await tap('[data-testid=my-bookings]'); await shot('bookings'); await tap('[data-testid=tab-park]'); await shot('bookings-parking'); await tap('.topbar .round'); });
  await step('english + large text', async () => { await tap('[data-testid=toggle-lang]'); await shot('account-en'); await tap('[data-tab=home]'); await shot('home-en'); await tap('[data-tab=transport]'); await shot('transport-en'); await tap('[data-tab=plan]'); await shot('plan-en'); await tap('[data-tab=account]'); await tap('[data-testid=toggle-text]'); await shot('large-text-en'); await tap('[data-testid=toggle-text]'); await tap('[data-testid=toggle-lang]'); });
  await step('cancel booking', async () => { await tap('[data-testid=my-bookings]'); await tap('[data-booking]'); await p.locator('[data-testid=cancel]').scrollIntoViewIfNeeded(); await tap('[data-testid=cancel]'); await tap('[data-testid=cancel-yes]'); await p.locator('[data-screen=ticket]').evaluate(e => e.scrollTo(0, 0)); await shot('ticket-cancelled'); });
  await step('persistence after reload', async () => { await p.reload(); await p.waitForTimeout(2300); await p.waitForSelector('[data-screen=home]'); const t = await p.locator('[data-screen=home] h1').innerText(); if (!t.includes('ريماس')) throw new Error('name lost: ' + t); await shot('reloaded'); });
  // small Android-size check
  const c2 = await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p2 = await c2.newPage(); p2.on('pageerror', e => errs.push('pageerror(android): ' + e.message));
  await p2.goto('http://localhost:4173/'); await p2.waitForTimeout(2300); await p2.click('[data-testid=next]'); await p2.click('[data-testid=next]'); await p2.click('[data-testid=next]'); await p2.click('[data-testid=start]'); await p2.waitForSelector('[data-screen=home]'); await p2.waitForTimeout(300); await p2.screenshot({ path: 'shots/90-android-home.png' });
  await p2.click('[data-tab=transport]'); await p2.waitForTimeout(400); await p2.screenshot({ path: 'shots/91-android-transport.png' });
  const overflow = await p2.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1); if (overflow) errs.push('horizontal overflow at 360px');
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'NO ERRORS'); console.log('screenshots:', n + 2);
  await b.close(); srv.close();
})();
