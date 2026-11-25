// state.mjs — the build state store.
// Every script that produces durable output records it here (direction,
// pictures, gates); report.mjs and doctor.mjs read it. Writes are atomic;
// corrupt files are archived, not fatal.

import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const STATE_DIR = join(process.cwd(), '.grain');
const STATE_FILE = join(STATE_DIR, 'build-state.json');

export const STATE_VERSION = 1;

function freshState() {
  return {
    version: STATE_VERSION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    direction: null,
    dealt: [],
    redraws: [],
    pictures: [],
    gates: [],
    critique: null,
    idea: null,
    liveThing: null,
    sectionsBuilt: [],
    sampleContent: [],
  };
}

export function loadState() {
  if (!existsSync(STATE_FILE)) return null;
  try {
    const s = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
    if (!s || typeof s !== 'object' || s.version !== STATE_VERSION) return null;
    return s;
  } catch {
    // archive the corrupt file instead of failing the build
    try {
      mkdirSync(STATE_DIR, { recursive: true });
      renameSync(STATE_FILE, STATE_FILE + '.corrupt-' + Date.now());
    } catch { /* best effort */ }
    return null;
  }
}

export function saveState(state) {
  mkdirSync(STATE_DIR, { recursive: true });
  state.updatedAt = new Date().toISOString();
  writeFileSync(STATE_FILE + '.tmp', JSON.stringify(state, null, 2));
  renameSync(STATE_FILE + '.tmp', STATE_FILE);
}

export function updateState(mutator) {
  const s = loadState() || freshState();
  mutator(s);
  saveState(s);
  return s;
}
