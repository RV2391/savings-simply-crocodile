
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { googleMapsService } from '@/utils/googleMapsService';

interface GoogleMapsContextType {
  isLoaded: boolean;
  isPlacesReady: boolean;
  loadError: string | null;
  apiKey: string | null;
  retryLoading: () => void;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

let scriptLoadPromise: Promise<void> | null = null;
let isScriptLoaded = false;
let isScriptLoading = false;

const loadGoogleMapsScript = async (apiKey: string): Promise<void> => {
  if (isScriptLoaded) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  isScriptLoading = true;
  
  scriptLoadPromise = new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.google?.maps) {
      isScriptLoaded = true;
      isScriptLoading = false;
      resolve();
      return;
    }

    // Remove any existing script to prevent duplicates
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Global callback function
    (window as any).initGoogleMaps = () => {
      console.log('✅ Google Maps script loaded via callback');
      
      // Wait a bit for libraries to be fully ready
      setTimeout(() => {
        isScriptLoaded = true;
        isScriptLoading = false;
        resolve();
      }, 100);
    };

    script.onerror = () => {
      console.error('❌ Failed to load Google Maps script');
      isScriptLoading = false;
      scriptLoadPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
    
    // Fallback timeout
    setTimeout(() => {
      if (!isScriptLoaded && isScriptLoading) {
        console.error('❌ Google Maps script loading timeout');
        isScriptLoading = false;
        scriptLoadPromise = null;
        reject(new Error('Google Maps script loading timeout'));
      }
    }, 10000);
  });

  return scriptLoadPromise;
};

const waitForPlacesLibrary = async (maxRetries = 20): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    // Check for both old and new Places API
    if (window.google?.maps?.places && (
      window.google.maps.places.PlaceAutocompleteElement || 
      window.google.maps.places.Autocomplete
    )) {
      console.log('✅ Places library ready after', i + 1, 'attempts');
      return true;
    }
    console.log('⏳ Waiting for Places library...', i + 1, '/', maxRetries);
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  
  console.error('❌ Places library not available after', maxRetries, 'attempts');
  return false;
};

export const GoogleMapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlacesReady, setIsPlacesReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const initializeGoogleMaps = useCallback(async () => {
    console.log('🗺️ GoogleMapsProvider: Initializing Google Maps...');
    setLoadError(null);
    
    try {
      // Load API key
      const key = await googleMapsService.loadApiKey();
      if (!key) {
        setLoadError('API key not available');
        return;
      }
      
      setApiKey(key);
      console.log('✅ GoogleMapsProvider: API key loaded');
      
      // Load Google Maps script
      await loadGoogleMapsScript(key);
      setIsLoaded(true);
      console.log('✅ GoogleMapsProvider: Google Maps script loaded');
      
      // Wait for Places library
      const placesReady = await waitForPlacesLibrary();
      setIsPlacesReady(placesReady);
      
      if (placesReady) {
        console.log('✅ GoogleMapsProvider: Fully initialized');
        
        // Log which Places API is available
        if (window.google?.maps?.places?.PlaceAutocompleteElement) {
          console.log('✅ New PlaceAutocompleteElement API available');
        } else if (window.google?.maps?.places?.Autocomplete) {
          console.log('⚠️ Using legacy Autocomplete API');
        }
      } else {
        console.warn('⚠️ GoogleMapsProvider: Maps loaded but Places library not ready');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ GoogleMapsProvider: Initialization failed:', errorMessage);
      setLoadError(errorMessage);
      setIsLoaded(false);
      setIsPlacesReady(false);
    }
  }, []);

  const retryLoading = useCallback(() => {
    console.log('🔄 GoogleMapsProvider: Retrying initialization...');
    setRetryCount(prev => prev + 1);
    
    // Reset global state for retry
    isScriptLoaded = false;
    isScriptLoading = false;
    scriptLoadPromise = null;
    
    initializeGoogleMaps();
  }, [initializeGoogleMaps]);

  useEffect(() => {
    initializeGoogleMaps();
  }, [initializeGoogleMaps]);

  const value: GoogleMapsContextType = {
    isLoaded,
    isPlacesReady,
    loadError,
    apiKey,
    retryLoading,
  };

  return <GoogleMapsContext.Provider value={value}>{children}</GoogleMapsContext.Provider>;
};

export const useGoogleMaps = (): GoogleMapsContextType => {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};
