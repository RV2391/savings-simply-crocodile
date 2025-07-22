
import { backendMapsService } from './backendMapsService';

// Backend-basierte Entfernungsberechnung
export const calculateDistanceViaBackend = async (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): Promise<number> => {
  try {
    const directions = await backendMapsService.getDirections(
      `${lat1},${lon1}`,
      `${lat2},${lon2}`
    );
    
    // Entfernung in Kilometern zurückgeben
    return directions.distance_value / 1000;
  } catch (error) {
    console.error('Backend distance calculation failed:', error);
    
    // Fallback: Luftlinie berechnen
    const R = 6371; // Erdradius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

// Backend-basierte Fahrtzeit-Berechnung
export const calculateTravelTimeViaBackend = async (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): Promise<number> => {
  try {
    const directions = await backendMapsService.getDirections(
      `${lat1},${lon1}`,
      `${lat2},${lon2}`
    );
    
    // Fahrtzeit in Minuten zurückgeben
    return Math.round(directions.duration_value / 60);
  } catch (error) {
    console.error('Backend travel time calculation failed:', error);
    
    // Fallback: Geschätzte Fahrtzeit basierend auf Entfernung
    const distance = await calculateDistanceViaBackend(lat1, lon1, lat2, lon2);
    return Math.round(distance * 1.5); // Annahme: 40 km/h Durchschnittsgeschwindigkeit
  }
};
