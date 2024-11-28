import { useEffect, useRef } from 'react';

interface MapMarkerProps {
  position: google.maps.LatLngLiteral;
  isNearest?: boolean;
  name: string;
}

export const createMarker = (
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  color: string,
  onClick?: () => void
) => {
  const markerElement = document.createElement('div');
  markerElement.className = 'advanced-marker';
  markerElement.innerHTML = `
    <div style="background: ${color}; width: 24px; height: 24px; border-radius: 50%; position: relative; cursor: pointer;">
      <div style="background: white; width: 8px; height: 8px; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
    </div>
  `;

  const marker = new google.maps.marker.AdvancedMarkerElement({
    map,
    position,
    content: markerElement,
  });

  if (onClick) {
    marker.addListener('click', onClick);
  }

  return marker;
};

export const MapMarker: React.FC<MapMarkerProps> = ({ position, isNearest, name }) => {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    const map = (window as any).google.maps.map;
    if (map) {
      if (markerRef.current) {
        markerRef.current.map = null;
      }
      markerRef.current = createMarker(
        map,
        position,
        isNearest ? '#FF0000' : '#3B82F6',
        () => {
          console.log(`Clicked marker: ${name}`);
        }
      );

      return () => {
        if (markerRef.current) {
          markerRef.current.map = null;
        }
      };
    }
  }, [position, isNearest, name]);

  return null;
};