
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
      
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: { 
          action: 'static_map_image', 
          ...options 
        }
      });

      if (error) {
        console.error('❌ Static map image error from function:', error);
        console.error('🔍 Full error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          context: error.context,
          timestamp: new Date().toISOString()
        });
        
        // Enhanced error handling with specific error types
        if (error.message?.includes('403')) {
          throw new Error('Google Maps API: 403 Forbidden - API Key Problem. Überprüfen Sie die API-Schlüssel-Konfiguration, Billing und Berechtigungen in der Google Cloud Console.');
        } else if (error.message?.includes('429')) {
          throw new Error('Google Maps API: 429 Rate-Limit erreicht. Bitte versuchen Sie es später erneut.');
        } else if (error.message?.includes('400')) {
          throw new Error('Google Maps API: 400 Ungültige Anfrage-Parameter. Überprüfen Sie die Karten-Konfiguration.');
        } else if (error.message?.includes('500')) {
          throw new Error('Google Maps API: 500 Server-Fehler. Möglicherweise ist die API temporär nicht verfügbar.');
        } else {
          throw new Error(`Static map image error: ${error.message}`);
        }
      }

      // Check if we received binary data (ArrayBuffer)
      if (data instanceof ArrayBuffer) {
        console.log('✅ Received ArrayBuffer data, size:', data.byteLength, 'bytes');
        
        // Validate that we actually received image data
        if (data.byteLength === 0) {
          throw new Error('Empty image data received from Google Maps API');
        }
        
        // Additional validation for minimum image size
        if (data.byteLength < 1000) {
          console.warn('⚠️ Received very small image data, might be an error response');
        }
        
        // Create blob from ArrayBuffer
        const blob = new Blob([data], { type: 'image/png' });
        const imageUrl = URL.createObjectURL(blob);
        
        console.log('✅ Created blob URL:', imageUrl);
        console.log('📊 Image metrics:', {
          size: data.byteLength,
          url: imageUrl,
          timestamp: new Date().toISOString()
        });
        
        return imageUrl;
      }

      // If we get here, check if it's an error response
      if (typeof data === 'object' && data !== null && 'error' in data) {
        console.error('❌ Error response from backend:', data);
        console.error('🔍 Debug information:', data.debug);
        
        // Check for specific error types from debug info
        if (data.debug?.diagnosis === 'API_KEY_AUTHORIZATION_PROBLEM') {
          throw new Error('Google Maps API Key Problem: API-Schlüssel ist ungültig, abgelaufen oder hat keine Berechtigung für die Static Maps API. Überprüfen Sie die Google Cloud Console.');
        } else if (data.debug?.diagnosis === 'RATE_LIMIT_EXCEEDED') {
          throw new Error('Google Maps API Rate-Limit erreicht. Bitte versuchen Sie es später erneut.');
        } else if (data.debug?.diagnosis === 'INVALID_REQUEST_PARAMETERS') {
          throw new Error('Ungültige Anfrage-Parameter für Google Maps API. Überprüfen Sie die Karten-Konfiguration.');
        } else {
          throw new Error(`Backend error: ${data.error}`);
        }
      }

      // If we get here, the response format is unexpected
      console.error('❌ Unexpected response format from static_map_image:', typeof data);
      console.error('🔍 Response data:', data);
      throw new Error(`Unexpected response format: ${typeof data}`);
      
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
