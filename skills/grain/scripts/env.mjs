// env.mjs — shared environment probing: which browser is installed, whether
// the open archives are reachable. Used by preflight.mjs and inspect.mjs.

import { existsSync } from 'node:fs';

export function findBrowser() {
  const fromEnv = process.env.GRAIN_BROWSER || process.env.CHROME_PATH;
  if (fromEnv && existsSync(fromEnv)) return { path: fromEnv, source: 'env' };
  const candidates = [
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium',
    '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge', '/usr/bin/microsoft-edge-stable',
    '/usr/bin/brave-browser', '/usr/bin/brave',
    '/opt/google/chrome/chrome', '/opt/microsoft/msedge/msedge',
    '/snap/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  for (const c of candidates) {
    if (existsSync(c)) return { path: c, source: 'found' };
  }
  return null;
}

export async function probeNetwork(url, timeoutMs = 4000) {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'User-Agent': 'grain-skill/1.0 (preflight)' },
    });
    return { reachable: res.ok, ms: Date.now() - start };
  } catch {
    return { reachable: false, ms: Date.now() - start };
  }
}

export const SOURCES = {
  openverse: 'https://api.openverse.org/v1/images/?q=test&page_size=1',
  commons: 'https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=test&srnamespace=6&srlimit=1',
};
