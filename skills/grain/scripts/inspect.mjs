#!/usr/bin/env node
// inspect.mjs — measure the page in a real browser and fail it on the house rules.
// Drives Chrome, Edge, Chromium or Brave over the DevTools protocol with no
// dependencies (Node 22's built-in WebSocket).
//
//   node inspect.mjs <url or path/to/index.html> [--allow <rule>]
//
// Prints PASS/FAIL per rule and writes screenshots to .grain/inspect/.
// Needs Node 22+ and an installed Chrome, Edge, Chromium or Brave. Installs nothing.

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { findBrowser } from './env.mjs';
import { updateState } from './state.mjs';

const STATE_DIR = join(process.cwd(), '.grain');
const SHOTS_DIR = join(STATE_DIR, 'inspect');

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'phone', width: 390, height: 844 },
];

class CDP {
  constructor(wsUrl) {
    this.id = 0;
    this.pending = new Map();
    this.ws = new WebSocket(wsUrl);
    this.ready = new Promise((res, rej) => {
      this.ws.addEventListener('open', () => res());
      this.ws.addEventListener('error', (e) => rej(new Error('DevTools socket error: ' + (e.message || e.type))));
    });
    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { res, rej } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
      }
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const msg = { id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    this.ws.send(JSON.stringify(msg));
    return new Promise((res, rej) => this.pending.set(id, { res, rej }));
  }
}

