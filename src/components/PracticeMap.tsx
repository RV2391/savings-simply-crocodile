
import type { DentalInstitute } from "@/utils/dentalInstitutes";
import { BackendMapContainer } from "./map/BackendMapContainer";
import { BackendOnlyMap } from "./map/BackendOnlyMap";
import { OpenStreetMapContainer } from "./map/OpenStreetMapContainer";
import { MapProviderSelector } from "./MapProviderSelector";
import { mapProviderManager } from "@/utils/mapProviders/mapProviderManager";
import { useState } from "react";

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
  const [forceOSM, setForceOSM] = useState(false);

  // Check if we should use OSM directly
  const useOSM = forceOSM || mapProviderManager.getProviderStatus('google') === 'unavailable';

  const handleProviderChange = () => {
    // Force refresh to update map
    setForceOSM(mapProviderManager.getCurrentProvider() === 'osm');
  };

  return (
    <div className="space-y-3">
      {/* Map Provider Selector */}
      <div className="flex justify-end">
        <MapProviderSelector onProviderChange={handleProviderChange} />
      </div>

      {/* Map Container */}
      {useOSM ? (
        <OpenStreetMapContainer
          center={practiceLocation}
          practiceLocation={practiceLocation}
          nearestInstitute={nearestInstitute}
          institutes={institutes}
          onPracticeLocationChange={onPracticeLocationChange}
          showDirections={!!nearestInstitute}
        />
      ) : (
        <BackendMapContainer
          center={practiceLocation}
          practiceLocation={practiceLocation}
          nearestInstitute={nearestInstitute}
          institutes={institutes}
          onPracticeLocationChange={onPracticeLocationChange}
          showDirections={!!nearestInstitute}
        />
      )}
    </div>
  );
};
