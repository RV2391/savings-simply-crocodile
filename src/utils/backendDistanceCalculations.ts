
// Echte Fahrstrecken-Berechnung über Backend-API
export const calculateDistanceViaBackend = async (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): Promise<number> => {
  console.log('🗺️ Calculating driving distance via backend');
  
  try {
    const response = await fetch('https://vkarnxgrniqtyeeibgxq.supabase.co/functions/v1/maps-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYXJueGdybmlxdHllZWliZ3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODYwNjUsImV4cCI6MjA2ODY2MjA2NX0.ULXL4SIwqXzzRWkxW15MO3OCkVfGlEvJ-NQ0_cnI9y8`
      },
      body: JSON.stringify({
        action: 'route-calculation',
        params: {
          start: { lat: lat1, lng: lon1 },
          end: { lat: lat2, lng: lon2 }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Backend route calculation: ${data.distance}km (${data.provider})`);
    return data.distance;
    
  } catch (error) {
    console.warn('❌ Backend calculation failed, using fallback:', error);
    
    // Fallback zur Luftlinien-Berechnung
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

// Echte Fahrtzeit-Berechnung über Backend-API
export const calculateTravelTimeViaBackend = async (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): Promise<number> => {
  console.log('🚗 Calculating travel time via backend');
  
  try {
    const response = await fetch('https://vkarnxgrniqtyeeibgxq.supabase.co/functions/v1/maps-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYXJueGdybmlxdHllZWliZ3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODYwNjUsImV4cCI6MjA2ODY2MjA2NX0.ULXL4SIwqXzzRWkxW15MO3OCkVfGlEvJ-NQ0_cnI9y8`
      },
      body: JSON.stringify({
        action: 'route-calculation',
        params: {
          start: { lat: lat1, lng: lon1 },
          end: { lat: lat2, lng: lon2 }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Backend travel time: ${data.duration}min (${data.provider})`);
    return data.duration;
    
  } catch (error) {
    console.warn('❌ Backend calculation failed, using fallback:', error);
    
    // Fallback zur geschätzten Fahrtzeit basierend auf Luftlinie
    const distance = await calculateDistanceViaBackend(lat1, lon1, lat2, lon2);
    return Math.round(distance * 1.4 / 50 * 60); // Ergebnis in Minuten
  }
};
