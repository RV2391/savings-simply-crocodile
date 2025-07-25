import { MapPin, Navigation } from "lucide-react";
import type { DentalInstitute } from "@/utils/dentalInstitutes";

interface LocationInfoProps {
  practiceLocation: {
    lat: number;
    lng: number;
  };
  nearestInstitute?: DentalInstitute;
  distance?: number;
}

export const LocationInfo = ({
  practiceLocation,
  nearestInstitute,
  distance,
}: LocationInfoProps) => {
  return (
    <div className="space-y-3 rounded-lg bg-[#1a1a1a] p-4 border border-gray-700">
      <h4 className="text-sm font-medium text-white flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Standortinformation
      </h4>
      
      <div className="space-y-2 text-sm">
        <div className="text-gray-300">
          <span className="text-gray-400">Praxis-Koordinaten:</span>
          <br />
          {practiceLocation.lat.toFixed(4)}, {practiceLocation.lng.toFixed(4)}
        </div>
        
        {nearestInstitute && (
          <div className="border-t border-gray-700 pt-2">
            <div className="text-gray-300">
              <span className="text-gray-400">Nächstes Institut:</span>
              <br />
              <span className="font-medium">{nearestInstitute.name}</span>
              <br />
              <span className="text-xs">{nearestInstitute.address}, {nearestInstitute.city}</span>
            </div>
            
            {distance && (
              <div className="flex items-center gap-1 mt-2 text-blue-400">
                <Navigation className="w-3 h-3" />
                <span className="text-xs">
                  Entfernung: ca. {Math.round(distance)} km
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};