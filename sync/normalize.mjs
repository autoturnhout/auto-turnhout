// Turns one 2dehands ad (title, ad text, price, labels, photos) into a car for the website.
// Everything the site shows comes from the ad itself; nothing is invented.

const BRANDS = [
  ['lynk & co', 'Lynk & Co'], ['land rover', 'Land Rover'], ['range rover', 'Land Rover'], ['mercedes-benz', 'Mercedes-Benz'],
  ['mercedes', 'Mercedes-Benz'], ['alfa romeo', 'Alfa Romeo'], ['vw', 'Volkswagen'], ['volkswagen', 'Volkswagen'],
  ['citroen', 'Citroën'], ['citroën', 'Citroën'], ['skoda', 'Škoda'], ['škoda', 'Škoda'], ['ssangyong', 'SsangYong'],
  ['bmw', 'BMW'], ['mini', 'Mini'], ['ds', 'DS'], ['mg', 'MG'], ['kia', 'Kia'], ['seat', 'Seat'], ['cupra', 'Cupra'],
];
// Words that belong to the model name rather than the engine/version
const MODEL_TAIL = ['cactus', 'picasso', 'grand', 'tour', 'tourer', 'sports', 'sport', 'combi', 'sw', 'touring', 'variant', 'cabrio',
  'gti', 'gtd', 'r', 'tcr', 'evoque', 'x', 'countryman', 'clubman', 'scenic', 'scénic', 'plus', 'cross', 'active'];
// Marketing words in his titles that are not part of the version
const NOISE = /\b(airco|navi|pano(?:ramadak| dak)?|leder|sensors?|camera|garantie|gekeurd|v(?:oor)?\.? ?verk(?:oop)?|al|blanco|export|facelift|pers(?:oons)?|benz|\+)\b/gi;

const FEATURES = [
  [/\bnavi/i, 'Navigatie'], [/\bpano/i, 'Panoramisch dak'], [/\bairco\b/i, 'Airco'], [/\bleder\b/i, 'Leder interieur'],
  [/sensors|parkeersensor/i, 'Parkeersensoren'], [/camera/i, 'Achteruitrijcamera'], [/cruise/i, 'Cruise control'],
  [/trekhaak/i, 'Trekhaak'], [/\b7 ?pers/i, '7 zitplaatsen'], [/matrix/i, 'Matrix-LED-koplampen'], [/akrapovic/i, 'Akrapovič-uitlaat'],
  [/carplay|android auto/i, 'Apple CarPlay / Android Auto'], [/airbump/i, 'Airbump-panelen'], [/stoelverwarming/i, 'Stoelverwarming'],
  [/btw ?auto|btw aftrekbaar/i, 'Btw aftrekbaar'],
];
const WORK = [
  [/distributie(?:riem)?\s+(?:recent\s+)?vervangen/i, 'Distributie vervangen'], [/gereviseerde motor|motor gereviseerd/i, 'Motor gereviseerd'],
  [/nieuwe banden/i, 'Nieuwe banden'], [/(?:nieuwe remmen|remmen vervangen)/i, 'Remmen vervangen'], [/groot onderhoud/i, 'Groot onderhoud gedaan'],
  [/koppeling vervangen|nieuwe koppeling/i, 'Koppeling vervangen'],
];

const cap = w => w.length <= 3 && /^[a-z]+$/i.test(w) && !/^(one|up)$/i.test(w) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1);
export const slug = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const num = v => { if (v == null || v === '') return null; if (typeof v === 'number') return v; const d = String(v).replace(/[^\d,]/g, '').replace(/,\d{1,2}$/, '').replace(/,/g, ''); return d ? +d : null; };
const text = v => Array.isArray(v) ? v.join(' ') : v == null ? '' : String(v);

