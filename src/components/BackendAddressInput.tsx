
import { useEffect, useState, useRef } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Loader2, MapPin, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { calculateNearestInstitute } from "@/utils/dentalInstitutes";
import { backendMapsService } from "@/utils/backendMapsService";
import type { AddressComponents } from "@/types";

interface BackendAddressInputProps {
  onLocationChange: (location: { lat: number; lng: number }) => void;
  onNearestInstituteFound: (lat: number, lng: number) => void;
  onAddressComponentsChange: (components: AddressComponents) => void;
}

interface AddressSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

export const BackendAddressInput = ({
  onLocationChange,
  onNearestInstituteFound,
  onAddressComponentsChange,
}: BackendAddressInputProps) => {
  const [address, setAddress] = useState("");
  const [debouncedAddress] = useDebounce(address, 300);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Backend-basierte Autocomplete-Suche
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedAddress || debouncedAddress.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setSuggestionsLoading(true);
      try {
        const results = await backendMapsService.getAddressSuggestions(debouncedAddress);
        setSuggestions(results);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Autocomplete error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSuggestionsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedAddress]);

  // Suggestion-Auswahl verarbeiten
  const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
    setAddress(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    setLoading(true);

    try {
      const placeDetails = await backendMapsService.getPlaceDetails(suggestion.place_id);
      
      onLocationChange({ lat: placeDetails.lat, lng: placeDetails.lng });
      
      const nearestInstitute = await calculateNearestInstitute(placeDetails.lat, placeDetails.lng);
      if (nearestInstitute) {
        onNearestInstituteFound(
          nearestInstitute.coordinates.lat,
          nearestInstitute.coordinates.lng
        );
      }
      
      const components: AddressComponents = {};
      placeDetails.address_components?.forEach((component: any) => {
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
      console.error('Address selection error:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Fehler beim Verarbeiten der Adresse.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Manuelle Adresssuche (Fallback)
  const handleManualSearch = async () => {
    if (!address.trim() || address.length < 5) {
      toast({
        variant: "destructive",
        title: "Ungültige Eingabe",
        description: "Bitte geben Sie eine vollständige Adresse ein.",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await backendMapsService.geocodeAddress(address);
      
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
      }
    } catch (error) {
      console.error('Manual search error:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Adresse konnte nicht gefunden werden.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Keyboard-Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleManualSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          handleManualSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="space-y-2 relative">
      <Label htmlFor="address">Adresse der Praxis</Label>
      
      <div className="flex gap-2">
        <div className="relative w-full">
          <Input
            ref={inputRef}
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow clicks
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder="Adresse eingeben..."
            disabled={loading}
            className="w-full pr-8"
          />
          
          {suggestionsLoading && (
            <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 z-50 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.place_id}
                  className={`flex items-center gap-2 p-3 cursor-pointer hover:bg-muted transition-colors ${
                    index === selectedIndex ? 'bg-muted' : ''
                  }`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {suggestion.main_text}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {suggestion.secondary_text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleManualSearch}
          disabled={loading || !address.trim()}
          className="px-6"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <span>Backend-Adresssuche aktiv - beginnen Sie mit der Eingabe</span>
      </div>
    </div>
  );
};
