// Reads the public 2dehands profile of Auto Turnhout and his public ad pages.
// Only pages that robots.txt allows (/u/<naam>/<id>/, /u/<naam>/<id>/p/<n>/ and /v/... ad pages);
// never their internal APIs. Slow and polite: a pause between requests, an honest name,
// and ad pages are only fetched again when the ad changed (cache in sync/cache/).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const UA = 'AutoTurnhout-website-sync/1.0 (eigen zoekertjes naar eigen website)';
const MONTHS = { jan: 1, feb: 2, mrt: 3, apr: 4, mei: 5, jun: 6, jul: 7, aug: 8, sep: 9, okt: 10, nov: 11, dec: 12 };
const BODY = { monovolume: 'MPV', 'suv of terreinwagen': 'SUV', suv: 'SUV', terreinwagen: 'SUV', stationwagon: 'Break', break: 'Break',
  cabriolet: 'Cabrio', cabrio: 'Cabrio', 'coupé': 'Coupé', coupe: 'Coupé', sedan: 'Sedan', berline: 'Hatchback', hatchback: 'Hatchback',
  bestelwagen: 'Bestelwagen', 'lichte vracht': 'Bestelwagen', pick: 'Pick-up' };
const OPTION_NAMES = { parkeersensors: 'Parkeersensoren', carplay: 'Apple CarPlay', 'apple carplay': 'Apple CarPlay', 'android auto': 'Android Auto',
  navigatie: 'Navigatie', navi: 'Navigatie', airco: 'Airco', 'cruise control': 'Cruise control', 'start/stop': 'Start-stopsysteem',
  trekhaak: 'Trekhaak', pano: 'Panoramisch dak', panoramadak: 'Panoramisch dak', leder: 'Leder interieur', camera: 'Achteruitrijcamera',
  achteruitrijcamera: 'Achteruitrijcamera', bluetooth: 'Bluetooth', 'elektrische ramen': 'Elektrische ramen', stoelverwarming: 'Stoelverwarming' };
// Paragraphs he repeats in every ad; the website already says these things itself
const BOILERPLATE = /grootste occasion dealer|niet aansprakelijk|inname van uw auto|koffie voor u klaar|financiering mogelijk|bel of whatsapp/i;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const decode = s => s.replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos|nbsp|euro);/gi, (m, e) => e[0] === '#' ? String.fromCodePoint(parseInt(e.slice(e[1] === 'x' ? 2 : 1), e[1] === 'x' ? 16 : 10))
  : { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', euro: '€' }[e.toLowerCase()] ?? m);
const htmlToText = h => decode(h.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h\d)>/gi, '\n\n').replace(/<[^>]+>/g, '')).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

