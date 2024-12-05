import { useState, useRef } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AddressComponents } from "@/types";
import { useGoogleMapsAutocomplete } from "@/hooks/useGoogleMapsAutocomplete";

interface AddressInputProps {
  onLocationChange: (location: { lat: number; lng: number }) => void;
  onNearestInstituteFound?: (lat: number, lng: number) => void;
  onAddressComponentsChange?: (components: AddressComponents) => void;
}

export const AddressInput = ({ 
  onLocationChange, 
  onNearestInstituteFound,
  onAddressComponentsChange 
}: AddressInputProps) => {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { initializeAutocomplete } = useGoogleMapsAutocomplete({
    onLocationChange,
    onNearestInstituteFound,
    onAddressComponentsChange,
  });

  useEffect(() => {
    if (inputRef.current) {
      return initializeAutocomplete(inputRef.current);
    }
  }, []);

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
            className="input-transition bg-[#1a1a1a] text-white border-gray-700"
            readOnly
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
            className="input-transition bg-[#1a1a1a] text-white border-gray-700"
            readOnly
          />
        </div>
      </div>
    </div>
  );
};