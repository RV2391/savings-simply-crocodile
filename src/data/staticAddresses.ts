// Static address database for DACH region (Germany, Austria, Switzerland)
// This provides offline address search functionality without external APIs

export interface StaticAddress {
  city: string;
  state?: string;
  country: string;
  postcode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  searchTerms: string[];
}

export const staticAddresses: StaticAddress[] = [
  // Germany - Major cities
  {
    city: "Berlin",
    state: "Berlin",
    country: "Deutschland",
    postcode: "10115",
    coordinates: { lat: 52.5200, lng: 13.4050 },
    searchTerms: ["berlin", "hauptstadt", "spree", "10115", "10xxx"]
  },
  {
    city: "Hamburg",
    state: "Hamburg",
    country: "Deutschland", 
    postcode: "20095",
    coordinates: { lat: 53.5488, lng: 9.9872 },
    searchTerms: ["hamburg", "hansestadt", "elbe", "20095", "20xxx"]
  },
  {
    city: "München",
    state: "Bayern",
    country: "Deutschland",
    postcode: "80331", 
    coordinates: { lat: 48.1351, lng: 11.5820 },
    searchTerms: ["münchen", "munich", "bayern", "bavaria", "80331", "80xxx"]
  },
  {
    city: "Köln",
    state: "Nordrhein-Westfalen",
    country: "Deutschland",
    postcode: "50667",
    coordinates: { lat: 50.9375, lng: 6.9603 },
    searchTerms: ["köln", "cologne", "dom", "rhein", "50667", "50xxx"]
  },
  // Paderborn and NRW cities - MISSING CITIES ADDED
  {
    city: "Paderborn",
    state: "Nordrhein-Westfalen",
    country: "Deutschland",
    postcode: "33100",
    coordinates: { lat: 51.7189, lng: 8.7575 },
    searchTerms: ["paderborn", "33100", "33xxx", "technologiepark", "universität", "nrw"]
  },
  {
    city: "Düsseldorf",
    state: "Nordrhein-Westfalen", 
    country: "Deutschland",
    postcode: "40210",
    coordinates: { lat: 51.2277, lng: 6.7735 },
    searchTerms: ["düsseldorf", "40210", "40xxx", "rhein", "nrw"]
  },
  {
    city: "Dortmund",
    state: "Nordrhein-Westfalen",
    country: "Deutschland", 
    postcode: "44135",
    coordinates: { lat: 51.5136, lng: 7.4653 },
    searchTerms: ["dortmund", "44135", "44xxx", "ruhrgebiet", "bvb", "nrw"]
  },
  {
    city: "Essen",
    state: "Nordrhein-Westfalen",
    country: "Deutschland",
    postcode: "45127",
    coordinates: { lat: 51.4566, lng: 7.0119 },
    searchTerms: ["essen", "45127", "45xxx", "ruhrgebiet", "zollverein", "nrw"]
  },
  {
    city: "Bielefeld",
    state: "Nordrhein-Westfalen",
    country: "Deutschland",
    postcode: "33602",
    coordinates: { lat: 52.0302, lng: 8.5325 },
    searchTerms: ["bielefeld", "33602", "33xxx", "owl", "ostwestfalen", "nrw"]
  },
  {
    city: "Bochum",
    state: "Nordrhein-Westfalen",
    country: "Deutschland",
    postcode: "44787",
    coordinates: { lat: 51.4818, lng: 7.2162 },
    searchTerms: ["bochum", "44787", "44xxx", "ruhr", "rub", "nrw"]
  },
  {
    city: "Wuppertal",
    state: "Nordrhein-Westfalen",
    country: "Deutschland",
    postcode: "42103",
    coordinates: { lat: 51.2562, lng: 7.1508 },
    searchTerms: ["wuppertal", "42103", "42xxx", "schwebebahn", "bergisches land", "nrw"]
  },
  {
    city: "Bonn",
    state: "Nordrhein-Westfalen",
    country: "Deutschland",
    postcode: "53111",
    coordinates: { lat: 50.7374, lng: 7.0982 },
    searchTerms: ["bonn", "53111", "53xxx", "rhein", "bundesstadt", "nrw"]
  },
  {
    city: "Münster",
    state: "Nordrhein-Westfalen",
    country: "Deutschland",
    postcode: "48143",
    coordinates: { lat: 51.9607, lng: 7.6261 },
    searchTerms: ["münster", "48143", "48xxx", "westfalen", "universität", "nrw"]
  },
  {
    city: "Aachen",
    state: "Nordrhein-Westfalen",
    country: "Deutschland",
    postcode: "52062",
    coordinates: { lat: 50.7753, lng: 6.0839 },
    searchTerms: ["aachen", "52062", "52xxx", "rwth", "karlspreis", "nrw"]
  },
  {
    city: "Mönchengladbach",
    state: "Nordrhein-Westfalen",
    country: "Deutschland",
    postcode: "41061",
    coordinates: { lat: 51.1805, lng: 6.4428 },
    searchTerms: ["mönchengladbach", "41061", "41xxx", "gladbach", "nrw"]
  },
  {
    city: "Gelsenkirchen",
    state: "Nordrhein-Westfalen",
    country: "Deutschland",
    postcode: "45879",
    coordinates: { lat: 51.5177, lng: 7.0857 },
    searchTerms: ["gelsenkirchen", "45879", "45xxx", "schalke", "ruhrgebiet", "nrw"]
  },
  // Bavaria cities
  {
    city: "Nürnberg",
    state: "Bayern",
    country: "Deutschland",
    postcode: "90402",
    coordinates: { lat: 49.4521, lng: 11.0767 },
    searchTerms: ["nürnberg", "nuremberg", "90402", "90xxx", "franken", "bayern"]
  },
  {
    city: "Augsburg",
    state: "Bayern",
    country: "Deutschland",
    postcode: "86150",
    coordinates: { lat: 48.3705, lng: 10.8978 },
    searchTerms: ["augsburg", "86150", "86xxx", "fugger", "bayern"]
  },
  {
    city: "Würzburg",
    state: "Bayern",
    country: "Deutschland",
    postcode: "97070",
    coordinates: { lat: 49.7913, lng: 9.9534 },
    searchTerms: ["würzburg", "97070", "97xxx", "main", "franken", "bayern"]
  },
  {
    city: "Regensburg",
    state: "Bayern",
    country: "Deutschland",
    postcode: "93047",
    coordinates: { lat: 49.0134, lng: 12.1016 },
    searchTerms: ["regensburg", "93047", "93xxx", "donau", "weltkulturerbe", "bayern"]
  },
  {
    city: "Ingolstadt",
    state: "Bayern",
    country: "Deutschland",
    postcode: "85049",
    coordinates: { lat: 48.7665, lng: 11.4257 },
    searchTerms: ["ingolstadt", "85049", "85xxx", "audi", "donau", "bayern"]
  },
  {
    city: "Erlangen",
    state: "Bayern",
    country: "Deutschland",
    postcode: "91054",
    coordinates: { lat: 49.5897, lng: 11.0044 },
    searchTerms: ["erlangen", "91054", "91xxx", "universität", "siemens", "bayern"]
  },
  // Lower Saxony cities
  {
    city: "Hannover",
    state: "Niedersachsen",
    country: "Deutschland",
    postcode: "30159",
    coordinates: { lat: 52.3759, lng: 9.7320 },
    searchTerms: ["hannover", "30159", "30xxx", "messe", "niedersachsen"]
  },
  {
    city: "Braunschweig",
    state: "Niedersachsen",
    country: "Deutschland",
    postcode: "38100",
    coordinates: { lat: 52.2689, lng: 10.5268 },
    searchTerms: ["braunschweig", "38100", "38xxx", "löwe", "niedersachsen"]
  },
  {
    city: "Oldenburg",
    state: "Niedersachsen",
    country: "Deutschland",
    postcode: "26122",
    coordinates: { lat: 53.1435, lng: 8.2146 },
    searchTerms: ["oldenburg", "26122", "26xxx", "oldb", "niedersachsen"]
  },
  {
    city: "Osnabrück",
    state: "Niedersachsen",
    country: "Deutschland",
    postcode: "49074",
    coordinates: { lat: 52.2799, lng: 8.0472 },
    searchTerms: ["osnabrück", "49074", "49xxx", "westfälischer friede", "niedersachsen"]
  },
  {
    city: "Wolfsburg",
    state: "Niedersachsen",
    country: "Deutschland",
    postcode: "38440",
    coordinates: { lat: 52.4227, lng: 10.7865 },
    searchTerms: ["wolfsburg", "38440", "38xxx", "volkswagen", "autostadt", "niedersachsen"]
  },
  {
    city: "Göttingen",
    state: "Niedersachsen",
    country: "Deutschland",
    postcode: "37073",
    coordinates: { lat: 51.5414, lng: 9.9158 },
    searchTerms: ["göttingen", "37073", "37xxx", "universität", "gänseliesel", "niedersachsen"]
  },
  {
    city: "Hildesheim",
    state: "Niedersachsen",
    country: "Deutschland",
    postcode: "31134",
    coordinates: { lat: 52.1561, lng: 9.9511 },
    searchTerms: ["hildesheim", "31134", "31xxx", "weltkulturerbe", "niedersachsen"]
  },
  // Hesse cities
  {
    city: "Wiesbaden",
    state: "Hessen",
    country: "Deutschland",
    postcode: "65183",
    coordinates: { lat: 50.0826, lng: 8.2399 },
    searchTerms: ["wiesbaden", "65183", "65xxx", "kurstadt", "hessen"]
  },
  {
    city: "Kassel",
    state: "Hessen",
    country: "Deutschland",
    postcode: "34117",
    coordinates: { lat: 51.3127, lng: 9.4797 },
    searchTerms: ["kassel", "34117", "34xxx", "documenta", "hercules", "hessen"]
  },
  {
    city: "Darmstadt",
    state: "Hessen",
    country: "Deutschland",
    postcode: "64283",
    coordinates: { lat: 49.8728, lng: 8.6512 },
    searchTerms: ["darmstadt", "64283", "64xxx", "wissenschaftsstadt", "hessen"]
  },
  {
    city: "Offenbach",
    state: "Hessen",
    country: "Deutschland",
    postcode: "63065",
    coordinates: { lat: 50.0955, lng: 8.7761 },
    searchTerms: ["offenbach", "63065", "63xxx", "main", "hessen"]
  },
  {
    city: "Gießen",
    state: "Hessen",
    country: "Deutschland",
    postcode: "35390",
    coordinates: { lat: 50.5841, lng: 8.6724 },
    searchTerms: ["gießen", "35390", "35xxx", "universität", "lahn", "hessen"]
  },
  // Baden-Württemberg cities
  {
    city: "Stuttgart",
    state: "Baden-Württemberg",
    country: "Deutschland",
    postcode: "70173",
    coordinates: { lat: 48.7758, lng: 9.1829 },
    searchTerms: ["stuttgart", "70173", "70xxx", "mercedes", "porsche", "baden-württemberg"]
  },
  {
    city: "Mannheim",
    state: "Baden-Württemberg",
    country: "Deutschland",
    postcode: "68159",
    coordinates: { lat: 49.4875, lng: 8.4660 },
    searchTerms: ["mannheim", "68159", "68xxx", "quadrate", "rhein", "baden-württemberg"]
  },
  {
    city: "Karlsruhe",
    state: "Baden-Württemberg",
    country: "Deutschland",
    postcode: "76133",
    coordinates: { lat: 49.0069, lng: 8.4037 },
    searchTerms: ["karlsruhe", "76133", "76xxx", "fächer", "recht", "baden-württemberg"]
  },
  {
    city: "Freiburg",
    state: "Baden-Württemberg",
    country: "Deutschland",
    postcode: "79098",
    coordinates: { lat: 47.9990, lng: 7.8421 },
    searchTerms: ["freiburg", "79098", "79xxx", "breisgau", "schwarzwald", "baden-württemberg"]
  },
  {
    city: "Heidelberg",
    state: "Baden-Württemberg",
    country: "Deutschland",
    postcode: "69117",
    coordinates: { lat: 49.3988, lng: 8.6724 },
    searchTerms: ["heidelberg", "69117", "69xxx", "schloss", "neckar", "baden-württemberg"]
  },
  {
    city: "Heilbronn",
    state: "Baden-Württemberg",
    country: "Deutschland",
    postcode: "74072",
    coordinates: { lat: 49.1427, lng: 9.2109 },
    searchTerms: ["heilbronn", "74072", "74xxx", "neckar", "käthchen", "baden-württemberg"]
  },
  {
    city: "Ulm",
    state: "Baden-Württemberg",
    country: "Deutschland",
    postcode: "89073",
    coordinates: { lat: 48.3984, lng: 9.9916 },
    searchTerms: ["ulm", "89073", "89xxx", "münster", "donau", "baden-württemberg"]
  },
  {
    city: "Pforzheim",
    state: "Baden-Württemberg",
    country: "Deutschland",
    postcode: "75175",
    coordinates: { lat: 48.8915, lng: 8.6983 },
    searchTerms: ["pforzheim", "75175", "75xxx", "goldstadt", "schmuck", "baden-württemberg"]
  },
  {
    city: "Frankfurt am Main",
    state: "Hessen", 
    country: "Deutschland",
    postcode: "60311",
    coordinates: { lat: 50.1109, lng: 8.6821 },
    searchTerms: ["frankfurt", "main", "banking", "hessen"]
  },
  {
    city: "Stuttgart",
    state: "Baden-Württemberg",
    country: "Deutschland",
    postcode: "70173",
    coordinates: { lat: 48.7758, lng: 9.1829 },
    searchTerms: ["stuttgart", "baden", "württemberg", "mercedes"]
  },
  {
    city: "Düsseldorf",
    state: "Nordrhein-Westfalen",
    country: "Deutschland", 
    postcode: "40210",
    coordinates: { lat: 51.2277, lng: 6.7735 },
    searchTerms: ["düsseldorf", "rhein", "nrw"]
  },
  {
    city: "Leipzig",
    state: "Sachsen",
    country: "Deutschland",
    postcode: "04109", 
    coordinates: { lat: 51.3397, lng: 12.3731 },
    searchTerms: ["leipzig", "sachsen", "bach"]
  },
  {
    city: "Dortmund",
    state: "Nordrhein-Westfalen",
    country: "Deutschland",
    postcode: "44135",
    coordinates: { lat: 51.5136, lng: 7.4653 },
    searchTerms: ["dortmund", "ruhrgebiet", "bvb"]
  },
  {
    city: "Essen",
    state: "Nordrhein-Westfalen", 
    country: "Deutschland",
    postcode: "45127",
    coordinates: { lat: 51.4556, lng: 7.0116 },
    searchTerms: ["essen", "ruhrgebiet", "zeche"]
  },

  // Austria - Major cities
  {
    city: "Wien",
    state: "Wien",
    country: "Österreich",
    postcode: "1010",
    coordinates: { lat: 48.2082, lng: 16.3738 },
    searchTerms: ["wien", "vienna", "österreich", "austria"]
  },
  {
    city: "Graz", 
    state: "Steiermark",
    country: "Österreich",
    postcode: "8010",
    coordinates: { lat: 47.0707, lng: 15.4395 },
    searchTerms: ["graz", "steiermark", "mur"]
  },
  {
    city: "Linz",
    state: "Oberösterreich", 
    country: "Österreich",
    postcode: "4020",
    coordinates: { lat: 48.3064, lng: 14.2858 },
    searchTerms: ["linz", "oberösterreich", "donau"]
  },
  {
    city: "Salzburg",
    state: "Salzburg",
    country: "Österreich",
    postcode: "5020",
    coordinates: { lat: 47.8095, lng: 13.0550 },
    searchTerms: ["salzburg", "mozart", "alps"]
  },
  {
    city: "Innsbruck", 
    state: "Tirol",
    country: "Österreich",
    postcode: "6020",
    coordinates: { lat: 47.2692, lng: 11.4041 },
    searchTerms: ["innsbruck", "tirol", "alpen", "alps"]
  },

  // Switzerland - Major cities  
  {
    city: "Zürich",
    state: "Zürich",
    country: "Schweiz",
    postcode: "8001",
    coordinates: { lat: 47.3769, lng: 8.5417 },
    searchTerms: ["zürich", "zurich", "schweiz", "switzerland"]
  },
  {
    city: "Genf",
    state: "Genf", 
    country: "Schweiz", 
    postcode: "1201",
    coordinates: { lat: 46.2044, lng: 6.1432 },
    searchTerms: ["genf", "geneva", "geneva", "lac"]
  },
  {
    city: "Basel",
    state: "Basel-Stadt",
    country: "Schweiz",
    postcode: "4001", 
    coordinates: { lat: 47.5596, lng: 7.5886 },
    searchTerms: ["basel", "rhein", "pharma"]
  },
  {
    city: "Bern",
    state: "Bern",
    country: "Schweiz",
    postcode: "3001",
    coordinates: { lat: 46.9480, lng: 7.4474 },
    searchTerms: ["bern", "berne", "hauptstadt", "capital"]
  },
  {
    city: "Lausanne",
    state: "Waadt",
    country: "Schweiz",
    postcode: "1003",
    coordinates: { lat: 46.5197, lng: 6.6323 },
    searchTerms: ["lausanne", "waadt", "vaud", "olympics"]
  },

  // More German cities
  {
    city: "Dresden",
    state: "Sachsen",
    country: "Deutschland",
    postcode: "01067",
    coordinates: { lat: 51.0504, lng: 13.7373 },
    searchTerms: ["dresden", "sachsen", "elbe", "frauenkirche"]
  },
  {
    city: "Hannover",
    state: "Niedersachsen",
    country: "Deutschland",
    postcode: "30159",
    coordinates: { lat: 52.3759, lng: 9.7320 },
    searchTerms: ["hannover", "niedersachsen", "messe"]
  },
  {
    city: "Nürnberg",
    state: "Bayern",
    country: "Deutschland",
    postcode: "90403",
    coordinates: { lat: 49.4521, lng: 11.0767 },
    searchTerms: ["nürnberg", "nuremberg", "bayern", "lebkuchen"]
  },
  {
    city: "Bremen",
    state: "Bremen",
    country: "Deutschland",
    postcode: "28195",
    coordinates: { lat: 53.0793, lng: 8.8017 },
    searchTerms: ["bremen", "weser", "hansestadt"]
  },
  {
    city: "Wiesbaden",
    state: "Hessen",
    country: "Deutschland",
    postcode: "65183",
    coordinates: { lat: 50.0782, lng: 8.2398 },
    searchTerms: ["wiesbaden", "hessen", "kurstadt"]
  },
  {
    city: "Mainz",
    state: "Rheinland-Pfalz",
    country: "Deutschland",
    postcode: "55116",
    coordinates: { lat: 49.9929, lng: 8.2473 },
    searchTerms: ["mainz", "rheinland-pfalz", "rhein", "gutenberg"]
  },
  {
    city: "Saarbrücken",
    state: "Saarland",
    country: "Deutschland",
    postcode: "66111",
    coordinates: { lat: 49.2401, lng: 6.9969 },
    searchTerms: ["saarbrücken", "saarland", "saar"]
  },
  {
    city: "Schwerin",
    state: "Mecklenburg-Vorpommern",
    country: "Deutschland",
    postcode: "19053",
    coordinates: { lat: 53.6355, lng: 11.4010 },
    searchTerms: ["schwerin", "mecklenburg-vorpommern", "schloss"]
  },
  {
    city: "Erfurt",
    state: "Thüringen",
    country: "Deutschland",
    postcode: "99084",
    coordinates: { lat: 50.9848, lng: 11.0299 },
    searchTerms: ["erfurt", "thüringen", "dom"]
  },
  {
    city: "Magdeburg",
    state: "Sachsen-Anhalt",
    country: "Deutschland",
    postcode: "39104",
    coordinates: { lat: 52.1205, lng: 11.6276 },
    searchTerms: ["magdeburg", "sachsen-anhalt", "elbe", "dom"]
  },
  {
    city: "Kiel",
    state: "Schleswig-Holstein",
    country: "Deutschland",
    postcode: "24103",
    coordinates: { lat: 54.3233, lng: 10.1228 },
    searchTerms: ["kiel", "schleswig-holstein", "kieler", "förde"]
  },
  {
    city: "Potsdam",
    state: "Brandenburg",
    country: "Deutschland",
    postcode: "14467",
    coordinates: { lat: 52.3906, lng: 13.0645 },
    searchTerms: ["potsdam", "brandenburg", "sanssouci", "schloss"]
  },

  // More Austrian cities
  {
    city: "Klagenfurt",
    state: "Kärnten",
    country: "Österreich",
    postcode: "9020",
    coordinates: { lat: 46.6247, lng: 14.3055 },
    searchTerms: ["klagenfurt", "kärnten", "wörthersee"]
  },
  {
    city: "Bregenz",
    state: "Vorarlberg",
    country: "Österreich",
    postcode: "6900",
    coordinates: { lat: 47.5058, lng: 9.7471 },
    searchTerms: ["bregenz", "vorarlberg", "bodensee"]
  },
  {
    city: "St. Pölten",
    state: "Niederösterreich",
    country: "Österreich",
    postcode: "3100",
    coordinates: { lat: 48.2058, lng: 15.6232 },
    searchTerms: ["st pölten", "niederösterreich", "traisen"]
  },
  {
    city: "Eisenstadt",
    state: "Burgenland",
    country: "Österreich",
    postcode: "7000",
    coordinates: { lat: 47.8450, lng: 16.5200 },
    searchTerms: ["eisenstadt", "burgenland", "haydn"]
  },

  // More Swiss cities
  {
    city: "Winterthur",
    state: "Zürich",
    country: "Schweiz",
    postcode: "8400",
    coordinates: { lat: 47.4979, lng: 8.7242 },
    searchTerms: ["winterthur", "zürich", "technorama"]
  },
  {
    city: "St. Gallen",
    state: "St. Gallen",
    country: "Schweiz",
    postcode: "9000",
    coordinates: { lat: 47.4245, lng: 9.3767 },
    searchTerms: ["st gallen", "stiftsbibliothek", "textil"]
  },
  {
    city: "Luzern",
    state: "Luzern",
    country: "Schweiz",
    postcode: "6003",
    coordinates: { lat: 47.0502, lng: 8.3093 },
    searchTerms: ["luzern", "lucerne", "vierwaldstättersee", "kapellbrücke"]
  },
  {
    city: "Lugano",
    state: "Tessin",
    country: "Schweiz",
    postcode: "6900",
    coordinates: { lat: 46.0037, lng: 8.9511 },
    searchTerms: ["lugano", "tessin", "ticino", "monte"]
  },
  {
    city: "Thun",
    state: "Bern",
    country: "Schweiz",
    postcode: "3600",
    coordinates: { lat: 46.758, lng: 7.6280 },
    searchTerms: ["thun", "thunersee", "oberland"]
  }
];

