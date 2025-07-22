
import { useEffect, useRef } from 'react';

interface PracticeMarkerProps {
  position: google.maps.LatLngLiteral;
  draggable?: boolean;
  onDragEnd?: (position: google.maps.LatLngLiteral) => void;
}

export const PracticeMarker: React.FC<PracticeMarkerProps> = ({
  position,
  draggable = true,
  onDragEnd
}) => {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    const map = (window as any).currentGoogleMap;
    if (!map || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

    // Clean up existing marker
    if (markerRef.current) {
      markerRef.current.map = null;
    }

    // Create custom marker element for practice
    const markerElement = document.createElement('div');
    markerElement.innerHTML = `
      <div style="
        background: #059669; 
        width: 40px; 
        height: 40px; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: ${draggable ? 'grab' : 'pointer'};
      ">
        <div style="
          background: white; 
          width: 16px; 
          height: 16px; 
          border-radius: 50%;
        "></div>
      </div>
    `;

    // Create the marker
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      content: markerElement,
      gmpDraggable: draggable,
      title: 'Ihre Praxis'
    });

    // Add drag event listener
    if (draggable && onDragEnd) {
      marker.addListener('dragend', () => {
        const newPosition = marker.position;
        if (newPosition) {
          const lat = typeof newPosition.lat === 'function' ? newPosition.lat() : newPosition.lat;
          const lng = typeof newPosition.lng === 'function' ? newPosition.lng() : newPosition.lng;
          onDragEnd({ lat, lng });
        }
      });
    }

    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
      }
    };
  }, [position, draggable, onDragEnd]);

  return null;
};
