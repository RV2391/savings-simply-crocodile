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
    console.log('🗺️ Backend static map image request for:', options.center, 'with options:', options);
    
    try {
      // Get the Supabase function URL directly
      const { data: { session } } = await supabase.auth.getSession();
      const functionUrl = `https://vkarnxgrniqtyeeibgxq.supabase.co/functions/v1/google-maps-proxy`;
      
      // Create a direct fetch request with the image proxy action
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || supabase.supabaseKey}`,
        },
        body: JSON.stringify({ 
          action: 'static_map_image', 
          ...options 
        })
      });

      if (!response.ok) {
        console.error('❌ Static map image request failed:', response.status, response.statusText);
        throw new Error(`Static map image request failed: ${response.status} ${response.statusText}`);
      }

      // Check if response is actually an image
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        const errorText = await response.text();
        console.error('❌ Response is not an image:', contentType, errorText);
        throw new Error(`Expected image response, got: ${contentType}`);
      }

      // Convert the image response to a blob URL
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      console.log('✅ Static map image blob URL created successfully');
      return imageUrl;
    } catch (error) {
      console.error('❌ Backend static map image failed:', error);
      
      // Enhanced error information
      if (error instanceof Error) {
        throw new Error(`Backend static map image failed: ${error.message}`);
      } else {
        throw new Error(`Backend static map image failed: ${String(error)}`);
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
