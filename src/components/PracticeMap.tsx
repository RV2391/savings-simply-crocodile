import { useState, useCallback, useEffect } from "react";
import { GoogleMap, Marker, InfoWindow, DirectionsRenderer } from "@react-google-maps/api";
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
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string | null>(null);

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
    if (practiceLocation && nearestInstitute) {
      const directionsService = new google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: practiceLocation,
          destination: nearestInstitute.coordinates,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
            if (result.routes[0]?.legs[0]?.distance?.text) {
              setDistance(result.routes[0].legs[0].distance.text);
            }
          }
        }
      );
    }
  }, [practiceLocation, nearestInstitute]);

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={practiceLocation || GERMANY_CENTER}
        zoom={practiceLocation ? 12 : 6}
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

        {directions && <DirectionsRenderer directions={directions} />}

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
      {distance && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md text-sm">
          Entfernung: {distance}
        </div>
      )}
    </div>
  );
};