import { toast } from "@/components/ui/use-toast";
import { AddressComponents, CalculatorData, Results } from "@/types";

interface WebhookData {
  email: string;
  companyName: string;
  calculatorData: CalculatorData;
  results: Results;
  addressComponents: AddressComponents;
}

export const sendWebhookData = async ({
  email,
  companyName,
  calculatorData,
  results,
  addressComponents,
}: WebhookData) => {
  console.log("Sending data to HubSpot...");
  try {
    const portalId = "139717164";
    const formGuid = "13JR5IlFKTj-xcqP784kgoAeush9";
    
    const response = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        fields: [
          { name: "email", value: email },
          { name: "company", value: companyName },
          { name: "team_size", value: String(calculatorData.teamSize || 0) },
          { name: "dentists", value: String(calculatorData.dentists || 0) },
          { name: "assistants", value: String((calculatorData.teamSize || 0) - (calculatorData.dentists || 0)) },
          { name: "traditional_costs", value: String(Math.round(Number(results.totalTraditionalCosts)) || 0) },
          { name: "crocodile_costs", value: String(Math.round(Number(results.crocodileCosts)) || 0) },
          { name: "savings", value: String(Math.round(Number(results.savings)) || 0) },
          { name: "street_address", value: addressComponents.street || '' },
          { name: "city", value: addressComponents.city || '' },
          { name: "postal_code", value: addressComponents.postalCode || '' }
        ],
        context: {
          pageUri: window.location.href,
          pageName: document.title
        },
        legalConsentOptions: {
          consent: {
            consentToProcess: true,
            text: "I agree to allow Crocodile to store and process my personal data."
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error('Form submission failed');
    }

    toast({
      title: "Erfolgreich gesendet",
      description: "Ihre Daten wurden erfolgreich übermittelt.",
    });
  } catch (error) {
    console.error('Form submission error:', error);
    toast({
      variant: "destructive",
      title: "Fehler",
      description: "Beim Senden der Daten ist ein Fehler aufgetreten.",
    });
    throw error;
  }
};