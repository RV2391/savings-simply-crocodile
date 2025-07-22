
// Google Maps Frontend Service - Manages direct API integration
import { supabase } from "@/integrations/supabase/client";

export class GoogleMapsService {
  private static instance: GoogleMapsService;
  private apiKey: string | null = null;
  private isLoaded = false;
  private loadPromise: Promise<boolean> | null = null;
  private scriptLoaded = false;

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

  // Dynamically load Google Maps script with API key
  private async loadGoogleMapsScript(): Promise<boolean> {
    if (this.scriptLoaded) return true;

    const apiKey = await this.loadApiKey();
    if (!apiKey) {
      console.error('No API key available, cannot load Google Maps');
      return false;
    }

    return new Promise((resolve) => {
      try {
        const script = document.createElement('script');
        script.async = true;
        script.defer = true;
        script.src = `https://maps.googleapis.com/maps/api/js?libraries=places,geometry&v=weekly&key=${apiKey}`;
        
        script.onload = () => {
          console.log('Google Maps script loaded successfully');
          this.scriptLoaded = true;
          resolve(true);
        };

        script.onerror = (error) => {
          console.error('Failed to load Google Maps script:', error);
          this.scriptLoaded = false;
          resolve(false);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Error creating Google Maps script:', error);
        resolve(false);
      }
    });
  }

  // Initialize Google Maps API
  public async initialize(): Promise<boolean> {
    if (this.isLoaded) return true;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise(async (resolve) => {
      try {
        // First load the script with API key
        const scriptLoaded = await this.loadGoogleMapsScript();
        if (!scriptLoaded) {
          console.error('Failed to load Google Maps script');
          resolve(false);
          return;
        }

        // Wait for Google Maps to be available
        const checkLoaded = () => {
          if (window.google?.maps) {
            console.log('Google Maps API is ready');
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
