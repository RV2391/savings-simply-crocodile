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
    let retries = 0;
    const maxRetries = 10;
    
    const initHubSpotForm = () => {
      if (!window.hbspt) {
        if (retries < maxRetries) {
          retries++;
          setTimeout(initHubSpotForm, 1000);
          return;
        }
        console.error("HubSpot script not loaded after maximum retries");
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

    initHubSpotForm();

    return () => {
      const formContainer = document.querySelector(target);
      if (formContainer) {
        formContainer.innerHTML = '';
      }
    };
  }, [portalId, formId, target]);

  return { isLoaded, error };
};