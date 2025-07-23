import { backendMapsService } from '@/utils/backendMapsService';
import { openStreetMapService } from './openStreetMapService';

export type MapProvider = 'google' | 'osm';

export interface AddressServiceResponse {
  suggestions?: any[];
  placeDetails?: any;
  error?: string;
  provider: MapProvider;
}

export class MapProviderManager {
  private static instance: MapProviderManager;
  private currentProvider: MapProvider = 'google';
  private providerStatus = new Map<MapProvider, 'available' | 'unavailable' | 'unknown'>();

  private constructor() {
    // Initialize provider status
    this.providerStatus.set('google', 'unknown');
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
    
    // Auto-switch to next available provider
    if (provider === this.currentProvider) {
      this.switchToNextAvailableProvider();
    }
  }

  public markProviderAsAvailable(provider: MapProvider): void {
    console.log(`✅ Marking provider ${provider} as available`);
    this.providerStatus.set(provider, 'available');
  }

  private switchToNextAvailableProvider(): void {
    const providers: MapProvider[] = ['google', 'osm'];
    
    for (const provider of providers) {
      if (provider !== this.currentProvider && this.getProviderStatus(provider) !== 'unavailable') {
        console.log(`🔄 Auto-switching to provider: ${provider}`);
        this.setProvider(provider);
        return;
      }
    }
    
    console.warn('⚠️ No available providers found, staying with current');
  }

  // Address suggestions with fallback
  public async getAddressSuggestions(input: string): Promise<any[]> {
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const provider = this.currentProvider;
        console.log(`🔍 Getting address suggestions with provider: ${provider} (attempt ${attempt + 1})`);

        let result: any[];

        switch (provider) {
          case 'google':
            result = await backendMapsService.getAddressSuggestions(input);
            break;
          case 'osm':
            result = await openStreetMapService.getAddressSuggestions(input);
            break;
          default:
            throw new Error(`Unknown provider: ${provider}`);
        }

        this.markProviderAsAvailable(provider);
        return result;

      } catch (error) {
        console.error(`❌ Provider ${this.currentProvider} failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Mark current provider as unavailable and switch
        this.markProviderAsUnavailable(this.currentProvider);
        
        // If we still have attempts left, continue with the new provider
        if (attempt < maxRetries - 1) {
          console.log(`🔄 Retrying with new provider: ${this.currentProvider}`);
          continue;
        }
      }
    }

    // All providers failed
    console.error('❌ All address suggestion providers failed');
    throw lastError || new Error('Alle Adressdienste sind nicht verfügbar');
  }

  // Place details with fallback
  public async getPlaceDetails(placeId: string): Promise<any> {
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const provider = this.currentProvider;
        console.log(`📍 Getting place details with provider: ${provider} (attempt ${attempt + 1})`);

        let result: any;

        switch (provider) {
          case 'google':
            result = await backendMapsService.getPlaceDetails(placeId);
            break;
          case 'osm':
            // For OSM, we treat placeId as the query string
            result = await openStreetMapService.getPlaceDetails(placeId);
            break;
          default:
            throw new Error(`Unknown provider: ${provider}`);
        }

        this.markProviderAsAvailable(provider);
        return result;

      } catch (error) {
        console.error(`❌ Provider ${this.currentProvider} failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        this.markProviderAsUnavailable(this.currentProvider);
        
        if (attempt < maxRetries - 1) {
          console.log(`🔄 Retrying with new provider: ${this.currentProvider}`);
          continue;
        }
      }
    }

    throw lastError || new Error('Alle Ortsdienste sind nicht verfügbar');
  }

  // Geocoding with fallback
  public async geocodeAddress(address: string): Promise<{ lat: number; lng: number; addressComponents?: any } | null> {
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const provider = this.currentProvider;
        console.log(`🗺️ Geocoding with provider: ${provider} (attempt ${attempt + 1})`);

        let result: any;

        switch (provider) {
          case 'google':
            result = await backendMapsService.geocodeAddress(address);
            break;
          case 'osm':
            result = await openStreetMapService.geocodeAddress(address);
            break;
          default:
            throw new Error(`Unknown provider: ${provider}`);
        }

        if (result) {
          this.markProviderAsAvailable(provider);
        }
        return result;

      } catch (error) {
        console.error(`❌ Provider ${this.currentProvider} failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        this.markProviderAsUnavailable(this.currentProvider);
        
        if (attempt < maxRetries - 1) {
          console.log(`🔄 Retrying with new provider: ${this.currentProvider}`);
          continue;
        }
      }
    }

    console.warn('⚠️ All geocoding providers failed, returning null');
    return null;
  }

  // Get provider display name
  public getProviderDisplayName(provider: MapProvider): string {
    switch (provider) {
      case 'google':
        return 'Google Maps';
      case 'osm':
        return 'OpenStreetMap';
      default:
        return provider;
    }
  }

  // Get all providers with status
  public getAllProvidersStatus(): Array<{ provider: MapProvider; status: string; name: string; current: boolean }> {
    const providers: MapProvider[] = ['google', 'osm'];
    
    return providers.map(provider => ({
      provider,
      status: this.getProviderStatus(provider),
      name: this.getProviderDisplayName(provider),
      current: provider === this.currentProvider
    }));
  }
}

export const mapProviderManager = MapProviderManager.getInstance();