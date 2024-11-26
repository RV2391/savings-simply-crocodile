import { useState } from "react";
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
      toast({
        title: "Erfolg!",
        description: "Ihre Berechnung wurde gespeichert und wird an Ihre E-Mail-Adresse gesendet.",
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
        </div>
      </div>
    </motion.div>
  );
};