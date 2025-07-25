import { MapCache } from './MapCache';

interface MapTile {
  x: number;
  y: number;
  z: number;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface MarkerData {
  lat: number;
  lng: number;
  color: string;
  label: string;
}

export class StaticMapService {
  private static readonly TILE_SIZE = 256;
  private static readonly MAX_ZOOM = 18;
  private static cache = MapCache.getInstance();

  /**
   * Generate a placeholder map URL (CSP-compatible offline solution)
   */
  static async generateStaticMapUrl(
    center: { lat: number; lng: number },
    markers: MarkerData[],
    width: number = 800,
    height: number = 400,
    zoom?: number
  ): Promise<string> {
    console.log('🗺️ Static map generation disabled (CSP-compatible mode)');
    
    // Return a placeholder since external map tiles are blocked by CSP
    // We'll use the BackendOnlyMap component instead
    // Fix: Ensure no spaces in SVG attributes
    const cleanWidth = String(width).trim();
    const cleanHeight = String(height).trim();
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${cleanWidth}" height="${cleanHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${cleanWidth}" height="${cleanHeight}" fill="#f0f0f0"/>
        <text x="${Number(cleanWidth)/2}" y="${Number(cleanHeight)/2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="16" fill="#666">
          Karte nicht verfügbar (CSP-Modus)
        </text>
      </svg>
    `)}`;
  }

  /**
   * Convert lat/lng to tile coordinates
   */
  private static latLngToTile(lat: number, lng: number, zoom: number): MapTile {
    const latRad = (lat * Math.PI) / 180;
    const n = Math.pow(2, zoom);
    
    const x = Math.floor(((lng + 180) / 360) * n);
    const y = Math.floor(
      ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n
    );
    
    return { x, y, z: zoom };
  }

  /**
   * Calculate optimal zoom level based on markers and map size
   */
  private static calculateOptimalZoom(
    markers: MarkerData[],
    width: number,
    height: number
  ): number {
    if (markers.length <= 1) return 12; // Default zoom for single point
    
    // Calculate bounds
    const bounds = this.calculateBounds(markers);
    
    // Calculate zoom level that fits all markers
    const latDiff = bounds.north - bounds.south;
    const lngDiff = bounds.east - bounds.west;
    
    // Use Web Mercator projection math to calculate zoom
    const latZoom = Math.log2(360 / latDiff);
    const lngZoom = Math.log2(360 / lngDiff);
    
    // Take the minimum to ensure all markers fit, add padding
    const zoom = Math.floor(Math.min(latZoom, lngZoom)) - 1;
    
    // Constrain to reasonable bounds
    return Math.max(8, Math.min(zoom, 15));
  }

  /**
   * Calculate bounds for a set of markers
   */
  private static calculateBounds(markers: MarkerData[]): MapBounds {
    const lats = markers.map(m => m.lat);
    const lngs = markers.map(m => m.lng);
    
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };
  }

  /**
   * Preload map tiles for faster display
   */
  static preloadMapTile(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Convert pixel coordinates to lat/lng on a tile
   */
  static pixelToLatLng(
    pixelX: number,
    pixelY: number,
    tile: MapTile,
    tileSize: number = this.TILE_SIZE
  ): { lat: number; lng: number } {
    const n = Math.pow(2, tile.z);
    const lng = ((tile.x + pixelX / tileSize) / n) * 360 - 180;
    
    const latRad = Math.atan(
      Math.sinh(Math.PI * (1 - 2 * (tile.y + pixelY / tileSize) / n))
    );
    const lat = (latRad * 180) / Math.PI;
    
    return { lat, lng };
  }
}