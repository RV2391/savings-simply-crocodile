
import { useState, useEffect } from "react";
import type { DentalInstitute } from "@/utils/dentalInstitutes";
import { googleMapsService } from "@/utils/googleMapsService";
import { GoogleMapsWrapper } from "./map/GoogleMapsWrapper";
import { BackendOnlyMap } from "./map/BackendOnlyMap";

interface PracticeMapProps {
  institutes: DentalInstitute[];
  practiceLocation: {
    lat: number;
    lng: number;
  };
  nearestInstitute?: DentalInstitute;
  onPracticeLocationChange: (location: { lat: number; lng: number }) => void;
}

export const PracticeMap = ({
  institutes,
  practiceLocation,
  nearestInstitute,
  onPracticeLocationChange,
}: PracticeMapProps) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'loading' | 'maps' | 'backend-only'>('loading');

  // Load API key and determine mode
  useEffect(() => {
    const initializeMode = async () => {
      console.log('🗺️ PracticeMap: Initializing map mode...');
      
      try {
        const key = await googleMapsService.loadApiKey();
        if (key) {
          console.log('✅ PracticeMap: API key loaded, using Google Maps');
          setApiKey(key);
          setMapMode('maps');
        } else {
          console.log('ℹ️ PracticeMap: No API key, using backend-only mode');
          setMapMode('backend-only');
        }
      } catch (error) {
        console.log('ℹ️ PracticeMap: Error loading API key, using backend-only mode');
        setMapMode('backend-only');
      }
    };

    initializeMode();
  }, []);

  // Loading state
  if (mapMode === 'loading') {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg border">
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Karte wird geladen...</p>
        </div>
      </div>
    );
  }

  // Backend-only mode
  if (mapMode === 'backend-only') {
    return (
      <BackendOnlyMap 
        practiceLocation={practiceLocation}
        nearestInstitute={nearestInstitute}
      />
    );
  }

  // Google Maps mode - only render when we have a valid API key
  if (mapMode === 'maps' && apiKey) {
    return (
      <GoogleMapsWrapper
        apiKey={apiKey}
        institutes={institutes}
        practiceLocation={practiceLocation}
        nearestInstitute={nearestInstitute}
        onPracticeLocationChange={onPracticeLocationChange}
      />
    );
  }

  // Fallback to backend-only if something goes wrong
  return (
    <BackendOnlyMap 
      practiceLocation={practiceLocation}
      nearestInstitute={nearestInstitute}
    />
  );
};
