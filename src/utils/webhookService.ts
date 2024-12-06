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
  console.log("Sending data to webhook...");
  try {
    const response = await fetch('https://api-eu1.hubapi.com/automation/v4/webhook-triggers/24951213/VnT7Sy8', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
        'Authorization': 'Bearer pat-eu1-0c6c3c6c-9c9e-4b0e-9b9e-9c9e4b0e9b9e'
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
    throw error;
  }
};