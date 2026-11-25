#!/usr/bin/env node
// tokens.mjs — emit the :root tokens and font links from the dealt sheet.
// Paste them into the page; do not hand-copy hexes from the sheet.
//
//   node tokens.mjs [--css] [--html]
//
// Reads .grain/build-state.json (the current direction). With --css prints a
// ready :root { } block; with --html prints the <link> tags; default prints
// both, labelled.

import { loadState } from './state.mjs';
import { LIBRARY_VERSION } from '../library/version.js';

const args = process.argv.slice(2);
const wantCss = args.includes('--css') || !args.includes('--html');
const wantHtml = args.includes('--html') || !args.includes('--css');

const state = loadState();
const d = state?.direction;
if (!d || !d.direction) {
  console.log('No direction dealt yet. Run: node scripts/draw.mjs --sector <id> --brief "…" --sections <roles> --direction <id>');
  process.exit(1);
}
const dir = d.direction;

const hex = (c) => (c ? c : '/* map the brand colour here */');

if (wantCss) {
  console.log('/* tokens — grain ' + (state.libraryVersion || LIBRARY_VERSION) + ' — from the dealt sheet: ' + dir.name + ' [' + dir.id + '] */');
  console.log(':root {');
  if (d.palette) {
    const p = d.palette;
    console.log(`  --ground: ${p.ground};`);
    console.log(`  --ground-deep: ${p.groundDeep};`);
    console.log(`  --ink: ${p.ink};`);
    console.log(`  --ink-soft: ${p.inkSoft};`);
    console.log(`  --accent: ${p.accent};`);
    console.log(`  --field: ${p.field};`);
    console.log(`  --on-accent: ${p.textOnAccent};`);
  } else {
    console.log('  /* the palette was kept from the brand — map these five onto the brand colours */');
    console.log('  --ground:      ' + hex() + ';');
    console.log('  --ground-deep: ' + hex() + ';');
    console.log('  --ink:         ' + hex() + ';');
    console.log('  --ink-soft:    ' + hex() + ';');
    console.log('  --accent:      ' + hex() + ';');
    console.log('  --field:       ' + hex() + ';');
    console.log('  --on-accent:   ' + hex() + ';');
  }
  if (d.typeSystem) {
    const t = d.typeSystem;
    console.log(`  --font-display: '${t.display.family}', Georgia, serif;`);
    console.log(`  --font-text: '${t.text.family}', system-ui, sans-serif;`);
  } else {
    console.log('  /* the type system was kept from the brand */');
    console.log(`  --font-display: '/* brand display face */', Georgia, serif;`);
    console.log(`  --font-text: '/* brand text face */', system-ui, sans-serif;`);
  }
  console.log('}');
}

if (wantHtml) {
  console.log('\n<!-- fonts — from the dealt sheet -->');
  if (d.typeSystem) {
    const urls = [d.typeSystem.display.loading, d.typeSystem.text.loading, d.typeSystem.mono?.loading].filter(Boolean);
    for (const u of urls) console.log(`<link rel="stylesheet" href="${u}">`);
    if (d.typeSystem.display.weight) {
      console.log(`<!-- display weights ${d.typeSystem.display.weight}, text weights ${d.typeSystem.text.weight} -->`);
    }
  } else {
    console.log('<!-- brand fonts: load the faces the brand fixes, same pattern -->');
  }
}

console.log('\nReprint any time with: node scripts/tokens.mjs');