// Enhanced fuzzy search function with intelligent address parsing
export const searchAddresses = (query: string, limit: number = 5): StaticAddress[] => {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  console.log('🔍 Searching for:', normalizedQuery);
  
  // Extract postal code from complex addresses like "Technologiepark 18, 33100 Paderborn"
  const postalCodeMatch = normalizedQuery.match(/\b(\d{5})\b/);
  const postalCode = postalCodeMatch ? postalCodeMatch[1] : null;
  
  // Extract city name after postal code or comma
  let cityName = '';
  if (postalCode) {
    const afterPostalCode = normalizedQuery.split(postalCode)[1];
    if (afterPostalCode) {
      cityName = afterPostalCode.replace(/^\s*,?\s*/, '').trim().split(/\s+/)[0];
    }
  }
  
  // Alternative: extract city from comma-separated parts
  if (!cityName) {
    const parts = normalizedQuery.split(',');
    if (parts.length > 1) {
      // Try last part first (most likely city)
      cityName = parts[parts.length - 1].trim();
      // Remove postal code if present
      cityName = cityName.replace(/^\d{5}\s*/, '');
    }
  }
  
  console.log('🏙️ Extracted postal code:', postalCode, 'city:', cityName);
  
  const results: Array<{ address: StaticAddress; score: number }> = [];

  staticAddresses.forEach(address => {
    let score = 0;
    const searchableText = [
      address.city.toLowerCase(),
      address.postcode,
      address.state?.toLowerCase() || '',
      address.country.toLowerCase(),
      ...address.searchTerms.map(term => term.toLowerCase())
    ];

    // Postal code match gets very high priority
    if (postalCode && address.postcode === postalCode) {
      score = 150;
    }
    // Postal code range match (e.g., 33xxx for 33100)
    else if (postalCode && address.searchTerms.some(term => 
      term.includes(postalCode.substring(0, 2) + 'xxx')
    )) {
      score = 120;
    }
    // City name exact match
    else if (cityName && address.city.toLowerCase() === cityName) {
      score = 110;
    }
    // City name starts with
    else if (cityName && address.city.toLowerCase().startsWith(cityName)) {
      score = 100;
    }
    // Exact match with full query
    else if (searchableText.some(text => text === normalizedQuery)) {
      score = 90;
    }
    // Starts with match
    else if (searchableText.some(text => text.startsWith(normalizedQuery))) {
      score = 80;
    }
    // Contains match
    else if (searchableText.some(text => text.includes(normalizedQuery))) {
      score = 60;
    }
    // Fuzzy matching for common German variations
    else if (normalizedQuery.includes('ue') || normalizedQuery.includes('ae') || normalizedQuery.includes('oe')) {
      const umlautQuery = normalizedQuery
        .replace(/ue/g, 'ü')
        .replace(/ae/g, 'ä')
        .replace(/oe/g, 'ö');
      
      if (searchableText.some(text => text.includes(umlautQuery))) {
        score = 40;
      }
    }
    // Reverse umlaut matching
    else {
      const deUmlautQuery = normalizedQuery
        .replace(/ü/g, 'ue')
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe');
      
      if (searchableText.some(text => text.includes(deUmlautQuery))) {
        score = 40;
      }
    }

    // Bonus for multiple matches
    if (cityName && postalCode && 
        address.city.toLowerCase().includes(cityName) && 
        address.postcode.startsWith(postalCode.substring(0, 2))) {
      score += 50;
    }

    if (score > 0) {
      results.push({ address, score });
    }
  });

  // Sort by score and return top results
  const sortedResults = results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(result => result.address);

  if (sortedResults.length === 0) {
    // Provide helpful suggestions including newly added cities
    const suggestions = staticAddresses.slice(0, 8).map(a => a.city).join(', ');
    console.log(`🔍 Keine Ergebnisse für "${query}". Verfügbare Städte: ${suggestions}`);
  } else {
    console.log(`✅ Found ${sortedResults.length} matches for "${query}"`);
  }

  return sortedResults;
};

// Convert static address to geocoding result format
export const staticAddressToGeocodingResult = (address: StaticAddress) => {
  return {
    lat: address.coordinates.lat,
    lng: address.coordinates.lng,
    addressComponents: [
      { long_name: address.city, types: ['locality'] },
      { long_name: address.postcode, types: ['postal_code'] },
      { long_name: address.state || '', types: ['administrative_area_level_1'] },
      { long_name: address.country, types: ['country'] }
    ]
  };
};