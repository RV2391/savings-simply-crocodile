
import { useEffect, useRef, useCallback } from 'react';

interface GoogleMapContainerProps {
  center: google.maps.LatLngLiteral;
  zoom?: number;
  onMapLoad?: (map: google.maps.Map) => void;
  className?: string;
  children?: React.ReactNode;
}

export const GoogleMapContainer: React.FC<GoogleMapContainerProps> = ({
  center,
  zoom = 10,
  onMapLoad,
  className = "w-full h-[400px]",
  children
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google?.maps) return;

    const mapOptions: google.maps.MapOptions = {
      center,
      zoom,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    };

    const map = new google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    // Store map reference globally for components that need it
    (window as any).currentGoogleMap = map;

    if (onMapLoad) {
      onMapLoad(map);
    }

    console.log('✅ Google Map initialized with pure JavaScript API');
  }, [center, zoom, onMapLoad]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
    }
  }, [center]);

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {children}
    </div>
  );
};
