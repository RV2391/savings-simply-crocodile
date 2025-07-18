import { RefObject, useRef } from "react";
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
  const { toast } = useToast();

  const initializeAutocomplete = () => {
    console.log('Attempting to initialize Google Maps autocomplete...');
    console.log('inputRef.current:', inputRef.current);
    console.log('window.google:', window.google);
    
    if (!inputRef.current) {
      console.log('No input reference found');
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.log('Google Maps API not loaded yet, retrying...');
      setTimeout(() => initializeAutocomplete(), 100);
      return;
    }

    const options = {
      componentRestrictions: { country: "de" },
      fields: ["address_components", "geometry", "formatted_address"],
      types: ["address"],
    };

    console.log('Creating autocomplete with options:', options);

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      options
    );
    
    console.log('Autocomplete created successfully:', autocompleteRef.current);

    const listener = autocompleteRef.current.addListener("place_changed", () => {
      console.log('Place changed event triggered');
      const place = autocompleteRef.current?.getPlace();
      console.log('Selected place:', place);
      const status = google.maps.places.PlacesServiceStatus.OK;
      onPlaceSelect(place, status);
    });

    return () => {
      if (window.google?.maps?.event && listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  };

  return { initializeAutocomplete };
};