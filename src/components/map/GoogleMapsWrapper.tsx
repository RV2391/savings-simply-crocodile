
import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import type { DentalInstitute } from "@/utils/dentalInstitutes";
import { MapDirections } from "./MapDirections";
import { MapMarker } from "./MapMarker";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

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

  const mapRef = useRef<google.maps.Map>();
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMap(map);
  }, []);

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onPracticeLocationChange({ lat, lng });
      }
    },
    [onPracticeLocationChange]
  );

  useEffect(() => {
    if (map && isLoaded) {
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
    }
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
      <GoogleMap
        id="practice-map"
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={practiceLocation}
        options={options}
        onLoad={onMapLoad}
      >
        <MarkerF
          position={practiceLocation}
          draggable={true}
          onDragEnd={handleMarkerDragEnd}
          icon={{
            url: "/logo.svg",
            scaledSize: new google.maps.Size(40, 40),
          }}
        />

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

        {nearestInstitute && (
          <MapDirections
            origin={practiceLocation}
            destination={{
              lat: nearestInstitute.coordinates.lat,
              lng: nearestInstitute.coordinates.lng,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};
