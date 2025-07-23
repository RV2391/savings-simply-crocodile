
import type { DentalInstitute } from "@/utils/dentalInstitutes";
import { OpenStreetMapContainer } from "./map/OpenStreetMapContainer";

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
      {/* OpenStreetMap Container */}
      <OpenStreetMapContainer
        center={practiceLocation}
        practiceLocation={practiceLocation}
        nearestInstitute={nearestInstitute}
        institutes={institutes}
        onPracticeLocationChange={onPracticeLocationChange}
        showDirections={!!nearestInstitute}
      />
    </div>
  );
};
