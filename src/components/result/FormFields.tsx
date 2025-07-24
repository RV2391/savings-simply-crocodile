import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface FormFieldsProps {
  email: string;
  setEmail: (value: string) => void;
  practiceName: string;
  setPracticeName: (value: string) => void;
  consent: boolean;
  setConsent: (value: boolean) => void;
  isSubmitting: boolean;
}

export const FormFields = ({
  email,
  setEmail,
  practiceName,
  setPracticeName,
  consent,
  setConsent,
  isSubmitting,
}: FormFieldsProps) => {
  return (
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
          Ja, ich möchte regelmäßig Neuigkeiten und Informationen zu Angeboten erhalten und stimme der Zusendung der angeforderten Inhalte zu.*
          <br /><br />
          Du kannst diese Benachrichtigungen jederzeit abbestellen. Weitere Informationen zum Abbestellen und zu unseren Datenschutzverfahren, findest du in unserer{" "}
          <a 
            href="https://www.crocodile.com/datenschutz" 
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