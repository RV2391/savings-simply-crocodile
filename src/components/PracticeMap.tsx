import { useState, useCallback } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { DentalInstitute } from "@/utils/dentalInstitutes";

const GERMANY_CENTER = {
  lat: 51.1657,
  lng: 10.4515,
};

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

interface PracticeMapProps {
  institutes: DentalInstitute[];
  practiceLocation?: google.maps.LatLngLiteral;
  onPracticeLocationChange?: (location: google.maps.LatLngLiteral) => void;
}

export const PracticeMap = ({
  institutes,
  practiceLocation,
  onPracticeLocationChange,
}: PracticeMapProps) => {
  const [selectedInstitute, setSelectedInstitute] = useState<DentalInstitute | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={practiceLocation || GERMANY_CENTER}
        zoom={practiceLocation ? 8 : 6}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={(e) => onPracticeLocationChange?.(e.latLng?.toJSON())}
      >
        {institutes.map((institute) => (
          <Marker
            key={institute.name}
            position={institute.coordinates}
            onClick={() => setSelectedInstitute(institute)}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        ))}

        {practiceLocation && (
          <Marker
            position={practiceLocation}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
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
    </LoadScript>
  );
};