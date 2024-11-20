import { useState, useCallback, useEffect } from "react";
import { GoogleMap, Marker, InfoWindow, DirectionsRenderer } from "@react-google-maps/api";
import { DentalInstitute } from "@/utils/dentalInstitutes";
import { useToast } from "./ui/use-toast";
import { Card } from "./ui/card";

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

interface RouteDetails {
  distance: string;
  duration: string;
  trafficDuration?: string;
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
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
  const { toast } = useToast();

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
    if (!practiceLocation || !nearestInstitute) {
      setDirections(null);
      setRouteDetails(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: practiceLocation,
        destination: nearestInstitute.coordinates,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS,
        },
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg) {
            setRouteDetails({
              distance: leg.distance?.text || "",
              duration: leg.duration?.text || "",
              trafficDuration: leg.duration_in_traffic?.text,
            });
          }
        } else if (status === google.maps.DirectionsStatus.REQUEST_DENIED) {
          toast({
            title: "API-Konfigurationsfehler",
            description: "Bitte stellen Sie sicher, dass der API-Schlüssel korrekt konfiguriert ist und die Domain autorisiert wurde.",
            variant: "destructive",
          });
          console.error("API configuration error:", status);
        } else {
          toast({
            title: "Fehler bei der Routenberechnung",
            description: "Die Route konnte nicht berechnet werden. Bitte versuchen Sie es später erneut.",
            variant: "destructive",
          });
          console.error("Directions request failed:", status);
        }
      }
    );
  }, [practiceLocation, nearestInstitute, toast]);

  return (
    <div className="relative space-y-4">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={practiceLocation || GERMANY_CENTER}
        zoom={practiceLocation ? 12 : 6}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={(e) => onPracticeLocationChange?.(e.latLng?.toJSON())}
      >
        {institutes.map((institute, index) => (
          <Marker
            key={`${institute.name}-${index}`}
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

        {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />}

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
      
      {routeDetails && (
        <Card className="p-4 bg-white/10 backdrop-blur-sm">
          <div className="space-y-2 text-white">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Entfernung:</span>
              <span>{routeDetails.distance}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Fahrzeit:</span>
              <span>{routeDetails.trafficDuration || routeDetails.duration}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};