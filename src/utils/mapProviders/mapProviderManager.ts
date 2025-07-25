import { openStreetMapService } from './openStreetMapService';
import { backendMapService } from './backendMapService';

export type MapProvider = 'osm';

export interface AddressServiceResponse {
  suggestions?: any[];
  placeDetails?: any;
  error?: string;
  provider: MapProvider;
}

export class MapProviderManager {
  private static instance: MapProviderManager;
  private currentProvider: MapProvider = 'osm';
  private providerStatus = new Map<MapProvider, 'available' | 'unavailable' | 'unknown'>();

  private constructor() {
    // Initialize provider status - only OSM now
    this.providerStatus.set('osm', 'available');
  }

  public static getInstance(): MapProviderManager {
    if (!MapProviderManager.instance) {
      MapProviderManager.instance = new MapProviderManager();
    }
    return MapProviderManager.instance;
  }

  public getCurrentProvider(): MapProvider {
    return this.currentProvider;
  }

  public setProvider(provider: MapProvider): void {
    console.log(`🔄 Switching map provider to: ${provider}`);
    this.currentProvider = provider;
  }

  public getProviderStatus(provider: MapProvider): 'available' | 'unavailable' | 'unknown' {
    return this.providerStatus.get(provider) || 'unknown';
  }

  public markProviderAsUnavailable(provider: MapProvider): void {
    console.log(`❌ Marking provider ${provider} as unavailable`);
    this.providerStatus.set(provider, 'unavailable');
  }

  public markProviderAsAvailable(provider: MapProvider): void {
    console.log(`✅ Marking provider ${provider} as available`);
    this.providerStatus.set(provider, 'available');
  }

  // Helper methods for address formatting
  private extractMainText(displayName: string): string {
    const parts = displayName.split(',');
    return parts[0]?.trim() || displayName;
  }

  private extractSecondaryText(displayName: string): string {
    const parts = displayName.split(',');
    return parts.slice(1).join(',').trim() || '';
  }

  // Address suggestions using backend API (with fallback to offline)
  public async getAddressSuggestions(input: string): Promise<any[]> {
    try {
      console.log(`🔍 Getting address suggestions via backend API`);
      const result = await backendMapService.getAddressSuggestions(input);
      this.markProviderAsAvailable('osm');
      return result.map(item => ({
        place_id: item.place_id,
        description: item.display_name,
        main_text: this.extractMainText(item.display_name),
        secondary_text: this.extractSecondaryText(item.display_name)
      }));
    } catch (error) {
      console.error(`❌ Backend API failed, trying offline fallback:`, error);
      try {
        console.log(`🔄 Falling back to offline address search`);
        const fallbackResult = await openStreetMapService.getAddressSuggestions(input);
        console.log(`✅ Offline fallback successful`);
        return fallbackResult;
      } catch (fallbackError) {
        console.error(`❌ Both backend and offline failed:`, fallbackError);
        this.markProviderAsUnavailable('osm');
        throw new Error('Adressdienst ist nicht verfügbar');
      }
    }
  }

  // Place details using backend API (with fallback to offline)
  public async getPlaceDetails(placeId: string): Promise<any> {
    try {
      console.log(`📍 Getting place details via backend API`);
      const result = await backendMapService.getPlaceDetails(placeId);
      this.markProviderAsAvailable('osm');
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        addressComponents: result.address
      };
    } catch (error) {
      console.error(`❌ Backend API failed, trying offline fallback:`, error);
      try {
        console.log(`🔄 Falling back to offline place details`);
        const fallbackResult = await openStreetMapService.getPlaceDetails(placeId);
        console.log(`✅ Offline fallback successful`);
        return fallbackResult;
      } catch (fallbackError) {
        console.error(`❌ Both backend and offline failed:`, fallbackError);
        this.markProviderAsUnavailable('osm');
        throw new Error('Ortsdienst ist nicht verfügbar');
      }
    }
  }

  // Geocoding using backend API (with fallback to offline)
  public async geocodeAddress(address: string): Promise<{ lat: number; lng: number; addressComponents?: any } | null> {
    try {
      console.log(`🗺️ Geocoding via backend API`);
      const result = await backendMapService.geocodeAddress(address);
      if (result) {
        this.markProviderAsAvailable('osm');
      }
      return result;
    } catch (error) {
      console.error(`❌ Backend API failed, trying offline fallback:`, error);
      try {
        console.log(`🔄 Falling back to offline geocoding`);
        const fallbackResult = await openStreetMapService.geocodeAddress(address);
        if (fallbackResult) {
          console.log(`✅ Offline fallback successful`);
        }
        return fallbackResult;
      } catch (fallbackError) {
        console.error(`❌ Both backend and offline failed:`, fallbackError);
        this.markProviderAsUnavailable('osm');
        console.warn('⚠️ Geocoding failed, returning null');
        return null;
      }
    }
  }

  // Get provider display name
  public getProviderDisplayName(provider: MapProvider): string {
    switch (provider) {
      case 'osm':
        return 'OpenStreetMap';
      default:
        return provider;
    }
  }

  // Get all providers with status
  public getAllProvidersStatus(): Array<{ provider: MapProvider; status: string; name: string; current: boolean }> {
    const providers: MapProvider[] = ['osm'];
    
    return providers.map(provider => ({
      provider,
      status: this.getProviderStatus(provider),
      name: this.getProviderDisplayName(provider),
      current: provider === this.currentProvider
    }));
  }
}

export const mapProviderManager = MapProviderManager.getInstance();