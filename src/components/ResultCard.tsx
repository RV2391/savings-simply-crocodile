import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/calculations";
import type { CalculationResults } from "@/utils/calculations";
import { HubspotForm } from "./HubspotForm";
import { ArrowDown } from "lucide-react";

interface ResultCardProps {
  results: CalculationResults;
}

export const ResultCard = ({ results }: ResultCardProps) => {
  const [showForm, setShowForm] = useState(false);
  const savingsColor = results.savings > 0 ? "text-green-500" : "text-primary";

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
            <HubspotForm 
              results={results} 
              onSuccess={() => setShowForm(false)}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};
