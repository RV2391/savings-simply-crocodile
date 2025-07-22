
// Simplified Google Maps Service - Only for geocoding and autocomplete fallbacks
import { supabase } from "@/integrations/supabase/client";

export class GoogleMapsService {
  private static instance: GoogleMapsService;
  private apiKey: string | null = null;

  private constructor() {}

  public static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  // Load the frontend API key for client-side operations
  public async loadApiKey(): Promise<string | null> {
    if (this.apiKey) return this.apiKey;
    
    try {
      console.log('Loading Google Maps frontend API key from Supabase...');
      
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: { action: 'get_frontend_key' }
      });
      
      if (!error && data?.key) {
        this.apiKey = data.key;
        console.log('Frontend API key loaded successfully');
        return this.apiKey;
      } else {
        console.error('Failed to load frontend API key:', error);
      }
    } catch (error) {
      console.error('Error loading frontend API key:', error);
    }
    
    return null;
  }

  // Create autocomplete when Google Maps is ready
  public createAutocomplete(
    input: HTMLInputElement,
    options?: google.maps.places.AutocompleteOptions
  ): google.maps.places.Autocomplete | null {
    if (!window.google?.maps) {
      console.warn('Google Maps not ready for autocomplete');
      return null;
    }

    try {
      const defaultOptions: google.maps.places.AutocompleteOptions = {
        componentRestrictions: { country: "de" },
        fields: ["address_components", "geometry", "formatted_address", "place_id"],
        types: ["address"],
        ...options
      };

      return new google.maps.places.Autocomplete(input, defaultOptions);
    } catch (error) {
      console.error('Error creating autocomplete:', error);
      return null;
    }
  }

  // Fallback to backend geocoding
  public async geocodeAddress(address: string): Promise<{
    lat: number;
    lng: number;
    addressComponents?: any;
  } | null> {
    try {
      console.log('Using backend geocoding for:', address);
      
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: {
          action: 'geocode',
          address: address
        }
      });

      if (error || !data?.results?.[0]) {
        console.error('Backend geocoding failed:', error);
        return null;
      }

      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        addressComponents: result.address_components
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }
}

export const googleMapsService = GoogleMapsService.getInstance();
