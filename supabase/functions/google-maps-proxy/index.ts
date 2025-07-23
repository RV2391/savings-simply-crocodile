import { corsHeaders } from '../_shared/cors.ts'

console.log("🚀 Enhanced Google Maps Proxy function started - Version 2.3 with improved API debugging")

Deno.serve(async (req) => {
  console.log(`📨 Request received: ${req.method} ${req.url}`)
  console.log(`🕒 Timestamp: ${new Date().toISOString()}`)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, ...params } = await req.json()
    console.log(`🔄 Action requested: ${action}`)
    console.log(`📋 Parameters: ${JSON.stringify(params, null, 2)}`)
    
    // Get API keys - try multiple key sources for better compatibility
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY_NEW') || Deno.env.get('GOOGLE_MAPS_API_KEY')
    const GOOGLE_MAPS_STATIC_API_KEY = Deno.env.get('GOOGLE_MAPS_STATIC_API_KEY') || GOOGLE_MAPS_API_KEY
    
    console.log(`🔍 Environment check:`)
    console.log(`  - GOOGLE_MAPS_API_KEY: ${GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing'} (${GOOGLE_MAPS_API_KEY?.substring(0, 20) || 'N/A'}...)`)
    console.log(`  - GOOGLE_MAPS_STATIC_API_KEY: ${GOOGLE_MAPS_STATIC_API_KEY ? 'Present' : 'Missing'} (${GOOGLE_MAPS_STATIC_API_KEY?.substring(0, 20) || 'N/A'}...)`)
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('❌ CRITICAL: Google Maps API key not found in environment')
      return new Response(
        JSON.stringify({ 
          error: 'Google Maps API key not configured',
          debug: 'GOOGLE_MAPS_API_KEY environment variable is missing',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Determine which API key to use based on action
    const isStaticMapAction = action === 'static_map_image' || action === 'static_map'
    const apiKey = isStaticMapAction && GOOGLE_MAPS_STATIC_API_KEY ? GOOGLE_MAPS_STATIC_API_KEY : GOOGLE_MAPS_API_KEY
    
    console.log(`🔑 Using ${isStaticMapAction ? 'Static Maps' : 'General'} API key: ${apiKey.substring(0, 20)}...`)
    
    // Prepare headers with proper referrer for API requests
    const apiHeaders = {
      'Referer': 'https://lovable.dev/',
      'User-Agent': 'Lovable-Maps-Service/1.0'
    }

    let response
    
    switch (action) {
      case 'autocomplete':
        if (!params.input) {
          console.error('❌ Autocomplete: Missing input parameter')
          return new Response(
            JSON.stringify({ error: 'Input parameter is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(params.input)}&key=${apiKey}&types=address&components=country:de|country:at|country:ch&language=de`
        console.log('🔍 Places autocomplete request for:', params.input)
        console.log('🔗 Full autocomplete URL (key redacted):', autocompleteUrl.replace(apiKey, 'API_KEY_REDACTED'))
        
        try {
          console.log('🔄 Sending autocomplete request to Google Maps API...')
          response = await fetch(autocompleteUrl, { headers: apiHeaders })
          console.log(`📊 Autocomplete API response status: ${response.status} ${response.statusText}`)
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ Autocomplete API error response:', errorText)
            console.error('📋 Error details:', {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries())
            })
            
            return new Response(
              JSON.stringify({ 
                error: `Google Places API error: ${response.status} ${response.statusText}`,
                debug: {
                  status: response.status,
                  statusText: response.statusText,
                  body: errorText,
                  apiEndpoint: 'autocomplete',
                  timestamp: new Date().toISOString()
                }
              }),
              { 
                status: response.status, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
          
          const data = await response.json()
          console.log(`✅ Autocomplete response received with ${data.predictions?.length || 0} predictions`)
          console.log('📋 API response status:', data.status)
          
          if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error('❌ Google Places API returned error status:', data.status)
            console.error('📋 Error message:', data.error_message)
            
            return new Response(
              JSON.stringify({ 
                error: `Google Places API status: ${data.status}`,
                debug: {
                  apiStatus: data.status,
                  errorMessage: data.error_message,
                  timestamp: new Date().toISOString()
                }
              }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
          
          // Transform to simpler format for frontend
          const suggestions = data.predictions?.map((pred: any) => ({
            place_id: pred.place_id,
            description: pred.description,
            main_text: pred.structured_formatting?.main_text,
            secondary_text: pred.structured_formatting?.secondary_text
          })) || []
          
          console.log(`✅ Returning ${suggestions.length} autocomplete suggestions`)
          return new Response(JSON.stringify({ suggestions }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } catch (fetchError) {
          console.error('❌ Autocomplete network error:', fetchError)
          return new Response(
            JSON.stringify({ 
              error: 'Network error during autocomplete request',
              debug: {
                message: fetchError.message,
                name: fetchError.name,
                timestamp: new Date().toISOString()
              }
            }),
            { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break

      case 'place_details':
        if (!params.place_id) {
          console.error('❌ Place details: Missing place_id parameter')
          return new Response(
            JSON.stringify({ error: 'place_id parameter is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${params.place_id}&fields=geometry,address_components,formatted_address&key=${apiKey}&language=de`
        console.log('📍 Place details request for:', params.place_id)
        console.log('🔗 Full details URL (key redacted):', detailsUrl.replace(apiKey, 'API_KEY_REDACTED'))
        
        try {
          console.log('🔄 Sending place details request to Google Maps API...')
          response = await fetch(detailsUrl, { headers: apiHeaders })
          console.log(`📊 Place details API response status: ${response.status} ${response.statusText}`)
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ Place details API error response:', errorText)
            console.error('📋 Error details:', {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries())
            })
            
            return new Response(
              JSON.stringify({ 
                error: `Google Places API error: ${response.status} ${response.statusText}`,
                debug: {
                  status: response.status,
                  statusText: response.statusText,
                  body: errorText,
                  apiEndpoint: 'place_details',
                  timestamp: new Date().toISOString()
                }
              }),
              { 
                status: response.status, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
          
          const data = await response.json()
          console.log('📋 Place details API response status:', data.status)
          
          if (data.status !== 'OK') {
            console.error('❌ Google Places API returned error status:', data.status)
            console.error('📋 Error message:', data.error_message)
            
            return new Response(
              JSON.stringify({ 
                error: `Google Places API status: ${data.status}`,
                debug: {
                  apiStatus: data.status,
                  errorMessage: data.error_message,
                  timestamp: new Date().toISOString()
                }
              }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
          
          if (data.result) {
            const result = {
              lat: data.result.geometry.location.lat,
              lng: data.result.geometry.location.lng,
              formatted_address: data.result.formatted_address,
              address_components: data.result.address_components
            }
            
            console.log('✅ Place details successfully retrieved')
            return new Response(JSON.stringify(result), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          } else {
            console.error('❌ No place details found in response')
            return new Response(
              JSON.stringify({ 
                error: 'No place details found',
                debug: {
                  apiStatus: data.status,
                  timestamp: new Date().toISOString()
                }
              }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        } catch (fetchError) {
          console.error('❌ Place details network error:', fetchError)
          return new Response(
            JSON.stringify({ 
              error: 'Network error during place details request',
              debug: {
                message: fetchError.message,
                name: fetchError.name,
                timestamp: new Date().toISOString()
              }
            }),
            { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break

      case 'geocode':
        if (!params.address) {
          console.error('❌ Geocode: Missing address parameter')
          return new Response(
            JSON.stringify({ error: 'Address parameter is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(params.address)}&key=${apiKey}&region=de&language=de`
        console.log('🗺️ Geocoding request for:', params.address)
        console.log('🔗 Full geocode URL (key redacted):', geocodeUrl.replace(apiKey, 'API_KEY_REDACTED'))
        
        try {
          console.log('🔄 Sending geocoding request to Google Maps API...')
          response = await fetch(geocodeUrl, { headers: apiHeaders })
          console.log(`📊 Geocoding API response status: ${response.status} ${response.statusText}`)
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ Geocoding API error response:', errorText)
            console.error('📋 Error details:', {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries())
            })
            
            return new Response(
              JSON.stringify({ 
                error: `Google Geocoding API error: ${response.status} ${response.statusText}`,
                debug: {
                  status: response.status,
                  statusText: response.statusText,
                  body: errorText,
                  apiEndpoint: 'geocode',
                  timestamp: new Date().toISOString()
                }
              }),
              { 
                status: response.status, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
          
          const data = await response.json()
          console.log('📋 Geocoding API response status:', data.status)
          console.log(`✅ Geocoding response received with ${data.results?.length || 0} results`)
          
          if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error('❌ Google Geocoding API returned error status:', data.status)
            console.error('📋 Error message:', data.error_message)
            
            return new Response(
              JSON.stringify({ 
                error: `Google Geocoding API status: ${data.status}`,
                debug: {
                  apiStatus: data.status,
                  errorMessage: data.error_message,
                  timestamp: new Date().toISOString()
                }
              }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } catch (fetchError) {
          console.error('❌ Geocoding network error:', fetchError)
          return new Response(
            JSON.stringify({ 
              error: 'Network error during geocoding request',
              debug: {
                message: fetchError.message,
                name: fetchError.name,
                timestamp: new Date().toISOString()
              }
            }),
            { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        
        const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(params.origin)}&destination=${encodeURIComponent(params.destination)}&key=${apiKey}&language=de&units=metric&mode=driving&alternatives=true`
        console.log('🗺️ Directions request:', params.origin, 'to', params.destination)
        
        try {
          response = await fetch(directionsUrl, { headers: apiHeaders })
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
        
        let staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(params.center)}&zoom=${zoom}&size=${size}&maptype=${maptype}&key=${apiKey}`
        
        // Add markers if provided
        if (params.markers && Array.isArray(params.markers)) {
          console.log(`📍 Adding ${params.markers.length} markers to map`)
          params.markers.forEach((marker: any, index: number) => {
            const color = marker.color || 'red'
            const label = marker.label || ''
            const location = marker.location
            console.log(`  📌 Marker ${index + 1}: ${color} ${label} at ${location}`)
            staticMapUrl += `&markers=color:${color}|label:${label}|${encodeURIComponent(location)}`
          })
        }
        
        // Add path if provided
        if (params.path) {
          console.log(`🛣️ Adding path to map: ${params.path.substring(0, 50)}...`)
          staticMapUrl += `&path=color:0x0000ff|weight:3|enc:${params.path}`
        }
        
        console.log('🗺️ Static map image request for:', params.center)
        console.log('🔑 Using Static Maps API key for secure request')
        console.log('📏 Final Google Maps URL length:', staticMapUrl.length)
        
        try {
          console.log('🔄 Fetching image from Google Maps API...')
          const imageResponse = await fetch(staticMapUrl, { headers: apiHeaders })
          
          console.log(`📊 Google Maps API response status: ${imageResponse.status}`)
          console.log(`📊 Google Maps API response statusText: ${imageResponse.statusText}`)
          
          if (!imageResponse.ok) {
            const errorText = await imageResponse.text()
            console.error('❌ Google Maps API error response:', errorText)
            
            let errorMessage = `Google Maps API returned ${imageResponse.status}: ${imageResponse.statusText}`
            let debugInfo = {
              timestamp: new Date().toISOString(),
              status: imageResponse.status,
              statusText: imageResponse.statusText,
              errorBody: errorText,
              usingStaticApiKey: !!GOOGLE_MAPS_STATIC_API_KEY,
              apiKeyLength: apiKey.length,
              urlLength: staticMapUrl.length,
              requestedCenter: params.center,
              requestedSize: size,
              requestedZoom: zoom,
              markerCount: params.markers?.length || 0
            }
            
            if (imageResponse.status === 403) {
              console.error('🚨 403 FORBIDDEN - Static Maps API Key Problem detected!')
              errorMessage = 'Static Maps API Key Problem: 403 Forbidden. Check API Key configuration and HTTP-Referrer restrictions.'
              debugInfo.diagnosis = 'STATIC_API_KEY_AUTHORIZATION_PROBLEM'
            } else if (imageResponse.status === 400) {
              console.error('🚨 400 BAD REQUEST - Invalid parameters')
              errorMessage = 'Invalid request parameters. Check the map configuration.'
              debugInfo.diagnosis = 'INVALID_REQUEST_PARAMETERS'
            } else if (imageResponse.status === 429) {
              console.error('🚨 429 RATE LIMITED - Too many requests')
              errorMessage = 'Rate limit exceeded. Try again later.'
              debugInfo.diagnosis = 'RATE_LIMIT_EXCEEDED'
            }
            
            return new Response(
              JSON.stringify({ 
                error: errorMessage,
                debug: debugInfo,
                timestamp: new Date().toISOString()
              }),
              { 
                status: imageResponse.status, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
          
          const contentType = imageResponse.headers.get('content-type') || 'image/png'
          const imageArrayBuffer = await imageResponse.arrayBuffer()
          
          console.log('✅ Successfully loaded map image from Google Maps API')
          console.log(`📊 Image details: ${imageArrayBuffer.byteLength} bytes, type: ${contentType}`)
          console.log(`🔑 Success with ${GOOGLE_MAPS_STATIC_API_KEY ? 'Static Maps' : 'General'} API key`)
          
          // Return the image as proper binary data with CORS headers
          return new Response(imageArrayBuffer, {
            headers: {
              ...corsHeaders,
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600',
              'Content-Length': imageArrayBuffer.byteLength.toString(),
              'X-Debug-Status': 'success',
              'X-Debug-Timestamp': new Date().toISOString(),
              'X-Debug-ApiKey': GOOGLE_MAPS_STATIC_API_KEY ? 'static' : 'general'
            }
          })
        } catch (fetchError) {
          console.error('❌ Network error while fetching from Google Maps:', fetchError)
          
          return new Response(
            JSON.stringify({ 
              error: 'Network error while loading map image',
              debug: {
                message: fetchError.message,
                name: fetchError.name,
                type: 'network_error',
                timestamp: new Date().toISOString()
              }
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
        
        let mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(params.center)}&zoom=${mapZoom}&size=${mapSize}&maptype=${mapMaptype}&key=${apiKey}`
        
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
        console.log('🔑 Using Static Maps API key for URL generation')
        console.log('✅ Static map URL generated:', mapUrl.substring(0, 100) + '...')
        
        return new Response(JSON.stringify({ url: mapUrl }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
        
      default:
        console.error(`❌ Invalid action: ${action}`)
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('❌ Error in Google Maps proxy:', error)
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        debug: {
          message: error.message,
          name: error.name,
          type: 'internal_error',
          timestamp: new Date().toISOString()
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
