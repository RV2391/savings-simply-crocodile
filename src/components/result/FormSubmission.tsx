import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { FormFields } from "./FormFields";

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
  const [email, setEmail] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !practiceName || !consent) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus und stimmen Sie den Bedingungen zu.",
      });
      return;
    }

    setIsSubmitting(true);

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

      const webhookResponse = await fetch('https://hook.eu2.make.com/14ebulh267s1rzskv00n7ho0q98sdxmj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      const portalId = "139717164";
      const formGuid = "13JR5IlFKTj-xcqP784kgoAeush9";
      
      const hubspotFormData = {
        fields: [
          {
            name: "email",
            value: email
          },
          {
            name: "company",
            value: practiceName
          }
        ],
        context: {
          pageUri: window.location.href,
          pageName: "Kostenkalkulator"
        },
        legalConsentOptions: {
          consent: {
            consentToProcess: true,
            text: "Ich stimme der Verarbeitung meiner Daten zu",
            communications: [
              {
                value: true,
                subscriptionTypeId: 999,
                text: "Ich stimme dem Erhalt von Marketing E-Mails zu"
              }
            ]
          }
        }
      };

      const hubspotResponse = await fetch(
        `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(hubspotFormData)
        }
      );

      if (webhookResponse.ok && hubspotResponse.ok) {
        toast({
          title: "Erfolg!",
          description: "Ihre Berechnung wurde gespeichert und wird an Ihre E-Mail-Adresse gesendet.",
        });
        setEmail("");
        setPracticeName("");
        setConsent(false);
      } else {
        throw new Error('Fehler beim Senden der Daten');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error instanceof Error ? error.message : "Ein unerwarteter Fehler ist aufgetreten",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormFields
        email={email}
        setEmail={setEmail}
        practiceName={practiceName}
        setPracticeName={setPracticeName}
        consent={consent}
        setConsent={setConsent}
        isSubmitting={isSubmitting}
      />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Wird gesendet..." : "Anmelden"}
      </Button>
    </form>
  );
};
