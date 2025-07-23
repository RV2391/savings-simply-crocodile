
import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Loader2, Navigation, MapPin, AlertCircle } from 'lucide-react';
import type { DentalInstitute } from '@/utils/dentalInstitutes';

interface OpenStreetMapContainerProps {
  center: { lat: number; lng: number };
  practiceLocation: { lat: number; lng: number };
  nearestInstitute?: DentalInstitute;
  institutes: DentalInstitute[];
  onPracticeLocationChange?: (location: { lat: number; lng: number }) => void;
  showDirections?: boolean;
}

export const OpenStreetMapContainer = ({
  center,
  practiceLocation,
  nearestInstitute,
  institutes,
  showDirections = true
}: OpenStreetMapContainerProps) => {
  const [mapImageUrl, setMapImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const generateOpenStreetMap = async () => {
    setLoading(true);
    setError('');
    
    console.log('🗺️ Generating OpenStreetMap fallback for center:', center);
    
    try {
      // OpenStreetMap Static API verwenden
      const zoom = 10;
      const width = 800;
      const height = 400;
      
      // Markers für die Karte erstellen
      const markers = [];
      
      // Praxis-Marker
      markers.push(`pin-s-hospital+00ff00(${practiceLocation.lng},${practiceLocation.lat})`);
      
      // Nächstes Institut hervorheben
      if (nearestInstitute) {
        markers.push(`pin-s-college+ff0000(${nearestInstitute.coordinates.lng},${nearestInstitute.coordinates.lat})`);
      }
      
      // Weitere Institute hinzufügen (maximal 5)
      const nearbyInstitutes = institutes
        .filter(inst => inst !== nearestInstitute)
        .slice(0, 5);
      
      nearbyInstitutes.forEach((institute) => {
        markers.push(`pin-s-college+0000ff(${institute.coordinates.lng},${institute.coordinates.lat})`);
      });
      
      // MapBox Static API als Alternative (free tier)
      const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${markers.join(',')}/${center.lng},${center.lat},${zoom}/${width}x${height}@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA`;
      
      console.log('🌍 Using MapBox free tier for map rendering');
      setMapImageUrl(mapboxUrl);
      
    } catch (error) {
      console.error('❌ OpenStreetMap generation failed:', error);
      setError('Fallback-Karte konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateOpenStreetMap();
  }, [center, practiceLocation, nearestInstitute, institutes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg border">
        <div className="text-center p-6">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Fallback-Karte wird geladen...</p>
          <p className="text-xs text-muted-foreground mt-1">OpenStreetMap wird verwendet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg border">
        <div className="text-center p-6">
          <AlertCircle className="w-16 h-16 mx-auto mb-3 text-orange-500" />
          <p className="text-sm text-muted-foreground mb-2">Fallback-Karte konnte nicht geladen werden</p>
          <p className="text-xs text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden border">
      {mapImageUrl ? (
        <img 
          src={mapImageUrl}
          alt="OpenStreetMap Fallback mit Praxis und Instituten"
          className="w-full h-[400px] object-cover"
          onLoad={() => {
            console.log('✅ OpenStreetMap image loaded successfully');
          }}
          onError={(e) => {
            console.error('❌ OpenStreetMap image failed to display');
            setError('Fallback-Kartenbild konnte nicht angezeigt werden');
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-[400px] bg-muted">
          <div className="text-center p-6">
            <MapPin className="w-16 h-16 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Fallback-Karte konnte nicht geladen werden</p>
          </div>
        </div>
      )}

      {/* Entfernungsinfo wenn verfügbar */}
      {nearestInstitute && (
        <Card className="absolute top-4 left-4 p-4 bg-black/90 backdrop-blur-sm border-none shadow-lg">
          <div className="space-y-2 text-white">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              <span className="font-medium">Nächstes Institut</span>
            </div>
            <div className="text-sm">
              <p className="font-medium">{nearestInstitute.name}</p>
              <p className="text-xs text-gray-300 mt-1">
                Entfernung wird berechnet...
              </p>
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
          <div className="text-xs text-gray-300 mt-2 border-t border-gray-600 pt-2">
            Fallback-Karte (OpenStreetMap)
          </div>
        </div>
      </Card>
    </div>
  );
};
