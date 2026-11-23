/* ==========================================================================
   INSTELLINGEN: pas hier uw eigen gegevens aan.
   Alles op de site (naam, telefoon, adres, uren, WhatsApp) leest uit dit blok.
   ========================================================================== */
window.SITE = {
  demo: true,                         // true = toont de balk "nieuw ontwerp, voorbeeldversie" bovenaan. Zet op false bij livegang.

  name: 'Auto Turnhout',              // naam zoals klanten hem kennen
  legalName: 'Auto Turnhout VOF',     // juridische naam (footer)
  monogram: 'AT',                     // letters in het kleine icoon van het browsertabblad (de site zelf toont alleen de naam)
  tagline: 'Occasions en werkplaats',
  region: 'de Kempen',
  yearsActive: 20,

  address: { street: 'Beyntellus 9', zip: '2360', city: 'Oud-Turnhout', country: 'BE' },
  phones: {
    sales:    { label: '0483 63 54 78', tel: '+32483635478' },   // verkoop
    workshop: { label: '0493 29 18 27', tel: '+32493291827' },   // werkplaats
  },
  whatsapp: '32483635478',            // internationaal formaat zonder +
  email: 'info@autoturnhout.be',
  vat: 'BE 0769.277.504',
  register: 'RPR Antwerpen, afdeling Turnhout',
  social: { facebook: '#', instagram: '#' },   // vul de echte links in
  languages: 'We spreken Nederlands, Frans en Engels. Nous parlons français. We speak English.',
  rentalPartner: 'Enterprise Rent-A-Car',

  // Openingsuren: 0 = zondag, 1 = maandag ... 6 = zaterdag. Weglaten = gesloten.
  hours: {
    showroom:   { 1: ['09:00', '17:00'], 2: ['09:00', '17:00'], 3: ['09:00', '17:00'], 4: ['09:00', '17:00'], 5: ['09:00', '17:00'], 6: ['10:00', '15:00'] },
    werkplaats: { 1: ['09:00', '18:00'], 2: ['09:00', '18:00'], 3: ['09:00', '18:00'], 4: ['09:00', '18:00'], 5: ['09:00', '18:00'] },
  },

  google: { rating: 4.0, count: 136, url: 'https://www.google.com/maps/place/Auto+Turnhout+v.o.f./' },

  // Financiering. apr = JKP van uw kredietpartner (NOG TE BEVESTIGEN, dit is een voorbeeldwaarde).
  // showMonthly: false = bij de wagens staat "maandbedrag op aanvraag" (zoals nu); true = indicatief maandbedrag tonen.
  finance: { apr: 6.49, term: 60, showMonthly: false },

  // Formulieren: vul een endpoint in (bv. Formspree, Make, eigen server) om aanvragen echt te ontvangen.
  // Leeg = demo: het formulier toont enkel de bevestiging.
  formEndpoint: '',
};

/* ==========================================================================
   VOORRAAD van Auto Turnhout (overgenomen van de huidige site, november 2026).
   status: 'available' | 'reserved' | 'export'.  km of hp null = onbekend (wordt niet getoond).
   added: datum online. Volgorde klopt met de huidige site, de exacte data zijn geschat tot de koppeling met de feed er is.
   img: eerste foto; photos: aantal foto's (bestandsnaam eindigt op -1, -2, ...).
   featured: true = wagen van de week bovenaan.
   check: optioneel, eigen meetwaarden voor het checkrapport, bv. { brakesFront: 80, brakesRear: 75, tyres: 6.5 }.
   Later koppelen aan de voorraad (2dehands-feed) in plaats van met de hand bij te houden.
   ========================================================================== */
