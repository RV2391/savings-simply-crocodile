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

  const isTestMode = new URLSearchParams(window.location.search).get('test') === 'true';
  const debugMode = new URLSearchParams(window.location.search).get('debug') === 'true';

  useEffect(() => {
    if (isTestMode && !debugMode) {
      setIsHubSpotReady(true);
      return;
    }

    const formContainer = document.getElementById('hubspot-form-container');
    if (!formContainer) return;

    // Clear any existing content
    formContainer.innerHTML = '';

    let retryCount = 0;
    const maxRetries = 20;
    const retryInterval = 2000; // 2 seconds

    const initHubSpotForm = () => {
      console.log(`Attempting to initialize HubSpot form (attempt ${retryCount + 1}/${maxRetries})`);
      
      if (typeof window.hbspt === 'undefined') {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initHubSpotForm, retryInterval);
        } else {
          console.error('HubSpot script failed to load after maximum retries');
          setIsHubSpotReady(true); // Allow form submission even if HubSpot fails
        }
        return;
      }

      try {
        window.hbspt.forms.create({
          region: "eu1",
          portalId: "24951213",
          formId: "dc947922-514a-4e3f-b172-a3fbf38920a0",
          target: "#hubspot-form-container",
          onFormReady: () => {
            console.log('HubSpot form successfully created and ready');
            setIsHubSpotReady(true);
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
        setIsHubSpotReady(true);
      }
    };

    // Initial delay before first attempt
    console.log('Starting HubSpot form initialization with delay');
    setTimeout(initHubSpotForm, 1000);

    return () => {
      if (formContainer) {
        formContainer.innerHTML = '';
      }
    };
  }, [isTestMode, debugMode, toast]);

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
        toast({
          title: "Test-Modus",
          description: "Formular erfolgreich getestet - keine HubSpot-Integration ausgeführt",
        });
        setIsSubmitting(false);
        return;
      }

      const hubspotForm = document.querySelector<HTMLFormElement>('.hs-form');
      if (!hubspotForm) {
        throw new Error('HubSpot form not found in DOM');
      }

      const emailInput = hubspotForm.querySelector<HTMLInputElement>('input[name="email"]');
      const consentInput = hubspotForm.querySelector<HTMLInputElement>('input[name="LEGAL_CONSENT.subscription_type_10947229"]');
      
      if (!emailInput || !consentInput) {
        throw new Error('Required form fields not found');
      }

      emailInput.value = email;
      consentInput.checked = consent;
      
      const submitButton = hubspotForm.querySelector<HTMLInputElement>('input[type="submit"]');
      if (!submitButton) {
        throw new Error('Submit button not found in HubSpot form');
      }

      submitButton.click();
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
          
          <div 
            id="hubspot-form-container" 
            style={{ 
              position: 'absolute',
              left: '-9999px',
              top: '-9999px',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
              visibility: 'hidden',
              pointerEvents: 'none',
              opacity: 0,
              zIndex: -1
            }} 
          />
        </div>
      </div>
    </motion.div>
  );
};