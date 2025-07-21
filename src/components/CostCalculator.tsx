import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResultCard } from "./ResultCard";
import { TimeSavingsCard } from "./TimeSavingsCard";
import { CostLegend } from "./CostLegend";
import { TimeSavingsLegend } from "./TimeSavingsLegend";
import { calculateResults, type CalculationInputs } from "@/utils/calculations";
import { Results } from "@/types";
import { PracticeMap } from "./PracticeMap";
import { AddressInput } from "./AddressInput";
import { dentalInstitutes } from "@/utils/dentalInstitutes";
import { AddressComponents } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { ExtendedTimeSavings } from "@/utils/calculations/extendedTimeSavingsCalculations";
import { useGTMTracking } from "@/hooks/useGTMTracking";

// Extended results interface
interface ExtendedResults extends Results {
  extendedTimeSavings?: ExtendedTimeSavings;
}

const defaultInputs: CalculationInputs = {
  teamSize: 10,
  dentists: 3,
  practiceLat: undefined,
  practiceLng: undefined,
  nearestInstituteLat: undefined,
  nearestInstituteLng: undefined,
};

const defaultResults: ExtendedResults = {
  traditionalCostsDentists: 0,
  traditionalCostsAssistants: 0,
  totalTraditionalCosts: 0,
  crocodileCosts: 0,
  savings: 0,
  savingsPercentage: 0,
};

// Generate arrays for the dropdown options
const teamSizeOptions = Array.from({ length: 100 }, (_, i) => i + 1);
const dentistsOptions = Array.from({ length: 50 }, (_, i) => i + 1);

export const CostCalculator = () => {
  const [inputs, setInputs] = useState<CalculationInputs>(() => {
    const savedInputs = sessionStorage.getItem('calculatorData');
    return savedInputs ? JSON.parse(savedInputs) : defaultInputs;
  });
  const [results, setResults] = useState<ExtendedResults>(defaultResults);
  const [addressComponents, setAddressComponents] = useState<AddressComponents>({});
  const { toast } = useToast();

  // GTM Tracking
  const {
    trackTeamSizeChange,
    trackDentistsCountChange,
    trackLocationProvided,
    trackCalculationCompleted,
    trackTimeSavingsViewed
  } = useGTMTracking();

  useEffect(() => {
    const updateResults = async () => {
      const newResults = await calculateResults(inputs) as ExtendedResults;
      setResults(newResults);
      sessionStorage.setItem('calculatorData', JSON.stringify({
        ...inputs,
        location: inputs.practiceLat && inputs.practiceLng ? 
          `${inputs.practiceLat},${inputs.practiceLng}` : ''
      }));

      // Track calculation completed when results are available
      if (newResults.savings > 0) {
        trackCalculationCompleted(
          newResults.savings,
          inputs.teamSize,
          inputs.dentists,
          !!(inputs.practiceLat && inputs.practiceLng),
          newResults.extendedTimeSavings?.totalHoursPerYear,
          newResults.extendedTimeSavings?.totalMonetaryValue
        );
      }
    };
    updateResults();
  }, [inputs, trackCalculationCompleted]);

  const handleSelectChange = (field: keyof CalculationInputs) => (value: string) => {
    const numericValue = parseInt(value, 10);
    setInputs((prev) => ({ ...prev, [field]: numericValue }));
    
    // Track changes
    if (field === 'teamSize') {
      trackTeamSizeChange(numericValue);
    } else if (field === 'dentists') {
      trackDentistsCountChange(numericValue);
    }
  };

  const handleLocationChange = (location: { lat: number; lng: number }) => {
    setInputs((prev) => ({
      ...prev,
      practiceLat: location.lat,
      practiceLng: location.lng,
    }));
    
    // Track location provided
    trackLocationProvided();
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
              <Select
                value={inputs.teamSize.toString()}
                onValueChange={handleSelectChange("teamSize")}
              >
                <SelectTrigger className="w-full bg-[#1a1a1a] text-white border-gray-700">
                  <SelectValue placeholder="Wähle die Teamgröße" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {teamSizeOptions.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">Bitte wähle hier die Gesamtanzahl deiner Mitarbeiter, inklusive aller Zahnärzte.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dentists" className="text-gray-300">Anzahl Zahnärzte</Label>
              <Select
                value={inputs.dentists.toString()}
                onValueChange={handleSelectChange("dentists")}
              >
                <SelectTrigger className="w-full bg-[#1a1a1a] text-white border-gray-700">
                  <SelectValue placeholder="Wähle die Anzahl der Zahnärzte" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {dentistsOptions.map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          <TimeSavingsLegend />
        </motion.div>

        <div className="flex flex-col items-start justify-center space-y-6">
          <ResultCard 
            results={results}
            calculatorData={calculatorData}
            addressComponents={addressComponents}
          />
          {results.extendedTimeSavings && (
            <TimeSavingsCard timeSavings={results.extendedTimeSavings} />
          )}
        </div>
      </div>
    </div>
  );
};
