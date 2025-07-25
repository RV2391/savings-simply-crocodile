
import type { DentalInstitute } from "@/utils/dentalInstitutes";
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
  return (
    <div className="space-y-3">
      {/* Backend-Only Map (CSP-compatible) */}
      <BackendOnlyMap
        practiceLocation={practiceLocation}
        nearestInstitute={nearestInstitute}
      />
    </div>
  );
};
