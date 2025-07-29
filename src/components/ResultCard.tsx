
import React from "react";
import { Card } from "@/components/ui/card";
import { AddressComponents, CalculatorData, Results } from "@/types";
import { ExtendedTimeSavings } from "@/utils/calculations/extendedTimeSavingsCalculations";
import { ResultSummary } from "./result/ResultSummary";
import { ResultDetails } from "./result/ResultDetails";
import { TimeSavingsBreakdown } from "./result/TimeSavingsBreakdown";
import { CustomForm } from "./CustomForm";

// Extended results interface
interface ExtendedResults extends Results {
  extendedTimeSavings?: ExtendedTimeSavings;
}

interface ResultCardProps {
  results: ExtendedResults;
  calculatorData: CalculatorData;
  addressComponents: AddressComponents;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  results,
  calculatorData,
  addressComponents
}) => {
  return (
    <div className="space-y-6">
      <Card className="w-full bg-[#2a2a2a] border-gray-700">
        <div className="p-6">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-white">Deine Ersparnis</h3>
            
            <ResultSummary 
              savings={results.savings}
              savingsPercentage={results.savingsPercentage}
              totalTraditionalCosts={results.totalTraditionalCosts}
              crocodileCosts={results.crocodileCosts}
            />

            {/* CTA Button direkt nach der Hauptersparnis */}
            <div className="text-center py-4">
              <button
                onClick={() => {
                  const formElement = document.getElementById('detailed-analysis-form');
                  if (formElement) {
                    formElement.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                    setTimeout(() => {
                      const emailInput = document.querySelector('#email');
                      if (emailInput) {
                        (emailInput as HTMLInputElement).focus();
                      }
                    }, 500);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-lg"
              >
                🔍 Jetzt detaillierte Analyse anfordern
              </button>
              <p className="text-sm text-gray-400 mt-2">
                Kostenlos per E-Mail erhalten
              </p>
            </div>

            <ResultDetails 
              traditionalCostsDentists={results.traditionalCostsDentists}
              traditionalCostsAssistants={results.traditionalCostsAssistants}
              nearestInstitute={results.nearestInstitute}
              timeSavings={results.timeSavings}
            />

            <div className="mt-6 space-y-4 border-t border-gray-700 pt-4">
              <div className="text-sm text-gray-300">
                <h4 className="mb-2 font-medium text-white">So setzt sich dein Einsparpotenzial zusammen:</h4>
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
                    <strong>Zeitersparnis:</strong> Keine Anreisezeiten bedeuten mehr Zeit für deine Patienten und ein effizienteres Praxismanagement.
                  </li>
                  <li>
                    <strong>Flexibilität:</strong> Deine Mitarbeiter können die Fortbildungen flexibel absolvieren, ohne dass der Praxisbetrieb beeinträchtigt wird.
                  </li>
                </ul>
              </div>
              <p className="text-xs text-gray-400">
                * Die Berechnung basiert auf durchschnittlichen Fortbildungskosten in Deutschland. Die tatsächlichen Kosten können je nach Region und gewählten Fortbildungsanbietern variieren.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Extended Time Savings Analysis */}
      {results.extendedTimeSavings && (
        <TimeSavingsBreakdown extendedTimeSavings={results.extendedTimeSavings} />
      )}

      {/* Contact Form */}
      <CustomForm 
        calculatorData={calculatorData}
        results={results}
        addressComponents={addressComponents}
      />
    </div>
  );
};
