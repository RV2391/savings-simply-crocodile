import { supabase } from "@/integrations/supabase/client";

export interface BackendAddressSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    postcode?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface BackendPlaceDetails {
  place_id: string;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    postcode?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export class BackendMapService {
  private static instance: BackendMapService;
  private cache = new Map<string, any>();

  private constructor() {}

  public static getInstance(): BackendMapService {
    if (!BackendMapService.instance) {
      BackendMapService.instance = new BackendMapService();
    }
    return BackendMapService.instance;
  }

  private getCachedResult(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes cache
      console.log('💾 Using cached result for:', key);
      return cached.data;
    }
    return null;
  }

  private setCachedResult(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  public async getAddressSuggestions(input: string): Promise<BackendAddressSuggestion[]> {
    const cacheKey = `suggestions_${input}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    console.log('🌍 Backend: Getting address suggestions for:', input);

    try {
      const { data, error } = await supabase.functions.invoke('maps-api', {
        body: {
          action: 'address-suggestions',
          params: { input }
        }
      });

      if (error) {
        console.error('❌ Backend maps API error:', error);
        throw new Error(`Backend API error: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.error('❌ Invalid response from backend API:', data);
        throw new Error('Invalid response from backend API');
      }

      const suggestions: BackendAddressSuggestion[] = data.map((item: any) => ({
        place_id: item.place_id || item.osm_id?.toString() || `osm_${Math.random()}`,
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        address: item.address
      }));

      this.setCachedResult(cacheKey, suggestions);
      console.log(`✅ Backend: Found ${suggestions.length} address suggestions`);
      
      return suggestions;
    } catch (error) {
      console.error('❌ Backend map service error:', error);
      throw error instanceof Error ? error : new Error('Address service unavailable');
    }
  }

  public async getPlaceDetails(query: string): Promise<BackendPlaceDetails> {
    const cacheKey = `details_${query}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    console.log('📍 Backend: Getting place details for:', query);

    try {
      const { data, error } = await supabase.functions.invoke('maps-api', {
        body: {
          action: 'place-details',
          params: { query }
        }
      });

      if (error) {
        console.error('❌ Backend place details error:', error);
        throw new Error(`Backend API error: ${error.message}`);
      }

      if (!data) {
        throw new Error('Place not found');
      }

      const placeDetails: BackendPlaceDetails = {
        place_id: data.place_id || data.osm_id?.toString() || `osm_${Math.random()}`,
        lat: data.lat,
        lon: data.lon,
        display_name: data.display_name,
        address: data.address
      };

      this.setCachedResult(cacheKey, placeDetails);
      console.log('✅ Backend: Got place details for:', query);
      
      return placeDetails;
    } catch (error) {
      console.error('❌ Backend place details error:', error);
      throw error instanceof Error ? error : new Error('Place details unavailable');
    }
  }

  public async geocodeAddress(address: string): Promise<{ lat: number; lng: number; addressComponents?: any } | null> {
    try {
      console.log('🗺️ Backend: Geocoding address:', address);
      
      // Use place-details for geocoding
      const placeDetails = await this.getPlaceDetails(address);
      
      const result = {
        lat: parseFloat(placeDetails.lat),
        lng: parseFloat(placeDetails.lon),
        addressComponents: placeDetails.address
      };

      console.log('✅ Backend: Geocoding successful for:', address, result);
      return result;
    } catch (error) {
      console.error('❌ Backend geocoding failed:', error);
      return null;
    }
  }
}

export const backendMapService = BackendMapService.getInstance();