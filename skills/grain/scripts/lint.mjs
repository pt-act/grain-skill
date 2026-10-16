#!/usr/bin/env node
// lint.mjs — scan source for the banned devices of the house style.
//   node lint.mjs <file or folder> [more files or folders]
// Exit 1 if any FAIL is found. WARNs are wrong until defended in one sentence.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RULES = [
  {
    id: 'gradient',
    level: 'FAIL',
    re: /(?:linear|radial|conic|repeating)-gradient\s*\(/i,
    msg: 'No gradients — flat colour or a real photograph.',
  },
  {
    id: 'shadow',
    level: 'FAIL',
    re: /(?:box-shadow|text-shadow|filter\s*:\s*drop-shadow)\s*[:(]/i,
    msg: 'No shadows on things at rest — a tone step between surfaces.',
  },
  {
    id: 'glass',
    level: 'FAIL',
    re: /backdrop-filter\s*:\s*(?!none)/i,
    msg: 'No glass — no backdrop blur panels, no floating pill nav.',
  },
  {
    id: 'blur',
    level: 'WARN',
    re: /filter\s*:\s*blur|blur\s*\(/i,
    msg: 'Blur outside a real scrim or photograph treatment.',
  },
  {
    id: 'emoji',
    level: 'FAIL',
    re: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u,
    msg: 'No emoji.',
  },
  {
    id: 'mono',
    level: 'FAIL',
    re: /font-family\s*:(?!.*\bvar\()[^;}"']*\b(?:ui-monospace|consolas|menlo|sfmono|courier|monospace)\b/i,
    msg: 'No monospace outside real code blocks.',
  },
  {
    id: 'caps',
    level: 'FAIL',
    re: /text-transform\s*:\s*uppercase[^}]*letter-spacing|letter-spacing[^}]*text-transform\s*:\s*uppercase/i,
    msg: 'No tiny uppercase letter-spaced labels — sentence case at a readable size.',
  },
  {
    id: 'index-number',
    level: 'FAIL',
    re: /<(h[1-6])[^>]*>\s*(?:\(?\d{1,3}\)?[\.\):]|Step\s+\d|Part\s+\d)/i,
    msg: 'No index numbering — order by position, size or words.',
  },
  {
    id: 'hairline',
    level: 'WARN',
    re: /border(?:-[a-z]+)?\s*:\s*(?:0?\.\d|1)px\s+solid/i,
    msg: 'Hairline rule — use space, a tone step, a change of scale.',
  },
  {
    id: 'soft-radius',
    level: 'WARN',
    re: /border-radius\s*:\s*(9|1[0-6])px/i,
    msg: 'The 9–16px “soft” radius reads as generic — square or fully round.',
  },
  {
    id: 'placeholder',
    level: 'FAIL',
    re: /lorem ipsum|coming soon|to be announced|\bTB[A-D]\b/i,
    msg: 'Placeholder copy — write the real content.',
  },
  {
    id: 'todo',
    level: 'WARN',
    re: /\bTODO\b|\bFIXME\b|\bplaceholder image\b/i,
    msg: 'Unfinished marker.',
  },
];

const SKIP_DIRS = new Set(['node_modules', '.git', '.grain', 'assets', 'dist', 'build', '.next', 'web']);

function collectFiles(target, out = []) {
  const st = statSync(target);
  if (st.isDirectory()) {
    for (const name of readdirSync(target)) {
      if (SKIP_DIRS.has(name)) continue;
      collectFiles(join(target, name), out);
    }
  } else {
    out.push(target);
  }
  return out;
}

const targets = process.argv.slice(2);
if (!targets.length) {
  console.log('lint.mjs — scan source for the banned devices.\n  node lint.mjs <file or folder> [more…]');
  process.exit(1);
}

const files = [];
for (const t of targets) collectFiles(t, files);

let fails = 0;
let warns = 0;
const byFile = new Map();

for (const file of files) {
  const ext = extname(file).toLowerCase();
  if (!['.html', '.htm', '.css', '.scss', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro', '.md', '.json'].includes(ext)) continue;
  let src;
  try { src = readFileSync(file, 'utf8'); } catch { continue; }
  const lines = src.split('\n');
  for (const rule of RULES) {
    lines.forEach((line, i) => {
      if (rule.re.test(line)) {
        const finding = { file, line: i + 1, ...rule, text: line.trim().slice(0, 100) };
        if (!byFile.has(file)) byFile.set(file, []);
        byFile.get(file).push(finding);
        if (rule.level === 'FAIL') fails++; else warns++;
      }
    });
  }
  // images without alt (html only)
  if (ext === '.html' || ext === '.htm' || ext === '.astro' || ext === '.vue' || ext === '.svelte') {
    const imgRe = /<img\b[^>]*>/gi;
    let m;
    while ((m = imgRe.exec(src))) {
      const idx = m.index;
      const line = src.slice(0, idx).split('\n').length;
      if (!/\balt\s*=/.test(m[0])) {
        if (!byFile.has(file)) byFile.set(file, []);
        byFile.get(file).push({ file, line, id: 'no-alt', level: 'WARN', msg: 'Image without alt text.', text: m[0].slice(0, 100) });
        warns++;
      }
    }
  }
}

if (!fails && !warns) {
  console.log(`lint: clean — ${files.length} file${files.length === 1 ? '' : 's'} scanned, no banned devices found.`);
  process.exit(0);
}

for (const [file, findings] of byFile) {
  console.log(`\n${file}`);
  for (const f of findings) {
    console.log(`  ${f.level} ${String(f.line).padStart(4)}  ${f.id.padEnd(14)} ${f.msg}`);
    console.log(`         ${f.text}`);
  }
}
console.log(`\nlint: ${fails} FAIL, ${warns} WARN. Fix every FAIL; defend or fix every WARN.`);
process.exit(fails ? 1 : 0);
