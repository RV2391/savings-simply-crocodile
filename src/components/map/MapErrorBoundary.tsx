import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🗺️ Map Error Boundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🗺️ Map Error Boundary error info:', errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg border">
          <div className="text-center p-6">
            <AlertCircle className="w-16 h-16 mx-auto mb-3 text-destructive" />
            <h3 className="text-lg font-medium mb-2">Kartenfehler</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Die Karte konnte nicht geladen werden. Dies kann durch Netzwerkprobleme oder 
              Content-Security-Policy-Einstellungen verursacht werden.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Erneut versuchen
              </Button>
              <p className="text-xs text-muted-foreground">
                Fehler: {this.state.error?.message}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}