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

  useEffect(() => {
    // Override dataLayer.push to capture events
    const originalPush = window.dataLayer?.push;
    if (originalPush) {
      window.dataLayer.push = function(...args: any[]) {
        // Capture the event for debugging
        args.forEach(arg => {
          if (arg.event) {
            setEvents(prev => [...prev.slice(-9), {
              timestamp: Date.now(),
              event: arg.event,
              data: arg
            }]);
          }
        });
        return originalPush.apply(window.dataLayer, args);
      };
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

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
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
            <CardContent className="p-2 overflow-y-auto max-h-64">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine Events aufgezeichnet
                </p>
              ) : (
                <div className="space-y-2">
                  {events.map((event, index) => (
                    <div key={index} className="border rounded p-2 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {event.event}
                        </Badge>
                        <span className="text-muted-foreground">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                      <pre className="text-xs bg-muted/50 p-1 rounded overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};