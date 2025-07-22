
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
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteElementRef = useRef<any>(null);
  const { toast } = useToast();

  const { isLoaded, isPlacesReady, loadError, retryLoading } = useGoogleMaps();

  const MIN_ADDRESS_LENGTH = 5;

  // Try to initialize new PlaceAutocompleteElement
  useEffect(() => {
    if (isPlacesReady && autocompleteContainerRef.current && !autocompleteElementRef.current) {
      try {
        console.log('🔧 AddressInput: Attempting to create PlaceAutocompleteElement...');
        
        // Check if new API is available with proper error handling
        if (window.google?.maps?.places?.PlaceAutocompleteElement) {
          const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
            componentRestrictions: { country: "de" },
            requestedRegion: "de", // Fixed: was requestedRegionCode
            types: ["address"],
          });

          autocompleteElement.id = "place-autocomplete-input";
          
          // Add event listener for place selection
          autocompleteElement.addEventListener('gmp-placeselect', (event: any) => {
            console.log('🎯 Place selected via new API:', event.place);
            handlePlaceSelectionNew(event.place);
          });

          // Clear container and append new element
          autocompleteContainerRef.current.innerHTML = '';
          autocompleteContainerRef.current.appendChild(autocompleteElement);
          autocompleteElementRef.current = autocompleteElement;
          
          console.log('✅ AddressInput: PlaceAutocompleteElement initialized successfully');
        } else {
          console.log('⚠️ PlaceAutocompleteElement not available, using fallback input');
        }
      } catch (error) {
        console.error('❌ AddressInput: Failed to create autocomplete:', error);
        console.log('🔄 Falling back to manual input');
      }
    }
  }, [isPlacesReady]);

  // Handle place selection from new PlaceAutocompleteElement
  const handlePlaceSelectionNew = async (place: any) => {
    if (!place?.location) return;

    setLoading(true);
    try {
      const lat = place.location.lat();
      const lng = place.location.lng();
      
      console.log('📍 Place selected (new API):', { lat, lng });
      setAddress(place.displayName || place.formattedAddress || "");
      
      onLocationChange({ lat, lng });
      
      const nearestInstitute = await calculateNearestInstitute(lat, lng);
      if (nearestInstitute) {
        onNearestInstituteFound(
          nearestInstitute.coordinates.lat,
          nearestInstitute.coordinates.lng
        );
      }
      
      // Extract address components from new API
      const components: AddressComponents = {};
      if (place.addressComponents) {
        place.addressComponents.forEach((component: any) => {
          const type = component.types[0];
          if (type) {
            components[type] = component.longText || component.shortText;
          }
        });
      }
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

  // Backend geocoding fallback
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
      if (autocompleteElementRef.current) {
        try {
          autocompleteElementRef.current.remove();
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

  const hasPlaceAutocomplete = isPlacesReady && !loadError && autocompleteElementRef.current;

  return (
    <div className="space-y-2">
      <Label htmlFor="address">
        Adresse der Praxis
      </Label>
      
      {/* Try PlaceAutocompleteElement first, fallback to manual input */}
      {hasPlaceAutocomplete ? (
        <div className="flex gap-2">
          <div 
            ref={autocompleteContainerRef}
            className="w-full"
            style={{
              '--gmp-autocomplete-input-height': '40px',
              '--gmp-autocomplete-input-padding': '0 12px',
              '--gmp-autocomplete-input-border': '1px solid hsl(var(--border))',
              '--gmp-autocomplete-input-border-radius': '6px',
              '--gmp-autocomplete-input-font-size': '14px',
              '--gmp-autocomplete-input-background': 'hsl(var(--background))',
              '--gmp-autocomplete-input-color': 'hsl(var(--foreground))',
            } as React.CSSProperties}
          />
          <Button 
            onClick={handleManualAddressSubmit}
            disabled={loading}
            className="px-6"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
      ) : (
        /* Fallback input when PlaceAutocompleteElement is not available */
        <div className="flex gap-2">
          <Input
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
      )}
      
      <div className="text-sm text-muted-foreground mt-2">
        {getStatusMessage()}
      </div>
    </div>
  );
};
