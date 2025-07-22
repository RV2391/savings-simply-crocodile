
import { corsHeaders } from '../_shared/cors.ts'

console.log("🚀 Google Maps Proxy function started")

Deno.serve(async (req) => {
  console.log(`📨 Request received: ${req.method} ${req.url}`)
  console.log(`🌐 Origin: ${req.headers.get('origin')}`)
  console.log(`👤 User-Agent: ${req.headers.get('user-agent')}`)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, ...params } = await req.json()
    console.log(`🔄 Action requested: ${action}`)
    console.log(`📋 Parameters: ${JSON.stringify(params)}`)
    
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')
    const GOOGLE_MAPS_FRONTEND_API_KEY = Deno.env.get('GOOGLE_MAPS_FRONTEND_API_KEY')
    
    console.log(`🔑 Backend API key present: ${!!GOOGLE_MAPS_API_KEY}`)
    console.log(`🔑 Frontend API key present: ${!!GOOGLE_MAPS_FRONTEND_API_KEY}`)
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('❌ Google Maps backend API key not found')
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
          console.error('❌ Frontend API key not configured')
          return new Response(
            JSON.stringify({ error: 'Frontend API key not configured' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        console.log('✅ Providing frontend API key')
        return new Response(
          JSON.stringify({ key: GOOGLE_MAPS_FRONTEND_API_KEY }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
        
      case 'geocode':
        if (!params.address) {
          console.error('❌ No address provided for geocoding')
          return new Response(
            JSON.stringify({ error: 'Address parameter is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(params.address)}&key=${GOOGLE_MAPS_API_KEY}&region=de&language=de`
        console.log('🗺️ Geocoding request for:', params.address)
        console.log('🔗 Geocode URL:', geocodeUrl.replace(GOOGLE_MAPS_API_KEY, 'API_KEY_HIDDEN'))
        
        try {
          response = await fetch(geocodeUrl)
          console.log(`✅ Geocoding response status: ${response.status}`)
        } catch (fetchError) {
          console.error('❌ Geocoding fetch error:', fetchError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch geocoding data', details: fetchError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        break
        
      case 'places_autocomplete':
        if (!params.input) {
          console.error('❌ No input provided for autocomplete')
          return new Response(
            JSON.stringify({ error: 'Input parameter is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(params.input)}&key=${GOOGLE_MAPS_API_KEY}&types=address&components=country:de|country:at|country:ch&language=de`
        console.log('🔍 Places autocomplete request for:', params.input)
        console.log('🔗 Autocomplete URL:', autocompleteUrl.replace(GOOGLE_MAPS_API_KEY, 'API_KEY_HIDDEN'))
        
        try {
          response = await fetch(autocompleteUrl)
          console.log(`✅ Autocomplete response status: ${response.status}`)
        } catch (fetchError) {
          console.error('❌ Autocomplete fetch error:', fetchError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch autocomplete data', details: fetchError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        break
        
      case 'place_details':
        if (!params.place_id) {
          console.error('❌ No place_id provided for details')
          return new Response(
            JSON.stringify({ error: 'place_id parameter is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${params.place_id}&fields=geometry,address_components,formatted_address&key=${GOOGLE_MAPS_API_KEY}&language=de`
        console.log('📍 Place details request for:', params.place_id)
        console.log('🔗 Details URL:', detailsUrl.replace(GOOGLE_MAPS_API_KEY, 'API_KEY_HIDDEN'))
        
        try {
          response = await fetch(detailsUrl)
          console.log(`✅ Place details response status: ${response.status}`)
        } catch (fetchError) {
          console.error('❌ Place details fetch error:', fetchError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch place details', details: fetchError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        break
        
      default:
        console.error(`❌ Invalid action: ${action}`)
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    const data = await response.json()
    console.log(`✅ Google Maps API response status: ${response.status}`)
    console.log(`📊 Response data sample:`, JSON.stringify(data).substring(0, 200) + '...')
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Error in Google Maps proxy:', error)
    console.error('❌ Error stack:', error.stack)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
