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
            'User-Agent': 'Dental-Calculator/1.0'
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
            'User-Agent': 'Dental-Calculator/1.0'
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

function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number; z: number } {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n
  );
  
  return { x, y, z: zoom };
}