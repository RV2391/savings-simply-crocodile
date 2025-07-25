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
  }
];

// Fuzzy search function for address matching
export const searchAddresses = (query: string, limit: number = 5): StaticAddress[] => {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase().trim();
  const results: { address: StaticAddress; score: number }[] = [];
  
  staticAddresses.forEach(address => {
    let score = 0;
    
    // Check exact matches first (highest score)
    if (address.city.toLowerCase() === searchTerm) {
      score = 100;
    } else if (address.postcode === searchTerm) {
      score = 95;
    } else if (address.city.toLowerCase().startsWith(searchTerm)) {
      score = 90;
    } else if (address.searchTerms.some(term => term === searchTerm)) {
      score = 85;
    } else if (address.city.toLowerCase().includes(searchTerm)) {
      score = 80;
    } else if (address.searchTerms.some(term => term.includes(searchTerm))) {
      score = 75;
    } else if (address.state?.toLowerCase().includes(searchTerm)) {
      score = 70;
    } else if (address.country.toLowerCase().includes(searchTerm)) {
      score = 65;
    }
    
    if (score > 0) {
      results.push({ address, score });
    }
  });
  
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