import { useEffect, useState } from "react";
import { AddressComponents, CalculatorData, Results } from "@/types";

interface HubSpotFormProps {
  calculatorData: CalculatorData;
  results: Results;
  addressComponents: AddressComponents;
}

export const HubSpotForm = ({ calculatorData, results, addressComponents }: HubSpotFormProps) => {
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);

  useEffect(() => {
    const loadForm = () => {
      console.log("Starting HubSpot form load attempt...");
      
      if (window.hbspt && loadAttempts < 3) {
        console.log("HubSpot script found, creating form...");
        const formContainer = document.getElementById('hubspotForm');
        
        if (!formContainer) {
          console.log("Form container not found");
          return;
        }

        // Clear any existing content
        formContainer.innerHTML = '';

        window.hbspt.forms.create({
          region: "eu1",
          portalId: "139717164",
          formId: "13JR5IlFKTj-xcqP784kgoAeush9",
          target: "#hubspotForm",
          onFormReady: () => {
            console.log("HubSpot Form ready");
            setIsFormLoaded(true);
          },
          onFormSubmitted: (form: any) => {
            console.log("Form submitted, getting form data...");
            const formData = form.getFormData();
            const email = formData.get('email');
            const companyName = formData.get('company');

            console.log("Sending data to webhook...");
            fetch('https://hook.eu2.make.com/14ebulh267s1rzskv00n7ho0q98sdxmj', {
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
            }).catch(error => {
              console.error('Webhook error:', error);
            });
          }
        });
        
        setLoadAttempts(prev => prev + 1);
      } else if (!window.hbspt && loadAttempts < 3) {
        console.log("HubSpot script not found, retrying in 2 seconds...");
        setTimeout(loadForm, 2000);
        setLoadAttempts(prev => prev + 1);
      }
    };

    const timer = setTimeout(loadForm, 2000);
    return () => clearTimeout(timer);
  }, [calculatorData, results, addressComponents, loadAttempts]);

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