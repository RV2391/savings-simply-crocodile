
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log('🚀 Google Maps Proxy function started')

serve(async (req) => {
  console.log(`📥 Incoming request: ${req.method} ${req.url}`)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, ...params } = await req.json()
    console.log(`🔄 Action requested: ${action}`)
    console.log(`📋 Parameters: ${JSON.stringify(params, null, 2)}`)
    
    // Get API keys with fallback support
    const primaryApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    const backupApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY_NEW')
    const staticApiKey = Deno.env.get('GOOGLE_MAPS_STATIC_API_KEY')
    
    console.log(`🔍 Environment check:`)
    console.log(`  - PRIMARY (GOOGLE_MAPS_API_KEY): ${primaryApiKey ? 'Present' : 'Missing'} (${primaryApiKey?.substring(0, 20) || 'N/A'}...)`)
    console.log(`  - BACKUP (GOOGLE_MAPS_API_KEY_NEW): ${backupApiKey ? 'Present' : 'Missing'} (${backupApiKey?.substring(0, 20) || 'N/A'}...)`)
    console.log(`  - STATIC (GOOGLE_MAPS_STATIC_API_KEY): ${staticApiKey ? 'Present' : 'Missing'} (${staticApiKey?.substring(0, 20) || 'N/A'}...)`)
    
    if (!primaryApiKey && !backupApiKey && !staticApiKey) {
      console.error('❌ No Google Maps API keys found in environment variables')
      return new Response(JSON.stringify({ 
        error: 'API keys not configured',
        debug: {
          message: 'No Google Maps API keys found in environment variables',
          timestamp: new Date().toISOString()
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Determine which API key to use (with fallback logic)
    const isStaticMapAction = action === 'static_map' || action === 'static_map_image'
    let apiKey = isStaticMapAction && staticApiKey ? staticApiKey : (primaryApiKey || backupApiKey)
    
    console.log(`🔑 Using ${isStaticMapAction ? 'Static Maps' : 'General'} API key: ${apiKey?.substring(0, 20) || 'NONE'}... (${apiKey === primaryApiKey ? 'primary' : apiKey === backupApiKey ? 'backup' : 'static'})`)
    
    // Prepare headers - Remove referrer to avoid restrictions
    const apiHeaders = {
      'User-Agent': 'Lovable-Maps-Service/1.0 (Backend Proxy)',
      'Accept': 'application/json'
    }

    let response
    
    switch (action) {
      case 'autocomplete':
        console.log('🔍 Processing autocomplete request...')
        const input = params.input
        
        if (!input || input.length < 3) {
          console.log('⚠️ Invalid autocomplete input')
          return new Response(JSON.stringify({ suggestions: [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&types=address&components=country:de|country:at|country:ch`
        console.log(`📍 Autocomplete URL: ${autocompleteUrl.replace(apiKey, 'API_KEY_HIDDEN')}`)
        
        try {
          console.log('🔄 Sending autocomplete request to Google Maps API...')
          response = await fetch(autocompleteUrl, { 
            headers: apiHeaders,
            method: 'GET'
          })
          console.log(`📊 Autocomplete API response status: ${response.status} ${response.statusText}`)
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error(`❌ Autocomplete API error: ${response.status} ${response.statusText}`)
            console.error(`📋 Error response body: ${errorText}`)
            
            // Handle specific error cases
            if (response.status === 403) {
              // Try backup key if primary failed and backup exists
              if (apiKey === primaryApiKey && backupApiKey) {
                console.log('🔄 Primary key failed with 403, trying backup key...')
                const backupUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${backupApiKey}&types=address&components=country:de|country:at|country:ch`
                
                try {
                  const backupResponse = await fetch(backupUrl, { headers: apiHeaders, method: 'GET' })
                  if (backupResponse.ok) {
                    console.log('✅ Backup key successful for autocomplete')
                    const backupData = await backupResponse.json()
                    
                    if (backupData.status === 'OK') {
                      const suggestions = backupData.predictions?.map((prediction: any) => ({
                        place_id: prediction.place_id,
                        description: prediction.description,
                        main_text: prediction.structured_formatting?.main_text || prediction.description,
                        secondary_text: prediction.structured_formatting?.secondary_text || ''
                      })) || []
                      
                      return new Response(JSON.stringify({ suggestions }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                      })
                    }
                  }
                  console.error(`❌ Backup key also failed: ${backupResponse.status}`)
                } catch (backupError) {
                  console.error('❌ Backup key request failed:', backupError)
                }
              }
              
              return new Response(JSON.stringify({ 
                error: 'API Key Problem: 403 Forbidden. Check API Key configuration and HTTP-Referrer restrictions.',
                debug: {
                  status: response.status,
                  statusText: response.statusText,
                  errorBody: errorText,
                  timestamp: new Date().toISOString(),
                  keyUsed: apiKey === primaryApiKey ? 'primary' : 'backup',
                  hasBackupKey: !!backupApiKey
                }
              }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              })
            }
            
            return new Response(JSON.stringify({ 
              error: `Google Maps API Error: ${response.status} ${response.statusText}`,
              debug: {
                status: response.status,
                statusText: response.statusText,
                errorBody: errorText,
                timestamp: new Date().toISOString()
              }
            }), {
              status: response.status,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          const data = await response.json()
          console.log(`📋 Autocomplete response status: ${data.status}`)
          
          if (data.status === 'OK') {
            const suggestions = data.predictions?.map((prediction: any) => ({
              place_id: prediction.place_id,
              description: prediction.description,
              main_text: prediction.structured_formatting?.main_text || prediction.description,
              secondary_text: prediction.structured_formatting?.secondary_text || ''
            })) || []
            
            console.log(`✅ Autocomplete successful: ${suggestions.length} suggestions`)
            return new Response(JSON.stringify({ suggestions }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          } else {
            console.error(`❌ Autocomplete API status error: ${data.status}`)
            console.error(`📋 Error details: ${JSON.stringify(data, null, 2)}`)
            
            return new Response(JSON.stringify({ 
              error: `Google Maps API Status Error: ${data.status}`,
              debug: {
                googleStatus: data.status,
                googleError: data.error_message,
                timestamp: new Date().toISOString()
              }
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        } catch (error) {
          console.error('❌ Autocomplete request failed:', error)
          return new Response(JSON.stringify({ 
            error: 'Network error during autocomplete request',
            debug: {
              message: error.message,
              timestamp: new Date().toISOString()
            }
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

      case 'place_details':
        console.log('📍 Processing place details request...')
        const placeId = params.place_id
        
        if (!placeId) {
          console.log('⚠️ Missing place_id parameter')
          return new Response(JSON.stringify({ 
            error: 'Missing place_id parameter',
            debug: { timestamp: new Date().toISOString() }
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&fields=geometry,formatted_address,address_components`
        console.log(`📍 Place details URL: ${detailsUrl.replace(apiKey, 'API_KEY_HIDDEN')}`)
        
        try {
          console.log('🔄 Sending place details request to Google Maps API...')
          response = await fetch(detailsUrl, { 
            headers: apiHeaders,
            method: 'GET'
          })
          console.log(`📊 Place details API response status: ${response.status} ${response.statusText}`)
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error(`❌ Place details API error: ${response.status} ${response.statusText}`)
            console.error(`📋 Error response body: ${errorText}`)
            
            if (response.status === 403) {
              return new Response(JSON.stringify({ 
                error: 'API Key Problem: 403 Forbidden. Check API Key configuration and HTTP-Referrer restrictions.',
                debug: {
                  status: response.status,
                  statusText: response.statusText,
                  errorBody: errorText,
                  timestamp: new Date().toISOString()
                }
              }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              })
            }
            
            return new Response(JSON.stringify({ 
              error: `Google Maps API Error: ${response.status} ${response.statusText}`,
              debug: {
                status: response.status,
                statusText: response.statusText,
                errorBody: errorText,
                timestamp: new Date().toISOString()
              }
            }), {
              status: response.status,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          const data = await response.json()
          console.log(`📋 Place details response status: ${data.status}`)
          
          if (data.status === 'OK' && data.result) {
            const result = data.result
            const placeDetails = {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng,
              formatted_address: result.formatted_address,
              address_components: result.address_components
            }
            
            console.log(`✅ Place details successful: ${placeDetails.formatted_address}`)
            return new Response(JSON.stringify(placeDetails), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          } else {
            console.error(`❌ Place details API status error: ${data.status}`)
            console.error(`📋 Error details: ${JSON.stringify(data, null, 2)}`)
            
            return new Response(JSON.stringify({ 
              error: `Google Maps API Status Error: ${data.status}`,
              debug: {
                googleStatus: data.status,
                googleError: data.error_message,
                timestamp: new Date().toISOString()
              }
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        } catch (error) {
          console.error('❌ Place details request failed:', error)
          return new Response(JSON.stringify({ 
            error: 'Network error during place details request',
            debug: {
              message: error.message,
              timestamp: new Date().toISOString()
            }
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

      case 'geocode':
        console.log('🗺️ Processing geocoding request...')
        const address = params.address
        
        if (!address) {
          console.log('⚠️ Missing address parameter')
          return new Response(JSON.stringify({ 
            error: 'Missing address parameter',
            debug: { timestamp: new Date().toISOString() }
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&components=country:de|country:at|country:ch`
        console.log(`📍 Geocoding URL: ${geocodeUrl.replace(apiKey, 'API_KEY_HIDDEN')}`)
        
        try {
          console.log('🔄 Sending geocoding request to Google Maps API...')
          response = await fetch(geocodeUrl, { 
            headers: apiHeaders,
            method: 'GET'
          })
          console.log(`📊 Geocoding API response status: ${response.status} ${response.statusText}`)
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error(`❌ Geocoding API error: ${response.status} ${response.statusText}`)
            console.error(`📋 Error response body: ${errorText}`)
            
            if (response.status === 403) {
              return new Response(JSON.stringify({ 
                error: 'API Key Problem: 403 Forbidden. Check API Key configuration and HTTP-Referrer restrictions.',
                debug: {
                  status: response.status,
                  statusText: response.statusText,
                  errorBody: errorText,
                  timestamp: new Date().toISOString()
                }
              }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              })
            }
            
            return new Response(JSON.stringify({ 
              error: `Google Maps API Error: ${response.status} ${response.statusText}`,
              debug: {
                status: response.status,
                statusText: response.statusText,
                errorBody: errorText,
                timestamp: new Date().toISOString()
              }
            }), {
              status: response.status,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          const data = await response.json()
          console.log(`📋 Geocoding response status: ${data.status}`)
          
          if (data.status === 'OK') {
            console.log(`✅ Geocoding successful: ${data.results.length} results`)
            return new Response(JSON.stringify({ results: data.results }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          } else {
            console.error(`❌ Geocoding API status error: ${data.status}`)
            console.error(`📋 Error details: ${JSON.stringify(data, null, 2)}`)
            
            return new Response(JSON.stringify({ 
              error: `Google Maps API Status Error: ${data.status}`,
              debug: {
                googleStatus: data.status,
                googleError: data.error_message,
                timestamp: new Date().toISOString()
              }
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        } catch (error) {
          console.error('❌ Geocoding request failed:', error)
          return new Response(JSON.stringify({ 
            error: 'Network error during geocoding request',
            debug: {
              message: error.message,
              timestamp: new Date().toISOString()
            }
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

      case 'directions':
        console.log('🗺️ Processing directions request...')
        const { origin, destination } = params
        
        if (!origin || !destination) {
          console.log('⚠️ Missing origin or destination parameters')
          return new Response(JSON.stringify({ 
            error: 'Missing origin or destination parameters',
            debug: { timestamp: new Date().toISOString() }
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}&mode=driving`
        console.log(`📍 Directions URL: ${directionsUrl.replace(apiKey, 'API_KEY_HIDDEN')}`)
        console.log('🗺️ Directions request:', params.origin, 'to', params.destination)
        
        try {
          response = await fetch(directionsUrl, { 
            headers: apiHeaders,
            method: 'GET'
          })
          const data = await response.json()
          console.log(`✅ Directions response status: ${response.status}`)
          
          if (data.status === 'OK' && data.routes.length > 0) {
            const route = data.routes[0]
            const leg = route.legs[0]
            
            const result = {
              distance: leg.distance.text,
              distance_value: leg.distance.value,
              duration: leg.duration.text,
              duration_value: leg.duration.value,
              polyline: route.overview_polyline?.points || ''
            }
            
            console.log(`✅ Directions successful: ${result.distance}, ${result.duration}`)
            return new Response(JSON.stringify(result), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          } else {
            console.error(`❌ Directions API status error: ${data.status}`)
            return new Response(JSON.stringify({ 
              error: `Directions API Status Error: ${data.status}`,
              debug: {
                googleStatus: data.status,
                googleError: data.error_message,
                timestamp: new Date().toISOString()
              }
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        } catch (error) {
          console.error('❌ Directions request failed:', error)
          return new Response(JSON.stringify({ 
            error: 'Network error during directions request',
            debug: {
              message: error.message,
              timestamp: new Date().toISOString()
            }
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

      case 'static_map_image':
        console.log('🗺️ Processing static map image request...')
        const { center, zoom = 10, size = '800x400', markers = [], path = '' } = params
        
        if (!center) {
          console.log('⚠️ Missing center parameter for static map')
          return new Response(JSON.stringify({ 
            error: 'Missing center parameter for static map',
            debug: { timestamp: new Date().toISOString() }
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        // Build markers string
        const markersString = markers.map((marker: any) => {
          const color = marker.color || 'red'
          const label = marker.label || ''
          return `markers=color:${color}|label:${label}|${marker.location}`
        }).join('&')
        
        // Build path string
        const pathString = path ? `&path=color:0x0000ff|weight:3|enc:${path}` : ''
        
        const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(center)}&zoom=${zoom}&size=${size}&${markersString}${pathString}&key=${apiKey}`
        console.log(`📍 Static Map URL: ${staticMapUrl.replace(apiKey, 'API_KEY_HIDDEN')}`)
        
        try {
          console.log('🔄 Fetching image from Google Maps API...')
          const imageResponse = await fetch(staticMapUrl, { 
            headers: {
              'User-Agent': 'Lovable-Maps-Service/1.0 (Backend Proxy)'
            },
            method: 'GET'
          })
          
          console.log(`📊 Google Maps API response status: ${imageResponse.status}`)
          console.log(`📊 Google Maps API response statusText: ${imageResponse.statusText}`)
          
          if (!imageResponse.ok) {
            const errorText = await imageResponse.text()
            console.error(`❌ Static Maps API error with ${apiKey === primaryApiKey ? 'primary' : apiKey === backupApiKey ? 'backup' : 'static'} key: ${imageResponse.status} ${imageResponse.statusText}`)
            console.error(`📋 Error response body: ${errorText}`)
            
            // Try backup key if primary failed with 403
            if (imageResponse.status === 403 && apiKey === primaryApiKey && backupApiKey) {
              console.log('🔄 Primary key failed for static map, trying backup key...')
              const backupMarkersString = markers.map((marker: any) => {
                const color = marker.color || 'red'
                const label = marker.label || ''
                return `markers=color:${color}|label:${label}|${marker.location}`
              }).join('&')
              
              const backupPathString = path ? `&path=color:0x0000ff|weight:3|enc:${path}` : ''
              const backupStaticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(center)}&zoom=${zoom}&size=${size}&${backupMarkersString}${backupPathString}&key=${backupApiKey}`
              
              try {
                const backupImageResponse = await fetch(backupStaticMapUrl, { 
                  headers: { 'User-Agent': 'Lovable-Maps-Service/1.0 (Backend Proxy)' },
                  method: 'GET'
                })
                
                if (backupImageResponse.ok) {
                  console.log('✅ Backup key successful for static map')
                  const backupImageBuffer = await backupImageResponse.arrayBuffer()
                  return new Response(backupImageBuffer, {
                    headers: {
                      ...corsHeaders,
                      'Content-Type': backupImageResponse.headers.get('Content-Type') || 'image/png',
                      'Content-Length': backupImageBuffer.byteLength.toString()
                    }
                  })
                }
                console.error(`❌ Backup key also failed for static map: ${backupImageResponse.status}`)
              } catch (backupError) {
                console.error('❌ Backup static map request failed:', backupError)
              }
            }
            
            return new Response(JSON.stringify({ 
              error: `Static Maps API Key Problem: ${imageResponse.status} ${imageResponse.statusText}. Check API Key configuration and HTTP-Referrer restrictions.`,
              debug: {
                timestamp: new Date().toISOString(),
                status: imageResponse.status,
                statusText: imageResponse.statusText,
                errorBody: errorText,
                keyUsed: apiKey === primaryApiKey ? 'primary' : apiKey === backupApiKey ? 'backup' : 'static',
                hasBackupKey: !!backupApiKey
              }
            }), {
              status: imageResponse.status,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          const contentType = imageResponse.headers.get('Content-Type') || 'image/png'
          console.log(`📊 Image content type: ${contentType}`)
          
          if (contentType.startsWith('image/')) {
            console.log('✅ Static map image retrieved successfully')
            const imageBuffer = await imageResponse.arrayBuffer()
            
            return new Response(imageBuffer, {
              headers: {
                ...corsHeaders,
                'Content-Type': contentType,
                'Content-Length': imageBuffer.byteLength.toString()
              }
            })
          } else {
            console.error('❌ Response is not an image')
            const errorText = await imageResponse.text()
            
            return new Response(JSON.stringify({ 
              error: 'Static Maps API returned non-image content',
              debug: {
                timestamp: new Date().toISOString(),
                contentType: contentType,
                responseBody: errorText
              }
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        } catch (error) {
          console.error('❌ Static map request failed:', error)
          return new Response(JSON.stringify({ 
            error: 'Network error during static map request',
            debug: {
              message: error.message,
              timestamp: new Date().toISOString()
            }
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

      default:
        console.log(`⚠️ Unknown action: ${action}`)
        return new Response(JSON.stringify({ 
          error: `Unknown action: ${action}`,
          debug: { timestamp: new Date().toISOString() }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('❌ General error in google-maps-proxy:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      debug: {
        message: error.message,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
