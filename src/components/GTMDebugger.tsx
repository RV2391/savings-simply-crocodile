import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Bug, RefreshCw } from 'lucide-react';

interface GTMEvent {
  timestamp: number;
  event: string;
  data: Record<string, any>;
}

export const GTMDebugger = () => {
  const [events, setEvents] = useState<GTMEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    dataLayerExists: false,
    originalPushExists: false,
    eventsIntercepted: 0
  });

  useEffect(() => {
    // Initialize dataLayer if it doesn't exist
    if (!window.dataLayer) {
      window.dataLayer = [];
      console.log('GTM Debugger: Created window.dataLayer');
    }

    const originalPush = window.dataLayer?.push;
    setDebugInfo(prev => ({
      ...prev,
      dataLayerExists: !!window.dataLayer,
      originalPushExists: !!originalPush
    }));

    if (originalPush) {
      window.dataLayer.push = function(...args: any[]) {
        console.log('GTM Debugger: Event intercepted', args);
        
        // Capture the event for debugging
        args.forEach(arg => {
          if (arg.event) {
            const eventData = {
              timestamp: Date.now(),
              event: arg.event,
              data: arg
            };
            
            setEvents(prev => [...prev.slice(-9), eventData]);
            setDebugInfo(prev => ({
              ...prev,
              eventsIntercepted: prev.eventsIntercepted + 1
            }));
            
            console.log('GTM Debugger: Event captured', eventData);
          }
        });
        
        return originalPush.apply(window.dataLayer, args);
      };
    } else {
      console.warn('GTM Debugger: Original dataLayer.push not found');
    }

    return () => {
      if (originalPush) {
        window.dataLayer.push = originalPush;
      }
    };
  }, []);

  const clearEvents = () => setEvents([]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Always show in development, or when GTM events are detected
  if (process.env.NODE_ENV !== 'development' && events.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Bug className="h-4 w-4" />
            GTM Debug ({events.length})
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="w-96 mt-2 max-h-96 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex justify-between items-center">
                GTM Events
                <Button variant="ghost" size="sm" onClick={clearEvents}>
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
              {/* Debug Info Section */}
              <div className="text-xs bg-muted/30 p-2 rounded">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={debugInfo.dataLayerExists ? "default" : "destructive"} className="text-xs">
                    DataLayer: {debugInfo.dataLayerExists ? "✓" : "✗"}
                  </Badge>
                  <Badge variant={debugInfo.originalPushExists ? "default" : "destructive"} className="text-xs">
                    Push: {debugInfo.originalPushExists ? "✓" : "✗"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Events: {debugInfo.eventsIntercepted}
                  </Badge>
                </div>
              </div>

              {/* Events List */}
              <div className="overflow-y-auto max-h-48">
                {events.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Keine Events aufgezeichnet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Verwende den Calculator um Events zu generieren
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {events.map((event, index) => (
                      <div key={index} className="border rounded p-2 text-xs bg-card">
                        <div className="flex justify-between items-center mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {event.event}
                          </Badge>
                          <span className="text-muted-foreground">
                            {formatTime(event.timestamp)}
                          </span>
                        </div>
                        <pre className="text-xs bg-muted/50 p-1 rounded overflow-x-auto whitespace-pre-wrap break-words">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};