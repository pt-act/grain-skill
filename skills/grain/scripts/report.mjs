#!/usr/bin/env node
// report.mjs — the step-10 report, drafted from the build state.
// The agent records what only it knows (idea, live thing, sections built,
// sample content), then prints the draft; edit, don't rewrite.
//
//   node report.mjs                          print the draft report
//   node report.mjs --idea "sentence"        record the idea sentence
//   node report.mjs --live "thing"           record the live thing
//   node report.mjs --section <role>         mark a section as built
//   node report.mjs --score <n/10> [--held-back "…"]
//   node report.mjs --sample "thing to confirm"

import { updateState, loadState } from './state.mjs';

const args = process.argv.slice(2);
const state = loadState();

if (!state) {
  console.log('No build state. Run the pipeline first: preflight → draw → …');
  process.exit(1);
}

const heldBackIdx = args.indexOf('--held-back');
const heldBack = heldBackIdx >= 0 ? args[heldBackIdx + 1] : null;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  const next = () => args[++i];
  if (a === '--idea') updateState((s) => { s.idea = next(); });
  else if (a === '--live') updateState((s) => { s.liveThing = next(); });
  else if (a === '--section') updateState((s) => { const r = next(); if (!s.sectionsBuilt.includes(r)) s.sectionsBuilt.push(r); });
  else if (a === '--score') updateState((s) => { s.critique = { score: next(), heldBack }; });
  else if (a === '--sample') updateState((s) => { s.sampleContent.push(next()); });
}

const s = loadState();
const line = '─'.repeat(72);

console.log(line);
console.log('GRAIN REPORT (draft — edit this, then give it to the user)');
console.log(line);

console.log('\nDirection');
if (s.direction?.direction) {
  console.log(`  ${s.direction.direction.name} [${s.direction.direction.id}], dealt ${s.direction.dealt || s.createdAt}`);
  if (s.redraws.length) {
    for (const r of s.redraws) console.log(`  redrew ${r.slot}: ${r.reason || '(no reason recorded — state one before launch)'}`);
  }
} else {
  console.log('  none dealt');
}

console.log('\nIdea and live thing');
console.log(`  idea:      ${s.idea ? s.idea : '(not recorded — node report.mjs --idea "sentence")'}`);
console.log(`  live thing: ${s.liveThing ? s.liveThing : '(not recorded — node report.mjs --live "thing")'}`);

console.log('\nPictures');
if (s.pictures.length) {
  for (const p of s.pictures) console.log(`  ${p.file} — ${p.title}, ${p.creator}, ${p.license}. ${p.foreign_url || p.url}`);
  console.log(`  ${s.pictures.length} found pictures, credited in the footer.`);
} else {
  console.log('  none found — the floor is four real pictures; draw them or say in the open collections could not be searched');
}

console.log('\nGate');
const last = s.gates[s.gates.length - 1];
if (!s.gates.length) {
  console.log('  never run — node scripts/lint.mjs and node scripts/inspect.mjs');
} else if (last.skipped) {
  console.log(`  skipped: ${last.reason}`);
} else {
  console.log(`  last run ${last.ok ? 'PASS' : 'FAIL'} — ${last.fails} FAIL, ${last.warns} WARN${last.at ? ' at ' + last.at : ''}`);
  for (const f of (last.failDetails || [])) console.log(`    ${f}`);
}

console.log('\nLook');
if (s.critique) {
  console.log(`  ${s.critique.score}${s.critique.heldBack ? ' — held back by: ' + s.critique.heldBack : ''}`);
} else {
  console.log('  no critique recorded — node report.mjs --score <n/10> [--held-back "…"]');
}

console.log('\nSections built');
console.log(s.sectionsBuilt.length ? '  ' + s.sectionsBuilt.join(', ') : '  (none recorded — node report.mjs --section <role>)');

console.log('\nBefore launch');
console.log('  sample content to confirm: ' + (s.sampleContent.length ? s.sampleContent.join('; ') : '(none recorded — node report.mjs --sample "…")'));
console.log('  replace found pictures and drawings with the client\'s own when they have them');
console.log('  wire any #checkout or mailto the client has not given a real destination for');

console.log(line);
