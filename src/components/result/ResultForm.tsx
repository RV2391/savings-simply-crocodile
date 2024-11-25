import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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

  const isTestMode = new URLSearchParams(window.location.search).get('test') === 'true';
  const debugMode = new URLSearchParams(window.location.search).get('debug') === 'true';

  useEffect(() => {
    if (isTestMode) return;

    const formContainer = document.getElementById('hubspot-form-container');
    if (!formContainer) return;

    formContainer.innerHTML = '';

    try {
      window.hbspt.forms.create({
        region: "eu1",
        portalId: "24951213",
        formId: "dc947922-514a-4e3f-b172-a3fbf38920a0",
        target: "#hubspot-form-container",
        onFormReady: () => {
          console.log('HubSpot form ready');
          // Hide the HubSpot form's submit button as we'll use our own
          const hubspotForm = document.querySelector('.hs-form');
          if (hubspotForm) {
            const submitBtn = hubspotForm.querySelector('.hs-button');
            if (submitBtn) {
              (submitBtn as HTMLElement).style.display = 'none';
            }
          }
        },
        onFormSubmitted: () => {
          toast({
            title: "Erfolg!",
            description: "Bitte bestätigen Sie Ihre E-Mail-Adresse über den Link, den wir Ihnen zugesendet haben.",
          });
        },
      });
    } catch (err) {
      console.error("Error creating HubSpot form:", err);
    }

    return () => {
      if (formContainer) {
        formContainer.innerHTML = '';
      }
    };
  }, [toast, isTestMode]);

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
      // 1. First send data to Make webhook
      await onSubmit(email, practiceName);
      
      if (isTestMode && !debugMode) {
        toast({
          title: "Test-Modus",
          description: "Formular erfolgreich getestet - keine HubSpot-Integration ausgeführt",
        });
        setIsSubmitting(false);
        return;
      }

      // 2. Then handle HubSpot form submission
      const hubspotForm = document.querySelector<HTMLFormElement>('.hs-form');
      if (!hubspotForm) {
        throw new Error('HubSpot form not found in DOM');
      }

      // Find and fill all HubSpot form fields
      const inputs = hubspotForm.querySelectorAll('input');
      inputs.forEach(input => {
        if (input.name === 'email') {
          input.value = email;
        }
        if (input.name === 'LEGAL_CONSENT.subscription_type_10947229') {
          input.checked = consent;
        }
      });

      // Trigger form submission
      const formData = new FormData(hubspotForm);
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      hubspotForm.dispatchEvent(submitEvent);

      // Clear form
      setEmail("");
      setPracticeName("");
      setConsent(false);
      
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Wird gesendet..." : "Anmelden"}
            </Button>
          </form>
          
          <div 
            id="hubspot-form-container" 
            className="hidden"
          />
        </div>
      </div>
    </motion.div>
  );
};