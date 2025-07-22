
import { useLoadScript } from "@react-google-maps/api";

interface ConditionalGoogleMapsResult {
  isLoaded: boolean;
  loadError: Error | undefined;
  shouldRender: boolean;
}

export const useConditionalGoogleMaps = (
  apiKey: string | null,
  shouldLoad: boolean
): ConditionalGoogleMapsResult => {
  const hasValidConfig = shouldLoad && !!apiKey;
  
  // Only call useLoadScript when we actually have a valid API key
  const scriptResult = useLoadScript(
    hasValidConfig ? {
      googleMapsApiKey: apiKey,
      libraries: ["places"] as const,
    } : undefined as any,
    { skip: !hasValidConfig }
  );

  return {
    isLoaded: hasValidConfig ? scriptResult.isLoaded : false,
    loadError: hasValidConfig ? scriptResult.loadError : undefined,
    shouldRender: hasValidConfig
  };
};
