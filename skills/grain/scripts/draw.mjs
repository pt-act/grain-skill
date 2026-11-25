#!/usr/bin/env node
// draw.mjs — deal art directions and print a direction sheet for a build.
//
//   node draw.mjs --list sectors
//   node draw.mjs --list roles
//   node draw.mjs --sector <id> --brief "<one line>" --sections <role,role,role>
//                  [--tone <tone>] [--have photography,product-photo,...]
//                  [--keep palette,type] [--options 3] [--seed 1]
//   node draw.mjs ... --direction <chosen id>      (full sheet)
//   node draw.mjs --show                          (reprint last sheet)
//   node draw.mjs ... --redraw hero|type|palette|section:<role>=<alt>
//   node draw.mjs --photos <direction id>
//   node draw.mjs --site <site id>

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadState, updateState } from './state.mjs';
import { DIRECTIONS, DIRECTION_BY_ID } from '../library/directions.js';
import { PALETTES, PALETTE_BY_ID } from '../library/palettes.js';
import { TYPE_SYSTEMS, TYPE_SYSTEM_BY_ID } from '../library/type-systems.js';
import { HEROES, HERO_BY_ID } from '../library/heroes.js';
import { SECTIONS, SECTION_ROLES } from '../library/sections.js';
import { MOTIONS, MOTION_BY_ID } from '../library/motions.js';
import { SECTORS, SECTOR_BY_ID } from '../library/sectors.js';
import { SITES } from '../library/sites.js';
import { IMAGE_QUERIES_BY_DIRECTION } from '../library/image-queries.js';
import { LIBRARY_VERSION } from '../library/version.js';

