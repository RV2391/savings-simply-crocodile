import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ResultFormProps {
  onSubmit: (email: string, practiceName: string) => Promise<void>;
}

declare global {
  interface Window {
    hbspt: any;
  }
}

export const ResultForm = ({ onSubmit }: ResultFormProps) => {
  const [email, setEmail] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [consent, setConsent] = useState(false);
  const { toast } = useToast();
  const [isHubSpotLoaded, setIsHubSpotLoaded] = useState(false);
  const hubspotFormRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let formCreated = false;

    const initHubSpotForm = () => {
      if (window.hbspt && !formCreated && hubspotFormRef.current) {
        formCreated = true;
        window.hbspt.forms.create({
          region: "eu1",
          portalId: "24951213",
          formId: "dc947922-514a-4e3f-b172-a3fbf38920a0",
          target: "#hubspot-form-container",
          onFormReady: () => {
            console.log("HubSpot form ready");
            setIsHubSpotLoaded(true);
          },
          onFormSubmitted: () => {
            console.log("HubSpot form submitted successfully");
          }
        });
      }
    };

    // Load HubSpot script
    const script = document.createElement('script');
    script.src = "//js-eu1.hsforms.net/forms/embed/v2.js";
    script.async = true;
    script.onload = () => {
      console.log("HubSpot script loaded");
      initHubSpotForm();
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      formCreated = false;
    };
  }, []);

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
      // Find the HubSpot form
      const hubspotForm = document.querySelector<HTMLFormElement>('.hs-form');
      if (!hubspotForm) {
        console.error('HubSpot form not found in DOM');
        throw new Error('HubSpot form not found');
      }

      // Get the email and consent inputs
      const emailInput = hubspotForm.querySelector<HTMLInputElement>('input[name="email"]');
      const consentInput = hubspotForm.querySelector<HTMLInputElement>('input[name="LEGAL_CONSENT.subscription_type_10947229"]');

      if (!emailInput || !consentInput) {
        console.error('Required HubSpot form fields not found', { emailInput, consentInput });
        throw new Error('Required HubSpot form fields not found');
      }

      // Set values
      emailInput.value = email;
      consentInput.checked = consent;

      // Submit HubSpot form
      const submitButton = hubspotForm.querySelector<HTMLInputElement>('input[type="submit"]');
      if (!submitButton) {
        console.error('HubSpot submit button not found');
        throw new Error('HubSpot submit button not found');
      }

      // Submit to Make webhook first
      await onSubmit(email, practiceName);

      // Then trigger HubSpot submission
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse*</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary border-input"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="practiceName">Name der Praxis*</Label>
                <Input
                  id="practiceName"
                  type="text"
                  value={practiceName}
                  onChange={(e) => setPracticeName(e.target.value)}
                  required
                  className="bg-secondary border-input"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex items-start space-x-3 pt-4">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked as boolean)}
                  className="mt-1"
                  disabled={isSubmitting}
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed">
                  Ja, ich möchte regelmäßig Neuigkeiten und Informationen zu Angeboten erhalten und stimme der Zusendung der angeforderten Inhalte zu.*<br /><br />
                  Sie können diese Benachrichtigungen jederzeit abbestellen. Weitere Informationen zum Abbestellen und zu unseren Datenschutzverfahren, finden Sie in unserer{" "}
                  <a 
                    href="https://www.crocodile-health.com/datenschutz" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Datenschutzvereinbarung
                  </a>
                  .<br /><br />
                  Indem Sie auf „Anmelden" klicken, stimmen Sie zu, dass Crocodile Health GmbH die oben angegebenen persönlichen Daten speichert und verarbeitet, um Ihnen die angeforderten Inhalte bereitzustellen.
                </Label>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !isHubSpotLoaded}>
              {isSubmitting ? "Wird gesendet..." : "Anmelden"}
            </Button>
          </form>
          
          {/* HubSpot form container */}
          <div id="hubspot-form-container" ref={hubspotFormRef} style={{ display: 'none' }} />
        </div>
      </div>
    </motion.div>
  );
};