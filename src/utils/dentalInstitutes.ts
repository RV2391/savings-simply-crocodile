export interface DentalInstitute {
  name: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const dentalInstitutes: DentalInstitute[] = [
  {
    name: "Zahnärztekammer Berlin",
    address: "Stallstraße 1",
    city: "10585 Berlin",
    coordinates: { lat: 52.5200, lng: 13.4050 }
  },
  {
    name: "Landeszahnärztekammer Brandenburg",
    address: "Parzellenstraße 94",
    city: "03046 Cottbus",
    coordinates: { lat: 51.7567, lng: 14.3340 }
  },
  {
    name: "Zahnärztekammer Bremen",
    address: "Universitätsallee 25",
    city: "28359 Bremen",
    coordinates: { lat: 53.0972, lng: 8.8766 }
  },
  {
    name: "Bayerische Landeszahnärztekammer",
    address: "Flößergasse 1",
    city: "81369 München",
    coordinates: { lat: 48.1296, lng: 11.5587 }
  },
  {
    name: "Landeszahnärztekammer Baden-Württemberg",
    address: "Albstadtweg 9",
    city: "70567 Stuttgart",
    coordinates: { lat: 48.7372, lng: 9.1464 }
  },
  {
    name: "Zahnärztekammer Hamburg",
    address: "Weidestraße 122 b",
    city: "22083 Hamburg",
    coordinates: { lat: 53.5587, lng: 10.0069 }
  },
  {
    name: "Landeszahnärztekammer Hessen",
    address: "Rhonestraße 4",
    city: "60528 Frankfurt",
    coordinates: { lat: 50.1071, lng: 8.6544 }
  },
  {
    name: "Zahnärztekammer Niedersachsen",
    address: "Zeißstr. 11a",
    city: "30519 Hannover",
    coordinates: { lat: 52.3715, lng: 9.7352 }
  },
  {
    name: "Zahnärztekammer Mecklenburg-Vorpommern",
    address: "Wismarsche Str. 304",
    city: "19055 Schwerin",
    coordinates: { lat: 53.6295, lng: 11.4137 }
  },
  {
    name: "Zahnärztekammer Nordrhein",
    address: "Hammfelddamm 11",
    city: "41460 Neuss",
    coordinates: { lat: 51.1874, lng: 6.6613 }
  },
  {
    name: "Landeszahnärztekammer Rheinland-Pfalz",
    address: "Langenbeckstr. 2",
    city: "55131 Mainz",
    coordinates: { lat: 50.0045, lng: 8.2541 }
  },
  {
    name: "Ärztekammer des Saarlandes - Abteilung Zahnärzte",
    address: "Puccinistr. 2",
    city: "66119 Saarbrücken",
    coordinates: { lat: 49.2403, lng: 7.0015 }
  },
  {
    name: "Landeszahnärztekammer Sachsen",
    address: "Schützenhöhe 11",
    city: "01099 Dresden",
    coordinates: { lat: 51.0559, lng: 13.7385 }
  },
  {
    name: "Zahnärztekammer Sachsen-Anhalt",
    address: "Große Diesdorfer Straße 162",
    city: "39110 Magdeburg",
    coordinates: { lat: 52.1251, lng: 11.6174 }
  },
  {
    name: "Zahnärztekammer Schleswig-Holstein",
    address: "Westring 496",
    city: "24106 Kiel",
    coordinates: { lat: 54.3233, lng: 10.1347 }
  },
  {
    name: "Landeszahnärztekammer Thüringen",
    address: "Barbarossahof 16",
    city: "99092 Erfurt",
    coordinates: { lat: 50.9775, lng: 11.0299 }
  },
  {
    name: "Zahnärztekammer Westfalen-Lippe",
    address: "Auf der Horst 29",
    city: "48147 Münster",
    coordinates: { lat: 51.9602, lng: 7.6254 }
  },
];

export const calculateNearestInstitute = (practiceLat: number, practiceLng: number): DentalInstitute => {
  let nearestInstitute = dentalInstitutes[0];
  let shortestDistance = Number.MAX_VALUE;

  dentalInstitutes.forEach(institute => {
    const distance = calculateDistance(
      practiceLat,
      practiceLng,
      institute.coordinates.lat,
      institute.coordinates.lng
    );
    
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestInstitute = institute;
    }
  });

  return nearestInstitute;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};
