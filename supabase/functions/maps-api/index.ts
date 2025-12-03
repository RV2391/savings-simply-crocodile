import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();
    console.log(`🗺️ Maps API Request: ${action}`, params);

    switch (action) {
      case 'address-suggestions': {
        const { input } = params;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&addressdetails=1&limit=5&countrycodes=de,at,ch`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'KursRadar/1.0'
          }
        });
        
        if (!response.ok) {
          throw new Error(`OpenStreetMap API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ Found ${data.length} address suggestions`);
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'place-details': {
        const { query } = params;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1&countrycodes=de,at,ch`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'KursRadar/1.0'
          }
        });
        
        if (!response.ok) {
          throw new Error(`OpenStreetMap API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
          throw new Error('Address not found');
        }
        
        console.log(`✅ Found place details for: ${query}`);
        
        return new Response(JSON.stringify(data[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'route-calculation': {
        const { start, end } = params;
        
        try {
          // Use OSRM (OpenStreetMap Routing Machine) for routing
          const routeUrl = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=false&alternatives=false&steps=false`;
          
          const routeResponse = await fetch(routeUrl, {
            headers: {
              'User-Agent': 'KursRadar/1.0'
            }
          });
          
          if (!routeResponse.ok) {
            throw new Error(`OSRM API error: ${routeResponse.status}`);
          }
          
          const routeData = await routeResponse.json();
          
          if (!routeData.routes || routeData.routes.length === 0) {
            throw new Error('No route found');
          }
          
          const route = routeData.routes[0];
          const distanceKm = route.distance / 1000; // Convert meters to kilometers
          const durationMinutes = Math.round(route.duration / 60); // Convert seconds to minutes
          
          console.log(`✅ Route calculated: ${distanceKm.toFixed(1)}km, ${durationMinutes}min`);
          
          return new Response(JSON.stringify({
            distance: distanceKm,
            duration: durationMinutes,
            provider: 'OSRM'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
          
        } catch (error) {
          console.warn('❌ Routing failed, falling back to straight-line calculation:', error);
          
          // Fallback to Haversine formula for straight-line distance
          const R = 6371; // Earth's radius in km
          const dLat = toRad(end.lat - start.lat);
          const dLon = toRad(end.lng - start.lng);
          
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(start.lat)) * Math.cos(toRad(end.lat)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
          
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          // Estimate travel time: distance * 1.4 factor / 50 km/h average speed
          const estimatedDuration = Math.round(distance * 1.4 / 50 * 60);
          
          console.log(`✅ Fallback calculation: ${distance.toFixed(1)}km straight-line, ~${estimatedDuration}min estimated`);
          
          return new Response(JSON.stringify({
            distance: distance,
            duration: estimatedDuration,
            provider: 'Fallback (Straight-line)',
            isEstimate: true
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'static-map': {
        const { center, markers, width = 800, height = 400, zoom = 12 } = params;
        
        // Calculate tile coordinates
        const tile = latLngToTile(center.lat, center.lng, zoom);
        
        // Try multiple tile providers
        const providers = [
          'https://cartodb-basemaps-c.global.ssl.fastly.net/light_all',
          'https://tile.openstreetmap.org',
          'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all'
        ];
        
        let tileUrl = '';
        for (const provider of providers) {
          try {
            const testUrl = `${provider}/${zoom}/${tile.x}/${tile.y}.png`;
            const testResponse = await fetch(testUrl, { method: 'HEAD' });
            if (testResponse.ok) {
              tileUrl = testUrl;
              break;
            }
          } catch (error) {
            console.warn(`Provider failed: ${provider}`, error);
            continue;
          }
        }
        
        if (!tileUrl) {
          tileUrl = `${providers[0]}/${zoom}/${tile.x}/${tile.y}.png`;
        }
        
        console.log(`✅ Generated static map URL: ${tileUrl}`);
        
        return new Response(JSON.stringify({ url: tileUrl }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('❌ Maps API Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      provider: 'OpenStreetMap (Backend)'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function toRad(value: number): number {
  return value * Math.PI / 180;
}

function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number; z: number } {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n
  );
  
  return { x, y, z: zoom };
}
