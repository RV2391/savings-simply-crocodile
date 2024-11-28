import { useState, useCallback, useEffect } from "react";
import { GoogleMap, InfoWindow, useLoadScript } from "@react-google-maps/api";
import { DentalInstitute } from "@/utils/dentalInstitutes";
import { createMarker } from "./map/MapMarker";
import { MapDirections } from "./map/MapDirections";

const GERMANY_CENTER = {
  lat: 51.1657,
  lng: 10.4515,
};

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const libraries: ("places" | "marker")[] = ["places", "marker"];

interface PracticeMapProps {
  institutes: DentalInstitute[];
  practiceLocation?: google.maps.LatLngLiteral;
  nearestInstitute?: DentalInstitute;
  onPracticeLocationChange?: (location: google.maps.LatLngLiteral) => void;
}

export const PracticeMap = ({
  institutes,
  practiceLocation,
  nearestInstitute,
  onPracticeLocationChange,
}: PracticeMapProps) => {
  const [selectedInstitute, setSelectedInstitute] = useState<DentalInstitute | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
    version: "weekly"
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    if (practiceLocation) {
      map.setCenter(practiceLocation);
      map.setZoom(12);
    }
  }, [practiceLocation]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Remove existing markers
    map.getDiv().querySelectorAll('.advanced-marker').forEach(el => el.remove());

    // Add institute markers
    institutes.forEach((institute) => {
      createMarker(
        map,
        institute.coordinates,
        '#4285F4',
        () => setSelectedInstitute(institute)
      );
    });

    // Add practice marker
    if (practiceLocation) {
      createMarker(map, practiceLocation, '#EA4335');
    }
  }, [map, institutes, practiceLocation, isLoaded]);

  // Force map to re-center when practice location changes
  useEffect(() => {
    if (map && practiceLocation) {
      map.setCenter(practiceLocation);
      map.setZoom(12);
    }
  }, [map, practiceLocation]);

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

  return (
    <div className="relative space-y-4">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={practiceLocation || GERMANY_CENTER}
        zoom={practiceLocation ? 12 : 6}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={(e) => onPracticeLocationChange?.(e.latLng?.toJSON())}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {nearestInstitute && practiceLocation && (
          <MapDirections
            map={map}
            practiceLocation={practiceLocation}
            nearestInstitute={nearestInstitute}
          />
        )}

        {selectedInstitute && (
          <InfoWindow
            position={selectedInstitute.coordinates}
            onCloseClick={() => setSelectedInstitute(null)}
          >
            <div className="p-2 text-black">
              <h3 className="font-semibold text-base mb-1">{selectedInstitute.name}</h3>
              <p className="text-sm mb-0.5">{selectedInstitute.address}</p>
              <p className="text-sm">{selectedInstitute.city}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};