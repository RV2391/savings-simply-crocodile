
import { germanInstitutes } from './dentalInstitutes/data/germanInstitutes';
import { swissInstitutes } from './dentalInstitutes/data/swissInstitutes';
import { austrianInstitutes } from './dentalInstitutes/data/austrianInstitutes';
import { calculateDistanceViaBackend } from './backendDistanceCalculations';

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

// Backend-basierte Entfernungsberechnung
export const calculateDistance = async (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): Promise<number> => {
  return await calculateDistanceViaBackend(lat1, lon1, lat2, lon2);
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

export const calculateNearestInstitute = async (lat: number, lng: number): Promise<DentalInstitute> => {
  let nearestInstitute = dentalInstitutes[0];
  let shortestDistance = Number.MAX_VALUE;

  for (const institute of dentalInstitutes) {
    const distance = await calculateDistance(
      lat,
      lng,
      institute.coordinates.lat,
      institute.coordinates.lng
    );
    
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestInstitute = institute;
    }
  }

  return nearestInstitute;
};
