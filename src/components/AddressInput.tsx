import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AddressInputProps {
  onLocationChange: (location: { lat: number; lng: number }) => void;
}

export const AddressInput = ({ onLocationChange }: AddressInputProps) => {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const geocodeAddress = async () => {
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
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          onBlur={geocodeAddress}
          className="input-transition bg-[#1a1a1a] text-white border-gray-700"
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