import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import type { DentalInstitute } from "@/utils/dentalInstitutes";
import { MapDirections } from "./map/MapDirections";
import { MapMarker } from "./map/MapMarker";
import { googleMapsService } from "@/utils/googleMapsService";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

interface PracticeMapProps {
  institutes: DentalInstitute[];
  practiceLocation: {
    lat: number;
    lng: number;
  };
  nearestInstitute?: DentalInstitute;
  onPracticeLocationChange: (location: { lat: number; lng: number }) => void;
}

export const PracticeMap = ({
  institutes,
  practiceLocation,
  nearestInstitute,
  onPracticeLocationChange,
}: PracticeMapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [mapMode, setMapMode] = useState<'loading' | 'maps' | 'backend-only'>('loading');

  // Load API key and determine mode
  useEffect(() => {
    const initializeMode = async () => {
      console.log('🗺️ PracticeMap: Initializing map mode...');
      
      try {
        const key = await googleMapsService.loadApiKey();
        if (key) {
          console.log('✅ PracticeMap: API key loaded, using Google Maps');
          setApiKey(key);
          setMapMode('maps');
        } else {
          console.log('ℹ️ PracticeMap: No API key, using backend-only mode');
          setMapMode('backend-only');
        }
      } catch (error) {
        console.log('ℹ️ PracticeMap: Error loading API key, using backend-only mode');
        setMapMode('backend-only');
      }
    };

    initializeMode();
  }, []);

  // Only use useLoadScript when we have a valid API key
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  }, mapMode === 'maps' && !!apiKey);

  const mapRef = useRef<google.maps.Map>();
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMap(map);
  }, []);

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onPracticeLocationChange({ lat, lng });
      }
    },
    [onPracticeLocationChange]
  );

  useEffect(() => {
    if (map && isLoaded) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(practiceLocation);
      
      if (nearestInstitute) {
        bounds.extend({
          lat: nearestInstitute.coordinates.lat,
          lng: nearestInstitute.coordinates.lng,
        });
      }

      map.fitBounds(bounds);

      const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
        if (map.getZoom()! > 12) {
          map.setZoom(12);
        }
      });

      return () => {
        google.maps.event.removeListener(listener);
      };
    }
  }, [map, practiceLocation, nearestInstitute, isLoaded]);

  // Backend-only mode display
  if (mapMode === 'backend-only') {
    return (
      <div className="relative w-full rounded-lg overflow-hidden border border-gray-700">
        <div className="flex items-center justify-center h-[400px] bg-muted">
          <div className="text-center p-6 max-w-md">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Standort-Information</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Ihre Praxis:</strong> {practiceLocation.lat.toFixed(4)}°, {practiceLocation.lng.toFixed(4)}°</p>
                {nearestInstitute && (
                  <>
                    <p><strong>Nächstes Institut:</strong> {nearestInstitute.name}</p>
                    <p><strong>Standort:</strong> {nearestInstitute.address}, {nearestInstitute.city}</p>
                    <p className="text-xs text-gray-500 mt-3">
                      * Die Entfernungsberechnung erfolgt über unseren Backend-Service
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) return (
    <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg border">
      <div className="text-center p-6">
        <h3 className="text-lg font-semibold text-destructive mb-2">Kartenansicht nicht verfügbar</h3>
        <p className="text-sm text-muted-foreground">
          Die Karte konnte nicht geladen werden. Dies beeinträchtigt nicht die Berechnung der Entfernungen.
        </p>
      </div>
    </div>
  );

  if (mapMode === 'loading' || !isLoaded) return (
    <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg border">
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Karte wird geladen...</p>
      </div>
    </div>
  );

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-700">
      <GoogleMap
        id="practice-map"
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={practiceLocation}
        options={options}
        onLoad={onMapLoad}
      >
        <MarkerF
          position={practiceLocation}
          draggable={true}
          onDragEnd={handleMarkerDragEnd}
          icon={{
            url: "/logo.svg",
            scaledSize: new google.maps.Size(40, 40),
          }}
        />

        {institutes.map((institute) => (
          <MapMarker
            key={institute.name}
            position={{
              lat: institute.coordinates.lat,
              lng: institute.coordinates.lng,
            }}
            isNearest={nearestInstitute?.name === institute.name}
            name={institute.name}
          />
        ))}

        {nearestInstitute && (
          <MapDirections
            origin={practiceLocation}
            destination={{
              lat: nearestInstitute.coordinates.lat,
              lng: nearestInstitute.coordinates.lng,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};
