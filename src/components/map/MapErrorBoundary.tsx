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
    
    // Check if this is a CSP-related error
    const isCSPError = error.message.includes('Content Security Policy') ||
                      error.message.includes('blob:') ||
                      error.message.includes('connect-src') ||
                      error.message.includes('img-src');
                      
    if (isCSPError) {
      console.warn('🛡️ CSP restriction detected, switching to fallback mode');
    }
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
            <h3 className="text-lg font-medium mb-2">
              {this.isCSPError() ? 'Plattform-Beschränkungen erkannt' : 'Kartenfehler'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {this.isCSPError() 
                ? 'Die interaktive Karte ist auf dieser Plattform nicht verfügbar. Eine vereinfachte Standort-Anzeige wird verwendet.'
                : 'Die Karte konnte nicht geladen werden. Dies kann durch Netzwerkprobleme oder Content-Security-Policy-Einstellungen verursacht werden.'
              }
            </p>
            <div className="space-y-2">
              {!this.isCSPError() && (
                <Button 
                  onClick={this.handleRetry}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Erneut versuchen
                </Button>
              )}
              {this.isCSPError() && (
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  ℹ️ Eine vereinfachte Standort-Anzeige wird automatisch verwendet.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {!this.isCSPError() && `Fehler: ${this.state.error?.message}`}
                {this.isCSPError() && 'Plattform-Sicherheitsrichtlinien aktiv'}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  private isCSPError(): boolean {
    if (!this.state.error) return false;
    
    const errorMessage = this.state.error.message || '';
    return errorMessage.includes('Content Security Policy') ||
           errorMessage.includes('blob:') ||
           errorMessage.includes('connect-src') ||
           errorMessage.includes('img-src') ||
           errorMessage.includes('script-src');
  }
}