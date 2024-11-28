import { MarkerF } from "@react-google-maps/api";

interface MapMarkerProps {
  position: google.maps.LatLngLiteral;
  isNearest?: boolean;
  name: string;
}

export const MapMarker = ({ position, isNearest, name }: MapMarkerProps) => {
  return (
    <MarkerF
      position={position}
      icon={{
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: isNearest ? '#22c55e' : '#64748b',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#ffffff',
      }}
      title={name}
    />
  );
};