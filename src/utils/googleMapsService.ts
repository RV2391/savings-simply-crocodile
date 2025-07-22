
// Enhanced Google Maps Service with new PlaceAutocompleteElement support
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

  // Load the frontend API key with robust retry mechanism
  public async loadApiKey(): Promise<string | null> {
    if (this.apiKey) return this.apiKey;
    if (this.keyLoadAttempted) return null;
    
    this.keyLoadAttempted = true;
    console.log('🔑 GoogleMapsService: Loading API key...');
    
    const MAX_RETRIES = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🔄 GoogleMapsService: API key load attempt ${attempt}/${MAX_RETRIES}`);
        
        const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
          body: { action: 'get_frontend_key' }
        });

        if (error) {
          throw new Error(`Supabase function error: ${error.message || JSON.stringify(error)}`);
        }

        if (data?.key) {
          this.apiKey = data.key;
          console.log('✅ Frontend API key loaded successfully on attempt', attempt);
          return this.apiKey;
        } else {
          throw new Error('No API key in response data');
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`⚠️ API key load attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < MAX_RETRIES) {
          const delayMs = attempt * 1000; // Exponential backoff: 1s, 2s, 3s
          console.log(`⏳ Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    console.error('❌ Failed to load API key after', MAX_RETRIES, 'attempts. Last error:', lastError?.message);
    return null;
  }

  // Create the new PlaceAutocompleteElement
  public createPlaceAutocompleteElement(
    options?: any
  ): any | null {
    if (!window.google?.maps?.places?.PlaceAutocompleteElement) {
      console.warn('🚨 PlaceAutocompleteElement not available');
      console.warn('Available APIs:', Object.keys(window.google?.maps?.places || {}));
      return null;
    }

    try {
      const defaultOptions = {
        componentRestrictions: { country: "de" },
        requestedRegionCode: "de",
        types: ["address"],
        ...options
      };

      console.log('✅ Creating PlaceAutocompleteElement with options:', defaultOptions);
      const element = new window.google.maps.places.PlaceAutocompleteElement(defaultOptions);
      console.log('✅ PlaceAutocompleteElement created successfully');
      return element;
    } catch (error) {
      console.error('❌ Error creating PlaceAutocompleteElement:', error);
      console.error('❌ Available Google Maps APIs:', window.google?.maps ? Object.keys(window.google.maps) : 'none');
      return null;
    }
  }

  // Legacy autocomplete creation (fallback)
  public createAutocomplete(
    input: HTMLInputElement,
    options?: google.maps.places.AutocompleteOptions
  ): google.maps.places.Autocomplete | null {
    if (!window.google?.maps?.places?.Autocomplete) {
      console.warn('🚨 Legacy Autocomplete API not available');
      return null;
    }

    try {
      const defaultOptions: google.maps.places.AutocompleteOptions = {
        componentRestrictions: { country: "de" },
        fields: ["address_components", "geometry", "formatted_address", "place_id"],
        types: ["address"],
        ...options
      };

      console.log('⚠️ Using legacy Autocomplete API with options:', defaultOptions);
      const autocomplete = new google.maps.places.Autocomplete(input, defaultOptions);
      console.log('✅ Legacy Autocomplete created successfully');
      return autocomplete;
    } catch (error) {
      console.error('❌ Error creating legacy autocomplete:', error);
      return null;
    }
  }

  // Enhanced backend geocoding with retry mechanism and better error handling
  public async geocodeAddress(address: string): Promise<{
    lat: number;
    lng: number;
    addressComponents?: any;
  } | null> {
    console.log('🗺️ GoogleMapsService: Geocoding address:', address);
    
    const MAX_RETRIES = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🔄 GoogleMapsService: Geocoding attempt ${attempt}/${MAX_RETRIES} for: ${address}`);
        
        const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
          body: { 
            action: 'geocode', 
            address: address
          }
        });

        if (error) {
          throw new Error(`Supabase function error: ${error.message || JSON.stringify(error)}`);
        }

        if (data?.results?.length > 0) {
          const result = data.results[0];
          console.log('✅ Geocoding successful on attempt', attempt, ':', result.formatted_address);
          
          return {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
            addressComponents: result.address_components
          };
        } else {
          throw new Error(`No geocoding results found for: ${address}`);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`⚠️ Geocoding attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < MAX_RETRIES) {
          const delayMs = 1000; // 1 second delay between retries
          console.log(`⏳ Retrying geocoding in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    console.error('❌ Geocoding failed after', MAX_RETRIES, 'attempts. Last error:', lastError?.message);
    throw lastError || new Error('Geocoding failed after multiple attempts');
  }

  // Check if new Places API is ready
  public isNewPlacesApiReady(): boolean {
    const isReady = !!(window.google?.maps?.places?.PlaceAutocompleteElement);
    if (!isReady) {
      console.warn('🚨 New Places API not ready. Available:', {
        google: !!window.google,
        maps: !!window.google?.maps,
        places: !!window.google?.maps?.places,
        PlaceAutocompleteElement: !!window.google?.maps?.places?.PlaceAutocompleteElement,
        legacyAutocomplete: !!window.google?.maps?.places?.Autocomplete
      });
    }
    return isReady;
  }

  // Check if Google Maps API is ready (legacy check)
  public isGoogleMapsReady(): boolean {
    return this.isNewPlacesApiReady() || !!(window.google?.maps?.places?.Autocomplete);
  }
}

export const googleMapsService = GoogleMapsService.getInstance();
