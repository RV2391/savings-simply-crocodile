
import { supabase } from "@/integrations/supabase/client";

export class BackendMapsService {
  private static instance: BackendMapsService;

  private constructor() {}

  public static getInstance(): BackendMapsService {
    if (!BackendMapsService.instance) {
      BackendMapsService.instance = new BackendMapsService();
    }
    return BackendMapsService.instance;
  }

  // Backend-basierte Adress-Autocomplete
  public async getAddressSuggestions(input: string): Promise<any[]> {
    if (!input || input.length < 3) return [];

    console.log('🔍 Frontend: Backend autocomplete request for:', input);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: { action: 'autocomplete', input }
      });

      if (error) {
        console.error('❌ Frontend: Autocomplete supabase error:', error);
        console.error('📋 Error details:', {
          message: error.message,
          name: error.name,
          context: error.context,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Autocomplete error: ${error.message}`);
      }

      console.log('📋 Frontend: Autocomplete response:', data);
      
      if (!data) {
        console.warn('⚠️ Frontend: No data received from autocomplete');
        return [];
      }

      if (data.error) {
        console.error('❌ Frontend: Backend returned error:', data.error);
        console.error('📋 Debug info:', data.debug);
        throw new Error(`Backend error: ${data.error}`);
      }

      const suggestions = data.suggestions || [];
      console.log(`✅ Frontend: Received ${suggestions.length} autocomplete suggestions`);
      
      return suggestions;
    } catch (error) {
      console.error('❌ Frontend: Backend autocomplete failed:', error);
      
      // Enhanced error information
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.includes('API key')) {
          console.error('🚨 Frontend: API Key problem detected for autocomplete');
          throw new Error('Google Places API Konfigurationsproblem: Möglicherweise ist die Places API nicht für den API-Schlüssel aktiviert.');
        } else if (error.message.includes('Network')) {
          throw new Error('Netzwerkfehler beim Laden der Adressvorschläge. Bitte überprüfen Sie Ihre Internetverbindung.');
        }
      }
      
      throw error;
    }
  }

  // Backend-basierte Platz-Details
  public async getPlaceDetails(placeId: string): Promise<{
    lat: number;
    lng: number;
    formatted_address: string;
    address_components: any[];
  }> {
    console.log('📍 Frontend: Backend place details request for:', placeId);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: { action: 'place_details', place_id: placeId }
      });

      if (error) {
        console.error('❌ Frontend: Place details supabase error:', error);
        console.error('📋 Error details:', {
          message: error.message,
          name: error.name,
          context: error.context,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Place details error: ${error.message}`);
      }

      console.log('📋 Frontend: Place details response:', data);
      
      if (!data) {
        console.error('❌ Frontend: No data received from place details');
        throw new Error('Keine Ortsdetails erhalten');
      }

      if (data.error) {
        console.error('❌ Frontend: Backend returned error:', data.error);
        console.error('📋 Debug info:', data.debug);
        throw new Error(`Backend error: ${data.error}`);
      }

      console.log('✅ Frontend: Place details successfully retrieved');
      return data;
    } catch (error) {
      console.error('❌ Frontend: Backend place details failed:', error);
      
      // Enhanced error information
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.includes('API key')) {
          console.error('🚨 Frontend: API Key problem detected for place details');
          throw new Error('Google Places API Konfigurationsproblem: Möglicherweise ist die Places API nicht für den API-Schlüssel aktiviert.');
        } else if (error.message.includes('Network')) {
          throw new Error('Netzwerkfehler beim Laden der Ortsdetails. Bitte überprüfen Sie Ihre Internetverbindung.');
        }
      }
      
      throw error;
    }
  }

  // Backend-basierte Routenberechnung
  public async getDirections(origin: string, destination: string): Promise<{
    distance: string;
    distance_value: number;
    duration: string;
    duration_value: number;
    polyline: string;
  }> {
    console.log('🗺️ Frontend: Backend directions request from:', origin, 'to:', destination);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: { action: 'directions', origin, destination }
      });

      if (error) {
        console.error('❌ Frontend: Directions supabase error:', error);
        throw new Error(`Directions error: ${error.message}`);
      }

      console.log('✅ Frontend: Directions successfully calculated');
      return data;
    } catch (error) {
      console.error('❌ Frontend: Backend directions failed:', error);
      throw error;
    }
  }

  // Backend-basierte statische Karte als Bild (sicher über Proxy)
  public async getStaticMapImageUrl(options: {
    center: string;
    zoom?: number;
    size?: string;
    markers?: Array<{
      location: string;
      color?: string;
      label?: string;
    }>;
    path?: string;
  }): Promise<string> {
    console.log('🗺️ Frontend: Backend static map image request for:', options.center);
    console.log('📋 Map options:', JSON.stringify(options, null, 2));
    
    try {
      console.log('🔄 Frontend: Invoking google-maps-proxy with static_map_image action...');
      console.log('🕒 Request timestamp:', new Date().toISOString());
      
      // Use fetch directly for binary response handling
      const supabaseUrl = "https://vkarnxgrniqtyeeibgxq.supabase.co";
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYXJueGdybmlxdHllZWliZ3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODYwNjUsImV4cCI6MjA2ODY2MjA2NX0.ULXL4SIwqXzzRWkxW15MO3OCkVfGlEvJ-NQ0_cnI9y8";
      
      console.log('🔄 Frontend: Making direct fetch request for binary image data...');
      
      const response = await fetch(`${supabaseUrl}/functions/v1/google-maps-proxy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Accept': 'image/png, application/json'
        },
        body: JSON.stringify({
          action: 'static_map_image',
          ...options
        })
      });

      console.log(`📊 Frontend: Direct fetch response status: ${response.status}`);
      console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Frontend: Direct fetch error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type') || 'image/png';
      console.log(`📊 Frontend: Content-Type: ${contentType}`);

      // Check if it's actually image data
      if (contentType.startsWith('image/')) {
        console.log('✅ Frontend: Received binary image data');
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        console.log('✅ Frontend: Created blob URL:', imageUrl);
        console.log('📊 Blob size:', blob.size, 'bytes');
        
        return imageUrl;
      } else {
        // It's probably an error response in JSON format
        const errorData = await response.json();
        console.error('❌ Frontend: Error response from backend:', errorData);
        throw new Error(`Backend error: ${errorData.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('❌ Frontend: Backend static map image failed:', error);
      console.error('🔍 Full error context:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        options: options
      });
      
      // Enhanced error information with user-friendly messages
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.includes('Forbidden') || error.message.includes('not authorized')) {
          throw new Error('Google Maps API nicht verfügbar: API-Schlüssel-Problem. Die API-Berechtigung ist fehlgeschlagen. Bitte überprüfen Sie die Google Cloud Console Konfiguration.');
        } else if (error.message.includes('429') || error.message.includes('Rate-Limit')) {
          throw new Error('Google Maps API vorübergehend nicht verfügbar: Zu viele Anfragen. Bitte versuchen Sie es später erneut.');
        } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
          throw new Error('Google Maps API Konfigurationsfehler: Ungültige Parameter. Bitte überprüfen Sie die Karten-Einstellungen.');
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          throw new Error('Google Maps API Server-Fehler: Der Service ist temporär nicht verfügbar. Bitte versuchen Sie es später erneut.');
        } else if (error.message.includes('Network') || error.message.includes('network')) {
          throw new Error('Netzwerkfehler beim Laden der Karte. Bitte überprüfen Sie Ihre Internetverbindung.');
        } else {
          throw new Error(`Google Maps Fehler: ${error.message}`);
        }
      } else {
        throw new Error(`Unbekannter Google Maps Fehler: ${String(error)}`);
      }
    }
  }

  // LEGACY: Backward compatibility for URL-based approach (deprecated)
  public async getStaticMapUrl(options: {
    center: string;
    zoom?: number;
    size?: string;
    markers?: Array<{
      location: string;
      color?: string;
      label?: string;
    }>;
    path?: string;
  }): Promise<string> {
    console.log('⚠️ Frontend: Using legacy getStaticMapUrl - switching to secure image proxy');
    return this.getStaticMapImageUrl(options);
  }

  // Backend-basierte Geocodierung (bestehend)
  public async geocodeAddress(address: string): Promise<{
    lat: number;
    lng: number;
    addressComponents?: any;
  } | null> {
    console.log('🗺️ Frontend: Backend geocoding request for:', address);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: { action: 'geocode', address }
      });

      if (error) {
        console.error('❌ Frontend: Geocoding supabase error:', error);
        console.error('📋 Error details:', {
          message: error.message,
          name: error.name,
          context: error.context,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Geocoding error: ${error.message}`);
      }

      console.log('📋 Frontend: Geocoding response:', data);
      
      if (!data) {
        console.warn('⚠️ Frontend: No data received from geocoding');
        return null;
      }

      if (data.error) {
        console.error('❌ Frontend: Backend returned error:', data.error);
        console.error('📋 Debug info:', data.debug);
        throw new Error(`Backend error: ${data.error}`);
      }

      if (data.results?.length > 0) {
        const result = data.results[0];
        console.log('✅ Frontend: Geocoding successful');
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          addressComponents: result.address_components
        };
      }

      console.warn('⚠️ Frontend: No geocoding results found');
      return null;
    } catch (error) {
      console.error('❌ Frontend: Backend geocoding failed:', error);
      
      // Enhanced error information
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.includes('API key')) {
          console.error('🚨 Frontend: API Key problem detected for geocoding');
          throw new Error('Google Geocoding API Konfigurationsproblem: Möglicherweise ist die Geocoding API nicht für den API-Schlüssel aktiviert.');
        } else if (error.message.includes('Network')) {
          throw new Error('Netzwerkfehler beim Geocoding. Bitte überprüfen Sie Ihre Internetverbindung.');
        }
      }
      
      throw error;
    }
  }
}

export const backendMapsService = BackendMapsService.getInstance();