const AT = 'https://autoturnhout.miguelcruz.eu/wp-content/uploads/';
window.CARS = [
  { id: 'volkswagen-golf-8-r-2021', brand: 'Volkswagen', model: 'Golf R', version: '2.0 TSI 4Motion DSG Black Style', year: 2021, km: 73636, fuel: 'Benzine', gearbox: 'Automaat', price: 35950, hp: null, body: 'Hatchback', doors: 5, color: 'Zwart', euro: 'Euro 6', lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-11-07', featured: true,
    img: AT + '2026/11/vw-golf-8-r-2021-2358-1.webp', photos: 6,
    features: ['Panoramisch dak', 'Akrapovič-uitlaat', 'Black Style-pakket'] },
  { id: 'citroen-c3-1-2-benzine-2019', brand: 'Citroën', model: 'C3', version: '1.2 benzine', year: 2019, km: 107000, fuel: 'Benzine', gearbox: 'Manueel', price: 6950, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-11-06',
    img: AT + '2026/11/citroen-c3-1-2-benzine-2019-1-1.webp', photos: 6,
    features: [] },
  { id: 'land-rover-range-rover-evoque-2-0d-euro-2015', brand: 'Land Rover', model: 'Range Rover Evoque', version: '2.0d Euro 6b', year: 2015, km: 218000, fuel: 'Diesel', gearbox: 'Manueel', price: 6500, hp: null, body: 'SUV', doors: 5, color: null, euro: null, lez: false, carpass: false, warranty: 0, status: 'export', added: '2026-11-05',
    img: AT + '2026/11/land-rover-range-rover-evoque-2-0d-euro-2015-1.webp', photos: 6,
    features: [] },
  { id: 'ford-fiesta-1-0-ecoboost-2014', brand: 'Ford', model: 'Fiesta', version: '1.0 EcoBoost', year: 2014, km: 128000, fuel: 'Benzine', gearbox: 'Automaat', price: 7450, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-11-04',
    img: AT + '2026/11/ford-fiesta-1-0-ecoboost-2014-1.webp', photos: 6,
    features: ['Leder interieur'] },
  { id: 'volkswagen-golf-gti-2-0-2021', brand: 'Volkswagen', model: 'Golf GTI', version: '2.0 TSI DSG', year: 2021, km: 109117, fuel: 'Benzine', gearbox: 'Automaat', price: 25950, hp: 302, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-11-03',
    img: AT + '2026/11/volkswagen-golf-gti-2-0-2021-1-1.webp', photos: 6,
    features: ['Panoramisch dak', 'Matrix-LED-koplampen'] },
  { id: 'kia-ceed-1-5-t-gdi-2024', brand: 'Kia', model: 'Ceed', version: '1.5 T-GDi GT-Line', year: 2024, km: 31852, fuel: 'Benzine', gearbox: 'Automaat', price: 24950, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-11-02',
    img: AT + '2026/11/kia-ceed-1-5-t-gdi-2024-1938-1.webp', photos: 6,
    features: ['Panoramisch dak'] },
  { id: 'lynk-co-01-plug-in-hybrid-2024', brand: 'Lynk & Co', model: '01', version: '1.5 Plug-in Hybrid', year: 2024, km: 16464, fuel: 'Plug-in hybride', gearbox: 'Automaat', price: 24950, hp: null, body: 'SUV', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'reserved', added: '2026-11-01',
    img: AT + '2026/11/lynk-co-01-2024-6025-1.webp', photos: 6,
    features: ['Panoramisch dak'] },
  { id: 'dacia-sandero-1-2-tce-2015', brand: 'Dacia', model: 'Sandero', version: '1.2 TCe', year: 2015, km: 99000, fuel: 'Benzine', gearbox: 'Manueel', price: 4450, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-10-31',
    img: AT + '2026/11/dacia-sandero-1-2-tce-2015-0500-1.webp', photos: 6,
    features: [] },
  { id: 'renault-kangoo-1-2i-5-2007', brand: 'Renault', model: 'Kangoo', version: '1.2i, 5 zitplaatsen', year: 2007, km: 224000, fuel: 'Benzine', gearbox: 'Manueel', price: 3450, hp: null, body: 'MPV', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-10-30',
    img: AT + '2026/11/renault-kangoo-1-2i-5-2007-1624-1.webp', photos: 6,
    features: [] },
  { id: 'peugeot-2008-1-2i-blue-2017', brand: 'Peugeot', model: '2008', version: '1.2 Blue Lion', year: 2017, km: 96000, fuel: 'Benzine', gearbox: 'Automaat', price: 7450, hp: null, body: 'SUV', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'reserved', added: '2026-10-29',
    img: AT + '2026/11/peugeot-2008-1-2i-blue-2017-3202-1.webp', photos: 6,
    features: ['Navigatie'] },
  { id: 'citroen-citroen-c4-cactus-2015', brand: 'Citroën', model: 'C4 Cactus', version: '1.2i', year: 2015, km: 209000, fuel: 'Benzine', gearbox: 'Manueel', price: 4950, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'reserved', added: '2026-10-28',
    img: AT + '2026/11/citroen-c4-cactus-1-2i-2015-4250-1.webp', photos: 6,
    features: ['Navigatie', 'Airbump-panelen'] },
  { id: 'opel-zafira-1-4i-7-2017', brand: 'Opel', model: 'Zafira', version: '1.4i, 7 zitplaatsen', year: 2017, km: 105000, fuel: 'Benzine', gearbox: 'Manueel', price: 10950, hp: null, body: 'MPV', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-10-27',
    img: AT + '2026/11/opel-zafira-1-4i-7-2017-1096-1.webp', photos: 6,
    features: ['Navigatie', '7 zitplaatsen', 'Facelift-model'] },
  { id: 'audi-q8-60-tfsi-e-2025', brand: 'Audi', model: 'Q8 Sportback', version: '60 TFSI e quattro S competition', year: 2025, km: null, fuel: 'Plug-in hybride', gearbox: 'Automaat', price: 100000, hp: null, body: 'SUV', doors: 5, color: 'Zilver of grijs', euro: 'Euro 6', lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-10-26',
    img: AT + '2026/11/audi-q8-60-tfsi-e-2025-4690-1.webp', photos: 6,
    features: ['S competition-pakket'] },
  { id: 'bmw-120i-m-pack-sport-2025', brand: 'BMW', model: '120i', version: 'M Sport, automaat', year: 2025, km: 10177, fuel: 'Benzine', gearbox: 'Automaat', price: 29950, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-10-23',
    img: AT + '2026/11/bmw-120i-m-pack-sport-2025-0450-1.webp', photos: 6,
    features: ['M Sportpakket'] },
  { id: 'seat-ibiza-1-0-tsi-2025', brand: 'Seat', model: 'Ibiza', version: '1.0 TSI FR Pro Black, DSG', year: 2025, km: 2867, fuel: 'Benzine', gearbox: 'Automaat', price: 24450, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-10-20',
    img: AT + '2026/11/seat-ibiza-1-0-tsi-2025-8705-1.webp', photos: 6,
    features: ['Panoramisch dak', 'FR Pro Black-pakket'] },
  { id: 'volkswagen-polo-1-0-tsi-2024', brand: 'Volkswagen', model: 'Polo', version: '1.0 TSI R-Line, DSG', year: 2024, km: 49643, fuel: 'Benzine', gearbox: 'Automaat', price: 22450, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-10-17',
    img: AT + '2026/11/vw-polo-1-0-tsi-2024-8532-1.webp', photos: 6,
    features: [] },
  { id: 'kia-picanto-1-0-gdi-2023', brand: 'Kia', model: 'Picanto', version: '1.0 GDi', year: 2023, km: 97000, fuel: 'Benzine', gearbox: 'Automaat', price: 10950, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-10-14',
    img: AT + '2026/11/kia-picanto-1-0-gdi-2023-6664-1.webp', photos: 6,
    features: [] },
  { id: 'opel-astra-1-5-turbo-2023', brand: 'Opel', model: 'Astra', version: '1.5 Turbo GS Line', year: 2023, km: 56000, fuel: 'Diesel', gearbox: 'Automaat', price: 20950, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-10-11',
    img: AT + '2026/11/opel-astra-1-5-turbo-2023-2545-1.webp', photos: 6,
    features: ['Panoramisch dak'] },
  { id: 'renault-megane-grand-tour-2023', brand: 'Renault', model: 'Mégane Grand Tour', version: '1.3 TCe', year: 2023, km: 81000, fuel: 'Benzine', gearbox: 'Manueel', price: 12950, hp: null, body: 'Break', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-10-08',
    img: AT + '2026/11/renault-megane-grand-tour-2023-5811-1.webp', photos: 6,
    features: [] },
  { id: 'fiat-500x-1-3i-automaat-2022', brand: 'Fiat', model: '500X', version: '1.3i', year: 2022, km: 8497, fuel: 'Benzine', gearbox: 'Automaat', price: 18950, hp: null, body: 'SUV', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-10-05',
    img: AT + '2026/11/fiat-500x-1-3i-automaat-2022-0036-1.webp', photos: 6,
    features: ['Panoramisch dak'] },
  { id: 'peugeot-508-1-2-pure-2022', brand: 'Peugeot', model: '508', version: '1.2 PureTech GT', year: 2022, km: 96000, fuel: 'Benzine', gearbox: 'Automaat', price: 17950, hp: null, body: 'Sedan', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-10-02',
    img: AT + '2026/11/peugeot-508-1-2-pure-2022-7868-1.webp', photos: 6,
    features: ['Navigatie'] },
  { id: 'peugeot-208-1-2i-active-2022', brand: 'Peugeot', model: '208', version: '1.2i Active Pack', year: 2022, km: 91000, fuel: 'Benzine', gearbox: 'Manueel', price: 9450, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-09-29',
    img: AT + '2026/11/peugeot-208-1-2i-active-2022-5024-1.webp', photos: 6,
    features: ['Navigatie'] },
  { id: 'skoda-superb-combi-1-5-2022', brand: 'Škoda', model: 'Superb Combi', version: '1.5 TSI Sportline, DSG', year: 2022, km: 130472, fuel: 'Benzine', gearbox: 'Automaat', price: 21950, hp: null, body: 'Break', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-09-26',
    img: AT + '2026/11/skoda-superb-combi-1-5-2022-2342-1.webp', photos: 6,
    features: [] },
  { id: 'volkswagen-polo-1-0-tsi-2022', brand: 'Volkswagen', model: 'Polo', version: '1.0 TSI Life', year: 2022, km: 77715, fuel: 'Benzine', gearbox: 'Manueel', price: 13950, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-09-23',
    img: AT + '2026/11/vw-polo-1-0-tsi-2022-1508-1.webp', photos: 6,
    features: ['Navigatie'] },
  { id: 'ford-puma-1-0-ecoboost-2021', brand: 'Ford', model: 'Puma', version: '1.0 EcoBoost Hybrid ST-Line', year: 2021, km: 113000, fuel: 'Hybride', gearbox: 'Automaat', price: 16950, hp: null, body: 'SUV', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'reserved', added: '2026-09-20',
    img: AT + '2026/11/ford-puma-1-0-ecoboost-2021-1472-1.webp', photos: 6,
    features: [] },
  { id: 'mini-one-1-5i-benz-2021', brand: 'Mini', model: 'One', version: '1.5i', year: 2021, km: 71811, fuel: 'Benzine', gearbox: 'Manueel', price: 13950, hp: null, body: 'Hatchback', doors: null, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-09-17',
    img: AT + '2026/11/mini-one-1-5i-benz-2021-7811-1.webp', photos: 6,
    features: ['Navigatie'] },
  { id: 'opel-grandland-x-1-6i-2021', brand: 'Opel', model: 'Grandland X', version: '1.6i Ultimate', year: 2021, km: 111539, fuel: 'Benzine', gearbox: 'Automaat', price: 14950, hp: 180, body: 'SUV', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-09-14',
    img: AT + '2026/11/opel-grandland-x-1-6i-2021-0150-1.webp', photos: 6,
    features: [] },
  { id: 'mini-countryman-one-d-2020', brand: 'Mini', model: 'Countryman', version: 'One D 1.5', year: 2020, km: 185000, fuel: 'Diesel', gearbox: 'Manueel', price: 9950, hp: null, body: 'SUV', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-09-11',
    img: AT + '2026/11/mini-countryman-one-d-2020-2240-1.webp', photos: 6,
    features: ['Navigatie'] },
  { id: 'peugeot-208-1-2-gt-2020', brand: 'Peugeot', model: '208', version: '1.2 GT Line', year: 2020, km: 146000, fuel: 'Benzine', gearbox: 'Manueel', price: 7950, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-09-08',
    img: AT + '2026/11/peugeot-208-1-2-gt-2020-5567-1.webp', photos: 6,
    features: [] },
  { id: 'volkswagen-golf-gti-tcr-2019', brand: 'Volkswagen', model: 'Golf GTI TCR', version: '2.0 TSI DSG', year: 2019, km: 86665, fuel: 'Benzine', gearbox: 'Automaat', price: 27450, hp: 290, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'reserved', added: '2026-09-05',
    img: AT + '2026/11/vw-golf-gti-tcr-2019-0845-1.webp', photos: 6,
    features: ['Panoramisch dak'] },
  { id: 'citroen-citroen-jumper-2-0-2018', brand: 'Citroën', model: 'Jumper', version: '2.0 BlueHDi L2H2 dubbele cabine', year: 2018, km: 296000, fuel: 'Diesel', gearbox: 'Manueel', price: 7450, hp: null, body: 'Bestelwagen', doors: 4, color: null, euro: null, lez: false, carpass: false, warranty: 0, status: 'export', added: '2026-09-02',
    img: AT + '2026/11/citroen-jumper-2-0-blue-2018-9861-1.webp', photos: 6,
    features: ['7 zitplaatsen', 'Dubbele cabine'] },
  { id: 'hyundai-tucson-1-7-crdi-2018', brand: 'Hyundai', model: 'Tucson', version: '1.7 CRDi', year: 2018, km: 162000, fuel: 'Diesel', gearbox: 'Automaat', price: 15950, hp: null, body: 'SUV', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-08-30',
    img: AT + '2026/11/hyundai-tucson-1-7-crdi-2018-1050-1.webp', photos: 6,
    features: ['Navigatie', 'Panoramisch dak'] },
  { id: 'volkswagen-e-up-elektrisch-81-2018', brand: 'Volkswagen', model: 'e-up!', version: 'Highline', year: 2018, km: 16091, fuel: 'Elektrisch', gearbox: 'Automaat', price: 10950, hp: 81, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-08-27',
    img: AT + '2026/11/vw-e-up-elektrisch-81-2018-5305-1.webp', photos: 6,
    features: [] },
  { id: 'ssangyong-tivoli-1-6d-2017', brand: 'SsangYong', model: 'Tivoli', version: '1.6d', year: 2017, km: 191000, fuel: 'Diesel', gearbox: 'Manueel', price: 3450, hp: null, body: 'SUV', doors: 5, color: null, euro: null, lez: false, carpass: false, warranty: 0, status: 'export', added: '2026-08-24',
    img: AT + '2026/11/ssangyong-tivoli-1-6d-2017-4937-1.webp', photos: 6,
    features: [] },
  { id: 'porsche-cayenne-3-0-v6-2015', brand: 'Porsche', model: 'Cayenne', version: 'S E-Hybrid 3.0 V6', year: 2015, km: 188000, fuel: 'Plug-in hybride', gearbox: 'Automaat', price: 25950, hp: 520, body: 'SUV', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-08-21',
    img: AT + '2026/11/porsche-cayenne-3-0-v6-2015-5340-1.webp', photos: 6,
    features: ['Stage 2-software'] },
  { id: 'volkswagen-tiguan-1-4-tsi-2015', brand: 'Volkswagen', model: 'Tiguan', version: '1.4 TSI R-Line', year: 2015, km: 130000, fuel: 'Benzine', gearbox: 'Manueel', price: 12450, hp: null, body: 'SUV', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-08-18',
    img: AT + '2026/11/volkswagen-tiguan-1-4-tsi-2015-8325-1.webp', photos: 6,
    features: ['Navigatie', 'Panoramisch dak'] },
  { id: 'volkswagen-polo-1-0-blue-2015', brand: 'Volkswagen', model: 'Polo', version: '1.0 BlueMotion', year: 2015, km: 110000, fuel: 'Benzine', gearbox: 'Manueel', price: 7950, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-08-15',
    img: AT + '2026/11/volkswagen-polo-1-0-blue-2015-9372-1.webp', photos: 6,
    features: [] },
  { id: 'chevrolet-orlando-1-4i-automaat-2014', brand: 'Chevrolet', model: 'Orlando', version: '1.4i, 7 zitplaatsen', year: 2014, km: 109000, fuel: 'Benzine', gearbox: 'Automaat', price: 7950, hp: null, body: 'MPV', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'reserved', added: '2026-08-12',
    img: AT + '2026/11/chevrolet-orlando-1-4i-automaat-2014-5757-1.webp', photos: 6,
    features: ['Navigatie', '7 zitplaatsen'] },
  { id: 'opel-astra-sports-tourer-2014', brand: 'Opel', model: 'Astra Sports Tourer', version: '1.4i', year: 2014, km: 146000, fuel: 'Benzine', gearbox: 'Manueel', price: 5950, hp: null, body: 'Break', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-08-09',
    img: AT + '2026/11/opel-astra-sports-tourer-2014-2946-1.webp', photos: 6,
    features: [] },
  { id: 'opel-astra-sport-tourer-2014', brand: 'Opel', model: 'Astra Sports Tourer', version: '1.6 CDTi', year: 2014, km: 178000, fuel: 'Diesel', gearbox: 'Manueel', price: 2500, hp: null, body: 'Break', doors: 5, color: null, euro: null, lez: false, carpass: false, warranty: 0, status: 'export', added: '2026-08-06',
    img: AT + '2026/11/opel-astra-sport-tourer-2014-6218-1.webp', photos: 6,
    features: ['Navigatie'] },
  { id: 'nissan-micra-1-2i-pure-2013', brand: 'Nissan', model: 'Micra', version: '1.2i Pure Drive', year: 2013, km: 113000, fuel: 'Benzine', gearbox: 'Manueel', price: 4950, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'reserved', added: '2026-08-03',
    img: AT + '2026/11/nissan-micra-1-2i-pure-2013-8799-1.webp', photos: 6,
    features: [] },
  { id: 'peugeot-3008-1-6i-allure-2013', brand: 'Peugeot', model: '3008', version: '1.6i Allure', year: 2013, km: 154000, fuel: 'Benzine', gearbox: 'Automaat', price: 6950, hp: null, body: 'SUV', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-07-31',
    img: AT + '2026/11/peugeot-3008-1-6i-allure-2013-4588-1.webp', photos: 6,
    features: ['Navigatie', 'Panoramisch dak'] },
  { id: 'peugeot-208-1-2-vti-2012', brand: 'Peugeot', model: '208', version: '1.2 VTi', year: 2012, km: 98000, fuel: 'Benzine', gearbox: 'Manueel', price: 4950, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'reserved', added: '2026-07-28',
    img: AT + '2026/11/peugeot-208-1-2-vti-2012-0513-1.webp', photos: 6,
    features: ['Navigatie', 'Parkeersensoren'] },
  { id: 'volkswagen-golf-1-4-tsi-2012', brand: 'Volkswagen', model: 'Golf', version: '1.4 TSI', year: 2012, km: 72000, fuel: 'Benzine', gearbox: 'Manueel', price: 7950, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-07-25',
    img: AT + '2026/11/volkswagen-golf-1-4-tsi-2012-8161-1.webp', photos: 6,
    features: [] },
  { id: 'opel-agila-1-2i-2011', brand: 'Opel', model: 'Agila', version: '1.2i', year: 2011, km: 103000, fuel: 'Benzine', gearbox: 'Manueel', price: 4450, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'reserved', added: '2026-07-22',
    img: AT + '2026/11/opel-agila-1-2i-2011-2954-1.webp', photos: 6,
    features: [] },
  { id: 'peugeot-5008-1-6i-5-2011', brand: 'Peugeot', model: '5008', version: '1.6i, 5 zitplaatsen', year: 2011, km: 148000, fuel: 'Benzine', gearbox: 'Manueel', price: 5450, hp: null, body: 'MPV', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-07-19',
    img: AT + '2026/11/peugeot-5008-1-6i-5-2011-5007-1.webp', photos: 6,
    features: [] },
  { id: 'mazda-2-1-4d-2009', brand: 'Mazda', model: '2', version: '1.4d', year: 2009, km: 205000, fuel: 'Diesel', gearbox: 'Manueel', price: 1500, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: false, carpass: false, warranty: 0, status: 'export', added: '2026-07-16',
    img: AT + '2026/11/mazda-2-1-4d-2009-3357-1.webp', photos: 6,
    features: [] },
  { id: 'opel-astra-cabrio-1-6i-2007', brand: 'Opel', model: 'Astra Cabrio', version: '1.6i', year: 2007, km: 173000, fuel: 'Benzine', gearbox: 'Manueel', price: 1250, hp: null, body: 'Cabrio', doors: 2, color: null, euro: null, lez: false, carpass: false, warranty: 0, status: 'export', added: '2026-07-13',
    img: AT + '2026/11/opel-astra-cabrio-1-6i-2007-9362-1.webp', photos: 6,
    features: [] },
  { id: 'citroen-citroen-c5-2-0i-2004', brand: 'Citroën', model: 'C5', version: '2.0i', year: 2004, km: 130000, fuel: 'Benzine', gearbox: 'Automaat', price: 3950, hp: null, body: 'Sedan', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-07-10',
    img: AT + '2026/11/citroen-c5-2-0i-automaat-2004-4012-1.webp', photos: 6,
    features: [] },
  { id: 'peugeot-307-1-6i-2003', brand: 'Peugeot', model: '307', version: '1.6i', year: 2003, km: 63083, fuel: 'Benzine', gearbox: 'Manueel', price: 3950, hp: null, body: 'Hatchback', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'reserved', added: '2026-07-07',
    img: AT + '2026/11/peugeot-307-1-6i-2003-1396-1.webp', photos: 6,
    features: [] },
  { id: 'renault-megane-scenic-1-6i-2000', brand: 'Renault', model: 'Mégane Scénic', version: '1.6i', year: 2000, km: 201000, fuel: 'Benzine', gearbox: 'Automaat', price: 2450, hp: null, body: 'MPV', doors: 5, color: null, euro: null, lez: true, carpass: true, warranty: 12, status: 'available', added: '2026-07-04',
    img: AT + '2026/11/renault-megane-scenic-1-6i-2000-9892-1.webp', photos: 6,
    features: [] },
];

