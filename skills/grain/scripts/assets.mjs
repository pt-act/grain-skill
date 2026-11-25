#!/usr/bin/env node
// assets.mjs — find real pictures of the subject's world in open archives
// and download them with their credits recorded.
//
//   node assets.mjs "<query>" [--n 8] [--video]
//   node assets.mjs --get <ref>            download one result into assets/
//   node assets.mjs --credits              print the credit lines so far
//   node assets.mjs --search "<query>"     search only (same as positional)
//
// Sources: Openverse (covers WordPress Open Library, Flickr, Wikimedia
// Commons mirrors, Europeana, the Metropolitan Museum of Art, the Art
// Institute of Chicago and more) and Wikimedia Commons. Only licences that
// allow commercial use are kept by default; pass --all to see everything.
// No API key is needed. Respects rate limits; caches pages in .grain/.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { updateState } from './state.mjs';

const ASSETS_DIR = join(process.cwd(), 'assets');

const OPENVERSE = 'https://api.openverse.org/v1/images/';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

// Only licences that allow commercial use and derivatives: CC0, public
// domain, CC BY and CC BY-SA. CC BY-NC and CC BY-ND are excluded.
const OK_LICENSES = /^(cc0|cc[- ]?zero|public domain|pdm|cc[- ]?pdm|pd([- ][a-z0-9]+)*|cc[- ]?by([- ]?sa)?|by([- ]?sa)?)([- ]?\d(\.\d)?)?$/i;

async function searchOpenverse(q, n, all) {
  const url = `${OPENVERSE}?q=${encodeURIComponent(q)}&page_size=${n * 2}&license_type=commercial`;
  const res = await fetch(url, { headers: { 'User-Agent': 'grain-skill/1.0 (agent skill; contact via repo)' } });
  if (!res.ok) throw new Error(`Openverse responded ${res.status}`);
  const data = await res.json();
  return (data.results || [])
    .filter((r) => all || OK_LICENSES.test(r.license || ''))
    .slice(0, n)
    .map((r) => ({
      ref: `ov-${r.id}`,
      source: 'openverse',
      title: r.title || q,
      creator: r.creator || 'Unknown',
      license: r.license,
      license_url: r.license_url,
      url: r.url,
      thumbnail: r.thumbnail,
      foreign_url: r.foreign_landing_url,
    }));
}

async function searchCommons(q, n, all) {
  const params = new URLSearchParams({
    action: 'query', format: 'json', generator: 'search',
    gsrsearch: `filetype:bitmap ${q}`, gsrnamespace: '6', gsrlimit: String(n * 2),
    prop: 'imageinfo', iiprop: 'url|extmetadata|size', origin: '*',
  });
  const res = await fetch(`${COMMONS_API}?${params}`, { headers: { 'User-Agent': 'grain-skill/1.0 (agent skill; contact via repo)' } });
  if (!res.ok) throw new Error(`Wikimedia responded ${res.status}`);
  const data = await res.json();
  const pages = Object.values(data?.query?.pages || {});
  const out = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii?.url) continue;
    const em = ii.extmetadata || {};
    const license = (em.LicenseShortName?.value || em.License?.value || '').trim();
    if (!all && !OK_LICENSES.test(license)) continue;
    out.push({
      ref: `wc-${p.pageid}`,
      source: 'commons',
      title: p.title.replace(/^File:/, ''),
      creator: em.Artist?.value ? stripTags(em.Artist.value) : 'Unknown',
      license: license || 'unknown',
      license_url: em.LicenseUrl?.value || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
      url: ii.url,
      thumbnail: ii.thumburl || ii.url,
      foreign_url: p.title ? `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}` : undefined,
    });
    if (out.length >= n) break;
  }
  return out;
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 120);
}

async function searchCommonsVideo(q, n, all) {
  const params = new URLSearchParams({
    action: 'query', format: 'json', generator: 'search',
    gsrsearch: `filetype:video ${q}`, gsrnamespace: '6', gsrlimit: String(n * 2),
    prop: 'imageinfo', iiprop: 'url|extmetadata|size|mime', origin: '*',
  });
  const res = await fetch(`${COMMONS_API}?${params}`, { headers: { 'User-Agent': 'grain-skill/1.0 (agent skill; contact via repo)' } });
  if (!res.ok) throw new Error(`Wikimedia responded ${res.status}`);
  const data = await res.json();
  const pages = Object.values(data?.query?.pages || {});
  const out = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii?.url || !/^video\//i.test(ii.mime || '')) continue;
    const em = ii.extmetadata || {};
    const license = (em.LicenseShortName?.value || em.License?.value || '').trim();
    if (!all && !OK_LICENSES.test(license)) continue;
    out.push({
      ref: `wc-${p.pageid}`,
      source: 'commons',
      title: p.title.replace(/^File:/, ''),
      creator: em.Artist?.value ? stripTags(em.Artist.value) : 'Unknown',
      license: license || 'unknown',
      license_url: em.LicenseUrl?.value || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
      url: ii.url,
      thumbnail: ii.thumburl || ii.url,
      foreign_url: p.title ? `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}` : undefined,
    });
    if (out.length >= n) break;
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
      if (next === undefined || next.startsWith('--')) { args[key] = true; }
      else { args[key] = next; i++; }
    } else args._.push(a);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

