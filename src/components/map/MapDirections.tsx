import { useEffect, useState } from 'react';
import { DirectionsRenderer } from '@react-google-maps/api';
import { useToast } from '@/hooks/use-toast';
import { Card } from '../ui/card';

interface MapDirectionsProps {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}

export const MapDirections = ({ origin, destination }: MapDirectionsProps) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeDetails, setRouteDetails] = useState<{
    distance: string;
    duration: string;
    trafficDuration?: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!origin || !destination) {
      setDirections(null);
      setRouteDetails(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    
    const calculateRoute = () => {
      directionsService.route(
        {
          origin,
          destination,
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
            setDirections(null);
            setRouteDetails(null);
          } else {
            console.error('Directions request failed due to ' + status);
          }
        }
      );
    };

    const timeoutId = setTimeout(calculateRoute, 1000);

    return () => clearTimeout(timeoutId);
  }, [origin, destination]);

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
