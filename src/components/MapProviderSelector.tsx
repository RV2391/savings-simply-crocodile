import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { MapPin, Settings, Check, AlertCircle } from 'lucide-react';
import { mapProviderManager, type MapProvider } from '@/utils/mapProviders/mapProviderManager';

interface MapProviderSelectorProps {
  onProviderChange?: (provider: MapProvider) => void;
  className?: string;
}

export const MapProviderSelector = ({ onProviderChange, className }: MapProviderSelectorProps) => {
  const [showSelector, setShowSelector] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const providers = mapProviderManager.getAllProvidersStatus();
  const currentProvider = mapProviderManager.getCurrentProvider();

  const handleProviderChange = async (provider: MapProvider) => {
    if (provider === currentProvider || isChanging) return;

    setIsChanging(true);
    
    try {
      mapProviderManager.setProvider(provider);
      onProviderChange?.(provider);
      setShowSelector(false);
      
      console.log(`✅ Map provider changed to: ${mapProviderManager.getProviderDisplayName(provider)}`);
    } catch (error) {
      console.error('❌ Failed to change map provider:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'unavailable':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Verfügbar';
      case 'unavailable':
        return 'Nicht verfügbar';
      default:
        return 'Unbekannt';
    }
  };

  if (!showSelector) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSelector(true)}
        className={`gap-2 ${className}`}
      >
        <MapPin className="w-4 h-4" />
        <span className="hidden sm:inline">
          {mapProviderManager.getProviderDisplayName(currentProvider)}
        </span>
        <Settings className="w-3 h-3" />
      </Button>
    );
  }

  return (
    <Card className={`p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Kartenanbieter wählen</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSelector(false)}
          className="h-auto p-1"
        >
          ×
        </Button>
      </div>

      <div className="space-y-2">
        {providers.map(({ provider, status, name, current }) => (
          <div
            key={provider}
            className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
              current ? 'border-primary bg-primary/5' : 'border-border'
            } ${
              status === 'unavailable' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => status !== 'unavailable' && handleProviderChange(provider)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span className="text-sm font-medium">{name}</span>
                </div>
                {current && <Check className="w-4 h-4 text-primary" />}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {getStatusText(status)}
                </span>
                {status === 'unavailable' && (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                )}
              </div>
            </div>

            {provider === 'google' && status === 'unavailable' && (
              <p className="text-xs text-red-600 mt-2">
                API-Konfigurationsproblem erkannt
              </p>
            )}

            {provider === 'osm' && (
              <p className="text-xs text-muted-foreground mt-2">
                Kostenlose Alternative basierend auf OpenStreetMap
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground pt-2 border-t">
        <p>Der Kartenanbieter wird automatisch gewechselt wenn der aktuelle Service nicht verfügbar ist.</p>
      </div>
    </Card>
  );
};