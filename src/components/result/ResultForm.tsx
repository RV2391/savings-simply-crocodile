import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Remove any existing HubSpot form script
    const existingScript = document.querySelector('script[src*="hsforms"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Initialize HubSpot form
    const script = document.createElement('script');
    script.src = "//js-eu1.hsforms.net/forms/embed/v2.js";
    script.charset = "utf-8";
    script.type = "text/javascript";
    
    script.onload = () => {
      if (window.hbspt) {
        window.hbspt.forms.create({
          region: "eu1",
          portalId: "24951213",
          formId: "dc947922-514a-4e3f-b172-a3fbf38920a0",
          target: "#hidden-hubspot-form",
          onFormReady: () => {
            setIsHubSpotLoaded(true);
          }
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      });
      return;
    }

    try {
      // Find the HubSpot form
      const hubspotForm = document.querySelector<HTMLFormElement>('.hs-form');
      
      if (!hubspotForm) {
        throw new Error('HubSpot form not found');
      }

      // Set the values in HubSpot form
      const emailInput = hubspotForm.querySelector<HTMLInputElement>('input[name="email"]');
      const optInInput = hubspotForm.querySelector<HTMLInputElement>('input[name="LEGAL_CONSENT.subscription_type_10947229"]');
      
      if (!emailInput || !optInInput) {
        throw new Error('Required HubSpot form fields not found');
      }

      // Set the values
      emailInput.value = email;
      optInInput.checked = consent;

      // Submit to HubSpot
      const submitButton = hubspotForm.querySelector<HTMLInputElement>('input[type="submit"]');
      if (submitButton) {
        submitButton.click();
      }

      // Submit to Make webhook
      await onSubmit(email, practiceName);
      
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
                />
              </div>
              <div className="flex items-start space-x-3 pt-4">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked as boolean)}
                  className="mt-1"
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
            <Button type="submit" className="w-full">
              Anmelden
            </Button>
          </form>
          
          {/* Hidden HubSpot form container */}
          <div id="hidden-hubspot-form" style={{ display: 'none' }} />
        </div>
      </div>
    </motion.div>
  );
};