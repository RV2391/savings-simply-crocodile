
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { calculateNearestInstitute } from "@/utils/dentalInstitutes";
import { supabase } from "@/integrations/supabase/client";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Secure geocoding using our Supabase Edge Function
  const geocodeAddress = async (addressText: string) => {
    setIsLoading(true);
    try {
      console.log('Starting geocoding for:', addressText);
      
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: {
          action: 'geocode',
          address: addressText
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Geocoding service error');
      }

      if (data?.results && data.results.length > 0) {
        const result = data.results[0];
        const lat = result.geometry.location.lat;
        const lng = result.geometry.location.lng;
        
        console.log('Geocoding successful:', { lat, lng });
        
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
        result.address_components?.forEach((component: any) => {
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

  const handleManualAddressSubmit = () => {
    if (address.trim().length > 5) {
      console.log('Processing manual address:', address);
      geocodeAddress(address);
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
        Geben Sie Ihre Adresse ein und drücken Sie Enter oder klicken Sie auf "Suchen"
      </p>
    </div>
  );
};
