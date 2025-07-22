import { useEffect, useRef, useState, useCallback } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Loader2, AlertCircle } from "lucide-react";
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
  const [debouncedAddress] = useDebounce(address, 500);
  const [loading, setLoading] = useState(false);
  const [backendOnlyMode, setBackendOnlyMode] = useState(false);
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  const [lastError, setLastError] = useState<string>("");
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { toast } = useToast();

  const MAX_RETRY_ATTEMPTS = 3;
  const MIN_ADDRESS_LENGTH = 5;

  // Robuste API-Initialisierung mit Retry-Mechanismus
  const initializeServiceWithRetry = useCallback(async () => {
    console.log('🔑 AddressInput: Initializing address service... (Attempt', initializationAttempts + 1, '/', MAX_RETRY_ATTEMPTS, ')');
    
    try {
      const key = await googleMapsService.loadApiKey();
      if (key) {
        console.log('✅ AddressInput: API key loaded successfully');
        
        // Warten auf Google Maps Script-Bereitschaft
        let attempts = 0;
        const maxWaitAttempts = 10;
        
        while (!window.google?.maps?.places && attempts < maxWaitAttempts) {
          console.log('⏳ AddressInput: Waiting for Google Maps script...', attempts + 1);
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
        
        if (window.google?.maps?.places) {
          console.log('✅ AddressInput: Google Maps Places API available');
          initializeAutocomplete();
          setLastError("");
        } else {
          throw new Error('Google Maps Places API nicht verfügbar nach Wartezeit');
        }
      } else {
        throw new Error('API key konnte nicht geladen werden');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ AddressInput: Initialization error:', errorMessage);
      setLastError(errorMessage);
      
      if (initializationAttempts < MAX_RETRY_ATTEMPTS - 1) {
        console.log('🔄 AddressInput: Retrying initialization in 2 seconds...');
        setTimeout(() => {
          setInitializationAttempts(prev => prev + 1);
        }, 2000);
      } else {
        console.log('ℹ️ AddressInput: Max retry attempts reached, switching to backend-only mode');
        setBackendOnlyMode(true);
        toast({
          variant: "destructive",
          title: "Google Maps nicht verfügbar",
          description: "Verwende Backend-Geocoding als Fallback. Funktionalität ist weiterhin verfügbar.",
        });
      }
    }
  }, [initializationAttempts, toast]);

  // Load API key and determine mode
  useEffect(() => {
    if (!backendOnlyMode) {
      initializeServiceWithRetry();
    }
  }, [initializeServiceWithRetry, backendOnlyMode]);

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

  // Verbesserte Adressvalidierung
  const validateAddress = (addressText: string): { valid: boolean; message?: string } => {
    const trimmed = addressText.trim();
    
    if (!trimmed) {
      return { valid: false, message: "Bitte geben Sie eine Adresse ein." };
    }
    
    if (trimmed.length < MIN_ADDRESS_LENGTH) {
      return { valid: false, message: `Adresse muss mindestens ${MIN_ADDRESS_LENGTH} Zeichen lang sein.` };
    }
    
    // Prüfe auf grundlegende Adressbestandteile
    const hasNumbers = /\d/.test(trimmed);
    const hasLetters = /[a-zA-ZäöüÄÖÜß]/.test(trimmed);
    
    if (!hasNumbers || !hasLetters) {
      return { valid: false, message: "Bitte geben Sie eine vollständige Adresse mit Straße und Hausnummer ein." };
    }
    
    return { valid: true };
  };

  // Backend geocoding mit verbesserter Validierung
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Geocoding error:', errorMessage);
      
      let userMessage = "Die eingegebene Adresse konnte nicht gefunden werden.";
      let suggestions = "Bitte überprüfen Sie die Eingabe.";
      
      // Spezifische Fehlermeldungen basierend auf dem Error-Typ
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

  // Debounced Geocoding für automatische Suche
  useEffect(() => {
    if (debouncedAddress && debouncedAddress !== address) {
      // Nur ausführen wenn sich der debounced Wert vom aktuellen unterscheidet
      return;
    }
    
    if (debouncedAddress && debouncedAddress.length >= MIN_ADDRESS_LENGTH && backendOnlyMode) {
      const validation = validateAddress(debouncedAddress);
      if (validation.valid) {
        console.log('🔄 AddressInput: Auto-geocoding triggered for:', debouncedAddress);
        handleManualAddressSubmit();
      }
    }
  }, [debouncedAddress, backendOnlyMode]);

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
      <div className="text-sm text-muted-foreground mt-2">
        {backendOnlyMode ? (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span>Backend-Modus: Vollständige Adresse eingeben (min. {MIN_ADDRESS_LENGTH} Zeichen)</span>
          </div>
        ) : (
          <span>Beginnen Sie mit der Eingabe für Vorschläge oder klicken Sie 'Suchen'</span>
        )}
        {lastError && initializationAttempts < MAX_RETRY_ATTEMPTS && (
          <div className="flex items-center gap-2 mt-1 text-yellow-600">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-xs">Google Maps wird geladen... ({initializationAttempts + 1}/{MAX_RETRY_ATTEMPTS})</span>
          </div>
        )}
      </div>
    </div>
  );
};