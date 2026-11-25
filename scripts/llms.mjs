#!/usr/bin/env node
// llms.mjs — generate or check llms.txt from the skill frontmatter and the
// script headers. Run `node scripts/llms.mjs` to write it; `--check` exits 1
// when the committed file has drifted (CI runs this).

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = join(ROOT, 'skills');
const SCRIPTS_DIR = join(SKILLS_DIR, 'grain', 'scripts');
const OUT = join(ROOT, 'llms.txt');

function frontmatter(file) {
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    fm[kv[1]] = v;
  }
  return fm;
}

function oneLine(s) {
  return s.replace(/\s+/g, ' ').trim();
}

function skills() {
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(SKILLS_DIR, d.name, 'SKILL.md')))
    .map((d) => {
      const fm = frontmatter(join(SKILLS_DIR, d.name, 'SKILL.md'));
      return { dir: d.name, name: fm.name || d.name, description: fm.description || '' };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function scripts() {
  return readdirSync(SCRIPTS_DIR)
    .filter((f) => f.endsWith('.mjs'))
    .sort()
    .map((f) => {
      const text = readFileSync(join(SCRIPTS_DIR, f), 'utf8');
      const m = text.match(/^\/\/\s*([\w.-]+)\s+—\s+(.+)$/m);
      return { file: f, purpose: m ? m[2].trim() : '' };
    });
}

function build() {
  const lines = [];
  lines.push('# Grain Skill');
  lines.push('');
  lines.push('> Agent skills that give coding agents an art direction and a real-browser gate.');
  lines.push('');
  lines.push('Install: `npx skills add https://github.com/pt-act/grain-skill`');
  lines.push('');
  lines.push('## Skills');
  lines.push('');
  for (const s of skills()) {
    lines.push(`- [${s.name}](skills/${s.dir}/SKILL.md): ${oneLine(s.description)}`);
  }
  lines.push('');
  lines.push('## Scripts');
  lines.push('');
  for (const s of scripts()) {
    lines.push(`- [${s.file}](skills/grain/scripts/${s.file}): ${oneLine(s.purpose)}`);
  }
  lines.push('');
  lines.push('## Examples');
  lines.push('');
  lines.push('- [wine-bar](examples/wine-bar/index.html): a wine bar built with The Ledger direction.');
  lines.push('- [mountain-hut](examples/mountain-hut/index.html): a mountain refuge built with The Atlas direction.');
  lines.push('- [studio](examples/studio/index.html): a ceramics studio built with The Blueprint direction.');
  lines.push('');
  lines.push('## Repo');
  lines.push('');
  lines.push('- [README.md](README.md): install, the run, the house rules.');
  lines.push('- [CHANGELOG.md](CHANGELOG.md): releases.');
  lines.push('- [scripts/llms.mjs](scripts/llms.mjs): regenerates this file (`--check` for CI).');
  lines.push('');
  return lines.join('\n');
}

const text = build();
if (process.argv.includes('--check')) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (current !== text) {
    console.error('llms.txt is out of date. Run: node scripts/llms.mjs');
    process.exit(1);
  }
  console.log('llms.txt is up to date.');
} else {
  writeFileSync(OUT, text);
  console.log(`wrote ${OUT}`);
}
