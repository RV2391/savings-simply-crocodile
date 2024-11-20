import { germanInstitutes } from './dentalInstitutes/data/germanInstitutes';
import { calculateDistance } from './calculations';

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

export const calculateNearestInstitute = (lat: number, lng: number, plz?: string): DentalInstitute => {
  // First try to find an institute by PLZ
  if (plz) {
    const plzNumber = parseInt(plz, 10);
    const instituteByPlz = germanInstitutes.find(
      institute => institute.plzRange && 
      plzNumber >= institute.plzRange.start && 
      plzNumber <= institute.plzRange.end
    );
    
    if (instituteByPlz) {
      return instituteByPlz;
    }
  }

  // Fallback to distance-based calculation if no PLZ match
  let nearestInstitute = germanInstitutes[0];
  let shortestDistance = calculateDistance(
    lat,
    lng,
    germanInstitutes[0].coordinates.lat,
    germanInstitutes[0].coordinates.lng
  );

  germanInstitutes.forEach(institute => {
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

export const dentalInstitutes = germanInstitutes;