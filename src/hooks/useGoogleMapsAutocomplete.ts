
import { RefObject, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { calculateNearestInstitute } from "@/utils/dentalInstitutes";
import { AddressComponents } from "@/types";

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

  const initializeAutocomplete = useCallback(() => {
    console.log('Attempting to initialize Google Maps autocomplete...');
    
    if (!inputRef.current) {
      console.log('No input reference found');
      return;
    }

    // Simple check for Google Maps availability
    const checkGoogle = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places || !window.google.maps.places.Autocomplete) {
        setTimeout(checkGoogle, 100);
        return;
      }

      try {
        // Clean up any existing autocomplete
        cleanup();

        const options: google.maps.places.AutocompleteOptions = {
          componentRestrictions: { country: "de" },
          fields: ["address_components", "geometry", "formatted_address", "place_id"],
          types: ["address"],
        };

        console.log('Creating autocomplete with options:', options);

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          options
        );
        
        console.log('Autocomplete created successfully:', !!autocompleteRef.current);

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
      } catch (error) {
        console.error('Error creating autocomplete:', error);
        toast({
          title: "Fehler",
          description: "Adresse-Autocomplete nicht verfügbar. Sie können die Adresse manuell eingeben und auf 'Suchen' klicken.",
          variant: "default",
        });
      }
    };

    checkGoogle();
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
  }
}
