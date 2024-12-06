import { useEffect, useState, useCallback } from "react";
import { AddressComponents, CalculatorData, Results } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { FormLoadingState } from "./form/FormLoadingState";

interface HubSpotFormProps {
  calculatorData: CalculatorData;
  results: Results;
  addressComponents: AddressComponents;
}

export const HubSpotForm = ({ 
  calculatorData, 
  results, 
  addressComponents 
}: HubSpotFormProps) => {
  const [isFormLoaded, setIsFormLoaded] = useState(false);
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
          setIsFormLoaded(true);
          toast({
            title: "Formular geladen",
            description: "Das Kontaktformular wurde erfolgreich geladen.",
          });
        },
        onFormSubmit: (form: any) => {
          console.log("Form being submitted...");
          const formData = form.getFormData();
          
          // Add hidden fields with calculator data
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
  }, [toast, calculatorData, results, addressComponents]);

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

    // Give more time for the HubSpot script to load
    setTimeout(attemptFormCreation, 2000);

    return () => {
      const formContainer = document.getElementById('hubspotForm');
      if (formContainer) {
        formContainer.innerHTML = '';
      }
    };
  }, [createForm]);

  return (
    <div className="w-full bg-[#2a2a2a] p-6 rounded-2xl shadow-lg mt-8">
      <h3 className="text-lg font-semibold text-white mb-2">
        Erhalten Sie Ihre persönliche Berechnung per E-Mail
      </h3>
      <p className="text-muted-foreground mb-6">
        Wir senden Ihnen die detaillierte Auswertung kostenlos zu.
      </p>
      <div id="hubspotForm" className="min-h-[400px]" />
      {!isFormLoaded && <FormLoadingState />}
    </div>
  );
};