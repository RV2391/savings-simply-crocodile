import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/utils/calculations";
import type { CalculationResults } from "@/utils/calculations";
import { ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResultCardProps {
  results: CalculationResults;
}

export const ResultCard = ({ results }: ResultCardProps) => {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [consent, setConsent] = useState(false);
  const { toast } = useToast();
  const savingsColor = results.savings > 0 ? "text-green-500" : "text-primary";

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

    const calculatorData = JSON.parse(sessionStorage.getItem('calculatorData') || '{}');
    const addressComponents = JSON.parse(sessionStorage.getItem('addressComponents') || '{}');

    const webhookData = {
      email,
      practice_name: practiceName,
      team_size: Number(calculatorData.teamSize) || 0,
      dentists: Number(calculatorData.dentists) || 0,
      assistants: (Number(calculatorData.teamSize) || 0) - (Number(calculatorData.dentists) || 0),
      traditional_costs: Number(results.totalTraditionalCosts) || 0,
      crocodile_costs: Number(results.crocodileCosts) || 0,
      savings: Number(results.savings) || 0,
      street_address: addressComponents.street || '',
      city: addressComponents.city || '',
      postal_code: addressComponents.postalCode || '',
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('https://hook.eu2.make.com/14ebulh267s1rzskv00n7ho0q98sdxmj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Erfolg!",
        description: "Ihre Berechnung wurde gespeichert und wird an Ihre E-Mail-Adresse gesendet.",
      });
      setShowForm(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Beim Senden der Daten ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="rounded-2xl bg-[#2a2a2a] p-6 shadow-lg">
          <div className="text-center">
            <span className="text-sm font-medium text-gray-400">Jährliches Einsparpotenzial</span>
            <h2 className={`mt-1 text-4xl font-bold ${savingsColor}`}>
              {formatCurrency(results.savings)}
            </h2>
            <span className={`mt-1 text-lg font-semibold ${results.savingsPercentage > 0 ? "text-green-500" : "text-gray-400"}`}>
              {results.savingsPercentage?.toFixed(1)}% Ersparnis
            </span>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Bisherige geschätzte Kosten*</span>
              <span className="font-medium text-white">
                {formatCurrency(results.totalTraditionalCosts)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Crocodile Kosten</span>
              <span className="font-medium text-white">
                {formatCurrency(results.crocodileCosts)}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="text-xs text-gray-500">Aufschlüsselung bisheriger geschätzter Kosten:</div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Zahnärzte</span>
              <span className="font-medium text-white">
                {formatCurrency(results.traditionalCostsDentists)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Assistenzkräfte</span>
              <span className="font-medium text-white">
                {formatCurrency(results.traditionalCostsAssistants)}
              </span>
            </div>
            {results.nearestInstitute && (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Reisekosten (0,30€/km)*</span>
                  <span className="font-medium text-white">
                    {formatCurrency(results.nearestInstitute.travelCosts)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  ({Math.round(results.nearestInstitute.distance)}km × 0,30€ × {results.traditionalCostsDentists / 1200} Zahnärzte + 
                  {Math.round(results.nearestInstitute.distance)}km × 0,30€ × {Math.ceil((results.traditionalCostsAssistants / 280) / 5)} Fahrgemeinschaften)
                </div>
              </div>
            )}
          </div>

          {results.nearestInstitute && (
            <div className="mt-6 space-y-2 border-t border-gray-700 pt-4">
              <div className="text-xs text-gray-500">Nächstgelegenes Fortbildungsinstitut:</div>
              <div className="space-y-2 text-sm">
                <div className="font-medium text-white">{results.nearestInstitute.name}</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entfernung (einfach)</span>
                    <span className="font-medium text-white">{Math.round(results.nearestInstitute.oneWayDistance)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entfernung (Hin- und Rückfahrt)</span>
                    <span className="font-medium text-white">{Math.round(results.nearestInstitute.distance)} km</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fahrzeit (einfach)</span>
                    <span className="font-medium text-white">{Math.round(results.nearestInstitute.oneWayTravelTime)} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fahrzeit (Hin- und Rückfahrt)</span>
                    <span className="font-medium text-white">{Math.round(results.nearestInstitute.travelTime)} min</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={() => setShowForm(true)}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              Ergebnisse per E-Mail erhalten
            </Button>
            {!showForm && (
              <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg animate-pulse">
                <p className="text-sm text-white/90 flex items-center justify-center gap-2">
                  Klicken Sie den Button um das Formular anzuzeigen
                  <ArrowDown className="w-4 h-4 animate-bounce" />
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showForm && (
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
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};