
import { DentalInstitute } from "@/utils/dentalInstitutes";

interface BackendOnlyMapProps {
  practiceLocation: {
    lat: number;
    lng: number;
  };
  nearestInstitute?: DentalInstitute;
}

export const BackendOnlyMap = ({ practiceLocation, nearestInstitute }: BackendOnlyMapProps) => {
  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-700">
      <div className="flex items-center justify-center h-[400px] bg-muted">
        <div className="text-center p-6 max-w-md">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Standort-Information</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Ihre Praxis:</strong> {practiceLocation.lat.toFixed(4)}°, {practiceLocation.lng.toFixed(4)}°</p>
              {nearestInstitute && (
                <>
                  <p><strong>Nächstes Institut:</strong> {nearestInstitute.name}</p>
                  <p><strong>Standort:</strong> {nearestInstitute.address}, {nearestInstitute.city}</p>
                  <p className="text-xs text-gray-500 mt-3">
                    * Die Entfernungsberechnung erfolgt über unseren Backend-Service
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
