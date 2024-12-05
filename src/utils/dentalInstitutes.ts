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

export const calculateDistance = async (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): Promise<number> => {
  try {
    const service = new google.maps.DistanceMatrixService();
    const result = await service.getDistanceMatrix({
      origins: [{ lat: lat1, lng: lon1 }],
      destinations: [{ lat: lat2, lng: lon2 }],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    });

    if (result.rows[0]?.elements[0]?.status === "OK") {
      return result.rows[0].elements[0].distance.value / 1000; // Convert meters to kilometers
    }
  } catch (error) {
    console.error('Error calculating distance:', error);
  }
  
  // Fallback to air-line distance calculation if Google Maps fails
  const R = 6371;
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

export const findNearestInstitute = (lat: number, lng: number): DentalInstitute => {
  let nearestInstitute = dentalInstitutes[0];
  let shortestDistance = Number.MAX_VALUE;

  dentalInstitutes.forEach(institute => {
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