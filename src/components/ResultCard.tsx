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
      <Card className="w-full bg-card border shadow-lg">
        <div className="p-6">
          <div className="space-y-4">
            <h3 className="font-montserrat text-2xl font-semibold text-card-foreground">Deine Ersparnis</h3>
            
            <ResultSummary 
              savings={results.savings}
              savingsPercentage={results.savingsPercentage}
              totalTraditionalCosts={results.totalTraditionalCosts}
              optimizedCosts={results.optimizedCosts}
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
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-lg font-montserrat"
              >
                Jetzt detaillierte Analyse anfordern
              </button>
              <p className="text-sm text-muted-foreground mt-2 font-roboto">
                Kostenlos per E-Mail erhalten
              </p>
            </div>

            <ResultDetails 
              traditionalCostsDentists={results.traditionalCostsDentists}
              traditionalCostsAssistants={results.traditionalCostsAssistants}
              nearestInstitute={results.nearestInstitute}
              timeSavings={results.timeSavings}
            />

            <div className="mt-6 space-y-4 border-t border-border pt-4">
              <div className="text-sm text-muted-foreground font-roboto">
                <h4 className="mb-2 font-montserrat font-medium text-card-foreground">So setzt sich dein Einsparpotenzial zusammen:</h4>
                <ul className="list-disc pl-4 space-y-2">
                  <li>
                    <strong>Kostenlose Kurse (30%):</strong> Über KursRadar findest du gesponserte Webinare und kostenfreie Fortbildungen, die du bei der Suche auf einzelnen Websites oft übersiehst.
                  </li>
                  <li>
                    <strong>Preisoptimierung (15%):</strong> Durch den transparenten Preisvergleich findest du günstigere Alternativen für die gleichen Inhalte.
                  </li>
                  {results.nearestInstitute && (
                    <li>
                      <strong>Reisekosten:</strong> Durch mehr Online-Optionen reduzierst du Fahrten zum nächstgelegenen Institut ({Math.round(results.nearestInstitute.oneWayDistance)} km).
                    </li>
                  )}
                  <li>
                    <strong>Zeitersparnis:</strong> Keine stundenlange Recherche auf dutzenden Websites - alle Kurse auf einer Plattform.
                  </li>
                  <li>
                    <strong>Plattformkosten: 0 €</strong> - KursRadar ist für Praxen kostenlos, da die Anbieter zahlen.
                  </li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground/70 font-roboto">
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
