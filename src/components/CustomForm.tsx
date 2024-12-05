import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { AddressComponents, CalculatorData, Results } from "@/types";
import { sendWebhookData } from "@/utils/webhookService";

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
    console.log("Submitting form data...");

    try {
      await sendWebhookData({
        email,
        companyName,
        calculatorData,
        results,
        addressComponents
      });

      toast({
        title: "Erfolgreich gesendet",
        description: "Ihre Daten wurden erfolgreich übermittelt. Bitte überprüfen Sie Ihre E-Mails für die Bestätigung.",
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
    <div className="w-full bg-[#2a2a2a] p-6 rounded-2xl shadow-lg mt-8">
      <h3 className="text-lg font-semibold text-white mb-2">
        Erhalten Sie Ihre persönliche Berechnung per E-Mail
      </h3>
      <p className="text-muted-foreground mb-6">
        Wir senden Ihnen die detaillierte Auswertung kostenlos zu.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail-Adresse*</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ihre@email.de"
            required
            className="bg-[#1a1a1a] text-white border-gray-700"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">Name der Praxis*</Label>
          <Input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Ihre Praxis"
            required
            className="bg-[#1a1a1a] text-white border-gray-700"
            disabled={isSubmitting}
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
          className="w-full mt-6" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Wird gesendet..." : "Kostenlos anfordern"}
        </Button>
      </form>
    </div>
  );
};