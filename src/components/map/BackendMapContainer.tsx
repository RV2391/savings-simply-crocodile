
import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Loader2, Navigation, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
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
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 2;

  const generateStaticMap = async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      setError('');
    }
    
    console.log('🗺️ Generating secure static map for center:', center);
    
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
          console.log('🛣️ Calculating directions...');
          const directions = await backendMapsService.getDirections(
            `${practiceLocation.lat},${practiceLocation.lng}`,
            `${nearestInstitute.coordinates.lat},${nearestInstitute.coordinates.lng}`
          );
          
          console.log('✅ Directions calculated successfully');
          setDirectionsData(directions);
          polylinePath = directions.polyline;
        } catch (error) {
          console.warn('⚠️ Directions failed, continuing without route:', error);
        }
      }

      console.log('📍 Total markers to add:', markers.length);
      console.log('🛣️ Polyline path length:', polylinePath.length);

      // Cleanup previous blob URL to prevent memory leaks
      if (mapImageUrl && mapImageUrl.startsWith('blob:')) {
        console.log('🧹 Cleaning up previous blob URL');
        URL.revokeObjectURL(mapImageUrl);
      }

      // Use the secure image proxy method
      console.log('🔄 Requesting secure static map image...');
      const imageUrl = await backendMapsService.getStaticMapImageUrl({
        center: `${center.lat},${center.lng}`,
        zoom: 10,
        size: '800x400',
        markers,
        path: polylinePath
      });

      if (!imageUrl) {
        throw new Error('Keine Karten-URL vom sicheren Proxy erhalten');
      }

      console.log('✅ Secure static map image URL received');
      setMapImageUrl(imageUrl);
      setRetryCount(0); // Reset retry count on success
      
    } catch (error) {
      console.error('❌ Secure map generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      
      // Enhanced error handling with retry logic
      if (retryCount < MAX_RETRIES && !errorMessage.includes('API-Schlüssel')) {
        console.log(`🔄 Retrying map generation (${retryCount + 1}/${MAX_RETRIES})...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => generateStaticMap(true), 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      setError(`Karte konnte nicht geladen werden: ${errorMessage}`);
      setMapImageUrl('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateStaticMap();

    // Cleanup function to revoke blob URLs and prevent memory leaks
    return () => {
      if (mapImageUrl && mapImageUrl.startsWith('blob:')) {
        console.log('🧹 Component unmount: Cleaning up blob URL');
        URL.revokeObjectURL(mapImageUrl);
      }
    };
  }, [center, practiceLocation, nearestInstitute, institutes, showDirections]);

  // Cleanup blob URL when component unmounts or URL changes
  useEffect(() => {
    return () => {
      if (mapImageUrl && mapImageUrl.startsWith('blob:')) {
        console.log('🧹 URL change: Cleaning up blob URL');
        URL.revokeObjectURL(mapImageUrl);
      }
    };
  }, [mapImageUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg border">
        <div className="text-center p-6">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Sichere Karte wird generiert...</p>
          <p className="text-xs text-muted-foreground mt-1">Backend-Image-Proxy wird verwendet...</p>
          {retryCount > 0 && (
            <p className="text-xs text-yellow-600 mt-2">
              Wiederholung {retryCount}/{MAX_RETRIES}...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg border">
        <div className="text-center p-6 max-w-md">
          <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">Sichere Karte konnte nicht geladen werden</p>
          <p className="text-xs text-red-400 mb-4">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={() => {
                setRetryCount(0);
                generateStaticMap();
              }}
              className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/80 flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="w-3 h-3" />
              Erneut versuchen
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-muted text-muted-foreground rounded text-xs hover:bg-muted/80"
            >
              Seite neu laden
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden border">
      {mapImageUrl ? (
        <img 
          src={mapImageUrl}
          alt="Sichere statische Karte mit Praxis und Instituten"
          className="w-full h-[400px] object-cover"
          onLoad={() => {
            console.log('✅ Map image loaded successfully');
          }}
          onError={(e) => {
            console.error('❌ Map image failed to display:', mapImageUrl);
            console.error('Image error event:', e);
            setError('Sicheres Kartenbild konnte nicht angezeigt werden');
            setMapImageUrl('');
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-[400px] bg-muted">
          <div className="text-center p-6">
            <MapPin className="w-16 h-16 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Sichere Karte konnte nicht geladen werden</p>
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
