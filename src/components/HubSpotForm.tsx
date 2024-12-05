import { useEffect, useState, useCallback } from "react";
import { AddressComponents, CalculatorData, Results } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { FormLoadingState } from "./form/FormLoadingState";
import { sendWebhookData } from "@/utils/webhookService";

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
        onFormSubmitted: (form: any) => {
          console.log("Form submitted, getting form data...");
          const formData = form.getFormData();
          const email = formData.get('email');
          const companyName = formData.get('company');

          sendWebhookData({
            email,
            companyName,
            calculatorData,
            results,
            addressComponents
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
    const maxAttempts = 3;
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

    setTimeout(attemptFormCreation, 1500);

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