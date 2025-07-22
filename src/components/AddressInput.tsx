
import { useEffect, useRef, useState, useCallback } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { calculateNearestInstitute } from "@/utils/dentalInstitutes";
import { googleMapsService } from "@/utils/googleMapsService";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";
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
  const [debouncedAddress] = useDebounce(address, 500);
  const [loading, setLoading] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { toast } = useToast();

  const { isLoaded, isPlacesReady, loadError, retryLoading } = useGoogleMaps();

  const MIN_ADDRESS_LENGTH = 5;

  // Initialize autocomplete when Google Maps and Places are ready
  useEffect(() => {
    if (isPlacesReady && addressInputRef.current && !autocompleteRef.current) {
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
        console.log('✅ AddressInput: Autocomplete initialized successfully');
      } catch (error) {
        console.error('❌ AddressInput: Failed to create autocomplete:', error);
      }
    }
  }, [isPlacesReady]);

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

  // Address validation
  const validateAddress = (addressText: string): { valid: boolean; message?: string } => {
    const trimmed = addressText.trim();
    
    if (!trimmed) {
      return { valid: false, message: "Bitte geben Sie eine Adresse ein." };
    }
    
    if (trimmed.length < MIN_ADDRESS_LENGTH) {
      return { valid: false, message: `Adresse muss mindestens ${MIN_ADDRESS_LENGTH} Zeichen lang sein.` };
    }
    
    const hasNumbers = /\d/.test(trimmed);
    const hasLetters = /[a-zA-ZäöüÄÖÜß]/.test(trimmed);
    
    if (!hasNumbers || !hasLetters) {
      return { valid: false, message: "Bitte geben Sie eine vollständige Adresse mit Straße und Hausnummer ein." };
    }
    
    return { valid: true };
  };

  // Backend geocoding
  const handleManualAddressSubmit = async () => {
    const validation = validateAddress(address);
    if (!validation.valid) {
      toast({
        variant: "destructive",
        title: "Ungültige Eingabe",
        description: validation.message,
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Geocoding error:', errorMessage);
      
      let userMessage = "Die eingegebene Adresse konnte nicht gefunden werden.";
      let suggestions = "Bitte überprüfen Sie die Eingabe.";
      
      if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        userMessage = "Service temporär nicht verfügbar.";
        suggestions = "Bitte versuchen Sie es in wenigen Minuten erneut.";
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        userMessage = "Netzwerkfehler beim Suchen der Adresse.";
        suggestions = "Bitte überprüfen Sie Ihre Internetverbindung.";
      } else if (errorMessage.includes('No geocoding results')) {
        userMessage = "Adresse nicht gefunden.";
        suggestions = "Versuchen Sie eine vollständigere Adresse (z.B. 'Musterstraße 1, 12345 Musterstadt').";
      }
      
      toast({
        variant: "destructive",
        title: userMessage,
        description: suggestions,
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

  const getStatusMessage = () => {
    if (loadError) {
      return (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>Google Maps nicht verfügbar - Backend-Modus aktiv</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={retryLoading}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Erneut versuchen
          </Button>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span>Google Maps wird geladen...</span>
        </div>
      );
    }

    if (!isPlacesReady) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span>Adress-Suche wird initialisiert...</span>
        </div>
      );
    }

    return (
      <span>Beginnen Sie mit der Eingabe für Vorschläge oder klicken Sie 'Suchen'</span>
    );
  };

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
      <div className="text-sm text-muted-foreground mt-2">
        {getStatusMessage()}
      </div>
    </div>
  );
};
