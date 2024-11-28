import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import type { DentalInstitute } from "@/utils/dentalInstitutes";
import { MapDirections } from "./map/MapDirections";
import { MapMarker } from "./map/MapMarker";

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

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
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

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
    if (map) {
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
  }, [map, practiceLocation, nearestInstitute]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

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