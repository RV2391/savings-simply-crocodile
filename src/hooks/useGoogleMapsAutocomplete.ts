
import { RefObject, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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
    
    if (!inputRef.current) {
      console.log('No input reference found');
      return;
    }

    // Use our new service for initialization
    const isReady = await googleMapsService.initialize();
    if (!isReady) {
      console.log('Google Maps service not ready');
      toast({
        title: "Info",
        description: "Adresse-Autocomplete wird über Backup-Service bereitgestellt.",
        variant: "default",
      });
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

        console.log('Frontend autocomplete initialized successfully');
      }
    } catch (error) {
      console.error('Error creating autocomplete:', error);
      toast({
        title: "Info",
        description: "Autocomplete verwendet Backup-Service. Funktionalität bleibt erhalten.",
        variant: "default",
      });
    }
  }, [inputRef, onPlaceSelect, cleanup, toast]);

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
