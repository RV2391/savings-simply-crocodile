import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { AddressComponents, CalculatorData, Results } from "@/types";

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
    console.log("Submitting form data to HubSpot...");

    try {
      const portalId = "139717164";
      const formGuid = "13JR5IlFKTj-xcqP784kgoAeush9";
      
      const response = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          fields: [
            { name: "email", value: email },
            { name: "company", value: companyName },
            { name: "team_size", value: String(calculatorData.teamSize || 0) },
            { name: "dentists", value: String(calculatorData.dentists || 0) },
            { name: "assistants", value: String((calculatorData.teamSize || 0) - (calculatorData.dentists || 0)) },
            { name: "traditional_costs", value: String(Math.round(Number(results.totalTraditionalCosts)) || 0) },
            { name: "crocodile_costs", value: String(Math.round(Number(results.crocodileCosts)) || 0) },
            { name: "savings", value: String(Math.round(Number(results.savings)) || 0) },
            { name: "time_savings_hours", value: String(Math.round(Number(results.timeSavings?.totalHoursPerYear)) || 0) },
            { name: "time_savings_value", value: String(Math.round(Number(results.timeSavings?.totalMonetaryValue)) || 0) },
            { name: "street_address", value: addressComponents.street || '' },
            { name: "city", value: addressComponents.city || '' },
            { name: "postal_code", value: addressComponents.postalCode || '' }
          ],
          context: {
            pageUri: window.location.href,
            pageName: document.title
          },
          legalConsentOptions: {
            consent: {
              consentToProcess: true,
              text: "I agree to allow Crocodile to store and process my personal data."
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Form submission failed');
      }

      const result = await response.json();
      console.log("HubSpot form submission result:", result);

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
      <div className="space-y-4 mb-8">
        <h3 className="text-2xl font-semibold text-white">
          Erhalten Sie Ihre persönliche Berechnung per E-Mail
        </h3>
        <p className="text-lg text-muted-foreground">
          Wir senden Ihnen die detaillierte Auswertung kostenlos zu.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm text-gray-400">
          <li>Detaillierte Zeitersparnis-Analyse für Ihre Praxis</li>
          <li>Personalisierte 5-Jahres-CME-Strategie</li>
          <li>Konkrete Optimierungsvorschläge für Ihr Team</li>
          <li>Individuelle Handlungsempfehlungen</li>
        </ul>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-base text-gray-200">E-Mail-Adresse*</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@email.de"
              required
              className="bg-[#1a1a1a] text-white border-gray-700 h-12 text-base"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="companyName" className="text-base text-gray-200">Name der Praxis*</Label>
            <Input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ihre Praxis"
              required
              className="bg-[#1a1a1a] text-white border-gray-700 h-12 text-base"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex items-start space-x-3 pt-2">
          <Checkbox
            id="consent"
            checked={consent}
            onCheckedChange={(checked) => setConsent(checked as boolean)}
            disabled={isSubmitting}
            className="mt-1.5 border-gray-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label htmlFor="consent" className="text-base leading-relaxed text-gray-300">
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
          className="w-full h-12 mt-8 text-lg font-medium bg-primary hover:bg-primary/90" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Wird gesendet..." : "Kostenlos anfordern"}
        </Button>
      </form>
    </div>
  );
};