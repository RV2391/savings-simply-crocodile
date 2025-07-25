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
    searchTerms: ["berlin", "hauptstadt", "spree"]
  },
  {
    city: "Hamburg",
    state: "Hamburg",
    country: "Deutschland", 
    postcode: "20095",
    coordinates: { lat: 53.5488, lng: 9.9872 },
    searchTerms: ["hamburg", "hansestadt", "elbe"]
  },
  {
    city: "München",
    state: "Bayern",
    country: "Deutschland",
    postcode: "80331", 
    coordinates: { lat: 48.1351, lng: 11.5820 },
    searchTerms: ["münchen", "munich", "bayern", "bavaria"]
  },
  {
    city: "Köln",
    state: "Nordrhein-Westfalen",
    country: "Deutschland",
    postcode: "50667",
    coordinates: { lat: 50.9375, lng: 6.9603 },
    searchTerms: ["köln", "cologne", "dom", "rhein"]
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

// Enhanced fuzzy search function for better address matching
export const searchAddresses = (query: string, limit: number = 5): StaticAddress[] => {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase().trim();
  const results: { address: StaticAddress; score: number }[] = [];
  
  // Also check for partial postal code matches
  const isNumeric = /^\d+/.test(searchTerm);
  
  staticAddresses.forEach(address => {
    let score = 0;
    
    // Check exact matches first (highest score)
    if (address.city.toLowerCase() === searchTerm) {
      score = 100;
    } else if (address.postcode === searchTerm) {
      score = 95;
    } else if (isNumeric && address.postcode.startsWith(searchTerm)) {
      // Partial postal code match
      score = 93;
    } else if (address.city.toLowerCase().startsWith(searchTerm)) {
      score = 90;
    } else if (address.searchTerms.some(term => term === searchTerm)) {
      score = 85;
    } else if (address.city.toLowerCase().includes(searchTerm)) {
      score = 80;
    } else if (address.searchTerms.some(term => term.includes(searchTerm))) {
      score = 75;
    } else if (address.searchTerms.some(term => term.startsWith(searchTerm))) {
      score = 73;
    } else if (address.state?.toLowerCase().includes(searchTerm)) {
      score = 70;
    } else if (address.state?.toLowerCase().startsWith(searchTerm)) {
      score = 68;
    } else if (address.country.toLowerCase().includes(searchTerm)) {
      score = 65;
    }
    
    // Fuzzy matching: check for typos and partial matches
    if (score === 0) {
      // Check if query is a partial match with at least 3 chars
      if (searchTerm.length >= 3) {
        const cityLower = address.city.toLowerCase();
        if (cityLower.includes(searchTerm.substring(0, Math.min(searchTerm.length, cityLower.length)))) {
          score = 60;
        }
      }
      
      // Check for common typos/variations
      const variations = [
        { original: 'ü', variants: ['ue', 'u'] },
        { original: 'ä', variants: ['ae', 'a'] },
        { original: 'ö', variants: ['oe', 'o'] },
        { original: 'ß', variants: ['ss', 's'] }
      ];
      
      let normalizedQuery = searchTerm;
      let normalizedCity = address.city.toLowerCase();
      
      variations.forEach(({ original, variants }) => {
        variants.forEach(variant => {
          normalizedQuery = normalizedQuery.replace(variant, original);
          normalizedCity = normalizedCity.replace(original, variant);
        });
      });
      
      if (normalizedCity.includes(normalizedQuery) || normalizedQuery.includes(normalizedCity.substring(0, 4))) {
        score = 55;
      }
    }
    
    if (score > 0) {
      results.push({ address, score });
    }
  });
  
  // If no results found, provide helpful suggestions
  if (results.length === 0) {
    console.log(`🔍 Keine Ergebnisse für "${query}". Verfügbare Städte:`, 
      staticAddresses.slice(0, 5).map(a => a.city).join(', '));
  }
  
  // Sort by score (highest first) and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(result => result.address);
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