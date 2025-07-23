
// Luftlinien-Entfernungsberechnung (Haversine-Formel)
export const calculateDistanceViaBackend = async (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): Promise<number> => {
  console.log('🗺️ Calculating straight-line distance');
  
  // Luftlinie berechnen mit Haversine-Formel
  const R = 6371; // Erdradius in km
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

// Geschätzte Fahrtzeit-Berechnung basierend auf Luftlinie
export const calculateTravelTimeViaBackend = async (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): Promise<number> => {
  console.log('🚗 Estimating travel time based on straight-line distance');
  
  // Geschätzte Fahrtzeit basierend auf Entfernung
  const distance = await calculateDistanceViaBackend(lat1, lon1, lat2, lon2);
  
  // Annahme: Durchschnittsgeschwindigkeit 50 km/h (realistischer für Stadtverkehr)
  // Faktor 1.4 für Umwege und Verkehr
  return Math.round(distance * 1.4 / 50 * 60); // Ergebnis in Minuten
};
