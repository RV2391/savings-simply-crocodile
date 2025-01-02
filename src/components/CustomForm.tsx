import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AddressComponents, CalculatorData, Results } from "@/types";
import { FormHeader } from "./form/FormHeader";
import { FormFields } from "./form/FormFields";
import { formatTimeSavingsExplanation } from "./form/TimeSavingsExplanation";

interface CustomFormProps {
  calculatorData: CalculatorData;
  results: Results;
  addressComponents: AddressComponents;
}

export const CustomForm = ({
  calculatorData,
  results,
  addressComponents
}: CustomFormProps) => {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !companyName || !consent) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus und stimmen Sie den Bedingungen zu.",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting form data to HubSpot...");

    try {
      const portalId = "139717164";
      const formGuid = "13JR5IlFKTj-xcqP784kgoAeush9";
      
      const timeSavingsExplanation = results.timeSavings ? 
        formatTimeSavingsExplanation({ timeSavings: results.timeSavings }) : '';
      
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
            { name: "time_savings_hours", value: String(Math.round(Number(results.timeSavings?.totalHoursPerYear)) || 0) },
            { name: "time_savings_value", value: String(Math.round(Number(results.timeSavings?.totalMonetaryValue)) || 0) },
            { name: "time_savings_explanation", value: timeSavingsExplanation },
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

      const result = await response.json();
      console.log("HubSpot form submission result:", result);

      toast({
        title: "Erfolgreich gesendet",
        description: "Ihre Daten wurden erfolgreich übermittelt. Sie erhalten in Kürze eine E-Mail mit Ihrer persönlichen Zeitersparnis-Analyse und 5-Jahres-CME-Strategie.",
      });

      // Reset form
      setEmail("");
      setCompanyName("");
      setConsent(false);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Beim Senden der Daten ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#2a2a2a] p-8 rounded-2xl shadow-lg mt-8">
      <FormHeader />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormFields
          email={email}
          setEmail={setEmail}
          companyName={companyName}
          setCompanyName={setCompanyName}
          consent={consent}
          setConsent={setConsent}
          isSubmitting={isSubmitting}
        />

        <Button 
          type="submit" 
          className="w-full h-12 mt-8 text-lg font-medium bg-primary hover:bg-primary/90" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Wird gesendet..." : "Kostenlos anfordern"}
        </Button>
      </form>
    </div>
  );
};