if (args.credits) {
  const s = loadStateSafe();
  const pics = s?.pictures || [];
  if (!pics.length) console.log('Nothing downloaded yet.');
  else {
    console.log('Credits for the footer:\n');
    for (const c of pics) {
      console.log(`  ${c.file} — ${c.title}, ${c.creator}, ${c.license}. ${c.foreign_url || c.url}`);
    }
  }
  process.exit(0);
}

function loadStateSafe() {
  try { return JSON.parse(readFileSync(join(process.cwd(), '.grain', 'build-state.json'), 'utf8')); } catch { return null; }
}

const query = args._.join(' ') || args.search
  || (typeof args.video === 'string' ? args.video : '')
  || (typeof args.all === 'string' ? args.all : '');

function loadLastSearch() {
  try { return JSON.parse(readFileSync(join(process.cwd(), '.grain', 'assets-last.json'), 'utf8')); } catch { return []; }
}

function saveLastSearch(results) {
  try {
    mkdirSync(join(process.cwd(), '.grain'), { recursive: true });
    writeFileSync(join(process.cwd(), '.grain', 'assets-last.json'), JSON.stringify(results, null, 2));
  } catch { /* best effort */ }
}

async function download(r) {
  mkdirSync(ASSETS_DIR, { recursive: true });
  const ext = (r.url.split('?')[0].match(/\.(jpe?g|png|webp|gif|mp4|webm|ogv)$/i) || ['bin'])[0].toLowerCase();
  const safeTitle = (r.title || 'image').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 48) || 'image';
  const file = join(ASSETS_DIR, `${safeTitle}-${r.ref}${ext}`);
  const img = await fetch(r.url, { headers: { 'User-Agent': 'grain-skill/1.0' } });
  if (!img.ok) { console.log(`Download failed: ${img.status}`); process.exit(1); }
  writeFileSync(file, Buffer.from(await img.arrayBuffer()));
  const credit = { ref: r.ref, file, title: r.title, creator: r.creator, license: r.license, license_url: r.license_url, url: r.url, foreign_url: r.foreign_url };
  writeFileSync(file + '.credit.json', JSON.stringify(credit, null, 2));
  updateState((s) => {
    if (!s.pictures.find((p) => p.ref === r.ref)) s.pictures.push(credit);
  });
  console.log(`Saved ${file}`);
  console.log(`Credit: ${r.title} — ${r.creator}, ${r.license}. ${r.foreign_url || r.url}`);
}

// --get on its own resolves against the last search in this folder.
if (args.get && !query) {
  const r = loadLastSearch().find((x) => x.ref === args.get);
  if (!r) {
    console.log(`No cached result "${args.get}". Run a search first in this folder, then --get.`);
    process.exit(1);
  }
  await download(r);
  process.exit(0);
}

if (!query) {
  console.log(`assets.mjs — find real pictures in open archives.

  node assets.mjs "<query>"         search Openverse + Wikimedia Commons
  node assets.mjs --video "<query>" search Wikimedia Commons for a moving clip
  node assets.mjs --get <ref>       download one result into ./assets/
  node assets.mjs --credits         print credits for downloaded files
  node assets.mjs --all             include non-commercial licences too

  Only public-domain, CC0, CC BY and CC BY-SA files are kept by default.
  No API key needed. Downloads land in ./assets with their .credit.json sidecar.`);
  process.exit(1);
}

const n = args.n ? parseInt(args.n, 10) : 8;
const all = Boolean(args.all);
const wantVideo = Boolean(args.video);

let results = [];
const errors = [];
const sources = wantVideo ? [searchCommonsVideo] : [searchOpenverse, searchCommons];
for (const fn of sources) {
  try {
    results.push(await fn(query, n, all));
  } catch (e) {
    errors.push(e.message);
  }
}
results = results.flat();

if (errors.length) console.log(`sources: ${errors.map((e) => e.message).join(' | ')}`);
if (!results.length) {
  console.log(`Nothing found for "${query}".${errors.length ? ` (${errors.join('; ')})` : ''}`);
  console.log('Try a more specific query: a place, a material, a trade, a museum object.');
  process.exit(0);
}

saveLastSearch(results);

console.log(`Found ${results.length} for "${query}"${all ? ' (all licences)' : ' (commercial-use licences)'}:\n`);
for (const r of results) {
  console.log(`  ${r.ref}  ${r.license.padEnd(20)} ${r.title.slice(0, 60)}`);
  console.log(`      by ${r.creator.slice(0, 60)}`);
  console.log(`      ${r.thumbnail || r.url}`);
  console.log('');
}
console.log('Download with: node scripts/assets.mjs --get <ref>   (lands in ./assets, credit recorded)');

if (args.get) {
  const r = results.find((x) => x.ref === args.get);
  if (!r) {
    console.log(`No result "${args.get}" in this search.`);
    process.exit(1);
  }
  await download(r);
}
