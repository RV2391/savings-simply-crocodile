import { RefObject } from "react";
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
  const autocompleteRef = google.maps.places.Autocomplete | null = null;
  const { toast } = useToast();

  const initializeAutocomplete = () => {
    if (!inputRef.current) return;

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      setTimeout(() => initializeAutocomplete(), 100);
      return;
    }

    const options = {
      componentRestrictions: { country: "de" },
      fields: ["address_components", "geometry", "formatted_address"],
      types: ["address"],
    };

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      options
    );

    const listener = autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
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