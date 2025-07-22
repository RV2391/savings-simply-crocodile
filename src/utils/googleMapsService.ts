
// Google Maps Frontend Service - Manages direct API integration
import { supabase } from "@/integrations/supabase/client";

export class GoogleMapsService {
  private static instance: GoogleMapsService;
  private apiKey: string | null = null;
  private isLoaded = false;
  private loadPromise: Promise<boolean> | null = null;

  private constructor() {}

  public static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  // Load the frontend API key securely from Supabase
  private async loadApiKey(): Promise<string | null> {
    if (this.apiKey) return this.apiKey;
    
    try {
      // Get the frontend API key from Supabase secrets via edge function
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: { action: 'get_frontend_key' }
      });
      
      if (!error && data?.key) {
        this.apiKey = data.key;
        // Store globally for Google Maps API loading
        (window as any).GOOGLE_MAPS_FRONTEND_KEY = this.apiKey;
        return this.apiKey;
      }
    } catch (error) {
      console.warn('Could not load frontend API key:', error);
    }
    
    return null;
  }

  // Initialize Google Maps API
  public async initialize(): Promise<boolean> {
    if (this.isLoaded) return true;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise(async (resolve) => {
      try {
        // Load API key first
        await this.loadApiKey();

        // Check if Google Maps is already loaded
        if (window.google?.maps) {
          this.isLoaded = true;
          resolve(true);
          return;
        }

        // Wait for Google Maps to load (script tag in HTML)
        const checkLoaded = () => {
          if (window.google?.maps) {
            this.isLoaded = true;
            resolve(true);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };

        checkLoaded();
      } catch (error) {
        console.error('Failed to initialize Google Maps:', error);
        resolve(false);
      }
    });

    return this.loadPromise;
  }

  // Check if Google Maps is ready
  public isReady(): boolean {
    return this.isLoaded && !!window.google?.maps;
  }

  // Create autocomplete with frontend API
  public createAutocomplete(
    input: HTMLInputElement,
    options?: google.maps.places.AutocompleteOptions
  ): google.maps.places.Autocomplete | null {
    if (!this.isReady()) return null;

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

  // Fallback to backend geocoding if frontend fails
  public async geocodeAddress(address: string): Promise<{
    lat: number;
    lng: number;
    addressComponents?: any;
  } | null> {
    try {
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: {
          action: 'geocode',
          address: address
        }
      });

      if (error || !data?.results?.[0]) {
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
