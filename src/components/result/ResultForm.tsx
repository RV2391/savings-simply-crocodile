import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useHubspotForm } from "@/hooks/useHubspotForm";
import { FormFields } from "./FormFields";

interface ResultFormProps {
  onSubmit: (email: string, practiceName: string) => Promise<void>;
}

export const ResultForm = ({ onSubmit }: ResultFormProps) => {
  const [email, setEmail] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { isLoaded, error } = useHubspotForm({
    portalId: "24951213",
    formId: "dc947922-514a-4e3f-b172-a3fbf38920a0",
    target: "#hubspot-form-container",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!email || !practiceName || !consent) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus und stimmen Sie den Bedingungen zu.",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First submit to Make webhook
      await onSubmit(email, practiceName);

      // Then submit HubSpot form
      const hubspotForm = document.querySelector<HTMLFormElement>('.hs-form');
      if (!hubspotForm) {
        throw new Error('HubSpot form not found');
      }

      const emailInput = hubspotForm.querySelector<HTMLInputElement>('input[name="email"]');
      const consentInput = hubspotForm.querySelector<HTMLInputElement>('input[name="LEGAL_CONSENT.subscription_type_10947229"]');
      
      if (!emailInput || !consentInput) {
        throw new Error('Required HubSpot form fields not found');
      }

      emailInput.value = email;
      consentInput.checked = consent;

      const submitButton = hubspotForm.querySelector<HTMLInputElement>('input[type="submit"]');
      if (!submitButton) {
        throw new Error('HubSpot submit button not found');
      }

      submitButton.click();
      
      toast({
        title: "Erfolg!",
        description: "Bitte bestätigen Sie Ihre E-Mail-Adresse über den Link, den wir Ihnen zugesendet haben.",
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Beim Senden der Daten ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    console.error('HubSpot form error:', error);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto mt-6"
    >
      <div className="p-1 rounded-2xl bg-gradient-to-r from-primary/50 via-primary to-primary/50">
        <div className="bg-card p-6 rounded-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              disabled={isSubmitting || !isLoaded}
            >
              {isSubmitting ? "Wird gesendet..." : "Anmelden"}
            </Button>
          </form>
          
          <div id="hubspot-form-container" style={{ display: 'none' }} />
        </div>
      </div>
    </motion.div>
  );
};