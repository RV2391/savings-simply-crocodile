import React from "react";
import { Card } from "@/components/ui/card";
import { AddressComponents, CalculatorData, Results } from "@/types";
import { ResultSummary } from "./result/ResultSummary";
import { ResultDetails } from "./result/ResultDetails";

interface ResultCardProps {
  results: Results;
  calculatorData: CalculatorData;
  addressComponents: AddressComponents;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  results,
  calculatorData,
  addressComponents
}) => {
  return (
    <Card className="w-full">
      <div className="p-6">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-white">Ihre Ersparnis</h3>
          
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

          <div className="mt-6 space-y-4 border-t border-gray-700 pt-4">
            <div className="text-sm text-gray-400">
              <h4 className="mb-2 font-medium text-white">So setzt sich Ihr Einsparpotenzial zusammen:</h4>
              <ul className="list-disc pl-4 space-y-2">
                <li>
                  <strong>Fortbildungskosten:</strong> Durch die digitale Bereitstellung der Fortbildungen entfallen die üblichen Kosten von 1.200€ pro Zahnarzt und 280€ pro Assistenzkraft pro Jahr.
                </li>
                {results.nearestInstitute && (
                  <li>
                    <strong>Reisekosten:</strong> Die Anfahrt zum nächstgelegenen Fortbildungsinstitut ({Math.round(results.nearestInstitute.oneWayDistance)} km) entfällt komplett. Bei einer Fahrtkostenpauschale von 0,30€ pro Kilometer bedeutet das eine zusätzliche Ersparnis von {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(results.nearestInstitute.travelCosts)} pro Jahr.
                  </li>
                )}
                <li>
                  <strong>Zeitersparnis:</strong> Keine Anreisezeiten bedeuten mehr Zeit für Ihre Patienten und ein effizienteres Praxismanagement.
                </li>
                <li>
                  <strong>Flexibilität:</strong> Ihre Mitarbeiter können die Fortbildungen flexibel absolvieren, ohne dass der Praxisbetrieb beeinträchtigt wird.
                </li>
              </ul>
            </div>
            <p className="text-xs text-gray-500">
              * Die Berechnung basiert auf durchschnittlichen Fortbildungskosten in Deutschland. Die tatsächlichen Kosten können je nach Region und gewählten Fortbildungsanbietern variieren.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};