// Wait for the document to finish loading. Polling readyState avoids the
// stale Page.loadEventFired that can fire for about:blank before the real
// navigation and leave the first viewport's counters empty.
async function waitForReady(cdp, sessionId, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const { result } = await cdp.send('Runtime.evaluate', {
        expression: 'document.readyState', returnByValue: true,
      }, sessionId);
      if (result?.value === 'complete') return;
    } catch { /* the page may be mid-navigation */ }
    await new Promise((r) => setTimeout(r, 100));
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const target = argv.find((a) => !a.startsWith('--'));
  if (!target) {
    console.log('inspect.mjs — measure a page in a real browser.\n  node inspect.mjs <url or path/to/index.html>');
    process.exit(1);
  }
  const allow = new Set(
    (argv.find((a) => a === '--allow') ? argv[argv.indexOf('--allow') + 1] : '')?.split(',').map((s) => s.trim()).filter(Boolean) || [],
  );

  const url = /^https?:\/\//i.test(target)
    ? target
    : pathToFileURL(target.startsWith('/') ? target : join(process.cwd(), target)).href;

  const browser = findBrowser();
  if (!browser?.path) {
    updateState((s) => {
      s.gates.push({ at: new Date().toISOString(), skipped: true, reason: 'no Chrome, Edge, Chromium or Brave found on this machine' });
    });
    console.log('No Chrome, Edge, Chromium or Brave found on this machine.');
    console.log('Install one, or set GRAIN_BROWSER to its path.');
    process.exit(2);
  }
  const browserPath = browser.path;

  const port = 9222 + Math.floor(Math.random() * 5000);
  const udd = join(STATE_DIR, `profile-${process.pid}`);
  const ciFlags = process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : [];
  const proc = spawn(browserPath, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    ...(process.getuid && process.getuid() === 0 ? ['--no-sandbox'] : []),
    ...ciFlags,
    `--remote-debugging-port=${port}`, `--user-data-dir=${udd}`, '--about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  let wsUrl = null;
  const stderrBuf = [];
  proc.stderr.on('data', (d) => {
    const line = d.toString();
    stderrBuf.push(line);
    const m = line.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) wsUrl = m[1];
  });

  for (let i = 0; i < 100 && !wsUrl; i++) await new Promise((r) => setTimeout(r, 100));
  if (!wsUrl) {
    proc.kill();
    console.log('Could not start the browser\'s debugger:\n' + stderrBuf.join('').slice(0, 500));
    process.exit(2);
  }

  mkdirSync(SHOTS_DIR, { recursive: true });
  const cdp = new CDP(wsUrl);
  await cdp.ready;

  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('DOM.enable', {}, sessionId);
  await cdp.send('Emulation.setScriptExecutionDisabled', { value: false }, sessionId).catch(() => {});

  // count what really moves, from first paint through a full scroll
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__grainMoves = new Set();
      window.__grainSeq = 0;
      const keyOf = (el) => {
        if (!el.__grainKey) el.__grainKey = 'g' + (++window.__grainSeq);
        return el.__grainKey;
      };
      for (const type of ['animationstart', 'transitionstart']) {
        document.addEventListener(type, (e) => {
          window.__grainMoves.add(keyOf(e.target));
        }, true);
      }
      window.__grainImgs = { total: 0, loaded: 0 };
      const count = () => {
        const imgs = [...document.querySelectorAll('img')];
        window.__grainImgs = { total: imgs.length, loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length };
      };
      document.addEventListener('DOMContentLoaded', count);
      window.addEventListener('load', count);
    `,
  }, sessionId);

  const checks = [];
  const add = (id, level, ok, detail) => {
    checks.push({ id, level, ok, detail });
    const mark = ok ? (level === 'FAIL' ? 'PASS' : 'ok  ') : level;
    console.log(`  ${String(mark).padEnd(4)} [${id.padEnd(18)}] ${detail}`);
  };

  for (const vp of VIEWPORTS) {
    console.log(`\n${vp.name} (${vp.width}px)`);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.name === 'phone',
    }, sessionId);

    await cdp.send('Page.navigate', { url }, sessionId);
    await waitForReady(cdp, sessionId);
    await new Promise((r) => setTimeout(r, 800));

    if (vp.name === 'phone') {
      // scroll through the page to trigger scroll-driven motion, then read counters
      await cdp.send('Runtime.evaluate', {
        expression: `(async () => {
          const h = document.body.scrollHeight;
          for (let y = 0; y <= h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
          window.scrollTo(0, 0);
          await new Promise(r => setTimeout(r, 300));
        })()`,
        awaitPromise: true,
      }, sessionId);
      await new Promise((r) => setTimeout(r, 700));
    }

    const { result } = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const out = { width: ${vp.width}, viewport: ${vp.height} };
        const doc = document.documentElement;
        out.hOverflow = doc.scrollWidth - ${vp.width};
        const px = (n) => parseFloat(n) || 0;

        out.headlines = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => {
          const cs = getComputedStyle(h);
          const lh = px(cs.lineHeight) || px(cs.fontSize) * 1.2;
          const lines = Math.round(h.getBoundingClientRect().height / lh);
          return { tag: h.tagName.toLowerCase(), text: h.textContent.trim().slice(0, 60), lines, fontSize: px(cs.fontSize) };
        });

        const paras = [...document.querySelectorAll('p, blockquote')]
          .filter((p) => !p.closest('footer, .caption, .credits, .credit, .note, .margin, .annotation'));
        out.statements = paras.map((p) => {
          const cs = getComputedStyle(p);
          return { fontSize: px(cs.fontSize), words: p.textContent.trim().split(/\\s+/).length };
        }).filter((s) => s.fontSize >= 24);
        out.bodySize = px(getComputedStyle(document.body).fontSize) || 16;

        let gradients = 0, shadows = 0, backdrops = 0;
        for (const el of document.querySelectorAll('*')) {
          const cs = getComputedStyle(el);
          if (cs.backgroundImage && /gradient\\(/i.test(cs.backgroundImage)) gradients++;
          if (cs.boxShadow && cs.boxShadow !== 'none') shadows++;
          if (cs.backdropFilter && cs.backdropFilter !== 'none') backdrops++;
        }
        out.gradients = gradients; out.shadows = shadows; out.backdrops = backdrops;

        out.moves = window.__grainMoves ? window.__grainMoves.size : -1;
        out.imgs = window.__grainImgs || { total: 0, loaded: 0 };

        const hero = document.querySelector('header, [class*=hero], section') || document.body;
        const media = hero.querySelector('img, video');
        if (media) {
          const r = media.getBoundingClientRect();
          out.heroMedia = Math.round((Math.min(r.width, ${vp.width}) * r.height) / (${vp.width} * ${vp.height}) * 100);
        } else out.heroMedia = 0;

        out.fontsLoaded = document.fonts ? document.fonts.status : 'n/a';

        const small = [];
        const isNote = (el) => el.closest('figcaption, footer, small, .caption, .credits, .credit, .note, .margin, .annotation, .button, button, [data-caption]');
        for (const el of document.querySelectorAll('p, li, td, th, a, blockquote, span')) {
          const cs = getComputedStyle(el);
          const fs = px(cs.fontSize);
          const t = el.textContent.trim();
          if (t.length > 12 && fs < 15 && cs.fontFamily && !/mono/i.test(cs.fontFamily) && !isNote(el)) {
            const rects = el.getClientRects();
            if (rects.length) small.push(Math.round(fs * 10) / 10);
          }
        }
        out.smallTextSizes = small;

        return out;
      })()`,
      returnByValue: true,
    }, sessionId);

    const m = result.value || {};

    if (vp.name === 'phone' && !allow.has('overflow')) {
      add('overflow', 'FAIL', (m.hOverflow || 0) <= 1, `horizontal overflow ${m.hOverflow}px`);
    }
    const badHeadlines = (m.headlines || []).filter((h) => h.lines > 2);
    add('headlines-2-line', 'FAIL', badHeadlines.length === 0,
      badHeadlines.length ? `${badHeadlines.length} headline(s) over two lines: ${badHeadlines.slice(0, 3).map((h) => `"${h.text}" (${h.lines})`).join('; ')}`
        : `${(m.headlines || []).length} headlines, all two lines or fewer`);
    if (!allow.has('body-size')) {
      add('body-size', 'FAIL', (m.bodySize || 16) >= 15, `body text ${m.bodySize}px`);
    }
    const small = (m.smallTextSizes || []);
    if (small.length > 0) {
      add('small-text', 'FAIL', small.length <= 3, `${small.length} running text run(s) under 15px (min ${Math.min(...small)}px)`);
    }
    if (!allow.has('no-gradient')) {
      add('no-gradient', 'FAIL', (m.gradients || 0) === 0, `${m.gradients} element(s) with gradient backgrounds`);
    }
    if (!allow.has('no-shadow')) {
      add('no-shadow', 'FAIL', (m.shadows || 0) === 0, `${m.shadows} element(s) with box-shadow`);
    }
    if (!allow.has('glass')) {
      add('glass', 'FAIL', (m.backdrops || 0) === 0, `${m.backdrops} element(s) with backdrop-filter`);
    }
    const bigStatements = (m.statements || []).filter((s) => s.fontSize > 36);
    add('statement-size', 'WARN', bigStatements.length === 0,
      bigStatements.length ? `statement set at ${bigStatements[0].fontSize}px — reads as a headline`
        : 'no statement over 36px');
    add('hero-media', 'WARN', (m.heroMedia || 0) >= 40, `hero media covers ${m.heroMedia || 0}% of the first screen`);
    add('images', 'WARN', (m.imgs?.total || 0) >= 4, `${m.imgs?.total || 0} images, ${m.imgs?.loaded || 0} loaded`);
    if ((m.imgs?.total || 0) > 0 && (m.imgs?.loaded || 0) < m.imgs.total) {
      add('images-loaded', 'FAIL', false, `${m.imgs.total - m.imgs.loaded} image(s) failed to load`);
    }
    if (!allow.has('motion')) {
      add('motion', 'WARN', (m.moves || 0) >= 8, `${m.moves || 0} elements moved during load and scroll (want 8+, strong at 16+)`);
    }

    if (vp.name === 'phone') {
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
      writeFileSync(join(SHOTS_DIR, 'phone.png'), Buffer.from(shot.data, 'base64'));
    } else {
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
      writeFileSync(join(SHOTS_DIR, `${vp.name}.png`), Buffer.from(shot.data, 'base64'));
    }
  }

  // tablet + phone motion check needs the counter at end of page; re-read once
  const { result: finalCounters } = await cdp.send('Runtime.evaluate', {
    expression: '({ moves: window.__grainMoves ? window.__grainMoves.size : -1, fonts: document.fonts ? document.fonts.status : "n/a" })',
    returnByValue: true,
  }, sessionId);
  if (finalCounters?.value && !allow.has('motion')) {
    const mv = finalCounters.value.moves;
    if (mv >= 0) add('motion', 'FAIL', mv >= 8, `${mv} elements moved in total (want 8+)`);
  }
  if (finalCounters?.value?.fonts === 'loading') {
    add('fonts', 'WARN', false, 'fonts still loading when measured');
  }

  // reduced motion: content must stay visible when the user asks for less motion
  if (!allow.has('reduced-motion')) {
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    }, sessionId);
    await cdp.send('Page.navigate', { url }, sessionId);
    await waitForReady(cdp, sessionId);
    await new Promise((r) => setTimeout(r, 400));
    const { result: rm } = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const els = [...document.querySelectorAll('[data-motion]')];
        const hidden = els.filter((el) => getComputedStyle(el).opacity === '0');
        return { total: els.length, hidden: hidden.length };
      })()`,
      returnByValue: true,
    }, sessionId);
    const v = rm?.value || { total: 0, hidden: 0 };
    add('reduced-motion', 'FAIL', v.hidden === 0,
      v.total ? `${v.hidden} of ${v.total} motion element(s) still hidden under prefers-reduced-motion` : 'no [data-motion] elements to check');
  }

  const fails = checks.filter((c) => !c.ok && c.level === 'FAIL');
  const warns = checks.filter((c) => !c.ok && c.level === 'WARN');

  writeFileSync(join(SHOTS_DIR, 'report.json'), JSON.stringify({ url, checks }, null, 2));

  updateState((s) => {
    s.gates.push({
      at: new Date().toISOString(),
      url,
      ok: fails.length === 0,
      fails: fails.length,
      warns: warns.length,
      failDetails: fails.map((f) => `${f.id}: ${f.detail}`),
    });
  });

  try { cdp.send('Browser.close'); } catch {}
  proc.kill('SIGTERM');
  await new Promise((r) => setTimeout(r, 300));
  try { rmSync(udd, { recursive: true, force: true }); } catch { /* the browser may still hold files; harmless */ }

  console.log(`\nScreenshots in ${SHOTS_DIR}/ — look at them; the meter is not the eye.`);
  if (fails.length === 0) {
    console.log(`inspect: PASS — ${warns.length} WARN${warns.length === 1 ? '' : 's'}.`);
    process.exit(0);
  } else {
    console.log(`inspect: ${fails.length} FAIL, ${warns.length} WARN. Fix the FAILs.`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('inspect: ' + e.message);
  process.exit(2);
});
