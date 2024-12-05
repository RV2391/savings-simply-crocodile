import React from "react";
import { Card } from "@/components/ui/card";
import { FormSubmission } from "./result/FormSubmission";
import { AddressComponents, CalculatorData, Results } from "@/types";

interface ResultCardProps {
  results: Results;
  calculatorData: CalculatorData;
  addressComponents: AddressComponents;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  calculatorData,
  results,
  addressComponents,
}) => {
  return (
    <Card className="p-6 bg-card">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Erhalten Sie Ihre persönliche Berechnung per E-Mail
          </h3>
          <p className="text-muted-foreground">
            Wir senden Ihnen die detaillierte Auswertung kostenlos zu.
          </p>
        </div>
        
        <FormSubmission 
          results={results}
          calculatorData={calculatorData}
          addressComponents={addressComponents}
        />
      </div>
    </Card>
  );
};