#!/usr/bin/env node
/* ==========================================================================
   Builds one page per car: wagen/<id>/index.html
   - Uses index.html as the template (same header, footer, menus and forms),
     with the car in place of the home page content.
   - Every page has its own title, description and photo, so a link shared on
     WhatsApp or Facebook shows the car, and Google can find each car.
   - Cars that are gone get a short "verkocht" page, so old links still work.
   - Also writes sitemap.xml and robots.txt.

   Runs by itself after every sync (sync-stock.mjs). By hand:
     node sync/build-pages.mjs
   ========================================================================== */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = new Intl.NumberFormat('nl-BE');
const eur = n => '€ ' + nf.format(Math.round(n));
const IMG_RULE = /(\?rule=ecg_mp_eps)\$_\d+$/;
const imgAt = (src, r) => src && IMG_RULE.test(src) ? src.replace(IMG_RULE, (m, a) => `${a}$_${r}`) : src;
const okId = id => /^[a-z0-9-]+$/.test(String(id || ''));
const writeAtomic = (file, text) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file + '.tmp', text); renameSync(file + '.tmp', file); };

function priceText(c) {
  if (c.price == null) return c.status === 'reserved' ? 'Gereserveerd' : 'Prijs op aanvraag';
  return eur(c.price);
}
function summary(c) {
  const bits = [c.year, c.km != null ? nf.format(c.km) + ' km' : null, c.fuel, c.gearbox, c.hp ? c.hp + ' pk' : null].filter(Boolean).join(', ');
  const promise = c.status === 'export'
    ? 'Verkoop voor export of handel, zonder keuring en garantie.'
    : `Nagekeken in onze werkplaats, gekeurd met Car-Pass${c.warranty ? `, ${c.warranty} maanden garantie` : ''}.`;
  return `${c.brand} ${c.model} ${c.version || ''}`.replace(/\s+/g, ' ').trim() + `: ${bits}. ${priceText(c)}. ${promise} Auto Turnhout, Oud-Turnhout.`;
}

function carJsonLd(c, url, site) {
  const ld = {
    '@context': 'https://schema.org', '@type': 'Car',
    name: `${c.brand} ${c.model} ${c.version || ''}`.trim(),
    brand: { '@type': 'Brand', name: c.brand }, model: c.model,
    vehicleModelDate: c.year ? String(c.year) : undefined,
    mileageFromOdometer: c.km != null ? { '@type': 'QuantitativeValue', value: c.km, unitCode: 'KMT' } : undefined,
    fuelType: c.fuel || undefined, vehicleTransmission: c.gearbox || undefined, bodyType: c.body || undefined,
    color: c.color || undefined, numberOfDoors: c.doors || undefined,
    itemCondition: 'https://schema.org/UsedCondition',
    image: (c.images && c.images.length ? c.images : [c.img]).filter(Boolean).slice(0, 8),
    description: summary(c), url,
  };
  if (c.price != null) {
    ld.offers = {
      '@type': 'Offer', price: c.price, priceCurrency: 'EUR', url,
      availability: c.status === 'reserved' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/UsedCondition',
      seller: { '@type': 'AutoDealer', name: site.name, telephone: site.phone },
    };
  }
  return JSON.stringify(ld).replace(/</g, '\\u003c');
}

// The page content for one car. The script turns this into the full detail view;
// this plain version is what search engines, link previews and visitors without JavaScript get.
function carMain(c, cta) {
  const specs = [['Bouwjaar', c.year], ['Kilometerstand', c.km != null ? nf.format(c.km) + ' km' : null], ['Brandstof', c.fuel], ['Transmissie', c.gearbox],
    ['Vermogen', c.hp ? `${c.hp} pk` : null], ['Carrosserie', c.body], ['Deuren', c.doors], ['Kleur', c.color], ['Emissienorm', c.euro]]
    .filter(([, v]) => v != null && v !== '');
  const about = c.description ? esc(c.description).split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('') : '';
  const photos = (c.images && c.images.length ? c.images : [c.img]).filter(Boolean);
  return `<main id="main" class="carpage-main">
  <div class="wrap carpage">
    <nav class="crumbs" aria-label="Kruimelpad"><a href="./">Home</a><span aria-hidden="true">/</span><a href="./#aanbod">Aanbod</a><span aria-hidden="true">/</span><span>${esc(c.brand)}</span><span aria-hidden="true">/</span><span aria-current="page" data-crumb-model>${esc(c.model)}</span></nav>
    <div id="carPage" class="carpage__body">
      <article class="carpage__static">
        <h1 class="cm__title">${esc(c.brand)} ${esc(c.model)}</h1>
        <p class="cm__version">${esc(c.version || '')}</p>
        ${photos[0] ? `<img class="carpage__photo" src="${esc(imgAt(photos[0], 86))}" width="1024" height="768" alt="${esc(c.brand)} ${esc(c.model)} ${esc(c.version || '')}">` : ''}
        <p class="carpage__price"><b>${esc(priceText(c))}</b></p>
        <dl class="spec-grid">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        ${c.features && c.features.length ? `<ul class="feat">${c.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
        ${about ? `<div class="cm__about" lang="nl">${about}</div>` : ''}
      </article>
    </div>
  </div>
${cta}
</main>`;
}

function soldMain(cta) {
  return `<main id="main" class="carpage-main">
  <div class="wrap carpage">
    <nav class="crumbs" aria-label="Kruimelpad"><a href="./">Home</a><span aria-hidden="true">/</span><a href="./#aanbod">Aanbod</a></nav>
    <div id="carPage" class="carpage__body">
      <div class="sold"><p class="eyebrow">Verkocht</p><h1 class="h2">Deze wagen is <em>al verkocht.</em></h1><p>Goed nieuws voor de nieuwe eigenaar. Bekijk ons andere aanbod, of vraag ons naar een gelijkaardige wagen.</p><div class="btn-row"><a class="btn btn--primary" href="./#aanbod">Bekijk het aanbod</a></div></div>
    </div>
  </div>
${cta}
</main>`;
}

function fromTemplate(tpl, { id, title, description, image, url, ld, main, noindex }) {
  let h = tpl;
  const swap = (re, to) => { if (!re.test(h)) throw new Error('index.html: kan ' + re + ' niet vinden'); h = h.replace(re, typeof to === 'function' ? to : () => to); };
  // All links and files are relative to the site root (two folders up)
  swap(/<meta charset="utf-8">/, '<meta charset="utf-8">\n<base href="../../">');
  swap(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  swap(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`);
  swap(/<meta property="og:type" content="[^"]*">/, '<meta property="og:type" content="product">');
  swap(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`);
  swap(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(description)}">`
    + (image ? `\n<meta property="og:image" content="${esc(image)}">\n<meta property="og:image:width" content="1024">\n<meta property="og:image:height" content="768">\n<meta name="twitter:card" content="summary_large_image">` : '')
    + (url ? `\n<meta property="og:url" content="${esc(url)}">\n<link rel="canonical" href="${esc(url)}">` : '')
    + (noindex && !/<meta name="robots"/.test(h) ? '\n<meta name="robots" content="noindex">' : ''));
  if (ld) swap(/<\/head>/, `<script type="application/ld+json">${ld}</script>\n</head>`);
  swap(/<body>/, `<body data-page="car" data-car="${esc(id)}">`);
  // The skip link stays on this page
  h = h.replace('href="#main"', `href="wagen/${id}/#main"`);
  swap(/<main id="main">[\s\S]*?<\/main>/, () => main);
  return h;
}

