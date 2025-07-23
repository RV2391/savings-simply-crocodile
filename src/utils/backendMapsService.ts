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

    console.log('🔍 Backend autocomplete for:', input);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: { action: 'autocomplete', input }
      });

      if (error) {
        console.error('❌ Autocomplete error:', error);
        throw new Error(`Autocomplete error: ${error.message}`);
      }

      return data.suggestions || [];
    } catch (error) {
      console.error('❌ Backend autocomplete failed:', error);
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
    console.log('📍 Backend place details for:', placeId);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: { action: 'place_details', place_id: placeId }
      });

      if (error) {
        console.error('❌ Place details error:', error);
        throw new Error(`Place details error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Backend place details failed:', error);
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
    console.log('🗺️ Backend directions from:', origin, 'to:', destination);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: { action: 'directions', origin, destination }
      });

      if (error) {
        console.error('❌ Directions error:', error);
        throw new Error(`Directions error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Backend directions failed:', error);
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
    console.log('🗺️ Backend static map image request for:', options.center);
    console.log('📋 Map options:', JSON.stringify(options, null, 2));
    
    try {
      console.log('🔄 Invoking google-maps-proxy with static_map_image action...');
      console.log('🕒 Request timestamp:', new Date().toISOString());
      
      // Use fetch directly for binary response handling
      const supabaseUrl = supabase.supabaseUrl;
      const supabaseKey = supabase.supabaseKey;
      
      console.log('🔄 Making direct fetch request for binary image data...');
      
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

      console.log(`📊 Direct fetch response status: ${response.status}`);
      console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Direct fetch error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type') || 'image/png';
      console.log(`📊 Content-Type: ${contentType}`);

      // Check if it's actually image data
      if (contentType.startsWith('image/')) {
        console.log('✅ Received binary image data');
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        console.log('✅ Created blob URL:', imageUrl);
        console.log('📊 Blob size:', blob.size, 'bytes');
        
        return imageUrl;
      } else {
        // It's probably an error response in JSON format
        const errorData = await response.json();
        console.error('❌ Error response from backend:', errorData);
        throw new Error(`Backend error: ${errorData.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('❌ Backend static map image failed:', error);
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
    console.log('⚠️ Using legacy getStaticMapUrl - switching to secure image proxy');
    return this.getStaticMapImageUrl(options);
  }

  // Backend-basierte Geocodierung (bestehend)
  public async geocodeAddress(address: string): Promise<{
    lat: number;
    lng: number;
    addressComponents?: any;
  } | null> {
    console.log('🗺️ Backend geocoding for:', address);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: { action: 'geocode', address }
      });

      if (error) {
        throw new Error(`Geocoding error: ${error.message}`);
      }

      if (data?.results?.length > 0) {
        const result = data.results[0];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          addressComponents: result.address_components
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Backend geocoding failed:', error);
      throw error;
    }
  }
}

export const backendMapsService = BackendMapsService.getInstance();
