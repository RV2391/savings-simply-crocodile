import type { AddressComponents } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export interface OSMSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

export interface OSMPlaceDetails {
  lat: number;
  lng: number;
  formatted_address: string;
  address_components: any[];
}

export class OpenStreetMapService {
  private static instance: OpenStreetMapService;
  private cache = new Map<string, any>();
  private readonly CACHE_DURATION = 300000; // 5 minutes

  private constructor() {}

  public static getInstance(): OpenStreetMapService {
    if (!OpenStreetMapService.instance) {
      OpenStreetMapService.instance = new OpenStreetMapService();
    }
    return OpenStreetMapService.instance;
  }

  private getCacheKey(type: string, params: string): string {
    return `${type}:${params}`;
  }

  private getCachedResult(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedResult(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Nominatim address search for autocomplete via backend
  public async getAddressSuggestions(input: string): Promise<OSMSuggestion[]> {
    if (!input || input.length < 3) return [];

    const cacheKey = this.getCacheKey('autocomplete', input);
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    console.log('🌍 OSM: Searching for address suggestions via backend:', input);

    try {
      const { data, error } = await supabase.functions.invoke('maps-api', {
        body: { 
          action: 'address-suggestions',
          params: { input }
        }
      });

      if (error) {
        throw new Error(`Backend error: ${error.message}`);
      }
      
      const suggestions: OSMSuggestion[] = data.map((item: any, index: number) => ({
        place_id: item.place_id || `osm_${index}`,
        description: item.display_name,
        main_text: item.name || this.extractMainAddress(item.display_name),
        secondary_text: this.extractSecondaryAddress(item.display_name)
      }));

      this.setCachedResult(cacheKey, suggestions);
      console.log(`✅ OSM: Found ${suggestions.length} suggestions via backend`);
      
      return suggestions;
    } catch (error) {
      console.error('❌ OSM: Address suggestions failed:', error);
      throw new Error('OpenStreetMap Adresssuche nicht verfügbar');
    }
  }

  // Nominatim geocoding for place details via backend
  public async getPlaceDetails(query: string): Promise<OSMPlaceDetails> {
    const cacheKey = this.getCacheKey('details', query);
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    console.log('🌍 OSM: Getting place details via backend for:', query);

    try {
      const { data, error } = await supabase.functions.invoke('maps-api', {
        body: { 
          action: 'place-details',
          params: { query }
        }
      });

      if (error) {
        throw new Error(`Backend error: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('Keine Ergebnisse gefunden');
      }

      const placeDetails: OSMPlaceDetails = {
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon),
        formatted_address: data.display_name,
        address_components: this.parseAddressComponents(data.address)
      };

      this.setCachedResult(cacheKey, placeDetails);
      console.log('✅ OSM: Place details retrieved via backend');
      
      return placeDetails;
    } catch (error) {
      console.error('❌ OSM: Place details failed:', error);
      throw new Error('OpenStreetMap Ortsdetails nicht verfügbar');
    }
  }

  // Geocode address
  public async geocodeAddress(address: string): Promise<{ lat: number; lng: number; addressComponents?: any } | null> {
    try {
      const details = await this.getPlaceDetails(address);
      return {
        lat: details.lat,
        lng: details.lng,
        addressComponents: details.address_components
      };
    } catch (error) {
      console.error('❌ OSM: Geocoding failed:', error);
      return null;
    }
  }

  private extractMainAddress(displayName: string): string {
    const parts = displayName.split(',');
    return parts[0]?.trim() || displayName;
  }

  private extractSecondaryAddress(displayName: string): string {
    const parts = displayName.split(',');
    return parts.slice(1).join(', ').trim();
  }

  private parseAddressComponents(address: any): any[] {
    if (!address) return [];

    const components = [];
    
    if (address.house_number) {
      components.push({ long_name: address.house_number, types: ['street_number'] });
    }
    
    if (address.road) {
      components.push({ long_name: address.road, types: ['route'] });
    }
    
    if (address.city || address.town || address.village) {
      const city = address.city || address.town || address.village;
      components.push({ long_name: city, types: ['locality'] });
    }
    
    if (address.postcode) {
      components.push({ long_name: address.postcode, types: ['postal_code'] });
    }
    
    if (address.state) {
      components.push({ long_name: address.state, types: ['administrative_area_level_1'] });
    }
    
    if (address.country) {
      components.push({ long_name: address.country, types: ['country'] });
    }

    return components;
  }
}

export const openStreetMapService = OpenStreetMapService.getInstance();