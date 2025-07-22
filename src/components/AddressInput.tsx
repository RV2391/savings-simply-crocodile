
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { calculateNearestInstitute } from "@/utils/dentalInstitutes";
import { googleMapsService } from "@/utils/googleMapsService";
import { useLoadScript } from "@react-google-maps/api";
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
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { toast } = useToast();

  // Load API key
  useEffect(() => {
    const loadKey = async () => {
      const key = await googleMapsService.loadApiKey();
      if (key) {
        setApiKey(key);
      }
    };
    loadKey();
  }, []);

  // Use useLoadScript with the loaded API key
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  // Initialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || !apiKey) return;

    try {
      console.log('Initializing autocomplete with loaded Google Maps...');
      
      // Clean up existing autocomplete
      if (autocompleteRef.current) {
        try {
          autocompleteRef.current.unbindAll();
        } catch (error) {
          console.error('Error cleaning up autocomplete:', error);
        }
      }

      // Create new autocomplete
      autocompleteRef.current = googleMapsService.createAutocomplete(inputRef.current);
      
      if (autocompleteRef.current) {
        autocompleteRef.current.addListener("place_changed", async () => {
          const place = autocompleteRef.current?.getPlace();
          if (place && place.geometry) {
            await handlePlaceSelection(place);
          }
        });
        
        console.log('Autocomplete initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }

    return () => {
      if (autocompleteRef.current) {
        try {
          autocompleteRef.current.unbindAll();
        } catch (error) {
          console.error('Error cleaning up autocomplete:', error);
        }
      }
    };
  }, [isLoaded, apiKey]);

  // Handle place selection from autocomplete
  const handlePlaceSelection = async (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location) return;

    setIsLoading(true);
    try {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      console.log('Place selected via autocomplete:', { lat, lng });
      
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
      place.address_components?.forEach((component: any) => {
        const type = component.types[0];
        if (type) {
          components[type] = component.long_name;
        }
      });
      onAddressComponentsChange(components);
      
      toast({
        title: "Adresse gefunden",
        description: "Die Entfernung zum nächsten Fortbildungsinstitut wurde berechnet.",
        className: "bg-background border-2 border-primary/50 text-foreground",
      });
    } catch (error) {
      console.error('Error processing place selection:', error);
      await handleManualAddressSubmit(); // Fallback to backend
    } finally {
      setIsLoading(false);
    }
  };

  // Backend geocoding fallback
  const handleManualAddressSubmit = async () => {
    if (address.trim().length < 5) return;

    setIsLoading(true);
    try {
      console.log('Using backend geocoding for:', address);
      
      const result = await googleMapsService.geocodeAddress(address);
      
      if (result) {
        onLocationChange({ lat: result.lat, lng: result.lng });
        
        const nearestInstitute = await calculateNearestInstitute(result.lat, result.lng);
        if (nearestInstitute) {
          onNearestInstituteFound(
            nearestInstitute.coordinates.lat,
            nearestInstitute.coordinates.lng
          );
        }
        
        // Extract address components
        const components: AddressComponents = {};
        result.addressComponents?.forEach((component: any) => {
          const type = component.types[0];
          if (type) {
            components[type] = component.long_name;
          }
        });
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
    } finally {
      setIsLoading(false);
    }
  };

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
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleManualAddressSubmit}
          disabled={address.trim().length < 5 || isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[80px]"
        >
          {isLoading ? "..." : "Suchen"}
        </button>
      </div>
      <p className="text-xs text-gray-500">
        {!isLoaded || !apiKey
          ? "System wird initialisiert..." 
          : "Beginnen Sie zu tippen für automatische Vorschläge oder geben Sie eine komplette Adresse ein und klicken Sie \"Suchen\""
        }
      </p>
    </div>
  );
};
