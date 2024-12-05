import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { calculateNearestInstitute } from "@/utils/dentalInstitutes";
import { AddressComponents } from "@/types";

interface AutocompleteHookProps {
  onLocationChange: (location: { lat: number; lng: number }) => void;
  onNearestInstituteFound?: (lat: number, lng: number) => void;
  onAddressComponentsChange?: (components: AddressComponents) => void;
}

export const useGoogleMapsAutocomplete = ({
  onLocationChange,
  onNearestInstituteFound,
  onAddressComponentsChange,
}: AutocompleteHookProps) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { toast } = useToast();

  const handleLocationUpdate = async (lat: number, lng: number) => {
    onLocationChange({ lat, lng });
    const nearestInstitute = await calculateNearestInstitute(lat, lng);
    
    if (onNearestInstituteFound && nearestInstitute) {
      onNearestInstituteFound(
        nearestInstitute.coordinates.lat,
        nearestInstitute.coordinates.lng
      );
      
      toast({
        title: "Nächstgelegenes Institut gefunden",
        description: `${nearestInstitute.name} wurde als nächstgelegenes Institut identifiziert.`,
      });
    }
  };

  const extractAddressComponents = (place: google.maps.places.PlaceResult) => {
    const addressComponents = place.address_components || [];
    let streetNumber = "";
    let route = "";
    let city = "";
    let postalCode = "";

    for (const component of addressComponents) {
      const type = component.types[0];
      switch (type) {
        case "street_number":
          streetNumber = component.long_name;
          break;
        case "route":
          route = component.long_name;
          break;
        case "locality":
          city = component.long_name;
          break;
        case "postal_code":
          postalCode = component.long_name;
          break;
      }
    }

    const street = `${route} ${streetNumber}`.trim();
    return { street, city, postalCode };
  };

  const initializeAutocomplete = (inputRef: HTMLInputElement) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      setTimeout(() => initializeAutocomplete(inputRef), 100);
      return;
    }

    const options = {
      componentRestrictions: { country: "de" },
      fields: ["address_components", "geometry", "formatted_address"],
      types: ["address"],
    };

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef,
      options
    );

    const listener = autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place?.geometry?.location) {
        toast({
          title: "Fehler",
          description: "Bitte wählen Sie eine gültige Adresse aus den Vorschlägen.",
          variant: "destructive",
        });
        return;
      }

      const components = extractAddressComponents(place);
      
      // Store address components in sessionStorage
      sessionStorage.setItem('addressComponents', JSON.stringify(components));
      
      // Call the onAddressComponentsChange callback if provided
      if (onAddressComponentsChange) {
        onAddressComponentsChange(components);
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      handleLocationUpdate(lat, lng);

      return components;
    });

    return () => {
      if (window.google?.maps?.event && listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  };

  return { initializeAutocomplete };
};