#!/usr/bin/env node
// preflight.mjs — run this first, in the project root, before any build step.
// Reports what this machine can do and which runbook to follow.
//
//   node preflight.mjs
//
// Exit 0: full pipeline available. 1: degraded (see the table). 2: blocking.

import { statSync } from 'node:fs';
import { findBrowser, probeNetwork, SOURCES } from './env.mjs';

const row = (label, ok, detail) => {
  const mark = ok === true ? 'ok  ' : ok === false ? 'MISS' : 'warn';
  console.log(`  ${mark}  ${label.padEnd(22)} ${detail}`);
  return ok;
};

console.log('grain preflight — what this machine can do\n');

const results = [];

const nodeOk = process.versions.node.split('.').map(Number)[0] >= 22;
results.push(row('Node 22+', nodeOk, `Node ${process.versions.node}${nodeOk ? '' : ' — lint works, the inspector does not'}`));

const browser = findBrowser();
results.push(row('Chrome/Edge/Chromium', Boolean(browser), browser ? `${browser.path} (${browser.source})` : 'not found — the inspector cannot run; set GRAIN_BROWSER'));

const ov = await probeNetwork(SOURCES.openverse);
results.push(row('Openverse', ov.reachable, ov.reachable ? `reachable (${ov.ms}ms)` : 'unreachable — pictures must be drawn'));
const wc = await probeNetwork(SOURCES.commons);
results.push(row('Wikimedia Commons', wc.reachable, wc.reachable ? `reachable (${wc.ms}ms)` : 'unreachable — pictures must be drawn'));

let writeOk = true;
let writeDetail = '.grain/ writable';
try {
  const { mkdirSync, writeFileSync, rmSync } = await import('node:fs');
  mkdirSync('.grain', { recursive: true });
  writeFileSync('.grain/.preflight', 'ok');
  rmSync('.grain/.preflight', { force: true });
} catch (e) {
  writeOk = false;
  writeDetail = `cannot write .grain/ (${e.message})`;
}
results.push(row('Write access', writeOk, writeDetail));

const mode = results.every((r) => r === true)
  ? 'FULL PIPELINE — every step will run'
  : results.some((r) => r === false)
    ? 'DEGRADED — follow the ladder in SKILL.md ("If something is missing") and say so in the report'
    : 'FULL (with warnings)';
console.log(`\nMODE: ${mode}`);
console.log('\nNext: node scripts/draw.mjs --sector <id> --brief "…" --sections <roles>');

process.exit(results.every((r) => r !== false) ? (results.every((r) => r === true) ? 0 : 1) : 2);
