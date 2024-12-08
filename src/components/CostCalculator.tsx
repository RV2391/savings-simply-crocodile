import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResultCard } from "./ResultCard";
import { CostLegend } from "./CostLegend";
import { calculateResults, type CalculationInputs, type CalculationResults } from "@/utils/calculations";
import { PracticeMap } from "./PracticeMap";
import { AddressInput } from "./AddressInput";
import { dentalInstitutes } from "@/utils/dentalInstitutes";
import { AddressComponents } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { CustomForm } from "./CustomForm";

const defaultInputs: CalculationInputs = {
  teamSize: 10,
  dentists: 3,
  practiceLat: undefined,
  practiceLng: undefined,
  nearestInstituteLat: undefined,
  nearestInstituteLng: undefined,
};

const defaultResults: CalculationResults = {
  traditionalCostsDentists: 0,
  traditionalCostsAssistants: 0,
  totalTraditionalCosts: 0,
  crocodileCosts: 0,
  savings: 0,
  savingsPercentage: 0,
};

export const CostCalculator = () => {
  const [inputs, setInputs] = useState<CalculationInputs>(() => {
    const savedInputs = sessionStorage.getItem('calculatorData');
    return savedInputs ? JSON.parse(savedInputs) : defaultInputs;
  });
  const [results, setResults] = useState<CalculationResults>(defaultResults);
  const [addressComponents, setAddressComponents] = useState<AddressComponents>({});
  const { toast } = useToast();

  useEffect(() => {
    const updateResults = async () => {
      const newResults = await calculateResults(inputs);
      setResults(newResults);
      sessionStorage.setItem('calculatorData', JSON.stringify({
        ...inputs,
        location: inputs.practiceLat && inputs.practiceLng ? 
          `${inputs.practiceLat},${inputs.practiceLng}` : ''
      }));
    };
    updateResults();
  }, [inputs]);

  const handleInputChange = (field: keyof CalculationInputs) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value) || 0;
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (location: { lat: number; lng: number }) => {
    setInputs((prev) => ({
      ...prev,
      practiceLat: location.lat,
      practiceLng: location.lng,
    }));
  };

  const handleNearestInstituteFound = (lat: number, lng: number) => {
    setInputs((prev) => ({
      ...prev,
      nearestInstituteLat: lat,
      nearestInstituteLng: lng,
    }));
  };

  const handleAddressComponentsChange = (components: AddressComponents) => {
    setAddressComponents(components);
  };

  const calculatorData = {
    teamSize: inputs.teamSize,
    dentists: inputs.dentists,
    location: inputs.practiceLat && inputs.practiceLng ? 
      `${inputs.practiceLat},${inputs.practiceLng}` : undefined
  };

  const nearestInstitute = results.nearestInstitute ? 
    dentalInstitutes.find(i => i.name === results.nearestInstitute?.name) : 
    undefined;

  return (
    <div className="w-full">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-2 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 rounded-2xl bg-[#2a2a2a] p-6 shadow-lg"
        >
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Kostenkalkulator</h2>
            <p className="text-sm text-gray-400">
              Berechne dein Einsparpotenzial mit Crocodile
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamSize" className="text-gray-300">Teamgröße (inkl. Zahnärzte)</Label>
              <Input
                id="teamSize"
                type="number"
                value={inputs.teamSize}
                onChange={handleInputChange("teamSize")}
                min="1"
                className="input-transition bg-[#1a1a1a] text-white border-gray-700"
              />
              <p className="text-xs text-gray-400">Bitte gib hier die Gesamtanzahl deiner Mitarbeiter ein, inklusive aller Zahnärzte.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dentists" className="text-gray-300">Anzahl Zahnärzte</Label>
              <Input
                id="dentists"
                type="number"
                value={inputs.dentists}
                onChange={handleInputChange("dentists")}
                min="0"
                className="input-transition bg-[#1a1a1a] text-white border-gray-700"
              />
            </div>

            <div className="space-y-2 border-t border-gray-700 pt-4">
              <h3 className="text-lg font-medium text-white">Standort der Praxis</h3>
              <p className="text-sm text-gray-400">
                Gib deinen Standort ein, um die Reisekosten zu berechnen
              </p>
              <AddressInput 
                onLocationChange={handleLocationChange}
                onNearestInstituteFound={handleNearestInstituteFound}
                onAddressComponentsChange={handleAddressComponentsChange}
              />
              
              {inputs.practiceLat && inputs.practiceLng && (
                <div className="mt-4">
                  <PracticeMap
                    institutes={dentalInstitutes}
                    practiceLocation={{
                      lat: inputs.practiceLat,
                      lng: inputs.practiceLng
                    }}
                    nearestInstitute={nearestInstitute}
                    onPracticeLocationChange={handleLocationChange}
                  />
                </div>
              )}
            </div>
          </div>

          <CostLegend />
        </motion.div>

        <div className="flex flex-col items-start justify-center space-y-6">
          <ResultCard 
            results={results}
            calculatorData={calculatorData}
            addressComponents={addressComponents}
          />
          
          <CustomForm 
            calculatorData={calculatorData}
            results={results}
            addressComponents={addressComponents}
          />
        </div>
      </div>
    </div>
  );
};