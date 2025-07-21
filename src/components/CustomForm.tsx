
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AddressComponents, CalculatorData, Results } from "@/types";
import { FormHeader } from "./form/FormHeader";
import { FormFields } from "./form/FormFields";
import { formatTimeSavingsExplanation } from "./form/TimeSavingsExplanation";
import { useGTMTracking } from "@/hooks/useGTMTracking";

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
  const { trackEvent } = useGTMTracking();

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
    console.log("Processing form submission...");

    try {
      const timeSavingsExplanation = results.timeSavings ? 
        formatTimeSavingsExplanation({ timeSavings: results.timeSavings }) : '';
      
      // GTM Event für Lead-Tracking über Taggrs
      trackEvent({
        event: 'lead_form_submission',
        form_type: 'calculator_results',
        email: email,
        company: companyName,
        team_size: calculatorData.teamSize || 0,
        dentists: calculatorData.dentists || 0,
        assistants: (calculatorData.teamSize || 0) - (calculatorData.dentists || 0),
        traditional_costs: Math.round(Number(results.totalTraditionalCosts)) || 0,
        crocodile_costs: Math.round(Number(results.crocodileCosts)) || 0,
        savings: Math.round(Number(results.savings)) || 0,
        time_savings_hours: Math.round(Number(results.timeSavings?.totalHoursPerYear)) || 0,
        time_savings_value: Math.round(Number(results.timeSavings?.totalMonetaryValue)) || 0,
        time_savings_explanation: timeSavingsExplanation,
        street_address: addressComponents.street || '',
        city: addressComponents.city || '',
        postal_code: addressComponents.postalCode || '',
        page_url: window.location.href,
        page_title: document.title
      });

      console.log("Lead data tracked via GTM/Taggrs:", {
        email,
        companyName,
        calculatorData,
        results,
        addressComponents
      });

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
      <FormHeader 
        title="Ihre persönliche Zeitersparnis-Analyse" 
        description="Erhalten Sie eine detaillierte Analyse Ihrer potentiellen Zeitersparnis durch digitale Fortbildungen."
      />
      
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
          {isSubmitting ? "Wird verarbeitet..." : "Kostenlos anfordern"}
        </Button>
      </form>
    </div>
  );
};
