import type { AddressComponents } from '@/types';
import { searchAddresses, staticAddressToGeocodingResult, type StaticAddress } from '@/data/staticAddresses';

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

  // Offline address search using static database
  public async getAddressSuggestions(input: string): Promise<OSMSuggestion[]> {
    if (!input || input.length < 2) return [];

    const cacheKey = this.getCacheKey('autocomplete', input);
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    console.log('🌍 OSM: Searching offline addresses for:', input);
    console.log('📊 Total addresses in database:', searchAddresses('', 1000).length);

    try {
      const results = searchAddresses(input, 5);
      console.log('🔍 Raw search results:', results);
      
      const suggestions: OSMSuggestion[] = results.map((address: StaticAddress, index: number) => ({
        place_id: `static_${index}_${address.city}_${address.postcode}`,
        description: `${address.city}, ${address.postcode} ${address.state ? address.state + ', ' : ''}${address.country}`,
        main_text: address.city,
        secondary_text: `${address.postcode} ${address.state ? address.state + ', ' : ''}${address.country}`
      }));

      this.setCachedResult(cacheKey, suggestions);
      console.log(`✅ OSM: Found ${suggestions.length} offline suggestions:`, suggestions);
      
      return suggestions;
    } catch (error) {
      console.error('❌ OSM: Offline address search failed:', error);
      return [];
    }
  }

  // Offline place details using static database
  public async getPlaceDetails(query: string): Promise<OSMPlaceDetails> {
    const cacheKey = this.getCacheKey('details', query);
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    console.log('🌍 OSM: Getting offline place details for:', query);

    try {
      // Extract location data from static query format
      const results = searchAddresses(query, 1);
      
      if (results.length === 0) {
        // Provide helpful suggestions for common cities
        const suggestions = searchAddresses('', 10).slice(0, 5).map(a => a.city).join(', ');
        throw new Error(`Keine Ergebnisse für diese Adresse. Verfügbare Städte: ${suggestions}`);
      }

      const address = results[0];
      const placeDetails: OSMPlaceDetails = {
        lat: address.coordinates.lat,
        lng: address.coordinates.lng,
        formatted_address: `${address.city}, ${address.postcode} ${address.state ? address.state + ', ' : ''}${address.country}`,
        address_components: [
          { long_name: address.city, types: ['locality'] },
          { long_name: address.postcode, types: ['postal_code'] },
          { long_name: address.state || '', types: ['administrative_area_level_1'] },
          { long_name: address.country, types: ['country'] }
        ]
      };

      this.setCachedResult(cacheKey, placeDetails);
      console.log('✅ OSM: Offline place details retrieved');
      
      return placeDetails;
    } catch (error) {
      console.error('❌ OSM: Offline place details failed:', error);
      throw new Error('Adresse nicht in der Offline-Datenbank gefunden');
    }
  }

  // Offline geocoding using static database
  public async geocodeAddress(address: string): Promise<{ lat: number; lng: number; addressComponents?: any } | null> {
    try {
      console.log('🌍 OSM: Starting geocode for:', address);
      const results = searchAddresses(address, 1);
      console.log('🔍 Geocode search results:', results);
      
      if (results.length === 0) {
        console.log('❌ OSM: No offline results found for:', address);
        // Log available cities for debugging
        const availableCities = searchAddresses('', 20).slice(0, 10).map(a => a.city);
        console.log('🏙️ Sample available cities:', availableCities.join(', '));
        console.log('🔍 Testing Paderborn search:', searchAddresses('Paderborn', 1));
        return null;
      }

      const result = staticAddressToGeocodingResult(results[0]);
      console.log('✅ OSM: Offline geocoding successful for:', address, result);
      
      return result;
    } catch (error) {
      console.error('❌ OSM: Offline geocoding failed:', error);
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