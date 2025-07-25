
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AddressComponents, CalculatorData, Results } from "@/types";
import { FormHeader } from "./form/FormHeader";
import { FormFields } from "./form/FormFields";
import { formatTimeSavingsExplanation } from "./form/TimeSavingsExplanation";
import { useGTMTracking } from "@/hooks/useGTMTracking";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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
        description: "Bitte fülle alle Pflichtfelder aus und stimme den Bedingungen zu.",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Processing form submission...");

    try {
      const timeSavingsExplanation = results.timeSavings ? 
        formatTimeSavingsExplanation({ timeSavings: results.timeSavings }) : '';
      
      // IP-Adresse für DSGVO-Compliance ermitteln
      let userIP = '';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        userIP = ipData.ip;
      } catch (error) {
        console.warn('Could not retrieve IP address:', error);
        userIP = 'unknown';
      }

      // DSGVO-konforme Consent-Daten
      const consentTimestamp = new Date().toISOString();
      const consentData = {
        given: consent,
        timestamp: consentTimestamp,
        ip_address: userIP,
        user_agent: navigator.userAgent,
        privacy_policy_version: "2025-01",
        opt_in_method: "calculator_form",
        page_url: window.location.href
      };
      
      // Daten für Make.com Webhook vorbereiten
      const webhookData = {
        email: email,
        company_name: companyName,
        team_size: calculatorData.teamSize || 0,
        dentists: calculatorData.dentists || 0,
        assistants: (calculatorData.teamSize || 0) - (calculatorData.dentists || 0),
        traditional_costs: Math.round(Number(results.totalTraditionalCosts)) || 0,
        crocodile_costs: Math.round(Number(results.crocodileCosts)) || 0,
        savings: Math.round(Number(results.savings)) || 0,
        savings_percentage: Math.round(Number(results.savingsPercentage)) || 0,
        time_savings_hours: Math.round(Number(results.timeSavings?.totalHoursPerYear)) || 0,
        time_savings_value: Math.round(Number(results.timeSavings?.totalMonetaryValue)) || 0,
        time_savings_explanation: timeSavingsExplanation,
        time_savings_breakdown: {
          dentist_hours_per_year: Math.round(Number(results.timeSavings?.dentistHours)) || 0,
          assistant_hours_per_year: Math.round(Number(results.timeSavings?.assistantHours)) || 0,
          travel_hours_saved: Math.round(Number(results.timeSavings?.travelHours)) || 0,
          practice_impact_factor: 0.6,
          weekend_training_rate: 0.5,
          dentist_hourly_cost: 91, // 65€ + 40% Nebenkosten
          assistant_hourly_cost: 22.40, // 16€ + 40% Nebenkosten
          practice_revenue_per_hour: 250,
          data_sources: "VMF Tarifvertrag 2025, ZWP-Online Praxismanagement-Studie 2023, BZÄK Statistiken"
        },
        address: {
          street: addressComponents.street || '',
          city: addressComponents.city || '',
          postal_code: addressComponents.postalCode || ''
        },
        nearest_institute: results.nearestInstitute?.name || '',
        travel_distance: Math.round(Number(results.nearestInstitute?.oneWayDistance)) || 0,
        travel_costs: Math.round(Number(results.nearestInstitute?.travelCosts)) || 0,
        timestamp: consentTimestamp,
        source: 'Calculator Form',
        page_url: window.location.href,
        consent: consentData
      };

      // Send to secure Supabase Edge Function
      console.log("Sending data to secure webhook:", webhookData);
      
      const { data, error } = await supabase.functions.invoke('secure-webhook', {
        body: webhookData
      });

      if (error) {
        throw new Error(`Secure webhook failed: ${error.message}`);
      }

      console.log("Secure webhook sent successfully:", data);

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

      console.log("Lead data tracked via GTM/Taggrs and sent to Make.com:", {
        email,
        companyName,
        calculatorData,
        results,
        addressComponents
      });

      toast({
        title: "Erfolgreich gesendet",
        description: "Deine Daten wurden erfolgreich übermittelt. Du erhältst in ca. 30 Sekunden eine E-Mail mit deiner detaillierten Zeitersparnis-Aufschlüsselung.",
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
          description: "Beim Senden der Daten ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#2a2a2a] p-8 rounded-2xl shadow-lg mt-8">
      <FormHeader 
        title="Deine persönliche Zeitersparnis-Analyse anfordern" 
        description="Erhalte eine detaillierte Aufschlüsselung deiner Zeitersparnis und Kostenoptimierung per E-Mail - basierend auf deinen Eingaben und aktuellen Marktdaten."
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

        {isSubmitting && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Deine E-Mail wird individuell erstellt...</strong><br />
                  Dies dauert ca. 30 Sekunden. Du erhältst eine Benachrichtigung, sobald deine persönliche Analyse bereit ist.
                </p>
              </div>
            </div>
          </div>
        )}

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
