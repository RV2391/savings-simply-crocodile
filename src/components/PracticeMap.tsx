import { useState, useCallback, useEffect } from "react";
import { GoogleMap, InfoWindow, DirectionsRenderer } from "@react-google-maps/api";
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
    if (!map) return;

    // Clear existing markers
    map.getDiv().querySelectorAll('.advanced-marker').forEach(el => el.remove());

    // Add institute markers
    institutes.forEach((institute, index) => {
      const markerElement = document.createElement('div');
      markerElement.className = 'advanced-marker';
      markerElement.innerHTML = `
        <div style="background: #4285F4; width: 24px; height: 24px; border-radius: 50%; position: relative; cursor: pointer;">
          <div style="background: white; width: 8px; height: 8px; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
        </div>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: institute.coordinates,
        content: markerElement,
        title: institute.name,
      });

      marker.addListener('click', () => {
        setSelectedInstitute(institute);
      });
    });

    // Add practice location marker if exists
    if (practiceLocation) {
      const practiceMarkerElement = document.createElement('div');
      practiceMarkerElement.className = 'advanced-marker';
      practiceMarkerElement.innerHTML = `
        <div style="background: #EA4335; width: 24px; height: 24px; border-radius: 50%; position: relative;">
          <div style="background: white; width: 8px; height: 8px; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
        </div>
      `;

      new google.maps.marker.AdvancedMarkerElement({
        map,
        position: practiceLocation,
        content: practiceMarkerElement,
      });
    }
  }, [map, institutes, practiceLocation]);

  useEffect(() => {
    if (!practiceLocation || !nearestInstitute || !map) {
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
  }, [practiceLocation, nearestInstitute, map, toast]);

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