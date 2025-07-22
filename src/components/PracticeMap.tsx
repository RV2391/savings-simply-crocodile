
import type { DentalInstitute } from "@/utils/dentalInstitutes";
import { BackendMapContainer } from "./map/BackendMapContainer";
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
  // Immer Backend-Karte verwenden
  return (
    <BackendMapContainer
      center={practiceLocation}
      practiceLocation={practiceLocation}
      nearestInstitute={nearestInstitute}
      institutes={institutes}
      onPracticeLocationChange={onPracticeLocationChange}
      showDirections={!!nearestInstitute}
    />
  );
};