export function parseTitle(title) {
  const clean = title.replace(/\b4 ?motion\b/gi, '4Motion').replace(/\s+\+.*$/, '').replace(/[\d.]+\s*km\b/gi, ' ').replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  const low = clean.toLowerCase();
  let brand = null, rest = clean;
  for (const [k, v] of BRANDS) if (low.startsWith(k + ' ')) { brand = v; rest = clean.slice(k.length).trim(); if (k === 'range rover') rest = 'Range Rover ' + rest; break; }
  if (!brand) { const [b, ...r] = clean.split(' '); brand = cap(b.toLowerCase()); rest = r.join(' '); }
  // A year is dropped, except right after the brand where it is a model name (Peugeot 2008, 3008, 5008)
  const words = rest.split(' ').filter(Boolean).filter((w, i) => i === 0 || !/^(19|20)\d{2}$/.test(w));
  const model = [words.shift()];
  // "Golf 8 R" -> "Golf R": skip a generation number when a model word follows
  if (/^(\d|i{1,3}|iv|v|vi{0,3})$/i.test(words[0] || '') && MODEL_TAIL.includes((words[1] || '').toLowerCase())) words.shift();
  while (words.length && (MODEL_TAIL.includes(words[0].toLowerCase()) || (model[0] === 'Range' && model.length < 3))) model.push(words.shift());
  const version = words.join(' ')
    .replace(/\b\d\s*pers(?:oons)?\b/gi, ' ')                 // "7 Pers" goes to the features
    .replace(/\beuro\s*\d[a-d]?(?:-temp)?\b/gi, ' ')            // emission norm has its own field
    .replace(/\bbtw\s*auto\b/gi, ' ')
    .replace(NOISE, ' ')
    .replace(/\b(automaat|manueel)\b/gi, ' ')
    .replace(/\b\d{2,3}\s*pk\b/gi, ' ')
    .replace(/\s+/g, ' ').trim();
  const fixCase = w => /^[a-z]/.test(w) ? cap(w) : w;
  return { brand, model: model.map(fixCase).join(' '), version };
}

function guessBody(s) {
  if (/cabrio/i.test(s)) return 'Cabrio';
  if (/jumper|transit|trafic|vivaro|boxer|ducato|bestel|lichte vracht/i.test(s)) return 'Bestelwagen';
  if (/\b7 ?pers|zafira|orlando|kangoo|scenic|scénic|5008|touran|berlingo|picasso|c-max|s-max/i.test(s)) return 'MPV';
  if (/break|sports? ?tourer|combi|grand ?tour|\bsw\b|touring|estate|variant|avant/i.test(s)) return 'Break';
  if (/\bsuv\b|tucson|tiguan|qashqai|\b[235]008\b|puma|mokka|kona|tivoli|evoque|cayenne|macan|\bq[2-8]\b|\bx[1-7]\b|countryman|500x|grandland|crossland|captur|kuga|sportage|niro|01\b|c-hr|rav4|xc[469]0|t-roc|t-cross|karoq|kodiaq|ateca|arona/i.test(s)) return 'SUV';
  if (/sedan|berline|\b508\b|c5\b|passat\b|\b3-?serie|a4\b|a6\b/i.test(s)) return 'Sedan';
  return 'Hatchback';
}
function guessFuel(s) {
  if (/plug-?in|phev|e-hybrid|tfsi-?e/i.test(s)) return 'Plug-in hybride';
  if (/elektri|e-up|\bev\b|kwh/i.test(s)) return 'Elektrisch';
  if (/hybri/i.test(s)) return 'Hybride';
  if (/diesel|crdi|tdi|hdi|cdti|dci|jtd|\b\d\.\dd\b|\bd\b(?= |$)/i.test(s)) return 'Diesel';
  return 'Benzine';
}
const FUEL_WORDS = { benzine: 'Benzine', diesel: 'Diesel', elektrisch: 'Elektrisch', hybride: 'Hybride', 'plug-in hybride': 'Plug-in hybride', lpg: 'LPG' };

