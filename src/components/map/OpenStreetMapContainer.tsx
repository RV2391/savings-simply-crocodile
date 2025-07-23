
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

  const generateSimpleMap = async () => {
    setLoading(true);
    setError('');
    
    console.log('🗺️ Generating simple fallback map for center:', center);
    
    try {
      // Create a simple static map using OpenStreetMap tiles
      const zoom = 10;
      const tileSize = 256;
      const mapWidth = 800;
      const mapHeight = 400;
      
      // Calculate tile coordinates
      const lat = center.lat;
      const lng = center.lng;
      
      // Simple tile-based map URL (using OpenStreetMap tiles)
      const tileX = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
      const tileY = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
      
      // Use OpenStreetMap tile server
      const osmTileUrl = `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
      
      console.log('🌍 Using OpenStreetMap tile:', osmTileUrl);
      setMapImageUrl(osmTileUrl);
      
    } catch (error) {
      console.error('❌ Simple map generation failed:', error);
      setError('Karte konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateSimpleMap();
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
          <AlertCircle className="w-16 h-16 mx-auto mb-3 text-orange-500" />
          <p className="text-sm text-muted-foreground mb-2">Karte konnte nicht geladen werden</p>
          <p className="text-xs text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden border">
      <div className="relative h-[400px] bg-gray-100 flex items-center justify-center">
        {mapImageUrl ? (
          <img 
            src={mapImageUrl}
            alt="Karte mit Praxis und Instituten"
            className="w-full h-full object-cover"
            onLoad={() => {
              console.log('✅ Fallback map image loaded successfully');
            }}
            onError={(e) => {
              console.error('❌ Fallback map image failed to display');
              setError('Kartenbild konnte nicht angezeigt werden');
            }}
          />
        ) : (
          <div className="text-center p-6">
            <MapPin className="w-16 h-16 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Karte wird geladen...</p>
          </div>
        )}
        
        {/* Standort-Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Praxis-Marker */}
            <div className="absolute -top-6 -left-3 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <span className="text-xs font-bold text-white">P</span>
            </div>
            
            {/* Nächstes Institut-Marker */}
            {nearestInstitute && (
              <div className="absolute -top-6 left-8 w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <span className="text-xs font-bold text-white">I</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informations-Overlay */}
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
                {nearestInstitute.address}, {nearestInstitute.city}
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
          <div className="text-xs text-gray-300 mt-2 border-t border-gray-600 pt-2">
            Vereinfachte Karte (Fallback)
          </div>
        </div>
      </Card>
    </div>
  );
};
