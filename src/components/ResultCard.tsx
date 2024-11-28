import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { CalculationResults } from "@/utils/calculations";
import { ResultSummary } from "./result/ResultSummary";
import { ResultDetails } from "./result/ResultDetails";
import { ResultForm } from "./result/ResultForm";

interface ResultCardProps {
  results: CalculationResults;
}

export const ResultCard = ({ results }: ResultCardProps) => {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (email: string, practiceName: string) => {
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
      timestamp: new Date().toISOString(),
      utm_medium: 'kalkulator',
      utm_campaign: 'cyberdeal',
      utm_term: 'november24'
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
        console.error('Webhook error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      if (responseData && responseData.success) {
        toast({
          title: "Erfolg!",
          description: "Ihre Berechnung wurde gespeichert und wird an Ihre E-Mail-Adresse gesendet.",
        });
        setShowForm(false);
      } else {
        throw new Error('Webhook response indicated failure');
      }
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="rounded-2xl bg-[#2a2a2a] p-6 shadow-lg">
          <ResultSummary
            savings={results.savings}
            savingsPercentage={results.savingsPercentage}
            totalTraditionalCosts={results.totalTraditionalCosts}
            crocodileCosts={results.crocodileCosts}
          />

          <ResultDetails
            traditionalCostsDentists={results.traditionalCostsDentists}
            traditionalCostsAssistants={results.traditionalCostsAssistants}
            nearestInstitute={results.nearestInstitute}
          />

          <div className="mt-6">
            <Button
              onClick={() => setShowForm(true)}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              Ergebnisse per E-Mail erhalten
            </Button>
          </div>
        </div>
      </motion.div>

      {showForm && <ResultForm onSubmit={handleFormSubmit} />}
    </div>
  );
};