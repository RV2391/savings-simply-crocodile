
import { BackendAddressInput } from "./BackendAddressInput";
import type { AddressComponents } from "@/types";
import { cspDetection } from "@/utils/cspDetection";
import { useEffect, useState } from "react";

interface AddressInputProps {
  onLocationChange: (location: { lat: number; lng: number }) => void;
  onNearestInstituteFound: (lat: number, lng: number) => void;
  onAddressComponentsChange: (components: AddressComponents) => void;
}

export const AddressInput = (props: AddressInputProps) => {
  const [isBackendOnlyMode, setIsBackendOnlyMode] = useState(true);
  
  useEffect(() => {
    // Detect CSP capabilities and decide on mode
    const detectMode = async () => {
      try {
        await cspDetection.detectCapabilities();
        const backendOnlyRequired = cspDetection.isBackendOnlyModeRequired();
        setIsBackendOnlyMode(backendOnlyRequired);
        
        if (backendOnlyRequired) {
          console.log('🛡️ CSP restrictions detected, using backend-only mode for address input');
        }
      } catch (error) {
        console.warn('⚠️ CSP detection failed, defaulting to backend-only mode:', error);
        setIsBackendOnlyMode(true);
      }
    };
    
    detectMode();
  }, []);

  // Always use backend version for CSP compatibility
  return <BackendAddressInput {...props} />;
};
