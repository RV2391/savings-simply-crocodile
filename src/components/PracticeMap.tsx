
import type { DentalInstitute } from "@/utils/dentalInstitutes";
import { OpenStreetMapContainer } from "./map/OpenStreetMapContainer";
import { MapErrorBoundary } from "./map/MapErrorBoundary";
import { BackendOnlyMap } from "./map/BackendOnlyMap";
import { cspDetection } from "@/utils/cspDetection";
import { useEffect, useState } from "react";

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
  const [shouldUseBackendOnly, setShouldUseBackendOnly] = useState(false);
  const [isCheckingCSP, setIsCheckingCSP] = useState(true);

  useEffect(() => {
    const checkCSPCapabilities = async () => {
      try {
        await cspDetection.detectCapabilities();
        const backendOnlyRequired = cspDetection.isBackendOnlyModeRequired();
        setShouldUseBackendOnly(backendOnlyRequired);
        
        if (backendOnlyRequired) {
          console.log('🛡️ CSP restrictions detected, using backend-only map mode');
        }
      } catch (error) {
        console.warn('⚠️ CSP detection failed, defaulting to backend-only mode:', error);
        setShouldUseBackendOnly(true);
      } finally {
        setIsCheckingCSP(false);
      }
    };

    checkCSPCapabilities();
  }, []);

  // Show backend-only map immediately if CSP restrictions are detected
  if (isCheckingCSP || shouldUseBackendOnly) {
    return (
      <div className="space-y-3">
        <BackendOnlyMap 
          practiceLocation={practiceLocation}
          nearestInstitute={nearestInstitute}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* OpenStreetMap Container with Error Boundary and CSP fallback */}
      <MapErrorBoundary 
        fallback={
          <BackendOnlyMap 
            practiceLocation={practiceLocation}
            nearestInstitute={nearestInstitute}
          />
        }
      >
        <OpenStreetMapContainer
          center={practiceLocation}
          practiceLocation={practiceLocation}
          nearestInstitute={nearestInstitute}
          institutes={institutes}
          onPracticeLocationChange={onPracticeLocationChange}
          showDirections={!!nearestInstitute}
        />
      </MapErrorBoundary>
    </div>
  );
};
