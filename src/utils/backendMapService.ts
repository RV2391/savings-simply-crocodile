/**
 * Backend Map Service for CSP-compatible map functionality
 * Provides fallback mechanisms when frontend CSP restrictions prevent normal map operations
 */

import { supabase } from "@/integrations/supabase/client";
import type { DentalInstitute } from "@/utils/dentalInstitutes";
import { calculateDistanceViaBackend, calculateTravelTimeViaBackend } from "./backendDistanceCalculations";

export interface BackendMapResult {
  practiceLocation: { lat: number; lng: number };
  nearestInstitute?: DentalInstitute;
  distance?: number;
  travelTime?: number;
  addressComponents?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export class BackendMapService {
  private static instance: BackendMapService;
  
  static getInstance(): BackendMapService {
    if (!BackendMapService.instance) {
      BackendMapService.instance = new BackendMapService();
    }
    return BackendMapService.instance;
  }

  /**
   * Geocode address using backend service (CSP-safe)
   */
  async geocodeAddress(address: string): Promise<{ lat: number; lng: number; addressComponents?: any } | null> {
    try {
      console.log('🗺️ Backend geocoding:', address);
      
      // Use Supabase Edge Function for geocoding when available
      const { data, error } = await supabase.functions.invoke('geocode-address', {
        body: { address }
      });

      if (error) {
        console.warn('⚠️ Backend geocoding failed, using fallback:', error);
        return this.fallbackGeocoding(address);
      }

      return data;
    } catch (error) {
      console.warn('⚠️ Backend geocoding error, using fallback:', error);
      return this.fallbackGeocoding(address);
    }
  }

  /**
   * Fallback geocoding for common German cities/regions
   */
  private fallbackGeocoding(address: string): { lat: number; lng: number; addressComponents?: any } | null {
    const normalizedAddress = address.toLowerCase().trim();
    
    // Common German cities/regions for fallback
    const fallbackCoordinates: Record<string, { lat: number; lng: number; city: string }> = {
      'berlin': { lat: 52.5200, lng: 13.4050, city: 'Berlin' },
      'münchen': { lat: 48.1351, lng: 11.5820, city: 'München' },
      'munich': { lat: 48.1351, lng: 11.5820, city: 'München' },
      'hamburg': { lat: 53.5511, lng: 9.9937, city: 'Hamburg' },
      'köln': { lat: 50.9375, lng: 6.9603, city: 'Köln' },
      'cologne': { lat: 50.9375, lng: 6.9603, city: 'Köln' },
      'frankfurt': { lat: 50.1109, lng: 8.6821, city: 'Frankfurt am Main' },
      'stuttgart': { lat: 48.7758, lng: 9.1829, city: 'Stuttgart' },
      'düsseldorf': { lat: 51.2277, lng: 6.7735, city: 'Düsseldorf' },
      'dortmund': { lat: 51.5136, lng: 7.4653, city: 'Dortmund' },
      'essen': { lat: 51.4556, lng: 7.0116, city: 'Essen' },
      'leipzig': { lat: 51.3397, lng: 12.3731, city: 'Leipzig' },
      'bremen': { lat: 53.0793, lng: 8.8017, city: 'Bremen' },
      'dresden': { lat: 51.0504, lng: 13.7373, city: 'Dresden' },
      'hannover': { lat: 52.3759, lng: 9.7320, city: 'Hannover' },
      'nürnberg': { lat: 49.4521, lng: 11.0767, city: 'Nürnberg' },
      'duisburg': { lat: 51.4344, lng: 6.7623, city: 'Duisburg' },
      'bochum': { lat: 51.4819, lng: 7.2160, city: 'Bochum' },
      'wuppertal': { lat: 51.2562, lng: 7.1508, city: 'Wuppertal' },
      'bielefeld': { lat: 52.0302, lng: 8.5325, city: 'Bielefeld' },
    };

    // Try to find a match
    for (const [city, coords] of Object.entries(fallbackCoordinates)) {
      if (normalizedAddress.includes(city)) {
        console.log(`📍 Using fallback coordinates for ${city}`);
        return {
          ...coords,
          addressComponents: {
            city: coords.city,
            country: 'Deutschland'
          }
        };
      }
    }

    // Default to center of Germany if no match found
    console.log('📍 Using default coordinates (center of Germany)');
    return {
      lat: 51.1657, 
      lng: 10.4515,
      addressComponents: {
        country: 'Deutschland'
      }
    };
  }

  /**
   * Find nearest institute using backend calculations
   */
  async findNearestInstitute(
    practiceLocation: { lat: number; lng: number },
    institutes: DentalInstitute[]
  ): Promise<{ institute: DentalInstitute; distance: number; travelTime: number } | null> {
    if (!institutes.length) return null;

    console.log('🏥 Finding nearest institute via backend calculations');
    
    try {
      let nearestInstitute: DentalInstitute | null = null;
      let minDistance = Infinity;
      let minTravelTime = 0;

      for (const institute of institutes) {
        const distance = await calculateDistanceViaBackend(
          practiceLocation.lat,
          practiceLocation.lng,
          institute.coordinates.lat,
          institute.coordinates.lng
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestInstitute = institute;
          minTravelTime = await calculateTravelTimeViaBackend(
            practiceLocation.lat,
            practiceLocation.lng,
            institute.coordinates.lat,
            institute.coordinates.lng
          );
        }
      }

      if (nearestInstitute) {
        console.log(`🎯 Nearest institute: ${nearestInstitute.name} (${minDistance.toFixed(1)}km)`);
        return {
          institute: nearestInstitute,
          distance: minDistance,
          travelTime: minTravelTime
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Backend institute search failed:', error);
      
      // Fallback: use first institute if backend calculations fail
      if (institutes.length > 0) {
        console.log('📍 Using fallback: first available institute');
        return {
          institute: institutes[0],
          distance: 0, // Unknown distance
          travelTime: 0 // Unknown travel time
        };
      }
      
      return null;
    }
  }

  /**
   * Get address suggestions using backend service
   */
  async getAddressSuggestions(input: string): Promise<any[]> {
    try {
      console.log('🔍 Backend address suggestions for:', input);
      
      // Use Supabase Edge Function for address suggestions when available
      const { data, error } = await supabase.functions.invoke('address-suggestions', {
        body: { input }
      });

      if (error) {
        console.warn('⚠️ Backend address suggestions failed:', error);
        return this.fallbackAddressSuggestions(input);
      }

      return data?.suggestions || [];
    } catch (error) {
      console.warn('⚠️ Backend address suggestions error:', error);
      return this.fallbackAddressSuggestions(input);
    }
  }

  /**
   * Fallback address suggestions for common patterns
   */
  private fallbackAddressSuggestions(input: string): any[] {
    const normalizedInput = input.toLowerCase().trim();
    
    if (normalizedInput.length < 2) return [];

    // Simple fallback suggestions based on common German cities
    const commonSuggestions = [
      { display_name: 'Berlin, Deutschland', place_id: 'fallback_berlin' },
      { display_name: 'München, Deutschland', place_id: 'fallback_munich' },
      { display_name: 'Hamburg, Deutschland', place_id: 'fallback_hamburg' },
      { display_name: 'Köln, Deutschland', place_id: 'fallback_cologne' },
      { display_name: 'Frankfurt am Main, Deutschland', place_id: 'fallback_frankfurt' },
      { display_name: 'Stuttgart, Deutschland', place_id: 'fallback_stuttgart' },
      { display_name: 'Düsseldorf, Deutschland', place_id: 'fallback_dusseldorf' },
    ];

    return commonSuggestions.filter(suggestion => 
      suggestion.display_name.toLowerCase().includes(normalizedInput)
    );
  }
}

export const backendMapService = BackendMapService.getInstance();