import { useEffect, useState, useCallback } from "react";
import { AddressComponents, CalculatorData, Results } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface HubSpotFormProps {
  calculatorData: CalculatorData;
  results: Results;
  addressComponents: AddressComponents;
}

export const HubSpotForm = ({ calculatorData, results, addressComponents }: HubSpotFormProps) => {
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

    // Clear existing content
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

          sendWebhookData(email, companyName);
        }
      });
      return true;
    } catch (error) {
      console.error("Error creating HubSpot form:", error);
      return false;
    }
  }, [toast]);

  const sendWebhookData = async (email: string | null, companyName: string | null) => {
    console.log("Sending data to webhook...");
    try {
      const response = await fetch('https://hook.eu2.make.com/14ebulh267s1rzskv00n7ho0q98sdxmj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || '',
          company_name: companyName || '',
          team_size: Number(calculatorData.teamSize) || 0,
          dentists: Number(calculatorData.dentists) || 0,
          assistants: (Number(calculatorData.teamSize) || 0) - (Number(calculatorData.dentists) || 0),
          traditional_costs: Math.round(Number(results.totalTraditionalCosts)) || 0,
          crocodile_costs: Math.round(Number(results.crocodileCosts)) || 0,
          savings: Math.round(Number(results.savings)) || 0,
          street_address: addressComponents.street || '',
          city: addressComponents.city || '',
          postal_code: addressComponents.postalCode || '',
          timestamp: new Date().toISOString(),
          utm_medium: 'kalkulator',
          utm_campaign: 'cyberdeal',
          utm_term: 'november24'
        })
      });

      if (!response.ok) {
        throw new Error('Webhook request failed');
      }

      toast({
        title: "Erfolgreich gesendet",
        description: "Ihre Daten wurden erfolgreich übermittelt.",
      });
    } catch (error) {
      console.error('Webhook error:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Beim Senden der Daten ist ein Fehler aufgetreten.",
      });
    }
  };

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 3;
    const attemptInterval = 2000; // 2 seconds

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
    setTimeout(attemptFormCreation, 1500);

    return () => {
      // Cleanup if component unmounts
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
      {!isFormLoaded && (
        <div className="text-center text-muted-foreground mt-4">
          Formular wird geladen...
        </div>
      )}
    </div>
  );
};