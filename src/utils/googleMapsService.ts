
// Enhanced Google Maps Service with better error handling and fallbacks
import { supabase } from "@/integrations/supabase/client";

export class GoogleMapsService {
  private static instance: GoogleMapsService;
  private apiKey: string | null = null;
  private keyLoadAttempted: boolean = false;

  private constructor() {}

  public static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  // Load the frontend API key for client-side operations with better error handling
  public async loadApiKey(): Promise<string | null> {
    if (this.apiKey) return this.apiKey;
    if (this.keyLoadAttempted) return null;
    
    this.keyLoadAttempted = true;
    
    try {
      console.log('🔑 Loading Google Maps frontend API key from Supabase...');
      
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: { action: 'get_frontend_key' }
      });
      
      if (!error && data?.key) {
        this.apiKey = data.key;
        console.log('✅ Frontend API key loaded successfully');
        return this.apiKey;
      } else {
        console.error('❌ Failed to load frontend API key:', error);
        console.error('❌ Response data:', data);
      }
    } catch (error) {
      console.error('❌ Error loading frontend API key:', error);
      console.error('❌ Network or CORS issue detected');
    }
    
    return null;
  }

  // Create autocomplete when Google Maps is ready with enhanced error handling
  public createAutocomplete(
    input: HTMLInputElement,
    options?: google.maps.places.AutocompleteOptions
  ): google.maps.places.Autocomplete | null {
    if (!window.google?.maps?.places) {
      console.warn('🚨 Google Maps Places API not ready for autocomplete');
      console.warn('Available APIs:', Object.keys(window.google?.maps || {}));
      return null;
    }

    try {
      const defaultOptions: google.maps.places.AutocompleteOptions = {
        componentRestrictions: { country: "de" },
        fields: ["address_components", "geometry", "formatted_address", "place_id"],
        types: ["address"],
        ...options
      };

      console.log('✅ Creating Google Maps Autocomplete with options:', defaultOptions);
      const autocomplete = new google.maps.places.Autocomplete(input, defaultOptions);
      console.log('✅ Autocomplete created successfully');
      return autocomplete;
    } catch (error) {
      console.error('❌ Error creating autocomplete:', error);
      console.error('❌ Input element:', input);
      console.error('❌ Available Google Maps APIs:', window.google?.maps ? Object.keys(window.google.maps) : 'none');
      return null;
    }
  }

  // Enhanced backend geocoding with better error handling
  public async geocodeAddress(address: string): Promise<{
    lat: number;
    lng: number;
    addressComponents?: any;
  } | null> {
    try {
      console.log('🗺️ Using backend geocoding for:', address);
      
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: {
          action: 'geocode',
          address: address
        }
      });

      console.log('🗺️ Geocoding response:', { data, error });

      if (error) {
        console.error('❌ Backend geocoding error:', error);
        return null;
      }

      if (!data?.results?.[0]) {
        console.error('❌ No geocoding results found for:', address);
        console.error('❌ Full response:', data);
        return null;
      }

      const result = data.results[0];
      console.log('✅ Geocoding successful:', result.formatted_address);
      
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        addressComponents: result.address_components
      };
    } catch (error) {
      console.error('❌ Geocoding network error:', error);
      return null;
    }
  }

  // Check if Google Maps API is ready
  public isGoogleMapsReady(): boolean {
    const isReady = !!(window.google?.maps?.places);
    if (!isReady) {
      console.warn('🚨 Google Maps API not ready. Available:', {
        google: !!window.google,
        maps: !!window.google?.maps,
        places: !!window.google?.maps?.places
      });
    }
    return isReady;
  }
}

export const googleMapsService = GoogleMapsService.getInstance();
