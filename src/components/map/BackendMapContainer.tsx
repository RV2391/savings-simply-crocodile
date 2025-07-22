
import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Loader2, Navigation, MapPin } from 'lucide-react';
import { backendMapsService } from '@/utils/backendMapsService';
import type { DentalInstitute } from '@/utils/dentalInstitutes';

interface BackendMapContainerProps {
  center: { lat: number; lng: number };
  practiceLocation: { lat: number; lng: number };
  nearestInstitute?: DentalInstitute;
  institutes: DentalInstitute[];
  onPracticeLocationChange?: (location: { lat: number; lng: number }) => void;
  showDirections?: boolean;
}

export const BackendMapContainer = ({
  center,
  practiceLocation,
  nearestInstitute,
  institutes,
  onPracticeLocationChange,
  showDirections = true
}: BackendMapContainerProps) => {
  const [mapImageUrl, setMapImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [directionsData, setDirectionsData] = useState<any>(null);

  useEffect(() => {
    const generateStaticMap = async () => {
      setLoading(true);
      setError('');
      console.log('🗺️ Generating static map for center:', center);
      
      try {
        const markers = [
          {
            location: `${practiceLocation.lat},${practiceLocation.lng}`,
            color: 'green',
            label: 'P'
          }
        ];

        // Nächstes Institut hervorheben
        if (nearestInstitute) {
          markers.push({
            location: `${nearestInstitute.coordinates.lat},${nearestInstitute.coordinates.lng}`,
            color: 'red',
            label: 'I'
          });
        }

        // Weitere Institute hinzufügen (maximal 5 für Performance)
        const nearbyInstitutes = institutes
          .filter(inst => inst !== nearestInstitute)
          .slice(0, 5);
        
        nearbyInstitutes.forEach((institute, index) => {
          markers.push({
            location: `${institute.coordinates.lat},${institute.coordinates.lng}`,
            color: 'blue',
            label: String(index + 1)
          });
        });

        let polylinePath = '';
        
        // Route berechnen wenn gewünscht
        if (showDirections && nearestInstitute) {
          try {
            const directions = await backendMapsService.getDirections(
              `${practiceLocation.lat},${practiceLocation.lng}`,
              `${nearestInstitute.coordinates.lat},${nearestInstitute.coordinates.lng}`
            );
            
            setDirectionsData(directions);
            polylinePath = directions.polyline;
          } catch (error) {
            console.warn('Directions failed:', error);
          }
        }

        console.log('📍 Total markers to add:', markers.length);

        const mapUrl = await backendMapsService.getStaticMapUrl({
          center: `${center.lat},${center.lng}`,
          zoom: 10,
          size: '800x400',
          markers,
          path: polylinePath
        });

        if (!mapUrl) {
          throw new Error('No map URL returned from service');
        }

        console.log('✅ Static map URL received successfully');
        setMapImageUrl(mapUrl);
      } catch (error) {
        console.error('❌ Map generation failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(`Karte konnte nicht geladen werden: ${errorMessage}`);
        setMapImageUrl('');
      } finally {
        setLoading(false);
      }
    };

    generateStaticMap();
  }, [center, practiceLocation, nearestInstitute, institutes, showDirections]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg border">
        <div className="text-center p-6">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Karte wird generiert...</p>
          <p className="text-xs text-muted-foreground mt-1">Backend-Service wird kontaktiert...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg border">
        <div className="text-center p-6 max-w-md">
          <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Karte konnte nicht geladen werden</p>
          <p className="text-xs text-red-400">{error}</p>
          <button 
            onClick={() => {
              setError('');
              setLoading(true);
              const generateStaticMap = async () => {
                setLoading(true);
                setError('');
                console.log('🗺️ Retrying map generation for center:', center);
                
                try {
                  const markers = [
                    {
                      location: `${practiceLocation.lat},${practiceLocation.lng}`,
                      color: 'green',
                      label: 'P'
                    }
                  ];

                  if (nearestInstitute) {
                    markers.push({
                      location: `${nearestInstitute.coordinates.lat},${nearestInstitute.coordinates.lng}`,
                      color: 'red',
                      label: 'I'
                    });
                  }

                  const nearbyInstitutes = institutes
                    .filter(inst => inst !== nearestInstitute)
                    .slice(0, 5);
                  
                  nearbyInstitutes.forEach((institute, index) => {
                    markers.push({
                      location: `${institute.coordinates.lat},${institute.coordinates.lng}`,
                      color: 'blue',
                      label: String(index + 1)
                    });
                  });

                  let polylinePath = '';
                  
                  if (showDirections && nearestInstitute) {
                    try {
                      const directions = await backendMapsService.getDirections(
                        `${practiceLocation.lat},${practiceLocation.lng}`,
                        `${nearestInstitute.coordinates.lat},${nearestInstitute.coordinates.lng}`
                      );
                      
                      setDirectionsData(directions);
                      polylinePath = directions.polyline;
                    } catch (error) {
                      console.warn('Directions failed:', error);
                    }
                  }

                  const mapUrl = await backendMapsService.getStaticMapUrl({
                    center: `${center.lat},${center.lng}`,
                    zoom: 10,
                    size: '800x400',
                    markers,
                    path: polylinePath
                  });

                  if (!mapUrl) {
                    throw new Error('No map URL returned from service');
                  }

                  setMapImageUrl(mapUrl);
                } catch (error) {
                  console.error('❌ Retry failed:', error);
                  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                  setError(`Karte konnte nicht geladen werden: ${errorMessage}`);
                } finally {
                  setLoading(false);
                }
              };
              generateStaticMap();
            }}
            className="mt-3 px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/80"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden border">
      {mapImageUrl ? (
        <img 
          src={mapImageUrl}
          alt="Statische Karte mit Praxis und Instituten"
          className="w-full h-[400px] object-cover"
          onError={() => {
            console.error('❌ Map image failed to load:', mapImageUrl);
            setError('Kartenbild konnte nicht geladen werden');
            setMapImageUrl('');
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-[400px] bg-muted">
          <div className="text-center p-6">
            <MapPin className="w-16 h-16 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Karte konnte nicht geladen werden</p>
          </div>
        </div>
      )}

      {/* Route-Informationen Overlay */}
      {directionsData && (
        <Card className="absolute top-4 left-4 p-4 bg-black/90 backdrop-blur-sm border-none shadow-lg">
          <div className="space-y-2 text-white">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              <span className="font-medium">Route zum nächsten Institut</span>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between gap-4">
                <span>Entfernung:</span>
                <span className="font-medium">{directionsData.distance}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Fahrzeit:</span>
                <span className="font-medium">{directionsData.duration}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Legende */}
      <Card className="absolute bottom-4 right-4 p-3 bg-black/90 backdrop-blur-sm border-none shadow-lg">
        <div className="space-y-2 text-white text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Ihre Praxis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Nächstes Institut</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Weitere Institute</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
