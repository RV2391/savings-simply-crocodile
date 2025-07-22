
// Enhanced Google Maps Service with better debugging and fallback mechanisms
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

  // Enhanced API key loading with better debugging
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
          console.error('❌ Supabase function error details:', error);
          throw new Error(`Supabase function error: ${error.message || JSON.stringify(error)}`);
        }

        if (data?.key) {
          this.apiKey = data.key;
          console.log('✅ Frontend API key loaded successfully on attempt', attempt);
          console.log('🔑 API key starts with:', this.apiKey.substring(0, 10) + '...');
          return this.apiKey;
        } else {
          console.error('❌ No API key in response data:', data);
          throw new Error('No API key in response data');
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`⚠️ API key load attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < MAX_RETRIES) {
          const delayMs = attempt * 1000;
          console.log(`⏳ Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    console.error('❌ Failed to load API key after', MAX_RETRIES, 'attempts. Last error:', lastError?.message);
    return null;
  }

  // Enhanced backend geocoding with detailed error reporting
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

        console.log('📡 Supabase function response:', { data, error });

        if (error) {
          console.error('❌ Supabase function error details:', error);
          throw new Error(`Supabase function error: ${error.message || JSON.stringify(error)}`);
        }

        // Check for Google Maps API errors
        if (data?.status && data.status !== 'OK') {
          console.error('❌ Google Maps API error:', data.status, data.error_message);
          
          if (data.status === 'REQUEST_DENIED') {
            throw new Error(`REQUEST_DENIED: ${data.error_message || 'API key not authorized for this request'}`);
          } else if (data.status === 'OVER_QUERY_LIMIT') {
            throw new Error('OVER_QUERY_LIMIT: API quota exceeded');
          } else if (data.status === 'ZERO_RESULTS') {
            throw new Error(`No geocoding results found for: ${address}`);
          } else {
            throw new Error(`Google Maps API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
          }
        }

        if (data?.results?.length > 0) {
          const result = data.results[0];
          console.log('✅ Geocoding successful on attempt', attempt, ':', result.formatted_address);
          console.log('📍 Coordinates:', result.geometry.location);
          
          return {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
            addressComponents: result.address_components
          };
        } else {
          console.warn('⚠️ No results in response:', data);
          throw new Error(`No geocoding results found for: ${address}`);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`⚠️ Geocoding attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < MAX_RETRIES) {
          const delayMs = 1000;
          console.log(`⏳ Retrying geocoding in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    console.error('❌ Geocoding failed after', MAX_RETRIES, 'attempts. Last error:', lastError?.message);
    throw lastError || new Error('Geocoding failed after multiple attempts');
  }

  // Create the new PlaceAutocompleteElement with error handling
  public createPlaceAutocompleteElement(options?: any): any | null {
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

  // Test API key functionality
  public async testApiKey(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🧪 Testing API key functionality...');
      const result = await this.geocodeAddress('Berlin, Deutschland');
      if (result) {
        console.log('✅ API key test successful');
        return { success: true };
      } else {
        return { success: false, error: 'No geocoding result' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ API key test failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}

export const googleMapsService = GoogleMapsService.getInstance();
