import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AddressComponents, CalculatorData, Results } from "@/types";

interface ResultCardProps {
  calculatorData: CalculatorData;
  results: Results;
  addressComponents: AddressComponents;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  calculatorData,
  results,
  addressComponents,
}) => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(true);
  const [email, setEmail] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [hubSpotLoaded, setHubSpotLoaded] = useState(false);

  useEffect(() => {
    // Initialize HubSpot form when the component mounts
    if (window.hbspt && !hubSpotLoaded) {
      window.hbspt.forms.create({
        region: "eu1",
        portalId: "139717164",
        formId: "0a89fc12-4f48-4f4c-9c21-d0bbb34f82f4",
        target: "#hubspotForm",
        onFormSubmit: (form: any) => {
          const formData = form.getFormData();
          const email = formData.get('email');
          const practiceName = formData.get('practice_name');
          handleFormSubmit(email, practiceName);
        }
      });
      setHubSpotLoaded(true);
    }
  }, [hubSpotLoaded]);

  const handleFormSubmit = async (email: string, practiceName: string) => {
    try {
      const webhookData = {
        email,
        practice_name: practiceName,
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
      };

      const response = await fetch('https://hook.eu2.make.com/14ebulh267s1rzskv00n7ho0q98sdxmj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        toast({
          title: "Erfolg!",
          description: "Ihre Berechnung wurde gespeichert und wird an Ihre E-Mail-Adresse gesendet.",
        });
        
        setShowForm(false);
      } else {
        throw new Error(result.message || 'Fehler beim Senden der Daten');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error instanceof Error ? error.message : "Ein unerwarteter Fehler ist aufgetreten",
      });
    }
  };

  if (!showForm) {
    return null;
  }

  return (
    <Card className="p-6 bg-card">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Erhalten Sie Ihre persönliche Berechnung per E-Mail
          </h3>
          <p className="text-muted-foreground">
            Wir senden Ihnen die detaillierte Auswertung kostenlos zu.
          </p>
        </div>
        
        <div id="hubspotForm" className="hubspot-form-wrapper">
          {/* HubSpot Form will be rendered here */}
        </div>
      </div>
    </Card>
  );
};