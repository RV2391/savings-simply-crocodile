import { openStreetMapService } from './openStreetMapService';

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

  // Address suggestions using OpenStreetMap
  public async getAddressSuggestions(input: string): Promise<any[]> {
    try {
      console.log(`🔍 Getting address suggestions with OpenStreetMap`);
      const result = await openStreetMapService.getAddressSuggestions(input);
      this.markProviderAsAvailable('osm');
      return result;
    } catch (error) {
      console.error(`❌ OpenStreetMap provider failed:`, error);
      this.markProviderAsUnavailable('osm');
      throw error instanceof Error ? error : new Error('Adressdienst ist nicht verfügbar');
    }
  }

  // Place details using OpenStreetMap
  public async getPlaceDetails(placeId: string): Promise<any> {
    try {
      console.log(`📍 Getting place details with OpenStreetMap`);
      const result = await openStreetMapService.getPlaceDetails(placeId);
      this.markProviderAsAvailable('osm');
      return result;
    } catch (error) {
      console.error(`❌ OpenStreetMap provider failed:`, error);
      this.markProviderAsUnavailable('osm');
      throw error instanceof Error ? error : new Error('Ortsdienst ist nicht verfügbar');
    }
  }

  // Geocoding using OpenStreetMap
  public async geocodeAddress(address: string): Promise<{ lat: number; lng: number; addressComponents?: any } | null> {
    try {
      console.log(`🗺️ Geocoding with OpenStreetMap`);
      const result = await openStreetMapService.geocodeAddress(address);
      if (result) {
        this.markProviderAsAvailable('osm');
      }
      return result;
    } catch (error) {
      console.error(`❌ OpenStreetMap provider failed:`, error);
      this.markProviderAsUnavailable('osm');
      console.warn('⚠️ Geocoding failed, returning null');
      return null;
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