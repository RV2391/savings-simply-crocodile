
import { useEffect, useState } from 'react';
import { Card } from '../ui/card';

interface ModernDirectionsProps {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}

export const ModernDirections: React.FC<ModernDirectionsProps> = ({ 
  origin, 
  destination 
}) => {
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [routeDetails, setRouteDetails] = useState<{
    distance: string;
    duration: string;
    trafficDuration?: string;
  } | null>(null);

  useEffect(() => {
    const map = (window as any).currentGoogleMap;
    if (!map || !origin || !destination) {
      setRouteDetails(null);
      return;
    }

    // Clean up existing renderer
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }

    const directionsService = new google.maps.DirectionsService();
    const renderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#059669',
        strokeOpacity: 0.8,
        strokeWeight: 4
      }
    });

    renderer.setMap(map);
    setDirectionsRenderer(renderer);

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
            renderer.setDirections(result);
            
            const leg = result.routes[0]?.legs[0];
            if (leg) {
              setRouteDetails({
                distance: leg.distance?.text || "",
                duration: leg.duration?.text || "",
                trafficDuration: leg.duration_in_traffic?.text,
              });
            }
          } else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
            setRouteDetails(null);
          } else {
            console.error('Directions request failed:', status);
          }
        }
      );
    };

    const timeoutId = setTimeout(calculateRoute, 1000);

    return () => {
      clearTimeout(timeoutId);
      if (renderer) {
        renderer.setMap(null);
      }
    };
  }, [origin, destination, directionsRenderer]);

  if (!routeDetails) return null;

  return (
    <Card className="absolute top-4 left-4 p-4 bg-black/90 backdrop-blur-sm border-none shadow-lg z-10">
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
  );
};
