import { useEffect, useState } from 'react';
import { DirectionsRenderer } from '@react-google-maps/api';
import { useToast } from '../ui/use-toast';
import { Card } from '../ui/card';
import { DentalInstitute } from '@/utils/dentalInstitutes';

interface MapDirectionsProps {
  map: google.maps.Map | null;
  practiceLocation: google.maps.LatLngLiteral;
  nearestInstitute: DentalInstitute;
}

interface RouteDetails {
  distance: string;
  duration: string;
  trafficDuration?: string;
}

export const MapDirections = ({ map, practiceLocation, nearestInstitute }: MapDirectionsProps) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!map || !practiceLocation || !nearestInstitute) {
      setDirections(null);
      setRouteDetails(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    
    const calculateRoute = () => {
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
          } else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
            // Keine Route gefunden - leise fehlschlagen
            setDirections(null);
            setRouteDetails(null);
          } else {
            // Nur bei anderen Fehlern Toast anzeigen
            console.error('Directions request failed due to ' + status);
          }
        }
      );
    };

    // Verzögerung hinzufügen, um sicherzustellen, dass die Map vollständig geladen ist
    const timeoutId = setTimeout(calculateRoute, 1000);

    return () => clearTimeout(timeoutId);
  }, [practiceLocation, nearestInstitute, map]);

  return (
    <>
      {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />}
      {routeDetails && (
        <Card className="absolute top-4 left-4 p-4 bg-black/90 backdrop-blur-sm border-none shadow-lg">
          <div className="space-y-2 text-white">
            <div className="flex items-center gap-2">
              <span className="font-medium">Entfernung:</span>
              <span className="text-white">{routeDetails.distance}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Fahrzeit:</span>
              <span className="text-white">{routeDetails.trafficDuration || routeDetails.duration}</span>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};