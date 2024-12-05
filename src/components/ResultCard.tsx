import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AddressComponents, CalculatorData, Results } from "@/types";

interface ResultCardProps {
  results: Results;
  calculatorData: CalculatorData;
  addressComponents: AddressComponents;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  calculatorData,
  results,
  addressComponents,
}) => {
  const { toast } = useToast();
  const [isFormLoaded, setIsFormLoaded] = useState(false);

  useEffect(() => {
    console.log("ResultCard mounted");
    
    const loadForm = () => {
      console.log("Attempting to load HubSpot form...");
      console.log("window.hbspt available:", !!window.hbspt);
      
      if (window.hbspt) {
        try {
          console.log("Creating HubSpot form...");
          const formContainer = document.getElementById('hubspotForm');
          if (!formContainer) {
            console.error('Form container not found');
            return;
          }

          // Entferne alle vorherigen Formularinstanzen
          while (formContainer.firstChild) {
            formContainer.removeChild(formContainer.firstChild);
          }

          window.hbspt.forms.create({
            region: "eu1",
            portalId: "139717164",
            formId: "13JR5IlFKTj-xcqP784kgoAeush9",
            target: "#hubspotForm",
            css: "",
            cssRequired: "",
            onFormReady: (form: any) => {
              console.log("HubSpot Form is ready", form);
              setIsFormLoaded(true);
            },
            onFormSubmitted: () => {
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

    // Initial load attempt
    loadForm();

    // Check every 500ms if HubSpot is loaded
    const checkInterval = setInterval(() => {
      if (!isFormLoaded && window.hbspt) {
        console.log("Retrying form load...");
        loadForm();
      }
    }, 500);

    // Cleanup
    return () => {
      console.log("Cleaning up ResultCard");
      clearInterval(checkInterval);
    };
  }, [calculatorData, results, addressComponents, toast, isFormLoaded]);

  return (
    <Card className="w-full bg-card">
      <div className="space-y-6 p-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Erhalten Sie Ihre persönliche Berechnung per E-Mail
          </h3>
          <p className="text-muted-foreground">
            Wir senden Ihnen die detaillierte Auswertung kostenlos zu.
          </p>
        </div>
        
        <div className="hubspot-form-wrapper">
          <div 
            id="hubspotForm" 
            className="hubspot-form-custom"
            style={{ 
              minHeight: '500px',
              position: 'relative',
              zIndex: 10,
              overflow: 'visible'
            }}
          ></div>
        </div>
        
        {!isFormLoaded && (
          <div className="text-center text-muted-foreground">
            Formular wird geladen...
          </div>
        )}
      </div>
    </Card>
  );
};