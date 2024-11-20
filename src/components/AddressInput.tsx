import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AddressInputProps {
  onLocationChange: (location: { lat: number; lng: number }) => void;
}

export const AddressInput = ({ onLocationChange }: AddressInputProps) => {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current || !window.google) return;

    const options = {
      componentRestrictions: { country: "de" },
      fields: ["address_components", "geometry"],
    };

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      options
    );

    const listener = autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place?.geometry?.location) return;

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

      setStreet(`${route} ${streetNumber}`.trim());
      setCity(newCity);
      setPostalCode(newPostalCode);

      onLocationChange({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    });

    return () => {
      if (window.google?.maps?.event && listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [onLocationChange]);

  const geocodeAddress = async () => {
    if (!window.google) return;
    
    try {
      const address = `${street}, ${postalCode} ${city}, Germany`;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        onLocationChange({ lat, lng });
      }
    } catch (error) {
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