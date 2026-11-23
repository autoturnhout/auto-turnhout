#!/usr/bin/env node
/* ==========================================================================
   Auto Turnhout: zoekertjes van 2dehands -> stock.json voor de website.

   Gebruik:  node sync/sync-stock.mjs              (instellingen uit sync/config.json)
             node sync/sync-stock.mjs --dry        (toont wat er zou veranderen, schrijft niets)
             node sync/sync-stock.mjs --source=sync/sample-feed.json --out=sync/test-stock.json

   Laat dit elke 15 minuten draaien (cron of taakplanner) op de server van de website.
   Bron: de officiële feed of API-toegang van 2dehands voor het account van Auto Turnhout
   (zie README). Het script leest JSON of XML; welk veld wat is, staat in config.json.
   ========================================================================== */
import { readFile, writeFile, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { toCar } from './normalize.mjs';
import { parseXml } from './xml.mjs';
import { createReader } from './source-2dehands.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const cfg = JSON.parse(await readFile(path.join(ROOT, 'sync/config.json'), 'utf8'));
const log = (...m) => console.log(new Date().toISOString(), ...m);

// "a.b.0.c" -> value
const pick = (obj, p) => !p ? obj : String(p).split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const env = s => String(s).replace(/\$\{(\w+)\}/g, (_, k) => process.env[k] || '');

async function loadSource() {
  const src = { ...cfg.source };
  if (args.source) { if (/^https?:/.test(args.source)) { src.type = 'url'; src.url = args.source; } else { src.type = 'file'; src.file = args.source; } }
  let body;
  if (src.type === 'url') {
    if (!src.url) throw new Error('Geen feed-URL ingesteld in sync/config.json (source.url).');
    const headers = Object.fromEntries(Object.entries(src.headers || {}).map(([k, v]) => [k, env(v)]).filter(([, v]) => v && !/^Bearer\s*$/.test(v)));
    const res = await fetch(env(src.url), { headers, signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`Feed gaf HTTP ${res.status}`);
    body = await res.text();
  } else {
    body = await readFile(path.resolve(ROOT, src.file), 'utf8');
  }
  const isXml = src.format === 'xml' || (src.format !== 'json' && body.trimStart().startsWith('<'));
  const data = isXml ? parseXml(body) : JSON.parse(body);
  let items = pick(data, src.itemsPath);
  if (items && !Array.isArray(items)) items = [items];
  if (!Array.isArray(items)) throw new Error(`Geen lijst met zoekertjes gevonden op "${src.itemsPath}".`);
  return items;
}

// Feed item -> generic listing with the names normalize.mjs expects
function toListing(item) {
  const out = {};
  for (const [key, p] of Object.entries(cfg.fields)) out[key] = pick(item, p);
  if (out.images && !Array.isArray(out.images)) out.images = typeof out.images === 'object' ? Object.values(out.images).flat() : [out.images];
  if (Array.isArray(out.images)) out.images = out.images.map(x => (x && typeof x === 'object') ? (x[cfg.imageUrlField || 'url'] ?? x['#text'] ?? Object.values(x)[0]) : x);
  return out;
}

const outPath = path.resolve(ROOT, args.out || cfg.out || 'stock.json');
const prev = existsSync(outPath) ? JSON.parse(await readFile(outPath, 'utf8')) : { cars: [] };
const prevById = new Map(prev.cars.map(c => [c.id, c]));
// Match an ad to its previous version by its own link, but only when that link is unique
const urlCount = prev.cars.reduce((m, c) => (c.url ? m.set(c.url, (m.get(c.url) || 0) + 1) : m), new Map());
const prevByUrl = new Map(prev.cars.filter(c => c.url && urlCount.get(c.url) === 1).map(c => [c.url, c]));
const overrides = existsSync(path.join(ROOT, 'sync/overrides.json')) ? JSON.parse(await readFile(path.join(ROOT, 'sync/overrides.json'), 'utf8')) : {};

try {
  // Source: his public 2dehands profile (default), or a feed file/URL with a field mapping
  const fromProfile = !args.source && cfg.source.type === '2dehands-profile';
  const items = fromProfile
    ? await createReader({ root: ROOT, profileUrl: cfg.source.profileUrl, delayMs: cfg.source.delayMs, maxPages: cfg.source.maxPages, refreshDays: cfg.source.refreshDays, log }).read()
    : await loadSource();
  const seen = new Set();
  const cars = [];
  for (const item of items) {
    const listing = fromProfile ? item : toListing(item);
    if (!listing.title) continue;
    const draft = toCar(listing, {});
    const before = prevById.get(draft.id) || (listing.url && prevByUrl.get(listing.url)) || null;
    const car = before ? toCar(listing, before) : draft;     // keeps id, first-seen date and a hidden price
    if (car.sold) continue;                                  // sold cars disappear from the site
    let id = car.id, n = 2;
    while (seen.has(id)) id = `${car.id}-${n++}`;            // two identical cars stay separate
    car.id = id; seen.add(id);
    Object.assign(car, overrides[car.id] || {});              // hand-made extras: featured, check values, body type...
    delete car.sold;
    for (const k of Object.keys(car)) if (car[k] === undefined) delete car[k];
    cars.push(car);
  }

  // Safety net: never empty the website because a feed was briefly broken
  const min = cfg.minCars ?? 1, drop = cfg.maxDropPercent ?? 60;
  if (cars.length < min) throw new Error(`Maar ${cars.length} wagens in de feed (minimum ${min}); stock.json blijft ongewijzigd.`);
  if (prev.cars.length && cars.length < prev.cars.length * (1 - drop / 100) && !args.force)
    throw new Error(`Van ${prev.cars.length} naar ${cars.length} wagens is een te grote daling; controleer de feed of draai met --force.`);

  const ids = new Set(cars.map(c => c.id));
  const added = cars.filter(c => !prevById.has(c.id)).map(c => c.id);
  const removed = prev.cars.filter(c => !ids.has(c.id)).map(c => c.id);
  const changed = cars.filter(c => { const p = prevById.get(c.id); return p && (p.price !== c.price || p.status !== c.status); }).map(c => c.id);
  log(`${cars.length} wagens · nieuw ${added.length} · weg ${removed.length} · prijs/status gewijzigd ${changed.length}`);
  added.forEach(id => log('  + ' + id)); removed.forEach(id => log('  - ' + id)); changed.forEach(id => log('  ~ ' + id));

  if (args.dry) log('Proefdraai: niets weggeschreven.');
  else {
    const tmp = outPath + '.tmp';
    await writeFile(tmp, JSON.stringify({ updated: new Date().toISOString(), source: '2dehands', count: cars.length, cars }, null, 1));
    await rename(tmp, outPath);
    log('Geschreven: ' + path.relative(ROOT, outPath));
    // One page per car (wagen/<id>/), sitemap.xml and robots.txt; not for a test file written elsewhere
    if (!args.out) {
      const { buildPages } = await import('./build-pages.mjs');
      buildPages({ root: ROOT, cars, siteUrl: cfg.siteUrl || '', log });
    }
  }
} catch (e) {
  log('FOUT: ' + e.message);
  process.exitCode = 1;
}