/* Reviews: echte reviews van het Google-profiel van Auto Turnhout (licht ingekort, zoals op de huidige site). */
window.REVIEWS = [
  { name: 'Bart', meta: 'Google, 2026', text: 'Super snelle service en vriendelijk personeel. Mijn auto hier gekocht en een goede prijs voor de juiste auto.' },
  { name: 'Wim B.', meta: 'Google, 2024', text: 'We hebben nu al 3 auto’s bij Auto Turnhout gekocht. Alles klopt, loopt snel en als er dan iets kleins is, wordt dat meteen kosteloos aangepast. Echt uitstekend.' },
  { name: 'R. A.', meta: 'Google, werkplaats', text: 'Behulpzame garage tijdens onze autopech op weg naar Frankrijk. Heel snel een diagnose gesteld en daarnaast een taxi geregeld voor ons vervangend vervoer. Bedankt!' },
  { name: 'Marcel V.', meta: 'Google, 2024', text: 'Heb ondertussen een tweede auto gekocht bij Auto Turnhout. Zoals de vorige keer zeer tevreden. Heel beleefd en altijd eerlijk.' },
  { name: 'Armand V.', meta: 'Google, garantie', text: 'Pas een Opel Zafira gekocht, na 1 week bobine stuk. Direct naar daar gereden en met de glimlach hersteld in garantie.' },
  { name: 'Thomas H.', meta: 'Google, 2025', text: 'Vandaag langs geweest bij Auto Turnhout, waar wij heel goed zijn verdergeholpen door Andy. Top service!' },
];

