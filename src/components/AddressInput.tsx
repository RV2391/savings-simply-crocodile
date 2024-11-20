import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { calculateNearestInstitute } from "@/utils/dentalInstitutes";
import { useToast } from "./ui/use-toast";

interface AddressInputProps {
  onLocationChange: (location: { lat: number; lng: number }) => void;
  onNearestInstituteFound?: (lat: number, lng: number) => void;
}

export const AddressInput = ({ onLocationChange, onNearestInstituteFound }: AddressInputProps) => {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleLocationUpdate = (lat: number, lng: number) => {
    onLocationChange({ lat, lng });
    if (onNearestInstituteFound && postalCode) {
      const nearestInstitute = calculateNearestInstitute(lat, lng, postalCode);
      onNearestInstituteFound(nearestInstitute.coordinates.lat, nearestInstitute.coordinates.lng);
      
      toast({
        title: "Nächstgelegenes Institut gefunden",
        description: `${nearestInstitute.name} wurde als nächstgelegenes Institut identifiziert.`,
      });
    }
  };

  useEffect(() => {
    if (!inputRef.current || !window.google) return;

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
      if (!place?.geometry?.location) {
        toast({
          title: "Fehler",
          description: "Bitte wählen Sie eine gültige Adresse aus den Vorschlägen.",
          variant: "destructive",
        });
        return;
      }

      const addressComponents = place.address_components || [];
      let streetNumber = "";
      let route = "";
      let newCity = "";
      let newPostalCode = "";

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
            newCity = component.long_name;
            break;
          case "postal_code":
            newPostalCode = component.long_name;
            break;
        }
      }

      const newStreet = `${route} ${streetNumber}`.trim();
      setStreet(newStreet);
      setCity(newCity);
      setPostalCode(newPostalCode);

      handleLocationUpdate(
        place.geometry.location.lat(),
        place.geometry.location.lng()
      );
    });

    return () => {
      if (window.google?.maps?.event && listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [onLocationChange, onNearestInstituteFound]);

  const geocodeAddress = async () => {
    if (!window.google || !street) return;
    
    try {
      const address = `${street}, ${postalCode} ${city}, Germany`;
      const geocoder = new google.maps.Geocoder();
      
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results) {
            resolve(results);
          } else {
            reject(status);
          }
        });
      });

      if (result[0]) {
        const { lat, lng } = result[0].geometry.location;
        handleLocationUpdate(lat(), lng());
      }
    } catch (error) {
      toast({
        title: "Fehler bei der Adresssuche",
        description: "Die eingegebene Adresse konnte nicht gefunden werden.",
        variant: "destructive",
      });
      console.error("Geocoding error:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="street" className="text-gray-300">
          Straße und Hausnummer
        </Label>
        <Input
          id="street"
          ref={inputRef}
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          onBlur={geocodeAddress}
          className="input-transition bg-[#1a1a1a] text-white border-gray-700"
          placeholder="Geben Sie eine Adresse ein..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postalCode" className="text-gray-300">
            PLZ
          </Label>
          <Input
            id="postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            onBlur={geocodeAddress}
            className="input-transition bg-[#1a1a1a] text-white border-gray-700"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city" className="text-gray-300">
            Stadt
          </Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={geocodeAddress}
            className="input-transition bg-[#1a1a1a] text-white border-gray-700"
          />
        </div>
      </div>
    </div>
  );
};