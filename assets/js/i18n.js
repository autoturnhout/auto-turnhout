/* ==========================================================================
   Talen: Nederlands (bron), Frans, Engels.
   De site is in het Nederlands geschreven. Dit bestand vertaalt elke tekst op de
   pagina (ook wat later verschijnt, zoals wagens en vensters) via het woordenboek
   hieronder: Nederlandse tekst -> [Frans, Engels]. Tekst die niet in het
   woordenboek staat, blijft zoals hij is (bv. merknamen, de advertentietekst van
   2dehands en de Google-reviews).
   Een tekst aanpassen of toevoegen: zet de Nederlandse tekst links, exact zoals op de site.
   ========================================================================== */
(() => {
  'use strict';
  const LANGS = ['nl', 'fr', 'en'];
  const read = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const readVisit = k => { try { return sessionStorage.getItem(k); } catch { return null; } };
  const lang = (() => {
    // Nederlands is de hoofdtaal. Frans of Engels alleen na een klik op FR/EN (blijft onthouden)
    // of via een link met ?lang=fr of ?lang=en (geldt voor dat bezoek).
    const q = new URLSearchParams(location.search).get('lang');
    if (LANGS.includes(q)) { try { sessionStorage.setItem('at-lang', q); } catch { /* private mode */ } return q; }
    for (const l of [readVisit('at-lang'), read('at-lang')]) if (LANGS.includes(l)) return l;
    return 'nl';
  })();
  const L = lang === 'fr' ? 0 : 1;

  /* ---------------- Woordenboek: 'Nederlands': ['Français', 'English'] ---------------- */
  const D = {
    // Algemeen, header, menu
    'Naar de inhoud': ['Aller au contenu', 'Skip to content'],
    'Nieuw ontwerp, voorbeeldversie.': ['Nouveau design, version de démonstration.', 'New design, preview version.'],
    "Met de gegevens en wagens van Auto Turnhout. Nog aan te vullen: rentevoet, teamfoto's en socialemedialinks.": ['Avec les données et les voitures d’Auto Turnhout. À compléter : taux d’intérêt, photos de l’équipe et liens vers les réseaux sociaux.', 'With the details and cars of Auto Turnhout. Still to add: interest rate, team photos and social media links.'],
    'Occasions · Werkplaats': ['Occasions · Atelier', 'Used cars · Workshop'],
    'Aanbod': ['Nos voitures', 'Our cars'],
    'Werkplaats-check': ['Contrôle atelier', 'Workshop check'],
    'Onderhoud': ['Entretien', 'Servicing'],
    'Verkopen': ['Vendre', 'Sell'],
    'Over ons': ['À propos', 'About us'],
    'Contact': ['Contact', 'Contact'],
    'Maak een afspraak': ['Prendre rendez-vous', 'Book an appointment'],
    'Naar boven': ['Retour en haut', 'Back to top'],
    'Hoofdmenu': ['Menu principal', 'Main menu'],
    'Menu openen': ['Ouvrir le menu', 'Open menu'],
    'Menu': ['Menu', 'Menu'],
    'Bewaarde wagens': ['Voitures enregistrées', 'Saved cars'],
    'Sluiten': ['Fermer', 'Close'],
    'Taal': ['Langue', 'Language'],

    // Hero
    'Occasions en werkplaats in': ['Occasions et atelier à', 'Used cars and workshop in'],
    "Auto's die we zelf": ['Des voitures que nous', 'Cars we would'],
    'zouden rijden.': ['conduirions nous-mêmes.', 'drive ourselves.'],
    'Voor de verkoop gaat elke wagen door onze eigen werkplaats en door de keuring. U krijgt een Car-Pass en minstens 12 maanden garantie. En na de aankoop blijven we gewoon uw garage, voor elk merk.': ['Avant la vente, chaque voiture passe par notre propre atelier et par le contrôle technique. Vous recevez un Car-Pass et au moins 12 mois de garantie. Et après l’achat, nous restons tout simplement votre garage, pour toutes les marques.', 'Before it is sold, every car goes through our own workshop and the roadworthiness test. You get a Car-Pass and at least 12 months’ warranty. And after you buy, we simply stay your garage, for every make.'],
    'Bekijk het aanbod': ['Voir nos voitures', 'View our cars'],
    'Zo checken wij': ['Notre contrôle', 'How we check'],
    'op Google ·': ['sur Google ·', 'on Google ·'],
    'reviews': ['avis', 'reviews'],
    'Wagen van de week': ['Voiture de la semaine', 'Car of the week'],
    'Bekijk wagen': ['Voir la voiture', 'View car'],

    // Zoekzin
    'Ik zoek': ['Je cherche', 'I’m looking for'],
    'een wagen': ['une voiture', 'a car'],
    'een gezinswagen': ['une voiture familiale', 'a family car'],
    'een SUV': ['un SUV', 'an SUV'],
    'iets elektrisch of hybride': ['une électrique ou hybride', 'something electric or hybrid'],
    'een automatische wagen': ['une boîte automatique', 'an automatic'],
    'een recente wagen': ['une voiture récente', 'a recent car'],
    'van': ['de', 'from'],
    'elk merk': ['toutes marques', 'any brand'],
    'tot': ['jusqu’à', 'up to'],
    'elk budget': ['tout budget', 'any budget'],
    'Toon': ['Voir', 'Show'],
    'wagens': ['voitures', 'cars'],
    'wagen': ['voiture', 'car'],
    'Soort wagen': ['Type de voiture', 'Type of car'],
    'Merk': ['Marque', 'Make'],
    'Maximumbudget': ['Budget maximum', 'Maximum budget'],

    // Drie deuren
    'Eén adres voor uw auto': ['Une seule adresse pour votre voiture', 'One address for your car'],
    'Kopen, onderhouden, verkopen.': ['Acheter, entretenir, vendre.', 'Buy, service, sell.'],
    'Allemaal hier.': ['Tout ici.', 'All here.'],
    'U hoeft niet te kiezen tussen een handelaar en een garage. Wie bij ons koopt, krijgt de mensen die de wagen nagekeken hebben er gratis bij.': ['Plus besoin de choisir entre un marchand et un garage. Qui achète chez nous reçoit en prime les personnes qui ont contrôlé la voiture.', 'No need to choose between a dealer and a garage. Buy from us and the people who checked the car come with it, free.'],
    'Kopen': ['Acheter', 'Buy'],
    'occasions, allemaal gecheckt': ['occasions, toutes contrôlées', 'used cars, all checked'],
    'Van een kleine stadsauto tot een gezinswagen of SUV, in elke prijsklasse en met minstens 12 maanden garantie.': ['De la petite citadine à la familiale ou au SUV, dans toutes les gammes de prix et avec au moins 12 mois de garantie.', 'From a small city car to a family car or SUV, at every price and with at least 12 months’ warranty.'],
    'Naar het aanbod': ['Voir les voitures', 'See the cars'],
    'Eerstvolgende vrije plek': ['Prochaine place libre', 'Next free slot'],
    'Alle merken, met een prijs vooraf': ['Toutes marques, prix annoncé à l’avance', 'All makes, price agreed upfront'],
    'Onderhoud, banden, airco, diagnose en herstellingen. We bellen altijd voor we iets extra doen.': ['Entretien, pneus, climatisation, diagnostic et réparations. Nous appelons toujours avant tout travail supplémentaire.', 'Servicing, tyres, air conditioning, diagnostics and repairs. We always call before doing anything extra.'],
    'Plan een moment': ['Choisir un moment', 'Pick a time'],
    'Nummerplaat': ['Plaque d’immatriculation', 'Number plate'],
    'Nummerplaat (optioneel)': ['Plaque d’immatriculation (facultatif)', 'Number plate (optional)'],
    'Land van de nummerplaat': ['Pays de la plaque d’immatriculation', 'Country of the number plate'],
    'Buitenlandse nummerplaat? Kies links het land.': ['Plaque étrangère ? Choisissez le pays à gauche.', 'Foreign plate? Choose the country on the left.'],
    'Veel gekozen': ['Souvent choisis', 'Often chosen'],
    'Andere landen in Europa': ['Autres pays d’Europe', 'Other European countries'],
    'Ander land': ['Autre pays', 'Other country'],
    'Vraag een bod': ['Demander une offre', 'Get an offer'],
    'Een vrijblijvend bod binnen 1 werkdag': ['Une offre sans engagement en 1 jour ouvrable', 'A no-obligation offer within 1 working day'],
    'Ook als u niets bij ons koopt. Uw auto, mobilhome of caravan telt mee als inruil.': ['Même si vous n’achetez rien chez nous. Votre voiture, mobilhome ou caravane compte comme reprise.', 'Even if you don’t buy from us. Your car, motorhome or caravan counts as a trade-in.'],
    'Hoe het werkt': ['Comment ça marche', 'How it works'],

    // Aanbod
    'Gecheckt, gepoetst': ['Contrôlées, nettoyées', 'Checked, cleaned'],
    'en klaar om te rijden.': ['et prêtes à rouler.', 'and ready to drive.'],
    'Elke wagen gaat voor de verkoop door onze werkplaats en door de keuring, met Car-Pass en minstens 12 maanden garantie. Bewaar wagens met het hartje of zet er drie naast elkaar.': ['Avant la vente, chaque voiture passe par notre atelier et par le contrôle technique, avec Car-Pass et au moins 12 mois de garantie. Enregistrez des voitures avec le cœur ou comparez-en trois côte à côte.', 'Before sale, every car goes through our workshop and the roadworthiness test, with Car-Pass and at least 12 months’ warranty. Save cars with the heart or compare three side by side.'],
    'Kies een merk': ['Choisir une marque', 'Choose a make'],
    'Alle merken': ['Toutes les marques', 'All makes'],
    'Zoek in het aanbod': ['Chercher une voiture', 'Search the cars'],
    'Merk of model, bv. Golf': ['Marque ou modèle, p. ex. Golf', 'Make or model, e.g. Golf'],
    'Snel kiezen': ['Choix rapide', 'Quick choice'],
    'Onder € 10.000': ['Moins de 10 000 €', 'Under €10,000'],
    'Voor het gezin': ['Pour la famille', 'For the family'],
    'Met stekker of hybride': ['Électrique ou hybride', 'Plug-in or hybrid'],
    'Automatische bak': ['Boîte automatique', 'Automatic'],
    'Hoge instap': ['Position haute (SUV)', 'High seating (SUV)'],
    'Jonger dan 6 jaar': ['Moins de 6 ans', 'Under 6 years old'],
    'Filters': ['Filtres', 'Filters'],
    'Sorteren': ['Trier', 'Sort'],
    'Nieuwste eerst': ['Les plus récentes en ligne', 'Newest first'],
    'Goedkoopste eerst': ['Prix croissant', 'Price: low to high'],
    'Duurste eerst': ['Prix décroissant', 'Price: high to low'],
    'Minste kilometers': ['Moins de kilomètres', 'Lowest mileage'],
    'Jongste eerst': ['Les plus jeunes', 'Youngest first'],
    'Prijs': ['Prix', 'Price'],
    'Minimumprijs': ['Prix minimum', 'Minimum price'],
    'Maximumprijs': ['Prix maximum', 'Maximum price'],
    'Bouwjaar vanaf': ['Année à partir de', 'Year from'],
    'Alle bouwjaren': ['Toutes les années', 'Any year'],
    'Hoogstens': ['Maximum', 'At most'],
    'Alle kilometerstanden': ['Tous les kilométrages', 'Any mileage'],
    'Brandstof': ['Carburant', 'Fuel'],
    'Versnellingsbak': ['Boîte de vitesses', 'Gearbox'],
    'Alle': ['Tous', 'All'],
    'Alles wissen': ['Tout effacer', 'Clear all'],
    'Toon resultaat': ['Voir les résultats', 'Show results'],
    'Wis alle filters': ['Effacer tous les filtres', 'Clear all filters'],
    ', allemaal gecheckt': [', toutes contrôlées', ', all checked'],
    'Toon alle': ['Voir les', 'Show all'],
    'Nog niet de juiste wagen?': ['Pas encore la bonne voiture ?', 'Not the right car yet?'],
    'Zeg ons wat u zoekt. We kopen dagelijks in en laten het u weten zodra er iets binnenkomt dat past.': ['Dites-nous ce que vous cherchez. Nous achetons tous les jours et vous prévenons dès qu’une voiture qui vous convient arrive.', 'Tell us what you are looking for. We buy every day and will let you know as soon as something suitable comes in.'],
    'Wis filters': ['Effacer les filtres', 'Clear filters'],
    'Laat het me weten via WhatsApp': ['Prévenez-moi via WhatsApp', 'Let me know via WhatsApp'],
    '* Indicatief maandbedrag: lening op 60 maanden zonder voorschot, JKP': ['* Mensualité indicative : prêt sur 60 mois sans acompte, TAEG', '* Indicative monthly amount: 60-month loan without deposit, APR'],
    '% (vast). Geen offerte; onder voorbehoud van aanvaarding van uw dossier.': ['% (fixe). Pas une offre ; sous réserve d’acceptation de votre dossier.', '% (fixed). Not an offer; subject to approval of your application.'],
    'Let op, geld lenen kost ook geld.': ['Attention, emprunter de l’argent coûte aussi de l’argent.', 'Beware: borrowing money also costs money.'],

    // Kaart en badges
    'Bouwjaar': ['Année', 'Year'],
    'Km-stand': ['Kilométrage', 'Mileage'],
    'Bak': ['Boîte', 'Gearbox'],
    'Benzine': ['Essence', 'Petrol'], 'Diesel': ['Diesel', 'Diesel'], 'Elektrisch': ['Électrique', 'Electric'], 'Hybride': ['Hybride', 'Hybrid'],
    'Plug-in hybride': ['Hybride rechargeable', 'Plug-in hybrid'], 'Plug-in': ['Rechargeable', 'Plug-in'], 'LPG': ['LPG', 'LPG'],
    'Automaat': ['Automatique', 'Automatic'], 'Manueel': ['Manuelle', 'Manual'],
    'Hatchback': ['Berline compacte', 'Hatchback'], 'Break': ['Break', 'Estate'], 'MPV': ['Monospace', 'MPV'], 'Sedan': ['Berline', 'Saloon'],
    'Cabrio': ['Cabriolet', 'Convertible'], 'Bestelwagen': ['Utilitaire', 'Van'], 'Coupé': ['Coupé', 'Coupé'], 'Pick-up': ['Pick-up', 'Pick-up'],
    'Zwart': ['Noir', 'Black'], 'Wit': ['Blanc', 'White'], 'Blauw': ['Bleu', 'Blue'], 'Rood': ['Rouge', 'Red'], 'Grijs': ['Gris', 'Grey'],
    'Zilver': ['Argent', 'Silver'], 'Zilver of Grijs': ['Argent ou gris', 'Silver or grey'], 'Beige': ['Beige', 'Beige'], 'Bruin': ['Brun', 'Brown'],
    'Groen': ['Vert', 'Green'], 'Geel': ['Jaune', 'Yellow'], 'Oranje': ['Orange', 'Orange'], 'Paars': ['Violet', 'Purple'],
    'Overige kleuren': ['Autre couleur', 'Other colour'], 'Goud': ['Or', 'Gold'],
    'Gereserveerd': ['Réservée', 'Reserved'], 'Net binnen': ['Nouvel arrivage', 'Just in'], 'Export': ['Export', 'Export'], 'LEZ-proof': ['Accès LEZ', 'LEZ-compliant'],
    'Bekijk details': ['Voir les détails', 'View details'],
    'Bekijk': ['Voir', 'View'],
    'Wachtlijst mogelijk': ['Liste d’attente possible', 'Waiting list possible'],
    'Export / handel: zonder keuring en garantie': ['Export / négoce : sans contrôle ni garantie', 'Export / trade: no inspection, no warranty'],
    'Maandbedrag op aanvraag': ['Mensualité sur demande', 'Monthly amount on request'],
    'Handelsprijs': ['Prix négociant', 'Trade price'],
    'Prijs voor export of handel': ['Prix pour l’export ou le négoce', 'Price for export or trade'],
    'Prijs op aanvraag': ['Prix sur demande', 'Price on request'],
    'Vergelijken': ['Comparer', 'Compare'],

    // Werkplaats-check
    'De werkplaats-check': ['Le contrôle atelier', 'The workshop check'],
    'Geen wagen in ons aanbod': ['Aucune voiture en vente', 'No car for sale'],
    'zonder onze check.': ['sans notre contrôle.', 'without our check.'],
    'Een occasion is maar zo goed als de garage die hem nakeek. Bij ons is dat onze eigen werkplaats, met dezelfde monteurs die later ook uw onderhoud doen.': ['Une occasion ne vaut que ce que vaut le garage qui l’a contrôlée. Chez nous, c’est notre propre atelier, avec les mêmes mécaniciens qui feront ensuite votre entretien.', 'A used car is only as good as the garage that checked it. Here that is our own workshop, with the same mechanics who will later service it.'],
    'Rechtstreeks van de dealer': ['Directement du concessionnaire', 'Straight from the dealer'],
    'We kopen alleen wagens waarvan we de kwaliteit kennen: schadevrij en met bijgehouden onderhoud, in elke prijsklasse.': ['Nous n’achetons que des voitures dont nous connaissons la qualité : sans dégâts et avec un entretien suivi, dans toutes les gammes de prix.', 'We only buy cars whose quality we know: accident-free and with a kept service history, at every price.'],
    'Nagekeken in onze werkplaats': ['Contrôlée dans notre atelier', 'Checked in our workshop'],
    'Onze monteurs kijken elke wagen na voor hij in de showroom komt. Elektrische en plug-in hybride wagens krijgen een batterijtest.': ['Nos mécaniciens contrôlent chaque voiture avant qu’elle n’arrive au showroom. Les voitures électriques et hybrides rechargeables reçoivent un test de batterie.', 'Our mechanics check every car before it reaches the showroom. Electric and plug-in hybrid cars get a battery test.'],
    'Gekeurd, met Car-Pass': ['Contrôle technique, avec Car-Pass', 'Inspected, with Car-Pass'],
    'Elke wagen gaat door de keuring voor verkoop: inschrijfklaar en gecontroleerd op 80 punten. De kilometerstand is gecontroleerd.': ['Chaque voiture passe le contrôle technique de vente : prête à immatriculer et vérifiée sur 80 points. Le kilométrage est contrôlé.', 'Every car passes the pre-sale roadworthiness test: ready to register and checked on 80 points. The mileage is verified.'],
    'Garantie tot 3 jaar': ['Garantie jusqu’à 3 ans', 'Warranty up to 3 years'],
    'Standaard 12 maanden garantie, te verlengen tot 36 maanden. Ook na de aankoop kunt u bij ons terecht.': ['12 mois de garantie de série, prolongeable jusqu’à 36 mois. Après l’achat aussi, vous êtes le bienvenu chez nous.', '12 months’ warranty as standard, extendable to 36 months. You are welcome here after you buy, too.'],
    'Garantieduur': ['Durée de garantie', 'Warranty period'],
    '12 mnd': ['12 mois', '12 mths'], '24 mnd': ['24 mois', '24 mths'], '36 mnd': ['36 mois', '36 mths'],
    'Altijd inbegrepen, bij elke wagen in ons aanbod.': ['Toujours compris, pour chaque voiture en vente.', 'Always included, with every car we sell.'],
    'Een jaar extra, te kiezen bij aankoop. Vraag de prijs voor uw wagen.': ['Une année de plus, à choisir à l’achat. Demandez le prix pour votre voiture.', 'One extra year, to choose when you buy. Ask the price for your car.'],
    'Drie jaar zonder zorgen. Vraag ons de voorwaarden.': ['Trois ans sans souci. Demandez-nous les conditions.', 'Three worry-free years. Ask us for the terms.'],
    'Voorbeeld van een checkrapport': ['Exemple de rapport de contrôle', 'Example of a check report'],
    'Checkrapport': ['Rapport de contrôle', 'Check report'],
    'Gekeurd voor verkoop': ['Contrôlée pour la vente', 'Inspected for sale'],
    'Nagekeken door onze werkplaats': ['Contrôlée par notre atelier', 'Checked by our workshop'],
    'Bekijk deze wagen': ['Voir cette voiture', 'View this car'],
    'Gedaan': ['Fait', 'Done'],
    'Keuring voor verkoop': ['Contrôle technique de vente', 'Pre-sale inspection'],
    'Gekeurd': ['Contrôlée', 'Passed'],
    'Eerste eigenaar': ['Premier propriétaire', 'First owner'],
    'Ja': ['Oui', 'Yes'], 'Nee': ['Non', 'No'], 'Geen': ['Aucune', 'None'],
    'Bij de dealer': ['Chez le concessionnaire', 'At the dealer'],
    'Car-Pass': ['Car-Pass', 'Car-Pass'],
    'Bij de wagen': ['Fourni', 'Included'],
    'Garantie': ['Garantie', 'Warranty'],
    'Batterijtest': ['Test de batterie', 'Battery test'],
    'Rapport bij de wagen': ['Rapport fourni', 'Report included'],
    'Batterij (SOH)': ['Batterie (SOH)', 'Battery (SOH)'],
    'Remmen voor': ['Freins avant', 'Front brakes'], 'Remmen achter': ['Freins arrière', 'Rear brakes'], 'Banden': ['Pneus', 'Tyres'],
    'LEZ Antwerpen en Gent': ['LEZ Anvers et Gand', 'LEZ Antwerp and Ghent'],
    'LEZ Antwerpen/Gent': ['LEZ Anvers/Gand', 'LEZ Antwerp/Ghent'],
    'Toegelaten': ['Autorisée', 'Allowed'], 'Niet toegelaten': ['Non autorisée', 'Not allowed'],
    'Distributie vervangen': ['Distribution remplacée', 'Timing belt replaced'], 'Motor gereviseerd': ['Moteur révisé', 'Engine overhauled'],
    'Nieuwe banden': ['Pneus neufs', 'New tyres'], 'Remmen vervangen': ['Freins remplacés', 'Brakes replaced'],
    'Groot onderhoud gedaan': ['Grand entretien effectué', 'Major service done'], 'Koppeling vervangen': ['Embrayage remplacé', 'Clutch replaced'],

    // Werkplaats
    'Onderhoud en herstelling': ['Entretien et réparation', 'Servicing and repairs'],
    'Uw garage,': ['Votre garage,', 'Your garage,'],
    'ook als u uw auto elders kocht.': ['même si vous avez acheté votre voiture ailleurs.', 'even if you bought your car elsewhere.'],
    'Voor elk merk, met of zonder afspraak. Met een afspraak bent u sneller weer weg, en de prijs die we vooraf zeggen, is ook wat u betaalt.': ['Pour toutes les marques, avec ou sans rendez-vous. Avec un rendez-vous, vous repartez plus vite, et le prix annoncé à l’avance est aussi celui que vous payez.', 'For every make, with or without an appointment. With an appointment you are on your way sooner, and the price we quote upfront is what you pay.'],
    'Eerstvolgende vrije plek in de werkplaats': ['Prochaine place libre à l’atelier', 'Next free slot in the workshop'],
    'Reserveer een moment': ['Réserver un moment', 'Reserve a time'],
    'Onderhoud per maand': ['Entretien au mois', 'Monthly servicing plan'],
    'Een vast bedrag, nooit meer verrassingen': ['Un montant fixe, plus jamais de surprises', 'A fixed amount, no more surprises'],
    'Uw jaarlijkse onderhoud, wintercheck en bandenwissel in één abonnement, ook voor wagens die u elders kocht.': ['Votre entretien annuel, le contrôle hiver et le changement de pneus dans un seul abonnement, même pour les voitures achetées ailleurs.', 'Your annual service, winter check and tyre change in one subscription, also for cars bought elsewhere.'],
    'Vraag uw maandprijs': ['Demandez votre prix mensuel', 'Ask for your monthly price'],
    'Verhuur en vervangwagen': ['Location et véhicule de remplacement', 'Rental and courtesy car'],
    'Met onze partner': ['Avec notre partenaire', 'With our partner'],
    'Pech onderweg?': ['En panne ?', 'Broken down?'],
    'Bel': ['Appelez', 'Call'],
    'Schadeherstel': ['Réparation de dégâts', 'Accident repair'],
    'Carrosserie, spuitwerk, spotrepair, ruit en interieur': ['Carrosserie, peinture, spot repair, vitrage et intérieur', 'Bodywork, paint, spot repair, glass and interior'],
    'U krijgt altijd eerst een prijs voor uw wagen. Geen extra kosten zonder uw akkoord.': ['Vous recevez toujours d’abord un prix pour votre voiture. Aucun frais supplémentaire sans votre accord.', 'You always get a price for your car first. No extra costs without your consent.'],
    'Prijs vooraf': ['Prix annoncé', 'Price upfront'],
    'Nu': ['Maintenant', 'Now'],
    'Plan': ['Planifier', 'Book'],
    'Wintercheck': ['Contrôle hiver', 'Winter check'],
    '23 controlepunten, van de batterij tot het bandenprofiel. Laat meteen ook uw winterbanden steken.': ['23 points de contrôle, de la batterie à la sculpture des pneus. Faites monter vos pneus hiver en même temps.', '23 checkpoints, from the battery to the tyre tread. Have your winter tyres fitted at the same time.'],
    'Keuring en keuring voor verkoop': ['Contrôle technique et contrôle de vente', 'Roadworthiness test and pre-sale test'],
    'Kleine en grote beurt volgens het voorschrift van de fabrikant, voor alle merken.': ['Petit et grand entretien selon les prescriptions du constructeur, pour toutes les marques.', 'Minor and major service to the manufacturer’s schedule, for every make.'],
    'We controleren uw wagen vooraf en regelen de keuring.': ['Nous vérifions votre voiture au préalable et organisons le contrôle technique.', 'We check your car beforehand and arrange the test.'],
    'Zomer-, winter- en allseasonbanden: wisselen, uitlijnen en bewaren.': ['Pneus été, hiver et toutes saisons : changement, parallélisme et stockage.', 'Summer, winter and all-season tyres: changing, alignment and storage.'],
    'Airco': ['Climatisation', 'Air conditioning'],
    'Controle, bijvullen en ontsmetten van uw airco.': ['Contrôle, recharge et désinfection de votre climatisation.', 'Checking, refilling and disinfecting your air conditioning.'],
    'Reparatie en diagnose': ['Réparation et diagnostic', 'Repairs and diagnostics'],
    'Bij een elektrische of motorstoring lezen we uw wagen uit en zeggen we wat er scheelt.': ['En cas de panne électrique ou moteur, nous lisons votre voiture et vous disons ce qui ne va pas.', 'With an electrical or engine fault we read out your car and tell you what is wrong.'],
    'Remmen': ['Freins', 'Brakes'],
    'Blokken en schijven nagekeken en waar nodig vervangen.': ['Plaquettes et disques contrôlés et remplacés si nécessaire.', 'Pads and discs checked and replaced where needed.'],
    'Distributieriem': ['Courroie de distribution', 'Timing belt'],
    'Op tijd vervangen voorkomt zware motorschade.': ['La remplacer à temps évite de gros dégâts moteur.', 'Replacing it in time prevents serious engine damage.'],
    'Batterij': ['Batterie', 'Battery'],
    'Startbatterij testen en vervangen. Bij elektrische wagens ook de batterijgezondheid.': ['Tester et remplacer la batterie de démarrage. Pour les voitures électriques, aussi l’état de la batterie.', 'Testing and replacing the starter battery. For electric cars, the battery health too.'],
    'Schadeherstel en carrosserie': ['Réparation de dégâts et carrosserie', 'Accident repair and bodywork'],
    'Carrosserie, spuitwerk, spotrepair, ruit- en interieurherstel, met een kostenindicatie vooraf.': ['Carrosserie, peinture, spot repair, réparation de vitrage et d’intérieur, avec une estimation préalable.', 'Bodywork, paint, spot repair, glass and interior repair, with a cost estimate upfront.'],
    'Velgen herstellen': ['Réparation de jantes', 'Wheel repair'],
    'Versnellingsbak, DSG': ['Boîte de vitesses, DSG', 'Gearbox, DSG'],
    'Auto-elektronica': ['Électronique auto', 'Car electronics'],

    // Specialistisch werk
    'Nieuw, ook voor garages': ['Nouveau, aussi pour les garages', 'New, also for garages'],
    'Velgen, automaten en elektronica.': ['Jantes, boîtes automatiques et électronique.', 'Wheels, automatics and electronics.'],
    'Ook voor collega-garages.': ['Aussi pour les garages confrères.', 'Also for fellow garages.'],
    'We herstellen velgen, versnellingsbakken en stuurapparaten die elders vervangen worden. Voor particulieren en voor andere garages in de regio.': ['Nous réparons les jantes, boîtes de vitesses et calculateurs qui sont remplacés ailleurs. Pour les particuliers et pour d’autres garages de la région.', 'We repair wheels, gearboxes and control units that others replace. For private customers and for other garages in the region.'],
    'Samenwerken als garage': ['Collaborer en tant que garage', 'Work with us as a garage'],
    'Velgen': ['Jantes', 'Wheels'],
    'Krassen, stoeprandschade of een slag. We richten, lassen en lakken uw velgen tot ze er weer als nieuw uitzien.': ['Rayures, trottoir ou voile. Nous redressons, soudons et repeignons vos jantes jusqu’à ce qu’elles aient l’air neuves.', 'Scratches, kerb damage or a buckle. We straighten, weld and refinish your wheels until they look new again.'],
    'Richten': ['Redressage', 'Straightening'], 'Lassen': ['Soudure', 'Welding'], 'Poedercoaten': ['Thermolaquage', 'Powder coating'],
    'Velgen laten herstellen': ['Faire réparer des jantes', 'Get wheels repaired'],
    'Automatische versnellingsbakken': ['Boîtes de vitesses automatiques', 'Automatic gearboxes'],
    'Schokt of slipt uw automaat, of staat hij in noodloop? We reviseren DSG- en andere bakken, met 12 maanden garantie.': ['Votre boîte automatique donne des à-coups, patine ou passe en mode dégradé ? Nous révisons les boîtes DSG et autres, avec 12 mois de garantie.', 'Does your automatic jerk, slip or go into limp mode? We overhaul DSG and other gearboxes, with 12 months’ warranty.'],
    'Mechatronica': ['Mécatronique', 'Mechatronics'], 'Revisie': ['Révision', 'Overhaul'],
    'Bak laten nakijken': ['Faire contrôler la boîte', 'Get the gearbox checked'],
    'Een teller die uitvalt, een zwart scherm, een ABS-lampje of een camera die niet werkt. We herstellen het onderdeel zelf.': ['Un compteur qui lâche, un écran noir, un témoin ABS ou une caméra qui ne fonctionne pas. Nous réparons la pièce elle-même.', 'A failing instrument cluster, a black screen, an ABS light or a camera that doesn’t work. We repair the part itself.'],
    'Tellers': ['Compteurs', 'Instrument clusters'], 'Schermen': ['Écrans', 'Screens'], 'ABS-modules': ['Modules ABS', 'ABS modules'],
    'Elektronica laten testen': ['Faire tester l’électronique', 'Get electronics tested'],

    // Verkopen / inruil
    'Verkopen of inruilen': ['Vendre ou reprendre', 'Sell or trade in'],
    'Wat is uw auto waard?': ['Combien vaut votre voiture ?', 'What is your car worth?'],
    'Bod binnen 1 werkdag.': ['Offre en 1 jour ouvrable.', 'Offer within 1 working day.'],
    "Geef ons de gegevens van uw wagen en een paar foto's, en u krijgt binnen 1 werkdag een vrijblijvend bod. Ook als u geen auto bij ons koopt.": ['Donnez-nous les données de votre voiture et quelques photos, et vous recevez une offre sans engagement en 1 jour ouvrable. Même si vous n’achetez pas de voiture chez nous.', 'Give us your car’s details and a few photos, and you get a no-obligation offer within 1 working day. Even if you don’t buy a car from us.'],
    'Geen gedoe met advertenties': ['Pas de tracas avec les annonces', 'No hassle with ads'],
    'Geen proefritten met vreemden, geen onderhandelen.': ['Pas d’essais avec des inconnus, pas de marchandage.', 'No test drives with strangers, no haggling.'],
    'Inruil bij aankoop': ['Reprise à l’achat', 'Trade-in when you buy'],
    'Uw huidige wagen telt mee in de prijs van uw occasion.': ['Votre voiture actuelle est déduite du prix de votre occasion.', 'Your current car counts towards the price of your used car.'],
    'Ook mobilhomes en caravans': ['Aussi mobilhomes et caravanes', 'Motorhomes and caravans too'],
    'Of een wagen met schade of een defect.': ['Ou une voiture endommagée ou en panne.', 'Or a car with damage or a fault.'],
    'Uw wagen': ['Votre voiture', 'Your car'],
    'Soort voertuig': ['Type de véhicule', 'Type of vehicle'],
    'Auto': ['Voiture', 'Car'], 'Mobilhome': ['Mobilhome', 'Motorhome'], 'Caravan': ['Caravane', 'Caravan'],
    'Merk en model *': ['Marque et modèle *', 'Make and model *'],
    'Bouwjaar *': ['Année *', 'Year *'],
    'Kies': ['Choisir', 'Choose'],
    'Kilometerstand *': ['Kilométrage *', 'Mileage *'],
    'bv. Toyota Auris': ['p. ex. Toyota Auris', 'e.g. Toyota Auris'],
    'bv. 120.000': ['p. ex. 120.000', 'e.g. 120,000'],
    'Hoe is hij?': ['Dans quel état ?', 'What condition?'],
    'In welke staat is de wagen?': ['Dans quel état est la voiture ?', 'What condition is the car in?'],
    'Zo goed als nieuw': ['Comme neuve', 'As good as new'], 'Niets op aan te merken': ['Rien à signaler', 'Nothing to fault'],
    'Netjes': ['Soignée', 'Tidy'], 'Gewone sporen van gebruik': ['Traces d’usage normales', 'Normal signs of use'],
    'Wat werk aan': ['Quelques travaux', 'Needs some work'], 'Krassen, deukjes of slijtage': ['Rayures, petits creux ou usure', 'Scratches, dents or wear'],
    'Schade of defect': ['Dégâts ou panne', 'Damage or fault'], 'Rijdt niet goed of heeft schade': ['Roule mal ou endommagée', 'Doesn’t drive well or is damaged'],
    'Wat hebt u nog?': ['Qu’avez-vous encore ?', 'What do you still have?'],
    'Onderhoudsboekje': ['Carnet d’entretien', 'Service book'], 'Twee sleutels': ['Deux clés', 'Two keys'],
    'Nooit schade gehad': ['Jamais accidentée', 'Never damaged'], 'Recent gekeurd': ['Contrôle technique récent', 'Recently inspected'], 'Winterbanden': ['Pneus hiver', 'Winter tyres'],
    "Foto's (mag ook later)": ['Photos (peut aussi se faire plus tard)', 'Photos (can also be later)'],
    "Sleep foto's hierheen of tik om te kiezen": ['Glissez les photos ici ou touchez pour choisir', 'Drag photos here or tap to choose'],
    "Vier foto's rondom, het interieur en de kilometerteller. Hoogstens 8.": ['Quatre photos de tous côtés, l’intérieur et le compteur. 8 maximum.', 'Four photos all round, the interior and the odometer. 8 at most.'],
    'Waar mogen we u bereiken?': ['Où pouvons-nous vous joindre ?', 'Where can we reach you?'],
    'Naam *': ['Nom *', 'Name *'], 'Telefoon *': ['Téléphone *', 'Phone *'], 'E-mail': ['E-mail', 'Email'],
    'Ik wil inruilen tegen een wagen uit uw aanbod': ['Je souhaite faire reprendre ma voiture contre une de vos voitures', 'I want to trade in for one of your cars'],
    'We gebruiken deze gegevens alleen voor dit bod.': ['Nous utilisons ces données uniquement pour cette offre.', 'We only use these details for this offer.'],
    'Bedankt': ['Merci', 'Thank you'],
    'We bekijken uw wagen en sturen u': ['Nous examinons votre voiture et vous envoyons', 'We will look at your car and send you'],
    'binnen 1 werkdag': ['en 1 jour ouvrable', 'within 1 working day'],
    'een vrijblijvend bod.': ['une offre sans engagement.', 'a no-obligation offer.'],
    'Nog een wagen aanbieden': ['Proposer une autre voiture', 'Offer another car'],
    'Terug': ['Retour', 'Back'], 'Volgende': ['Suivant', 'Next'], 'Bevestig': ['Confirmer', 'Confirm'], 'Versturen…': ['Envoi…', 'Sending…'],
    'Opnieuw proberen': ['Réessayer', 'Try again'],

    // Financiering
    'Financiering': ['Financement', 'Financing'],
    'Liever per maand': ['Plutôt payer', 'Rather pay'],
    'betalen?': ['par mois ?', 'monthly?'],
    'U kunt uw wagen ook per maand afbetalen. Reken hier ruw uit wat dat kost; we bekijken daarna samen wat past en helpen u met de aanvraag.': ['Vous pouvez aussi payer votre voiture par mois. Calculez ici une estimation ; nous verrons ensuite ensemble ce qui vous convient et vous aiderons avec la demande.', 'You can also pay for your car monthly. Work out a rough figure here; then we will look together at what suits you and help with the application.'],
    'We bekijken samen wat past': ['Nous voyons ensemble ce qui convient', 'We look together at what suits you'],
    'Uw huidige wagen telt mee in de prijs': ['Votre voiture actuelle est déduite du prix', 'Your current car counts towards the price'],
    'Wij helpen u met de aanvraag': ['Nous vous aidons avec la demande', 'We help you with the application'],
    'Uw maandbedrag': ['Votre mensualité', 'Your monthly amount'],
    'Prijs van de wagen': ['Prix de la voiture', 'Price of the car'], 'Voorschot': ['Acompte', 'Deposit'],
    'Looptijd in maanden': ['Durée en mois', 'Term in months'], 'Looptijd': ['Durée', 'Term'],
    'Indicatief per maand': ['Indicatif par mois', 'Indicative per month'],
    'Vraag deze financiering aan': ['Demander ce financement', 'Apply for this financing'],

    // Reviews
    'op': ['sur', 'from'],
    'Google-reviews': ['avis Google', 'Google reviews'],
    'Echte Google-reviews, licht ingekort': ['Vrais avis Google (en néerlandais), légèrement raccourcis', 'Real Google reviews (in Dutch), slightly shortened'],
    'Wat klanten': ['Ce que les clients', 'What customers'],
    'over ons vertellen': ['disent de nous', 'say about us'],
    'Lees ze op Google': ['Lire sur Google', 'Read them on Google'],
    'Google, werkplaats': ['Google, atelier', 'Google, workshop'], 'Google, garantie': ['Google, garantie', 'Google, warranty'],

    // Over ons
    'Een kleine zaak,': ['Une petite entreprise,', 'A small business,'],
    'met mensen die u kent.': ['avec des gens que vous connaissez.', 'with people you know.'],
    'Al': ['Depuis', 'For'],
    'jaar verkopen en onderhouden we wagens in': ['ans, nous vendons et entretenons des voitures en', 'years we have sold and serviced cars in'],
    'de Kempen': ['Campine', 'the Kempen'],
    '. Car-Pass Trusted Provider. We spreken Nederlands, Frans en Engels.': ['. Car-Pass Trusted Provider. Nous parlons néerlandais, français et anglais.', '. Car-Pass Trusted Provider. We speak Dutch, French and English.'],
    'Vacatures': ['Offres d’emploi', 'Vacancies'],
    'Sleutelt u graag mee?': ['Envie de mettre les mains dans le cambouis ?', 'Like working on cars?'],
    'Monteur, diagnosetechnieker en stagiair gezocht, voor onze nieuwe werkplaats in Oud-Turnhout.': ['Nous cherchons un mécanicien, un technicien diagnostic et un stagiaire pour notre nouvel atelier à Oud-Turnhout.', 'Mechanic, diagnostic technician and intern wanted for our new workshop in Oud-Turnhout.'],
    'Solliciteer': ['Postuler', 'Apply'],
    'Uit de werkplaats': ['De l’atelier', 'From the workshop'],
    'Een occasion kopen: waar let u op?': ['Acheter une occasion : à quoi faire attention ?', 'Buying a used car: what to look out for?'],
    'Mag uw wagen in de lage-emissiezone van Antwerpen en Gent?': ['Votre voiture peut-elle entrer dans la zone de basses émissions d’Anvers et de Gand ?', 'Is your car allowed in the low-emission zones of Antwerp and Ghent?'],
    'Een tweedehands elektrische wagen: hoe gezond is de batterij?': ['Une voiture électrique d’occasion : quel est l’état de la batterie ?', 'A used electric car: how healthy is the battery?'],

    // Contact, footer
    'Kom langs': ['Passez nous voir', 'Drop by'],
    'of bel even.': ['ou appelez-nous.', 'or give us a call.'],
    'Route': ['Itinéraire', 'Directions'],
    'Showroom': ['Showroom', 'Showroom'],
    'Werkplaats': ['Atelier', 'Workshop'],
    'We spreken Nederlands, Frans en Engels.': ['Nous parlons néerlandais, français et anglais.', 'We speak Dutch, French and English.'],
    'We spreken Nederlands, Frans en Engels. Nous parlons français. We speak English.': ['Nous parlons néerlandais, français et anglais.', 'We speak Dutch, French and English.'],
    'Open in Google Maps': ['Ouvrir dans Google Maps', 'Open in Google Maps'],
    'Opent Google Maps in een nieuw tabblad.': ['Ouvre Google Maps dans un nouvel onglet.', 'Opens Google Maps in a new tab.'],
    'Occasions in elke prijsklasse, en een eigen werkplaats voor alle merken. Loop gerust eens binnen.': ['Des occasions dans toutes les gammes de prix et notre propre atelier pour toutes les marques. N’hésitez pas à passer.', 'Used cars at every price, and our own workshop for every make. Feel free to drop in.'],
    'Alle wagens': ['Toutes les voitures', 'All cars'],
    'Elektrisch en hybride': ['Électrique et hybride', 'Electric and hybrid'],
    'Banden en airco': ['Pneus et climatisation', 'Tyres and air conditioning'],
    'Klaar voor de keuring': ['Prêt pour le contrôle technique', 'Ready for the test'],
    'Velgen en automaten': ['Jantes et boîtes automatiques', 'Wheels and automatics'],
    'Meer': ['Plus', 'More'],
    'Tips': ['Conseils', 'Tips'],
    'Huurwagen': ['Voiture de location', 'Rental car'],
    'Pech onderweg': ['En panne', 'Breakdown'],
    'Kopen vanuit Nederland': ['Acheter depuis les Pays-Bas', 'Buying from the Netherlands'],
    'Openingsuren': ['Heures d’ouverture', 'Opening hours'],
    'Verkoop': ['Vente', 'Sales'],
    '· ondernemingsnummer en btw': ['· numéro d’entreprise et TVA', '· company and VAT number'],
    '· Partner van': ['· Partenaire de', '· Partner of'],
    'voor verhuur': ['pour la location', 'for rentals'],
    'Privacy': ['Vie privée', 'Privacy'], 'Cookies': ['Cookies', 'Cookies'], 'Algemene voorwaarden': ['Conditions générales', 'Terms and conditions'],
    'Juridisch': ['Mentions légales', 'Legal'],
    'Zon- en feestdagen gesloten': ['Fermé les dimanches et jours fériés', 'Closed on Sundays and public holidays'],
    'Snelle acties': ['Actions rapides', 'Quick actions'],
    'Afspraak': ['Rendez-vous', 'Appointment'],

    // Openingsuren (dagen)
    'Maandag': ['Lundi', 'Monday'], 'Dinsdag': ['Mardi', 'Tuesday'], 'Woensdag': ['Mercredi', 'Wednesday'], 'Donderdag': ['Jeudi', 'Thursday'],
    'Vrijdag': ['Vendredi', 'Friday'], 'Zaterdag': ['Samedi', 'Saturday'], 'Zondag': ['Dimanche', 'Sunday'],
    'Gesloten': ['Fermé', 'Closed'],
    'Vandaag online': ['En ligne aujourd’hui', 'Online today'], 'Gisteren online': ['En ligne depuis hier', 'Online since yesterday'],
    'Bel ons even': ['Appelez-nous', 'Give us a call'],

    // Vergelijken, favorieten
    '/3 gekozen': ['/3 choisies', '/3 selected'],
    'Vergelijk': ['Comparer', 'Compare'],
    'Vergelijking wissen': ['Effacer la comparaison', 'Clear comparison'],
    'Wagens vergelijken': ['Comparer des voitures', 'Compare cars'],
    'Wagen in detail': ['Voiture en détail', 'Car details'],
    'Per maand*': ['Par mois*', 'Per month*'],
    'Kilometerstand': ['Kilométrage', 'Mileage'],
    'Vermogen': ['Puissance', 'Power'],
    'Transmissie': ['Transmission', 'Transmission'],
    'Carrosserie': ['Carrosserie', 'Body'],
    'Deuren': ['Portes', 'Doors'],
    'Kleur': ['Couleur', 'Colour'],
    'Emissienorm': ['Norme d’émission', 'Emission standard'],
    '● = beste waarde in deze vergelijking.': ['● = meilleure valeur de cette comparaison.', '● = best value in this comparison.'],
    'Nog geen bewaarde wagens.': ['Pas encore de voitures enregistrées.', 'No saved cars yet.'],
    'Tik op het hartje bij een occasion.': ['Touchez le cœur sur une occasion.', 'Tap the heart on a car.'],
    'Stuur mijn lijst via WhatsApp': ['Envoyer ma liste via WhatsApp', 'Send my list via WhatsApp'],
    'Verwijder': ['Supprimer', 'Remove'],
    'Bewaard bij uw favorieten': ['Ajoutée à vos favoris', 'Saved to your favourites'],
    'Verwijderd uit uw favorieten': ['Retirée de vos favoris', 'Removed from your favourites'],
    'U kunt maximaal 3 wagens vergelijken': ['Vous pouvez comparer 3 voitures au maximum', 'You can compare up to 3 cars'],

    // Detailvenster
    'Voor de verkoop, door onze eigen monteurs': ['Avant la vente, par nos propres mécaniciens', 'Before sale, by our own mechanics'],
    'Te verlengen tot 36 maanden': ['Prolongeable jusqu’à 36 mois', 'Extendable to 36 months'],
    'Bekijk de Car-Pass': ['Voir le Car-Pass', 'View the Car-Pass'],
    'Kilometerstand gecontroleerd': ['Kilométrage contrôlé', 'Mileage verified'],
    'Technische gegevens': ['Données techniques', 'Specifications'],
    'Uitrusting in de kijker': ['Équipements à noter', 'Equipment highlights'],
    'Omschrijving': ['Description du vendeur (en néerlandais)', 'Seller’s description (in Dutch)'],
    'Btw inbegrepen': ['TVA comprise', 'VAT included'],
    'Vraag ons de prijs': ['Demandez-nous le prix', 'Ask us for the price'],
    'We bekijken samen wat past en helpen u met de aanvraag. Let op, geld lenen kost ook geld.': ['Nous voyons ensemble ce qui convient et vous aidons avec la demande. Attention, emprunter de l’argent coûte aussi de l’argent.', 'We look together at what suits you and help with the application. Beware: borrowing money also costs money.'],
    'Vraag een maandbedrag': ['Demander une mensualité', 'Ask for a monthly amount'],
    'Plan een proefrit': ['Planifier un essai', 'Book a test drive'],
    'Zet me op de wachtlijst': ['M’inscrire sur la liste d’attente', 'Put me on the waiting list'],
    'Plan een bezichtiging': ['Planifier une visite', 'Book a viewing'],
    'Bel verkoop': ['Appeler la vente', 'Call sales'],
    'Wachtlijst voor deze wagen': ['Liste d’attente pour cette voiture', 'Waiting list for this car'],
    'Kies een moment': ['Choisissez un moment', 'Choose a time'],
    'Valt de reservatie weg, dan bellen we u meteen.': ['Si la réservation est annulée, nous vous appelons aussitôt.', 'If the reservation falls through, we will call you straight away.'],
    'Uur': ['Heure', 'Time'],
    'Bevestig afspraak': ['Confirmer le rendez-vous', 'Confirm appointment'],
    'Geen uren meer vrij': ['Plus d’heures libres', 'No times left'],
    'Bewaren': ['Enregistrer', 'Save'],
    'Delen': ['Partager', 'Share'],
    'Ook op 2dehands': ['Aussi sur 2ememain', 'Also on 2dehands'],
    'Prijsalarm': ['Alerte prix', 'Price alert'],
    'Krijg een bericht als de prijs zakt of de wagen gereserveerd wordt.': ['Recevez un message si le prix baisse ou si la voiture est réservée.', 'Get a message if the price drops or the car is reserved.'],
    'Uw e-mailadres': ['Votre adresse e-mail', 'Your email address'],
    'Zet aan': ['Activer', 'Turn on'],
    'Prijsalarm staat aan': ['Alerte prix activée', 'Price alert is on'],
    'Vorige foto': ['Photo précédente', 'Previous photo'], 'Volgende foto': ['Photo suivante', 'Next photo'],
    'Deze wagen verkopen we': ['Nous vendons cette voiture', 'We sell this car'],
    'zonder keuring en zonder garantie': ['sans contrôle technique et sans garantie', 'without inspection and without warranty'],
    ', voor export of handelaars.': [', pour l’export ou les négociants.', ', for export or traders.'],
    'Vul een geldig e-mailadres in': ['Saisissez une adresse e-mail valide', 'Enter a valid email address'],
    'Dat lukte niet. Probeer het later opnieuw.': ['Cela n’a pas fonctionné. Réessayez plus tard.', 'That didn’t work. Please try again later.'],
    'Vul uw naam en telefoonnummer in': ['Indiquez votre nom et votre numéro de téléphone', 'Enter your name and phone number'],
    'Versturen lukte niet. Bel ons gerust.': ['L’envoi n’a pas fonctionné. N’hésitez pas à nous appeler.', 'Sending didn’t work. Feel free to call us.'],
    'Maak een keuze': ['Faites un choix', 'Make a choice'],
    'Vul de verplichte velden in': ['Remplissez les champs obligatoires', 'Fill in the required fields'],

    // Afspraak (werkplaats)
    'Afspraak werkplaats': ['Rendez-vous atelier', 'Workshop appointment'],
    'Wat mogen we doen?': ['Que pouvons-nous faire ?', 'What can we do?'],
    'Beschrijf kort wat er scheelt (optioneel)': ['Décrivez brièvement le problème (facultatif)', 'Briefly describe what is wrong (optional)'],
    'bv. piepend geluid bij remmen, oranje lampje brandt…': ['p. ex. bruit au freinage, témoin orange allumé…', 'e.g. squeaking when braking, orange warning light on…'],
    'Wanneer past het?': ['Quand cela vous convient-il ?', 'When suits you?'],
    'Kies een dag': ['Choisissez un jour', 'Choose a day'],
    'Kies een uur': ['Choisissez une heure', 'Choose a time'],
    'Kies eerst een dag.': ['Choisissez d’abord un jour.', 'Choose a day first.'],
    'Tijdens de werken': ['Pendant les travaux', 'During the work'],
    'Ik wacht ter plaatse': ['J’attends sur place', 'I’ll wait on site'],
    'Ik laat hem achter': ['Je la laisse', 'I’ll leave it'],
    'Ik laat mijn wagen achter': ['Je laisse ma voiture', 'I’ll leave my car'],
    'Vervangwagen': ['Voiture de remplacement', 'Courtesy car'],
    'Ik heb een vervangwagen nodig': ['J’ai besoin d’une voiture de remplacement', 'I need a courtesy car'],
    'bv. Peugeot 208': ['p. ex. Peugeot 208', 'e.g. Peugeot 208'],
    'bv. 85.000': ['p. ex. 85.000', 'e.g. 85,000'],
    'Uw gegevens': ['Vos coordonnées', 'Your details'],
    'Werken': ['Travaux', 'Work'], 'Moment': ['Moment', 'Time'], 'Wagen': ['Voiture', 'Car'],
    'Zie beschrijving': ['Voir description', 'See description'],
    'Kies minstens één dienst': ['Choisissez au moins un service', 'Choose at least one service'],
    'Kies een dag en een uur': ['Choisissez un jour et une heure', 'Choose a day and a time'],
    'Afspraak aangevraagd': ['Rendez-vous demandé', 'Appointment requested'],
    'We bevestigen binnen het uur per telefoon of sms.': ['Nous confirmons dans l’heure par téléphone ou SMS.', 'We will confirm within the hour by phone or text.'],
    'Zet in mijn agenda': ['Ajouter à mon agenda', 'Add to my calendar'],

    // Uitrusting (van 2dehands)
    'Navigatie': ['Navigation', 'Navigation'], 'Panoramisch dak': ['Toit panoramique', 'Panoramic roof'], 'Leder interieur': ['Intérieur cuir', 'Leather interior'],
    'Parkeersensoren': ['Capteurs de stationnement', 'Parking sensors'], 'Achteruitrijcamera': ['Caméra de recul', 'Reversing camera'],
    'Cruise control': ['Régulateur de vitesse', 'Cruise control'], 'Trekhaak': ['Crochet d’attelage', 'Tow bar'], '7 zitplaatsen': ['7 places', '7 seats'],
    'Matrix-LED-koplampen': ['Phares LED Matrix', 'Matrix LED headlights'], 'Apple CarPlay': ['Apple CarPlay', 'Apple CarPlay'], 'Android Auto': ['Android Auto', 'Android Auto'],
    'Apple CarPlay / Android Auto': ['Apple CarPlay / Android Auto', 'Apple CarPlay / Android Auto'], 'Airbump-panelen': ['Panneaux Airbump', 'Airbump panels'],
    'Stoelverwarming': ['Sièges chauffants', 'Heated seats'], 'Start-stopsysteem': ['Système start-stop', 'Start-stop system'], 'Bluetooth': ['Bluetooth', 'Bluetooth'],
    'Elektrische ramen': ['Vitres électriques', 'Electric windows'], 'Btw aftrekbaar': ['TVA déductible', 'VAT deductible'],
    'Stuurverwarming': ['Volant chauffant', 'Heated steering wheel'], 'Climate control': ['Climatisation automatique', 'Climate control'],
    'Lichtmetalen velgen': ['Jantes en alliage', 'Alloy wheels'], 'Elektrische achterklep': ['Hayon électrique', 'Electric tailgate'],
    'Head-up display': ['Affichage tête haute', 'Head-up display'], 'Keyless': ['Sans clé', 'Keyless'], 'Mild hybrid': ['Hybride léger', 'Mild hybrid'],
    'Zelfopladende hybride': ['Hybride auto-rechargeable', 'Self-charging hybrid'],
  };

  /* ---------------- Teksten die de site zelf samenstelt, met {plaatshouders} ---------------- */
  Object.assign(D, {
    'Vandaag': ['Aujourd’hui', 'Today'], 'Morgen': ['Demain', 'Tomorrow'],
    '{n} dagen geleden online': ['En ligne depuis {n} jours', 'Online for {n} days'],
    '{name} · Occasions en werkplaats in {city}': ['{name} · Occasions et atelier à {city}', '{name} · Used cars and workshop in {city}'],
    'Nagekeken occasions met Car-Pass en tot 36 maanden garantie, en een eigen werkplaats voor alle merken in Oud-Turnhout. Vrijblijvend bod op uw wagen binnen 1 werkdag.': ['Occasions contrôlées avec Car-Pass et jusqu’à 36 mois de garantie, et notre propre atelier pour toutes les marques à Oud-Turnhout. Offre sans engagement pour votre voiture en 1 jour ouvrable.', 'Checked used cars with Car-Pass and up to 36 months’ warranty, and our own workshop for every make in Oud-Turnhout. A no-obligation offer for your car within 1 working day.'],
    'open tot {t}': ['ouvert jusqu’à {t}', 'open until {t}'],
    'opent vandaag om {t}': ['ouvre aujourd’hui à {t}', 'opens today at {t}'],
    'opent morgen om {t}': ['ouvre demain à {t}', 'opens tomorrow at {t}'],
    'opent {day} om {t}': ['ouvre {day} à {t}', 'opens {day} at {t}'],
    'gesloten': ['fermé', 'closed'],
    'Nu open tot {t}': ['Ouvert jusqu’à {t}', 'Open until {t}'],
    'Gesloten · {s}': ['Fermé · {s}', 'Closed · {s}'],
    'Nu {s}': ['Maintenant {s}', 'Now {s}'],
    'Gesloten, {s}': ['Fermé, {s}', 'Closed, {s}'],
    'Showroom {a}, werkplaats {b}': ['Showroom {a}, atelier {b}', 'Showroom {a}, workshop {b}'],
    'Showroom: {a}<br>Werkplaats: {b}<br>Zon- en feestdagen gesloten': ['Showroom : {a}<br>Atelier : {b}<br>Fermé les dimanches et jours fériés', 'Showroom: {a}<br>Workshop: {b}<br>Closed on Sundays and public holidays'],
    'km op aanvraag': ['km sur demande', 'mileage on request'],
    'vanaf {y}': ['à partir de {y}', 'from {y}'],
    'of ≈ {p}/mnd*': ['ou ≈ {p}/mois*', 'or ≈ {p}/month*'],
    '≈ {p}/mnd*': ['≈ {p}/mois*', '≈ {p}/month*'],
    'Kredietbedrag {amount}, {months} maanden, totaal terug te betalen {total}. JKP {apr}%, vaste debetrentevoet {rate}%. Indicatief, geen offerte. <strong>Let op, geld lenen kost ook geld.</strong>': [
      'Montant du crédit {amount}, {months} mois, montant total à rembourser {total}. TAEG {apr} %, taux débiteur fixe {rate} %. Indicatif, pas une offre. <strong>Attention, emprunter de l’argent coûte aussi de l’argent.</strong>',
      'Loan amount {amount}, {months} months, total to repay {total}. APR {apr}%, fixed borrowing rate {rate}%. Indicative, not an offer. <strong>Beware: borrowing money also costs money.</strong>'],
    '* Indicatief, 60 maanden zonder voorschot. Let op, geld lenen kost ook geld.': ['* Indicatif, 60 mois sans acompte. Attention, emprunter de l’argent coûte aussi de l’argent.', '* Indicative, 60 months without deposit. Beware: borrowing money also costs money.'],
    '{free} van {n} vrij op {day}': ['{free} sur {n} libres le {day}', '{free} of {n} free on {day}'],
    '{day} om {time}': ['{day} à {time}', '{day} at {time}'],
    'We verwachten u <b>{when}</b> voor {what}. We bevestigen binnen het uur per telefoon of sms.': ['Nous vous attendons <b>{when}</b> pour : {what}. Nous confirmons dans l’heure par téléphone ou SMS.', 'We expect you <b>{when}</b> for: {what}. We will confirm within the hour by phone or text.'],
    'uw afspraak': ['votre rendez-vous', 'your appointment'],
    'Bedankt, {name}!': ['Merci, {name} !', 'Thank you, {name}!'],
    'U staat op de wachtlijst. We bellen u zodra de wagen vrijkomt.': ['Vous êtes sur la liste d’attente. Nous vous appelons dès que la voiture se libère.', 'You are on the waiting list. We will call you as soon as the car becomes available.'],
    'We verwachten u {when}. We bellen nog even om te bevestigen.': ['Nous vous attendons {when}. Nous vous appellerons pour confirmer.', 'We expect you {when}. We will give you a quick call to confirm.'],
    '5 sterren': ['5 étoiles', '5 stars'],
    'uw@e-mail.be': ['votre@e-mail.be', 'you@email.com'],
    // Draaiende wagens bovenaan, merkenrij, cijfers, over ons, slotblok
    'In de kijker': ['À la une', 'Featured'],
    'Wagen {n} van {total}': ['Voiture {n} sur {total}', 'Car {n} of {total}'],
    '+{n} merken': ['+{n} marques', '+{n} makes'],
    'Minder merken': ['Moins de marques', 'Fewer makes'],
    'In cijfers': ['En chiffres', 'In numbers'],
    'Merken in ons aanbod': ['Marques en stock', 'Makes in stock'],
    'occasions op voorraad, allemaal nagekeken': ['occasions en stock, toutes contrôlées', 'used cars in stock, all checked'],
    'punten gecontroleerd bij de keuring voor verkoop': ['points vérifiés lors du contrôle technique de vente', 'points checked at the pre-sale inspection'],
    'maanden garantie, standaard minstens 12': ['mois de garantie, au moins 12 de série', 'months’ warranty, at least 12 as standard'],
    'op Google, uit': ['sur Google, d’après', 'on Google, from'],
    'jaar': ['ans', 'years'],
    'Occasions en onderhoud in': ['Occasions et entretien en', 'Used cars and servicing in'],
    'We spreken uw taal': ['Nous parlons votre langue', 'We speak your language'],
    'Eigen werkplaats voor onderhoud en herstelling': ['Notre propre atelier pour l’entretien et les réparations', 'Our own workshop for servicing and repairs'],
    'Klaar voor uw volgende wagen?': ['Prêt pour votre prochaine voiture ?', 'Ready for your next car?'],
    'Tot binnenkort': ['À bientôt', 'See you soon'],
    // Pagina per wagen, fotoviewer, vergelijkbare wagens, WhatsApp-knop
    "Foto's op volledig scherm": ['Photos en plein écran', 'Full-screen photos'],
    "Foto's": ['Photos', 'Photos'],
    "Foto's pauzeren": ['Mettre les photos en pause', 'Pause photos'],
    "Foto's afspelen": ['Lire les photos', 'Play photos'],
    'Vergelijkbare wagens': ['Voitures similaires', 'Similar cars'],
    'Onlangs bekeken': ['Vues récemment', 'Recently viewed'],
    'Volledige pagina': ['Page complète', 'Full page'],
    'Verkocht': ['Vendue', 'Sold'],
    'Deze wagen is': ['Cette voiture est', 'This car has'],
    'al verkocht.': ['déjà vendue.', 'already been sold.'],
    'Goed nieuws voor de nieuwe eigenaar. Bekijk ons andere aanbod, of vraag ons naar een gelijkaardige wagen.': ['Bonne nouvelle pour le nouveau propriétaire. Découvrez nos autres voitures, ou demandez-nous une voiture similaire.', 'Good news for the new owner. Have a look at our other cars, or ask us about a similar one.'],
    'Kruimelpad': ['Fil d’Ariane', 'Breadcrumb'],
    'Home': ['Accueil', 'Home'],
    'Vragen? WhatsApp ons': ['Une question ? WhatsApp', 'Questions? WhatsApp us'],
    'Stel uw vraag via WhatsApp': ['Posez votre question via WhatsApp', 'Ask your question on WhatsApp'],
    'Bij ons praat u met de mensen die uw wagen echt kennen, van de aankoop tot het onderhoud jaren later.': ['Chez nous, vous parlez aux personnes qui connaissent vraiment votre voiture, de l’achat jusqu’à l’entretien des années plus tard.', 'Here you talk to the people who really know your car, from the purchase to the servicing years later.'],
    'Klaar voor uw': ['Prêt pour votre', 'Ready for your'],
    'volgende wagen?': ['prochaine voiture ?', 'next car?'],
    'Kom langs voor een proefrit of stuur ons een bericht. We helpen u graag, in het Nederlands, Frans of Engels.': ['Passez pour un essai ou envoyez-nous un message. Nous vous aidons volontiers, en néerlandais, en français ou en anglais.', 'Drop by for a test drive or send us a message. We are happy to help, in Dutch, French or English.'],
    'Elektronica': ['Électronique', 'Electronics'],
    // WhatsApp-berichten (de klant verstuurt ze zelf; de zaak spreekt NL, FR en EN)
    'Hallo {name}, ': ['Bonjour {name}, ', 'Hello {name}, '],
    'Hallo, deze wagens interesseren mij:': ['Bonjour, ces voitures m’intéressent :', 'Hello, I am interested in these cars:'],
    'Hallo, ik heb interesse in de {car} ({year}, {price}).': ['Bonjour, je suis intéressé(e) par la {car} ({year}, {price}).', 'Hello, I am interested in the {car} ({year}, {price}).'],
    'Hallo, ik wil graag een maandbedrag voor de {car} ({price}).': ['Bonjour, je souhaite connaître la mensualité pour la {car} ({price}).', 'Hello, I would like a monthly amount for the {car} ({price}).'],
    'Hallo, ik wil graag financiering aanvragen: wagen van {price}, voorschot {down}, {months} maanden (indicatief {m} per maand).': ['Bonjour, je souhaite demander un financement : voiture de {price}, acompte {down}, {months} mois (indicatif {m} par mois).', 'Hello, I would like to apply for financing: car of {price}, deposit {down}, {months} months (indicative {m} per month).'],
    'Hallo, ik ben een garage en wil graag eens samenwerken.': ['Bonjour, je suis un garage et j’aimerais collaborer avec vous.', 'Hello, I run a garage and would like to work together.'],
    'Hallo, ik woon in Nederland en wil graag een wagen kopen. Hoe gaat dat?': ['Bonjour, j’habite aux Pays-Bas et j’aimerais acheter une voiture. Comment ça se passe ?', 'Hello, I live in the Netherlands and would like to buy a car. How does that work?'],
    'Hallo, ik zoek een wagen maar vind niet meteen wat ik zoek. Kunnen jullie me iets laten weten als er iets binnenkomt?': ['Bonjour, je cherche une voiture mais je ne trouve pas tout de suite ce qu’il me faut. Pouvez-vous me prévenir si quelque chose arrive ?', 'Hello, I am looking for a car but can’t find what I want yet. Could you let me know if something comes in?'],
    'Hallo, wat zou een onderhoudsabonnement kosten voor mijn wagen?': ['Bonjour, combien coûterait un abonnement d’entretien pour ma voiture ?', 'Hello, what would a servicing plan cost for my car?'],
  });

  /* ---------------- Dagen en maanden (de site bouwt data zelf op met deze lijsten) ---------------- */
  const CAL = {
    fr: { day: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'], short: ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'], month: ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'] },
    en: { day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
  }[lang];

  /* ---------------- Teksten met een getal of naam erin: [patroon, (delen) => [Frans, Engels], alleen voor attributen?] ---------------- */
  const P = [
    [/^Stap (\d+) van (\d+)$/, (m, a, b) => [`Étape ${a} sur ${b}`, `Step ${a} of ${b}`]],
    [/^(\d+) punten$/, (m, n) => [`${n} points`, `${n} points`]],
    [/^(\d+) maanden$/, (m, n) => [`${n} mois`, `${n} months`]],
    [/^(\d+) mnd garantie$/, (m, n) => [`${n} mois de garantie`, `${n} months’ warranty`]],
    [/^(\d+) mnd$/, (m, n) => [`${n} mois`, `${n} mths`]],
    [/^(\d+) pk$/, (m, p) => [`${p} ch`, `${p} hp`]],
    [/^Vergelijk (\d+) wagens$/, (m, n) => [`Comparer ${n} voitures`, `Compare ${n} cars`]],
    [/^Foto (\d+)$/, (m, n) => [`Photo ${n}`, `Photo ${n}`]],
    [/^(\d\d:\d\d) volzet$/, (m, x) => [`${x} complet`, `${x} fully booked`]],
    [/^We mailen naar (.+) als er iets verandert\.$/, (m, e) => [`Nous écrirons à ${e} en cas de changement.`, `We will email ${e} if anything changes.`]],
    // Alleen in labels voor schermlezers (bv. "Bekijk Volkswagen Golf")
    [/^Bekijk (.+)$/, (m, n) => [`Voir ${n}`, `View ${n}`], true],
    [/^Bewaar (.+)$/, (m, n) => [`Enregistrer ${n}`, `Save ${n}`], true],
    [/^Verwijder (.+) uit vergelijking$/, (m, n) => [`Retirer ${n} de la comparaison`, `Remove ${n} from comparison`], true],
    [/^Vergelijk (.+)$/, (m, n) => [`Comparer ${n}`, `Compare ${n}`], true],
    [/^Plan (.+)$/, (m, s) => { const v = (look(s.charAt(0).toUpperCase() + s.slice(1)) || s).toLowerCase(); return [`Planifier : ${v}`, `Book: ${v}`]; }, true],
  ];

  // Getallen in de vaste tekst ("€ 5.000", "100.000 km") in de schrijfwijze van de taal
  const LOC = lang === 'fr' ? 'fr-BE' : 'en-GB';
  const NUM = /^(€\s?)?(\d{1,3}(?:\.\d{3})+)(\s?km)?$/;
  const fmtNum = (euro, digits, kmUnit) => {
    const n = +digits.replace(/\./g, '');
    const s = euro ? new Intl.NumberFormat(LOC, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(n) : new Intl.NumberFormat(LOC).format(n);
    return s + (kmUnit ? ' km' : '');
  };

  // Zoek één tekst op (zonder spaties rond)
  function look(k, attr) {
    if (D[k]) return D[k][L];
    const nm = k.match(NUM);
    if (nm) return fmtNum(nm[1], nm[2], nm[3]);
    if (!/[a-zA-ZÀ-ÿ]/.test(k)) return null;
    for (const [re, fn, onlyAttr] of P) { if (onlyAttr && !attr) continue; const m = k.match(re); if (m) return fn(...m)[L]; }
    // "Benzine · Automaat" of " · Volkswagen · vanaf 2020": elk deel apart
    if (k.includes('·')) {
      let changed = false;
      const out = k.replace(/[^·]+/g, seg => { const s2 = seg.trim(); const v = s2 && look(s2, attr); if (v == null || v === false || v === s2) return seg; changed = true; return seg.replace(s2, () => v); });
      return changed ? out : null;
    }
    return null;
  }
  // Vertaal één tekst (de spaties rond blijven staan)
  function tr(s, attr) {
    if (lang === 'nl' || s == null) return s;
    const k = String(s).trim();
    if (!k) return s;
    const v = look(k, attr);
    return v == null ? s : String(s).replace(k, () => v);
  }
  // Voor de code: T('Nu open tot {t}', { t: '18:00' })
  function t(s, vars) {
    const tpl = lang !== 'nl' && D[s] ? D[s][L] : s;
    return vars ? tpl.replace(/\{(\w+)\}/g, (_, n) => vars[n] ?? '') : tpl;
  }

  const ATTRS = ['placeholder', 'aria-label', 'title', 'alt', 'data-wa-text'];
  const SKIP = new Set(['SCRIPT', 'STYLE', 'CODE', 'svg']);
  const doText = n => { const v = tr(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; };
  const doAttrs = el => { for (const a of ATTRS) if (el.hasAttribute(a)) { const o = el.getAttribute(a), v = tr(o, true); if (v !== o) el.setAttribute(a, v); } };
  const skipped = el => SKIP.has(el.nodeName) || el.hasAttribute('data-no-i18n');
  function translateTree(root) {
    if (lang === 'nl' || !root) return;
    if (root.nodeType === 3) { if (!(root.parentElement && root.parentElement.closest('[data-no-i18n],svg,script,style,textarea'))) doText(root); return; }
    if (root.nodeType !== 1 || root.closest('[data-no-i18n]') || skipped(root)) return;
    doAttrs(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.nodeType === 1 && skipped(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    let n;
    while ((n = walker.nextNode())) n.nodeType === 3 ? doText(n) : doAttrs(n);
  }

  function setLang(l, btn) {
    if (!LANGS.includes(l)) return;
    try { localStorage.setItem('at-lang', l); sessionStorage.setItem('at-lang', l); } catch { /* private mode */ }
    try { sessionStorage.setItem('at-keep', JSON.stringify(place(btn))); } catch { /* private mode: the page opens at the top */ }
    const u = new URL(location.href);
    if (l === 'nl') u.searchParams.delete('lang'); else u.searchParams.set('lang', l);
    u.hash = '';
    location.replace(u.toString());
  }
  // Place on the page, without counting animations
  function docTop(el) { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; }
  // Where the visitor is: the piece of the page just under the header (or the language button itself, in the footer)
  function place(btn) {
    document.querySelectorAll('dialog[open]').forEach(d => d.close());
    const head = document.querySelector('.header');
    let el = btn && btn.closest('.footer') ? btn : document.elementFromPoint(innerWidth / 2, (head ? Math.max(0, head.getBoundingClientRect().bottom) : 0) + 70);
    while (el && !(el instanceof HTMLElement)) el = el.parentElement;
    const path = [];
    for (let n = el; n && n !== document.body && n.parentElement; n = n.parentElement) path.unshift([...n.parentElement.children].indexOf(n));
    const sec = el && el.closest('section[id]');
    return { page: location.pathname, t: Date.now(), y: scrollY, top: scrollY < 8, path, tag: el ? el.tagName : '', off: el ? docTop(el) - scrollY : 0, sec: sec ? sec.id : '', secOff: sec ? docTop(sec) - scrollY : 0, more: window.AT_KEEP ? window.AT_KEEP() : null };
  }

  // Taalknoppen (header, menu, footer): <a data-lang="fr" href="?lang=fr">FR</a>
  document.querySelectorAll('[data-lang]').forEach(b => {
    const on = b.dataset.lang === lang;
    if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    b.addEventListener('click', e => { e.preventDefault(); if (!on) setLang(b.dataset.lang, b); });
  });

  document.documentElement.lang = lang === 'nl' ? 'nl-BE' : lang === 'fr' ? 'fr-BE' : 'en';
  if (lang !== 'nl') {
    const md = document.querySelector('meta[name="description"]');
    if (md) md.content = tr(md.content);
    translateTree(document.body);
    new MutationObserver(list => {
      for (const m of list) {
        if (m.type === 'childList') m.addedNodes.forEach(translateTree);
        else if (m.type === 'characterData') translateTree(m.target);
        else if (m.target.closest && !m.target.closest('[data-no-i18n]')) { const o = m.target.getAttribute(m.attributeName), v = tr(o, true); if (v !== o) m.target.setAttribute(m.attributeName, v); }
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  // After a language change the page shows once the visitor is back at the same place (see restorePlace in app.js)
  if (!readVisit('at-keep')) document.documentElement.classList.remove('i18n-wait');
  window.I18N = { lang, langs: LANGS, docTop, cal: CAL, t, tr: s => tr(s), setLang, translate: translateTree };
})();
