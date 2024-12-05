import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { findNearestInstitute } from "@/utils/dentalInstitutes";
import { useGoogleMapsAutocomplete } from "@/hooks/useGoogleMapsAutocomplete";
import type { AddressComponents } from "@/types";

interface AddressInputProps {
  onLocationChange: (location: { lat: number; lng: number }) => void;
  onNearestInstituteFound: (lat: number, lng: number) => void;
  onAddressComponentsChange: (components: AddressComponents) => void;
}

export const AddressInput = ({
  onLocationChange,
  onNearestInstituteFound,
  onAddressComponentsChange,
}: AddressInputProps) => {
  const [address, setAddress] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePlaceSelect = (
    place: google.maps.places.PlaceResult | null,
    status: google.maps.places.PlacesServiceStatus
  ) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK || !place?.geometry?.location) {
      toast({
        variant: "destructive",
        title: "Keine Ergebnisse gefunden",
        description: "Bitte überprüfen Sie die eingegebene Adresse und versuchen Sie es erneut.",
        className: "bg-background border-2 border-destructive/50 text-foreground",
      });
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    onLocationChange({ lat, lng });

    const nearestInstitute = findNearestInstitute(lat, lng);
    if (nearestInstitute) {
      onNearestInstituteFound(
        nearestInstitute.coordinates.lat,
        nearestInstitute.coordinates.lng
      );
    }

    // Extract address components
    const components: AddressComponents = {};
    place.address_components?.forEach((component) => {
      const type = component.types[0];
      if (type) {
        components[type] = component.long_name;
      }
    });
    onAddressComponentsChange(components);
  };

  const { initializeAutocomplete } = useGoogleMapsAutocomplete({
    inputRef,
    onPlaceSelect: handlePlaceSelect,
  });

  useEffect(() => {
    initializeAutocomplete();
  }, [initializeAutocomplete]);

  return (
    <div className="space-y-2">
      <Label htmlFor="address" className="text-gray-300">
        Adresse
      </Label>
      <Input
        ref={inputRef}
        type="text"
        id="address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Gib deine Adresse ein"
        className="input-transition bg-[#1a1a1a] text-white border-gray-700"
      />
    </div>
  );
};