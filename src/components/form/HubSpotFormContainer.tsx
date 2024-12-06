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
    if (!window.hbspt) {
      console.log("HubSpot script not found, will retry...");
      return false;
    }

    const formContainer = document.getElementById('hubspotForm');
    if (!formContainer) {
      console.log("Form container not found");
      return false;
    }

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
          toast({
            title: "Formular geladen",
            description: "Das Kontaktformular wurde erfolgreich geladen.",
          });
        },
        onFormSubmit: (form: any) => {
          console.log("Form being submitted...");
          const formData = form.getFormData();
          
          formData.append('team_size', String(calculatorData.teamSize || 0));
          formData.append('dentists', String(calculatorData.dentists || 0));
          formData.append('assistants', String((calculatorData.teamSize || 0) - (calculatorData.dentists || 0)));
          formData.append('traditional_costs', String(Math.round(Number(results.totalTraditionalCosts)) || 0));
          formData.append('crocodile_costs', String(Math.round(Number(results.crocodileCosts)) || 0));
          formData.append('savings', String(Math.round(Number(results.savings)) || 0));
          formData.append('street_address', addressComponents.street || '');
          formData.append('city', addressComponents.city || '');
          formData.append('postal_code', addressComponents.postalCode || '');
        },
        onFormSubmitted: () => {
          console.log("Form submitted successfully");
          toast({
            title: "Erfolgreich gesendet",
            description: "Ihre Daten wurden erfolgreich übermittelt. Sie erhalten in Kürze eine E-Mail von uns.",
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
    const maxAttempts = 5;
    const attemptInterval = 2000;

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

    setTimeout(attemptFormCreation, 2000);

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