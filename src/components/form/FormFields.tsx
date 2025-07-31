
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface FormFieldsProps {
  email: string;
  setEmail: (value: string) => void;
  companyName: string;
  setCompanyName: (value: string) => void;
  consent: boolean;
  setConsent: (checked: boolean) => void;
  isSubmitting: boolean;
}

export const FormFields = ({
  email,
  setEmail,
  companyName,
  setCompanyName,
  consent,
  setConsent,
  isSubmitting,
}: FormFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2.5">
          <Label htmlFor="email" className="text-base text-gray-200">E-Mail-Adresse*</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine@email.de"
            required
            className="bg-input text-foreground border-border h-12 text-base"
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
            placeholder="Deine Praxis"
            required
            className="bg-input text-foreground border-border h-12 text-base"
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
          Ich bin damit einverstanden, dass meine Daten (einschließlich E-Mail, Firmenname, Praxisdaten und IP-Adresse) zur Erstellung einer personalisierten Zeitersparnis-Analyse verarbeitet werden. Die Daten werden ausschließlich für diesen Zweck genutzt, DSGVO-konform gespeichert und nicht an Dritte weitergegeben.*
          <br /><br />
          Ich möchte regelmäßig Neuigkeiten und Informationen zu Angeboten erhalten. Du kannst diese Benachrichtigungen jederzeit abbestellen. Weitere Informationen zum Abbestellen und zu unseren Datenschutzverfahren, findest du in unserer{" "}
          <a 
            href="https://www.crocodile.de/datenschutz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Datenschutzvereinbarung
          </a>
          .
        </Label>
      </div>
    </div>
  );
};