export function buildPages({ root = ROOT, cars, siteUrl = '', log = console.log } = {}) {
  const tpl = readFileSync(join(root, 'index.html'), 'utf8');
  const ctaMatch = tpl.match(/<section class="cta-band"[\s\S]*?<\/section>/);
  const cta = ctaMatch ? ctaMatch[0] : '';
  const base = siteUrl.replace(/\/+$/, '');
  const settings = readFileSync(join(root, 'assets/js/data.js'), 'utf8');
  const site = { name: (settings.match(/name:\s*'([^']+)'/) || [, 'Auto Turnhout'])[1], phone: (settings.match(/tel:\s*'(\+\d+)'/) || [, ''])[1] };
  const dir = join(root, 'wagen');
  mkdirSync(dir, { recursive: true });

  const live = new Set();
  let made = 0;
  for (const c of cars) {
    if (!okId(c.id) || !c.brand) continue;
    live.add(c.id);
    const url = base ? `${base}/wagen/${c.id}/` : '';
    const photo = imgAt(c.img || (c.images || [])[0], 86);
    const title = `${c.brand} ${c.model}${c.version ? ' ' + c.version : ''}${c.year ? ` (${c.year})` : ''} · ${priceText(c)} · ${site.name}`;
    const html = fromTemplate(tpl, { id: c.id, title, description: summary(c), image: photo, url, ld: carJsonLd(c, url || `wagen/${c.id}/`, site), main: carMain(c, cta) });
    writeAtomic(join(dir, c.id, 'index.html'), html);
    made++;
  }

  // Cars that are no longer for sale: keep the link alive with a short "verkocht" page
  let sold = 0;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (!name.isDirectory() || live.has(name.name) || !okId(name.name)) continue;
    const file = join(dir, name.name, 'index.html');
    const before = existsSync(file) ? readFileSync(file, 'utf8') : '';
    const html = fromTemplate(tpl, { id: name.name, title: `Verkocht · ${site.name}`, description: 'Deze wagen is verkocht. Bekijk het actuele aanbod van Auto Turnhout in Oud-Turnhout.', main: soldMain(cta), noindex: true })
      .replace('data-page="car"', 'data-page="car" data-sold="1"');
    if (html === before) continue;
    writeAtomic(file, html);
    if (!before.includes('data-sold="1"')) sold++;
  }

  if (base) {
    const today = new Date().toISOString().slice(0, 10);
    const urls = [`${base}/`, ...[...live].map(id => `${base}/wagen/${id}/`)];
    writeAtomic(join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${esc(u)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
    writeAtomic(join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
  }
  log(`Pagina's: ${made} wagens, ${sold} nieuw als verkocht gemarkeerd${base ? ', sitemap.xml bijgewerkt' : ''}.`);
  return { made, sold };
}

// Run by hand: node sync/build-pages.mjs
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  try {
    const cfg = JSON.parse(readFileSync(join(ROOT, 'sync/config.json'), 'utf8'));
    const stock = JSON.parse(readFileSync(join(ROOT, cfg.out || 'stock.json'), 'utf8'));
    buildPages({ cars: stock.cars || [], siteUrl: cfg.siteUrl || '' });
  } catch (e) {
    console.error('Pagina\'s bouwen mislukt:', e.message);
    process.exitCode = 1;
  }
}
