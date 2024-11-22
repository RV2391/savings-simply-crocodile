import { useState, useEffect } from "react";

interface UseHubspotFormProps {
  portalId: string;
  formId: string;
  target: string;
}

export const useHubspotForm = ({ portalId, formId, target }: UseHubspotFormProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initHubSpotForm = () => {
      if (!window.hbspt) {
        setError("HubSpot script not loaded");
        return;
      }

      try {
        window.hbspt.forms.create({
          region: "eu1",
          portalId,
          formId,
          target,
          onFormReady: () => {
            console.log("HubSpot form ready");
            setIsLoaded(true);
          },
          onFormSubmitted: () => {
            console.log("HubSpot form submitted successfully");
          },
        });
      } catch (err) {
        console.error("Error creating HubSpot form:", err);
        setError("Failed to create HubSpot form");
      }
    };

    // Load HubSpot script
    const script = document.createElement("script");
    script.src = "//js-eu1.hsforms.net/forms/embed/v2.js";
    script.async = true;
    script.onload = () => {
      console.log("HubSpot script loaded");
      initHubSpotForm();
    };
    script.onerror = () => {
      setError("Failed to load HubSpot script");
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [portalId, formId, target]);

  return { isLoaded, error };
};