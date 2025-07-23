import { corsHeaders } from '../_shared/cors.ts'

console.log("🚀 Enhanced Google Maps Proxy function started")

Deno.serve(async (req) => {
  console.log(`📨 Request received: ${req.method} ${req.url}`)
  
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
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('❌ Google Maps API key not found in environment')
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`🔑 API Key configured: ${GOOGLE_MAPS_API_KEY.substring(0, 20)}...`)

    let response
    
    switch (action) {
      case 'autocomplete':
        if (!params.input) {
          return new Response(
            JSON.stringify({ error: 'Input parameter is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(params.input)}&key=${GOOGLE_MAPS_API_KEY}&types=address&components=country:de|country:at|country:ch&language=de`
        console.log('🔍 Places autocomplete request for:', params.input)
        
        try {
          response = await fetch(autocompleteUrl)
          const data = await response.json()
          console.log(`✅ Autocomplete response status: ${response.status}`)
          
          // Transform to simpler format for frontend
          const suggestions = data.predictions?.map((pred: any) => ({
            place_id: pred.place_id,
            description: pred.description,
            main_text: pred.structured_formatting?.main_text,
            secondary_text: pred.structured_formatting?.secondary_text
          })) || []
          
          return new Response(JSON.stringify({ suggestions }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } catch (fetchError) {
          console.error('❌ Autocomplete fetch error:', fetchError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch autocomplete data' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break

      case 'place_details':
        if (!params.place_id) {
          return new Response(
            JSON.stringify({ error: 'place_id parameter is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${params.place_id}&fields=geometry,address_components,formatted_address&key=${GOOGLE_MAPS_API_KEY}&language=de`
        console.log('📍 Place details request for:', params.place_id)
        
        try {
          response = await fetch(detailsUrl)
          const data = await response.json()
          console.log(`✅ Place details response status: ${response.status}`)
          
          if (data.result) {
            const result = {
              lat: data.result.geometry.location.lat,
              lng: data.result.geometry.location.lng,
              formatted_address: data.result.formatted_address,
              address_components: data.result.address_components
            }
            
            return new Response(JSON.stringify(result), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          } else {
            throw new Error('No place details found')
          }
        } catch (fetchError) {
          console.error('❌ Place details fetch error:', fetchError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch place details' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break

      case 'directions':
        if (!params.origin || !params.destination) {
          return new Response(
            JSON.stringify({ error: 'Origin and destination parameters are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(params.origin)}&destination=${encodeURIComponent(params.destination)}&key=${GOOGLE_MAPS_API_KEY}&language=de&units=metric&mode=driving&alternatives=true`
        console.log('🗺️ Directions request:', params.origin, 'to', params.destination)
        
        try {
          response = await fetch(directionsUrl)
          const data = await response.json()
          console.log(`✅ Directions response status: ${response.status}`)
          
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0]
            const leg = route.legs[0]
            
            const result = {
              distance: leg.distance.text,
              distance_value: leg.distance.value,
              duration: leg.duration.text,
              duration_value: leg.duration.value,
              start_address: leg.start_address,
              end_address: leg.end_address,
              polyline: route.overview_polyline.points
            }
            
            return new Response(JSON.stringify(result), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          } else {
            throw new Error('No route found')
          }
        } catch (fetchError) {
          console.error('❌ Directions fetch error:', fetchError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch directions' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break

      case 'static_map_image':
        if (!params.center) {
          console.error('❌ Missing center parameter')
          return new Response(
            JSON.stringify({ error: 'Center parameter is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const size = params.size || '600x400'
        const zoom = params.zoom || 10
        const maptype = params.maptype || 'roadmap'
        
        let staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(params.center)}&zoom=${zoom}&size=${size}&maptype=${maptype}&key=${GOOGLE_MAPS_API_KEY}`
        
        // Add markers if provided
        if (params.markers && Array.isArray(params.markers)) {
          console.log(`📍 Adding ${params.markers.length} markers to map`)
          params.markers.forEach((marker: any, index: number) => {
            const color = marker.color || 'red'
            const label = marker.label || ''
            const location = marker.location
            console.log(`  Marker ${index + 1}: ${color} ${label} at ${location}`)
            staticMapUrl += `&markers=color:${color}|label:${label}|${encodeURIComponent(location)}`
          })
        }
        
        // Add path if provided
        if (params.path) {
          console.log(`🛣️ Adding path to map: ${params.path.substring(0, 50)}...`)
          staticMapUrl += `&path=color:0x0000ff|weight:3|enc:${params.path}`
        }
        
        console.log('🗺️ Static map image request for:', params.center)
        console.log('📋 Final Google Maps URL length:', staticMapUrl.length)
        console.log('🌐 Making request to Google Maps API...')
        
        try {
          const imageResponse = await fetch(staticMapUrl)
          
          console.log(`📊 Google Maps API response status: ${imageResponse.status}`)
          console.log(`📊 Google Maps API response headers:`, Object.fromEntries(imageResponse.headers.entries()))
          
          if (!imageResponse.ok) {
            const errorText = await imageResponse.text()
            console.error('❌ Google Maps API error response:', errorText)
            console.error('❌ Request URL (first 200 chars):', staticMapUrl.substring(0, 200))
            
            // Enhanced error handling for different status codes
            let errorMessage = `Google Maps API returned ${imageResponse.status}: ${imageResponse.statusText}`
            
            if (imageResponse.status === 403) {
              errorMessage += ' - API Key might be invalid, restricted, or quota exceeded. Check Google Cloud Console.'
            } else if (imageResponse.status === 400) {
              errorMessage += ' - Invalid request parameters. Check the map configuration.'
            } else if (imageResponse.status === 429) {
              errorMessage += ' - Rate limit exceeded. Try again later.'
            }
            
            return new Response(
              JSON.stringify({ 
                error: errorMessage,
                details: errorText,
                status: imageResponse.status,
                url_preview: staticMapUrl.substring(0, 200) + '...'
              }),
              { 
                status: imageResponse.status, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
          
          const contentType = imageResponse.headers.get('content-type') || 'image/png'
          const imageBuffer = await imageResponse.arrayBuffer()
          
          console.log('✅ Successfully loaded map image from Google')
          console.log(`📊 Image details: ${imageBuffer.byteLength} bytes, type: ${contentType}`)
          
          return new Response(imageBuffer, {
            headers: {
              ...corsHeaders,
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600',
              'Content-Length': imageBuffer.byteLength.toString()
            }
          })
        } catch (fetchError) {
          console.error('❌ Network error while fetching from Google Maps:', fetchError)
          return new Response(
            JSON.stringify({ 
              error: 'Network error while loading map image',
              details: fetchError.message,
              type: 'network_error'
            }),
            { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break

      case 'static_map':
        if (!params.center) {
          return new Response(
            JSON.stringify({ error: 'Center parameter is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const mapSize = params.size || '600x400'
        const mapZoom = params.zoom || 10
        const mapMaptype = params.maptype || 'roadmap'
        
        let mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(params.center)}&zoom=${mapZoom}&size=${mapSize}&maptype=${mapMaptype}&key=${GOOGLE_MAPS_API_KEY}`
        
        // Add markers if provided
        if (params.markers) {
          params.markers.forEach((marker: any) => {
            const color = marker.color || 'red'
            const label = marker.label || ''
            const location = marker.location
            mapUrl += `&markers=color:${color}|label:${label}|${encodeURIComponent(location)}`
          })
        }
        
        // Add path if provided
        if (params.path) {
          mapUrl += `&path=color:0x0000ff|weight:3|enc:${params.path}`
        }
        
        console.log('🗺️ Static map URL generation for:', params.center)
        console.log('✅ Static map URL generated:', mapUrl.substring(0, 100) + '...')
        
        return new Response(JSON.stringify({ url: mapUrl }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'geocode':
        if (!params.address) {
          return new Response(
            JSON.stringify({ error: 'Address parameter is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(params.address)}&key=${GOOGLE_MAPS_API_KEY}&region=de&language=de`
        console.log('🗺️ Geocoding request for:', params.address)
        
        try {
          response = await fetch(geocodeUrl)
          const data = await response.json()
          console.log(`✅ Geocoding response status: ${response.status}`)
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } catch (fetchError) {
          console.error('❌ Geocoding fetch error:', fetchError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch geocoding data' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break
        
      default:
        console.error(`❌ Invalid action: ${action}`)
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('❌ Error in Google Maps proxy:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        type: 'internal_error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
