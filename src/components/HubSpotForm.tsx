import { useState } from "react";
import { AddressComponents, CalculatorData, Results } from "@/types";
import { FormHeader } from "./form/FormHeader";
import { HubSpotFormContainer } from "./form/HubSpotFormContainer";

interface HubSpotFormProps {
  calculatorData: CalculatorData;
  results: Results;
  addressComponents: AddressComponents;
}

export const HubSpotForm = ({ 
  calculatorData, 
  results, 
  addressComponents 
}: HubSpotFormProps) => {
  const [isFormLoaded, setIsFormLoaded] = useState(false);

  return (
    <div className="w-full bg-[#2a2a2a] p-6 rounded-2xl shadow-lg mt-8">
      <FormHeader 
        title="Erhalten Sie Ihre persönliche Berechnung per E-Mail"
        description="Wir senden Ihnen die detaillierte Auswertung kostenlos zu."
      />
      <HubSpotFormContainer
        calculatorData={calculatorData}
        results={results}
        addressComponents={addressComponents}
        onFormLoaded={() => setIsFormLoaded(true)}
        isFormLoaded={isFormLoaded}
      />
    </div>
  );
};