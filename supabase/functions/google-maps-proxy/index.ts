
import { corsHeaders } from '../_shared/cors.ts'

console.log("Google Maps Proxy function started")

Deno.serve(async (req) => {
  console.log(`Request received: ${req.method} ${req.url}`)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, ...params } = await req.json()
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')
    const GOOGLE_MAPS_FRONTEND_API_KEY = Deno.env.get('GOOGLE_MAPS_FRONTEND_API_KEY')
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not found')
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let response
    
    switch (action) {
      case 'get_frontend_key':
        // Return the frontend API key for secure client-side loading
        if (!GOOGLE_MAPS_FRONTEND_API_KEY) {
          return new Response(
            JSON.stringify({ error: 'Frontend API key not configured' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        console.log('Providing frontend API key')
        return new Response(
          JSON.stringify({ key: GOOGLE_MAPS_FRONTEND_API_KEY }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
        
      case 'geocode':
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(params.address)}&key=${GOOGLE_MAPS_API_KEY}`
        console.log('Geocoding request for:', params.address)
        response = await fetch(geocodeUrl)
        break
        
      case 'places_autocomplete':
        const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(params.input)}&key=${GOOGLE_MAPS_API_KEY}&types=address&components=country:de|country:at|country:ch`
        console.log('Places autocomplete request for:', params.input)
        response = await fetch(autocompleteUrl)
        break
        
      case 'place_details':
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${params.place_id}&fields=geometry,address_components&key=${GOOGLE_MAPS_API_KEY}`
        console.log('Place details request for:', params.place_id)
        response = await fetch(detailsUrl)
        break
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    const data = await response.json()
    console.log('Google Maps API response status:', response.status)
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in Google Maps proxy:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
