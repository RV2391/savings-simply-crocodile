import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AddressComponents, CalculatorData, Results } from "@/types";

interface ResultCardProps {
  results: Results;
  calculatorData: CalculatorData;
  addressComponents: AddressComponents;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  calculatorData,
  results,
  addressComponents,
}) => {
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
      // 1. Send data to webhook
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

      // 2. Submit to HubSpot Forms API
      const portalId = "139717164";
      const formGuid = "0a89fc12-4f48-4f4c-9c21-d0bbb34f82f4";
      
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
    <Card className="p-6 bg-card">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Erhalten Sie Ihre persönliche Berechnung per E-Mail
          </h3>
          <p className="text-muted-foreground">
            Wir senden Ihnen die detaillierte Auswertung kostenlos zu.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse*</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="ihre@email.de"
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
              disabled={isSubmitting}
              placeholder="Ihre Praxis GmbH"
            />
          </div>

          <div className="flex items-start space-x-3 pt-4">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked as boolean)}
              disabled={isSubmitting}
            />
            <Label htmlFor="consent" className="text-sm leading-relaxed">
              Ja, ich möchte regelmäßig Neuigkeiten und Informationen zu Angeboten erhalten und stimme der Zusendung der angeforderten Inhalte zu.*
              <br /><br />
              Sie können diese Benachrichtigungen jederzeit abbestellen. Weitere Informationen zum Abbestellen und zu unseren Datenschutzverfahren, finden Sie in unserer{" "}
              <a 
                href="https://www.crocodile-health.com/datenschutz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Datenschutzvereinbarung
              </a>
              .
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Wird gesendet..." : "Anmelden"}
          </Button>
        </form>
      </div>
    </Card>
  );
};