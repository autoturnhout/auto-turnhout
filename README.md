# Auto Turnhout: nieuwe website (voorbeeldversie)

Nieuw ontwerp voor Auto Turnhout VOF, Beyntellus 9, 2360 Oud-Turnhout. Static website (HTML, CSS, JavaScript), geen build-stap.

## Bekijken

```
node dev-server.js
```

Open daarna http://localhost:5173

## Wat erin zit

Alle gegevens komen van de huidige site van Auto Turnhout: naam, adres, telefoons, openingsuren, btw- en RPR-gegevens,
Google-score (4,0 op 136 reviews), de echte reviews, de diensten en de 51 wagens die nu te koop staan (met hun eigen foto's).

Opbouw van de pagina:

1. **Bovenaan**: "Auto's die we zelf zouden rijden", met de wagen van de week en zijn checkrapport
2. **Zoekzin**: "Ik zoek [een gezinswagen] tot [€ 20.000]"
3. **Drie deuren**: kopen, onderhoud (met de eerstvolgende vrije plek) en verkopen (met nummerplaat)
4. **Aanbod**: zoeken, snelle keuzes, filters, sorteren, favorieten, tot 3 wagens vergelijken
5. **De werkplaats-check**: rechtstreeks van de dealer, nagekeken in de eigen werkplaats, gekeurd met Car-Pass, garantie tot 3 jaar
6. **Onderhoud**: alle diensten, wintercheck in de winter bovenaan, onderhoudsplan, verhuur (Enterprise), depannage, schadeherstel
7. **Nieuw, ook voor garages**: velgen, versnellingsbakken/DSG, auto-elektronica
8. **Verkopen of inruilen** (bod binnen 1 werkdag), **financiering**, **reviews**, **over ons en vacatures**, **contact**

Per wagen (detailvenster): fotogalerij, checkrapport, technische gegevens, proefrit of wachtlijst plannen, WhatsApp,
bewaren, vergelijken, delen (link opent meteen die wagen) en prijsalarm.

## Nog aan te vullen voor livegang

Alles staat in **`assets/js/data.js`**:

| Wat | Waar |
|---|---|
| Rentevoet (JKP) van de kredietpartner | `SITE.finance.apr`. Zet `showMonthly: true` om maandbedragen bij de wagens te tonen. Tot dan staat er "maandbedrag op aanvraag". |
| Facebook- en Instagram-links | `SITE.social` |
| Teamfoto's (bv. Andy) | `TEAM` (leeg = blok wordt niet getoond) |
| Duur en richtprijzen van werkplaatsdiensten (optioneel) | `SERVICES` (`time`, `from`; leeg = "prijs vooraf") |
| Meetwaarden in het checkrapport (optioneel, per wagen) | `check` bij een wagen, bv. `{ brakesFront: 80, brakesRear: 75, tyres: 6.5 }` |
| Formulieren laten aankomen (afspraak, proefrit, inruil, prijsalarm) | `SITE.formEndpoint` |
| Voorraad | komt automatisch van 2dehands, zie "Koppeling met 2dehands" |

Zet `SITE.demo` op `false` zodra alles klopt: dan verdwijnt de gele balk bovenaan.

Ook nog nodig: pagina's voor privacy, cookies, algemene voorwaarden, vacatures, de blogartikels en "kopen vanuit Nederland".

## Koppeling met 2dehands (voorraad komt vanzelf op de site)

Auto Turnhout zet zijn wagens op 2dehands ([profiel](https://www.2dehands.be/u/auto-turnhout/27476940/)). Hij post **één keer, op 2dehands**;
de website neemt de zoekertjes vanzelf over. Eén richting: 2dehands → website. Er wordt niets naar 2dehands gestuurd.

**Hoe het werkt**

1. `node sync/sync-stock.mjs` leest zijn openbare profielpagina's op 2dehands en, voor nieuwe of gewijzigde zoekertjes, de pagina van dat zoekertje.
   Het schrijft alles naar `stock.json`; de website leest dat bestand bij elk bezoek.
2. Per wagen: merk, model, uitvoering, bouwjaar, km, prijs, brandstof, versnellingsbak, pk, kleur, carrosserie, alle foto's, de Car-Pass-link,
   "gereserveerd" of "export", LEZ, zijn optielijst (airco, navigatie, ...), en uit zijn tekst: "eerste eigenaar", "dealer onderhouden",
   "gecontroleerd op 80 punten" en uitgevoerde werken (bv. "distributie vervangen", "koppeling vervangen"). Zijn vaste standaardalinea's worden weggelaten.
3. Verkochte wagens verdwijnen, nieuwe verschijnen, prijswijzigingen en "gereserveerd" worden overgenomen.
4. Vangnet: komen er bijna geen wagens door (2dehands even onbereikbaar of anders opgebouwd), dan blijft de site zoals hij was
   (`minCars`, `maxDropPercent` in `sync/config.json`). Een fout staat in het logbestand.
5. Beleefd: alleen pagina's die 2dehands in robots.txt toelaat (profiel en zoekertjes, geen interne API's), een pauze van 2,5 s tussen
   pagina's, een eerlijke naam, en zoekertjes worden enkel opnieuw gelezen als ze veranderd zijn (cache in `sync/cache/`, mag u gerust wissen).
   Een gewone run vraagt 2 profielpagina's op; de eerste keer ook de 45 zoekertjes (± 2 minuten).

**Laten draaien (elke 30 minuten)**

Op de server waar de website staat, met Node.js 18 of nieuwer:

```
*/30 * * * * cd /pad/naar/site && node sync/sync-stock.mjs >> sync/sync.log 2>&1
```

Staat de website op GitHub (bv. met GitHub Pages of Netlify), dan doet `.github/workflows/sync-2dehands.yml` hetzelfde:
het draait elke 30 minuten en zet de nieuwe `stock.json` online.

Handig: `node sync/sync-stock.mjs --dry` toont wat er zou veranderen zonder iets te schrijven.

**Goed om te weten**

- De koppeling leest de openbare pagina's van 2dehands. Past 2dehands de opbouw van zijn site aan, dan kan het script tijdelijk geen wagens
  meer lezen; de site blijft dan de laatst gekende wagens tonen tot het script is aangepast.
- De gebruiksvoorwaarden van 2dehands zijn streng over automatisch uitlezen. Het script leest alleen de eigen zoekertjes van Auto Turnhout,
  zelden en traag. Wil hij helemaal zeker zijn, of vraagt 2dehands ooit om te stoppen, dan kan dezelfde koppeling een officiële feed gebruiken:
  zet in `sync/config.json` `source.type` op `"url"` en vul `url`, `itemsPath` en `fields` in. Ook de export van dealersoftware werkt zo.

Extra's die niet in het zoekertje staan (wagen van de week, meetwaarden voor het checkrapport) zet u in `sync/overrides.json`.
Zonder keuze toont de site als "wagen van de week" de nieuwste beschikbare wagen vanaf € 15.000.

**Testen zonder 2dehands**: `node sync/sync-stock.mjs --source=sync/sample-feed.json --out=sync/test-stock.json`
en open http://localhost:5173/?stock=sync/test-stock.json.

`assets/js/data.js` bevat nog een reservelijst (de wagens van de oude site) voor als `stock.json` ontbreekt.

## Online zetten (GitHub Pages)

De site staat als testversie online via GitHub Pages. Het bestand `.github/workflows/sync-2dehands.yml` doet alles:

- bij elke wijziging aan de site gaat de nieuwe versie online;
- elke 30 minuten worden de zoekertjes van 2dehands gelezen, de pagina's per wagen opnieuw gebouwd en gaat de site online.

Eenmalig in GitHub: **Settings > Pages > Source: "GitHub Actions"**. Het adres van de site staat in `sync/config.json` bij `siteUrl`.

Zolang het een testversie is, staat in `index.html` de regel `<meta name="robots" content="noindex, nofollow">`: Google toont de site dan niet. **Haal die regel weg bij de echte livegang** (en zet `demo` in `assets/js/data.js` op `false`).

## Een pagina per wagen

Elke wagen heeft een eigen pagina: `wagen/<id>/`, bijvoorbeeld `wagen/skoda-kodiaq-2025-m2466607293/`.

- De sync maakt die pagina's na elke run opnieuw (`sync/build-pages.mjs`), met `index.html` als sjabloon. Header, footer, menu's en formulieren zijn dus altijd dezelfde als op de homepage.
- Een gedeelde link toont op WhatsApp en Facebook de foto, naam en prijs van de wagen. Google kan elke wagen apart vinden (titel, beschrijving en `Car`-gegevens per pagina, plus `sitemap.xml` en `robots.txt`).
- Is een wagen verkocht, dan wordt zijn pagina een korte "verkocht"-pagina met een link naar het aanbod. Oude links blijven zo werken.
- In `sync/config.json` staat bij `siteUrl` het adres van de website (nu het testadres `https://autoturnhout.github.io/auto-turnhout`; bij de livegang wordt dat `https://www.autoturnhout.be`). Dat adres komt in de sitemap en in de voorvertoning van gedeelde links.
- Met de hand opnieuw bouwen: `node sync/build-pages.mjs`

Op de homepage opent een wagen nog altijd snel in een venster; daar staat ook de link "Volledige pagina". Foto's openen op volledig scherm (vegen, dubbeltikken of knijpen om in te zoomen). Onder elke wagen staan vergelijkbare wagens en de wagens die de bezoeker onlangs bekeek (alleen op zijn eigen toestel bewaard).

De foto's zijn altijd de originele foto's uit de advertenties. Waar een foto klein getoond wordt (kaarten, miniaturen), laadt de site een kleinere versie van dezelfde foto die 2dehands zelf aanbiedt. Zo laadt de site sneller op de gsm.

## Vormgeving

Het uitzicht staat in twee bestanden: `assets/css/styles.css` (de basis) en `assets/css/v2.css` (de huidige stijl: wit, brede vette letter (Archivo), zwevende kop, foto vooraan). Wie de `<link>` naar `v2.css` uit `index.html` haalt, krijgt de vorige stijl terug (de pagina's per wagen daarna opnieuw bouwen).

## Nummerplaten

Wie een wagen aanbiedt of een afspraak maakt, kan links op de nummerplaat het land kiezen. De plaat krijgt dan de landcode, de kleur en de schrijfwijze van dat land. De landen staan in `assets/js/app.js` (lijst `PLATES`). Het veld is niet verplicht en weigert niets: een andere schrijfwijze blijft staan zoals ze getypt is. Het land wordt als `plateCountry` (bv. `DE`) meegestuurd met het formulier.

## Talen (NL, FR, EN)

De site is in het Nederlands geschreven en schakelt naar Frans of Engels met de knoppen NL · FR · EN (bovenaan, in het menu op de gsm en onderaan).

- Nederlands is de hoofdtaal: elke eerste bezoeker krijgt Nederlands, ook met een Franse of Engelse browser.
- Een klik op FR of EN wordt onthouden.
- Rechtstreekse links: `?lang=fr` en `?lang=en`. Die taal geldt dan voor dat bezoek.
- Alle vertalingen staan in `assets/js/i18n.js`, als lijst: Nederlandse tekst → Frans, Engels. Past u een tekst op de site aan, pas dan daar ook de vertaling aan (de Nederlandse tekst moet exact gelijk zijn).
- Prijzen, kilometers, datums en openingsuren volgen de taal (bv. `12 500 €`, `€12,500`, `lundi 23 nov`).
- Blijven in het Nederlands: de omschrijving uit de 2dehands-advertentie en de Google-reviews (met een korte vermelding in het Frans en Engels). De formulieren sturen de keuzes in het Nederlands door naar de zaak.

## Foto's

Zie `PHOTO-CREDITS.md`.
