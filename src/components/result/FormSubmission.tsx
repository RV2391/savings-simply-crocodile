import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

declare global {
  interface Window {
    hbspt: any;
  }
}

interface FormSubmissionProps {
  calculatorData: any;
  results: any;
  addressComponents: any;
}

export const FormSubmission = ({
  calculatorData,
  results,
  addressComponents,
}: FormSubmissionProps) => {
  const { toast } = useToast();
  const [isFormLoaded, setIsFormLoaded] = useState(false);

  useEffect(() => {
    // Warte bis das HubSpot Script geladen ist
    const loadForm = () => {
      if (window.hbspt) {
        try {
          window.hbspt.forms.create({
            region: "eu1",
            portalId: "139717164",
            formId: "13JR5IlFKTj-xcqP784kgoAeush9",
            target: "#hubspotForm",
            onFormReady: () => {
              console.log("HubSpot Form is ready");
              setIsFormLoaded(true);
            },
            onFormSubmitted: () => {
              // Sende zusätzliche Daten an den Webhook
              fetch('https://hook.eu2.make.com/14ebulh267s1rzskv00n7ho0q98sdxmj', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
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
              }).catch(error => {
                console.error('Webhook error:', error);
              });

              toast({
                title: "Erfolg!",
                description: "Ihre Berechnung wurde gespeichert und wird an Ihre E-Mail-Adresse gesendet.",
              });
            }
          });
        } catch (error) {
          console.error('Error creating HubSpot form:', error);
        }
      } else {
        console.log("HubSpot Forms SDK not loaded yet");
      }
    };

    // Versuche das Formular zu laden
    loadForm();

    // Überprüfe alle 500ms, ob das HubSpot Script geladen wurde
    const checkInterval = setInterval(() => {
      if (!isFormLoaded && window.hbspt) {
        loadForm();
      }
    }, 500);

    // Cleanup
    return () => {
      clearInterval(checkInterval);
    };
  }, [calculatorData, results, addressComponents, toast, isFormLoaded]);

  return (
    <div className="space-y-6">
      <div className="hubspot-form-wrapper">
        <div id="hubspotForm" className="hubspot-form-custom"></div>
      </div>
    </div>
  );
};