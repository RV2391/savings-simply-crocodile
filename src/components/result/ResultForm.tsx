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
  const [isHubSpotReady, setIsHubSpotReady] = useState(false);
  const { toast } = useToast();

  // Check if we're in test mode
  const isTestMode = new URLSearchParams(window.location.search).get('test') === 'true';
  const debugMode = new URLSearchParams(window.location.search).get('debug') === 'true';

  useEffect(() => {
    if (isTestMode && !debugMode) {
      console.log('Test mode active - HubSpot form integration disabled');
      setIsHubSpotReady(true);
      return;
    }

    const loadHubSpotForm = () => {
      if (typeof window.hbspt === 'undefined') {
        console.log('HubSpot script not yet loaded, retrying...');
        setTimeout(loadHubSpotForm, 500);
        return;
      }

      try {
        console.log('Creating HubSpot form...');
        window.hbspt.forms.create({
          region: "eu1",
          portalId: "24951213",
          formId: "dc947922-514a-4e3f-b172-a3fbf38920a0",
          target: "#hubspot-form-container",
          onFormReady: () => {
            console.log("HubSpot form ready and mounted");
            setIsHubSpotReady(true);
          },
          onFormSubmitted: () => {
            console.log("HubSpot form submitted successfully");
          },
        });
      } catch (err) {
        console.error("Error creating HubSpot form:", err);
      }
    };

    loadHubSpotForm();

    return () => {
      const formContainer = document.getElementById('hubspot-form-container');
      if (formContainer) {
        formContainer.innerHTML = '';
      }
    };
  }, [isTestMode, debugMode]);

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
      await onSubmit(email, practiceName);
      
      if (isTestMode && !debugMode) {
        console.log('Test mode - skipping HubSpot form submission');
        toast({
          title: "Test-Modus",
          description: "Formular erfolgreich getestet - keine HubSpot-Integration ausgeführt",
        });
        setIsSubmitting(false);
        return;
      }

      // HubSpot-Formular ausfüllen
      console.log('Attempting to find HubSpot form...');
      const hubspotForm = document.querySelector<HTMLFormElement>('.hs-form');
      
      if (hubspotForm) {
        console.log('HubSpot form found, attempting to fill and submit...');
        const emailInput = hubspotForm.querySelector<HTMLInputElement>('input[name="email"]');
        const consentInput = hubspotForm.querySelector<HTMLInputElement>('input[name="LEGAL_CONSENT.subscription_type_10947229"]');
        
        if (emailInput && consentInput) {
          console.log('Form fields found, setting values...');
          emailInput.value = email;
          consentInput.checked = consent;
          
          const submitButton = hubspotForm.querySelector<HTMLInputElement>('input[type="submit"]');
          if (submitButton) {
            console.log('Submitting HubSpot form...');
            submitButton.click();
            toast({
              title: "Erfolg!",
              description: "Bitte bestätigen Sie Ihre E-Mail-Adresse über den Link, den wir Ihnen zugesendet haben.",
            });
          } else {
            console.error('Submit button not found in HubSpot form');
            toast({
              variant: "destructive",
              title: "Fehler",
              description: "Submit-Button nicht gefunden",
            });
          }
        } else {
          console.error('Required form fields not found:', {
            emailInput: !!emailInput,
            consentInput: !!consentInput
          });
          toast({
            variant: "destructive",
            title: "Fehler",
            description: "Erforderliche Formularfelder nicht gefunden",
          });
        }
      } else {
        console.error('HubSpot form not found in DOM');
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "HubSpot-Formular nicht gefunden",
        });
      }
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
              disabled={isSubmitting || (!isTestMode && !debugMode && !isHubSpotReady)}
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