/* ==========================================================================
   WERKPLAATS: diensten. time en from (richtprijs in euro incl. btw) zijn optioneel:
   leeg (null) = niet tonen; de site toont dan "prijs vooraf". Vul ze in als u ze wilt tonen.
   Het seizoensaanbod (wintercheck of zomercheck) zet de site zelf bovenaan.
   ========================================================================== */
window.SERVICES = [
  { id: 'Onderhoud', icon: 'wrench', title: 'Onderhoud', text: 'Kleine en grote beurt volgens het voorschrift van de fabrikant, voor alle merken.', time: null, from: null },
  { id: 'Keuring', icon: 'file', title: 'Keuring en keuring voor verkoop', text: 'We controleren uw wagen vooraf en regelen de keuring.', time: null, from: null },
  { id: 'Banden', icon: 'tyre', title: 'Banden', text: 'Zomer-, winter- en allseasonbanden: wisselen, uitlijnen en bewaren.', time: null, from: null },
  { id: 'Airco', icon: 'wind', title: 'Airco', text: 'Controle, bijvullen en ontsmetten van uw airco.', time: null, from: null },
  { id: 'Diagnose', icon: 'cpu', title: 'Reparatie en diagnose', text: 'Bij een elektrische of motorstoring lezen we uw wagen uit en zeggen we wat er scheelt.', time: null, from: null },
  { id: 'Remmen', icon: 'brake', title: 'Remmen', text: 'Blokken en schijven nagekeken en waar nodig vervangen.', time: null, from: null },
  { id: 'Distributieriem', icon: 'belt', title: 'Distributieriem', text: 'Op tijd vervangen voorkomt zware motorschade.', time: null, from: null },
  { id: 'Batterij', icon: 'battery', title: 'Batterij', text: 'Startbatterij testen en vervangen. Bij elektrische wagens ook de batterijgezondheid.', time: null, from: null },
  { id: 'Schadeherstel', icon: 'drop', title: 'Schadeherstel en carrosserie', text: 'Carrosserie, spuitwerk, spotrepair, ruit- en interieurherstel, met een kostenindicatie vooraf.', time: null, from: null },
];

/* ==========================================================================
   TEAM: vul aan met naam, rol, een korte zin en een foto (photo: 'assets/img/team/andy.jpg').
   Leeg = het blok met teamfoto's wordt niet getoond.
   ========================================================================== */
window.TEAM = [];
