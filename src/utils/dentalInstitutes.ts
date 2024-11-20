import { germanInstitutes } from './dentalInstitutes/data/germanInstitutes';
import { swissInstitutes } from './dentalInstitutes/data/swissInstitutes';
import { austrianInstitutes } from './dentalInstitutes/data/austrianInstitutes';

export interface DentalInstitute {
  name: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  plzRange?: {
    start: number;
    end: number;
  };
}

export const dentalInstitutes: DentalInstitute[] = [
  ...germanInstitutes,
  ...swissInstitutes,
  ...austrianInstitutes,
];

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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

export const calculateNearestInstitute = (lat: number, lng: number, plz?: string): DentalInstitute => {
  let relevantInstitutes = dentalInstitutes;

  if (plz && /^\d{5}$/.test(plz)) {
    const plzNum = parseInt(plz);
    relevantInstitutes = dentalInstitutes.filter(institute => 
      !institute.plzRange || 
      (institute.plzRange.start <= plzNum && institute.plzRange.end >= plzNum)
    );
  }

  let nearestInstitute = relevantInstitutes[0];
  let shortestDistance = Number.MAX_VALUE;

  relevantInstitutes.forEach(institute => {
    const distance = calculateDistance(
      lat,
      lng,
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