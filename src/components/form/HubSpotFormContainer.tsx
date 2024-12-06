import { useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AddressComponents, CalculatorData, Results } from "@/types";
import { FormLoadingState } from "./FormLoadingState";

interface HubSpotFormContainerProps {
  calculatorData: CalculatorData;
  results: Results;
  addressComponents: AddressComponents;
  onFormLoaded: () => void;
  isFormLoaded: boolean;
}

export const HubSpotFormContainer = ({
  calculatorData,
  results,
  addressComponents,
  onFormLoaded,
  isFormLoaded
}: HubSpotFormContainerProps) => {
  const { toast } = useToast();

  const createForm = useCallback(() => {
    console.log("Creating HubSpot form...");
    if (typeof window === 'undefined' || !window.hbspt) {
      console.log("HubSpot script not loaded yet");
      return false;
    }

    const formContainer = document.getElementById('hubspotForm');
    if (!formContainer) {
      console.log("Form container not found");
      return false;
    }

    // Clear any existing form
    formContainer.innerHTML = '';

    try {
      window.hbspt.forms.create({
        region: "eu1",
        portalId: "139717164",
        formId: "13JR5IlFKTj-xcqP784kgoAeush9",
        target: "#hubspotForm",
        onFormReady: () => {
          console.log("HubSpot Form ready");
          onFormLoaded();
        },
        onFormSubmit: (form: any) => {
          console.log("Form being submitted with data:", {
            teamSize: calculatorData.teamSize,
            dentists: calculatorData.dentists,
            results: results,
            address: addressComponents
          });
        },
        onFormSubmitted: () => {
          console.log("Form submitted successfully");
          toast({
            title: "Erfolgreich gesendet",
            description: "Ihre Daten wurden erfolgreich übermittelt. Sie erhalten in Kürze eine E-Mail von uns.",
          });
        },
        onFormError: (error: any) => {
          console.error("Form submission error:", error);
          toast({
            variant: "destructive",
            title: "Fehler beim Senden",
            description: "Es gab einen Fehler beim Senden des Formulars. Bitte versuchen Sie es später erneut.",
          });
        }
      });
      return true;
    } catch (error) {
      console.error("Error creating HubSpot form:", error);
      return false;
    }
  }, [toast, calculatorData, results, addressComponents, onFormLoaded]);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10; // Increased from 5 to 10
    const attemptInterval = 3000; // Increased from 2000 to 3000

    const attemptFormCreation = () => {
      console.log(`Attempt ${attempts + 1} to create HubSpot form...`);
      
      if (createForm()) {
        console.log("Form created successfully");
        return;
      }

      attempts++;
      if (attempts < maxAttempts) {
        console.log(`Form creation failed, will retry in ${attemptInterval}ms...`);
        setTimeout(attemptFormCreation, attemptInterval);
      } else {
        console.log("Max attempts reached, form creation failed");
        toast({
          variant: "destructive",
          title: "Fehler beim Laden",
          description: "Das Formular konnte nicht geladen werden. Bitte laden Sie die Seite neu.",
        });
      }
    };

    // Initial delay before first attempt
    setTimeout(attemptFormCreation, 3000);

    return () => {
      const formContainer = document.getElementById('hubspotForm');
      if (formContainer) {
        formContainer.innerHTML = '';
      }
    };
  }, [createForm, toast]);

  return (
    <div>
      <div id="hubspotForm" className="min-h-[400px]" />
      {!isFormLoaded && <FormLoadingState />}
    </div>
  );
};