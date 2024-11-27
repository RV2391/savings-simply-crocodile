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
        } else {
          toast({
            title: "Fehler bei der Routenberechnung",
            description: "Die Route konnte nicht berechnet werden. Bitte versuchen Sie es später erneut.",
            variant: "destructive",
          });
        }
      }
    );
  }, [practiceLocation, nearestInstitute, map, toast]);

  return (
    <>
      {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />}
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
    </>
  );
};