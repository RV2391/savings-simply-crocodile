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
        console.error("HubSpot script not loaded");
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

    // Wait a short moment to ensure the HubSpot script is loaded
    const timer = setTimeout(() => {
      initHubSpotForm();
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [portalId, formId, target]);

  return { isLoaded, error };
};