const SKILL_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const TONES = ['quiet', 'bold', 'warm', 'technical', 'playful', 'luxury', 'editorial'];
const HAVE = ['photography', 'product-photo', 'product-ui', 'illustration', 'video'];

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let s = hashSeed(String(seed));
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function pick(rand, arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN(rand, arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    } else {
      args._.push(a);
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

function usage(code = 0) {
  console.log(`draw.mjs — deal directions and print a direction sheet.

  --list sectors              list sectors
  --list roles                list section roles
  --sector <id> --brief "…" --sections <role,role,…>   deal directions
      [--tone quiet|bold|warm|technical|playful|luxury|editorial]
      [--have photography,product-photo,product-ui,illustration,video]
      [--keep palette,type]   only deal composition; keep the given slots
      [--options 3]           deal N options (default 3), then stop
      [--seed <n>]            reproducible deal
      --direction <id>        print the full sheet for one dealt direction
      --redraw <slot>         deal a new value for hero|type|palette
      --redraw section:<role>=<alt>  swap a section blueprint
      --alternatives <role>    list blueprint alternatives for a role
      --show                  reprint the last sheet in this folder
      --photos <direction id> reference photograph queries for a direction
      --site <site id>        show one studied site
`);
  process.exit(code);
}

if (args.help || args.h || args._[0] === 'help') usage(0);
if (args._.length === 0 && Object.keys(args).length === 1) usage(1);

if (args['list'] === 'sectors' || args.list === 'sectors') {
  for (const s of SECTORS) console.log(`${s.id.padEnd(24)} ${s.name} — ${s.examples}`);
  process.exit(0);
}

if (args['list'] === 'roles' || args.list === 'roles') {
  for (const r of SECTION_ROLES) console.log(`${r.role.padEnd(16)} ${r.name} — ${r.meaning}`);
  process.exit(0);
}

if (args.site) {
  const site = SITES.find((s) => s.id === args.site || s.url.includes(args.site));
  if (!site) {
    console.log(`No site "${args.site}". Studied sites:`);
    for (const s of SITES) console.log(`  ${s.id.padEnd(24)} ${s.url}`);
    process.exit(1);
  }
  console.log(`${site.url}\n  ${site.note}\n  grain: ${site.grain.join(', ')}\n  lesson: ${site.lesson}`);
  process.exit(0);
}

if (args.show) {
  const state = loadState();
  if (!state?.direction) {
    console.log('No sheet yet. Deal one first.');
    process.exit(1);
  }
  if (state.libraryVersion && state.libraryVersion !== LIBRARY_VERSION) {
    console.log(`Note: this sheet was dealt by library ${state.libraryVersion}; the library is now ${LIBRARY_VERSION}. Re-deal if the difference matters.`);
  }
  printSheet(state.direction, { header: 'Last sheet' });
  process.exit(0);
}

if (args.redraw) {
  const state = loadState();
  if (!state?.direction) {
    console.log('No direction dealt yet. Deal one first.');
    process.exit(1);
  }
  const sheet = JSON.parse(JSON.stringify(state.direction));
  const slot = String(args.redraw);
  const reason = args.reason || null;
  let changed = false;

  if (slot === 'hero' || slot === 'type' || slot === 'palette') {
    const d = DIRECTION_BY_ID[sheet.direction.id];
    const list = slot === 'hero' ? d.heroes : slot === 'type' ? d.types : d.palettes;
    const curId = slot === 'hero' ? sheet.hero.id : slot === 'type' ? sheet.typeSystem.id : sheet.palette.id;
    const nextId = list[(list.indexOf(curId) + 1) % list.length];
    if (slot === 'hero') sheet.hero = HERO_BY_ID[nextId];
    if (slot === 'type') sheet.typeSystem = TYPE_SYSTEM_BY_ID[nextId];
    if (slot === 'palette') sheet.palette = PALETTE_BY_ID[nextId];
    changed = true;
  } else if (slot.startsWith('section:')) {
    const m = slot.match(/^section:([\w-]+)=([\w-]+)$/);
    if (!m) { console.log('Use --redraw section:<role>=<alt blueprint id>'); process.exit(1); }
    const [, role, alt] = m;
    if (!sheet.blueprints[role]) { console.log(`No dealt section "${role}".`); process.exit(1); }
    if (!SECTIONS[alt]) { console.log(`No blueprint "${alt}". List them: node scripts/draw.mjs --alternatives ${role}`); process.exit(1); }
    sheet.blueprints[role] = SECTIONS[alt];
    changed = true;
  } else if (slot === 'photos') {
    console.log('Photos are not a slot — the sheet queries are guidance; search with assets.mjs.');
    process.exit(1);
  } else {
    console.log('Redraw one of: hero, type, palette, section:<role>=<alt>');
    process.exit(1);
  }

  if (!reason) console.log('Note: no --reason given. A redraw without a stated reason reads as comfort-seeking; the report will ask for one.');
  updateState((s) => {
    s.direction = sheet;
    s.libraryVersion = LIBRARY_VERSION;
    s.redraws.push({ at: new Date().toISOString(), slot, reason });
  });
  printSheet(sheet, { header: `Direction sheet — ${sheet.direction.name} (redrawn)` });
  process.exit(0);
}

if (args.photos) {
  const d = DIRECTION_BY_ID[args.photos];
  if (!d) {
    console.log(`No direction "${args.photos}". Options: ${DIRECTIONS.map((x) => x.id).join(', ')}`);
    process.exit(1);
  }
  console.log(`Reference photograph directions for "${d.name}":`);
  console.log((IMAGE_QUERIES_BY_DIRECTION[d.id] || []).map((q) => `  - ${q}`).join('\n'));
  console.log('\nSearch the open archives with: node ../scripts/assets.mjs "<query>" (from the skill folder).');
  process.exit(0);
}

if (args.alternatives) {
  const role = args.alternatives;
  const name = SECTION_BLUEPRINT_NAME(role);
  console.log(`Blueprint alternatives for "${role}":`);
  for (const [key, bp] of Object.entries(SECTIONS)) {
    const fits = bp.role === role
      || (['showcase', 'work', 'gallery'].includes(role) && bp.role === 'gallery');
    if (fits) console.log(`  ${key.padEnd(20)} ${bp.name} — ${bp.build}`);
  }
  console.log(`\nDefault for ${role}: ${name}`);
  process.exit(0);
}

const sectorId = args.sector;
if (!sectorId || !SECTOR_BY_ID[sectorId]) {
  console.log(`Unknown or missing --sector. Sectors:\n${SECTORS.map((s) => `  ${s.id.padEnd(24)} ${s.name}`).join('\n')}`);
  process.exit(1);
}
const brief = args.brief || '';
const sections = (args.sections || '').split(',').map((s) => s.trim()).filter(Boolean);
const roles = SECTION_ROLES.map((r) => r.role);
for (const s of sections) {
  if (!roles.includes(s)) {
    console.log(`Unknown section role "${s}". Roles: ${roles.join(', ')}`);
    process.exit(1);
  }
}
const tone = args.tone && TONES.includes(args.tone) ? args.tone : null;
if (args.tone && !tone) {
  console.log(`Unknown tone "${args.tone}". Tones: ${TONES.join(', ')}`);
  process.exit(1);
}
const have = args.have ? args.have.split(',').map((h) => h.trim()).filter(Boolean) : [];
for (const h of have) {
  if (!HAVE.includes(h)) {
    console.log(`Unknown --have "${h}". Values: ${HAVE.join(', ')}`);
    process.exit(1);
  }
}
const keep = args.keep ? args.keep.split(',').map((k) => k.trim()).filter((k) => ['palette', 'type'].includes(k)) : [];

const options = args.options ? Math.max(1, parseInt(args.options, 10) || 3) : 3;
const seed = args.seed !== undefined ? args.seed : `${sectorId}|${brief}|${sections.join(',')}`;

// --- deal -----------------------------------------------------------------

const rand = rng(seed);
const scored = DIRECTIONS.map((d) => {
  const sectorHit = d.sectors.includes(sectorId) ? 2 : 0;
  return { d, score: sectorHit + rand() };
}).sort((a, b) => b.score - a.score);

const dealt = pickN(rand, scored.map((s) => s.d), options);

const sheets = dealt.map((d) => buildSheet(d, { sections, tone, have, keep, seed }));

if (args.direction) {
  const chosen = sheets.find((s) => s.direction.id === args.direction);
  if (!chosen) {
    console.log(`Direction "${args.direction}" was not dealt. Dealt: ${sheets.map((s) => s.direction.id).join(', ')}`);
    process.exit(1);
  }
  saveAndPrint(chosen, sheets);
  process.exit(0);
}

console.log(`Dealt ${options} direction${options > 1 ? 's' : ''} for sector "${SECTOR_BY_ID[sectorId].name}"${brief ? ` — brief: "${brief}"` : ''}.\n`);
sheets.forEach((s, i) => {
  console.log(`${i + 1}. ${s.direction.name} (${s.direction.id})`);
  console.log(`   ${s.direction.thesis}`);
  console.log(`   ${s.direction.suits}`);
  console.log(`   hero: ${s.hero.name} · type: ${s.typeSystem.name} · palette: ${s.palette.name} · motion: ${s.motion.name}`);
  console.log('');
});
console.log(`Choose one, then deal its full sheet:

  node draw.mjs --sector ${sectorId} --brief "${brief || '...'}" --sections ${sections.join(',')}${tone ? ` --tone ${tone}` : ''}${have.length ? ` --have ${have.join(',')}` : ''}${keep.length ? ` --keep ${keep.join(',')}` : ''} --direction <id>
`);

function buildSheet(d, { sections: sectionRoles, tone: t, have: h, keep: k, seed: sd }) {
  const r = rng(`${sd}|${d.id}|${k.join(',')}`);
  const photoPoor = !h.includes('photography') && !h.includes('product-photo');

  const typeSystem = k.includes('type')
    ? null
    : TYPE_SYSTEM_BY_ID[pick(r, d.types.filter((x) => TYPE_SYSTEM_BY_ID[x]))];
  const palette = k.includes('palette')
    ? null
    : PALETTE_BY_ID[pick(r, d.palettes.filter((x) => PALETTE_BY_ID[x]))];
  const hero = HERO_BY_ID[pick(r, d.heroes.filter((x) => HERO_BY_ID[x]))];
  const motion = MOTION_BY_ID[d.motion] ? MOTION_BY_ID[d.motion] : MOTION_BY_ID['rise-stagger'];

  const blueprints = {};
  for (const role of sectionRoles) {
    const bpId = d.sections[role] || 'margin-note';
    blueprints[role] = SECTIONS[bpId] || SECTIONS['margin-note'];
  }

  return {
    dealt: new Date().toISOString(),
    seed: sd,
    sector: SECTOR_BY_ID[sectorId],
    brief,
    tone: t || null,
    have: h,
    direction: {
      id: d.id,
      name: d.name,
      thesis: d.thesis,
      idea: d.idea,
      composition: d.composition,
      suits: d.suits,
      avoids: d.avoids,
      imageQueries: IMAGE_QUERIES_BY_DIRECTION[d.id] || [],
    },
    hero,
    typeSystem,
    palette,
    motion,
    blueprints,
    photos: {
      own: h.includes('photography'),
      productPhoto: h.includes('product-photo'),
      note: photoPoor
        ? 'No project photography on hand: find real pictures of the subject\'s world in the open archives (scripts/assets.mjs) or draw in code from the subject itself. The dealt photographs below are only a guide.'
        : 'Use the project\'s own photographs first; found pictures of its world second.',
      queries: IMAGE_QUERIES_BY_DIRECTION[d.id] || [],
    },
    warnings: buildWarnings(d, hero, palette, t),
  };
}

function buildWarnings(d, hero, palette, t) {
  const w = [];
  if (d.sectors.includes(sectorId) === false) w.push(`"${d.name}" is not a natural fit for ${SECTOR_BY_ID[sectorId].name}; it was dealt because the library has no better entry for this sector. Consider the sector that matches.`);
  if (t && /luxury|playful/.test(t) && /archive|ledger|blueprint|manifesto/.test(d.id)) w.push(`Tone "${t}" fights this direction's nature.`);
  return w;
}

function saveAndPrint(sheet, all) {
  updateState((s) => {
    s.direction = sheet;
    s.libraryVersion = LIBRARY_VERSION;
    s.dealt = all.map((x) => ({ id: x.direction.id, name: x.direction.name }));
  });
  printSheet(sheet, { header: `Direction sheet — ${sheet.direction.name}` });
}

function printSheet(sheet, { header }) {
  const d = sheet.direction;
  const rule = '─'.repeat(72);
  console.log(rule);
  console.log(`${header}`);
  console.log(`  dealt ${sheet.dealt} · seed ${sheet.seed}`);
  console.log(rule);
  console.log('');
  console.log(`${d.name}  [${d.id}]`);
  console.log('');
  console.log(`  ${d.thesis}`);
  console.log('');
  console.log('  The idea');
  for (const line of wrap(d.idea, 70)) console.log(`    ${line}`);
  console.log('');
  console.log('  Composition');
  for (const c of d.composition) for (const line of wrap(c, 70)) console.log(`    ${line}`);
  console.log('');
  console.log(`  Suits: ${d.suits}`);
  console.log(`  Avoids: ${d.avoids}`);
  console.log('');

  if (sheet.palette) {
    const p = sheet.palette;
    console.log(`  Palette — ${p.name} [${p.id}]`);
    console.log(`    ${p.note}`);
    console.log(`    ground ${p.ground} · ink ${p.ink} · accent ${p.accent}`);
  } else {
    console.log('  Palette — kept from the brand (--keep palette). Map the brand colours onto: ground, ink, accent, field.');
  }
  console.log('');

  if (sheet.typeSystem) {
    const t = sheet.typeSystem;
    console.log(`  Type — ${t.name} [${t.id}]`);
    console.log(`    ${t.note}`);
    console.log(`    display: ${t.display.family} (${t.display.weight}) · text: ${t.text.family}`);
    const fonts = [t.display.loading, t.text.loading, t.mono && t.mono.loading].filter(Boolean);
    if (fonts.length) console.log(`    load: ${fonts.join('  +  ')}`);
  } else {
    console.log('  Type — kept from the brand (--keep type). Map the brand faces onto: display, text.');
  }
  console.log('');

  const h = sheet.hero;
  console.log(`  Hero — ${h.name} [${h.id}]`);
  for (const b of h.build) console.log(`    ${b}`);
  console.log(`    image: ${h.image}`);
  console.log('');

  console.log('  Sections');
  for (const [role, bp] of Object.entries(sheet.blueprints)) {
    console.log(`    ${role.padEnd(18)} ${bp.name.padEnd(22)} ${bp.build}`);
  }
  console.log('');

  const m = sheet.motion;
  console.log(`  Motion — ${m.name} [${m.id}]`);
  console.log(`    ${m.recipe}`);
  console.log('');

  console.log('  Pictures');
  console.log(`    ${sheet.photos.note}`);
  if (sheet.photos.queries.length) {
    console.log('    try these searches (assets.mjs):');
    for (const q of sheet.photos.queries) console.log(`      "${q}"`);
  }
  console.log('');
  console.log(`  Sheet stored. Reprint any time with: node scripts/draw.mjs --show`);
  console.log(rule);
  console.log('');
  console.log('  Next: read the sheet against the brief, write the idea sentence,');
  console.log('  then build still. Redraw a slot only for a stated reason:');
  console.log('    --redraw hero|type|palette   ·   --redraw section:<role>=<alt>');
  console.log('');
}

function SECTION_BLUEPRINT_NAME(role) {
  const d = DIRECTIONS.flatMap((x) => Object.entries(x.sections).map(([r, b]) => ({ r, b }))).find((x) => x.r === role);
  return d ? d.b : 'margin-note';
}

function wrap(text, n) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > n) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur += ' ' + w;
    }
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}
