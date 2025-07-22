
import { RefObject, useRef, useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLoadScript } from "@react-google-maps/api";
import { googleMapsService } from "@/utils/googleMapsService";

interface AutocompleteHookProps {
  inputRef: RefObject<HTMLInputElement>;
  onPlaceSelect: (
    place: google.maps.places.PlaceResult | null,
    status: google.maps.places.PlacesServiceStatus
  ) => void;
}

export const useGoogleMapsAutocomplete = ({
  inputRef,
  onPlaceSelect,
}: AutocompleteHookProps) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string>("");
  const [shouldLoadScript, setShouldLoadScript] = useState(false);
  
  useEffect(() => {
    const loadKey = async () => {
      console.log('🔑 useGoogleMapsAutocomplete: Loading API key...');
      const key = await googleMapsService.loadApiKey();
      if (key) {
        console.log('✅ useGoogleMapsAutocomplete: API key loaded');
        setApiKey(key);
        setShouldLoadScript(true);
      } else {
        console.log('ℹ️ useGoogleMapsAutocomplete: No API key available');
        setShouldLoadScript(false);
      }
    };
    loadKey();
  }, []);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  }, shouldLoadScript && !!apiKey);

  const cleanup = useCallback(() => {
    console.log('Cleaning up autocomplete...');
    if (listenerRef.current && window.google?.maps?.event) {
      try {
        window.google.maps.event.removeListener(listenerRef.current);
        listenerRef.current = null;
        console.log('Autocomplete listener removed');
      } catch (error) {
        console.error('Error removing autocomplete listener:', error);
      }
    }
    
    if (autocompleteRef.current) {
      try {
        autocompleteRef.current.unbindAll();
        autocompleteRef.current = null;
        console.log('Autocomplete unbound');
      } catch (error) {
        console.error('Error unbinding autocomplete:', error);
      }
    }
  }, []);

  const initializeAutocomplete = useCallback(async () => {
    console.log('Attempting to initialize Google Maps autocomplete...');
    
    if (!inputRef.current || !isLoaded || !apiKey || !shouldLoadScript) {
      console.log('Prerequisites not met for autocomplete initialization');
      return;
    }

    try {
      // Clean up any existing autocomplete
      cleanup();

      // Create autocomplete using our service
      autocompleteRef.current = googleMapsService.createAutocomplete(inputRef.current);
      
      if (autocompleteRef.current) {
        console.log('Autocomplete created successfully');

        // Add place changed listener
        listenerRef.current = autocompleteRef.current.addListener("place_changed", () => {
          console.log('Place changed event triggered');
          
          try {
            const place = autocompleteRef.current?.getPlace();
            console.log('Selected place:', place);
            
            if (!place || !place.geometry) {
              console.warn('Place has no geometry');
              onPlaceSelect(null, google.maps.places.PlacesServiceStatus.ZERO_RESULTS);
              return;
            }
            
            const status = google.maps.places.PlacesServiceStatus.OK;
            onPlaceSelect(place, status);
          } catch (error) {
            console.error('Error in place_changed handler:', error);
            onPlaceSelect(null, google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR);
          }
        });

        console.log('Autocomplete initialized successfully');
      } else {
        console.log('Failed to create autocomplete, using fallback');
        toast({
          title: "Info",
          description: "Autocomplete verwendet Backup-Service. Funktionalität bleibt erhalten.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error creating autocomplete:', error);
      toast({
        title: "Info",
        description: "Autocomplete verwendet Backup-Service. Funktionalität bleibt erhalten.",
        variant: "default",
      });
    }
  }, [inputRef, onPlaceSelect, cleanup, toast, isLoaded, apiKey, shouldLoadScript]);

  // Effect for cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up autocomplete...');
      cleanup();
    };
  }, [cleanup]);

  return { 
    initializeAutocomplete,
    cleanup: cleanup
  };
};

// Declare global types for the loader
declare global {
  interface Window {
    googleMapsLoader?: {
      load: (callback?: (error?: Error) => void) => void;
      isReady: () => boolean;
    };
    initGoogleMaps?: () => void;
    GOOGLE_MAPS_FRONTEND_KEY?: string;
  }
}