// item: generic listing (see config.json "fields"); prev: the same car from the previous stock.json (keeps a price when the ad hides it)
export function toCar(item, prev = {}) {
  const title = text(item.title).trim();
  const desc = text(item.description).replace(/\r/g, '').trim();
  const labels = (Array.isArray(item.labels) ? item.labels : text(item.labels).split(/[|,]/)).map(s => String(s).trim()).filter(Boolean);
  const all = `${title}\n${desc}\n${labels.join(' ')}`;
  const t = parseTitle(title);
  const priceTxt = text(item.priceText || (typeof item.price === 'string' ? item.price : ''));
  const sold = /verkocht/i.test(priceTxt) || labels.some(l => /verkocht/i.test(l));
  const status = /export|inname auto voor export/i.test(`${title} ${labels.join(' ')}`) || /voor export of opmaak/i.test(desc) ? 'export'
    : /gereserveerd/i.test(`${priceTxt} ${labels.join(' ')}`) ? 'reserved' : 'available';
  let price = num(typeof item.price === 'number' ? item.price : /\d/.test(priceTxt) ? priceTxt : item.price);
  if (price == null && prev.price != null) price = prev.price;          // 2dehands shows "Gereserveerd" instead of the price
  const km = num(item.km) ?? num((all.match(/([\d.]{3,})\s*km\b/i) || [])[1]);
  const year = num(item.year) ?? num((title.match(/\b(19|20)\d{2}\b/) || desc.match(/bouwjaar (\d{4})/i) || [])[0]);
  let fuelAttr = FUEL_WORDS[text(item.fuel).toLowerCase()];
  if (fuelAttr === 'Hybride' && /plug-?in|phev|e-hybrid|tfsi-?e/i.test(`${title} ${desc.slice(0, 300)}`)) fuelAttr = 'Plug-in hybride';
  const hp = num((all.match(/(\d{2,3})\s*pk\b/i) || [])[1]) ?? num(item.hp);   // his own "81 pk" wins over a kW conversion
  // Model: the official model name, unless his title is more precise ("Golf" -> "Golf GTI", "Astra" -> "Astra Cabrio", "1" -> "01")
  // Brand: when his title has a longer known brand ("Lynk & Co" vs "Lynk"), the title wins, and its model too
  const lb = text(item.brand);
  const titleBrandWins = !lb || (BRANDS.some(([, v]) => v === t.brand) && t.brand.toLowerCase().startsWith(lb.toLowerCase()) && t.brand.length > lb.length);
  const brand = titleBrandWins ? t.brand : (BRANDS.find(([k]) => k === lb.toLowerCase()) || [0, cap(lb)])[1];
  const lm = titleBrandWins ? '' : text(item.model).replace(/ë/g, 'e');
  const model = !lm ? t.model
    : (t.model.toLowerCase().startsWith(lm.toLowerCase()) || (/^\d+$/.test(lm) && +t.model === +lm)) ? t.model : lm;
  // Body type as he chose it on 2dehands, but known SUV models count as SUV
  const sellerBody = text(item.body);
  const body = guessBody(title) === 'SUV' && /^(Hatchback|Break|MPV|)$/.test(sellerBody) ? 'SUV' : sellerBody || prev.body || guessBody(all);
  const points = num((desc.match(/gecontroleerd op (\d+) punten/i) || [])[1]);
  const images = (Array.isArray(item.images) ? item.images : item.images ? [item.images] : []).map(String).filter(u => /^https?:\/\//.test(u));
  const idBase = item.id ? `${slug(`${t.brand} ${t.model} ${year || ''}`)}-${slug(item.id)}` : slug(`${t.brand} ${t.model} ${t.version} ${year || ''}`);
  const features = [];
  for (const [re, label] of FEATURES) if (re.test(`${title} ${labels.join(' ')}`) && !features.includes(label)) features.push(label);
  for (const o of item.options || []) if (o && !features.some(f => f.toLowerCase() === String(o).toLowerCase())) features.push(String(o));
  const work = [];
  for (const [re, label] of WORK) if (re.test(desc) && !work.includes(label)) work.push(label);
  const date = text(item.date).match(/\d{4}-\d{2}-\d{2}/);

  return {
    id: prev.id || idBase,
    brand,
    model,
    version: t.version || prev.version || '',
    year, km, price, hp,
    fuel: fuelAttr || guessFuel(all),
    gearbox: /automaat|automatic|dsg|steptronic|\bedc\b|\beat\d?\b|\bcvt\b|tiptronic|s tronic|pdk/i.test(`${title} ${text(item.gearbox)} ${labels.join(' ')} ${desc.slice(0, 200)}`) ? 'Automaat' : 'Manueel',
    body,
    doors: num(item.doors) ?? prev.doors ?? null,
    color: text(item.color) || prev.color || null,
    euro: (all.match(/euro ?([4-6][a-d]?(?:-temp)?)/i) || [])[1] ? 'Euro ' + all.match(/euro ?([4-6][a-d]?(?:-temp)?)/i)[1] : prev.euro || null,
    lez: status !== 'export' && /alle (?:milieu|emissie)[\s/]*(?:emissie)?\s*zones|toegelaten in alle emissie|lez/i.test(all),
    carpass: status !== 'export',
    warranty: status === 'export' ? 0 : 12,
    status, sold,
    added: date ? date[0] : prev.added || new Date().toISOString().slice(0, 10),
    inspectionPoints: status !== 'export' ? points : null,
    firstOwner: /eerste eigenaar/i.test(desc),
    dealerMaintained: /dealer onderhouden/i.test(all),
    work,
    features,
    img: images[0] || prev.img || null,
    images: images.length ? images : prev.images || undefined,
    url: text(item.url) || prev.url || null,
    carPassUrl: text(item.carPassUrl) || prev.carPassUrl || null,
    description: desc || prev.description || null,
    featured: prev.featured || undefined,
    check: prev.check || undefined,
  };
}
