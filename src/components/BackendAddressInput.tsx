import { useEffect, useState, useRef } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Loader2, MapPin, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { calculateNearestInstitute } from "@/utils/dentalInstitutes";
import { mapProviderManager } from "@/utils/mapProviders/mapProviderManager";
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
  const [lastError, setLastError] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<'unknown' | 'working' | 'error'>('unknown');
  
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

      console.log('🔍 Frontend: Starting autocomplete for:', debouncedAddress);
      setSuggestionsLoading(true);
      setLastError('');
      
      try {
        const results = await mapProviderManager.getAddressSuggestions(debouncedAddress);
        setSuggestions(results);
        setShowSuggestions(true);
        setSelectedIndex(-1);
        setApiStatus('working');
        
        console.log(`✅ Frontend: Autocomplete successful - ${results.length} suggestions`);
      } catch (error) {
        console.error('❌ Frontend: Autocomplete error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
        setApiStatus('error');
        
        const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
        setLastError(errorMessage);
        
        // Show user-friendly error message
        if (errorMessage.includes('API') || errorMessage.includes('Konfiguration')) {
          toast({
            variant: "destructive",
            title: "API-Konfigurationsproblem",
            description: "Die Google Maps API ist möglicherweise nicht korrekt konfiguriert. Bitte überprüfe die API-Einstellungen.",
          });
        } else if (errorMessage.includes('Netzwerk')) {
          toast({
            variant: "destructive",
            title: "Netzwerkfehler",
            description: "Bitte überprüfe deine Internetverbindung und versuche es erneut.",
          });
        }
      } finally {
        setSuggestionsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedAddress, toast]);

  // Suggestion-Auswahl verarbeiten
  const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
    console.log('📍 Frontend: Suggestion selected:', suggestion.description);
    setAddress(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    setLoading(true);
    setLastError('');

    try {
      console.log('🔄 Frontend: Getting place details for:', suggestion.place_id);
      // For OSM, pass the description as query, for Google use place_id
      const query = mapProviderManager.getCurrentProvider() === 'osm' ? suggestion.description : suggestion.place_id;
      const placeDetails = await mapProviderManager.getPlaceDetails(query);
      
      console.log('✅ Frontend: Place details received:', placeDetails);
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
      
      setApiStatus('working');
      toast({
        title: "Adresse gefunden",
        description: "Die Entfernung zum nächsten Fortbildungsinstitut wurde berechnet.",
      });
    } catch (error) {
      console.error('❌ Frontend: Address selection error:', error);
      setApiStatus('error');
      
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setLastError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Fehler",
        description: errorMessage.includes('API') ? 
          "API-Konfigurationsproblem beim Verarbeiten der Adresse." : 
          "Fehler beim Verarbeiten der Adresse.",
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
        description: "Bitte gib eine vollständige Adresse ein.",
      });
      return;
    }

    console.log('🔍 Frontend: Starting manual search for:', address);
    setLoading(true);
    setLastError('');
    
    try {
      const result = await mapProviderManager.geocodeAddress(address);
      
      if (result) {
        console.log('✅ Frontend: Manual search successful:', result);
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
        
        setApiStatus('working');
        toast({
          title: "Adresse gefunden",
          description: "Die Entfernung zum nächsten Fortbildungsinstitut wurde berechnet.",
        });
      } else {
        throw new Error('Keine Ergebnisse für die eingegebene Adresse gefunden');
      }
    } catch (error) {
      console.error('❌ Frontend: Manual search error:', error);
      setApiStatus('error');
      
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setLastError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Fehler",
        description: errorMessage.includes('API') ? 
          "API-Konfigurationsproblem bei der Adresssuche." : 
          "Die Adresse konnte nicht gefunden werden.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Erneut versuchen
  const handleRetry = () => {
    setLastError('');
    setApiStatus('unknown');
    if (debouncedAddress && debouncedAddress.length >= 3) {
      // Trigger autocomplete again
      setAddress(address + ' ');
      setTimeout(() => setAddress(address), 100);
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
              className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-y-auto mt-1"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.place_id}
                  className={`flex items-center gap-2 p-3 cursor-pointer transition-colors ${
                    index === selectedIndex ? 'bg-blue-50 text-blue-900' : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <MapPin className="w-4 h-4 flex-shrink-0 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate text-gray-900">
                      {suggestion.main_text}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
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
      
      {/* Status Indicator */}
      <div className="text-sm flex items-center gap-2">
        {apiStatus === 'working' && (
          <>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-green-600">
              {mapProviderManager.getProviderDisplayName(mapProviderManager.getCurrentProvider())} aktiv - beginne mit der Eingabe
            </span>
          </>
        )}
        {apiStatus === 'error' && (
          <>
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-600">API-Problem erkannt</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-2 h-6 px-2"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Erneut versuchen
            </Button>
          </>
        )}
        {apiStatus === 'unknown' && (
          <>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            <span className="text-muted-foreground">
              {mapProviderManager.getProviderDisplayName(mapProviderManager.getCurrentProvider())} wird geprüft...
            </span>
          </>
        )}
      </div>
      
      {/* Error Details */}
      {lastError && (
        <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
          <strong>Fehlerdetails:</strong> {lastError}
        </div>
      )}
    </div>
  );
};
