import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { calculateNearestInstitute } from "@/utils/dentalInstitutes";
import { googleMapsService } from "@/utils/googleMapsService";
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
  const [loading, setLoading] = useState(false);
  const [backendOnlyMode, setBackendOnlyMode] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { toast } = useToast();

  // Load API key and determine mode
  useEffect(() => {
    const initializeService = async () => {
      console.log('🔑 AddressInput: Initializing address service...');
      
      try {
        const key = await googleMapsService.loadApiKey();
        if (key && window.google?.maps?.places) {
          console.log('✅ AddressInput: Full Google Maps service available');
          initializeAutocomplete();
        } else {
          console.log('ℹ️ AddressInput: Using backend-only mode');
          setBackendOnlyMode(true);
        }
      } catch (error) {
        console.log('ℹ️ AddressInput: Fallback to backend-only mode due to error:', error);
        setBackendOnlyMode(true);
      }
    };

    initializeService();
  }, []);

  // Initialize autocomplete in a safe way
  const initializeAutocomplete = () => {
    if (!addressInputRef.current || autocompleteRef.current) return;

    try {
      console.log('🔧 AddressInput: Creating autocomplete...');
      
      const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
        componentRestrictions: { country: "de" },
        fields: ["address_components", "geometry", "formatted_address"],
        types: ["address"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place?.geometry?.location) {
          handlePlaceSelection(place);
        }
      });

      autocompleteRef.current = autocomplete;
      console.log('✅ AddressInput: Autocomplete initialized');
    } catch (error) {
      console.error('❌ AddressInput: Autocomplete error, using backend mode:', error);
      setBackendOnlyMode(true);
    }
  };

  // Handle place selection from autocomplete
  const handlePlaceSelection = async (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location) return;

    setLoading(true);
    try {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      console.log('📍 Place selected:', { lat, lng });
      setAddress(place.formatted_address || "");
      
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
      });
    } catch (error) {
      console.error('Error processing place selection:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Fehler beim Verarbeiten der Adresse.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Backend geocoding (fallback and primary for backend-only mode)
  const handleManualAddressSubmit = async () => {
    if (!address.trim() || address.trim().length < 3) {
      toast({
        variant: "destructive",
        title: "Ungültige Eingabe",
        description: "Bitte geben Sie eine vollständige Adresse ein.",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🗺️ Using backend geocoding for:', address);
      
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
      });
    } finally {
      setLoading(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (autocompleteRef.current) {
        try {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        } catch (error) {
          console.warn('Cleanup warning:', error);
        }
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="address">
        Adresse der Praxis
      </Label>
      <div className="flex gap-2">
        <Input
          ref={addressInputRef}
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleManualAddressSubmit();
            }
          }}
          placeholder="Adresse eingeben..."
          disabled={loading}
          className="w-full"
        />
        <Button 
          onClick={handleManualAddressSubmit}
          disabled={loading || !address.trim()}
          className="px-6"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        {backendOnlyMode ? (
          "Adresse eingeben und 'Suchen' klicken"
        ) : (
          "Beginnen Sie mit der Eingabe für Vorschläge oder klicken Sie 'Suchen'"
        )}
      </p>
    </div>
  );
};