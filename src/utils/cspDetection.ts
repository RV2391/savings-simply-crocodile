/**
 * CSP Detection Service
 * Detects Content Security Policy restrictions and provides fallback mechanisms
 */

export interface CSPCapabilities {
  canUseBlobUrls: boolean;
  canConnectToOpenStreetMap: boolean;
  canExecuteInlineScripts: boolean;
  detectedRestrictions: string[];
}

export class CSPDetectionService {
  private static instance: CSPDetectionService;
  private capabilities: CSPCapabilities | null = null;
  
  static getInstance(): CSPDetectionService {
    if (!CSPDetectionService.instance) {
      CSPDetectionService.instance = new CSPDetectionService();
    }
    return CSPDetectionService.instance;
  }

  async detectCapabilities(): Promise<CSPCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    console.log('🔍 Detecting CSP capabilities...');
    
    const restrictions: string[] = [];
    
    // Test blob URL support
    const canUseBlobUrls = await this.testBlobUrlSupport();
    if (!canUseBlobUrls) {
      restrictions.push('blob URLs blocked by img-src directive');
    }

    // Test OpenStreetMap API access
    const canConnectToOpenStreetMap = await this.testOpenStreetMapAccess();
    if (!canConnectToOpenStreetMap) {
      restrictions.push('OpenStreetMap API blocked by connect-src directive');
    }

    // Test inline script execution
    const canExecuteInlineScripts = this.testInlineScripts();
    if (!canExecuteInlineScripts) {
      restrictions.push('Inline scripts blocked by script-src directive');
    }

    this.capabilities = {
      canUseBlobUrls,
      canConnectToOpenStreetMap,
      canExecuteInlineScripts,
      detectedRestrictions: restrictions
    };

    console.log('🛡️ CSP Capabilities detected:', this.capabilities);
    
    return this.capabilities;
  }

  private async testBlobUrlSupport(): Promise<boolean> {
    try {
      // Create a simple blob and test if it can be used as img src
      const blob = new Blob(['test'], { type: 'text/plain' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Test by creating an image element
      return new Promise<boolean>((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
          resolve(false);
        }, 1000);
        
        img.onload = () => {
          clearTimeout(timeout);
          URL.revokeObjectURL(blobUrl);
          resolve(true);
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          URL.revokeObjectURL(blobUrl);
          resolve(false);
        };
        
        img.src = blobUrl;
      });
    } catch (error) {
      console.warn('⚠️ Blob URL test failed:', error);
      return false;
    }
  }

  private async testOpenStreetMapAccess(): Promise<boolean> {
    try {
      // Test a simple request to OpenStreetMap Nominatim API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(
        'https://nominatim.openstreetmap.org/search?q=Berlin&format=json&limit=1',
        {
          signal: controller.signal,
          method: 'GET'
        }
      );
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('⚠️ OpenStreetMap access test failed:', error);
      return false;
    }
  }

  private testInlineScripts(): boolean {
    try {
      // This will fail with CSP that blocks 'unsafe-inline'
      new Function('return true')();
      return true;
    } catch (error) {
      console.warn('⚠️ Inline script test failed:', error);
      return false;
    }
  }

  isBackendOnlyModeRequired(): boolean {
    if (!this.capabilities) {
      // If we can't detect capabilities, assume backend-only mode for safety
      return true;
    }
    
    return !this.capabilities.canConnectToOpenStreetMap || !this.capabilities.canUseBlobUrls;
  }

  getRecommendedMode(): 'frontend' | 'hybrid' | 'backend-only' {
    if (!this.capabilities) {
      return 'backend-only';
    }

    if (this.capabilities.canConnectToOpenStreetMap && this.capabilities.canUseBlobUrls) {
      return 'frontend';
    }
    
    if (this.capabilities.canConnectToOpenStreetMap || this.capabilities.canUseBlobUrls) {
      return 'hybrid';
    }
    
    return 'backend-only';
  }
}

export const cspDetection = CSPDetectionService.getInstance();