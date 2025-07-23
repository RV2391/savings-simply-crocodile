import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Loader2, Navigation, MapPin, AlertCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
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
  const [showInfo, setShowInfo] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  const generateMap = async () => {
    setLoading(true);
    setError('');
    
    console.log('🗺️ Generating OpenStreetMap for center:', center);
    
    try {
      // Use CartoDB tiles for better map quality
      const zoom = 10;
      const mapWidth = 800;
      const mapHeight = 400;
      
      const lat = center.lat;
      const lng = center.lng;
      
      // Calculate tile coordinates for higher quality
      const tileX = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
      const tileY = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
      
      // Use CartoDB for better styling (fallback to OSM if needed)
      const tileUrls = [
        `https://cartodb-basemaps-c.global.ssl.fastly.net/light_all/${zoom}/${tileX}/${tileY}.png`,
        `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`
      ];
      
      // Try first tile service, fallback to second
      let mapUrl = tileUrls[0];
      try {
        const response = await fetch(mapUrl);
        if (!response.ok) {
          mapUrl = tileUrls[1];
        }
      } catch {
        mapUrl = tileUrls[1];
      }
      
      console.log('🌍 Using map tile:', mapUrl);
      setMapImageUrl(mapUrl);
      
    } catch (error) {
      console.error('❌ Map generation failed:', error);
      setError('Karte konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateMap();
  }, [center, practiceLocation, nearestInstitute, institutes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg border">
        <div className="text-center p-6">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Karte wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg border">
        <div className="text-center p-6">
          <AlertCircle className="w-16 h-16 mx-auto mb-3 text-destructive" />
          <p className="text-sm text-muted-foreground mb-2">Karte konnte nicht geladen werden</p>
          <p className="text-xs text-destructive">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateMap} 
            className="mt-3"
          >
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden border">
      <div className="relative h-[400px] bg-muted flex items-center justify-center">
        {mapImageUrl ? (
          <img 
            src={mapImageUrl}
            alt="Karte mit Praxis und Instituten"
            className="w-full h-full object-cover"
            onLoad={() => {
              console.log('✅ Map image loaded successfully');
            }}
            onError={(e) => {
              console.error('❌ Map image failed to display');
              setError('Kartenbild konnte nicht angezeigt werden');
            }}
          />
        ) : (
          <div className="text-center p-6">
            <MapPin className="w-16 h-16 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Karte wird geladen...</p>
          </div>
        )}
        
        {/* Practice and Institute Markers */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Practice Marker */}
            <div className="absolute -top-8 -left-4 w-8 h-8 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            
            {/* Nearest Institute Marker */}
            {nearestInstitute && (
              <div className="absolute -top-8 left-6 w-8 h-8 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                <span className="text-sm font-bold text-white">I</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Information Overlay - Closable */}
      {nearestInstitute && showInfo && (
        <Card className="absolute top-4 left-4 p-4 bg-background/95 backdrop-blur-sm border shadow-lg max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Nächstes Institut</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInfo(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-sm">
              <p className="font-medium">{nearestInstitute.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {nearestInstitute.address}, {nearestInstitute.city}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Legend - Closable */}
      {showLegend && (
        <Card className="absolute bottom-4 right-4 p-3 bg-background/95 backdrop-blur-sm border shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Legende</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLegend(false)}
                className="h-5 w-5 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                <span>Ihre Praxis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
                <span>Nächstes Institut</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Restore Info Button */}
      {!showInfo && nearestInstitute && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowInfo(true)}
          className="absolute top-4 left-4"
        >
          <Navigation className="w-4 h-4 mr-1" />
          Info
        </Button>
      )}

      {/* Restore Legend Button */}
      {!showLegend && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowLegend(true)}
          className="absolute bottom-4 right-4"
        >
          Legende
        </Button>
      )}
    </div>
  );
};