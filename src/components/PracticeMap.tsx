
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";
import type { DentalInstitute } from "@/utils/dentalInstitutes";
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
  const { isLoaded, loadError } = useGoogleMaps();

  // Loading state
  if (!isLoaded && !loadError) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg border">
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Karte wird geladen...</p>
        </div>
      </div>
    );
  }

  // Backend-only mode if there's an error or API not loaded
  if (loadError || !isLoaded) {
    return (
      <BackendOnlyMap 
        practiceLocation={practiceLocation}
        nearestInstitute={nearestInstitute}
      />
    );
  }

  // Google Maps mode
  return (
    <GoogleMapsWrapper
      institutes={institutes}
      practiceLocation={practiceLocation}
      nearestInstitute={nearestInstitute}
      onPracticeLocationChange={onPracticeLocationChange}
    />
  );
};
