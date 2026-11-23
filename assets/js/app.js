(async () => {
  'use strict';
  document.documentElement.classList.add('js');

  /* ------------------------------------------------------------------
     Stock: read stock.json (written by sync/sync-stock.mjs from the
     2dehands ads). If it is missing, the copy in data.js is used.
     ?stock=other.json loads another file (for testing a feed).
     ------------------------------------------------------------------ */
  try {
    const file = new URLSearchParams(location.search).get('stock') || 'stock.json';
    if (/^[\w./-]+\.json$/.test(file) && !file.includes('..')) {
      const res = await fetch(file, { cache: 'no-store' });
      if (res.ok) {
        const feed = await res.json();
        if (Array.isArray(feed.cars) && feed.cars.length) { window.CARS = feed.cars; window.STOCK_UPDATED = feed.updated || null; }
      }
    }
  } catch { /* offline or opened as a file: keep the built-in list */ }

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  const S = window.SITE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  // Language (set by i18n.js): T('Dutch text {x}', { x }) gives the text in the visitor's language
  const I18N = window.I18N || { lang: 'nl', tr: s => s, t: (s, v) => v ? s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '') : s };
  const T = I18N.t, LANG = I18N.lang;
  const LOC = { nl: 'nl-BE', fr: 'fr-BE', en: 'en-GB' }[LANG] || 'nl-BE';
  const nf = new Intl.NumberFormat(LOC);
  const cf = new Intl.NumberFormat(LOC, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, minimumFractionDigits: 0 });
  const eur = n => LANG === 'nl' ? '€ ' + nf.format(Math.round(n)) : cf.format(Math.round(n));
  const km = n => nf.format(n) + ' km';
  const dec = (n, d = 1) => Number(n).toLocaleString(LOC, { minimumFractionDigits: d, maximumFractionDigits: d });
  const PAGE = document.body.dataset.page || 'home';
  // 2dehands keeps every photo in several sizes (always the same original photo):
  // 82 = 147 px, 83 = 358 px, 84 = 498 px, 85 = 726 px, 86 = 1024 px wide
  const IMG_RULE = /(\?rule=ecg_mp_eps)\$_\d+$/;
  const imgAt = (src, r) => src && IMG_RULE.test(src) ? src.replace(IMG_RULE, (m, a) => `${a}$_${r}`) : src;
  const srcsetOf = (src, max = 1024) => IMG_RULE.test(src || '') ? [[84, 498], [85, 726], [86, 1024]].filter(([, w]) => w <= max).map(([r, w]) => `${imgAt(src, r)} ${w}w`).join(', ') : '';
  // Cards stop at 726 px: sharp enough on a phone, and about half the size of the full photo
  const imgAttrs = (src, sizes, base = 85) => { const ss = srcsetOf(src, 726); return `src="${imgAt(src, base)}"${ss ? ` srcset="${ss}" sizes="${sizes}"` : ''}`; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
  };
  const fullAddress = `${S.address.street}, ${S.address.zip} ${S.address.city}`;
  const waUrl = text => `https://wa.me/${S.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;
  const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const setP = input => input.style.setProperty('--p', ((input.value - input.min) / (input.max - input.min) * 100) + '%');

  const TODAY = new Date();
  const daysAgo = iso => Math.max(0, Math.round((TODAY - new Date(iso + 'T12:00:00')) / 864e5));
  const agoText = d => d === 0 ? T('Vandaag online') : d === 1 ? T('Gisteren online') : T('{n} dagen geleden online', { n: d });

  const CARS = window.CARS.map(c => ({
    ...c,
    name: `${c.brand} ${c.model}`,
    family: ['SUV', 'Break', 'MPV'].includes(c.body) && (c.doors == null || c.doors >= 5) && !/^(Hatchback|Cabrio|Bestelwagen)$/.test(c.body),
    eco: ['Elektrisch', 'Hybride', 'Plug-in hybride'].includes(c.fuel),
    ago: daysAgo(c.added),
  }));
  // Price may be unknown (2dehands shows "Gereserveerd" instead of a price)
  const carPrice = c => c.price == null ? (c.status === 'reserved' ? 'Gereserveerd' : 'Prijs op aanvraag') : eur(c.price);
  const byId = id => CARS.find(c => c.id === id);
  const HAS_PAGES = !!window.STOCK_UPDATED;
  const pageHref = c => HAS_PAGES && /^[a-z0-9-]+$/.test(c.id) ? `wagen/${c.id}/` : `#wagen-${c.id}`;
  const pageUrl = c => new URL(pageHref(c), HAS_PAGES ? document.baseURI : location.href).href;

  function monthly(price, down = 0, months = S.finance.term, apr = S.finance.apr) {
    const P = price - down;
    if (P <= 0) return 0;
    const r = Math.pow(1 + apr / 100, 1 / 12) - 1;
    return P * r / (1 - Math.pow(1 + r, -months));
  }
  function financeFine(price, down, months) {
    const m = monthly(price, down, months);
    const r = Math.pow(1 + S.finance.apr / 100, 1 / 12) - 1;
    return T('Kredietbedrag {amount}, {months} maanden, totaal terug te betalen {total}. JKP {apr}%, vaste debetrentevoet {rate}%. Indicatief, geen offerte. <strong>Let op, geld lenen kost ook geld.</strong>',
      { amount: eur(price - down), months, total: eur(m * months), apr: dec(S.finance.apr, 2), rate: dec(r * 1200, 2) });
  }

  let toastTimer;
  function toast(msg, kind = 'ok') {
    const t = $('#toast');
    t.innerHTML = icon(kind === 'ok' ? 'check' : 'info') + `<span>${esc(msg)}</span>`;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  async function send(type, data) {
    if (!S.formEndpoint) { await new Promise(r => setTimeout(r, 650)); return true; }
    try {
      const res = await fetch(S.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ type, site: S.name, ...data }),
      });
      return res.ok;
    } catch { return false; }
  }

  const closeAll = () => $$('dialog[open]').forEach(d => d.close());
  // Opens a window without putting the blue focus ring on its first button (the X); Tab still walks through all buttons
  const showDlg = d => {
    d.showModal();
    const f = $('[data-car-root]', d) || $('.modal, .sheet', d) || d;
    f.tabIndex = -1;
    f.focus({ preventScroll: true });
  };

  /* ------------------------------------------------------------------
     Settings → page
     ------------------------------------------------------------------ */
  function bindSettings() {
    const words = S.name.trim().split(/\s+/);
    const mono = (S.monogram || words[words.length - 1][0] || 'A').slice(0, 2).toUpperCase();
    const BIND = {
      name: S.name, legalName: S.legalName || S.name, register: S.register || '', rentalPartner: S.rentalPartner || 'onze verhuurpartner',
      city: S.address.city, years: S.yearsActive, region: S.region,
      address: fullAddress, email: S.email, vat: S.vat, languages: S.languages,
      rating: dec(S.google.rating), reviewCount: nf.format(S.google.count), apr: dec(S.finance.apr, 2),
    };
    $$('[data-bind]').forEach(el => {
      const key = el.dataset.bind;
      if (BIND[key] != null) el.textContent = BIND[key];
      if (el.dataset.countTo != null) el.dataset.countTo = key === 'rating' ? S.google.rating : key === 'years' ? S.yearsActive : el.dataset.countTo;
    });
    $$('[data-tel]').forEach(a => {
      const p = S.phones[a.dataset.tel];
      if (!p) return;
      a.href = 'tel:' + p.tel;
      $$('[data-tel-label]', a).forEach(l => (l.textContent = p.label));
    });
    $$('[data-wa]').forEach(a => {
      if (a.id === 'fcApply') return;
      a.href = waUrl(a.dataset.waText || T('Hallo {name}, ', { name: S.name }));
      a.target = '_blank'; a.rel = 'noopener';
    });
    $$('[data-route]').forEach(a => (a.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(S.name + ', ' + fullAddress)}`));
    $$('[data-mail]').forEach(a => (a.href = `mailto:${S.email}${a.dataset.mailSubject ? '?subject=' + encodeURIComponent(a.dataset.mailSubject) : ''}`));
    $$('[data-social]').forEach(a => (a.href = S.social[a.dataset.social] || '#'));
    const gl = $('#googleLink'); if (gl) gl.href = S.google.url || '#';
    $('#demoBar').hidden = !S.demo;
    $('#year').textContent = TODAY.getFullYear();
    if (PAGE === 'home') document.title = T('{name} · Occasions en werkplaats in {city}', { name: S.name, city: S.address.city });
    const mf = $('#monthlyFine'); if (mf) mf.hidden = !(S.finance && S.finance.showMonthly);
    const fav = document.querySelector('link[rel=icon]');
    if (fav) fav.href = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#8a1e3b"/><text x="32" y="44" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="${mono.length > 1 ? 26 : 34}" fill="#fff">${esc(mono)}</text></svg>`);

    // Structured data for Google (address, phone, opening hours)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const spec = key => Object.entries(S.hours[key]).map(([d, h]) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: dayNames[d], opens: h[0], closes: h[1] }));
    const ld = {
      '@context': 'https://schema.org', '@type': ['AutoDealer', 'AutoRepair'], name: S.name,
      address: { '@type': 'PostalAddress', streetAddress: S.address.street, postalCode: S.address.zip, addressLocality: S.address.city, addressCountry: S.address.country },
      telephone: S.phones.sales.tel, email: S.email, url: location.origin,
      openingHoursSpecification: spec('showroom'),
      department: [{ '@type': 'AutoRepair', name: `${S.name} werkplaats`, telephone: S.phones.workshop.tel, openingHoursSpecification: spec('werkplaats') }],
    };
    if (!S.demo) ld.aggregateRating = { '@type': 'AggregateRating', ratingValue: S.google.rating, reviewCount: S.google.count };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------------
     Opening hours (live, Brussels time)
     ------------------------------------------------------------------ */
  const CAL = I18N.cal || {};
  const DAY = CAL.day || ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  const SHORT = CAL.short || ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  const MONTH = CAL.month || ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const fromMin = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const shortTime = t => t.replace(/^0/, '').replace(':00', '');

  function bxlNow() {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Brussels', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), mins: (+g('hour')) * 60 + (+g('minute')) };
  }
  function hoursStatus(key) {
    const H = S.hours[key];
    const { day, mins } = bxlNow();
    const today = H[day];
    if (today && mins >= toMin(today[0]) && mins < toMin(today[1])) return { open: true, text: T('open tot {t}', { t: today[1] }), until: today[1] };
    for (let i = 0; i < 8; i++) {
      const d = (day + i) % 7, h = H[d];
      if (!h) continue;
      if (i === 0) { if (mins < toMin(h[0])) return { open: false, text: T('opent vandaag om {t}', { t: h[0] }), at: toMin(h[0]) }; continue; }
      return { open: false, text: i === 1 ? T('opent morgen om {t}', { t: h[0] }) : T('opent {day} om {t}', { day: DAY[d], t: h[0] }), at: i * 1440 + toMin(h[0]) };
    }
    return { open: false, text: T('gesloten'), at: Infinity };
  }
  function compactHours(key) {
    const H = S.hours[key], groups = [];
    for (const d of [1, 2, 3, 4, 5, 6, 0]) {
      const h = H[d], k = h ? h.join('-') : null, last = groups[groups.length - 1];
      if (last && last.k === k) last.to = d; else groups.push({ from: d, to: d, k, h });
    }
    return groups.filter(g => g.h).map(g => `${SHORT[g.from]}${g.from !== g.to ? '–' + SHORT[g.to] : ''} ${shortTime(g.h[0])}–${shortTime(g.h[1])}`).join(', ');
  }
  function renderHours() {
    const sr = hoursStatus('showroom'), wp = hoursStatus('werkplaats');
    const top = $('#topStatus');
    const anyOpen = sr.open || wp.open;
    top.classList.toggle('is-closed', !anyOpen);
    const until = [sr, wp].filter(s => s.open).map(s => s.until).sort().pop();
    const next = [sr, wp].sort((a, b) => a.at - b.at)[0];
    $('[data-status-text]', top).textContent = anyOpen ? T('Nu open tot {t}', { t: until }) : T('Gesloten · {s}', { s: next.text });
    top.title = T('Showroom {a}, werkplaats {b}', { a: sr.text, b: wp.text });
    [['showroom', sr], ['werkplaats', wp]].forEach(([key, st]) => {
      $$(`[data-pill="${key}"]`).forEach(p => { p.textContent = st.open ? T('Nu {s}', { s: st.text }) : T('Gesloten, {s}', { s: st.text }); p.classList.toggle('closed', !st.open); });
      const { day } = bxlNow();
      $$(`[data-hours="${key}"]`).forEach(t => {
        t.innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
          const h = S.hours[key][d];
          return `<tr class="${d === day ? 'today' : ''}"><td>${cap(DAY[d])}</td><td>${h ? `${h[0]} – ${h[1]}` : T('Gesloten')}</td></tr>`;
        }).join('');
      });
    });
    $('#footerHours').innerHTML = T('Showroom: {a}<br>Werkplaats: {b}<br>Zon- en feestdagen gesloten', { a: compactHours('showroom'), b: compactHours('werkplaats') });
  }

  // Next open days (local calendar) for a department
  function openDays(key, count) {
    const out = [], { mins } = bxlNow();
    for (let i = 0; out.length < count && i < 30; i++) {
      const d = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + i);
      const h = S.hours[key][d.getDay()];
      if (!h) continue;
      if (i === 0 && mins > toMin(h[1]) - 90) continue;
      out.push(d);
    }
    return out;
  }
  function slotsFor(key, date) {
    const h = S.hours[key][date.getDay()], list = [];
    if (!h) return list;
    const isToday = date.toDateString() === TODAY.toDateString();
    const { mins } = bxlNow();
    for (let m = toMin(h[0]); m <= toMin(h[1]) - 60; m += 30) {
      if (isToday && m < mins + 60) continue;
      list.push(fromMin(m));
    }
    return list;
  }
  const dateKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dayLabel = d => `${DAY[d.getDay()]} ${d.getDate()} ${MONTH[d.getMonth()]}`;
  const dayPill = (d, i, selected) => `<button type="button" class="day" data-day="${i}" aria-pressed="${selected}"><small>${SHORT[d.getDay()]}</small><b>${d.getDate()}</b><em>${MONTH[d.getMonth()]}</em></button>`;

  /* ------------------------------------------------------------------
     Header
     ------------------------------------------------------------------ */
  function initHeader() {
    const header = $('#header');
    // The bar at the bottom of the phone slides away while scrolling down and comes back on the way up
    let lastY = scrollY;
    const onScroll = () => {
      header.classList.toggle('scrolled', scrollY > 10);
      header.style.setProperty('--read', Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)).toFixed(4)); // thin line in the header: how far down the page
      const y = Math.max(0, scrollY), d = y - lastY;
      if (Math.abs(d) < 8) return;
      document.documentElement.classList.toggle('bar-down', d > 0 && y > 160);
      lastY = y;
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const links = $$('.nav a');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(a => { const sec = $(a.getAttribute('href')); if (sec) io.observe(sec); });
  }

  /* ------------------------------------------------------------------
     Workshop check report (per car). Only shows what is true for every car
     we sell (workshop check, keuring, Car-Pass, warranty). Measured values
     appear only when they are filled in for that car (car.check).
     ------------------------------------------------------------------ */
  const plugIn = c => ['Elektrisch', 'Plug-in hybride'].includes(c.fuel);
  const SHOW_MONTHLY = !!(S.finance && S.finance.showMonthly);
  function checkOf(c) {
    const k = c.check, rows = [];
    if (k) {
      if (k.brakesFront != null) rows.push({ label: 'Remmen voor', value: `${k.brakesFront}%`, pct: k.brakesFront });
      if (k.brakesRear != null) rows.push({ label: 'Remmen achter', value: `${k.brakesRear}%`, pct: k.brakesRear });
      if (k.tyres != null) rows.push({ label: 'Banden', value: `${dec(k.tyres)} mm`, pct: Math.round(k.tyres / 8 * 100) });
      if (k.battery != null) rows.push({ label: 'Batterij (SOH)', value: `${k.battery}%`, pct: k.battery });
    }
    rows.push({ label: 'Nagekeken in onze werkplaats', ok: 'Gedaan' });
    rows.push({ label: 'Keuring voor verkoop', ok: c.inspectionPoints ? `${c.inspectionPoints} punten` : 'Gekeurd' });
    // Facts taken from the 2dehands ad text by the sync script
    if (c.firstOwner) rows.push({ label: 'Eerste eigenaar', ok: 'Ja' });
    if (c.dealerMaintained) rows.push({ label: 'Onderhoud', ok: 'Bij de dealer' });
    (c.work || []).forEach(w => rows.push({ label: w, ok: 'Gedaan' }));
    if (c.carpass) rows.push({ label: 'Car-Pass', ok: 'Bij de wagen' });
    if (c.warranty) rows.push({ label: 'Garantie', ok: `${c.warranty} maanden` });
    if (plugIn(c) && !(k && k.battery != null)) rows.push({ label: 'Batterijtest', ok: 'Rapport bij de wagen' });
    return rows;
  }
  const reportHTML = (c, max = 99) => checkOf(c).slice(0, max).map(x => x.ok
    ? `<li class="report__ok"><span>${esc(x.label)}</span><em>${icon('check')}${esc(x.ok)}</em></li>`
    : `<li><span>${esc(x.label)}</span><i class="meter"><b style="--v:${Math.min(100, x.pct)}%"></b></i><em>${esc(x.value)}</em></li>`).join('');
  const kmText = c => c.km == null ? T('km op aanvraag') : km(c.km);
  const monthlyText = c => c.status === 'export' ? 'Prijs voor export of handel' : SHOW_MONTHLY && c.price != null ? T('of ≈ {p}/mnd*', { p: eur(monthly(c.price)) }) : 'Maandbedrag op aanvraag';

  /* ------------------------------------------------------------------
     Hero: car of the week with its check report
     ------------------------------------------------------------------ */
  // Car of the week: one marked "featured", otherwise the newest available car from € 15.000, otherwise the newest available car
  const newestFirst = list => [...list].sort((a, b) => a.ago - b.ago);
  const available = CARS.filter(c => c.status === 'available' && c.img);
  const FEATURED = CARS.find(c => c.featured) || newestFirst(available.filter(c => c.price >= 15000 && c.ago <= 30))[0] || newestFirst(available)[0] || CARS[0];
  // The hero turns through a few cars by itself: the car of the week first, then the newest cars from € 10.000 (one per model)
  const HERO = (() => {
    const out = [FEATURED], seen = new Set([`${FEATURED.brand} ${FEATURED.model}`]);
    const add = c => { const k = `${c.brand} ${c.model}`; if (out.length < 6 && !seen.has(k)) { seen.add(k); out.push(c); } };
    newestFirst(available.filter(c => c.price != null && c.price >= 10000)).forEach(add);
    newestFirst(available).forEach(add);
    return out;
  })();
  function initFeatured() {
    const card = $('#featured'), slides = $('#featuredPhoto'), stage = $('.hero__frame');
    const big = src => src.replace('/960px-', '/1920px-');
    slides.innerHTML = HERO.map((c, i) => { const ss = srcsetOf(c.img); return `<div class="hero__slide${i ? '' : ' is-active'}"><img ${i ? 'data-src' : 'src'}="${imgAt(big(c.img), 86)}"${ss ? ` ${i ? 'data-srcset' : 'srcset'}="${ss}" sizes="(max-width: 1020px) calc(100vw - 32px), 680px"` : ''} alt="${esc(c.name)} ${esc(c.version)}"${i ? '' : ' fetchpriority="high"'} decoding="async" onerror="this.onerror=null;this.removeAttribute('srcset');this.src='${c.img}'"></div>`; }).join('');
    const prog = $('[data-f-progress]', card);
    prog.hidden = HERO.length < 2;
    // Film strip under the photo: one small photo per car, the line under it shows when the next one comes
    prog.innerHTML = HERO.map((c, i) => `<button type="button" class="hero__thumb${i ? '' : ' is-active'}" data-seg="${i}" aria-label="${esc(T('Wagen {n} van {total}', { n: i + 1, total: HERO.length }))}: ${esc(c.name)}"><img src="${imgAt(c.img, 83)}" alt="" decoding="async"><i></i></button>`).join('');
    let cur = 0;
    const fill = c => {
      $('[data-f-label]', card).textContent = c === FEATURED ? T('Wagen van de week') : T('In de kijker');
      $('[data-f-name]', card).textContent = c.name;
      $('[data-f-meta]', card).textContent = [c.version, c.year, c.km != null ? km(c.km) : null].filter(Boolean).join(' · ');
      $('[data-f-report]', card).innerHTML = reportHTML(c, 4);
      $('[data-f-price]', card).innerHTML = `${carPrice(c)}<small>${monthlyText(c)}</small>`;
    };
    const load = i => { const img = $$('.hero__slide img', slides)[i % HERO.length]; if (img && img.dataset.src) { if (img.dataset.srcset) { img.srcset = img.dataset.srcset; delete img.dataset.srcset; } img.src = img.dataset.src; delete img.dataset.src; } };
    let swapTimer;
    function go(i) {
      i = (i + HERO.length) % HERO.length;
      if (i === cur) return;
      load(i); load(i + 1);
      $$('.hero__slide', slides).forEach((s, k) => s.classList.toggle('is-active', k === i));
      $$('.hero__thumb', prog).forEach((s, k) => s.classList.toggle('is-active', k === i));
      cur = i;
      card.classList.add('is-swap');
      clearTimeout(swapTimer);
      swapTimer = setTimeout(() => { fill(HERO[cur]); card.classList.remove('is-swap'); }, 260);
    }
    fill(HERO[0]);
    load(1);
    card.addEventListener('click', e => {
      const seg = e.target.closest('[data-seg]');
      if (seg) return go(+seg.dataset.seg);
      if (e.target.closest('[data-feat-open]')) openCar(HERO[cur].id);
    });
    // The progress bar sets the pace: when it is full, the next car comes in (paused on hover, focus or off screen)
    prog.addEventListener('animationend', e => { if (e.target.closest('.hero__thumb.is-active')) go(cur + 1); });
    const pause = on => card.classList.toggle('is-paused', on);
    card.addEventListener('pointerenter', () => pause(true));
    card.addEventListener('pointerleave', () => pause(false));
    card.addEventListener('focusin', () => pause(true));
    card.addEventListener('focusout', () => pause(false));
    new IntersectionObserver(([e]) => card.classList.toggle('is-off', !e.isIntersecting)).observe(stage);
    // Swipe left or right on the photo or the card (phones)
    let sx = null, sy = 0;
    stage.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', e => {
      if (sx == null) return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     Services (shared by workshop grid, finder, booking)
     ------------------------------------------------------------------ */
  const WINTER = (() => { const m = TODAY.getMonth() + 1; return m >= 10 || m <= 3; })();
  // Winter: wintercheck on top of the list (23 checkpoints, as Auto Turnhout offers it)
  const SEASONAL = WINTER
    ? { id: 'Wintercheck', icon: 'snow', title: 'Wintercheck', text: '23 controlepunten, van de batterij tot het bandenprofiel. Laat meteen ook uw winterbanden steken.', time: null, from: null, season: true }
    : null;
  const SERVICES = [SEASONAL, ...(window.SERVICES || [])].filter(Boolean);
  const SPECIALS = [
    { id: 'Velgen', icon: 'disc', title: 'Velgen herstellen' },
    { id: 'Versnellingsbak', icon: 'cog', title: 'Versnellingsbak, DSG' },
    { id: 'Elektronica', icon: 'cpu', title: 'Auto-elektronica' },
  ];
  const priceText = s => s.from == null ? 'Prijs vooraf' : `vanaf ${eur(s.from)}`;
  const serviceSmall = s => [s.time, s.from != null ? priceText(s) : null].filter(Boolean).join(' · ') || 'Prijs vooraf';

  function initServices() {
    if ($('#serviceMenu')) $('#serviceMenu').innerHTML = SERVICES.map(s => `
      <div class="menu__row${s.season ? ' menu__row--season' : ''}" role="listitem">
        <span class="menu__icon">${icon(s.icon)}</span>
        <div class="menu__txt"><h3>${esc(s.title)}${s.season ? ' <span class="menu__now">Nu</span>' : ''}</h3><p>${esc(s.text)}</p></div>
        <span class="menu__meta">${s.time ? `<span class="menu__time">${icon('clock')}${esc(s.time)}</span>` : ''}<span class="menu__price${s.from == null ? ' menu__price--soft' : ''}">${priceText(s)}</span></span>
        <button class="menu__go" data-open-booking data-services="${s.id}" aria-label="Plan ${esc(s.title.toLowerCase())}">Plan ${icon('arrow')}</button>
      </div>`).join('');
    $('#bookServices').innerHTML = [...SERVICES, ...SPECIALS].map(s => `
      <label class="option">${icon(s.icon)}<input type="checkbox" name="svc" value="${s.id}"><span><b>${esc(s.title)}</b><small>${esc(serviceSmall(s))}</small></span><i class="tick">${icon('check')}</i></label>`).join('');
  }

  // First free workshop moment (same calendar as the booking wizard)
  function nextFreeSlot() {
    const days = openDays('werkplaats', 12);
    for (let i = 0; i < days.length; i++) {
      const key = dateKey(days[i]);
      const t = slotsFor('werkplaats', days[i]).find(x => hash(key + x) % 100 >= 30);
      if (t) return { dayIndex: i, time: t, date: days[i] };
    }
    return null;
  }
  function slotLabel(n) {
    if (!n) return T('Bel ons even');
    const diff = Math.round((new Date(n.date.getFullYear(), n.date.getMonth(), n.date.getDate()) - new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate())) / 864e5);
    const d = diff === 0 ? T('Vandaag') : diff === 1 ? T('Morgen') : cap(DAY[n.date.getDay()]) + ' ' + n.date.getDate() + ' ' + MONTH[n.date.getMonth()];
    return `${d}, ${n.time}`;
  }

  /* ------------------------------------------------------------------
     Three doors, team
     ------------------------------------------------------------------ */
  function initDoors() {
    const avail = CARS.filter(c => c.status !== 'export');
    $$('[data-car-count]').forEach(el => (el.textContent = avail.length));
    $('#doorCars').innerHTML = [...avail].sort((a, b) => a.ago - b.ago).slice(0, 3).map(c => `<img src="${imgAt(c.img, 83)}" alt="" loading="lazy" decoding="async">`).join('');
    const n = nextFreeSlot();
    $$('[data-next-slot]').forEach(el => (el.textContent = slotLabel(n)));
    $$('.door [data-open-booking], .slot-card [data-open-booking]').forEach(b => (b.dataset.pickNext = ''));
    $('#doorPlate').addEventListener('submit', e => {
      e.preventDefault();
      const tw = $('#tradeWizard');
      $('[name=plateCountry]', tw).value = e.target.plateCountry.value;
      $('[name=plate]', tw).value = e.target.plate.value;
      dressPlate($('[data-plate-box]', tw));
      $('#verkopen').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      setTimeout(() => $('[name=model]', tw).focus({ preventScroll: true }), 700);
    });
  }

  function initTeam() {
    const T = window.TEAM || [];
    const tones = ['#8a1e3b', '#2a2c30', '#a8324f', '#5a5e66'];
    $('#teamGrid').hidden = !T.length;
    $('#teamGrid').innerHTML = T.map((p, i) => `
      <figure class="person reveal">
        <div class="person__photo" style="--tone:${tones[i % tones.length]}">${p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy">` : '<svg class="person__ghost" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="46" r="22"/><path d="M18 120c4-26 21-40 42-40s38 14 42 40z"/></svg>'}</div>
        <figcaption><b>${esc(p.name)}</b><small>${esc(p.role)}</small><q>${esc(p.quote)}</q></figcaption>
      </figure>`).join('');
  }

  /* ------------------------------------------------------------------
     Inventory
     ------------------------------------------------------------------ */
  const PRICE_MAX = Math.max(5000, Math.ceil(Math.max(...CARS.map(c => c.price || 0)) / 5000) * 5000);
  const BRANDS = [...new Set(CARS.map(c => c.brand))].sort((a, b) => a.localeCompare(b, 'nl'));
  const FUELS = ['Benzine', 'Diesel', 'Elektrisch', 'Hybride', 'Plug-in hybride'].filter(f => CARS.some(c => c.fuel === f));
  const QUICK = [
    { id: 'budget', label: 'Onder € 10.000', test: c => c.price != null && c.price < 10000 && c.status !== 'export' },
    { id: 'family', label: 'Voor het gezin', test: c => c.family },
    { id: 'eco', label: 'Met stekker of hybride', test: c => c.eco },
    { id: 'auto', label: 'Automatische bak', test: c => c.gearbox === 'Automaat' },
    { id: 'suv', label: 'Hoge instap', test: c => c.body === 'SUV' },
    { id: 'young', label: 'Jonger dan 6 jaar', test: c => TODAY.getFullYear() - c.year <= 5 },
  ];
  const SORTS = {
    'new': (a, b) => a.ago - b.ago,
    'price-asc': (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
    'price-desc': (a, b) => (b.price ?? -1) - (a.price ?? -1),
    'km-asc': (a, b) => (a.km ?? Infinity) - (b.km ?? Infinity),
    'year-desc': (a, b) => b.year - a.year || (a.km ?? Infinity) - (b.km ?? Infinity),
  };
  const blank = () => ({ q: '', brand: '', fuel: '', gearbox: '', quick: new Set(), min: 0, max: PRICE_MAX, yearMin: 0, kmMax: 0, sort: state ? state.sort : 'new' });
  let state = null;
  state = blank();

  function matches(c, s = state) {
    if (s.q) { const hay = norm(`${c.brand} ${c.model} ${c.version} ${c.fuel} ${c.body} ${c.color} ${c.year}`); if (!norm(s.q).split(/\s+/).filter(Boolean).every(w => hay.includes(w))) return false; }
    if (s.brand && c.brand !== s.brand) return false;
    if (s.fuel && c.fuel !== s.fuel) return false;
    if (s.gearbox && c.gearbox !== s.gearbox) return false;
    if (c.price < s.min || c.price > s.max) return false;
    if (s.yearMin && c.year < s.yearMin) return false;
    if (s.kmMax && c.km != null && c.km > s.kmMax) return false;
    for (const q of s.quick) if (!QUICK.find(x => x.id === q).test(c)) return false;
    return true;
  }

  function badges(c) {
    const b = [];
    if (c.status === 'reserved') b.push('<span class="pill pill--reserved">Gereserveerd</span>');
    else if (c.ago <= 7) b.push('<span class="pill pill--new">Net binnen</span>');
    if (c.status === 'export') b.push('<span class="pill pill--export">Export</span>');
    if (c.eco) b.push(`<span class="pill pill--ev">${icon('bolt')}${c.fuel === 'Elektrisch' ? 'Elektrisch' : 'Hybride'}</span>`);
    if (c.lez) b.push(`<span class="pill pill--lez">${icon('leaf')}LEZ-proof</span>`);
    return b.join('');
  }

  const SHORT_FUEL = { 'Plug-in hybride': 'Plug-in' };
  function cardHTML(c, i) {
    const exp = c.status === 'export', n = shotsOf(c).length;
    const assure = exp
      ? `<p class="car__assure car__assure--warn">${icon('info')}Export / handel: zonder keuring en garantie</p>`
      : `<p class="car__assure">${icon('shield')}Werkplaats-check${c.carpass ? ' · Car-Pass' : ''}${c.warranty ? ` · ${c.warranty} mnd garantie` : ''}</p>`;
    return `
    <article class="car" style="--i:${Math.min(i % 8, 8)}">
      <div class="car__media" data-open="${c.id}" data-label="${esc(c.name)}" role="button" tabindex="0" aria-label="Bekijk ${esc(c.name)}">
        <div class="car__sw" style="background-image:url('${imgAt(c.img, 82)}')"><img ${imgAttrs(c.img, '(max-width: 640px) calc(100vw - 48px), (max-width: 749px) calc(100vw - 64px), (max-width: 1111px) calc(50vw - 50px), 396px')} width="1024" height="768" alt="${esc(c.name)} ${esc(c.version)}" loading="lazy" decoding="async" onerror="this.closest('.car__media').classList.add('noimg')"></div>
        <div class="car__badges">${badges(c)}</div>
        ${c.status === 'reserved' ? '<div class="car__veil">Wachtlijst mogelijk</div>' : `<span class="car__peek" aria-hidden="true">Bekijk details ${icon('arrow-ur')}</span>`}
        ${n > 1 ? `<span class="car__photos${c.status === 'reserved' ? ' car__photos--right' : ''}" aria-hidden="true">${icon('camera')}<span data-ph>${n}</span></span><span class="car__dots" aria-hidden="true">${'<i></i>'.repeat(Math.min(n, 5)).replace('<i>', '<i class="on">')}</span>` : ''}
      </div>
      <button class="fav-btn" data-fav="${c.id}" aria-pressed="${favs.has(c.id)}" aria-label="Bewaar ${esc(c.name)}">${icon('heart')}</button>
      <div class="car__body">
        <div class="car__head">
          <div><h3 class="car__title"><a href="${pageHref(c)}" data-open="${c.id}">${esc(c.name)}</a></h3><p class="car__version">${esc(c.version)}</p></div>
          <div class="price">${carPrice(c)}</div>
        </div>
        <ul class="car__specs">
          <li>${c.year}</li>
          ${c.km == null ? '' : `<li>${km(c.km)}</li>`}
          <li>${SHORT_FUEL[c.fuel] || c.fuel}</li>
          <li>${c.gearbox}</li>
        </ul>
        ${assure}
        <div class="car__foot">
          ${exp ? '<div class="monthly">Handelsprijs</div>' : SHOW_MONTHLY && c.price != null ? `<div class="monthly"><span>${T('≈ {p}/mnd*', { p: eur(monthly(c.price)) })}</span></div>` : '<div class="monthly">Maandbedrag op aanvraag</div>'}
          <div class="car__actions">
            <button class="cmp-btn" data-compare="${c.id}" aria-pressed="${cmp.includes(c.id)}" aria-label="Vergelijk ${esc(c.name)}" title="Vergelijken">${icon('columns')}</button>
            <button class="btn btn--dark btn--sm" data-open="${c.id}">Bekijk ${icon('arrow', 'icon--arrow')}</button>
          </div>
        </div>
      </div>
    </article>`;
  }
  // Photos on the cards. With a mouse: moving over the photo shows the first five photos.
  // On a touch screen: the photo can be swiped, it follows the finger (made on the first touch).
  function initCardPhotos() {
    const first = media => $('.car__sw > img', media);
    document.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || !e.target.closest) return;
      const media = e.target.closest('.car__media');
      if (!media || media.classList.contains('is-sw') || !first(media)) return;
      const c = byId(media.dataset.open), shots = c ? shotsOf(c) : [], n = Math.min(5, shots.length);
      if (n < 2) return;
      const r = media.getBoundingClientRect(), k = Math.max(0, Math.min(n - 1, Math.floor((e.clientX - r.left) / r.width * n)));
      if (!media.dataset.warm) { media.dataset.warm = '1'; shots.slice(1, n).forEach(s => { new Image().src = imgAt(s, 85); }); }
      if (media.dataset.k === String(k)) return;
      media.dataset.k = k;
      const img = first(media);
      img.removeAttribute('srcset');
      img.src = imgAt(shots[k], 85);
      $$('.car__dots i', media).forEach((d, j) => d.classList.toggle('on', j === k));
    });
    document.addEventListener('pointerleave', e => {
      const media = e.target;
      if (!media.classList || !media.classList.contains('car__media') || !media.dataset.k || media.dataset.k === '0' || !first(media)) return;
      const c = byId(media.dataset.open);
      media.dataset.k = '0';
      if (c) first(media).src = imgAt(c.img, 85);
      $$('.car__dots i', media).forEach((d, j) => d.classList.toggle('on', j === 0));
    }, true);
    document.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' || !e.target.closest) return;
      const media = e.target.closest('.car__media'), stage = media && $('.car__sw', media);
      if (!stage || media.classList.contains('is-sw')) return;
      const c = byId(media.dataset.open), shots = c ? shotsOf(c) : [];
      if (shots.length < 2) return;
      media.classList.add('is-sw');
      stage.style.backgroundImage = '';
      makeSwiper(stage, {
        photos: shots.map(s => imgAt(s, 85)), alt: `${c.name} ${c.version}`,
        onChange: i => { media.classList.remove('noimg'); const p = $('[data-ph]', media); if (p) p.textContent = `${i + 1}/${shots.length}`; },
        onBad: () => media.classList.add('noimg'),
      });
    }, true);
  }

  let grid, renderTimer, showAll = false, lastList = [], shownCount = 0;
  // Cards shown before "Toon alle": 3 full rows on desktop, 4 rows of 2 on tablet, 6 on phones
  const limit = () => { const v = getComputedStyle(grid).gridTemplateColumns, cols = v === 'none' ? 3 : v.split(' ').length; return cols >= 3 ? cols * 3 : cols === 2 ? 8 : 6; };
  function render() {
    const list = CARS.filter(c => matches(c)).sort(SORTS[state.sort]);
    lastList = list;
    shownCount = showAll ? list.length : Math.min(list.length, limit());
    grid.innerHTML = list.slice(0, shownCount).map(cardHTML).join('');
    const more = $('#moreRow');
    more.hidden = shownCount >= list.length;
    $('#showAllCount').textContent = list.length;
    $('#resultCount').textContent = list.length;
    $('#resultWord').textContent = list.length === 1 ? 'wagen' : 'wagens';
    $('#emptyState').hidden = list.length > 0;
    grid.hidden = list.length === 0;

    const panelCount = [state.brand, state.fuel, state.gearbox, state.yearMin, state.kmMax, state.min > 0 || state.max < PRICE_MAX].filter(Boolean).length;
    $('#filterCount').hidden = !panelCount;
    $('#filterCount').textContent = panelCount;
    const any = panelCount || state.quick.size || state.q;
    $('#resetAll').hidden = !any;
    const parts = [state.brand, state.fuel, state.gearbox, ...[...state.quick].map(q => QUICK.find(x => x.id === q).label)].filter(Boolean);
    if (state.min > 0 || state.max < PRICE_MAX) parts.push(`${eur(state.min)} – ${eur(state.max)}`);
    if (state.yearMin) parts.push(T('vanaf {y}', { y: state.yearMin }));
    if (state.kmMax) parts.push(`max. ${km(state.kmMax)}`);
    if (state.q) parts.push(`“${state.q}”`);
    $('#activeList').textContent = parts.length ? ' · ' + parts.join(' · ') : ', allemaal gecheckt';
  }
  const renderSoon = () => { clearTimeout(renderTimer); renderTimer = setTimeout(render, 110); };

  function syncControls() {
    $('#invSearch').value = state.q;
    $('#invSort').value = state.sort;
    $('#fBrand').value = state.brand;
    $('#fYear').value = String(state.yearMin);
    $('#fKm').value = String(state.kmMax);
    $('#fMin').value = state.min;
    $('#fMax').value = state.max;
    paintDual();
    $$('#fFuel button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === state.fuel));
    $$('#fGear button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === state.gearbox));
    $$('#quickFilters .chip').forEach(b => b.setAttribute('aria-pressed', state.quick.has(b.dataset.q)));
    $$('#brandBar .brand').forEach(b => b.setAttribute('aria-pressed', b.dataset.brand === state.brand));
    fitBrands();
  }

  // Brand row: one line on bigger screens, the rest behind "+N merken" (phones scroll sideways)
  let brandsOpen = false;
  function fitBrands() {
    const bar = $('#brandBar'), more = bar && $('.brand-more', bar);
    if (!more) return;
    const list = $$('.brand', bar);
    list.forEach(b => (b.hidden = false));
    more.hidden = false;
    if (matchMedia('(max-width: 640px)').matches) { more.hidden = true; return; }
    if (brandsOpen) { more.textContent = T('Minder merken'); more.setAttribute('aria-expanded', 'true'); return; }
    more.setAttribute('aria-expanded', 'false');
    const top = list[0].offsetTop;
    let hidden = list.filter(b => b.offsetTop > top + 4);
    hidden.forEach(b => (b.hidden = true));
    if (!hidden.length) { more.hidden = true; return; }
    const visible = list.filter(b => !b.hidden);
    more.textContent = T('+{n} merken', { n: hidden.length });
    while (more.offsetTop > top + 4 && visible.length > 1) {
      const b = visible.pop(); b.hidden = true; hidden.push(b);
      more.textContent = T('+{n} merken', { n: hidden.length });
    }
    // The chosen brand must stay in sight
    if (state.brand && hidden.some(b => b.dataset.brand === state.brand)) { brandsOpen = true; fitBrands(); }
  }
  function paintDual() {
    const a = +$('#fMin').value, b = +$('#fMax').value;
    const fill = $('#priceRange .dual__fill');
    fill.style.left = (a / PRICE_MAX * 100) + '%';
    fill.style.width = ((b - a) / PRICE_MAX * 100) + '%';
    $('#fMinOut').textContent = eur(a);
    $('#fMaxOut').textContent = b >= PRICE_MAX ? eur(PRICE_MAX) + '+' : eur(b);
    $('#fMin').style.zIndex = a > PRICE_MAX - 2500 ? 3 : '';
  }
  function resetFilters() { state = blank(); syncControls(); render(); }
  function goToInventory() { $('#aanbod').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }
  function applyQuick(id) { state = blank(); state.quick.add(id); syncControls(); render(); goToInventory(); }

  function initInventory() {
    grid = $('#carGrid');
    // Brands in stock, most cars first
    const perBrand = BRANDS.map(b => [b, CARS.filter(c => c.brand === b).length]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'nl'));
    $('#brandBar').innerHTML = `<button type="button" class="brand" data-brand="" aria-pressed="true"><span>Alle merken</span><small>${CARS.length}</small></button>` +
      perBrand.map(([b, n]) => `<button type="button" class="brand" data-brand="${esc(b)}" aria-pressed="false"><span>${esc(b)}</span><small>${n}</small></button>`).join('') +
      '<button type="button" class="brand-more" aria-controls="brandBar" aria-expanded="false" hidden></button>';
    // Quiet row of brands under the numbers: the eight we have most of; a click shows the cars of that brand
    const line = $('#brandLine');
    if (line) {
      const top = perBrand.slice(0, 8), rest = perBrand.length - top.length;
      line.innerHTML = top.map(([b]) => `<button type="button" class="brands__item" data-brand="${esc(b)}">${esc(b)}</button>`).join('')
        + (rest > 0 ? `<a class="brands__more" href="#aanbod">${esc(T('+{n} merken', { n: rest }))}</a>` : '');
      line.addEventListener('click', e => {
        const b = e.target.closest('[data-brand]'); if (!b) return;
        state = blank(); state.brand = b.dataset.brand;
        syncControls(); render(); goToInventory();
      });
    }
    let fitTimer;
    addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitBrands, 120); });
    if (document.fonts) document.fonts.ready.then(fitBrands);
    $('#brandBar').addEventListener('click', e => {
      if (e.target.closest('.brand-more')) { brandsOpen = !brandsOpen; fitBrands(); return; }
      const b = e.target.closest('.brand'); if (!b) return;
      state.brand = state.brand === b.dataset.brand ? '' : b.dataset.brand;
      syncControls(); render();
    });
    // Quick categories
    $('#quickFilters').innerHTML = QUICK.map(q => `<button type="button" class="chip" data-q="${q.id}" aria-pressed="false">${q.label}</button>`).join('');
    $('#quickFilters').addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      state.quick.has(b.dataset.q) ? state.quick.delete(b.dataset.q) : state.quick.add(b.dataset.q);
      syncControls(); render();
    });
    // Panel controls
    const brandOpts = BRANDS.map(b => `<option>${esc(b)}</option>`).join('');
    $('#fBrand').insertAdjacentHTML('beforeend', brandOpts);
    $('#fFuel').innerHTML = ['', ...FUELS].map(f => `<button type="button" data-v="${f}" aria-pressed="${f === ''}">${f || 'Alle'}</button>`).join('');
    $('#fGear').innerHTML = ['', 'Automaat', 'Manueel'].map(f => `<button type="button" data-v="${f}" aria-pressed="${f === ''}">${f || 'Alle'}</button>`).join('');
    ['fMin', 'fMax'].forEach(id => { const r = $('#' + id); r.max = PRICE_MAX; });
    $('#fMax').value = PRICE_MAX;

    $('#invSearch').addEventListener('input', e => { state.q = e.target.value.trim(); renderSoon(); });
    $('#invSort').addEventListener('change', e => { state.sort = e.target.value; render(); });
    $('#fBrand').addEventListener('change', e => { state.brand = e.target.value; syncControls(); render(); });
    $('#fYear').addEventListener('change', e => { state.yearMin = +e.target.value; render(); });
    $('#fKm').addEventListener('change', e => { state.kmMax = +e.target.value; render(); });
    $('#fFuel').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; state.fuel = b.dataset.v; syncControls(); render(); });
    $('#fGear').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; state.gearbox = b.dataset.v; syncControls(); render(); });
    const onRange = e => {
      let a = +$('#fMin').value, b = +$('#fMax').value;
      if (a > b - 500) { if (e.target.id === 'fMin') a = b - 500; else b = a + 500; $('#fMin').value = a; $('#fMax').value = b; }
      state.min = +$('#fMin').value; state.max = +$('#fMax').value;
      paintDual(); renderSoon();
    };
    $('#fMin').addEventListener('input', onRange);
    $('#fMax').addEventListener('input', onRange);

    const panel = $('#filtersPanel'), toggle = $('#toggleFilters');
    toggle.addEventListener('click', () => { panel.hidden = !panel.hidden; toggle.setAttribute('aria-expanded', !panel.hidden); });
    $('#closeFilters').addEventListener('click', () => { panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); $('.results-bar').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    $('#resetFilters').addEventListener('click', resetFilters);
    $('#resetAll').addEventListener('click', resetFilters);

    $('#showAllCars').addEventListener('click', () => {
      showAll = true;
      const from = shownCount;
      grid.insertAdjacentHTML('beforeend', lastList.slice(from).map(cardHTML).join(''));
      shownCount = lastList.length;
      $('#moreRow').hidden = true;
      const next = grid.children[from];
      if (next) next.querySelector('.car__title a').focus({ preventScroll: true });
    });

    grid.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.car__media')) { e.preventDefault(); openCar(e.target.dataset.open); }
    });
    syncControls();
    render();
  }

  /* ------------------------------------------------------------------
     Finder (hero)
     ------------------------------------------------------------------ */
  // "Ik zoek [een gezinswagen] van [Opel] tot [€ 20.000]" sentence search.
  // Each choice is our own small dropdown (normal-size text, number of cars per choice);
  // the hidden <select> keeps the value for the form.
  function initSeek() {
    const form = $('#seek');
    const brandSel = $('select[name=brand]', form);
    brandSel.insertAdjacentHTML('beforeend', BRANDS.map(b => `<option value="${esc(b)}">${esc(b)}</option>`).join(''));
    const read = (over = {}) => {
      const fd = new FormData(form), v = { kind: fd.get('kind'), brand: fd.get('brand'), max: fd.get('max'), ...over }, s = blank();
      if (v.kind) s.quick.add(v.kind);
      s.brand = v.brand || '';
      s.max = v.max ? Math.min(+v.max, PRICE_MAX) : PRICE_MAX;
      return s;
    };
    const countFor = over => CARS.filter(c => matches(c, read(over))).length;

    const picks = $$('.seek__pick', form).map(pick => {
      const sel = $('select', pick);
      const id = 'seek-' + sel.name;
      pick.insertAdjacentHTML('beforeend', `
        <button type="button" class="seek__btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}" aria-label="${esc(sel.getAttribute('aria-label'))}">
          <span class="seek__val"></span>${icon('chev-r', 'seek__chev')}
        </button>
        <ul class="seek__list" id="${id}" role="listbox" tabindex="-1" hidden></ul>`);
      const btn = $('.seek__btn', pick), list = $('.seek__list', pick);
      let active = 0;
      const options = () => [...sel.options];
      const draw = () => {
        list.innerHTML = options().map((o, i) => {
          const n = countFor({ [sel.name]: o.value });
          return `<li role="option" id="${id}-${i}" data-i="${i}" aria-selected="${o.selected}" class="${n ? '' : 'is-empty'}"><span>${esc(o.text)}</span><small>${n}</small></li>`;
        }).join('');
      };
      const mark = i => {
        active = Math.max(0, Math.min(options().length - 1, i));
        $$('li', list).forEach((li, j) => li.classList.toggle('is-active', j === active));
        list.setAttribute('aria-activedescendant', `${id}-${active}`);
        const li = $$('li', list)[active]; if (li) li.scrollIntoView({ block: 'nearest' });
      };
      const open = () => {
        picks.forEach(p => p !== api && p.close());
        draw(); list.hidden = false; btn.setAttribute('aria-expanded', 'true'); pick.classList.add('is-open');
        list.style.left = list.style.right = '';                   // keep the list inside the screen
        if (list.getBoundingClientRect().right > innerWidth - 12) { list.style.left = 'auto'; list.style.right = '0'; }
        mark(sel.selectedIndex); list.focus({ preventScroll: true });
      };
      const close = (focusBtn = false) => {
        if (list.hidden) return;
        list.hidden = true; btn.setAttribute('aria-expanded', 'false'); pick.classList.remove('is-open');
        if (focusBtn) btn.focus({ preventScroll: true });
      };
      const choose = i => { sel.selectedIndex = i; sel.dispatchEvent(new Event('change', { bubbles: true })); close(true); };
      btn.addEventListener('click', () => (list.hidden ? open() : close()));
      btn.addEventListener('keydown', e => { if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); open(); } });
      list.addEventListener('click', e => { const li = e.target.closest('li'); if (li) choose(+li.dataset.i); });
      list.addEventListener('mousemove', e => { const li = e.target.closest('li'); if (li && +li.dataset.i !== active) mark(+li.dataset.i); });
      list.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); mark(active + 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); mark(active - 1); }
        else if (e.key === 'Home') { e.preventDefault(); mark(0); }
        else if (e.key === 'End') { e.preventDefault(); mark(options().length - 1); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active); }
        else if (e.key === 'Escape') { e.preventDefault(); close(true); }
        else if (e.key === 'Tab') close();
      });
      const api = { pick, close, label: () => { $('.seek__val', btn).textContent = sel.options[sel.selectedIndex].text; } };
      return api;
    });
    document.addEventListener('click', e => { if (!e.target.closest('.seek__pick')) picks.forEach(p => p.close()); });

    const update = () => {
      picks.forEach(p => p.label());
      $('[data-seek-count]', form).textContent = countFor({});
    };
    form.addEventListener('change', update);
    form.addEventListener('submit', e => { e.preventDefault(); state = read(); syncControls(); render(); goToInventory(); });
    update();
  }

  /* ------------------------------------------------------------------
     Favourites
     ------------------------------------------------------------------ */
  let favs = new Set(store.get('nova-favs', []).filter(byId));
  function syncFavs() {
    $$('[data-fav]').forEach(b => b.setAttribute('aria-pressed', favs.has(b.dataset.fav)));
    $$('[data-fav-count]').forEach(e => { e.textContent = favs.size; e.hidden = !favs.size; });
    if ($('#favDialog').open) renderFavs();
  }
  function toggleFav(id, btn) {
    favs.has(id) ? favs.delete(id) : favs.add(id);
    store.set('nova-favs', [...favs]);
    if (btn) { btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); }
    syncFavs();
    toast(favs.has(id) ? 'Bewaard bij uw favorieten' : 'Verwijderd uit uw favorieten');
  }
  function renderFavs() {
    const list = [...favs].map(byId).filter(Boolean);
    $('#favList').innerHTML = list.length ? list.map(c => `
      <div class="fav-item">
        <img src="${imgAt(c.img, 83)}" alt="" loading="lazy" decoding="async">
        <div><b>${esc(c.name)}</b><small>${[c.year, c.km != null ? km(c.km) : null].filter(Boolean).join(' · ')}</small><div class="price">${carPrice(c)}</div></div>
        <div class="fav-item__btns">
          <button class="btn btn--dark btn--sm" data-open="${c.id}">Bekijk</button>
          <button class="btn btn--outline btn--sm" data-fav="${c.id}" aria-pressed="true" aria-label="Verwijder">${icon('x')}</button>
        </div>
      </div>`).join('') + `<a class="btn btn--primary btn--block" style="margin-top:8px" target="_blank" rel="noopener" href="${waUrl(T('Hallo, deze wagens interesseren mij:') + '\n' + list.map(c => `- ${c.name} ${c.version} (${carPrice(c)})`).join('\n'))}">${icon('chat')}Stuur mijn lijst via WhatsApp</a>`
      : `<div class="sheet__empty">${icon('heart')}<p>Nog geen bewaarde wagens.<br>Tik op het hartje bij een occasion.</p></div>`;
  }

  /* ------------------------------------------------------------------
     Compare
     ------------------------------------------------------------------ */
  let cmp = [];
  function toggleCompare(id) {
    if (cmp.includes(id)) cmp = cmp.filter(x => x !== id);
    else {
      if (cmp.length >= 3) { toast('U kunt maximaal 3 wagens vergelijken', 'info'); return; }
      cmp.push(id);
    }
    syncCompare();
  }
  function syncCompare() {
    $$('[data-compare]').forEach(b => b.setAttribute('aria-pressed', cmp.includes(b.dataset.compare)));
    $('#traySlots').innerHTML = [0, 1, 2].map(i => {
      const c = byId(cmp[i]);
      return c ? `<button class="tray__slot filled" data-compare="${c.id}" aria-label="Verwijder ${esc(c.name)} uit vergelijking" title="${esc(c.name)}"><img src="${imgAt(c.img, 82)}" alt=""></button>` : `<span class="tray__slot">${icon('plus')}</span>`;
    }).join('');
    $('#trayCount').textContent = cmp.length;
    $('#openCompare').disabled = cmp.length < 2;
    $('#compareTray').classList.toggle('show', cmp.length > 0);
  }
  function openCompare() {
    const cars = cmp.map(byId).filter(Boolean);
    if (cars.length < 2) return;
    closeAll();
    const rows = [
      ['Prijs', c => carPrice(c), c => c.price, 'min'],
      SHOW_MONTHLY && ['Per maand*', c => c.status === 'export' || c.price == null ? '–' : `≈ ${eur(monthly(c.price))}`],
      ['Bouwjaar', c => c.year, c => c.year, 'max'],
      ['Kilometerstand', c => c.km == null ? '–' : km(c.km), c => c.km, 'min'],
      cars.some(c => c.hp) && ['Vermogen', c => c.hp ? `${c.hp} pk` : '–', c => c.hp, 'max'],
      ['Brandstof', c => c.fuel], ['Transmissie', c => c.gearbox], ['Carrosserie', c => c.body],
      ['LEZ Antwerpen/Gent', c => c.lez ? 'Toegelaten' : 'Niet toegelaten'],
      ['Garantie', c => c.warranty ? `${c.warranty} mnd` : 'Geen', c => c.warranty, 'max'],
      ['Car-Pass', c => c.carpass ? 'Ja' : 'Nee'],
    ].filter(Boolean);
    const body = rows.map(([label, show, val, mode]) => {
      let best = null;
      if (val) { const vals = cars.map(val).filter(v => v != null); if (vals.length === cars.length && new Set(vals).size > 1) best = mode === 'min' ? Math.min(...vals) : Math.max(...vals); }
      return `<tr><th scope="row">${label}</th>${cars.map(c => `<td class="${best !== null && val(c) === best ? 'best' : ''}">${esc(show(c))}</td>`).join('')}</tr>`;
    }).join('');
    $('#compareModal').innerHTML = `
      <button class="modal__close" data-close aria-label="Sluiten">${icon('x')}</button>
      <h2>Vergelijk ${cars.length} wagens</h2>
      <div class="cmp-wrap"><table class="cmp-table">
        <thead><tr><th></th>${cars.map(c => `<th class="cmp-card"><img src="${imgAt(c.img, 84)}" alt=""><b>${esc(c.name)}</b><small>${esc(c.version)}</small></th>`).join('')}</tr></thead>
        <tbody>${body}</tbody>
        <tfoot><tr class="cmp-actions"><td></td>${cars.map(c => `<td><button class="btn btn--dark btn--sm btn--block" data-open="${c.id}">Bekijk</button></td>`).join('')}</tr></tfoot>
      </table></div>
      <p class="fineprint">● = beste waarde in deze vergelijking.${SHOW_MONTHLY ? ' * Indicatief, 60 maanden zonder voorschot. Let op, geld lenen kost ook geld.' : ''}</p>`;
    showDlg($('#compareDialog'));
  }

  /* ------------------------------------------------------------------
     Car detail
     ------------------------------------------------------------------ */
  // Photos of a car: the photo list from the 2dehands ad, or numbered files ...-1.webp, ...-2.webp
  const shotsOf = c => Array.isArray(c.images) && c.images.length ? c.images : Array.from({ length: Math.max(1, c.photos || 1) }, (_, i) => c.img.replace(/-1(\.\w+)$/, `-${i + 1}$1`));

  // Cars like this one: same body, brand, fuel and gearbox, close in price
  function similarTo(c, n = 4) {
    const score = x => (x.body === c.body ? 3 : 0) + (x.brand === c.brand ? 2 : 0) + (x.fuel === c.fuel ? 1 : 0) + (x.gearbox === c.gearbox ? 1 : 0)
      + (c.price && x.price ? Math.max(0, 3 - Math.abs(x.price - c.price) / c.price * 6) : 0) + (x.status === 'available' ? 1 : 0);
    return CARS.filter(x => x.id !== c.id && x.status !== 'export' && x.img).map(x => [x, score(x)])
      .sort((a, b) => b[1] - a[1] || a[0].ago - b[0].ago).slice(0, n).map(([x]) => x);
  }
  // Recently viewed cars (kept on this device only)
  let recent = store.get('at-recent', []).filter(id => byId(id));
  function remember(id) { recent = [id, ...recent.filter(x => x !== id)].slice(0, 8); store.set('at-recent', recent); renderRecent(); }
  const miniHTML = (c, mode) => `<a class="mini" href="${pageHref(c)}"${mode === 'page' ? '' : ` data-open="${c.id}"`}><span class="mini__img"><img src="${imgAt(c.img, 84)}" alt="" loading="lazy" decoding="async"></span><span class="mini__txt"><b>${esc(c.name)}</b><small>${[c.year, c.km != null ? km(c.km) : null].filter(Boolean).join(' · ')}</small><span class="mini__price">${carPrice(c)}</span></span></a>`;
  function renderRecent() {
    const box = $('#recentStrip');
    if (!box) return;
    const list = recent.map(byId).filter(Boolean).slice(0, 6);
    box.hidden = !list.length;
    $('#recentList').innerHTML = list.map(c => `<a class="recent__chip" href="${pageHref(c)}" data-open="${c.id}"><img src="${imgAt(c.img, 82)}" alt="" loading="lazy"><span><b>${esc(c.name)}</b><small>${carPrice(c)}</small></span></a>`).join('');
  }

  function carDetailHTML(c, mode = 'modal') {
    const exp = c.status === 'export', res = c.status === 'reserved', H = mode === 'page' ? 'h1' : 'h2';
    const specs = [
      ['Bouwjaar', c.year], ['Kilometerstand', c.km != null ? km(c.km) : null], ['Brandstof', c.fuel], ['Transmissie', c.gearbox],
      ['Vermogen', c.hp ? `${c.hp} pk (${Math.round(c.hp * 0.7355)} kW)` : null], ['Carrosserie', c.body], ['Deuren', c.doors],
      ['Kleur', c.color], ['Emissienorm', c.euro], ['LEZ Antwerpen/Gent', c.lez ? 'Toegelaten' : 'Niet toegelaten'],
    ].filter(([, v]) => v != null && v !== '');
    const shots = shotsOf(c), n = shots.length;
    const sim = similarTo(c), seen = recent.filter(id => id !== c.id).map(byId).filter(Boolean).slice(0, 4);
    // The seller's own ad text from 2dehands (plain text, paragraphs kept)
    const about = c.description ? esc(c.description).split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('') : '';
    const terms = [24, 36, 48, 60, 72];
    const calcBox = exp ? '' : SHOW_MONTHLY && c.price != null ? `
          <div class="cm__calc">` : `
          <div class="cm__ask">
            <b>Maandbedrag op aanvraag</b>
            <span>We bekijken samen wat past en helpen u met de aanvraag. Let op, geld lenen kost ook geld.</span>
            <a class="link" target="_blank" rel="noopener" href="${waUrl(T('Hallo, ik wil graag een maandbedrag voor de {car} ({price}).', { car: `${c.name} ${c.version}`, price: carPrice(c) }))}">Vraag een maandbedrag ${icon('arrow')}</a>
          </div>`;
    return `
      <div class="cm__grid">
        <div class="cm__main">
          <div class="cm__media" data-label="${esc(c.name)}">
            <div class="gal__stage" data-gal-stage></div>
            <div class="car__badges">${badges(c)}</div>
            <button class="gal__zoom" type="button" data-gal-zoom aria-label="Foto's op volledig scherm">${icon('search')}</button>
            ${n > 1 ? `<button class="gal__zoom gal__play" type="button" data-gal-play aria-label="Foto's pauzeren">${icon('pause')}</button>` : ''}
            ${n > 1 ? `<button class="gal__nav gal__nav--prev" data-gal="-1" aria-label="Vorige foto">${icon('chev-l')}</button><button class="gal__nav gal__nav--next" data-gal="1" aria-label="Volgende foto">${icon('chev-r')}</button><span class="gal__count" data-gal-count>1 / ${n}</span>` : ''}
          </div>
          ${n > 1 ? `<div class="gal__thumbs" data-gal-thumbs>${shots.map((src, i) => `<button type="button" class="gal__thumb" data-gal-i="${i}" data-full="${imgAt(src, 86)}" aria-pressed="${!i}" aria-label="Foto ${i + 1}"><img src="${imgAt(src, 82)}" alt="" loading="lazy" decoding="async" onerror="this.parentNode.remove()"></button>`).join('')}</div>` : ''}
          ${exp
            ? `<div class="notice">${icon('info')}<span>Deze wagen verkopen we <b>zonder keuring en zonder garantie</b>, voor export of handelaars.</span></div>`
            : `<div class="assure">
                <div>${icon('wrench')}<b>Nagekeken in onze werkplaats</b><small>Voor de verkoop, door onze eigen monteurs</small></div>
                <div>${icon('shield')}<b>${c.warranty} mnd garantie</b><small>Te verlengen tot 36 maanden</small></div>
                <div>${icon('file')}<b>Gekeurd, met Car-Pass</b>${c.carPassUrl ? `<a class="link" href="${esc(c.carPassUrl)}" target="_blank" rel="noopener">Bekijk de Car-Pass ${icon('arrow-ur')}</a>` : '<small>Kilometerstand gecontroleerd</small>'}</div>
              </div>
              <div class="cm__section"><h3>Checkrapport</h3><ul class="report report--card">${reportHTML(c)}</ul></div>`}
          <div class="cm__section"><h3>Technische gegevens</h3><dl class="spec-grid">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>
          ${c.features && c.features.length ? `<div class="cm__section"><h3>Uitrusting in de kijker</h3><ul class="feat">${c.features.map(f => `<li>${icon('check')}${esc(f)}</li>`).join('')}</ul></div>` : ''}
          ${about ? `<div class="cm__section cm__about"><h3>Omschrijving</h3><div data-no-i18n lang="nl">${about}</div></div>` : ''}
          ${sim.length ? `<div class="cm__section cm__more"><h3>Vergelijkbare wagens</h3><div class="minis">${sim.map(x => miniHTML(x, mode)).join('')}</div></div>` : ''}
          ${seen.length ? `<div class="cm__section cm__more"><h3>Onlangs bekeken</h3><div class="minis">${seen.map(x => miniHTML(x, mode)).join('')}</div></div>` : ''}
        </div>
        <aside class="cm__side">
          <p class="eyebrow">${agoText(c.ago)}</p>
          <div><${H} class="cm__title">${esc(c.name)}</${H}><p class="cm__version">${esc(c.version)}</p></div>
          <div class="cm__price"><b>${carPrice(c)}</b><span>${exp ? 'Prijs voor export of handel' : c.price == null ? (res ? 'Wachtlijst mogelijk' : 'Vraag ons de prijs') : 'Btw inbegrepen'}</span></div>
          ${calcBox}${!exp && SHOW_MONTHLY && c.price != null ? `
            <div class="calc__row"><label for="cmDown">Voorschot</label><output id="cmDownOut">€ 0</output></div>
            <input type="range" id="cmDown" min="0" max="${Math.floor(c.price * 0.5 / 250) * 250}" step="250" value="0">
            <div class="calc__row"><span>Looptijd in maanden</span></div>
            <div class="seg" id="cmTerm" role="group" aria-label="Looptijd">${terms.map(m => `<button type="button" aria-pressed="${m === S.finance.term}" data-m="${m}">${m}</button>`).join('')}</div>
            <div class="calc__result"><span>Indicatief per maand</span><b id="cmMonthly"></b></div>
            <p class="calc__fine" id="cmFine"></p>
          </div>` : ''}
          <div class="cm__ctas">
            <button class="btn btn--primary btn--lg" type="button" data-td-toggle>${icon('calendar')}${res ? 'Zet me op de wachtlijst' : exp ? 'Plan een bezichtiging' : 'Plan een proefrit'}</button>
            <a class="btn btn--outline" target="_blank" rel="noopener" href="${waUrl(T('Hallo, ik heb interesse in de {car} ({year}, {price}).', { car: `${c.name} ${c.version}`, year: c.year, price: carPrice(c) }))}">${icon('chat')}WhatsApp</a>
            <a class="btn btn--outline" href="tel:${S.phones.sales.tel}">${icon('phone')}Bel verkoop</a>
          </div>
          <form class="testdrive" data-td hidden novalidate>
            <h4>${res ? 'Wachtlijst voor deze wagen' : 'Kies een moment'}</h4>
            ${res ? '<p class="privacy">Valt de reservatie weg, dan bellen we u meteen.</p>' : '<div class="days" data-td-days></div><label class="field"><span>Uur</span><select name="time" data-td-time></select></label>'}
            <div class="row-2">
              <label class="field"><span>Naam *</span><input name="name" required autocomplete="name"></label>
              <label class="field"><span>Telefoon *</span><input name="phone" type="tel" required autocomplete="tel"></label>
            </div>
            <button class="btn btn--dark btn--block" type="submit">${res ? 'Zet me op de wachtlijst' : 'Bevestig afspraak'}</button>
          </form>
          <div class="cm__tools">
            <button class="btn btn--outline btn--sm" data-fav="${c.id}" aria-pressed="${favs.has(c.id)}">${icon('heart')}Bewaren</button>
            <button class="btn btn--outline btn--sm" data-compare="${c.id}" aria-pressed="${cmp.includes(c.id)}">${icon('columns')}Vergelijken</button>
            <a class="btn btn--outline btn--sm" data-share target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`${c.name} ${c.version}, ${carPrice(c)} bij ${S.name}: ${pageUrl(c)}`)}">${icon('chat')}Delen</a>
          </div>
          <div class="cm__links">
            ${mode === 'modal' && HAS_PAGES ? `<a class="cm__source" href="${pageHref(c)}">Volledige pagina ${icon('arrow-ur')}</a>` : ''}
            ${c.url ? `<a class="cm__source" href="${esc(c.url)}" target="_blank" rel="noopener">Ook op 2dehands ${icon('arrow-ur')}</a>` : ''}
          </div>
          ${exp ? '' : `
          <form class="alarm" data-alarm novalidate>
            <div class="alarm__head">${icon('bolt')}<div><b>Prijsalarm</b><small>Krijg een bericht als de prijs zakt of de wagen gereserveerd wordt.</small></div></div>
            <div class="alarm__row">
              <label class="sr-only" for="alarmMail-${mode}">Uw e-mailadres</label>
              <input id="alarmMail-${mode}" name="email" type="email" required autocomplete="email" placeholder="uw@e-mail.be">
              <button class="btn btn--dark btn--sm" type="submit">Zet aan</button>
            </div>
          </form>`}
        </aside>
      </div>`;
  }

  // Makes the detail work: gallery, photo viewer, price alert, finance, test drive, share
  function wireCarDetail(modal, c) {
    const exp = c.status === 'export', res = c.status === 'reserved';
    // Gallery: the photos follow the finger; thumbnails, arrows and the full-screen viewer
    const media = $('.cm__media', modal), stage = $('[data-gal-stage]', modal), playBtn = $('[data-gal-play]', modal);
    const photos = shotsOf(c).map(src => imgAt(src, 86)), title = `${c.name} ${c.version}`;
    const mark = i => {
      const cnt = $('[data-gal-count]', modal); if (cnt) cnt.textContent = `${i + 1} / ${photos.length}`;
      $$('.gal__thumb', modal).forEach(t => {
        const on = +t.dataset.galI === i;
        t.setAttribute('aria-pressed', on);
        if (on) t.parentElement.scrollTo({ left: t.offsetLeft - t.parentElement.clientWidth / 2 + t.offsetWidth / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    };
    const sw = makeSwiper(stage, {
      photos, alt: title,
      onChange: i => { media.classList.remove('noimg'); mark(i); restart(); },
      onBad: () => media.classList.add('noimg'),
    });
    // The photos swipe on by themselves every 10 seconds; every move by the visitor starts the 10 seconds again
    const EVERY = 10000;
    let timer = 0, playing = false;
    function restart() { clearTimeout(timer); if (playing && photos.length > 1) timer = setTimeout(tick, EVERY); }
    function tick() {
      const dlg = modal.closest('dialog');
      if (!stage.isConnected || (dlg && !dlg.open)) return; // closed, or another car was opened
      const r = media.getBoundingClientRect();
      if (document.hidden || sw.dragging() || Lightbox.isOpen() || r.bottom < 0 || r.top > innerHeight) return restart(); // out of sight: wait
      sw.step(1);
    }
    const setPlaying = on => {
      playing = on;
      if (playBtn) { playBtn.innerHTML = icon(on ? 'pause' : 'play'); playBtn.setAttribute('aria-label', T(on ? "Foto's pauzeren" : "Foto's afspelen")); }
      restart();
    };
    modal.addEventListener('click', e => {
      const t = e.target.closest('[data-gal-i]'); if (t) return sw.go(+t.dataset.galI);
      const nav = e.target.closest('[data-gal]'); if (nav) return sw.step(+nav.dataset.gal);
      if (e.target.closest('[data-gal-play]')) return setPlaying(!playing);
      if (e.target.closest('[data-gal-zoom]') || (e.target.closest('[data-gal-stage]') && !sw.wasDragged())) return Lightbox.open(photos, sw.index(), title, sw.jump);
      const sh = e.target.closest('[data-share]');
      if (sh && navigator.share) { e.preventDefault(); navigator.share({ title: `${c.name} ${c.version}`, text: `${c.name} ${c.version}, ${carPrice(c)}`, url: pageUrl(c) }).catch(() => {}); }
    });
    modal.addEventListener('keydown', e => {
      if (e.target.closest('input, select, textarea')) return;
      if (e.key === 'ArrowRight') sw.step(1);
      if (e.key === 'ArrowLeft') sw.step(-1);
    });
    setPlaying(!reduceMotion);
    // Price alert
    const alarm = $('[data-alarm]', modal);
    if (alarm) alarm.addEventListener('submit', async e => {
      e.preventDefault();
      const mail = $('input', alarm);
      if (!mail.value.trim() || !mail.checkValidity()) { mail.focus(); return toast('Vul een geldig e-mailadres in', 'info'); }
      const ok = await send('prijsalarm', { car: `${c.name} ${c.version}`, carId: c.id, price: c.price, email: mail.value.trim() });
      if (!ok) return toast('Dat lukte niet. Probeer het later opnieuw.', 'info');
      alarm.innerHTML = `<div class="alarm__head">${icon('check')}<div><b>Prijsalarm staat aan</b><small>We mailen naar ${esc(mail.value.trim())} als er iets verandert.</small></div></div>`;
    });
    // Finance
    if (!exp && SHOW_MONTHLY && c.price != null) {
      const down = $('#cmDown', modal);
      let term = S.finance.term;
      const upd = () => {
        setP(down);
        $('#cmDownOut', modal).textContent = eur(+down.value);
        $('#cmMonthly', modal).textContent = eur(monthly(c.price, +down.value, term));
        $('#cmFine', modal).innerHTML = financeFine(c.price, +down.value, term);
      };
      down.addEventListener('input', upd);
      $('#cmTerm', modal).addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        term = +b.dataset.m;
        $$('#cmTerm button', modal).forEach(x => x.setAttribute('aria-pressed', x === b));
        upd();
      });
      upd();
    }
    // Test drive
    const form = $('[data-td]', modal);
    let tdDay = null;
    const days = res ? [] : openDays('showroom', 10);
    const fillTimes = () => {
      const sel = $('[data-td-time]', form);
      const list = slotsFor('showroom', days[tdDay]);
      sel.innerHTML = list.map(t => `<option>${t}</option>`).join('') || '<option value="">Geen uren meer vrij</option>';
    };
    if (!res) {
      $('[data-td-days]', form).innerHTML = days.map((d, i) => dayPill(d, i, false)).join('');
      $('[data-td-days]', form).addEventListener('click', e => {
        const b = e.target.closest('.day'); if (!b) return;
        tdDay = +b.dataset.day;
        $$('.day', form).forEach(x => x.setAttribute('aria-pressed', x === b));
        fillTimes();
      });
    }
    $('[data-td-toggle]', modal).addEventListener('click', () => {
      form.hidden = !form.hidden;
      if (!form.hidden) {
        if (!res && tdDay === null && days.length) $('.day', form).click();
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => $('[name=name]', form).focus({ preventScroll: true }), 300);
      }
    });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      let bad = null;
      $$('[required]', form).forEach(f => { const ok = f.value.trim() && f.checkValidity(); f.closest('.field').classList.toggle('invalid', !ok); if (!ok && !bad) bad = f; });
      if (bad) { bad.focus(); return toast('Vul uw naam en telefoonnummer in', 'info'); }
      const fd = new FormData(form);
      const when = res ? null : T('{day} om {time}', { day: dayLabel(days[tdDay]), time: fd.get('time') });
      const btn = $('[type=submit]', form);
      btn.disabled = true; btn.textContent = 'Versturen…';
      const ok = await send(res ? 'wachtlijst' : 'proefrit', { car: `${c.name} ${c.version}`, carId: c.id, when, name: fd.get('name'), phone: fd.get('phone') });
      if (!ok) { btn.disabled = false; btn.textContent = 'Opnieuw proberen'; return toast('Versturen lukte niet. Bel ons gerust.', 'info'); }
      form.innerHTML = `<div class="testdrive__done"><div class="done-icon">${icon('check')}</div><p><b>${esc(T('Bedankt, {name}!', { name: String(fd.get('name')).split(' ')[0] }))}</b><br>${res ? T('U staat op de wachtlijst. We bellen u zodra de wagen vrijkomt.') : esc(T('We verwachten u {when}. We bellen nog even om te bevestigen.', { when }))}</p></div>`;
    });

  }

  function openCar(id) {
    const c = byId(id);
    if (!c) return;
    closeAll();
    const modal = $('#carModal');
    modal.innerHTML = `<button class="modal__close" data-close aria-label="Sluiten">${icon('x')}</button><div class="cm" data-car-root>${carDetailHTML(c, 'modal')}</div>`;
    wireCarDetail($('[data-car-root]', modal), c);
    showDlg($('#carDialog'));
    modal.scrollTop = 0;
    remember(c.id);
  }

  /* ------------------------------------------------------------------
     Swiper: the photo follows the finger and the next photo slides in right beside it.
     Used in the car detail and in the full-screen viewer. Only three photos are loaded
     at a time: the one on screen and its two neighbours. It goes round: after the last
     photo comes the first one.
     ------------------------------------------------------------------ */
  function makeSwiper(stage, { photos, start = 0, alt = '', gap = 0, free = () => true, onChange = () => {}, onBad = () => {}, onDragY = null }) {
    const n = photos.length, wrap = i => ((i % n) + n) % n;
    const ac = new AbortController(), on = (type, fn, o) => stage.addEventListener(type, fn, { ...o, signal: ac.signal });
    const track = document.createElement('div');
    track.className = 'sw';
    let cur = wrap(start), offset = 0, moving = null, drag = null, dragged = false;
    let slots = [0, 1, 2].map(() => {
      const slide = document.createElement('div'), img = document.createElement('img');
      slide.className = 'sw__slide';
      img.draggable = false;
      img.addEventListener('load', () => { slide.style.backgroundImage = ''; });
      img.addEventListener('error', () => { slide.classList.add('is-bad'); if (slide === slots[1]) onBad(cur); });
      slide.appendChild(img);
      track.appendChild(slide);
      return slide;
    });
    stage.replaceChildren(track);
    const W = () => stage.clientWidth + gap;

    // Puts photo i in a slide, with its small version behind it until it has loaded
    function put(slide, i) {
      if (slide.dataset.i === String(i)) return;
      slide.dataset.i = i;
      slide.classList.remove('is-bad');
      slide.style.backgroundImage = `url("${imgAt(photos[i], 82)}")`;
      slide.firstChild.src = photos[i];
    }
    function layout() {
      slots.forEach((s, k) => {
        s.style.transform = `translate3d(calc(${k - 1} * (100% + ${gap}px)), 0, 0)`;
        s.setAttribute('aria-hidden', k !== 1);
        s.firstChild.alt = k === 1 ? alt : '';
      });
      put(slots[1], cur);
      if (n > 1) { put(slots[2], wrap(cur + 1)); put(slots[0], wrap(cur - 1)); }
    }
    function set(x, ms = 0) {
      offset = x;
      track.style.transition = ms ? `transform ${ms}ms cubic-bezier(.22, .78, .28, 1)` : 'none';
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    }
    // The movement is over: the photo that came in becomes the middle one
    function finish() {
      if (!moving) return;
      clearTimeout(moving.timer);
      const { dir, to } = moving;
      moving = null;
      if (dir) { if (dir > 0) slots.push(slots.shift()); else slots.unshift(slots.pop()); cur = to; }
      set(0);
      layout();
      if (slots[1].classList.contains('is-bad')) onBad(cur);
    }
    // Takes hold of photos that are still moving, without a jump
    function grab() {
      if (!moving) return offset;
      const x = new DOMMatrixReadOnly(getComputedStyle(track).transform).m41, nx = x + moving.dir * W();
      finish();
      set(nx);
      return nx;
    }
    function run(dir, to, ms) {
      if (dir) { put(slots[dir > 0 ? 2 : 0], to); onChange(to); }
      void track.offsetWidth;
      moving = { dir, to, timer: setTimeout(finish, ms + 60) };
      set(dir ? -dir * W() : 0, ms);
    }
    const glide = () => reduceMotion ? 0 : 460;
    function step(dir) { grab(); if (n > 1) run(dir, wrap(cur + dir), glide()); }
    function go(i, dir) {
      const x = grab(), to = wrap(i);
      if (n < 2 || to === cur) { if (x) run(0, cur, 240); return; }
      run(dir || (to > cur ? 1 : -1), to, glide());
    }
    function jump(i) { finish(); cur = wrap(i); set(0); layout(); onChange(cur); }
    function cancel() { if (!drag) return; const x = drag.mode === 'x'; drag = null; stage.classList.remove('is-drag'); if (x) run(0, cur, 200); }

    on('pointerdown', e => {
      if (drag || !e.isPrimary || (e.pointerType === 'mouse' && e.button) || !free() || e.target.closest('button, a')) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, mode: null, base: 0, pts: [[e.clientX, performance.now()]] };
      if (moving) { drag.base = grab(); hold(e); }
    });
    function hold(e) {
      drag.mode = 'x';
      stage.classList.add('is-drag');
      try { stage.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    }
    on('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.mode) {
        if (Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy)) { drag.x = e.clientX; hold(e); }
        else if (Math.abs(dy) > 8) drag.mode = 'y';
        else return;
      }
      if (drag.mode === 'y') { if (onDragY) onDragY(dy, 'move'); return; }
      const now = performance.now();
      drag.pts.push([e.clientX, now]);
      while (drag.pts.length > 2 && now - drag.pts[0][1] > 90) drag.pts.shift();
      const w = W(), x = drag.base + (e.clientX - drag.x);
      set(n < 2 ? x * .25 : Math.max(-w, Math.min(w, x)));
    });
    const release = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag, up = e.type === 'pointerup';
      drag = null;
      stage.classList.remove('is-drag');
      if (d.mode === 'y') { if (onDragY) onDragY(e.clientY - d.y, up ? 'end' : 'cancel'); return; }
      if (d.mode !== 'x') return;
      dragged = true;
      setTimeout(() => { dragged = false; }, 80);
      // A quick flick is enough; a slow drag has to pass a third of the photo
      const a = d.pts[0], b = d.pts[d.pts.length - 1], w = W();
      const v = b[1] > a[1] && performance.now() - b[1] < 80 ? (b[0] - a[0]) / (b[1] - a[1]) : 0;
      let dir = 0;
      if (up && n > 1) {
        if (Math.abs(v) > .3) dir = v < 0 && offset < 0 ? 1 : v > 0 && offset > 0 ? -1 : 0;
        else if (Math.abs(offset) > w * .32) dir = offset < 0 ? 1 : -1;
      }
      const rest = dir ? w - Math.abs(offset) : Math.abs(offset);
      const ms = reduceMotion ? 0 : Math.round(Math.max(180, Math.min(380, rest / Math.max(Math.abs(v), .8) * 1.2)));
      run(dir, dir ? wrap(cur + dir) : cur, ms);
    };
    on('pointerup', release);
    on('pointercancel', release);
    on('dragstart', e => e.preventDefault());
    track.addEventListener('transitionend', e => { if (e.target === track) finish(); });

    set(0);
    layout();
    return { step, go, jump, cancel, index: () => moving && moving.dir ? moving.to : cur, dragging: () => !!(drag && drag.mode), wasDragged: () => dragged, current: () => slots[1].firstChild, destroy: () => { clearTimeout(moving && moving.timer); moving = null; ac.abort(); stage.replaceChildren(); } };
  }

  /* ------------------------------------------------------------------
     Full-screen photo viewer: swipe or arrows, double-tap, pinch or wheel to zoom, swipe down to close
     ------------------------------------------------------------------ */
  const Lightbox = (() => {
    let dlg, stage, sw = null, total = 0;
    let sc = 1, x = 0, y = 0, g = null, lastTap = 0;
    const pts = new Map();
    function build() {
      dlg = document.createElement('dialog');
      dlg.className = 'lightbox';
      dlg.setAttribute('aria-label', "Foto's");
      dlg.innerHTML = `
        <div class="lb__top"><span class="lb__count" data-lb-count></span><span class="lb__title" data-lb-title></span><button class="lb__btn" type="button" data-lb-close aria-label="Sluiten">${icon('x')}</button></div>
        <div class="lb__stage" data-lb-stage></div>
        <button class="lb__nav lb__nav--prev" type="button" data-lb-go="-1" aria-label="Vorige foto">${icon('chev-l')}</button>
        <button class="lb__nav lb__nav--next" type="button" data-lb-go="1" aria-label="Volgende foto">${icon('chev-r')}</button>
        <div class="lb__thumbs" data-lb-thumbs></div>`;
      document.body.appendChild(dlg);
      stage = $('[data-lb-stage]', dlg);
      dlg.addEventListener('click', e => {
        if (e.target.closest('[data-lb-close]')) return dlg.close();
        const b = e.target.closest('[data-lb-go]'); if (b) { reset(); return sw.step(+b.dataset.lbGo); }
        const t = e.target.closest('[data-lb-i]'); if (t) { reset(); sw.go(+t.dataset.lbI); }
      });
      dlg.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        reset(); sw.step(e.key === 'ArrowRight' ? 1 : -1);
      });
      dlg.addEventListener('close', () => { if (!dlg.open) clean(); }); // this signal can come late, after the viewer was opened again
      stage.addEventListener('wheel', e => { e.preventDefault(); zoomAt(sc * Math.exp(-e.deltaY * 0.0022), e.clientX, e.clientY); }, { passive: false });
      stage.addEventListener('dblclick', e => toggleZoom(e.clientX, e.clientY));
      stage.addEventListener('pointerdown', down);
      stage.addEventListener('pointermove', move);
      stage.addEventListener('pointerup', up);
      stage.addEventListener('pointercancel', up);
    }
    const apply = () => { sw.current().style.transform = sc === 1 && !x && !y ? '' : `translate3d(${x}px, ${y}px, 0) scale(${sc})`; dlg.classList.toggle('is-zoomed', sc > 1.01); };
    const clean = () => { reset(); pts.clear(); g = null; if (sw) sw.destroy(); sw = null; };
    const reset = () => { sc = 1; x = 0; y = 0; dlg.style.removeProperty('--lb-a'); dlg.classList.remove('is-drag'); if (sw) apply(); };
    function clampPan() {
      const img = sw.current();
      const mx = Math.max(0, (img.offsetWidth * sc - stage.clientWidth) / 2), my = Math.max(0, (img.offsetHeight * sc - stage.clientHeight) / 2);
      x = Math.min(mx, Math.max(-mx, x)); y = Math.min(my, Math.max(-my, y));
    }
    function zoomAt(ns, cx, cy) {
      ns = Math.min(4, Math.max(1, ns));
      const r = stage.getBoundingClientRect();
      // keep the point under the finger in its place
      const ox = cx - (r.left + r.width / 2) - x, oy = cy - (r.top + r.height / 2) - y, k = ns / sc;
      x += ox * (1 - k); y += oy * (1 - k); sc = ns;
      if (sc === 1) { x = 0; y = 0; }
      clampPan(); apply();
    }
    const toggleZoom = (cx, cy) => zoomAt(sc > 1.01 ? 1 : 2.5, cx, cy);
    // Swipe down (not zoomed): the photo follows, the background fades, far enough closes the viewer
    function dragY(dy, phase) {
      if (sc > 1.01) return;
      const d = Math.max(0, dy);
      if (phase === 'move') {
        dlg.classList.add('is-drag');
        sw.current().style.transform = `translate3d(0, ${d}px, 0) scale(${1 - Math.min(.16, d / 2200)})`;
        dlg.style.setProperty('--lb-a', (.97 - Math.min(.62, d / 480)).toFixed(3));
      } else if (phase === 'end' && d > 110) dlg.close();
      else reset();
    }
    function down(e) {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        sw.cancel(); if (sc <= 1.01) reset();
        const [a, b] = [...pts.values()];
        g = { pinch: true, d: Math.hypot(a.x - b.x, a.y - b.y) || 1, s: sc };
        dlg.classList.add('is-drag');
      } else if (pts.size === 1) {
        g = { sx: e.clientX, sy: e.clientY, px: x, py: y, t: Date.now(), pan: sc > 1.01 };
        if (g.pan) { dlg.classList.add('is-drag'); try { stage.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ } }
      }
    }
    function move(e) {
      if (!g || !pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (g.pinch) {
        if (pts.size < 2) return;
        const [a, b] = [...pts.values()];
        zoomAt(g.s * Math.hypot(a.x - b.x, a.y - b.y) / g.d, (a.x + b.x) / 2, (a.y + b.y) / 2);
      } else if (g.pan) { x = g.px + e.clientX - g.sx; y = g.py + e.clientY - g.sy; clampPan(); apply(); }
    }
    function up(e) {
      if (!pts.delete(e.pointerId) || !g) return;
      if (!pts.size && (g.pinch || g.pan)) dlg.classList.remove('is-drag');
      if (g.pinch) { if (!pts.size) { g = null; if (sc < 1.06) reset(); } return; }
      const still = Math.hypot(e.clientX - g.sx, e.clientY - g.sy) < 10 && Date.now() - g.t < 300;
      g = null;
      if (!still || e.pointerType === 'mouse' || e.type !== 'pointerup') return;
      if (Date.now() - lastTap < 320) { lastTap = 0; toggleZoom(e.clientX, e.clientY); } else lastTap = Date.now();
    }
    function paint(i) {
      $('[data-lb-count]', dlg).textContent = `${i + 1} / ${total}`;
      $$('[data-lb-i]', dlg).forEach((t, k) => {
        t.setAttribute('aria-pressed', k === i);
        if (k === i) t.parentElement.scrollTo({ left: t.offsetLeft - t.parentElement.clientWidth / 2 + t.offsetWidth / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
    function open(photos, start = 0, title = '', onMove = null) {
      if (!dlg) build();
      total = photos.length;
      $('[data-lb-title]', dlg).textContent = title;
      dlg.classList.toggle('is-single', total < 2);
      $('[data-lb-thumbs]', dlg).innerHTML = total > 1 ? photos.map((src, k) => `<button type="button" class="lb__thumb" data-lb-i="${k}" aria-label="${esc(T('Foto {n}', { n: k + 1 }))}"><img src="${imgAt(src, 82)}" alt="" loading="lazy"></button>`).join('') : '';
      clean();
      showDlg(dlg);
      sw = makeSwiper(stage, { photos, start, alt: title, gap: 18, free: () => sc <= 1.01 && pts.size < 2, onChange: i => { paint(i); if (onMove) onMove(i); }, onDragY: dragY });
      reset();
      paint(start);
    }
    return { open, isOpen: () => !!dlg && dlg.open };
  })();

  /* ------------------------------------------------------------------
     A car's own page (wagen/<id>/): the same detail, full width, with a price bar on phones
     ------------------------------------------------------------------ */
  function initCarPage() {
    const root = $('#carPage');
    if (!root) return;
    const c = byId(document.body.dataset.car);
    if (!c) {
      if (!HAS_PAGES) return; // stock list not loaded (offline): keep the text that came with the page
      const newest = [...CARS].filter(x => x.status === 'available' && x.img).sort((a, b) => a.ago - b.ago).slice(0, 4);
      root.innerHTML = `<div class="sold"><p class="eyebrow">Verkocht</p><h1 class="h2">Deze wagen is <em>al verkocht.</em></h1><p>Goed nieuws voor de nieuwe eigenaar. Bekijk ons andere aanbod, of vraag ons naar een gelijkaardige wagen.</p><div class="btn-row"><a class="btn btn--primary" href="./#aanbod">Bekijk het aanbod ${icon('arrow', 'icon--arrow')}</a><a class="btn btn--outline" data-wa href="${waUrl(T('Hallo, ik zoek een wagen maar vind niet meteen wat ik zoek. Kunnen jullie me iets laten weten als er iets binnenkomt?'))}" target="_blank" rel="noopener">${icon('chat')}WhatsApp</a></div>${newest.length ? `<h2 class="sold__more">Net binnen</h2><div class="minis minis--4">${newest.map(x => miniHTML(x, 'page')).join('')}</div>` : ''}</div>`;
      return;
    }
    root.innerHTML = `<div class="cm cm--page" data-car-root>${carDetailHTML(c, 'page')}</div>`;
    wireCarDetail($('[data-car-root]', root), c);
    const crumb = $('[data-crumb-model]'); if (crumb) crumb.textContent = c.model;
    document.body.insertAdjacentHTML('beforeend', `
      <div class="car-bar" id="carBar">
        <div class="car-bar__txt"><b>${carPrice(c)}</b><small>${esc(c.name)}</small></div>
        <a class="btn btn--outline car-bar__call" href="tel:${S.phones.sales.tel}" aria-label="Bel verkoop">${icon('phone')}</a>
        <a class="btn btn--primary" target="_blank" rel="noopener" href="${waUrl(T('Hallo, ik heb interesse in de {car} ({year}, {price}).', { car: `${c.name} ${c.version}`, year: c.year, price: carPrice(c) }))}">${icon('chat')}WhatsApp</a>
      </div>`);
    remember(c.id);
  }

  /* ------------------------------------------------------------------
     Wizard (shared by booking + trade-in)
     ------------------------------------------------------------------ */
  function makeWizard(root, { validate, onEnter, onSubmit }) {
    const steps = $$('.step', root), bar = $('.wizard__bar span', root), label = $('[data-step-label]', root);
    const title = $('[data-step-title]', root), back = $('[data-back]', root), next = $('[data-next]', root), done = $('.wizard__done', root);
    let i = 0;
    function show(n) {
      i = n;
      steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
      bar.style.width = ((i + 1) / steps.length * 100) + '%';
      label.textContent = `Stap ${i + 1} van ${steps.length}`;
      title.textContent = steps[i].dataset.title;
      back.hidden = i === 0;
      next.innerHTML = i === steps.length - 1 ? `Bevestig ${icon('check')}` : `Volgende ${icon('arrow', 'icon--arrow')}`;
      onEnter && onEnter(i);
    }
    function fail(msg, el) {
      root.classList.remove('shake'); void root.offsetWidth; root.classList.add('shake');
      toast(msg, 'info');
      if (el) el.focus();
    }
    next.addEventListener('click', async () => {
      const step = steps[i];
      let bad = null;
      $$('[required]', step).forEach(f => {
        const ok = f.type === 'radio' ? !!$(`input[name="${f.name}"]:checked`, step) : f.value.trim() !== '' && f.checkValidity();
        const holder = f.closest('.field') || f.closest('.option-grid');
        holder && holder.classList.toggle('invalid', !ok);
        if (!ok && !bad) bad = f;
      });
      if (bad) return fail(bad.type === 'radio' ? 'Maak een keuze' : 'Vul de verplichte velden in', bad.type === 'radio' ? null : bad);
      const err = validate ? validate(i) : '';
      if (err) return fail(err);
      if (i < steps.length - 1) return show(i + 1);
      next.disabled = true; const old = next.innerHTML; next.textContent = 'Versturen…';
      const ok = await onSubmit();
      next.disabled = false; next.innerHTML = old;
      if (ok) { root.classList.add('wizard--done'); done.hidden = false; }
      else toast('Versturen lukte niet. Bel ons gerust.', 'info');
    });
    back.addEventListener('click', () => show(Math.max(0, i - 1)));
    root.addEventListener('input', e => { const h = e.target.closest('.field, .option-grid'); if (h) h.classList.remove('invalid'); });
    root.addEventListener('change', e => { const h = e.target.closest('.field, .option-grid'); if (h) h.classList.remove('invalid'); });
    function reset() {
      $('form', root).reset();
      root.classList.remove('wizard--done');
      done.hidden = true;
      $$('.invalid', root).forEach(f => f.classList.remove('invalid'));
      show(0);
    }
    show(0);
    return { show, reset, index: () => i };
  }

  /* ------------------------------------------------------------------
     Workshop booking
     ------------------------------------------------------------------ */
  const book = { day: null, slot: null, days: [], last: null };
  let bookWizard;
  function renderBookDays() {
    book.days = openDays('werkplaats', 12);
    $('#bookDays').innerHTML = book.days.map((d, i) => dayPill(d, i, i === book.day)).join('');
    renderSlots();
  }
  function renderSlots() {
    const box = $('#bookSlots');
    if (book.day === null) { box.innerHTML = '<p class="privacy">Kies eerst een dag.</p>'; $('#slotHint').textContent = ''; return; }
    const d = book.days[book.day], key = dateKey(d);
    const slots = slotsFor('werkplaats', d);
    const free = slots.filter(t => hash(key + t) % 100 >= 30).length;
    $('#slotHint').textContent = T('{free} van {n} vrij op {day}', { free, n: slots.length, day: dayLabel(d) });
    box.innerHTML = slots.map(t => { const busy = hash(key + t) % 100 < 30; return `<button type="button" class="slot" data-slot="${t}" aria-pressed="${book.slot === t}" ${busy ? 'disabled aria-label="' + t + ' volzet"' : ''}>${t}</button>`; }).join('');
  }
  function initBooking() {
    const root = $('#bookWizard');
    bookWizard = makeWizard(root, {
      validate(i) {
        if (i === 0 && !$$('input[name=svc]:checked', root).length && !$('[name=note]', root).value.trim()) return 'Kies minstens één dienst';
        if (i === 1 && (book.day === null || !book.slot)) return 'Kies een dag en een uur';
        return '';
      },
      onEnter(i) {
        if (i === 1 && !$('#bookDays').children.length) renderBookDays();
        if (i === 3) {
          const fd = new FormData($('form', root));
          const svcs = fd.getAll('svc');
          $('#bookSummary').innerHTML = `
            <div><span>Werken</span><b>${esc(svcs.join(', ') || 'Zie beschrijving')}</b></div>
            <div><span>Moment</span><b>${esc(dayLabel(book.days[book.day]))}, ${book.slot}</b></div>
            <div><span>Tijdens de werken</span><b>${esc(fd.get('mode'))}</b></div>
            <div><span>Wagen</span><b>${esc([plateLabel(fd.get('plate'), fd.get('plateCountry')), fd.get('model')].filter(Boolean).join(' · '))}</b></div>`;
        }
      },
      async onSubmit() {
        const fd = new FormData($('form', root));
        const data = { services: fd.getAll('svc'), note: fd.get('note'), date: dateKey(book.days[book.day]), time: book.slot, mode: fd.get('mode'), plate: fd.get('plate'), plateCountry: fd.get('plate') ? fd.get('plateCountry') : '', model: fd.get('model'), km: fd.get('km'), name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email') };
        const ok = await send('afspraak', data);
        if (ok) {
          book.last = data;
          $('[data-done-name]', root).textContent = ', ' + String(data.name).split(' ')[0];
          $('#bookDoneText').innerHTML = T('We verwachten u <b>{when}</b> voor {what}. We bevestigen binnen het uur per telefoon of sms.', {
            when: esc(T('{day} om {time}', { day: dayLabel(book.days[book.day]), time: book.slot })),
            what: esc(data.services.map(x => I18N.tr(x)).join(', ').toLowerCase() || T('uw afspraak')),
          });
        }
        return ok;
      },
    });
    $('#bookDays').addEventListener('click', e => {
      const b = e.target.closest('.day'); if (!b) return;
      book.day = +b.dataset.day; book.slot = null;
      $$('#bookDays .day').forEach(x => x.setAttribute('aria-pressed', x === b));
      renderSlots();
    });
    $('#bookSlots').addEventListener('click', e => {
      const b = e.target.closest('.slot'); if (!b || b.disabled) return;
      book.slot = b.dataset.slot;
      $$('#bookSlots .slot').forEach(x => x.setAttribute('aria-pressed', x === b));
    });
    $('#icsBtn').addEventListener('click', () => {
      const d = book.last; if (!d) return;
      const [y, m, dd] = d.date.split('-');
      const [hh, mm] = d.time.split(':').map(Number);
      const end = fromMin(hh * 60 + mm + 60).replace(':', '');
      const icsEsc = s => String(s).replace(/[\\,;]/g, c => '\\' + c).replace(/\n/g, '\\n');
      const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
      const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + icsEsc(S.name) + '//Afspraak//NL', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
        `UID:${Date.now()}@${location.hostname || 'site'}`, `DTSTAMP:${stamp}`,
        `DTSTART;TZID=Europe/Brussels:${y}${m}${dd}T${d.time.replace(':', '')}00`,
        `DTEND;TZID=Europe/Brussels:${y}${m}${dd}T${end}00`,
        `SUMMARY:${icsEsc(T('Afspraak werkplaats') + ' ' + S.name)}`,
        `LOCATION:${icsEsc(S.name + ', ' + fullAddress)}`,
        `DESCRIPTION:${icsEsc((d.services.join(', ') || 'Afspraak') + (d.model ? ' – ' + d.model : ''))}`,
        'END:VEVENT', 'END:VCALENDAR',
      ].join('\r\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
      a.download = 'afspraak-werkplaats.ics';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
  }
  function openBooking(services = [], pick = null) {
    closeAll();
    bookWizard.reset();
    book.day = pick ? pick.dayIndex : null; book.slot = pick ? pick.time : null;
    $('#bookDays').innerHTML = '';
    $$('#bookServices input').forEach(i => (i.checked = services.includes(i.value)));
    showDlg($('#bookingDialog'));
  }

  /* ------------------------------------------------------------------
     Trade-in
     ------------------------------------------------------------------ */
  let tradeWiz = null;
  function initTrade() {
    const root = $('#tradeWizard');
    const y = TODAY.getFullYear();
    $$('[data-years]', root).forEach(s => s.insertAdjacentHTML('beforeend', Array.from({ length: y - 1989 }, (_, i) => `<option>${y - i}</option>`).join('')));
    let photos = [];
    const thumbs = $('#photoThumbs');
    const drawThumbs = () => {
      thumbs.innerHTML = photos.map((p, i) => `<figure><img src="${p.url}" alt="Foto ${i + 1}"><button type="button" data-rm="${i}" aria-label="Verwijder foto">${icon('x')}</button></figure>`).join('');
    };
    const addFiles = files => {
      [...files].filter(f => f.type.startsWith('image/')).forEach(f => { if (photos.length < 8) photos.push({ file: f, url: URL.createObjectURL(f) }); });
      drawThumbs();
    };
    $('#photoInput').addEventListener('change', e => { addFiles(e.target.files); e.target.value = ''; });
    const dz = $('#dropZone');
    ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('drag'); }));
    dz.addEventListener('drop', e => addFiles(e.dataTransfer.files));
    thumbs.addEventListener('click', e => {
      const b = e.target.closest('[data-rm]'); if (!b) return;
      URL.revokeObjectURL(photos[+b.dataset.rm].url);
      photos.splice(+b.dataset.rm, 1); drawThumbs();
    });
    const wiz = tradeWiz = makeWizard(root, {
      async onSubmit() {
        const fd = new FormData($('form', root));
        const data = Object.fromEntries([...fd.entries()].filter(([k]) => k !== 'extras'));
        data.extras = fd.getAll('extras');
        data.photos = photos.length;
        if (!data.plate) delete data.plateCountry;
        const ok = await send('inruil', data);
        if (ok) $('[data-done-name]', root).textContent = ', ' + String(fd.get('name')).split(' ')[0];
        return ok;
      },
    });
    $('[data-restart]', root).addEventListener('click', () => { photos.forEach(p => URL.revokeObjectURL(p.url)); photos = []; drawThumbs(); wiz.reset(); });
  }

  /* ------------------------------------------------------------------
     Small inputs: plate, km
     ------------------------------------------------------------------ */
  // Country: [sign on the plate, example, ways of writing it (A = letter, 9 = digit, ? = either), look].
  // Where the writing is free, or the visitor types something else, the text stays as typed.
  const PLATES = {
    BE: ['B', '1-ABC-123', ['9-AAA-999', 'AAA-999', '999-AAA'], 'red'], NL: ['NL', 'AB-123-C', 'nl', 'yellow'], DE: ['D', 'M-AB 1234'], FR: ['F', 'AB-123-CD', ['AA-999-AA'], 'two'], LU: ['L', 'AB 1234', ['AA 9999'], 'yellow'], GB: ['UK', 'AB12 CDE', ['AA99 AAA'], 'flat yellow'],
    AT: ['A', 'W-12345 A'], BG: ['BG', 'CB 1234 AB', ['AA 9999 AA', 'A 9999 AA']], CY: ['CY', 'ABC 123', ['AAA 999']], CZ: ['CZ', '1AB 2345'], DK: ['DK', 'AB 12 345', ['AA 99 999']], EE: ['EST', '123 ABC', ['999 AAA']], ES: ['E', '1234 BCD', ['9999 AAA']], FI: ['FIN', 'ABC-123', ['AAA-999']], GR: ['GR', 'YHK-1234', ['AAA-9999']], HR: ['HR', 'ZG 1234-AB', ['AA 999-AA', 'AA 9999-AA', 'AA 9999-A']], HU: ['H', 'AA AB-123', ['AA AA-999', 'AAA-999']], IE: ['IRL', '241-D-12345', ['999-A-999999', '999-AA-999999', '99-A-999999', '99-AA-999999']], IT: ['I', 'AB 123 CD', ['AA 999 AA'], 'two'], LT: ['LT', 'ABC 123', ['AAA 999']], LV: ['LV', 'AB-1234', ['AA-9999']], MT: ['M', 'ABC 123', ['AAA 999']], PL: ['PL', 'WA 12345'], PT: ['P', 'AB-12-CD', ['AA-99-AA', '99-AA-99', '99-99-AA', 'AA-99-99']], RO: ['RO', 'B 123 ABC', ['A 99 AAA', 'AA 99 AAA', 'A 999 AAA']], SE: ['S', 'ABC 12D', ['AAA 99?']], SI: ['SLO', 'LJ AB-123'], SK: ['SK', 'AA123BB'],
    AD: ['AND', 'A1234', 0, 'flat'], AL: ['AL', 'AB 123 CD', ['AA 999 AA'], 'flat'], BA: ['BIH', 'A12-B-345', 0, 'flat'], CH: ['CH', 'ZH 123456', ['AA 999999'], 'flat'], IS: ['IS', 'AB 123', 0, 'flat'], LI: ['FL', 'FL 12345', ['AA 99999'], 'flat dark'], MC: ['MC', 'A123', 0, 'flat'], MD: ['MD', 'ABC 123', ['AAA 999'], 'flat'], ME: ['MNE', 'PG AB 123', 0, 'flat'], MK: ['NMK', 'SK 1234-AB', 0, 'flat'], NO: ['N', 'AB 12345', ['AA 99999'], 'flat'], RS: ['SRB', 'BG 1234-AB', 0, 'flat'], SM: ['RSM', 'A1234', 0, 'flat'], TR: ['TR', '34 ABC 123', 0, 'flat'], UA: ['UA', 'AA 1234 BB', ['AA 9999 AA'], 'flat'], XK: ['RKS', '01-123-AB', 0, 'flat'],
    XX: ['···', 'ABC 123', 0, 'flat'],
  };
  const NEAR = ['BE', 'NL', 'DE', 'FR', 'LU', 'GB'];
  const fitMask = (raw, mask) => {
    let out = '', k = 0;
    for (const m of mask) {
      if (k >= raw.length) break;
      if (m !== 'A' && m !== '9' && m !== '?') { out += m; continue; }
      const ok = m === 'A' ? /\p{L}/u.test(raw[k]) : m === '9' ? /\d/.test(raw[k]) : true;
      if (!ok) return null;
      out += raw[k++];
    }
    return k === raw.length ? out : null;
  };
  function plateText(v, cc) {
    const typed = v.toUpperCase().replace(/[^\p{L}\d\s-]/gu, '').replace(/\s+/g, ' ').replace(/-+/g, '-').replace(/^[\s-]+/, '');
    const raw = typed.replace(/[\s-]/g, ''), how = (PLATES[cc] || PLATES.XX)[2];
    // Dutch plates: six characters, a dash wherever letters and digits change (and four of a kind are split)
    if (how === 'nl') return raw.length === 6 ? raw.match(/\d+|\D+/g).map(g => g.length === 4 ? g.slice(0, 2) + '-' + g.slice(2) : g).join('-') : typed;
    for (const m of how || []) { const t = fitMask(raw, m); if (t != null) return t; }
    return typed;
  }
  function formatPlate(el) {
    const box = el.closest('[data-plate-box]'), sel = box && $('[data-plate-country]', box), v = el.value, t = plateText(v, sel ? sel.value : 'BE');
    if (t === v) return;
    const at = el.selectionStart, n = v.slice(0, at).replace(/[\s-]/g, '').length, end = at === v.length;
    el.value = t;
    if (document.activeElement !== el) return;
    let i = 0;
    if (end) i = t.length; else for (let c = 0; i < t.length && c < n; i++) if (!/[\s-]/.test(t[i])) c++;
    el.setSelectionRange(i, i);
  }
  // Gives the plate the look of the chosen country
  function dressPlate(box) {
    const sel = $('[data-plate-country]', box), el = $('[data-plate]', box), p = PLATES[sel.value] || PLATES.XX;
    box.className = ['plate', ...String(p[3] || '').split(' ').filter(Boolean).map(x => 'plate--' + x)].join(' ');
    $('[data-plate-code]', box).textContent = p[0];
    el.placeholder = p[1];
    if (el.value) formatPlate(el);
  }
  function initPlates() {
    let names = null;
    try { names = new Intl.DisplayNames([LOC], { type: 'region' }); } catch { /* old browser: show the sign of the country */ }
    const label = cc => { let n = ''; try { n = names ? names.of(cc) : ''; } catch { /* unknown to this browser */ } return n && n !== cc ? n : PLATES[cc][0]; };
    const opt = cc => `<option value="${cc}">${esc(label(cc))}${label(cc) !== PLATES[cc][0] ? ` (${PLATES[cc][0]})` : ''}</option>`;
    const rest = Object.keys(PLATES).filter(cc => cc !== 'XX' && !NEAR.includes(cc)).sort((a, b) => label(a).localeCompare(label(b), LOC));
    const html = `<optgroup label="${esc(T('Veel gekozen'))}">${NEAR.map(opt).join('')}</optgroup><optgroup label="${esc(T('Andere landen in Europa'))}">${rest.map(opt).join('')}<option value="XX">${esc(T('Ander land'))}</option></optgroup>`;
    $$('[data-plate-box]').forEach(box => {
      const sel = $('[data-plate-country]', box);
      sel.innerHTML = html;
      sel.value = 'BE';
      dressPlate(box);
      sel.addEventListener('change', () => dressPlate(box));
      const form = box.closest('form');
      if (form) form.addEventListener('reset', () => setTimeout(() => dressPlate(box)));
    });
  }
  // For the summary: the country is named when it is not a Belgian plate
  const plateLabel = (plate, cc) => plate ? (cc && cc !== 'BE' && PLATES[cc] && cc !== 'XX' ? PLATES[cc][0] + ' ' : '') + plate : '';

  function initInputs() {
    initPlates();
    document.addEventListener('input', e => {
      const el = e.target;
      if (el.matches('[data-plate]') && !e.isComposing) formatPlate(el);
      if (el.matches('input[name=km]')) {
        const digits = el.value.replace(/\D/g, '').slice(0, 7);
        el.value = digits ? nf.format(+digits) : '';
      }
    });
  }

  /* ------------------------------------------------------------------
     Season block
     ------------------------------------------------------------------ */
  // Sample report in the "werkplaats-check" section (an EV if we have one, it shows the battery test)
  function initReportCard() {
    const card = $('#reportCard');
    // An electric or plug-in car shows the battery test too
    const c = CARS.find(x => plugIn(x) && x.status === 'available' && x.km != null) || FEATURED;
    $('[data-r-name]', card).textContent = c.name;
    $('[data-r-meta]', card).textContent = [c.version, c.year, c.km != null ? km(c.km) : null].filter(Boolean).join(' · ');
    $('[data-r-list]', card).innerHTML = reportHTML(c) +
      (c.lez ? `<li class="report__ok"><span>LEZ Antwerpen en Gent</span><em>${icon('check')}Toegelaten</em></li>` : '');
    $('[data-r-open]', card).addEventListener('click', () => openCar(c.id));
  }

  /* ------------------------------------------------------------------
     Warranty, finance calculator, gauge, counters
     ------------------------------------------------------------------ */
  function initWarranty() {
    const notes = { 12: 'Altijd inbegrepen, bij elke wagen in ons aanbod.', 24: 'Een jaar extra, te kiezen bij aankoop. Vraag de prijs voor uw wagen.', 36: 'Drie jaar zonder zorgen. Vraag ons de voorwaarden.' };
    const box = $('.warranty');
    box.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', box).forEach(x => x.setAttribute('aria-pressed', x === b));
      $('#warrantyNote').textContent = notes[b.dataset.w];
    });
  }

  function initFinance() {
    const price = $('#fcPrice'), down = $('#fcDown');
    let term = 60;
    const upd = () => {
      down.max = Math.floor(+price.value * 0.5 / 250) * 250;
      if (+down.value > +down.max) down.value = down.max;
      setP(price); setP(down);
      const m = monthly(+price.value, +down.value, term);
      $('#fcPriceOut').textContent = eur(+price.value);
      $('#fcDownOut').textContent = eur(+down.value);
      $('#fcMonthly').textContent = eur(m);
      $('#fcFine').innerHTML = financeFine(+price.value, +down.value, term);
      const a = $('#fcApply');
      a.href = waUrl(T('Hallo, ik wil graag financiering aanvragen: wagen van {price}, voorschot {down}, {months} maanden (indicatief {m} per maand).', { price: eur(+price.value), down: eur(+down.value), months: term, m: eur(m) }));
      a.target = '_blank'; a.rel = 'noopener';
    };
    price.addEventListener('input', upd);
    down.addEventListener('input', upd);
    $('#fcTerm').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      term = +b.dataset.m;
      $$('#fcTerm button').forEach(x => x.setAttribute('aria-pressed', x === b));
      upd();
    });
    upd();
  }

  function countUp(el, to, decimals = 0, ms = 1400) {
    if (reduceMotion) { el.textContent = decimals ? dec(to, decimals) : nf.format(to); return; }
    const t0 = performance.now();
    const step = t => {
      const p = Math.min(1, (t - t0) / ms), v = to * (1 - Math.pow(1 - p, 3));
      el.textContent = decimals ? dec(v, decimals) : nf.format(Math.round(v));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function initObservers() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        io.unobserve(el);
        el.classList.add('in');
        if (el.style.transitionDelay) setTimeout(() => (el.style.transitionDelay = ''), 1400); // keep hovers snappy
        $$('[data-count-to]', el).forEach(c => countUp(c, +c.dataset.countTo, +(c.dataset.decimals || 0)));
      });
    }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  }

  /* ------------------------------------------------------------------
     Reviews marquee
     ------------------------------------------------------------------ */
  function initReviews() {
    const colors = ['#8a1e3b', '#2a2c30', '#5a5e66', '#8a1e3b', '#2a2c30', '#5a5e66'];
    const card = (r, i) => `
      <figure class="review">
        <span class="stars" aria-label="5 sterren">★★★★★</span>
        <p data-no-i18n lang="nl">“${esc(r.text)}”</p>
        <footer><span class="avatar" style="background:${colors[i % colors.length]}">${esc(r.name.split(/\s|&/).filter(Boolean).map(w => w[0]).join('').slice(0, 2))}</span><span><b>${esc(r.name)}</b><small>${esc(r.meta)}</small></span><span class="g" aria-hidden="true">G</span></footer>
      </figure>`;
    const R = window.REVIEWS;
    const fill = (track, list) => { const html = list.map(card).join(''); track.innerHTML = html + html; $$('.review', track).slice(list.length).forEach(n => n.setAttribute('aria-hidden', 'true')); };
    fill($('#marquee1 .marquee__track'), R);
    fill($('#marquee2 .marquee__track'), [...R].reverse());
  }

  /* ------------------------------------------------------------------
     Map: link out to Google Maps (no cookies until the visitor clicks)
     ------------------------------------------------------------------ */
  function initMap() {
    $('#openMap').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(S.name + ', ' + fullAddress)}`;
  }

  /* ------------------------------------------------------------------
     Small effects: footer wordmark fit, card glow, staggered reveals
     ------------------------------------------------------------------ */
  function initEffects() {
    // Size the big footer wordmark so the name fills the width exactly
    const mark = $('#footerMark');
    const fit = () => {
      mark.style.fontSize = '100px';
      const w = mark.offsetWidth, box = mark.parentElement.clientWidth;
      if (w) mark.style.fontSize = Math.min(260, 100 * box / w) + 'px';
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fit, 150); });

    // Soft light that follows the pointer on the dark cards
    $$('.spec-card').forEach(card => card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));

    // Cards in the same row come in one after the other
    $$('.reveal').forEach(el => {
      const sibs = [...el.parentElement.children].filter(x => x.classList.contains('reveal'));
      if (sibs.length > 1) el.style.transitionDelay = (sibs.indexOf(el) % 4) * 90 + 'ms';
    });
  }

  /* ------------------------------------------------------------------
     Global click handling
     ------------------------------------------------------------------ */
  function initGlobal() {
    document.addEventListener('click', e => {
      const t = e.target;
      let el;
      if ((el = t.closest('[data-fav]'))) { e.preventDefault(); return toggleFav(el.dataset.fav, el.classList.contains('fav-btn') ? el : null); }
      if ((el = t.closest('[data-compare]'))) { e.preventDefault(); return toggleCompare(el.dataset.compare); }
      if ((el = t.closest('[data-open]'))) {
        if (el.tagName === 'A' && (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1)) return;
        e.preventDefault(); return openCar(el.dataset.open);
      }
      if ((el = t.closest('[data-open-booking]'))) { e.preventDefault(); return openBooking(el.dataset.services ? el.dataset.services.split(',') : [], el.dataset.pickNext != null ? nextFreeSlot() : null); }
      if (PAGE === 'home' && (el = t.closest('[data-quick]'))) { e.preventDefault(); closeAll(); return applyQuick(el.dataset.quick); }
      if (t.closest('[data-reset]')) return resetFilters();
      if (t.closest('[data-open-favs]')) { renderFavs(); return showDlg($('#favDialog')); }
      if (t.closest('[data-open-menu]')) return showDlg($('#menuDialog'));
      if ((el = t.closest('[data-close]'))) return el.closest('dialog').close();
      if (t.closest('#menuDialog a[href^="#"]')) $('#menuDialog').close();
    });
    $$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));
    $('#openCompare').addEventListener('click', openCompare);
    $('#clearCompare').addEventListener('click', () => { cmp = []; syncCompare(); });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  bindSettings();
  renderHours();
  setInterval(renderHours, 60000);
  initHeader();
  initServices();
  if (PAGE === 'car') {
    initCarPage();
    initBooking();
    initInputs();
  } else {
    initInventory();
    initFeatured();
    initSeek();
    initDoors();
    initReportCard();
    initTeam();
    initBooking();
    initTrade();
    initInputs();
    initWarranty();
    initFinance();
    initReviews();
    initMap();
    initCardPhotos();
    renderRecent();
  }
  initGlobal();
  initEffects();
  syncFavs();
  syncCompare();
  initObservers();
  if (PAGE === 'home') {
    // Shared link to one car (…#wagen-<id>) opens that car straight away
    const fromHash = () => { const m = location.hash.match(/^#wagen-(.+)$/); if (m && byId(m[1])) openCar(m[1]); };
    addEventListener('hashchange', fromHash);
    fromHash();
  }

  /* ------------------------------------------------------------------
     A language change reloads the page: the visitor comes back at the same
     place, with the same filters and what was typed in the sell form
     ------------------------------------------------------------------ */
  const tradeFields = () => [...($('#tradeWizard form') || { elements: [] }).elements].filter(f => f.name && f.type !== 'file');
  if (PAGE === 'home') window.AT_KEEP = () => ({
    state: { ...state, quick: [...state.quick] }, showAll, brandsOpen, panel: !$('#filtersPanel').hidden, step: tradeWiz ? tradeWiz.index() : 0,
    fields: tradeFields().map(f => /^(radio|checkbox)$/.test(f.type) ? [f.name, f.value, f.checked] : [f.name, f.value]),
  });
  function restorePlace() {
    let keep = null;
    try { keep = JSON.parse(sessionStorage.getItem('at-keep')); sessionStorage.removeItem('at-keep'); } catch { /* private mode */ }
    const reveal = () => document.documentElement.classList.remove('i18n-wait');
    if (!keep || keep.page !== location.pathname || Date.now() - keep.t > 20000) return reveal();
    const m = PAGE === 'home' ? keep.more : null;
    if (m) {
      state = { ...blank(), ...m.state, quick: new Set(m.state.quick) };
      showAll = m.showAll; brandsOpen = m.brandsOpen;
      $('#filtersPanel').hidden = !m.panel;
      const tg = $('[aria-controls=filtersPanel]'); if (tg) tg.setAttribute('aria-expanded', m.panel);
      syncControls(); render();
      const list = tradeFields();
      m.fields.forEach(([name, value, checked]) => list.filter(f => f.name === name).forEach(f => {
        if (checked === undefined) f.value = value; else if (f.value === value) f.checked = checked;
      }));
      const box = $('#tradeWizard [data-plate-box]'); if (box) dressPlate(box);
      if (tradeWiz && m.step) tradeWiz.show(m.step);
    }
    const find = () => { let n = document.body; for (const i of keep.path) { n = n.children[i]; if (!n) return null; } return n.tagName === keep.tag ? n : null; };
    const go = () => {
      const el = find(), sec = keep.sec && document.getElementById(keep.sec);
      const y = keep.top ? 0 : el ? I18N.docTop(el) - keep.off : sec ? I18N.docTop(sec) - keep.secOff : keep.y;
      scrollTo({ top: Math.max(0, y), behavior: 'instant' });
    };
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    let moved = false;
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(t => addEventListener(t, () => { moved = true; }, { once: true, passive: true }));
    go();
    reveal();
    const again = () => { if (!moved) go(); document.documentElement.classList.remove('bar-down'); }; // fonts can still move things a little
    requestAnimationFrame(again);
    if (document.fonts) document.fonts.ready.then(again);
    setTimeout(again, 350);
    setTimeout(() => { if ('scrollRestoration' in history) history.scrollRestoration = 'auto'; }, 1500);
  }
  restorePlace();
})();