function relDate(txt, today = new Date()) {
  const t = String(txt || '').toLowerCase().trim();
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (t === 'vandaag') return iso(d);
  if (t === 'gisteren') { d.setDate(d.getDate() - 1); return iso(d); }
  if (t === 'eergisteren') { d.setDate(d.getDate() - 2); return iso(d); }
  const m = t.match(/^(\d{1,2})\s+([a-z]{3})\.?\s+'?(\d{2,4})$/);
  if (m && MONTHS[m[2]]) return `${m[3].length === 2 ? '20' + m[3] : m[3]}-${String(MONTHS[m[2]]).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return null;
}
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function createReader({ root, profileUrl, delayMs = 2500, maxPages = 6, refreshDays = 7, log = console.log }) {
  const cacheDir = path.join(root, 'sync/cache');
  let last = 0;
  async function get(url) {
    const wait = last + delayMs - Date.now(); if (wait > 0) await sleep(wait);
    last = Date.now();
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'nl-BE,nl;q=0.9' }, signal: AbortSignal.timeout(30000), redirect: 'follow' });
    if (res.status === 404 || res.status === 410) return null;
    if (!res.ok) throw new Error(`${url} gaf HTTP ${res.status}`);
    return res.text();
  }
  const nextData = html => { const m = html.match(/<script[^>]*\bid="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/); return m ? JSON.parse(m[1]) : null; };

  async function profileListings() {
    const base = profileUrl.replace(/\/?$/, '/');
    const out = [], ids = new Set();
    for (let page = 1; page <= maxPages; page++) {
      const html = await get(page === 1 ? base : `${base}p/${page}/`);
      const data = html && nextData(html);
      const sr = data && data.props && data.props.pageProps && data.props.pageProps.searchRequestAndResponse;
      if (!sr || !Array.isArray(sr.listings)) { if (page === 1) throw new Error('Profielpagina zonder zoekertjes (is de opbouw van 2dehands veranderd?)'); break; }
      for (const l of sr.listings) if (!ids.has(l.itemId)) { ids.add(l.itemId); out.push(l); }
      if (!sr.listings.length || out.length >= (sr.totalResultCount || 0)) break;
    }
    log(`2dehands: ${out.length} zoekertjes op het profiel`);
    return out;
  }

  async function adDetails(listing) {
    if (!existsSync(cacheDir)) await mkdir(cacheDir, { recursive: true });
    const file = path.join(cacheDir, `${listing.itemId}.json`);
    const sig = `${listing.title}|${listing.priceInfo && listing.priceInfo.priceCents}|${listing.reserved}`;
    if (existsSync(file)) {
      const c = JSON.parse(await readFile(file, 'utf8'));
      if (c.sig === sig && Date.now() - c.fetchedAt < refreshDays * 864e5) return c;
    }
    const url = new URL(listing.vipUrl, 'https://www.2dehands.be').href;
    const html = await get(url);
    if (!html) return null;                                            // ad removed
    let vehicle = null;
    for (const m of html.matchAll(/<script[^>]*\btype="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      try { const j = JSON.parse(m[1]); const v = [].concat(j).find(x => x && x['@type'] === 'Vehicle'); if (v) { vehicle = v; break; } } catch { /* other block */ }
    }
    const d = html.match(/<div class="Description-module-description[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    const c = { sig, fetchedAt: Date.now(), url, vehicle, description: d ? htmlToText(d[1]) : null };
    await writeFile(file, JSON.stringify(c));
    return c;
  }

  // One profile listing + its ad page -> generic listing for normalize.mjs
  function toListing(l, det) {
    const attr = k => { const a = [...(l.attributes || []), ...(l.extendedAttributes || [])].find(x => x.key === k); return a ? a.value : null; };
    const v = (det && det.vehicle) || {};
    const fullText = (det && det.description) || l.description || '';
    // Split his ad text: short single lines in a block are the options list, his standard paragraphs are dropped
    const paras = fullText.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    const options = [], keep = [];
    for (const p of paras) {
      const lines = p.split('\n').map(s => s.trim()).filter(Boolean);
      if (lines.length >= 2 && lines.every(s => s.split(/\s+/).length <= 4 && s.length <= 32)) {
        lines.filter(s => !/^enz\.?$/i.test(s)).forEach(s => options.push(OPTION_NAMES[s.toLowerCase()] || s[0].toUpperCase() + s.slice(1)));
      } else if (!BOILERPLATE.test(p)) keep.push(p);
    }
    const kw = v.vehicleEngine && v.vehicleEngine.enginePower && v.vehicleEngine.enginePower.unitCode === 'KWT' ? v.vehicleEngine.enginePower.value : null;
    const gearbox = v.vehicleTransmission ? (/automa/i.test(v.vehicleTransmission) ? 'Automaat' : 'Manueel') : '';
    const fuel = v.vehicleEngine && v.vehicleEngine.fuelType;
    const bodyRaw = String(v.bodyType || attr('body') || '').toLowerCase();
    const images = (v.image && v.image.length ? v.image : (l.pictures || []).map(p => p.extraExtraLargeUrl || p.largeUrl)).map(u => (u.startsWith('//') ? 'https:' + u : u));
    const reserved = l.reserved || /OutOfStock/i.test(v.offers && v.offers.availability || '');
    const price = l.priceInfo && l.priceInfo.priceCents ? l.priceInfo.priceCents / 100 : (v.offers && +v.offers.price) || null;
    return {
      id: l.itemId,
      title: l.title,
      description: keep.join('\n\n'),
      price,
      priceText: reserved ? 'Gereserveerd' : '',
      year: +(attr('constructionYear') || v.vehicleModelDate) || null,
      km: +(attr('mileage') || (v.mileageFromOdometer && v.mileageFromOdometer.value)) || null,
      fuel: fuel ? (/elektr/i.test(fuel) && !/hybr/i.test(fuel) ? 'Elektrisch' : /plug/i.test(fuel) ? 'Plug-in hybride' : /hybr/i.test(fuel) ? 'Hybride' : fuel) : '',
      gearbox,
      brand: v.brand && v.brand.name || '',
      model: v.model || '',
      body: BODY[bodyRaw] || (bodyRaw && bodyRaw.split(' ').map(w => BODY[w]).find(Boolean)) || '',
      color: v.color || attr('color') || '',
      hp: kw ? Math.round(kw * 1.35962) : null,
      images,
      url: det && det.url || new URL(l.vipUrl, 'https://www.2dehands.be').href,
      date: relDate(l.date),
      labels: [l.opvalStickerText, reserved ? 'Gereserveerd' : '', (l.highlights || []).some(h => h.key === 'LezSuitable') ? 'Alle milieu/emissie zones' : ''].filter(Boolean),
      options,
      carPassUrl: attr('carPassUrl'),
    };
  }

  return {
    async read() {
      const listings = await profileListings();
      const items = [];
      for (const l of listings) {
        let det;
        try {
          det = await adDetails(l);
          if (det === null) { log(`  - ${l.itemId}: zoekertje bestaat niet meer`); continue; }
        } catch (e) { det = undefined; log(`  ! ${l.itemId}: ${e.message} (alleen de gegevens van het profiel gebruikt)`); }
        items.push(toListing(l, det));
      }
      return items;
    },
  };
}
