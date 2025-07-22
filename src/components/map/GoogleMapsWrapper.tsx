
import { useState, useCallback, useEffect } from "react";
import type { DentalInstitute } from "@/utils/dentalInstitutes";
import { GoogleMapContainer } from "./GoogleMapContainer";
import { PracticeMarker } from "./PracticeMarker";
import { MapMarker } from "./MapMarker";
import { ModernDirections } from "./ModernDirections";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";

interface GoogleMapsWrapperProps {
  institutes: DentalInstitute[];
  practiceLocation: {
    lat: number;
    lng: number;
  };
  nearestInstitute?: DentalInstitute;
  onPracticeLocationChange: (location: { lat: number; lng: number }) => void;
}

export const GoogleMapsWrapper = ({
  institutes,
  practiceLocation,
  nearestInstitute,
  onPracticeLocationChange,
}: GoogleMapsWrapperProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const { isLoaded, loadError } = useGoogleMaps();

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    console.log('✅ Map loaded and stored in GoogleMapsWrapper');
  }, []);

  const handleMarkerDragEnd = useCallback(
    (position: google.maps.LatLngLiteral) => {
      onPracticeLocationChange(position);
    },
    [onPracticeLocationChange]
  );

  // Auto-fit bounds when institutes or practice location changes
  useEffect(() => {
    if (!map || !isLoaded) return;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(practiceLocation);
    
    if (nearestInstitute) {
      bounds.extend({
        lat: nearestInstitute.coordinates.lat,
        lng: nearestInstitute.coordinates.lng,
      });
    }

    map.fitBounds(bounds);

    const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
      if (map.getZoom()! > 12) {
        map.setZoom(12);
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, practiceLocation, nearestInstitute, isLoaded]);

  if (loadError) return (
    <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg border">
      <div className="text-center p-6">
        <h3 className="text-lg font-semibold text-destructive mb-2">Kartenansicht nicht verfügbar</h3>
        <p className="text-sm text-muted-foreground">
          Die Karte konnte nicht geladen werden. Dies beeinträchtigt nicht die Berechnung der Entfernungen.
        </p>
      </div>
    </div>
  );

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg border">
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Karte wird geladen...</p>
      </div>
    </div>
  );

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-700">
      <GoogleMapContainer
        center={practiceLocation}
        zoom={10}
        onMapLoad={onMapLoad}
        className="w-full h-[400px]"
      >
        {/* Practice marker */}
        <PracticeMarker
          position={practiceLocation}
          draggable={true}
          onDragEnd={handleMarkerDragEnd}
        />

        {/* Institute markers */}
        {institutes.map((institute) => (
          <MapMarker
            key={institute.name}
            position={{
              lat: institute.coordinates.lat,
              lng: institute.coordinates.lng,
            }}
            isNearest={nearestInstitute?.name === institute.name}
            name={institute.name}
          />
        ))}

        {/* Directions */}
        {nearestInstitute && (
          <ModernDirections
            origin={practiceLocation}
            destination={{
              lat: nearestInstitute.coordinates.lat,
              lng: nearestInstitute.coordinates.lng,
            }}
          />
        )}
      </GoogleMapContainer>
    </div>
  );
};
