#!/usr/bin/env node
// doctor.mjs — where does this build stand? Run it in any build folder.
// Reads the build state and prints what is done, what is missing, and what
// to do next.
//
//   node doctor.mjs [--strict]
//
// --strict exits 1 when anything required is missing (for CI and checklists).

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadState } from './state.mjs';

const strict = process.argv.includes('--strict');
const s = loadState();

if (!s) {
  console.log('grain doctor — no build state in this folder.');
  console.log('Start one: node scripts/preflight.mjs, then scripts/draw.mjs');
  process.exit(1);
}

const items = [];

const mark = (cond) => (cond ? 'ok  ' : 'MISS');

items.push([!!s.direction, mark(!!s.direction), s.direction?.direction ? `direction dealt — ${s.direction.direction.name} [${s.direction.direction.id}]` : 'direction not dealt — run draw.mjs']);

const gate = s.gates[s.gates.length - 1];
const gateDone = !!(gate && !gate.skipped && gate.ok);
items.push([gateDone, mark(gateDone), gate
  ? gate.skipped ? `gate skipped (${gate.reason})` : `gate ${gate.ok ? 'PASS' : 'FAIL'} (${gate.fails} FAIL, ${gate.warns} WARN)`
  : 'gate never run — run lint.mjs and inspect.mjs']);

const picsOk = s.pictures.length >= 4;
items.push([picsOk, mark(picsOk), `${s.pictures.length} pictures found and credited (floor: 4)`]);
items.push([!!s.idea, mark(!!s.idea), s.idea ? 'idea recorded' : 'idea not recorded — report.mjs --idea "sentence"']);
items.push([!!s.liveThing, mark(!!s.liveThing), s.liveThing ? 'live thing recorded' : 'live thing not recorded — report.mjs --live "thing"']);

const critOk = !!s.critique;
items.push([critOk, mark(critOk), s.critique ? `critique ${s.critique.score}` : 'no critique — do the look step, then report.mjs --score']);

const shots = existsSync(join(process.cwd(), '.grain', 'inspect'));
items.push([shots, mark(shots), shots ? 'screenshots exist in .grain/inspect/' : 'no screenshots — inspect.mjs writes them']);

console.log('grain doctor — status of this build\n');
let missing = 0;
for (const [ok, m, label] of items) {
  console.log(`  ${m}  ${label}`);
  if (!ok) missing++;
}
console.log(missing ? `\n${missing} thing(s) missing. Next step: ${nextStep(items)}` : '\nBuild complete — run node scripts/report.mjs to draft the report.');
process.exit(strict && missing ? 1 : 0);

function nextStep(items) {
  if (!items[0][0]) return 'scripts/preflight.mjs, then scripts/draw.mjs';
  if (!items[1][0]) return 'scripts/lint.mjs and scripts/inspect.mjs';
  if (!items[2][0]) return 'scripts/assets.mjs — find and credit four real pictures';
  if (!items[3][0] || !items[4][0]) return 'write the idea, then report.mjs --idea / --live';
  if (!items[5][0]) return 'the look step (critique.md), then report.mjs --score';
  return 'scripts/inspect.mjs';
}

