import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { calculateNearestInstitute } from "@/utils/dentalInstitutes";
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

  const handlePlaceSelect = async (
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

    const nearestInstitute = await calculateNearestInstitute(lat, lng);
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

  // Fallback geocoding function for manual address input
  const geocodeAddress = async (addressText: string) => {
    try {
      // Simple geocoding using a free service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressText)}&countrycodes=de,at,ch&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        
        onLocationChange({ lat, lng });
        
        const nearestInstitute = await calculateNearestInstitute(lat, lng);
        if (nearestInstitute) {
          onNearestInstituteFound(
            nearestInstitute.coordinates.lat,
            nearestInstitute.coordinates.lng
          );
        }
        
        // Create basic address components from the response
        const components: AddressComponents = {
          city: data[0].display_name.split(',')[0] || '',
          street: addressText
        };
        onAddressComponentsChange(components);
        
        toast({
          title: "Adresse gefunden",
          description: "Die Entfernung zum nächsten Fortbildungsinstitut wurde berechnet.",
          className: "bg-background border-2 border-primary/50 text-foreground",
        });
      } else {
        throw new Error('Keine Ergebnisse gefunden');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        variant: "destructive",
        title: "Adresse nicht gefunden",
        description: "Die eingegebene Adresse konnte nicht gefunden werden. Bitte überprüfen Sie die Eingabe.",
        className: "bg-background border-2 border-destructive/50 text-foreground",
      });
    }
  };

  const handleManualAddressSubmit = () => {
    if (address.trim().length > 5) {
      console.log('Processing manual address:', address);
      geocodeAddress(address);
    }
  };

  useEffect(() => {
    console.log('AddressInput useEffect triggered');
    console.log('window.google available:', !!window.google);
    
    // Test if Google Maps API is loaded
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('Google Maps API is fully loaded');
        initializeAutocomplete();
      } else {
        console.log('Google Maps API not ready, will use fallback geocoding');
        // Don't retry indefinitely, just use fallback
      }
    };
    
    checkGoogleMaps();
  }, [initializeAutocomplete]);

  return (
    <div className="space-y-2">
      <Label htmlFor="address" className="text-gray-300">
        Adresse
      </Label>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleManualAddressSubmit();
            }
          }}
          placeholder="z.B. Hauptstraße 1, 10115 Berlin"
          className="input-transition bg-[#1a1a1a] text-white border-gray-700 flex-1"
        />
        <button
          type="button"
          onClick={handleManualAddressSubmit}
          disabled={address.trim().length < 5}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Suchen
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Geben Sie Ihre Adresse ein und drücken Sie Enter oder klicken Sie auf "Suchen"
      </p>
    </div>
  );
};